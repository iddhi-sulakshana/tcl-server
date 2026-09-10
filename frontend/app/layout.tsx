import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "TCL Server",
    description:
        "Monitor and control your TCL air conditioners — per-unit modes, temperature and global controls.",
    // The manifest itself is app/manifest.ts; Next links it automatically.
    icons: {
        icon: "/icon.png",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        title: "TCL",
        // Opaque, not "black-translucent": the layout has no safe-area
        // insets, so content must not extend under the iOS status bar.
        statusBarStyle: "black",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#020f1e",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    // `class="dark"` matches the old index.html default; next-themes toggles it
    // on the client, so suppress the expected hydration class mismatch.
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
