"use client";

import { useState } from "react";

const FEATURES = [
    {
        title: "Connections",
        icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
        steps: [
            "Click + in the sidebar or run QuickDB: Add Connection.",
            "Pick an engine (search the grid). The form adapts — file path for SQLite/DuckDB, host/port for servers, account id for Snowflake, etc.",
            "Optional: paste a mysql://, postgres://, mongodb:// or redis:// URL and the fields auto-fill.",
            "Optional: enable SSL/TLS, or an SSH tunnel — enter the bastion host/port/user plus a password or private-key path, and QuickDB forwards a local port through it.",
            "Optional: set a color (e.g. red for production) and choose whether the connection is exposed to AI clients via MCP.",
            "Click Test connection → Create.",
        ],
        note: "Edit / remove — hover a connection for inline ✎ / 🗑, or right-click for the full menu.",
    },
    {
        title: "Schema Explorer",
        icon: "M9 3.75H6.912a2.25 2.25 0 00-2.15 1.586l-1.32 4.66a2.25 2.25 0 00-.083.62v6.134c0 1.243 1.007 2.25 2.25 2.25h13.5c1.243 0 2.25-1.007 2.25-2.25v-6.134a2.25 2.25 0 00-.083-.62l-1.32-4.66a2.25 2.25 0 00-2.15-1.586H15",
        steps: [
            "Expand a connection to see databases (multi-db engines) or tables directly.",
            "Expand a table to see its columns with type icons.",
            "Hover actions per connection: New Query · Query Builder · ERD · Create Table/Database · Export · Import · Edit · Remove.",
            "Use Find table, or Speed Search (Ctrl/Cmd+F) to filter the whole tree — Esc clears it.",
            "Click any table to open the Table Viewer.",
        ],
    },
    {
        title: "Query Console",
        icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
        steps: [
            "Open via New Query on a connection, right-click → New SQL Query, or QuickDB: New SQL Query.",
            "Write with autocomplete (tables after FROM, columns after WHERE, dialect-aware keywords, auto-aliasing, smart JOIN with ready-made ON conditions), live linting with one-click fixes, Ctrl/Cmd+Click to go to a definition, F2 to rename an alias, and Format to reflow SQL.",
            "Run with Ctrl/Cmd+Enter (statement under caret), Run all, or Stop to cancel server-side.",
            "Explain shows the query plan; Profile opens the visual plan tree. Read-only blocks non-SELECT statements; auto-commit off enables manual Commit/Rollback.",
            "Results stream into a virtualized grid (smooth at 100k+ rows) — filter, sort, expand cells, Export to CSV/JSON, or send to Visualize.",
            "Multi-tab console, History (Ctrl/Cmd+Alt+E), Saved queries, templates, and AI actions (Ask AI / Explain / Optimize / Fix).",
        ],
    },
    {
        title: "Query Builder",
        icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.297 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7.48 7.48 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z",
        steps: [
            "Hover a connection → Query Builder (or QuickDB: Open Query Builder).",
            "Add tables to the canvas; pick columns, filters, joins, grouping, and ordering.",
            "Watch the live SQL preview — validated against the real schema as you build.",
            "Run in place, or Open in Console to keep iterating in a query tab.",
        ],
    },
    {
        title: "Table Viewer & Editing",
        icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
        steps: [
            "Click a table in the sidebar — the panel opens instantly with a progress indicator, then streams data (a 30s cache makes reopening instant).",
            "Edit inline: change cells, add rows, delete rows.",
            "Preview DML shows the exact SQL before you Save.",
            "Undo/redo, bulk fill, and paste from a spreadsheet.",
            "Navigate foreign keys — jump to referenced rows, or list every row that references one.",
            "Switch views: table grid · single record · transpose · tree · text.",
            "Cell helpers: Ctrl/Cmd+Alt+N → NULL, Ctrl/Cmd+Alt+D → DEFAULT, Ctrl/Cmd+Alt+Z → revert, Ctrl/Cmd+G → go to row.",
        ],
    },
    {
        title: "Data Visualization",
        icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
        steps: [
            "Run a query, then click Visualize (or QuickDB: Open Visualization).",
            "Pick a chart style from the searchable dropdown — 255 styles with image thumbnails (column, line, pie, heatmap, sankey, word cloud, graphs, and more).",
            "Map fields (X / Y / color / series / size) and choose an aggregation — sum, count, avg, min, max.",
            "Style & Options adds ~29 guided controls (legend, labels, colors, gridlines, radius…) with a live-updating preview.",
            "Export to PNG / SVG, or save the chart to your library.",
        ],
    },
    {
        title: "Dashboards",
        icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
        steps: [
            "Run QuickDB: Dashboards → New dashboard.",
            "Add widgets: + Chart, + Table, or + Card (KPI) — each with its own SQL query and connection.",
            "Arrange each widget's width (¼ … full) and height, and drag by the handle to reorder on the 12-column grid.",
            "Make it live — set a per-widget or whole-board auto-refresh interval.",
            "Save. Reopening a dashboard re-runs every widget against the live database.",
            "Toggle Report view for a clean display, or Edit to change it — dashboards list with widget counts and reopen to the exact saved layout.",
        ],
    },
    {
        title: "ERD",
        icon: "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25z",
        steps: [
            "Run QuickDB: Open ERD Diagram (or use the ERD hover action on a connection).",
            "QuickDB lays out your tables with columns — PK/FK badges — and foreign-key edges automatically, no manual arranging.",
        ],
    },
    {
        title: "Compare & Move Data",
        icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
        steps: [
            "Data Compare (QuickDB: Compare Data) — pick two tables + key columns to see added / removed / changed rows.",
            "Schema Compare (QuickDB: Compare Schema) — diff two schemas, generate migration DDL, then Apply Migration to run it after confirmation.",
            "Seed Data (QuickDB: Generate Seed Data) — realistic sample rows for a table.",
            "Import / Export — database and table level, with SQL-dump import progress.",
        ],
    },
    {
        title: "Performance & Health",
        icon: "M3 13.5l5.599-5.599c.376-.376.985-.376 1.36 0l3.084 3.084c.376.376.985.376 1.36 0L21 3.75M3 13.5v6.75h6.75M3 13.5L9.75 6.75",
        steps: [
            "Query Profiler — EXPLAIN / ANALYZE with a visual plan tree (PostgreSQL).",
            "Database Health — size, sessions, cache hit rates, table bloat.",
            "Data Profile — per-column null %, distinct counts, min/max.",
            "Index Analysis — unused, duplicate, and missing indexes.",
            "Server Monitor — live sessions, with the ability to kill a running query.",
        ],
    },
    {
        title: "Design & Generate",
        icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
        steps: [
            "Code Generator — model / DAO / ORM code straight from a table.",
            "Schema Docs — full Markdown documentation of a database, with optional row counts.",
            "Migration Generator — a migration script derived from the live schema.",
        ],
    },
    {
        title: "Security & Admin",
        icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
        steps: [
            "Users & Privileges lists users/roles and their grants.",
            "Create/drop users, and grant/revoke privileges — every write shows the exact SQL before you confirm it.",
            "RLS policies are surfaced where the engine supports them.",
        ],
    },
    {
        title: "AI Features",
        icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
        steps: [
            "Open AI Settings (QuickDB: AI Settings) — choose a provider: the editor's built-in model (no key), Ollama (local/private — default on desktop), or a cloud provider. Pick a model (live list from Ollama) and test reachability.",
            "AI SQL Assistant — natural language → SQL with schema context, plus Explain / Optimize / Fix / Document. \"Open in Console\" runs the result.",
            "AI Chat — schema-aware chat that can run suggested SQL (writes confirm first).",
            "AI Advisor — index & performance advice for a table.",
            "AI Data Quality — a quality report plus fix statements for a table.",
        ],
        note: "Not configured yet? Every AI panel shows a hint with an Open AI Settings button instead of failing.",
    },
    {
        title: "MCP — Connect AI Agents",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        steps: [
            "Run QuickDB: Auto-Configure MCP for Detected Clients (or open the MCP Setup tab).",
            "Pick which of the 10 clients to configure: Cursor, Claude Desktop, Claude Code, Antigravity, VS Code, Windsurf, Continue, Cline, Roo Code, Kiro.",
            "Use the per-client checkboxes to choose exactly which connections each client can see.",
            "Click Setup — QuickDB writes the correct config for that client's JSON shape, backs up the previous file, and encrypts embedded credentials.",
        ],
        note: "Browse every tool in the MCP Tools panel. Mutating tools are gated behind an approval confirmer (default-deny in stdio).",
    },
];

