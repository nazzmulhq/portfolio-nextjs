"use client";

import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "../doc/mdSlug";

interface PlanMarkdownRendererProps {
    content: string;
    searchQuery?: string;
}

// Flatten React children to a plain string
const extractText = (node: React.ReactNode): string => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (typeof node === "object" && "props" in node && (node as any).props?.children) {
        return extractText((node as any).props.children);
    }
    return "";
};

// Helper for highlighting text matches
const renderWithHighlight = (text: string, query?: string) => {
    if (!query || !query.trim() || !text) return text;
    const cleanQuery = query.trim().toLowerCase();
    const parts = text.split(new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    
    return parts.map((part, i) =>
        part.toLowerCase() === cleanQuery ? (
            <mark
                key={i}
                className="rounded bg-yellow-400/30 px-1 py-0.5 text-[var(--fg)] font-semibold dark:bg-yellow-500/30 ring-1 ring-yellow-400/50"
            >
                {part}
            </mark>
        ) : (
            part
        )
    );
};

// Copy button component for headings and code blocks
function CopyLinkButton({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window !== "undefined") {
            const url = `${window.location.pathname}#${id}`;
            navigator.clipboard.writeText(`${window.location.origin}${url}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            type="button"
            aria-label="Copy anchor link"
            title="Copy anchor link"
            className="ml-2 inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted hover:text-accent"
        >
            {copied ? (
                <span className="text-xs text-accent font-mono font-normal">Link copied!</span>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                </svg>
            )}
        </button>
    );
}

// Specialized Code Block Component
function CustomCodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);
    const [wrapText, setWrapText] = useState(false);

    const isAsciiDiagram =
        language === "text" ||
        code.includes("│") ||
        code.includes("├") ||
        code.includes("┌") ||
        code.includes("─") ||
        code.includes("▼") ||
        code.includes("──");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    const displayCode = code ? code.replace(/\n$/, "") : "";
    const lines = displayCode.split("\n");

    return (
        <div className="group my-6 overflow-hidden rounded-2xl border border-line bg-[var(--surface-2)] shadow-[0_16px_48px_-24px_var(--shadow)] transition-all duration-300 hover:border-line-strong">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-[color-mix(in_srgb,var(--surface)_75%,transparent)] px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/40 transition-colors group-hover:bg-[#ef4444]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]/40 transition-colors group-hover:bg-[#eab308]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/40 transition-colors group-hover:bg-[#22c55e]" />
                    </div>

                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                        {isAsciiDiagram ? "Architecture Blueprint / Flow" : language || "text"}
                    </span>

                    {isAsciiDiagram && (
                        <span className="rounded-md border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-accent">
                            DIAGRAM
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Wrap Toggle for long lines */}
                    <button
                        onClick={() => setWrapText(!wrapText)}
                        type="button"
                        className="rounded-lg border border-line bg-[var(--surface)] px-2.5 py-1 text-xs text-muted hover:text-fg hover:border-line-strong transition-all"
                        title={wrapText ? "Disable wrap" : "Enable wrap"}
                    >
                        {wrapText ? "Scroll" : "Wrap"}
                    </button>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        type="button"
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                            copied
                                ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-accent shadow-[0_0_12px_-2px_var(--glow)]"
                                : "border-line bg-[var(--surface)] text-muted hover:text-fg hover:border-line-strong"
                        }`}
                    >
                        {copied ? (
                            <>
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div
                className={`overflow-x-auto bg-[color-mix(in_srgb,var(--canvas)_60%,transparent)] p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed text-fg select-text ${
                    wrapText ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                }`}
            >
                <code className="block min-w-full font-mono">
                    {lines.map((line, i) => (
                        <div
                            key={i}
                            className="-mx-4 sm:-mx-5 flex px-4 sm:px-5 transition-colors duration-150 hover:bg-[var(--surface)]/80"
                        >
                            {!isAsciiDiagram && (
                                <span className="mr-4 inline-block w-8 shrink-0 select-none border-r border-line pr-3 text-right font-sans text-xs text-faint">
                                    {i + 1}
                                </span>
                            )}
                            <span className="flex-1 font-mono text-fg/90">{line || " "}</span>
                        </div>
                    ))}
                </code>
            </div>
        </div>
    );
}

// Blockquote / Alert Callout parser
function CustomBlockquote({ children }: { children: React.ReactNode }) {
    const raw = extractText(children);
    let type = "note";
    let alertTitle = "NOTE";

    if (raw.includes("[!NOTE]")) {
        type = "note";
        alertTitle = "NOTE";
    } else if (raw.includes("[!TIP]")) {
        type = "tip";
        alertTitle = "PRO TIP";
    } else if (raw.includes("[!IMPORTANT]")) {
        type = "important";
        alertTitle = "IMPORTANT";
    } else if (raw.includes("[!WARNING]")) {
        type = "warning";
        alertTitle = "WARNING";
    } else if (raw.includes("[!CAUTION]")) {
        type = "caution";
        alertTitle = "CAUTION";
    }

    const typeStyles: Record<string, { border: string; bg: string; iconColor: string; title: string }> = {
        note: {
            border: "border-blue-500/40",
            bg: "bg-blue-500/5",
            iconColor: "text-blue-400",
            title: alertTitle,
        },
        tip: {
            border: "border-emerald-500/40",
            bg: "bg-emerald-500/5",
            iconColor: "text-emerald-400",
            title: alertTitle,
        },
        important: {
            border: "border-purple-500/40",
            bg: "bg-purple-500/5",
            iconColor: "text-purple-400",
            title: alertTitle,
        },
        warning: {
            border: "border-amber-500/40",
            bg: "bg-amber-500/5",
            iconColor: "text-amber-400",
            title: alertTitle,
        },
        caution: {
            border: "border-rose-500/40",
            bg: "bg-rose-500/5",
            iconColor: "text-rose-400",
            title: alertTitle,
        },
    };

    const style = typeStyles[type] || typeStyles.note;

    return (
        <div
            className={`my-6 rounded-2xl border-l-4 ${style.border} ${style.bg} p-5 backdrop-blur-sm shadow-sm`}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono text-xs font-bold tracking-wider ${style.iconColor}`}>
                    {style.title}
                </span>
            </div>
            <div className="text-sm leading-relaxed text-muted prose-p:my-1">{children}</div>
        </div>
    );
}

export default function PlanMarkdownRenderer({ content, searchQuery }: PlanMarkdownRendererProps) {
    const components = useMemo(() => {
        return {
            h1: ({ children }: any) => {
                const text = extractText(children);
                const id = slugify(text);
                return (
                    <div className="group relative scroll-mt-28 mb-8 mt-14 first:mt-4">
                        <div className="flex items-center gap-2">
                            <span className="h-8 w-2 rounded-full bg-[linear-gradient(to_bottom,var(--accent),var(--accent-2))] shadow-[0_0_16px_var(--glow)]" />
                            <h1 id={id} className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-fg">
                                {renderWithHighlight(text, searchQuery)}
                            </h1>
                            <CopyLinkButton id={id} />
                        </div>
                        <div className="mt-3 h-px w-full bg-[linear-gradient(to_right,var(--line-strong),transparent)]" />
                    </div>
                );
            },
            h2: ({ children }: any) => {
                const text = extractText(children);
                const id = slugify(text);
                return (
                    <div className="group relative scroll-mt-28 mb-6 mt-12 border-t border-line pt-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-3)] border border-line text-xs font-bold text-accent">
                                §
                            </span>
                            <h2 id={id} className="font-display text-xl sm:text-2xl font-bold tracking-tight text-fg">
                                {renderWithHighlight(text, searchQuery)}
                            </h2>
                            <CopyLinkButton id={id} />
                        </div>
                    </div>
                );
            },
            h3: ({ children }: any) => {
                const text = extractText(children);
                const id = slugify(text);
                return (
                    <div className="group relative scroll-mt-24 mb-4 mt-8">
                        <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                            <h3 id={id} className="font-display text-lg sm:text-xl font-bold text-fg">
                                {renderWithHighlight(text, searchQuery)}
                            </h3>
                            <CopyLinkButton id={id} />
                        </div>
                    </div>
                );
            },
            h4: ({ children }: any) => {
                const text = extractText(children);
                const id = slugify(text);
                return (
                    <h4 id={id} className="scroll-mt-24 mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-accent">
                        {renderWithHighlight(text, searchQuery)}
                    </h4>
                );
            },
            p: ({ children }: any) => (
                <p className="my-4 text-sm sm:text-base leading-relaxed text-muted">{children}</p>
            ),
            a: ({ href, children }: any) => {
                const external = href?.startsWith("http");
                return (
                    <a
                        href={href}
                        className="font-medium text-accent underline-offset-4 hover:underline transition-all"
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                        {children}
                    </a>
                );
            },
            ul: ({ children }: any) => (
                <ul className="my-4 list-none space-y-2 pl-2 sm:pl-4">{children}</ul>
            ),
            ol: ({ children }: any) => (
                <ol className="my-4 list-decimal space-y-2 pl-5 marker:font-mono marker:font-bold marker:text-accent">
                    {children}
                </ol>
            ),
            li: ({ children }: any) => (
                <li className="relative pl-5 text-sm sm:text-base leading-relaxed text-muted before:absolute before:left-0 before:top-2.5 before:h-1.5 before:before:w-1.5 before:rounded-full before:bg-[var(--accent)]">
                    {children}
                </li>
            ),
            strong: ({ children }: any) => <strong className="font-bold text-fg">{children}</strong>,
            em: ({ children }: any) => <em className="italic text-fg/90">{children}</em>,
            hr: () => <hr className="my-10 border-line" />,
            blockquote: ({ children }: any) => <CustomBlockquote>{children}</CustomBlockquote>,
            table: ({ children }: any) => (
                <div className="my-8 w-full overflow-hidden rounded-2xl border border-line bg-[var(--surface-2)] shadow-[0_12px_40px_-20px_var(--shadow)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse text-left text-xs sm:text-sm">
                            {children}
                        </table>
                    </div>
                </div>
            ),
            thead: ({ children }: any) => (
                <thead className="border-b border-line bg-[color-mix(in_srgb,var(--surface-3)_70%,transparent)]">
                    {children}
                </thead>
            ),
            tr: ({ children }: any) => (
                <tr className="border-b border-line/60 last:border-0 transition-colors hover:bg-[var(--surface)]/80">
                    {children}
                </tr>
            ),
            th: ({ children }: any) => (
                <th className="p-3.5 font-mono text-xs font-bold uppercase tracking-wider text-fg">
                    {children}
                </th>
            ),
            td: ({ children }: any) => (
                <td className="p-3.5 align-top text-muted font-sans leading-relaxed">
                    {children}
                </td>
            ),
            pre: ({ children }: any) => {
                const codeEl = Array.isArray(children) ? children[0] : children;
                const className = codeEl?.props?.className || "";
                const lang = /language-(\w+)/.exec(className)?.[1] || "";
                const raw = extractText(codeEl?.props?.children);
                return <CustomCodeBlock code={raw} language={lang} />;
            },
            code: ({ children }: any) => (
                <code className="rounded-md border border-line bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-accent">
                    {children}
                </code>
            ),
        };
    }, [searchQuery]);

    return (
        <div className="font-sans implementation-plan-prose text-fg">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
