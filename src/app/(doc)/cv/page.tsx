import type { Metadata } from "next";
import CVBtn from "@src/components/cv";
import DocThemeToggle from "@src/components/DocThemeToggle";
import Link from "next/link";
import { FC } from "react";

export const metadata: Metadata = {
    title: "Curriculum Vitae",
    description: "Professional CV of Nazmul Haque, Senior Software Specialist. Review and download a PDF/print version of my software engineering experience and skills.",
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
            "image": "https://nazmulhaque.netlify.app/images/person.png",
            "worksFor": {
                "@type": "Organization",
                "name": "SSL Wireless Ltd."
            }
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-hidden font-sans text-fg">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Themed ambient background */}
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>
            <DocThemeToggle />

            {/* Back Button */}
            <div className="container relative z-10 mx-auto flex max-w-xl justify-start px-6 pt-10 sm:pt-16">
                <Link href="/" className="btn-ghost sheen reveal text-sm">
                    <svg className="relative z-10 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="relative z-10">Back to Portfolio</span>
                </Link>
            </div>

            {/* Main Card */}
            <main className="container relative z-10 mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 py-12">
                <div className="group glass-card reveal-scale flex w-full flex-col items-center p-8 text-center sm:p-10">
                    <div className="mb-8 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-5 shadow-[0_0_40px_-12px_var(--glow)]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-accent transition-transform duration-500 group-hover:scale-105">
                            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="font-display mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        <span className="text-gradient">Curriculum Vitae</span>
                    </h1>

                    <p className="mb-8 max-w-sm text-sm font-light leading-relaxed text-muted sm:text-base">
                        Download or print a clean, high-fidelity PDF of Nazmul Haque&apos;s professional
                        software engineering experience, skills, and qualifications.
                    </p>

                    <div className="flex w-full justify-center">
                        <CVBtn>Download PDF CV</CVBtn>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full border-t border-line py-8 text-center text-xs text-faint">
                <p>&copy; {new Date().getFullYear()} Nazmul Haque. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Page;
