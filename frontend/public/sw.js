/*
 * TCL Server service worker — offline app shell for the installed PWA.
 *
 * This app commands real air conditioners, so nothing that carries device state
 * may come from a cache. Two classes of request are therefore never
 * intercepted: same-origin `/api/*` (the TCL Cloud proxy route handler) and
 * everything cross-origin (TCL Cloud, AWS IoT, Google Fonts).
 *
 * What is cached is the shell — the document plus Next's content-hashed build
 * output under /_next/static — so launching from the home screen without
 * connectivity boots the UI (which then surfaces its own connection error)
 * rather than the browser's error page. Hashed filenames make the asset cache
 * safe: a new build requests new URLs, and old cache versions are dropped on
 * activate.
 */

const VERSION = "v1";
const SHELL_CACHE = `tcl-shell-${VERSION}`;
const ASSET_CACHE = `tcl-assets-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

// The app is a single client-side route, so one document is the shell.
const SHELL_URL = "/";

const PRECACHE_URLS = [
    SHELL_URL,
    "/manifest.webmanifest",
    "/icon.png",
    "/logo.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

const ASSET_PATTERN = /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|svg|webp|avif|ico)$/i;

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(SHELL_CACHE);
            // allSettled, not addAll: one missing optional asset must not abort
            // the whole install and leave the app without a worker.
            await Promise.allSettled(
                PRECACHE_URLS.map((url) =>
                    cache.add(new Request(url, { cache: "reload" }))
                )
            );
            await self.skipWaiting();
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names
                    .filter(
                        (name) =>
                            name.startsWith("tcl-") &&
                            !CURRENT_CACHES.includes(name)
                    )
                    .map((name) => caches.delete(name))
            );
            await self.clients.claim();
        })()
    );
});

// The page posts this when the user accepts the update prompt.
self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // TCL Cloud, AWS IoT and third-party assets: hands off.
    if (url.origin !== self.location.origin) return;

    // The tclproxy route handler returns live device state.
    if (url.pathname.startsWith("/api/")) return;

    if (request.mode === "navigate") {
        event.respondWith(shellFirst(request));
        return;
    }

    if (ASSET_PATTERN.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event, request));
    }
});

/**
 * Navigations: try the network so a fresh deploy is picked up immediately, and
 * fall back to the cached shell when offline.
 */
async function shellFirst(request) {
    const cache = await caches.open(SHELL_CACHE);
    try {
        const response = await fetch(request);
        // A redirected response cannot be written to the cache, and a non-2xx
        // one would poison the shell.
        if (response.ok && !response.redirected) {
            cache.put(SHELL_URL, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(SHELL_URL);
        if (cached) return cached;
        throw new Error("offline and no cached shell available");
    }
}

/**
 * Assets: serve from cache instantly when present, refresh in the background.
 * `waitUntil` keeps the worker alive long enough for that refresh to land.
 */
async function staleWhileRevalidate(event, request) {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);

    const revalidate = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => undefined);

    if (cached) {
        event.waitUntil(revalidate);
        return cached;
    }

    const response = await revalidate;
    if (response) return response;
    throw new Error(`offline and ${request.url} is not cached`);
}
