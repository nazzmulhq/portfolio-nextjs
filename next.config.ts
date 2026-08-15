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
            }
        ];
    },
};

export default nextConfig;
