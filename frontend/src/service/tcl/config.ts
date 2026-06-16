// Non-secret TCL endpoints/app-id. Defaults baked from the Android app; override
// via Vite env if TCL rotates them. The user's account credentials are NOT here —
// they come from the login form at runtime.

export const TCL_CONFIG = {
    // appId -> the `appId` body field on the cloud calls (NOT the login clientId).
    appId: import.meta.env.VITE_TCL_APP_ID ?? "wx6e1af3fa84fbe523",
    // Login URL must include ?clientId=54148614 — that 8-digit id is the app's
    // login client id, distinct from appId. Without it: {"status":15,"msg":"Invalid client id"}.
    loginUrl:
        import.meta.env.VITE_TCL_LOGIN_URL ??
        "https://pa.account.tcl.com/account/login?clientId=54148614",
    cloudUrl:
        import.meta.env.VITE_TCL_CLOUD_URL ??
        "https://prod-center.aws.tcljd.com/v3/global/cloud_url_get",
    // Dev: route TCL/cloud/device calls through the Vite middleware proxy to
    // dodge CORS. Production build (DEV=false) calls direct — only works in a
    // native shell (Tauri/extension/Capacitor) or behind your own proxy.
    proxyPath: import.meta.env.DEV ? "/__tclproxy" : undefined,
} as const;
