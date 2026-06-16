// Non-secret TCL endpoints/app-id. Defaults baked from the Android app; override
// via Vite env if TCL rotates them. The user's account credentials are NOT here —
// they come from the login form at runtime.

export const TCL_CONFIG = {
    // appId -> the `appId` body field on the cloud calls (NOT the login clientId).
    appId: process.env.NEXT_PUBLIC_TCL_APP_ID ?? "wx6e1af3fa84fbe523",
    // Login URL must include ?clientId=54148614 — that 8-digit id is the app's
    // login client id, distinct from appId. Without it: {"status":15,"msg":"Invalid client id"}.
    loginUrl:
        process.env.NEXT_PUBLIC_TCL_LOGIN_URL ??
        "https://pa.account.tcl.com/account/login?clientId=54148614",
    cloudUrl:
        process.env.NEXT_PUBLIC_TCL_CLOUD_URL ??
        "https://prod-center.aws.tcljd.com/v3/global/cloud_url_get",
    // Route TCL/cloud/device calls through a same-origin proxy to dodge CORS.
    // Served by the Next route handler at app/api/tclproxy/route.ts — works in
    // `next dev`, `next start`, and on Vercel. Direct browser calls to TCL
    // hosts are CORS-blocked everywhere. (Path avoids a leading underscore —
    // Next treats `_*` folders as private and won't route them.)
    // Override via NEXT_PUBLIC_TCL_PROXY_PATH (empty string = direct, no proxy).
    proxyPath: process.env.NEXT_PUBLIC_TCL_PROXY_PATH ?? "/api/tclproxy",
} as const;
