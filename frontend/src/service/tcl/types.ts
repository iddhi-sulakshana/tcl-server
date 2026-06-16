// TCL cloud API response shapes — ported from backend/src/types/tcl.ts.
// These describe the raw payloads returned by TCL's mobile-app backend and AWS.
// Device-facing UI types (DeviceState, DeviceWithState, ...) stay in @/types/tcl.

export type TclLoginResponseData = {
    status: number;
    token: string;
    refreshToken: string;
    msg: string;
    firstLogin: number;
    data: {
        loginAccount: string;
        loginType: number;
        loginCountryAbbr: string;
    };
    user: {
        countryAbbr: string;
        nickname: string;
        username: string;
        email: string;
        region: string;
        tclid: string;
        [k: string]: unknown;
    };
};

export type TclCloudUrlsResponseData = {
    code: number;
    message: string;
    data: {
        sso_region: string;
        cloud_region: string;
        sso_url: string;
        cloud_url: string;
        identity_pool_id: string;
        device_url: string;
        cloud_url_emq: string;
        [k: string]: unknown;
    };
};

export type TclRefreshTokensResponseData = {
    code: number;
    message: string;
    data: {
        saasToken: string;
        cognitoToken: string;
        cognitoId: string;
        mqttEndpoint: string;
    };
};

export type TclAwsCredentialsResponseData = {
    IdentityId: string;
    Credentials: {
        AccessKeyId: string;
        SecretKey: string;
        SessionToken: string;
        Expiration: number;
    };
};

export type TclDeviceListResponseData = {
    code: number;
    message: string;
    data: DeviceData[];
};

export type DeviceData = {
    deviceId: string;
    productKey: string;
    nickName: string;
    deviceName: string;
    mac: string;
    category: string;
    type: number;
    isOnline: string;
    deviceType: string;
    firmwareVersion: string;
    [k: string]: unknown;
};

// AWS IoT device shadow. `desired`/`reported` are the full AC property set;
// only the fields the UI consumes are typed strictly, rest pass through.
type ShadowProps = {
    powerSwitch: number;
    targetTemperature: number;
    currentTemperature: number;
    windSpeed7Gear: number;
    verticalDirection: number;
    horizontalDirection: number;
    workMode: number;
    screen: number;
    sleep: number;
    beepSwitch: number;
    softWind: number;
    antiMoldew: number;
    ECO: number;
    generatorMode: number;
    healthy: number;
    externalUnitTemperature: number;
    externalUnitFanSpeed: number;
    [k: string]: unknown;
};

export type TclDeviceShadowResponseData = {
    state: {
        desired: ShadowProps;
        reported: ShadowProps;
        metadata: {
            desired: Record<string, { timestamp: number }>;
            reported: Record<string, { timestamp: number }>;
        };
        version: number;
        timestamp: number;
    };
};

export type CachedDeviceData = TclDeviceShadowResponseData & { lastUpdated: number };

export type TclLogger = {
    info: (msg: string) => void;
    error: (msg: string) => void;
};

export type TclClientConfig = {
    /** TCL account login (the real TCL app email/username). */
    username: string;
    /** TCL account password — md5'd before transit, never stored server-side. */
    password: string;
    appId: string;
    loginUrl: string;
    cloudUrl: string;
    logger?: TclLogger;
    /** Auto re-auth interval in ms. 0 disables. Default 15 min. */
    refreshIntervalMs?: number;
    /**
     * Same-origin path to relay TCL/cloud/device calls through (dev only).
     * When set, the TCL (non-AWS) axios calls are rewritten to POST `proxyPath`
     * with the real absolute URL in an `x-tcl-target` header. Bypasses CORS in
     * dev via the Vite middleware. Undefined → calls go direct (native shell).
     */
    proxyPath?: string;
};
