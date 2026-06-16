# Vite → Next.js Migration — Design Spec

**Date:** 2026-06-16
**Scope:** `frontend/` (TCL Server web app)
**Status:** Approved for planning

## Problem

The app is a Vite React SPA. The backend-less TCL integration (`src/service/tcl/*`)
cannot call TCL cloud/device hosts directly from the browser — they have no CORS
support. A Node-side relay (`/__tclproxy`) was added as a Vite dev/preview
middleware (`vite.config.ts`). That middleware runs ONLY under `vite dev` and
`vite preview`; it does not exist in a real deploy. On Vercel (static `dist/` +
catch-all SPA rewrite), `/__tclproxy` 404s and every TCL call fails with the same
CORS error.

A real server endpoint is required in production. Rather than bolt on a single
Vercel serverless function while keeping Vite, the app is migrated to Next.js so
one route handler serves the relay uniformly across `next dev`, `next start`, and
Vercel.

## Goal

Replace Vite with Next.js (App Router) so:

- The TCL relay runs as a server **route handler** at `/__tclproxy`, identical
  behavior in dev, local prod (`next start`), and Vercel.
- No CORS errors anywhere; no Vite-only middleware; no separate serverless fn.
- The existing client app (auth, device control, UI) keeps working unchanged.

## Non-Goals

- No SSR / server components for app screens — the app stays client-rendered.
- No port to Next file-based routing or middleware auth (session is client-only).
- No removal of the dormant backend-mode code path (kept as intentional fallback).
- No redesign of UI, stores, TCL service logic, or Tailwind theme.

## Current State (facts)

- React 19, `react-router-dom` v7, TanStack Query, `next-themes`, zustand,
  Tailwind v4 (CSS-first via `@tailwindcss/vite`), shadcn-style `ui/*` (sonner).
- Two screens: `src/pages/Login.tsx`, `src/pages/Dashboard.tsx`.
- `src/App.tsx` routing is a trivial client-session gate: `status !== "connected"`
  → `<Login/>`, else a single `/dashboard` route + catch-all redirect.
- Auth/session is in-memory zustand (`src/service/tcl/sessionStore.ts`) — a page
  refresh returns to Login. Fully client-side.
- AWS IoT Data Plane SDK (`@aws-sdk/client-iot-data-plane`) runs in the browser
  for device shadow get / publish (`src/service/tcl/TclClient.ts`). Must stay
  client-side.
- `import.meta.env.VITE_*` used in 2 files: `src/lib/ApiClient.tsx` (VITE_API_URL,
  backend-mode) and `src/service/tcl/config.ts` (3 TCL vars + proxy path).
- Relay lives in `vite.config.ts` (`tclProxy()` plugin, mounted on
  `configureServer` + `configurePreviewServer`).
- `vercel.json`: catch-all SPA rewrite `/(.*) → /`.
- Backend-mode files (`src/service/tclService.ts`, `src/api/login.ts`,
  `src/lib/ApiClient.tsx`, `src/lib/AuthStore.tsx`) are a dormant fallback —
  components use `@/service/tcl/hooks` instead. Kept, not removed.
- `public/icon.png`, `public/logo.png` static assets.

## Design

### Routing model (chosen: drop react-router)

`App.tsx` routing is already just a client-session conditional. Collapse it:

```tsx
return status === "connected" ? <Dashboard /> : <Login />;
```

- Remove `react-router-dom` dependency.
- Delete `src/main.tsx` (providers move to `app/page.tsx`).
- Accepted cost: the `/dashboard` URL goes away. App is single-screen and refresh
  resets to Login anyway, so no functional loss.

### Next App Router structure

```
app/
  layout.tsx          server component — <html lang="en" class="dark">, <head>
                      (title "TCL Server", icon /icon.png, viewport meta),
                      full-page-loader markup + inline <style>, imports globals.css
  page.tsx            'use client' — providers (ThemeProvider attribute="class"
                      defaultTheme="system" enableSystem, ThemeSync,
                      QueryClientProvider, Toaster, ReactQueryDevtools) + <App/>
  globals.css         current src/index.css content, unchanged
  __tclproxy/
    route.ts          Node route handler — the relay
```

`src/` (pages, components, lib, service, types) stays put; imported via `@/*`.

### Relay → route handler

`app/__tclproxy/route.ts` ports the exact `tclProxyHandler` logic from
`vite.config.ts`:

- Read absolute target from `x-tcl-target` request header; 400 if missing.
- Copy request headers, skipping hop-by-hop
  (`host`, `origin`, `referer`, `connection`, `content-length`, `x-tcl-target`,
  `accept-encoding`) and any `sec-*`.
- Force `user-agent: "Android"` (browser forbids setting it client-side; TCL
  expects it).
- `fetch` the target with the same method; omit body for GET/HEAD.
- Return upstream status, propagate `content-type`, stream body back.
- On error → 502.

Implementation detail: use Web-standard `Request`/`Response` (Next route handler
signature). Export a single handler bound to `GET`, `POST`, `PUT`, `DELETE` (cover
whatever verbs the TCL calls use — login/cloud_url_get are POST; include the set
the client issues). Set `export const runtime = "nodejs"` and
`export const dynamic = "force-dynamic"` so it is never statically optimized.

Client path stays `/__tclproxy` → `config.ts` proxyPath default unchanged.

