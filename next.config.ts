import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATHs,
};

export default nextConfig;
