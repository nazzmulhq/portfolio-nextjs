import type { Metadata } from "next";
import Link from "next/link";
import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import HomeMotion from "@src/components/home/HomeMotion";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
import RoutePrerender from "@src/components/home/RoutePrerender";
import Skills from "@src/components/home/Skills";
import Works from "@src/components/home/Works";
import ThemeToggle from "@src/components/ThemeToggle";

export const metadata: Metadata = {
    title: {
        absolute: "Nazmul Haque | Senior Software Specialist",
    },
    description: "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
    alternates: {
        canonical: "/",
    },
};

export const dynamic = "force-static";

export default function Page() {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Nazmul Haque",
        "url": "https://nazzmulhaque.vercel.app",
        "image": "https://nazzmulhaque.vercel.app/images/person.png",
        "sameAs": [
            "https://www.github.com/nazzmulhq",
            "https://www.linkedin.com/in/nazzmulhq/"
        ],
        "jobTitle": "Senior Software Specialist",
        "worksFor": {
            "@type": "Organization",
            "name": "SSL Wireless Ltd."
        },
        "description": "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
        "gender": "Male",
        "knowsLanguage": ["English", "Bengali"],
        "nationality": {
            "@type": "Country",
            "name": "Bangladesh"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dhaka",
            "addressCountry": "Bangladesh"
        },
        "alumniOf": [
            {
                "@type": "EducationalOrganization",
                "name": "Daffodil International University"
            }
        ],
        "knowsAbout": [
            "JavaScript",
            "TypeScript",
            "Python",
            "React.js",
            "Next.js",
            "NestJS",
            "Django",
            "Docker",
            "Kubernetes",
            "Microservices"
        ]
    };

    const quickdbSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QuickDB",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "DataGrip-inspired database manager for VS Code. Browse tables, run SQL/NoSQL queries, and integrate with AI assistants like Cursor/Claude via built-in MCP server.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const quickCicdSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Quick Dockerize Tool",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Command-line interface to containerize projects (Docker) and generate CI/CD configuration files (GitHub Actions, Bitbucket, etc.) automatically.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const eslintSetupSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "ESLint & Prettier Setup for Next.js",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Published npm package for automated ESLint and Prettier configuration in Next.js projects.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const quickUiSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Quick UI Design",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Scaffolding tool for rapid web application UI development with Ant Design and Next.js.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const jsonLd = [personSchema, quickdbSchema, quickCicdSchema, eslintSetupSchema, quickUiSchema];

    return (
        <div className="relative min-h-screen text-fg bg-[var(--canvas)] selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
            {/* Background Route Prerender for /quickdb */}
            <RoutePrerender />

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Atmosphere — ambient aurora glows + dot grid */}
            <div aria-hidden className="aurora pointer-events-none fixed inset-0 z-0">
                <div className="aurora-grid" />
            </div>

            <div className="fixed right-5 top-4 z-50 sm:right-8 sm:top-5">
                <ThemeToggle />
            </div>

            <NavBar />

            <HomeMotion>
                <div className="relative z-10">
                    <Home />
                    <Skills />
                    <Experience />
                    <Education />
                    <Works />

                    {/* ── Modern Closing CTA Footer Banner ── */}
                    <footer className="mx-auto w-full max-w-6xl px-5 pb-28 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
                        <div className="rounded-3xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] border border-line p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
                                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
                                    Let&apos;s Connect
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-fg leading-tight">
                                Have a project or engineering opportunity in mind?
                            </h2>

                            <p className="mt-4 max-w-xl text-sm sm:text-base text-muted leading-relaxed">
                                I&apos;m always open to discussing enterprise ERP architecture, high-scale full-stack systems, and open-source collaborations.
                            </p>

                            <div className="mt-7">
                                <a
                                    className="inline-block text-xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-85 transition-opacity"
                                    href="mailto:nazmul2018s@gmail.com"
                                >
                                    nazmul2018s@gmail.com
                                </a>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-3 pt-8 border-t border-line">
                                <a
                                    href="mailto:nazmul2018s@gmail.com"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Send Email Message</span>
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/nazzmulhq/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg text-xs font-semibold border border-line transition-all"
                                >
                                    <span>LinkedIn</span>
                                </a>
                                <a
                                    href="https://github.com/nazzmulhq"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg text-xs font-semibold border border-line transition-all"
                                >
                                    <span>GitHub</span>
                                </a>
                                <Link
                                    href="/cv"
                                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--accent)] text-xs font-semibold border border-line transition-all"
                                >
                                    <span>Curriculum Vitae</span>
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-line text-xs font-mono text-muted">
                                <p>Dhaka, Bangladesh · 23.8103° N, 90.4125° E</p>
                                <p>© {new Date().getFullYear()} Nazmul Haque. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </HomeMotion>

            <NavBarMobile />
        </div>
    );
}
