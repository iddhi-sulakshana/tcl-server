import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // TypeScript errors fail the build (Next default) — keep that.
    // Linting is run separately via `npm run lint` (own flat eslint.config.js).
};

export default nextConfig;
