import type { MetadataRoute } from "next";

/**
 * Served by Next at /manifest.webmanifest and linked automatically from the
 * document head. Colours mirror the dark-only app shell (`.full-page-loader`
 * and `--color-background` in globals.css) so the install splash matches the
 * boot loader; the icons sit on a white plate because the TCL mark's letters
 * are knocked out and would otherwise pick up the surface colour.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "TCL Server",
        short_name: "TCL",
        description:
            "Monitor and control your TCL air conditioners — per-unit modes, temperature and global controls.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#020f1e",
        theme_color: "#020f1e",
        categories: ["utilities", "productivity"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
