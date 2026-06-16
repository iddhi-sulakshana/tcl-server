// Server-side CORS bypass for the backend-less TCL path (src/service/tcl/*).
// The browser can't call TCL's cloud/device hosts directly (no CORS support).
// The client POSTs to /api/tclproxy with the real absolute URL in `x-tcl-target`;
// we relay it from Node (no CORS, and we can set the Android User-Agent the
// browser forbids). Replaces the old Vite dev/preview middleware — this runs in
// `next dev`, `next start`, and on Vercel alike.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SKIP = new Set([
    "host", "origin", "referer", "connection", "content-length",
    "x-tcl-target", "accept-encoding",
]);

async function relay(req: Request): Promise<Response> {
    try {
        const target = req.headers.get("x-tcl-target");
        if (!target) {
            return new Response("missing x-tcl-target", { status: 400 });
        }

        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            if (SKIP.has(key) || key.startsWith("sec-")) return;
            headers[key] = value;
        });
        // Force the Android UA the TCL app uses (browser leaks its own, which
        // can't be set client-side). Drop browser fingerprint noise.
        headers["user-agent"] = "Android";

        const method = req.method;
        const hasBody = method !== "GET" && method !== "HEAD";
        const body = hasBody ? await req.arrayBuffer() : undefined;

        const upstream = await fetch(target, { method, headers, body });
        const buf = await upstream.arrayBuffer();
        const resHeaders = new Headers();
        const ct = upstream.headers.get("content-type");
        if (ct) resHeaders.set("content-type", ct);
        return new Response(buf, { status: upstream.status, headers: resHeaders });
    } catch (e) {
        return new Response(String(e), { status: 502 });
    }
}

export const GET = relay;
export const POST = relay;
export const PUT = relay;
export const PATCH = relay;
export const DELETE = relay;
