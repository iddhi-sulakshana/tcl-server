import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Dev-only CORS bypass for the backend-less TCL path (src/service/tcl/*).
// The browser can't call TCL's cloud/device hosts directly (no CORS preflight
// support). This middleware relays each call server-side: the client POSTs to
// /__tclproxy with the real absolute URL in `x-tcl-target`; we forward it from
// Node (no CORS, and we can set the Android User-Agent the browser forbids).
// Handles the dynamic cloud_url/device_url since the target is per-request.
// NOTE: dev server only — production needs a real proxy or a native shell.
function tclDevProxy(): PluginOption {
    const SKIP = new Set([
        "host", "origin", "referer", "connection", "content-length",
        "x-tcl-target", "accept-encoding",
    ]);
    return {
        name: "tcl-dev-proxy",
        configureServer(server) {
            server.middlewares.use("/__tclproxy", async (req, res) => {
                try {
                    const target = req.headers["x-tcl-target"];
                    if (typeof target !== "string") {
                        res.statusCode = 400;
                        res.end("missing x-tcl-target");
                        return;
                    }
                    const chunks: Buffer[] = [];
                    for await (const c of req) chunks.push(c as Buffer);
                    const body = chunks.length ? Buffer.concat(chunks) : undefined;

                    const headers: Record<string, string> = {};
                    for (const [k, v] of Object.entries(req.headers)) {
                        if (SKIP.has(k) || k.startsWith("sec-") || v === undefined) continue;
                        headers[k] = Array.isArray(v) ? v.join(", ") : v;
                    }
                    // Force the Android UA the TCL app uses (browser leaks its own,
                    // which can't be set client-side). Drop browser fingerprint noise.
                    headers["user-agent"] = "Android";

                    const upstream = await fetch(target, {
                        method: req.method,
                        headers,
                        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
                    });
                    const buf = Buffer.from(await upstream.arrayBuffer());
                    res.statusCode = upstream.status;
                    const ct = upstream.headers.get("content-type");
                    if (ct) res.setHeader("content-type", ct);
                    res.end(buf);
                } catch (e) {
                    res.statusCode = 502;
                    res.end(String(e));
                }
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), tclDevProxy()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5000,
        host: true,
        allowedHosts: [],
    },
});
