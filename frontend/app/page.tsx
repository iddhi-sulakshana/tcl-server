"use client";

import { StrictMode, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "@/App";
import ThemeSync from "@/components/ThemeSync";
import { Toaster } from "@/components/ui/sonner";
import QueryClient from "@/lib/QueryClient";

export default function Page() {
    // The app is fully client-side (in-memory session, browser IoT, zustand).
    // Gate on mount so SSR renders only the loader — avoids hydration mismatch
    // from client-only state, and reproduces the old pre-mount heartbeat loader.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="full-page-loader">
                <img src="/logo.png" alt="Growatt Logo" />
            </div>
        );
    }

    return (
        <StrictMode>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ThemeSync />
                <QueryClientProvider client={QueryClient}>
                    <App />
                    <Toaster
                        visibleToasts={5}
                        richColors
                        closeButton
                        position="top-center"
                    />
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                </QueryClientProvider>
            </ThemeProvider>
        </StrictMode>
    );
}
