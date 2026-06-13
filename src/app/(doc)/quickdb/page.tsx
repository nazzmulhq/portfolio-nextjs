import type { Metadata } from "next";
import DocThemeToggle from "@src/components/DocThemeToggle";
import ZoomOnScroll from "@src/components/ZoomOnScroll";
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

const FEATURES = [
    {
        title: "Universal Database Support",
        body: "Connect to PostgreSQL, MySQL, SQLite, MongoDB, and Redis—all from a single unified interface.",
        icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    },
    {
        title: "AI-Ready with MCP Server",
        body: "Instantly expose your database schema and data to AI agents like Cursor, Claude Desktop, and Windsurf.",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
        title: "Visual Query Builder",
        body: "Construct complex queries, joins, and aggregations visually—no SQL required.",
        icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    },
    {
        title: "Powerful Table Manager",
        body: "Create, modify, and visualize your schema with an intuitive UI.",
        icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
        title: "Data Visualization",
        body: "Instantly chart any query result into stunning, exportable Vega-Lite graphs.",
        icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
    },
    {
        title: "Import & Export",
        body: "Move data easily between SQL dumps, JSON, CSV, and Excel.",
        icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    },
];

const SHOWCASES = [
    {
        title: "Database Management & Imports",
        body: "Easily connect to your servers and import data seamlessly with our optimized engines.",
        gif: "https://nazmulhaque.netlify.app/gifs/quickdb/connect-server-import-database.gif",
        reverse: false,
    },
    {
        title: "Visual Query Builder",
        body: "Build complex SQL queries visually without writing code. Drag, drop, and join tables instantly.",
        gif: "https://nazmulhaque.netlify.app/gifs/quickdb/query-builder.gif",
        reverse: true,
    },
    {
        title: "Connect with External AI Clients",
        body: "Connect QuickDB to your favorite AI assistant in just a few clicks using our built-in MCP server.",
        gif: "https://nazmulhaque.netlify.app/gifs/quickdb/external-client-setup.gif",
        reverse: false,
    },
];

