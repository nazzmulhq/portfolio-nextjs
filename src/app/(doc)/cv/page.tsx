import type { Metadata } from "next";
import CVViewer from "@src/components/cv";
import { FC } from "react";

export const metadata: Metadata = {
    title: "Curriculum Vitae",
    description: "Professional CV of Nazmul Haque, Senior Software Specialist. Review, interact, and download a PDF/print version of my software engineering experience and skills.",
    alternates: {
        canonical: "/cv",
    },
    openGraph: {
        title: "Curriculum Vitae (CV) | Nazmul Haque",
        description: "Professional CV of Nazmul Haque, Senior Software Specialist. Review and download a PDF/print version of my software engineering experience and skills.",
        url: "/cv",
        images: [
            {
                url: "/images/person.png",
                width: 800,
                height: 800,
                alt: "Nazmul Haque - Curriculum Vitae",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Curriculum Vitae (CV) | Nazmul Haque",
        description: "Professional CV of Nazmul Haque, Senior Software Specialist.",
        images: ["/images/person.png"],
    },
};

export interface IPage {}

export const dynamic = "force-static";

const Page: FC<IPage> = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
            "@type": "Person",
            "name": "Nazmul Haque",
            "jobTitle": "Senior Software Specialist",
            "description": "Professional CV of Nazmul Haque, Senior Software Specialist. Review and download a PDF/print version of my software engineering experience and skills.",
            "image": "https://nazzmulhaque.vercel.app/images/person.png",
            "worksFor": {
                "@type": "Organization",
                "name": "SSL Wireless Ltd."
            }
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden font-sans text-fg bg-[var(--canvas)] selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Ambient Aurora Background */}
            <div aria-hidden className="aurora pointer-events-none fixed inset-0 z-0">
                <div className="aurora-grid" />
            </div>

            {/* Main Interactive CV Viewer Component */}
            <div className="relative z-10 w-full pt-4 sm:pt-6">
                <CVViewer />
            </div>

            {/* Footer */}
            <footer className="relative z-10 w-full border-t border-line py-6 text-center text-xs text-faint bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] backdrop-blur-md">
                <p>&copy; {new Date().getFullYear()} Nazmul Haque. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Page;