### Env vars

Rename `VITE_*` → `NEXT_PUBLIC_*`, access via `process.env`:

| Old (`import.meta.env`)     | New (`process.env`)                  | File              |
|-----------------------------|--------------------------------------|-------------------|
| `VITE_API_URL`              | `NEXT_PUBLIC_API_URL`                | `ApiClient.tsx`   |
| `VITE_TCL_APP_ID`           | `NEXT_PUBLIC_TCL_APP_ID`             | `tcl/config.ts`   |
| `VITE_TCL_LOGIN_URL`        | `NEXT_PUBLIC_TCL_LOGIN_URL`          | `tcl/config.ts`   |
| `VITE_TCL_CLOUD_URL`        | `NEXT_PUBLIC_TCL_CLOUD_URL`          | `tcl/config.ts`   |
| `VITE_TCL_PROXY_PATH`       | `NEXT_PUBLIC_TCL_PROXY_PATH`         | `tcl/config.ts`   |

`.env.example` updated to the new keys. `NEXT_PUBLIC_` prefix is required for any
var read in client code.

### Build / tooling

Remove deps: `vite`, `@vitejs/plugin-react-swc`, `@tailwindcss/vite`,
`react-router-dom`.

Add deps: `next`, `@tailwindcss/postcss`, `postcss`.

- `postcss.config.mjs`: `{ plugins: { "@tailwindcss/postcss": {} } }`.
- `package.json` scripts: `dev: next dev`, `build: next build`, `start: next start`,
  `lint: eslint .`, `typecheck: tsc --noEmit`.
- `tsconfig.json`: Next-compatible — `jsx: "preserve"`,
  `plugins: [{ "name": "next" }]`, `moduleResolution: "bundler"`,
  `module: "esnext"`, `noEmit: true`, keep `paths: { "@/*": ["./src/*"] }`,
  `incremental: true`. (Replaces the Vite `tsconfig.app/node` split.)
- `next.config.ts`: minimal (empty config object initially).
- Delete: `index.html`, `vite.config.ts`, `vercel.json` (Next routes natively),
  `tsconfig.app.json`, `tsconfig.node.json`.
- Keep: `eslint.config.js`.
- `next-env.d.ts` generated by Next on first run.

### Unchanged

`src/components/ui/*`, all pages/components/stores, AWS IoT client (browser-side
under the `page.tsx` client boundary), Tailwind theme (`index.css` content),
`public/` assets, TCL service logic, `config.ts` proxyPath default.

## Risks & Mitigations

- **Client boundary:** anything touching `window`/`localStorage`/zustand/IoT must
  be client. All such code sits under `app/page.tsx` (`'use client'`), so the
  whole app tree is client — safe.
- **Env exposure:** Next only exposes `NEXT_PUBLIC_*` to the browser; all four
  client-read vars get the prefix. The route handler may read non-public vars if
  needed later (none now).
- **Header forwarding parity:** the route handler must reproduce the exact
  skip-list + Android UA, or TCL upstream behaves differently than it did under
  Vite. Direct port of the existing logic.
- **Tailwind v4 PostCSS:** moving from the Vite plugin to `@tailwindcss/postcss`
  must keep the CSS-first `@import "tailwindcss"` + `@theme` working. Content of
  `index.css` is copied verbatim to `globals.css`.

## Verification

1. `npm install` resolves with new deps; old Vite deps gone.
2. `npm run build` (`next build`) completes clean (typecheck + lint pass).
3. `npm run start`: app loads, Tailwind theme + dark mode render correctly.
4. Login flow: POST to `/__tclproxy` returns 200 relay (no CORS), session connects.
5. Dashboard: device list loads, a control action via AWS IoT succeeds.
6. Vercel deploy: same flow works in production (route handler live, no 404).

## Deviations from plan (discovered during implementation)

- **Proxy path `/__tclproxy` → `/api/tclproxy`.** Next App Router treats any
  folder starting with `_` as a *private folder* (excluded from routing), so
  `app/__tclproxy/route.ts` produced no route. Renamed to `app/api/tclproxy/`.
  `config.ts` proxyPath default + `.env.example` + README updated to match.
- **`src/pages/` → `src/screens/`.** Next reserves `pages/` (and `src/pages/`)
  for the Pages Router; having it alongside the root `app/` dir failed the build
  with "`pages` and `app` directories should be under the same folder". Renamed
  the app's own screen dir; only `App.tsx` imported from it.
- **Next 16 installed (not 15).** `next@latest` resolved to 16.2.9. Next 16
  removed the `eslint` config key, so `next.config.ts` is minimal (no
  `ignoreDuringBuilds`); `next build` no longer runs ESLint at all — lint is a
  separate `npm run lint`.
- **Removed `eslint-plugin-react-refresh`.** It was `reactRefresh.configs.vite`,
  a Vite-Fast-Refresh-specific rule set, now meaningless under Next. Dropped from
  `eslint.config.js` and devDeps. (15 pre-existing app-code lint errors remain —
  `no-explicit-any`, empty blocks, etc. — unrelated to the migration.)

## Out of Scope / Follow-ups

- Removing dormant backend-mode files (separate cleanup if desired).
- Persisting session beyond in-memory (security tradeoff, unchanged here).
- Code-splitting the 686 kB main chunk (pre-existing warning).