const DATABASES = [
    { name: "SQLite", type: "SQL", port: "N/A", note: "File-based, supports :memory:" },
    { name: "MySQL", type: "SQL", port: "3306", note: "Full INFORMATION_SCHEMA support" },
    { name: "PostgreSQL", type: "SQL", port: "5432", note: "SSL/TLS supported" },
    { name: "MongoDB", type: "NoSQL", port: "27017", note: "Connection string or host/port" },
    { name: "Redis", type: "NoSQL", port: "6379", note: "All data types supported" },
];

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
            <header className="relative overflow-hidden border-b border-line px-4 pb-12 pt-24 text-center sm:pb-20 sm:pt-32">
                <div className="container relative z-10 mx-auto flex flex-col items-center">
                    <div className="reveal-scale mb-6 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-5 shadow-[0_0_50px_-12px_var(--glow)] backdrop-blur-sm">
                        <img src="/images/quickdb-icon.png" alt="QuickDB Logo" className="h-20 w-20 rounded-2xl" />
                    </div>
                    <span className="eyebrow reveal mb-5">VS Code Extension · MCP Server</span>
                    <h1 className="font-display reveal mb-5 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        <span className="text-gradient">QuickDB</span>
                    </h1>
                    <p className="reveal mb-5 max-w-3xl text-lg font-medium text-fg sm:text-2xl">
                        The Ultimate Database Management & AI Integration Extension for VS Code
                    </p>
                    <p className="reveal mb-10 max-w-2xl text-base text-muted sm:text-lg">
                        A DataGrip-inspired database client built right into your editor. Browse tables, run
                        complex queries, manage schemas, and supercharge your workflow with a built-in MCP
                        server for AI tools.
                    </p>
                    <div className="reveal mx-auto flex w-full max-w-xs flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center">
                        <Link href="https://marketplace.visualstudio.com/items?itemName=QuickDB.quickdb" className="btn-accent sheen" target="_blank">
                            <svg className="relative z-10 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.653 2.193L5.438 10.957 2.025 8.441 1.05 9.406l4.636 4.316-4.636 4.318.974.965 3.413-2.515 12.215 8.764c.266.191.637.202.915.028.278-.173.447-.478.447-.803V2.418c0-.325-.17-.631-.447-.804-.278-.174-.649-.163-.915.028zm-2.02 14.869l-6.728-4.82 6.728-4.818v9.638z" /></svg>
                            <span className="relative z-10">Get on VS Code</span>
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
            <div className="container relative z-20 mx-auto -mt-8 mb-12 px-6 sm:-mt-16 sm:mb-20">
                <ZoomOnScroll
                    src="https://nazmulhaque.netlify.app/gifs/quickdb/mcp-server-intro.gif"
                    alt="MCP Server Intro"
                />
            </div>

            {/* Features */}
            <section className="container relative z-10 mx-auto px-4 py-8 sm:px-6 sm:py-12">
                <div className="reveal mb-10 text-center">
                    <h2 className="font-display mb-3 text-3xl font-extrabold sm:text-4xl">Why QuickDB?</h2>
                    <p className="mx-auto max-w-2xl text-base text-muted sm:text-lg">
                        QuickDB turns VS Code into a powerhouse database management tool. Here&apos;s what makes
                        it special.
                    </p>
                </div>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                    {FEATURES.map((f, i) => (
                        <div key={f.title} style={{ ["--i" as string]: i }} className="group glass-card rail h-full p-8">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-accent transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                            </div>
                            <h3 className="font-display mb-3 text-xl font-bold text-fg transition-colors group-hover:text-accent">{f.title}</h3>
                            <p className="leading-relaxed text-muted">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Showcase */}
            <section className="relative border-t border-line py-12 sm:py-20 md:py-28">
                <div className="container relative z-10 mx-auto max-w-6xl px-6">
                    <h2 className="font-display reveal mb-12 text-center text-3xl font-extrabold sm:mb-20 sm:text-5xl">
                        <span className="text-gradient">See It in Action</span>
                    </h2>
                    <div className="space-y-16 sm:space-y-28">
                        {SHOWCASES.map((s) => (
                            <div key={s.title} className="grid grid-cols-1 items-center gap-6 sm:gap-16 lg:grid-cols-2">
                                <div className={s.reverse ? "lg:order-2" : ""}>
                                    <div className={s.reverse ? "reveal-right" : "reveal-left"}>
                                        <h3 className="font-display mb-3 text-2xl font-bold leading-tight text-fg sm:text-3xl">{s.title}</h3>
                                        <p className="text-sm leading-relaxed text-muted sm:text-lg">{s.body}</p>
                                    </div>
                                </div>
                                <div className={s.reverse ? "lg:order-1" : ""}>
                                    <div className={`${s.reverse ? "reveal-left" : "reveal-right"} overflow-hidden rounded-2xl border border-line shadow-[0_24px_60px_-30px_var(--glow)]`}>
                                        <img src={s.gif} alt={s.title} className="w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported databases */}
            <section className="container relative z-10 mx-auto border-t border-line px-4 py-10 sm:px-6 sm:py-16 md:py-24">
                <div className="reveal mx-auto max-w-4xl">
                    <h2 className="font-display mb-10 text-center text-2xl font-extrabold sm:text-3xl">Supported Databases</h2>
                    <div className="w-full overflow-x-auto rounded-2xl border border-line glass">
                        <table className="w-full min-w-[600px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-line text-faint">
                                    {["Database", "Type", "Port", "Notes"].map((h) => (
                                        <th key={h} className="p-4 text-xs font-semibold uppercase tracking-wider sm:p-5">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-muted">
                                {DATABASES.map((db) => (
                                    <tr key={db.name} className="group border-b border-line transition-colors last:border-0 hover:bg-[var(--surface-2)]">
                                        <td className="flex items-center gap-3 p-4 font-medium text-fg sm:p-5">
                                            <span className="h-2 w-2 rounded-full bg-[var(--accent)] transition-transform group-hover:scale-150" />
                                            {db.name}
                                        </td>
                                        <td className="p-4 sm:p-5">
                                            <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-bold text-accent sm:text-xs">{db.type}</span>
                                        </td>
                                        <td className="p-4 font-mono text-xs sm:p-5 sm:text-sm">{db.port}</td>
                                        <td className="p-4 text-xs sm:p-5 sm:text-sm">{db.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

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