const AccordionItem = ({ feature, index, open, onToggle }) => (
    <div className="group glass-card overflow-hidden">
        <button
            aria-expanded={open}
            className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
            onClick={() => onToggle(index)}
            type="button"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-accent">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                </svg>
            </span>
            <span className="flex-1">
                <span className="font-mono text-xs text-faint">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-base font-bold text-fg sm:text-lg">{feature.title}</h3>
            </span>
            <svg
                className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180 text-accent" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        {/* CSS grid-rows trick: animates to auto height without JS measurement */}
        <div
            className="grid transition-[grid-template-rows] duration-400 ease-in-out"
            style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
            <div className="overflow-hidden">
                <div className="space-y-3 px-5 pb-6 pl-[4.5rem] sm:px-6 sm:pl-[4.75rem]">
                    <ol className="space-y-2.5">
                        {feature.steps.map((step, i) => (
                            <li className="flex items-start gap-2.5 text-sm leading-relaxed text-muted" key={i}>
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)] text-[10px] font-bold text-accent">
                                    {i + 1}
                                </span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                    {feature.note && (
                        <p className="rounded-lg border border-line bg-[var(--surface-2)] px-3 py-2 text-xs leading-relaxed text-faint">
                            {feature.note}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default function FeatureWalkthroughs() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="space-y-3" data-stagger>
            {FEATURES.map((feature, i) => (
                <AccordionItem
                    feature={feature}
                    index={i}
                    key={feature.title}
                    onToggle={(idx) => setOpenIndex((prev) => (prev === idx ? -1 : idx))}
                    open={openIndex === i}
                />
            ))}
        </div>
    );
}
