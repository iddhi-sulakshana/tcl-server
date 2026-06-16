// Per-client TCL session. Replaces the backend's shared singleton + JWT gate:
// the user logs in with their REAL TCL credentials and the chain runs in-browser.
//
// SECURITY: credentials + long-lived tokens live in memory (and, if you opt in
// below, sessionStorage). In a browser that's XSS-exposed. Do NOT persist the
// raw password to localStorage. For a hardened build, wrap this app in a desktop
// (Tauri/Electron) or extension shell — see ./README.md.

import { create } from "zustand";
import { toast } from "sonner";
import TclClient from "./TclClient";
import { TCL_CONFIG } from "./config";
import type { TclLogger } from "./types";

export type TclStatus = "idle" | "connecting" | "connected" | "error";

type TclSessionState = {
    client: TclClient | null;
    status: TclStatus;
    error: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    relogin: () => Promise<boolean>;
    logout: () => void;
    /** Throws if not connected — use inside React Query queryFns. */
    requireClient: () => TclClient;
};

const logger: TclLogger = {
    info: (m) => console.info("[TCL]", m),
    error: (m) => console.error("[TCL]", m),
};

export const useTclSession = create<TclSessionState>((set, get) => ({
    client: null,
    status: "idle",
    error: null,

    login: async (username, password) => {
        get().client?.dispose();
        const client = new TclClient({ ...TCL_CONFIG, username, password, logger });
        set({ client, status: "connecting", error: null });
        try {
            await client.authenticate();
            if (!client.isConnected()) throw new Error("TCL connection failed");
            client.start(); // begin the periodic re-auth interval
            set({ status: "connected", error: null });
            return true;
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Login failed";
            client.dispose();
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
        set({ client: null, status: "idle", error: null });
    },

    requireClient: () => {
        const client = get().client;
        if (!client || !client.isConnected()) throw new Error("Not connected to TCL");
        return client;
    },
}));
