import Axios, { type AxiosInstance } from "axios";
import ENV from "../configs/ENV";
import MD5 from "md5";
import winston from "winston";
import type { CachedDeviceData, DeviceData, TclAwsCredintialsResponse, TclCloudUrlsResponse, TclDeviceListResponse, TclDeviceShadowResponseData, TclLoginResponse, TclRefreshTokensResponse } from "@/types/tcl";
import { GetThingShadowCommand, IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";

type QueueItem<T> = {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    requestFn: () => Promise<T>;
};

export default class TCL {
    private axiosLogin: AxiosInstance | null = null;
    private axiosCloudBase: AxiosInstance | null = null;
    private axiosCloud: AxiosInstance | null = null;
    private axiosAWS: AxiosInstance | null = null;
    private axiosDevices: AxiosInstance | null = null;
    private iotClient: IoTDataPlaneClient | null = null;

    // Auth Data
    private username: string | null = null;
    private countryAbbr: string | null = null;
    private token: string | null = null;
    private cognitoToken: string | null = null;
    private cognitoId: string | null = null;
    private saasToken: string | null = null;
    private accessKeyId: string | null = null;
    private secretAccessKey: string | null = null;
    private sessionToken: string | null = null;

    // Cloud URLs Data
    private cloudUrl: string | null = null;
    private deviceUrl: string | null = null;
    private cloudRegion: string | null = null;

    private lastStateCall: Record<string, number> = {};
    private currentDeviceState: Record<string, CachedDeviceData> = {};
    private connected: boolean = false;

    private readonly MAX_LOGIN_RETRIES: number = 3;

    private queue: QueueItem<any>[] = [];
    private processingQueue: boolean = false;
    private refreshInterval: NodeJS.Timeout | null = null;
    private loginRetryCount: number = 0;

    constructor() {
        this.startLoginInterval();
    }

    private setupBaseAxios() {
        if (this.axiosLogin && this.axiosCloudBase) return;

        this.axiosLogin = Axios.create({
            baseURL: ENV.TCL_LOGIN_URL,
            timeout: 60000,
            headers: {
                'th_platform': 'android',
                'th_version': '4.8.1',
                'th_appbulid': '830',
                'user-agent': 'Android',
                'content-type': 'application/json; charset=UTF-8'
            },
        })
        this.axiosLogin.interceptors.request.use((config) => {
            config.data = {
                username: ENV.TCL_USERNAME,
                password: MD5(ENV.TCL_PASSWORD),
                equipment: 2,
                osType: 1,
                clientVersion: "4.8.1",
                osVersion: "6.0",
                deviceModel: "AndroidAndroid SDK built for x86",
                captchaRule: 2,
                channel: "app"
            }
            return config;
        });

        this.axiosCloudBase = Axios.create({
            baseURL: ENV.TCL_CLOUD_URL,
            timeout: 60000,
            headers: {
                'user-agent': 'Android',
                'content-type': 'application/json; charset=UTF-8',
                'accept-encoding': 'gzip, deflate, br'
            }
        })
        this.axiosCloudBase.interceptors.request.use((config) => {
            config.data.appId = ENV.TCL_APP_ID;
            return config;
        });
    }

    public async authenticate() {
        try {
            this.reset();
            this.setupBaseAxios();
            const response = await this.axiosLogin!.post("") as TclLoginResponse
            if (response.status !== 200 || !response.data || response.data.status !== 1) {
                if (response.data.msg)
                    throw new Error(response.data.msg);
                throw new Error("Unknown error");
            }

            this.username = response.data.user.username;
            this.token = response.data.token;
            this.countryAbbr = response.data.user.countryAbbr;
            winston.info("TCL: Login successful");

            await this.getCloudUrls();
        } catch (error) {
            winston.error("TCL: Login failed: " + error);
            throw error;
        }
    }

    public async getCloudUrls() {
        try {
            this.setupBaseAxios();
            const response = await this.axiosCloudBase!.post("", {
                ssoId: this.username,
                ssoToken: this.token
            }) as TclCloudUrlsResponse
            if (response.status !== 200 || !response.data || response.data.code !== 0) {
                if (response.data.message)
                    throw new Error(response.data.message);
                throw new Error("Unknown error");
            }
            this.cloudUrl = response.data.data.cloud_url;
            this.deviceUrl = response.data.data.device_url;
            this.cloudRegion = response.data.data.cloud_region;

            // Build axiosCloud with cloudUrl
            this.axiosCloud = Axios.create({
                baseURL: this.cloudUrl,
                timeout: 60000,
                headers: {
                    'user-agent': 'Android',
                    'content-type': 'application/json; charset=UTF-8',
                    'accept-encoding': 'gzip, deflate, br'
                },
            })
            this.axiosCloud.interceptors.request.use((config) => {
                config.data.userId = this.username;
                config.data.appId = ENV.TCL_APP_ID;
                return config;
            });
            winston.info("TCL: Get cloud URLs successful");

            await this.refreshTokens();
        } catch (error) {
            winston.error("TCL: Get cloud URLs failed: " + error);
        }
    }

    public async refreshTokens() {
        try {
            const response = await this.axiosCloud!.post("/v3/auth/refresh_tokens", {
                ssoToken: this.token
            }) as TclRefreshTokensResponse
            if (response.status !== 200 || !response.data || response.data.code !== 0) {
                if (response.data.message)
                    throw new Error(response.data.message);
                throw new Error("Unknown error");
            }

            this.cognitoToken = response.data.data.cognitoToken;
            this.saasToken = response.data.data.saasToken;
            this.cognitoId = response.data.data.cognitoId;

            // Build axiosAWS with cloud region
            this.axiosAWS = Axios.create({
                baseURL: `https://cognito-identity.${this.cloudRegion}.amazonaws.com`,
                timeout: 60000,
                headers: {
                    'User-agent': 'aws-sdk-android/2.22.6 Linux/6.1.23-android14-4-00257-g7e35917775b8-ab9964412 Dalvik/2.1.0/0 en_US',
                    'X-Amz-Target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
                    'content-type': 'application/x-amz-json-1.1'
                }
            })
            this.axiosAWS.interceptors.request.use((config) => {
                config.data = {
                    IdentityId: this.cognitoId,
                    Logins: {
                        'cognito-identity.amazonaws.com': this.cognitoToken
                    }
                }
                return config;
            })

            // Build axiosDevices with device url
            this.axiosDevices = Axios.create({
                baseURL: this.deviceUrl!,
                headers: {
                    platform: "android",
                    appversion: "5.4.1",
                    thomeversion: "4.8.1",
                    accesstoken: this.saasToken,
                    countrycode: this.countryAbbr,
                    "accept-language": "en",
                    "content-type": "application/json; charset=UTF-8",
                    "accept-encoding": "gzip, deflate, br",
                    "user-agent": "Android",
                }
            })

            winston.info("TCL: Get Refresh Tokens successful");
            await this.getAwsCredintials();
        } catch (error) {
            winston.error("TCL: Get Refresh Tokens failed: " + error);
        }
    }

    public async getAwsCredintials() {
        if (!this.axiosAWS || !this.cloudRegion) {
            throw new Error("AWS Credintials not found");
        }
        try {
            const response = await this.axiosAWS.post("") as TclAwsCredintialsResponse
            if (response.status !== 200 || !response.data) {
                throw new Error("Unknown error");
            }

            this.accessKeyId = response.data.Credentials.AccessKeyId;
            this.secretAccessKey = response.data.Credentials.SecretKey;
            this.sessionToken = response.data.Credentials.SessionToken;

            this.iotClient = new IoTDataPlaneClient({
                region: this.cloudRegion,
                credentials: {
                    accessKeyId: this.accessKeyId,
                    secretAccessKey: this.secretAccessKey,
                    sessionToken: this.sessionToken,
                },
                endpoint: `https://data-ats.iot.${this.cloudRegion}.amazonaws.com`,
            })

            this.connected = true;

            winston.info("TCL: Get AWS Credintials successful");
        } catch (error) {
            winston.error("TCL: Get AWS Credintials failed: " + error);
        }
    }

    public async logout() {
        if (!this.connected) {
            return;
        }
        this.reset();
        winston.info("TCL: Logout successful");
    }

    public async relogin(): Promise<void> {
        winston.info("TCL: Manual re-login initiated");
        await this.logout();
        await this.authenticate();
        if (this.connected) {
            winston.info("TCL: Manual re-login successful");
        } else {
            winston.error("TCL: Manual re-login failed");
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async getDevicelist(): Promise<DeviceData[]> {
        return this.enqueueRequest(() => this._getDevicelist());
    }

    private async _getDevicelist(): Promise<DeviceData[]> {
        try {
            const timestamp = Date.now().toString();
            const nonce = Math.random().toString(36).substring(2, 16);
            const sign = MD5(timestamp + nonce + this.saasToken);

            const response = await this.axiosDevices!.post(
                `/v3/user/get_things`,
                null,
                {
                    headers: {
                        timestamp,
                        nonce,
                        sign
                    }
                }
            ) as TclDeviceListResponse;
            if (response.status !== 200 || !response.data) {
                winston.error("TCL: Get device list failed: Unknown error");
                return [];
            }
            return response.data.data;
        } catch (error) {
            winston.error("TCL: Get device list failed: " + error);
            return [];
        }
    }

    public async getDeviceState({
        deviceId,
        forceRefresh = false,
    }: {
        deviceId: string;
        forceRefresh?: boolean;
    }): Promise<CachedDeviceData | null> {
        return this.enqueueRequest(() =>
            this._getDeviceState({ deviceId, forceRefresh })
        );
    }

    private async _getDeviceState({
        deviceId,
        forceRefresh,
    }: {
        deviceId: string;
        forceRefresh: boolean;
    }): Promise<CachedDeviceData | null> {
        try {
            const now = Date.now();
            if (!forceRefresh && this.lastStateCall[deviceId] && (now - this.lastStateCall[deviceId]) < 200) {
                return this._getFallbackDeviceState(deviceId);
            }
            this.lastStateCall[deviceId] = now;
            if (!this.iotClient) {
                throw new Error("IoT Client not initialized");
            }

            const command = new GetThingShadowCommand({
                thingName: deviceId,
            })
            const response = await this.iotClient.send(command);

            if (!response.payload)
                throw new Error("No payload received from IoT Client");
            const payload = JSON.parse(Buffer.from(response.payload).toString()) as TclDeviceShadowResponseData

            this.currentDeviceState[deviceId] = {
                ...payload,
                lastUpdated: now,
            }

            return this.currentDeviceState[deviceId];
        } catch (error: any) {
            winston.error(
                "TCL: Get device state failed for device '" + deviceId + "': " + error
            );
            if (error.name === 'ForbiddenException' || error.$metadata?.httpStatusCode === 403) {
                this.connected = false;
            }
            return null;
        }
    }

    private _getFallbackDeviceState(deviceId: string): CachedDeviceData | null {
        const cached = this.currentDeviceState[deviceId];
        if (cached && cached.lastUpdated && (Date.now() - cached.lastUpdated) > 30000) {
            delete this.currentDeviceState[deviceId]
        }

        return cached || null;
    }

    public async setDeviceState({
        deviceId,
        properties }: {
            deviceId: string;
            properties: Record<string, any>;
        }): Promise<{
            success: boolean;
            message: string;
        }> {
        return this.enqueueRequest(() => this._setDeviceState({ deviceId, properties }));
    }

    private async _setDeviceState({
        deviceId,
        properties,
    }: {
        deviceId: string;
        properties: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            if (!this.iotClient)
                throw new Error("IoT Client not initialized");

            // Add targetCelsiusDegree if targetTemperature is provided, as some TCL devices require it
            if (properties.targetTemperature !== undefined && properties.targetCelsiusDegree === undefined) {
                properties.targetCelsiusDegree = properties.targetTemperature;
            }

            const payload = {
                state: {
                    desired: properties,
                },
                clientToken: `mobile_${Math.floor(Date.now() / 1000)}`
            }

            const command = new PublishCommand({
                topic: `$aws/things/${deviceId}/shadow/update`,
                qos: 1,
                payload: Buffer.from(JSON.stringify(payload)),
            });

            const response = await this.iotClient.send(command);

            if (!response)
                throw new Error("No response received from IoT Client");

            if (!this.currentDeviceState[deviceId]) {
                await this._getDeviceState({ deviceId, forceRefresh: true });
            }

            return { success: true, message: "Device state set successfully" };
        } catch (error: any) {
            winston.error(
                "TCL: Set device state failed for device '" + deviceId + "': " + error
            );
            if (error.name === 'ForbiddenException' || error.$metadata?.httpStatusCode === 403) {
                this.connected = false;
            }
            return { success: false, message: "Failed to set device state" };
        }
    }

    // Queue and Connection Management Methods

    private async enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ resolve, reject, requestFn });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processingQueue || this.queue.length === 0) {
            return;
        }

        this.processingQueue = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item) continue;

            try {
                // Check connection before processing each request
                if (!this.connected) {
                    await this.loginWithRetry();
                }

                // Execute the request
                const result = await item.requestFn();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
        }

        this.processingQueue = false;
    }
    private async loginWithRetry() {
        while (this.loginRetryCount < this.MAX_LOGIN_RETRIES) {
            try {
                await this.authenticate();
                if (this.connected) {
                    winston.info("TCL: Login successful");
                    return;
                }
                this.loginRetryCount++;
            } catch (error: any) {
                winston.error(
                    `TCL: Login failed: ${error.message || error}`
                );
                this.loginRetryCount++;
            }
        }
    }

    private startLoginInterval(): void {
        // Clear any existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Set up refresh interval (900,000 ms = 15 minutes)
        this.refreshInterval = setInterval(async () => {
            winston.info("TCL: Login interval triggered");
            try {
                await this.logout();
                await this.authenticate();
                if (this.connected) {
                    winston.info("TCL: Login interval successful");
                } else {
                    winston.error(
                        "TCL: Login interval failed - not connected"
                    );
                }
            } catch (error: any) {
                winston.error(
                    `TCL: Login interval failed: ${error.message || error}`
                );
            }
        }, 900000); // 15 minutes in milliseconds

        winston.info("TCL: Login interval started");
    }

    /**
     * Stops the hourly refresh interval.
     * Useful for cleanup or when shutting down the service.
     * @internal This method is available for cleanup but may not be called in normal operation.
     */
    // @ts-ignore - Utility method for cleanup, may not be used in normal operation
    private stopRefreshInterval(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            winston.info("TCL: Refresh interval stopped");
        }
    }

    private reset() {
        this.connected = false;
        this.axiosCloud = null;
        this.axiosAWS = null;
        this.axiosDevices = null;
        this.iotClient = null;

        this.username = null;
        this.countryAbbr = null;
        this.token = null;
        this.cognitoToken = null;
        this.cognitoId = null;
        this.saasToken = null;
        this.accessKeyId = null;
        this.secretAccessKey = null;
        this.sessionToken = null;

        this.cloudUrl = null;
        this.deviceUrl = null;
        this.cloudRegion = null;

        this.lastStateCall = {}
        this.currentDeviceState = {}
    }
}
