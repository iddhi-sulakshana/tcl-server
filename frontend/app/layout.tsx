import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "TCL Server",
    icons: { icon: "/icon.png" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
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
