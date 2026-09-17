import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    images: {
        unoptimized: true,
    },

	reactStrictMode: true,
	reactCompiler: true,
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
    serverExternalPackages: ["typeorm", "pg", "argon2", "bcryptjs", "pdfkit"],
    async rewrites() {
        return [
            {
                source: '/quickdb/auth/:path*',
                destination: '/api/quickdb/auth/:path*',
            },
            {
                source: '/quickdb/me',
                destination: '/api/quickdb/me',
            },
            {
                source: '/quickdb/activity/sync',
                destination: '/api/v1/activity/sync',
            },
            {
                source: '/quickdb/api/v1/activity/sync',
                destination: '/api/v1/activity/sync',
            },
            {
                source: '/quickdb/telemetry',
                destination: '/quickdb/activity',
            },
            {
                source: '/quickdb/analytics',
                destination: '/quickdb/activity',
            }
        ];
    },
};

export default nextConfig;
