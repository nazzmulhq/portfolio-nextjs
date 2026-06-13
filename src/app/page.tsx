import type { Metadata } from "next";
import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import InfiniteCounter from "@src/components/home/InfiniteCounter";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
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
        "url": "https://nazmulhaque.netlify.app",
        "image": "https://nazmulhaque.netlify.app/images/person.png",
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
        <div className="relative min-h-screen w-full max-w-5xl mx-auto px-0 sm:px-4 md:py-24 pb-28 md:pb-12 flex flex-col justify-center text-fg">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Themed ambient background */}
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>

            <NavBar />

            <div className="w-full relative z-10">
                {/* Sleek glass terminal frame */}
                <div className="group/frame relative w-full overflow-hidden rounded-none sm:rounded-3xl glass shadow-[0_30px_80px_-30px_var(--shadow)]">
                    {/* Animated top edge light */}
                    <div className="absolute top-0 left-[-100%] z-20 h-px w-[150%] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent transition-[left] duration-[2200ms] ease-in-out group-hover/frame:left-[100%]" />

                    {/* Title bar */}
                    <div className="relative z-10 flex h-12 w-full items-center justify-between border-b border-line bg-[color-mix(in_srgb,var(--surface-2)_55%,transparent)] px-3 backdrop-blur-md sm:px-5">
                        <div className="flex w-[30%] items-center gap-1.5 sm:w-1/3 sm:gap-2.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/70 sm:h-3 sm:w-3" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]/70 sm:h-3 sm:w-3" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/70 sm:h-3 sm:w-3" />
                        </div>
                        <div className="flex w-[40%] flex-1 justify-center font-mono text-[10px] tracking-widest text-faint sm:w-1/3 sm:text-xs">
                            ~/nazmul-haque
                        </div>
                        <div className="flex w-[30%] items-center justify-end gap-2 sm:w-1/3">
                            <span className="hidden items-center gap-2 rounded-md border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-2.5 py-1 font-mono text-[10px] text-muted sm:flex sm:text-xs">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                                <InfiniteCounter direction="up" speed={1000} />
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="relative z-0 w-full">
                        <Home />
                        <Skills />
                        <Experience />
                        <Education />
                        <Works />
                    </div>

                    {/* Status bar */}
                    <div className="relative z-10 flex h-10 w-full items-center justify-between border-t border-line bg-[color-mix(in_srgb,var(--surface-2)_55%,transparent)] px-5 font-mono text-xs text-faint backdrop-blur-md">
                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> SYSTEM ONLINE
                        </span>
                        <span className="flex items-center gap-2 rounded-md border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-3 py-1 text-muted">
                            <InfiniteCounter direction="down" speed={1000} />
                        </span>
                    </div>
                </div>
            </div>
            <NavBarMobile />
        </div>
    );
}
