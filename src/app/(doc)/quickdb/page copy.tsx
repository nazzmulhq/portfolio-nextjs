import DocThemeToggle from "@src/components/DocThemeToggle";
import ZoomOnScroll from "@src/components/ZoomOnScroll";
import DocChapterNav from "@src/components/doc/DocChapterNav";
import FeatureWalkthroughs from "@src/components/doc/FeatureWalkthroughs";
import MarkdownDoc from "@src/components/doc/MarkdownDoc";
import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
    title: "QuickDB - Universal Database Client, Desktop App & AI MCP Server",
    description: "IDE-grade database client for VS Code and desktop (Windows/macOS/Linux). 85 engines, visual query builder, dashboards, 255 chart styles, and a built-in MCP server exposing 32 tools to 10 AI clients.",
    alternates: {
        canonical: "/quickdb",
    },
    openGraph: {
        title: "QuickDB - Universal Database Client, Desktop App & AI MCP Server",
        description: "IDE-grade database client for VS Code and desktop. 85 engines, visual query builder, dashboards, and AI/MCP integration.",
        url: "/quickdb",
        images: [
            {
                url: "/images/quickdb-icon.png",
                width: 1200,
                height: 630,
                alt: "QuickDB - Database Client, Desktop App and MCP Server",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "QuickDB - Universal Database Client, Desktop App & AI MCP Server",
        description: "85 engines. Visual query builder. Dashboards. 255 chart styles. AI/MCP for 10 clients.",
        images: ["/images/quickdb.png"],
    },
};

export const dynamic = "force-static";

// Docs content is split so the "Supported Databases" and "Feature Walkthroughs"
// chapters can render as rich components instead of plain markdown, while
// everything else stays simple prose/tables sourced straight from the README.
const introContent = readFileSync(join(process.cwd(), "src/app/(doc)/quickdb/content-intro.md"), "utf8");
const outroContent = readFileSync(join(process.cwd(), "src/app/(doc)/quickdb/content-outro.md"), "utf8");

const CHAPTERS = [
    { id: "why-quickdb", label: "Overview" },
    { id: "quick-start", label: "Quick Start" },
    { id: "supported-databases", label: "Databases" },
    { id: "feature-walkthroughs", label: "Features" },
    { id: "desktop-app", label: "Desktop" },
    { id: "command-reference", label: "Reference" },
    { id: "security", label: "Security" },
];

const DB_CATEGORIES = [
    { label: "MySQL family", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", items: ["MySQL", "MariaDB", "TiDB", "SingleStore", "StarRocks", "Apache Doris"] },
    { label: "PostgreSQL family", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", items: ["PostgreSQL", "CockroachDB", "Timescale", "Amazon Redshift", "Greenplum", "QuestDB", "RisingWave", "YugabyteDB", "KingbaseES", "Netezza", "PGlite"] },
    { label: "SQL Server family", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", items: ["SQL Server", "Azure SQL", "Azure Synapse", "SAP ASE (Sybase)", "Microsoft Fabric"] },
    { label: "SQLite family", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", items: ["SQLite", "libSQL (Turso)", "Cloudflare D1"] },
    { label: "Other relational", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", items: ["Oracle", "IBM DB2", "IBM i", "SAP HANA", "Teradata", "InterSystems IRIS", "Vertica", "Firebird", "Dameng", "Exasol", "H2", "Apache Derby", "Microsoft Access"] },
    { label: "Analytics / Warehouse", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", items: ["ClickHouse", "DuckDB", "MotherDuck", "DuckLake", "Snowflake", "BigQuery", "Databricks", "Trino", "Amazon Athena", "Apache Druid", "Apache Pinot", "Apache Hive", "Apache Impala"] },
    { label: "Document", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", items: ["MongoDB", "CouchDB", "Couchbase", "RavenDB", "Firebase Firestore", "Dataverse"] },
    { label: "Key-value / Cache", icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z", items: ["Redis", "Memcached", "Aerospike", "Amazon DynamoDB"] },
    { label: "Wide-column", icon: "M3.75 3v18m6-18v18m6-18v18M2.25 3.75h19.5", items: ["Cassandra", "ScyllaDB", "Google Spanner"] },
    { label: "Graph", icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z", items: ["Neo4j", "Memgraph", "TypeDB"] },
    { label: "Search", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z", items: ["Elasticsearch", "OpenSearch"] },
    { label: "Time-series", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", items: ["InfluxDB"] },
    { label: "Multi-model", icon: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3", items: ["SurrealDB"] },
    { label: "Vector", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z", items: ["Qdrant", "Milvus", "Pinecone", "Weaviate", "ChromaDB", "LanceDB"] },
    { label: "Streaming", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", items: ["Apache Kafka", "RabbitMQ"] },
    { label: "Files", icon: "M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6a2.25 2.25 0 012.25-2.25h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44h5.379a2.25 2.25 0 012.25 2.25v.776", items: ["CSV", "Excel", "Parquet", "Avro", "Apache Iceberg"] },
    { label: "SaaS", icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21", items: ["Salesforce"] },
];

const DB_COUNT = DB_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

export default function QuickDBPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QuickDB",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "IDE-grade universal database client available as a VS Code extension and standalone desktop app. Supports 85 database engines, visual query building, dashboards, and a built-in MCP server for AI agents.",
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
                    <div className="reveal-scale mb-6 rounded-3xl border border-line !bg-white p-2 shadow-[0_0_50px_-12px_var(--glow)] backdrop-blur-sm">
                        <img src="/images/quickdb-icon.png" alt="QuickDB Logo" className="h-32 w-32 rounded-2xl" />
                    </div>          
                    <span className="eyebrow reveal mb-5">VS Code Extension · Desktop App · MCP Server</span>
                    <h1 className="font-display reveal mb-5 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        <span className="text-gradient">QuickDB</span>
                    </h1>
                    <p className="reveal mb-5 max-w-3xl text-lg font-medium text-fg sm:text-2xl">
                        The Ultimate Database Management &amp; AI Integration Platform
                    </p>
                    <p className="reveal mb-10 max-w-2xl text-base text-muted sm:text-lg">
                        An IDE-grade universal database client — as a VS Code extension and a standalone
                        desktop app. {DB_COUNT} engines, a visual query builder, live dashboards, 255 chart
                        styles, and a built-in MCP server exposing 32 tools to 10 AI clients.
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

            {/* Sticky chapter navigation — replaces the old vertical sidebar TOC */}
            <DocChapterNav items={CHAPTERS} />

            {/* Overview + Install + Quick Start */}
            <div className="container relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <MarkdownDoc content={introContent} />
            </div>

            {/* Supported Databases — one categorized card, brand-logo chips */}
            <section className="container relative z-10 mx-auto scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14" id="supported-databases">
                <div className="reveal mb-10 text-center sm:mb-14">
                    <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Supported Databases</h2>
                    <p className="mt-3 text-base text-muted sm:text-lg">
                        <span className="font-semibold text-accent">{DB_COUNT}+ engines</span> across 16
                        families — relational, analytical, NoSQL, vector, streaming, files, and SaaS.
                    </p>
                </div>
                <div className="reveal-scale glass-card mx-auto max-w-5xl divide-y divide-[var(--line)] p-6 sm:p-8">
                    {DB_CATEGORIES.map((cat) => (
                        <div key={cat.label} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
                            <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-accent">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                                    </svg>
                                </span>
                                <h3 className="font-display text-sm font-bold text-fg">{cat.label}</h3>
                            </div>
                            <div className="flex flex-1 flex-wrap content-start gap-1.5">
                                {cat.items.map((db) => (
                                    <span key={db} className="chip">{db}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Walkthroughs — accordion instead of a long flat scroll */}
            <section className="container relative z-10 mx-auto max-w-3xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14" id="feature-walkthroughs">
                <div className="reveal mb-10 text-center sm:mb-12">
                    <span className="eyebrow mb-4">14 Walkthroughs</span>
                    <h2 className="font-display mt-4 text-2xl font-extrabold sm:text-3xl">Feature Walkthroughs</h2>
                    <p className="mt-3 text-base text-muted sm:text-lg">
                        Click any feature to expand its click-by-click steps.
                    </p>
                </div>
                <FeatureWalkthroughs />
            </section>

            {/* Showcase GIFs */}
            <section className="relative border-t border-line py-12 sm:py-20 md:py-28">
                <div className="container relative z-10 mx-auto max-w-6xl px-6">
                    <h2 className="font-display reveal mb-12 text-center text-3xl font-extrabold sm:mb-16 sm:text-5xl">
                        <span className="text-gradient">See It in Action</span>
                    </h2>
                    <div className="space-y-16 sm:space-y-24">
                        {[
                            { title: "Database Management & Imports", body: "Connect to your servers and import data seamlessly.", gif: "/gifs/quickdb/connect-server-import-database.gif" },
                            { title: "Visual Query Builder", body: "Build complex SQL queries visually — no code required.", gif: "/gifs/quickdb/query-builder.gif" },
                            { title: "Query Console", body: "Autocomplete, live linting, and instant results at scale.", gif: "/gifs/quickdb/queryconsole.gif" },
                            { title: "AI-Generated Charts via MCP", body: "Ask an AI assistant to visualize data — QuickDB's MCP server renders the chart.", gif: "/gifs/quickdb/use-mcp-to-make-chart.gif" },
                            { title: "MCP Setup Panel", body: "Pick clients and connections, then auto-configure Cursor, Claude Desktop, Windsurf, and 7 more.", gif: "/gifs/quickdb/mcp-quickdb.gif" },
                            { title: "Connect External AI Clients", body: "Paste the generated config once and restart your client — QuickDB tools appear immediately.", gif: "/gifs/quickdb/external-client-setup.gif" },
                        ].map((s) => (
                            <div key={s.title}>
                                <div className="reveal mx-auto mb-6 max-w-3xl text-center sm:mb-8">
                                    <h3 className="font-display mb-3 text-2xl font-bold leading-tight text-fg sm:text-3xl">{s.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted sm:text-lg">{s.body}</p>
                                </div>
                                <div className="reveal-scale overflow-hidden rounded-2xl border border-line shadow-[0_24px_60px_-30px_var(--glow)]">
                                    <img src={s.gif} alt={s.title} className="block w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Desktop App + Command Reference + Shortcuts + Settings + Security + Troubleshooting */}
            <div className="container relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <MarkdownDoc content={outroContent} />
            </div>

            {/* Footer */}
            <footer className="border-t border-line py-12 text-center text-faint">
                <p>QuickDB — Built by Nazmul Haque</p>
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
