# Backend-less TCL (browser port of `backend/src/services/tcl.ts`)

Runs the whole TCL auth + AC control chain in the browser so the app can drop its
server. The user logs in with their **real TCL account** (the same email/password
they use in the TCL Home app); the chain runs client-side from there.

## Files

| File | Role |
|---|---|
| `TclClient.ts` | Port of the backend `TCL` class. Login → cloud URLs → refresh tokens → AWS Cognito creds → AWS IoT shadow get/set. |
| `types.ts` | TCL cloud + IoT shadow payload shapes. |
| `config.ts` | Non-secret endpoints + appId (Vite-overridable). |
| `sessionStore.ts` | Zustand session: holds one `TclClient`, exposes `login/logout/relogin`. |
| `hooks.ts` | React Query hooks — **same names/signatures as `src/service/tclService.ts`**. |

## Wiring (swap the backend path for this one)

1. Install deps: `bun install` (adds `@aws-sdk/client-iot-data-plane`, `md5`, `@types/md5`).
2. In components, change the import source only:
   ```diff
   - import { useDevices, useDeviceState, useUpdateDeviceState, useBulkUpdate, useRelogin } from "@/service/tclService";
   + import { useDevices, useDeviceState, useUpdateDeviceState, useBulkUpdate, useRelogin } from "@/service/tcl/hooks";
   ```
3. Login page: replace `useLogin` (from `tclService`) with `useTclLogin` (from `./hooks`) and pass the user's **TCL** email + password instead of `admin`/`Secret`.
4. Gate routes on `useTclSession((s) => s.status) === "connected"` instead of the JWT in `AuthStore`.

Components don't change otherwise — the hooks return the same `DeviceWithState` /
`DeviceState` shapes the backend returned.

## ⚠️ Before you commit to this path: run the CORS spike

The pure-browser path has ONE unproven blocker. Probed 2026-06:

| Call | Host | Browser-callable? |
|---|---|---|
| login | `pa.account.tcl.com/account/login?clientId=54148614` | ✅ **confirmed** — 200 + ACAO reflects origin |
| cloud_url_get | `prod-center.aws.tcljd.com` | ❌ **confirmed BLOCKED** — 403 on OPTIONS preflight, no ACAO. Browser kills the JSON POST. |
| refresh_tokens / get_things | runtime `cloud_url` / `device_url` | ❌ same wall + custom headers force preflight |
| Cognito + IoT | AWS | ✅ designed for web clients |

> The login `clientId` (`54148614`) is the app login client id, **not** `appId`
> (`wx6e1af3fa84fbe523`, used only as a cloud body field). Both baked into `config.ts`.
> Reference: `ha-tcl-home-unofficial-integration`.

### VERDICT (spike run 2026-06): pure-browser static is NOT viable.

Login works in the browser, but `cloud_url_get` is hard-blocked by CORS preflight
(prod-center 403s OPTIONS with no `Access-Control-Allow-Origin`). `get_things` would
fail the same way and can't dodge it — its `timestamp/nonce/sign/accesstoken` headers
*require* a preflight. A static SPA on Vercel cannot complete the chain.

The CORS + `User-Agent` limits vanish the moment the calls don't originate from a
browser sandbox. So the chain runs unchanged behind any relay.

## The chain works via the Next route handler

`app/api/tclproxy/route.ts` is a Node route handler at `/api/tclproxy`. `TclClient`
(via `proxyPath` in `config.ts`, default `/api/tclproxy`) rewrites each
TCL/cloud/device call to POST `/api/tclproxy` with the real URL in `x-tcl-target`;
Node forwards it server-side — no CORS, and it injects the Android `User-Agent` the
browser strips. **AWS Cognito/IoT are NOT proxied** (already browser-friendly).

`npm run dev` (or `next start`, or a Vercel deploy) → log in with a real TCL account
→ full chain completes. Verified: the relay returns real `cloud_url_get` / `login`
responses with no CORS. The same route handler runs in dev, `next start`, and Vercel
— no dev-only gap. (Path avoids a leading underscore: Next treats `_*` folders as
private and won't route them, so the old `/__tclproxy` name can't be used here.)

Set `NEXT_PUBLIC_TCL_PROXY_PATH=""` to bypass the proxy and call TCL hosts directly
(only works in a native shell — browsers CORS-block it).

## Alternative paths (if you ever leave Next)

- **Native shell — truest "no backend".** Reuse `TclClient.ts` verbatim in Tauri /
  Electron / a browser extension (`host_permissions`) / Capacitor. No CORS, no proxy,
  no server. This is what the TCL app itself does. Set `proxyPath` to `""`.
- **Thin relay elsewhere.** The ~30-line relay logic ports to any serverless route;
  point `proxyPath` at it. Not the old server (no DB/auth/logic) — just a dumb
  same-origin relay. **Never** use a public third-party CORS proxy: credentials +
  tokens transit it.
- **Keep the existing backend.** It already is that relay, plus the shared-account
  model. Revert the 6 component import swaps to fall back to `tclService.ts`.

## Security

`username`, `password`, `saasToken`, and the AWS session creds live in memory (and
only there — nothing is persisted by default). In a browser tab that means XSS can
read them. Acceptable for a personal single-user tool; reconsider for multi-user or
shared deploys, and prefer a native shell there.

## What changes vs. the backend

- Shared TCL service singleton → **per-client** session (each browser authenticates itself).
- Server-side request queue, 200ms rate-limit, 15-min token refresh, state cache → all preserved inside `TclClient`.
- App's own `admin`/`Secret` JWT login → **gone**; the TCL login is the auth.
- Postgres / Redis / Drizzle / Express → unused, can be deleted with the backend.
