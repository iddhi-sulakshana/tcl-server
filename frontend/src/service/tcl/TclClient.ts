// Browser port of backend/src/services/tcl.ts.
//
// Runs the entire TCL auth + device-control chain client-side so the app can
// drop its backend. Same logic as the server class, adapted for the browser:
//   - credentials come from config (the user's real TCL login), not server ENV
//   - md5 via the browser `md5` package
//   - Buffer -> TextEncoder/TextDecoder (no Node Buffer in the browser)
//   - forbidden request headers (user-agent, accept-encoding) removed: the
//     browser refuses to set them anyway, so sending them only adds noise
//   - winston -> injectable logger
//
// ⚠️ CORS — the load-bearing risk for the pure-browser path. Probed 2026-06:
//   - login host (pa.account.tcl.com): reflects Origin, allow-credentials true ✅
//   - cloud_url_get (prod-center.aws.tcljd.com): response has allow-origin:* but
//     returns 403 to OPTIONS preflight, so an application/json POST may be blocked
//   - AWS Cognito + IoT: browser-friendly ✅ (designed for web/mobile clients)
//   - refresh_tokens + get_things live on the runtime-returned cloud_url/device_url
//     and send CUSTOM headers (timestamp/nonce/sign/accesstoken) -> REQUIRE a
//     preflight. UNVERIFIED. If those hosts behave like prod-center, the browser
//     blocks them and this path needs a thin proxy or a native wrapper instead.
// See ./README.md "CORS spike" for the one test that settles it.

