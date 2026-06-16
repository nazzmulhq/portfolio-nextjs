import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import DocThemeToggle from "@src/components/DocThemeToggle";
import ZoomOnScroll from "@src/components/ZoomOnScroll";
import MarkdownDoc from "@src/components/doc/MarkdownDoc";
import DocToc from "@src/components/doc/DocToc";
import { slugify } from "@src/components/doc/mdSlug";
import Link from "next/link";

export const metadata: Metadata = {
    title: "QuickDB - VS Code Database Client & AI MCP Server",
    description: "DataGrip-inspired database manager for VS Code. Browse tables, run SQL/NoSQL queries, and integrate with AI assistants like Cursor/Claude via built-in MCP server.",
    alternates: {
        canonical: "/quickdb",
    },
    openGraph: {
        title: "QuickDB - Database Client & AI MCP Server for VS Code",
        description: "DataGrip-inspired database manager for VS Code. Universal support for SQLite, PostgreSQL, MySQL, MongoDB, and Redis with AI integration.",
        url: "/quickdb",
        images: [
            {
                url: "/images/quickdb-icon.png",
                width: 1200,
                height: 630,
                alt: "QuickDB - VS Code Extension and MCP Server",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "QuickDB - VS Code Database Client & AI MCP Server",
        description: "Universal database support (SQL/NoSQL) and AI MCP server integration in VS Code.",
        images: ["/images/quickdb.png"],
    },
};

export const dynamic = "force-static";

// Read the docs markdown at build time (static export — runs once, no runtime fs).
const content = readFileSync(join(process.cwd(), "src/app/(doc)/quickdb/content.md"), "utf8");

// Build the table of contents from the markdown's H2 headings.
const tocItems = content
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) => {
        const raw = line.replace(/^##\s+/, "").trim();
        return { id: slugify(raw), label: raw.replace(/^[^A-Za-z0-9]+/, "").trim() };
    });

export default function QuickDBPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QuickDB",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "DataGrip-inspired database manager for VS Code. Browse tables, run SQL/NoSQL queries, and integrate with AI assistants like Cursor/Claude via built-in MCP server.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    };

    return (
        <div className="relative min-h-screen overflow-hidden font-sans text-fg">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Themed ambient background */}
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>
            <DocThemeToggle />

            {/* Hero */}
            <header className="relative overflow-hidden border-b border-line px-4 pb-12 pt-24 text-center sm:pb-16 sm:pt-32">
                <div className="container relative z-10 mx-auto flex flex-col items-center">
                    <div className="reveal-scale mb-6 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-5 shadow-[0_0_50px_-12px_var(--glow)] backdrop-blur-sm">
                        <img src="/images/quickdb-icon.png" alt="QuickDB Logo" className="h-20 w-20 rounded-2xl" />
                    </div>
                    <span className="eyebrow reveal mb-5">VS Code Extension · MCP Server</span>
                    <h1 className="font-display reveal mb-5 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        <span className="text-gradient">QuickDB</span>
                    </h1>
                    <p className="reveal mb-5 max-w-3xl text-lg font-medium text-fg sm:text-2xl">
                        The Ultimate Database Management &amp; AI Integration Extension for VS Code
                    </p>
                    <p className="reveal mb-10 max-w-2xl text-base text-muted sm:text-lg">
                        A DataGrip-inspired database client built right into your editor. Browse tables, run
                        complex queries, manage schemas, and supercharge your workflow with a built-in MCP
                        server for AI tools.
                    </p>
                    <div className="reveal mx-auto flex w-full max-w-xs flex-col flex-wrap gap-4 sm:max-w-none sm:flex-row sm:justify-center">
                        <a href="vscode:extension/QuickDB.quickdb" className="btn-accent sheen">
                            <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span className="relative z-10">Install in VS Code</span>
                        </a>
                        <Link href="https://marketplace.visualstudio.com/items?itemName=QuickDB.quickdb" className="btn-ghost sheen" target="_blank">
                            <svg className="relative z-10 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.653 2.193L5.438 10.957 2.025 8.441 1.05 9.406l4.636 4.316-4.636 4.318.974.965 3.413-2.515 12.215 8.764c.266.191.637.202.915.028.278-.173.447-.478.447-.803V2.418c0-.325-.17-.631-.447-.804-.278-.174-.649-.163-.915.028zm-2.02 14.869l-6.728-4.82 6.728-4.818v9.638z" /></svg>
                            <span className="relative z-10">Marketplace</span>
                        </Link>
                        <Link href="https://open-vsx.org/extension/quickdb/quickdb" className="btn-ghost sheen" target="_blank">
                            <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span className="relative z-10">Open VSX</span>
                        </Link>
                        <Link href="/" className="btn-ghost sheen">
                            <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span className="relative z-10">Portfolio</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Intro media — zooms in & lifts on scroll */}
            <div className="container relative z-20 mx-auto -mt-8 mb-4 px-6 sm:-mt-16">
                <ZoomOnScroll
                    src="https://nazmulhaque.netlify.app/gifs/quickdb/mcp-server-intro.gif"
                    alt="MCP Server Intro"
                />
            </div>

            {/* Docs: sticky TOC + markdown body */}
            <div className="container relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <DocToc items={tocItems} />
                    <article className="min-w-0">
                        <MarkdownDoc content={content} />
                    </article>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-line py-12 text-center text-faint">
                <p>QuickDB — A VS Code Extension by Nazmul Haque</p>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                    <Link href="/" className="transition-colors hover:text-accent">Portfolio Home</Link>
                    <span>&bull;</span>
                    <Link href="https://marketplace.visualstudio.com/items?itemName=QuickDB.quickdb" target="_blank" className="transition-colors hover:text-accent">VS Code</Link>
                    <span>&bull;</span>
                    <Link href="https://open-vsx.org/extension/quickdb/quickdb" target="_blank" className="transition-colors hover:text-accent">Open VSX</Link>
                </div>
            </footer>
        </div>
    );
}
