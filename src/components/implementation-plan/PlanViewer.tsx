"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { TocItem } from "./types";
import PlanMarkdownRenderer from "./PlanMarkdownRenderer";

interface PlanViewerProps {
    markdownContent: string;
    toc: TocItem[];
    filename?: string;
}

export default function PlanViewer({
    markdownContent,
    toc,
    filename = "Implementation_Plan_v2.md",
}: PlanViewerProps) {
    // Layout & View Controls
    const [tocSearch, setTocSearch] = useState<string>("");
    const [isTocOpen, setIsTocOpen] = useState<boolean>(true); // desktop sidebar
    const [isTocMobileOpen, setIsTocMobileOpen] = useState<boolean>(false); // mobile drawer
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Navigation & Reading Progress
    const [activeTocId, setActiveTocId] = useState<string>(toc[0]?.id || "");
    const [readingProgress, setReadingProgress] = useState<number>(0);
    const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
    const [copyDocFeedback, setCopyDocFeedback] = useState<boolean>(false);

    const mainContainerRef = useRef<HTMLDivElement>(null);
    const tocListRef = useRef<HTMLDivElement>(null);

    // Track scroll position for ScrollSpy and Progress
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollPos / totalHeight) * 100)) : 0;
            setReadingProgress(progress);
            setShowBackToTop(scrollPos > 350);

            // Active section detection
            const headingIds = toc.map((item) => item.id);
            let current = headingIds[0] || "";
            for (const id of headingIds) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 140) {
                        current = id;
                    }
                }
            }
            if (current) {
                setActiveTocId(current);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [toc]);

    // Keep active TOC item in view inside the fixed sidebar
    useEffect(() => {
        if (!activeTocId || !tocListRef.current) return;
        const activeLink = tocListRef.current.querySelector<HTMLElement>(`[data-toc-id="${activeTocId}"]`);
        if (activeLink) {
            const container = tocListRef.current;
            const containerTop = container.scrollTop;
            const containerBottom = containerTop + container.clientHeight;
            const linkTop = activeLink.offsetTop;
            const linkBottom = linkTop + activeLink.clientHeight;

            if (linkTop < containerTop || linkBottom > containerBottom) {
                activeLink.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [activeTocId]);

    // Track full screen change
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Filtered TOC based on search
    const filteredToc = useMemo(() => {
        if (!tocSearch.trim()) return toc;
        const q = tocSearch.toLowerCase();
        return toc.filter((item) => item.title.toLowerCase().includes(q));
    }, [toc, tocSearch]);

    // Handle TOC Item click
    const handleTocClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setActiveTocId(id);
        setIsTocMobileOpen(false);

        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    // Copy full raw markdown
    const handleCopyFullMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(markdownContent);
            setCopyDocFeedback(true);
            setTimeout(() => setCopyDocFeedback(false), 2500);
        } catch {
            /* ignore */
        }
    };

    // Download markdown file
    const handleDownloadMarkdown = () => {
        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full bg-[var(--canvas)] text-[var(--fg)] selection:bg-[var(--accent)]/30 selection:text-fg font-sans">
            {/* Top Reading Progress Line */}
            <div
                className="fixed top-0 left-0 z-50 h-1 bg-[linear-gradient(to_right,var(--accent),var(--accent-2))] transition-all duration-150 shadow-[0_0_12px_var(--glow)]"
                style={{ width: `${readingProgress}%` }}
            />

            {/* ══════════════════════════════════════════════════════════
                FULL-WIDTH STICKY HEADER
               ══════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-40 w-full border-b border-line bg-[color-mix(in_srgb,var(--canvas)_90%,transparent)] backdrop-blur-2xl transition-all">
                <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:px-8">
                    {/* Left: Home link & Document Title */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <Link
                            href="/"
                            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-[var(--surface)] text-muted hover:text-fg hover:border-[var(--accent)]/40 transition-all shadow-sm"
                            title="Return to Home"
                        >
                            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate font-display text-xs sm:text-sm md:text-base font-bold text-fg">
                                User Auth & Authorization Architecture
                            </h1>
                        </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Toggle Fixed TOC Sidebar on Desktop (xl and above) */}
                        <button
                            onClick={() => setIsTocOpen(!isTocOpen)}
                            type="button"
                            className={`hidden xl:flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all ${
                                isTocOpen
                                    ? "border-[var(--accent)]/40 bg-[var(--surface-2)] text-accent"
                                    : "border-line bg-[var(--surface)] text-muted hover:text-fg"
                            }`}
                            title={isTocOpen ? "Hide Fixed Contents Sidebar" : "Show Fixed Contents Sidebar"}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <span>Contents</span>
                        </button>

                        {/* Tablet & Mobile TOC Drawer Trigger (up to 1024px) */}
                        <button
                            onClick={() => setIsTocMobileOpen(true)}
                            type="button"
                            className="xl:hidden flex h-9 items-center gap-1.5 rounded-xl border border-line bg-[var(--surface)] px-3 text-xs font-semibold text-muted hover:text-fg"
                            title="Contents"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <span>Contents</span>
                        </button>

                        {/* Copy Markdown */}
                        <button
                            onClick={handleCopyFullMarkdown}
                            type="button"
                            className={`hidden md:flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all ${
                                copyDocFeedback
                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                    : "border-line bg-[var(--surface)] text-muted hover:text-fg"
                            }`}
                            title="Copy entire Markdown text"
                        >
                            {copyDocFeedback ? (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    <span>Copy</span>
                                </>
                            )}
                        </button>

                        {/* Download .md */}
                        <button
                            onClick={handleDownloadMarkdown}
                            type="button"
                            className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-line bg-[var(--surface)] px-3 text-xs font-semibold text-muted hover:text-fg hover:border-line-strong transition-all"
                            title="Download .md file"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden md:inline">Download</span>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            type="button"
                            className="hidden sm:flex h-9 items-center justify-center rounded-xl border border-line bg-[var(--surface)] px-2.5 text-xs text-muted hover:text-fg transition-all"
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isFullscreen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                )}
                            </svg>
                        </button>

                        {/* Theme Toggle */}
                        <div className="scale-90">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════
                FIXED CONTENTS SIDEBAR (XL DESKTOP ONLY - NEVER ON 1024PX/TABLETS)
               ══════════════════════════════════════════════════════════ */}
            {isTocOpen && (
                <aside
                    aria-label="Table of contents"
                    className="hidden xl:block fixed left-6 xl:left-8 top-20 bottom-6 w-80 z-30 pointer-events-auto transition-all duration-200"
                >
                    <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl border border-line bg-[var(--surface)] p-4 shadow-xl backdrop-blur-xl">
                        {/* Fixed Sidebar Header */}
                        <div className="mb-3 flex items-center justify-between pb-2 border-b border-line shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-fg">
                                    Contents
                                </h3>
                            </div>
                        </div>

                        {/* Fixed TOC Filter Input */}
                        <div className="mb-3 shrink-0">
                            <input
                                type="text"
                                value={tocSearch}
                                onChange={(e) => setTocSearch(e.target.value)}
                                placeholder="Filter sections..."
                                className="w-full rounded-lg border border-line bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Scrollable TOC Tree list */}
                        <div
                            ref={tocListRef}
                            className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
                        >
                            {filteredToc.map((item, idx) => (
                                <a
                                    key={item.id || idx}
                                    data-toc-id={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => handleTocClick(e, item.id)}
                                    style={{
                                        paddingLeft: `${Math.max(6, (item.level - 1) * 10 + 6)}px`,
                                    }}
                                    className={`group flex items-center gap-2 rounded-lg py-1.5 pr-2 text-xs transition-all duration-150 ${
                                        activeTocId === item.id
                                            ? "bg-[var(--accent-soft)] font-bold text-accent border-l-2 border-accent shadow-xs"
                                            : "text-muted hover:bg-[var(--surface-2)] hover:text-fg"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                                            activeTocId === item.id
                                                ? "bg-[var(--accent)]"
                                                : item.level === 1
                                                ? "bg-accent/60"
                                                : "bg-muted/40"
                                        }`}
                                    />
                                    <span className="truncate">{item.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </aside>
            )}

            {/* ══════════════════════════════════════════════════════════
                MAIN SCROLLABLE CONTENT (FULL WIDTH ON 1024PX/TABLET, OFFSET ON XL)
               ══════════════════════════════════════════════════════════ */}
            <div
                className={`w-full transition-all duration-200 ${
                    isTocOpen ? "xl:pl-[344px]" : "pl-0"
                }`}
            >
                {/* Main Article */}
                <main
                    ref={mainContainerRef}
                    className="w-full px-2.5 py-4 sm:px-6 sm:py-6 lg:px-8"
                >
                    <article className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-[var(--surface)] p-3.5 sm:p-7 md:p-10 lg:p-12 shadow-sm">
                        <PlanMarkdownRenderer content={markdownContent} />
                    </article>
                </main>
            </div>

            {/* ══════════════════════════════════════════════════════════
                MOBILE TOC DRAWER
               ══════════════════════════════════════════════════════════ */}
            {isTocMobileOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        onClick={() => setIsTocMobileOpen(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                    />

                    <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-[var(--surface)] p-6 shadow-2xl border-l border-line">
                        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                                <h3 className="font-display text-base font-bold text-fg">Contents</h3>
                            </div>
                            <button
                                onClick={() => setIsTocMobileOpen(false)}
                                type="button"
                                className="rounded-xl p-1.5 text-muted hover:text-fg hover:bg-[var(--surface-2)]"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search in TOC */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={tocSearch}
                                onChange={(e) => setTocSearch(e.target.value)}
                                placeholder="Filter sections..."
                                className="w-full rounded-xl border border-line bg-[var(--surface-2)] px-3 py-2 text-xs text-fg focus:border-accent focus:outline-none"
                            />
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                            {filteredToc.map((item, idx) => (
                                <a
                                    key={item.id || idx}
                                    href={`#${item.id}`}
                                    onClick={(e) => handleTocClick(e, item.id)}
                                    style={{
                                        paddingLeft: `${Math.max(8, (item.level - 1) * 12 + 8)}px`,
                                    }}
                                    className={`flex items-center gap-2 rounded-lg py-2 pr-2 text-xs transition-all ${
                                        activeTocId === item.id
                                            ? "bg-[var(--accent-soft)] font-bold text-accent"
                                            : "text-muted hover:text-fg hover:bg-[var(--surface-2)]"
                                    }`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                FLOATING BACK TO TOP BUTTON
               ══════════════════════════════════════════════════════════ */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    type="button"
                    aria-label="Back to top"
                    className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-[var(--surface-2)]/90 text-fg shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-accent hover:text-accent active:scale-95"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}
        </div>
    );
}
