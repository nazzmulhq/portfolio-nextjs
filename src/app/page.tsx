import type { Metadata } from "next";
import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import HomeMotion from "@src/components/home/HomeMotion";
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
        <div className="relative text-fg">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Atmosphere — ambient aurora glows + dot grid */}
            <div aria-hidden className="atmosphere">
                <div className="atmosphere-grid" />
            </div>

            <div className="fixed right-5 top-4 z-50 sm:right-8 sm:top-5">
                <ThemeToggle />
            </div>

            {/* Telemetry readout — scroll position, driven by HomeMotion. */}
            <div aria-hidden className="readout">
                <span>SCROLL</span>
                <span className="readout-bar">
                    <span data-readout-bar />
                </span>
                <span className="text-fg" data-readout-pct>
                    000
                </span>
            </div>

            <NavBar />

            <HomeMotion>
                <Home />
                <Skills />
                <Experience />
                <Education />
                <Works />

                <footer className="mx-auto w-full max-w-6xl px-5 pb-28 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
                    <div className="border-t border-line pt-10">
                        <div className="flex items-center gap-4">
                            <span className="digit text-xs text-accent">05</span>
                            <span className="section-rule flex-1" />
                            <span className="label">End of transmission</span>
                        </div>

                        <p className="label mt-8">Get in touch</p>
                        <a
                            className="display link-wipe mt-4 inline-block text-[clamp(1.75rem,5vw,3.25rem)] text-fg"
                            href="mailto:nazmul2018s@gmail.com"
                        >
                            nazmul2018s@gmail.com
                        </a>

                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                            <p className="label">Dhaka, Bangladesh · 23.8103° N</p>
                            <p className="label">© {new Date().getFullYear()} Nazmul Haque</p>
                        </div>
                    </div>
                </footer>
            </HomeMotion>

            <NavBarMobile />
        </div>
    );
}
