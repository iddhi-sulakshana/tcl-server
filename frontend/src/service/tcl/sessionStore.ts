// Per-client TCL session. Replaces the backend's shared singleton + JWT gate:
// the user logs in with their REAL TCL credentials and the chain runs in-browser.
//
// PERSISTENCE: on a successful login we persist ONLY the long-lived base access
// token (~30d) + username/country/refreshToken to localStorage — never the raw
// password. On reload `init()` rebuilds the whole downstream chain from that base
// token (no re-login), and a background timer re-mints the short-lived SaaS/
// Cognito/STS tokens. When the base token finally expires (~30d) the session is
// cleared and the user is dropped back to the login screen.
//
// SECURITY: the base token in localStorage is XSS-exposed (same as any web token).
// The raw password is NEVER persisted. For a hardened build, wrap this app in a
// desktop (Tauri/Electron) or extension shell — see ./README.md.

import { create } from "zustand";
import { toast } from "sonner";
import TclClient from "./TclClient";
import { TCL_CONFIG } from "./config";
import type { PersistedTclSession, TclLogger } from "./types";

export type TclStatus = "idle" | "connecting" | "connected" | "error";

type TclSessionState = {
    client: TclClient | null;
    status: TclStatus;
    error: string | null;
    /** True until the initial restore-from-localStorage attempt resolves. */
    restoring: boolean;
    /** Restore a persisted session on app start (idempotent). */
    init: () => Promise<void>;
    login: (username: string, password: string) => Promise<boolean>;
    relogin: () => Promise<boolean>;
    logout: () => void;
    /** Throws if not connected — use inside React Query queryFns. */
    requireClient: () => TclClient;
};

const STORAGE_KEY = "tcl-session";

const logger: TclLogger = {
    info: (m) => console.info("[TCL]", m),
    error: (m) => console.error("[TCL]", m),
};

function loadPersisted(): PersistedTclSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw) as Partial<PersistedTclSession>;
        if (!s.token || !s.username || !s.countryAbbr) return null;
        return { token: s.token, username: s.username, countryAbbr: s.countryAbbr, refreshToken: s.refreshToken ?? null };
    } catch {
        return null;
    }
}

function savePersisted(session: PersistedTclSession): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        /* storage full / disabled — session stays in-memory only */
    }
}

function clearPersisted(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

// Guards against React StrictMode double-invoking init() in dev.
let initStarted = false;

export const useTclSession = create<TclSessionState>((set, get) => {
    // Build a client wired to clear persisted state + return to login when the
    // base token can no longer refresh the session.
    const buildClient = (username: string, password: string) =>
        new TclClient({
            ...TCL_CONFIG,
            username,
            password,
            logger,
            onSessionExpired: () => {
                clearPersisted();
                get().client?.dispose();
                set({ client: null, status: "idle", error: "Session expired" });
                toast.error("Session expired — please log in again.");
            },
        });

    return {
        client: null,
        status: "idle",
        error: null,
        restoring: true,

        init: async () => {
            if (initStarted) return;
            initStarted = true;

            const session = loadPersisted();
            if (!session) {
                set({ restoring: false, status: "idle" });
                return;
            }

            const client = buildClient(session.username, ""); // no password — token-only restore
            set({ client, status: "connecting", restoring: true, error: null });
            try {
                await client.restore(session);
                client.start(); // begin the token-refresh interval
                // Re-persist in case refreshToken/country shifted (token itself is unchanged).
                const fresh = client.exportSession();
                if (fresh) savePersisted(fresh);
                set({ status: "connected", restoring: false, error: null });
            } catch {
                // Base token expired/invalid — drop to login, no scary toast on boot.
                clearPersisted();
                client.dispose();
                set({ client: null, status: "idle", restoring: false, error: null });
            }
        },

        login: async (username, password) => {
            get().client?.dispose();
            const client = buildClient(username, password);
            set({ client, status: "connecting", restoring: false, error: null });
            try {
                await client.authenticate();
                if (!client.isConnected()) throw new Error("TCL connection failed");
                client.start(); // begin the token-refresh interval
                const session = client.exportSession();
                if (session) savePersisted(session);
                set({ status: "connected", error: null });
                return true;
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Login failed";
                client.dispose();
                clearPersisted();
                set({ client: null, status: "error", error: message });
                toast.error(message);
                return false;
            }
        },

        relogin: async () => {
            const client = get().client;
            if (!client) return false;
            set({ status: "connecting" });
            try {
                await client.relogin();
                const ok = client.isConnected();
                set({ status: ok ? "connected" : "error", error: ok ? null : "Relogin failed" });
                return ok;
            } catch (e: unknown) {
                set({ status: "error", error: e instanceof Error ? e.message : "Relogin failed" });
                return false;
            }
        },

        logout: () => {
            get().client?.dispose();
            clearPersisted();
            set({ client: null, status: "idle", error: null });
        },

        requireClient: () => {
            const client = get().client;
            if (!client || !client.isConnected()) throw new Error("Not connected to TCL");
            return client;
        },
    };
});