import Axios, { type AxiosInstance } from "axios";
import md5 from "md5";
import { GetThingShadowCommand, IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import type {
    CachedDeviceData,
    DeviceData,
    TclAwsCredentialsResponseData,
    TclClientConfig,
    TclCloudUrlsResponseData,
    TclDeviceListResponseData,
    TclDeviceShadowResponseData,
    TclLoginResponseData,
    TclLogger,
    TclRefreshTokensResponseData,
    PersistedTclSession,
} from "./types";

type QueueItem<T> = {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
    requestFn: () => Promise<T>;
};

const noopLogger: TclLogger = {
    info: (m) => console.info("[TCL]", m),
    error: (m) => console.error("[TCL]", m),
};

export default class TclClient {
    private axiosLogin: AxiosInstance | null = null;
    private axiosCloudBase: AxiosInstance | null = null;
    private axiosCloud: AxiosInstance | null = null;
    private axiosAWS: AxiosInstance | null = null;
    private axiosDevices: AxiosInstance | null = null;
    private iotClient: IoTDataPlaneClient | null = null;

    // Auth data
    private username: string | null = null;
    private countryAbbr: string | null = null;
    private token: string | null = null;
    private refreshToken: string | null = null;
    private cognitoToken: string | null = null;
    private cognitoId: string | null = null;
    private saasToken: string | null = null;
    private accessKeyId: string | null = null;
    private secretAccessKey: string | null = null;
    private sessionToken: string | null = null;

    // Cloud URLs data
    private cloudUrl: string | null = null;
    private deviceUrl: string | null = null;
    private cloudRegion: string | null = null;

    private lastStateCall: Record<string, number> = {};
    private currentDeviceState: Record<string, CachedDeviceData> = {};
    private connected = false;

    private queue: QueueItem<unknown>[] = [];
    private processingQueue = false;
    private refreshInterval: ReturnType<typeof setInterval> | null = null;
    private refreshFailures = 0;

    private readonly cfg: Required<Omit<TclClientConfig, "logger" | "proxyPath" | "onSessionExpired">> & {
        logger: TclLogger;
        proxyPath?: string;
        onSessionExpired?: () => void;
    };

    constructor(config: TclClientConfig) {
        this.cfg = {
            username: config.username,
            password: config.password,
            appId: config.appId,
            loginUrl: config.loginUrl,
            cloudUrl: config.cloudUrl,
            refreshIntervalMs: config.refreshIntervalMs ?? 900000, // 15 min
            logger: config.logger ?? noopLogger,
            proxyPath: config.proxyPath,
            onSessionExpired: config.onSessionExpired,
        };
    }

    private get log(): TclLogger {
        return this.cfg.logger;
    }

    /**
     * Dev-only: rewrite a TCL/cloud/device request to go through the same-origin
     * proxy (`proxyPath`), carrying the real absolute URL in `x-tcl-target`.
     * No-op when proxyPath is unset. NOT applied to AWS Cognito/IoT (browser-OK).
     */
    private applyProxy(instance: AxiosInstance) {
        const proxyPath = this.cfg.proxyPath;
        if (!proxyPath) return;
        instance.interceptors.request.use((config) => {
            const target = `${config.baseURL ?? ""}${config.url ?? ""}`;
            config.headers.set("x-tcl-target", target);
            config.baseURL = "";
            config.url = proxyPath;
            return config;
        });
    }

    private setupBaseAxios() {
        if (this.axiosLogin && this.axiosCloudBase) return;

        this.axiosLogin = Axios.create({
            baseURL: this.cfg.loginUrl,
            timeout: 60000,
            // user-agent dropped: forbidden header in the browser.
            headers: {
                th_platform: "android",
                th_version: "4.8.1",
                th_appbulid: "830",
                "content-type": "application/json; charset=UTF-8",
            },
        });
        this.axiosLogin.interceptors.request.use((config) => {
            config.data = {
                username: this.cfg.username,
                password: md5(this.cfg.password),
                equipment: 2,
                osType: 1,
                clientVersion: "4.8.1",
                osVersion: "6.0",
                deviceModel: "AndroidAndroid SDK built for x86",
                captchaRule: 2,
                channel: "app",
            };
            return config;
        });

        this.axiosCloudBase = Axios.create({
            baseURL: this.cfg.cloudUrl,
            timeout: 60000,
            headers: { "content-type": "application/json; charset=UTF-8" },
        });
        this.axiosCloudBase.interceptors.request.use((config) => {
            config.data = { ...(config.data ?? {}), appId: this.cfg.appId };
            return config;
        });

        this.applyProxy(this.axiosLogin);
        this.applyProxy(this.axiosCloudBase);
    }

    public async authenticate() {
        try {
            this.reset();
            this.setupBaseAxios();
            const response = await this.axiosLogin!.post<TclLoginResponseData>("");
            if (response.status !== 200 || !response.data || response.data.status !== 1) {
                const code = response.data?.status;
                const detail =
                    response.data?.msg ||
                    (typeof response.data === "object" ? JSON.stringify(response.data).slice(0, 300) : String(response.data)) ||
                    "Unknown error";
                throw new Error(`TCL login rejected (status ${code}): ${detail}`);
            }

            this.username = response.data.user.username;
            this.token = response.data.token;
            this.refreshToken = response.data.refreshToken ?? null;
            this.countryAbbr = response.data.user.countryAbbr;
            this.log.info("Login successful");

            await this.getCloudUrls();
        } catch (error) {
            this.log.error("Login failed: " + error);
            throw error;
        }
    }

    private async getCloudUrls() {
        this.setupBaseAxios();
        // ⚠️ CORS: prod-center returns 403 to OPTIONS preflight (see file header).
        const response = await this.axiosCloudBase!.post<TclCloudUrlsResponseData>("", {
            ssoId: this.username,
            ssoToken: this.token,
        });
        if (response.status !== 200 || !response.data || response.data.code !== 0) {
            throw new Error(response.data?.message || "Unknown error");
        }
        this.cloudUrl = response.data.data.cloud_url;
        this.deviceUrl = response.data.data.device_url;
        this.cloudRegion = response.data.data.cloud_region;

        this.axiosCloud = Axios.create({
            baseURL: this.cloudUrl,
            timeout: 60000,
            headers: { "content-type": "application/json; charset=UTF-8" },
        });
        this.axiosCloud.interceptors.request.use((config) => {
            config.data = { ...(config.data ?? {}), userId: this.username, appId: this.cfg.appId };
            return config;
        });
        this.applyProxy(this.axiosCloud);
        this.log.info("Get cloud URLs successful");

        await this.refreshTokens();
    }

    private async refreshTokens() {
        // ⚠️ CORS: this hits the runtime-returned cloud_url. UNVERIFIED preflight.
        const response = await this.axiosCloud!.post<TclRefreshTokensResponseData>("/v3/auth/refresh_tokens", {
            ssoToken: this.token,
        });
        if (response.status !== 200 || !response.data || response.data.code !== 0) {
            throw new Error(response.data?.message || "Unknown error");
        }

        this.cognitoToken = response.data.data.cognitoToken;
        this.saasToken = response.data.data.saasToken;
        this.cognitoId = response.data.data.cognitoId;

        // AWS Cognito GetCredentialsForIdentity — browser-friendly (CORS *).
        this.axiosAWS = Axios.create({
            baseURL: `https://cognito-identity.${this.cloudRegion}.amazonaws.com`,
            timeout: 60000,
            headers: {
                "X-Amz-Target": "AWSCognitoIdentityService.GetCredentialsForIdentity",
                "content-type": "application/x-amz-json-1.1",
            },
        });
        this.axiosAWS.interceptors.request.use((config) => {
            config.data = {
                IdentityId: this.cognitoId,
                Logins: { "cognito-identity.amazonaws.com": this.cognitoToken },
            };
            return config;
        });

        // device_url client. accesstoken + per-request timestamp/nonce/sign.
        this.axiosDevices = Axios.create({
            baseURL: this.deviceUrl!,
            headers: {
                platform: "android",
                appversion: "5.4.1",
                thomeversion: "4.8.1",
                accesstoken: this.saasToken!,
                countrycode: this.countryAbbr!,
                "accept-language": "en",
                "content-type": "application/json; charset=UTF-8",
            },
        });
        this.applyProxy(this.axiosDevices);

        this.log.info("Get refresh tokens successful");
        await this.getAwsCredentials();
    }

    private async getAwsCredentials() {
        if (!this.axiosAWS || !this.cloudRegion) throw new Error("AWS credentials not found");
        const response = await this.axiosAWS.post<TclAwsCredentialsResponseData>("");
        if (response.status !== 200 || !response.data) throw new Error("Unknown error");

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
        });

        this.connected = true;
        this.log.info("Get AWS credentials successful");
    }

    /**
     * Restore a session from persisted tokens — skips the password login and
     * re-derives the whole downstream chain (cloud URLs → SaaS → Cognito → STS)
     * from the stored base token. Throws if the base token is expired/invalid.
     */
    public async restore(session: PersistedTclSession): Promise<void> {
        this.reset();
        this.username = session.username;
        this.token = session.token;
        this.refreshToken = session.refreshToken;
        this.countryAbbr = session.countryAbbr;
        this.setupBaseAxios();
        await this.getCloudUrls(); // chains refreshTokens → getAwsCredentials, sets `connected`
        if (!this.connected) throw new Error("Session restore failed");
        this.log.info("Session restored from token");
    }

    /**
     * Token-based refresh: re-mint the short-lived tokens (SaaS ~30m, Cognito ~2h,
     * STS ~1h) from the 30-day base token. No password needed. Throws on failure.
     */
    public async refresh(): Promise<void> {
        if (!this.token || !this.username) throw new Error("No base token to refresh");
        this.setupBaseAxios();
        await this.getCloudUrls();
        if (!this.connected) throw new Error("Token refresh failed");
    }

    /** Snapshot the persistable session (no password/short-lived tokens). */
    public exportSession(): PersistedTclSession | null {
        if (!this.token || !this.username || !this.countryAbbr) return null;
        return {
            username: this.username,
            token: this.token,
            refreshToken: this.refreshToken,
            countryAbbr: this.countryAbbr,
        };
    }

    public async logout() {
        if (!this.connected) return;
        this.reset();
        this.log.info("Logout successful");
    }

    /** Manual "Cloud Relogin" — refreshes the session from the base token (no password). */
    public async relogin(): Promise<void> {
        this.log.info("Manual re-login initiated");
        await this.refresh();
        this.log.info(this.connected ? "Manual re-login successful" : "Manual re-login failed");
    }

    public isConnected(): boolean {
        return this.connected;
    }

    /** Call once after construction to enable the periodic re-auth interval. */
    public start(): void {
        this.startLoginInterval();
    }

    /** Stop the re-auth interval and clear the pending queue (cleanup on logout). */
    public dispose(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        this.queue = [];
        this.reset();
    }

    public async getDevicelist(): Promise<DeviceData[]> {
        return this.enqueueRequest(() => this._getDevicelist());
    }

    private async _getDevicelist(): Promise<DeviceData[]> {
        try {
            const timestamp = Date.now().toString();
            const nonce = Math.random().toString(36).substring(2, 16);
            const sign = md5(timestamp + nonce + this.saasToken);

            // ⚠️ CORS: device_url + these custom headers force a preflight. UNVERIFIED.
            const response = await this.axiosDevices!.post<TclDeviceListResponseData>("/v3/user/get_things", {}, {
                headers: { timestamp, nonce, sign },
            });
            if (response.status !== 200 || !response.data) {
                this.log.error("Get device list failed: Unknown error");
                return [];
            }
            return response.data.data;
        } catch (error) {
            this.log.error("Get device list failed: " + error);
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
        return this.enqueueRequest(() => this._getDeviceState({ deviceId, forceRefresh }));
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
            if (!forceRefresh && this.lastStateCall[deviceId] && now - this.lastStateCall[deviceId] < 200) {
                return this._getFallbackDeviceState(deviceId);
            }
            this.lastStateCall[deviceId] = now;
            if (!this.iotClient) throw new Error("IoT Client not initialized");

            const command = new GetThingShadowCommand({ thingName: deviceId });
            const response = await this.iotClient.send(command);
            if (!response.payload) throw new Error("No payload received from IoT Client");

            // Browser: payload is a Uint8Array, decode without Node Buffer.
            const payload = JSON.parse(new TextDecoder().decode(response.payload)) as TclDeviceShadowResponseData;
            this.currentDeviceState[deviceId] = { ...payload, lastUpdated: now };
            return this.currentDeviceState[deviceId];
        } catch (error: unknown) {
            this.log.error(`Get device state failed for '${deviceId}': ${error}`);
            if (this.isForbidden(error)) this.connected = false;
            return null;
        }
    }

    private _getFallbackDeviceState(deviceId: string): CachedDeviceData | null {
        const cached = this.currentDeviceState[deviceId];
        if (cached && cached.lastUpdated && Date.now() - cached.lastUpdated > 30000) {
            delete this.currentDeviceState[deviceId];
        }
        return cached || null;
    }

    public async setDeviceState({
        deviceId,
        properties,
    }: {
        deviceId: string;
        properties: Record<string, unknown>;
    }): Promise<{ success: boolean; message: string }> {
        return this.enqueueRequest(() => this._setDeviceState({ deviceId, properties }));
    }

    private async _setDeviceState({
        deviceId,
        properties,
    }: {
        deviceId: string;
        properties: Record<string, unknown>;
    }): Promise<{ success: boolean; message: string }> {
        try {
            if (!this.iotClient) throw new Error("IoT Client not initialized");

            // Some TCL devices require targetCelsiusDegree alongside targetTemperature.
            if (properties.targetTemperature !== undefined && properties.targetCelsiusDegree === undefined) {
                properties.targetCelsiusDegree = properties.targetTemperature;
            }

            const payload = {
                state: { desired: properties },
                clientToken: `mobile_${Math.floor(Date.now() / 1000)}`,
            };

            const command = new PublishCommand({
                topic: `$aws/things/${deviceId}/shadow/update`,
                qos: 1,
                payload: new TextEncoder().encode(JSON.stringify(payload)),
            });

            const response = await this.iotClient.send(command);
            if (!response) throw new Error("No response received from IoT Client");

            if (!this.currentDeviceState[deviceId]) {
                await this._getDeviceState({ deviceId, forceRefresh: true });
            }
            return { success: true, message: "Device state set successfully" };
        } catch (error: unknown) {
            this.log.error(`Set device state failed for '${deviceId}': ${error}`);
            if (this.isForbidden(error)) this.connected = false;
            return { success: false, message: "Failed to set device state" };
        }
    }

    // Queue + connection management

    private isForbidden(error: unknown): boolean {
        const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
        return e?.name === "ForbiddenException" || e?.$metadata?.httpStatusCode === 403;
    }

    private async enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ resolve, reject, requestFn } as QueueItem<unknown>);
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processingQueue || this.queue.length === 0) return;
        this.processingQueue = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item) continue;
            try {
                if (!this.connected) await this.reconnect();
                const result = await item.requestFn();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
        }
        this.processingQueue = false;
    }

    /**
     * Recover a dropped connection (e.g. a 403 once the SaaS/STS tokens lapse) by
     * refreshing from the 30-day base token — no password. If the base token is
     * itself dead, flag the session expired so the UI returns to login.
     */
    private async reconnect(): Promise<void> {
        try {
            await this.refresh();
        } catch (error: unknown) {
            this.log.error(`Reconnect failed: ${error}`);
            this.connected = false;
            this.cfg.onSessionExpired?.();
            throw error;
        }
    }

    private startLoginInterval(): void {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        if (!this.cfg.refreshIntervalMs) return;

        this.refreshInterval = setInterval(async () => {
            this.log.info("Token refresh interval triggered");
            try {
                await this.refresh();
                this.refreshFailures = 0;
                this.log.info("Token refresh successful");
            } catch (error: unknown) {
                this.refreshFailures++;
                this.log.error(`Token refresh failed (${this.refreshFailures}): ${error}`);
                // One miss can be transient; a second means the base token is dead.
                if (this.refreshFailures >= 2) {
                    this.connected = false;
                    this.cfg.onSessionExpired?.();
                }
            }
        }, this.cfg.refreshIntervalMs);
        this.log.info("Token refresh interval started");
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
        this.refreshToken = null;
        this.cognitoToken = null;
        this.cognitoId = null;
        this.saasToken = null;
        this.accessKeyId = null;
        this.secretAccessKey = null;
        this.sessionToken = null;

        this.cloudUrl = null;
        this.deviceUrl = null;
        this.cloudRegion = null;

        this.lastStateCall = {};
        this.currentDeviceState = {};
    }
}
