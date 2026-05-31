import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Nazmul Haque | Senior Software Specialist Portfolio",
        short_name: "Nazmul Portfolio",
        description: "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
        start_url: "/",
        display: "standalone",
        background_color: "#020617",
        theme_color: "#020617",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/images/person.png",
                sizes: "192x192",
                type: "image/png",
            },
        ],
    };
}
