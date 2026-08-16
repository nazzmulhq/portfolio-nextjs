"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import info from "../home/data";

export interface ICVProps {}

const themeConfig = {
    dark: {
        bg: "#0a0f1a",
        sidebarBg: "#0f172a",
        sidebarBorder: "#1e293b",
        textColorPrimary: "#f8fafc",
        textColorSecondary: "#94a3b8",
        textColorAccent: "#38bdf8",
        badgeBg: "#1e3a8a",
        badgeText: "#93c5fd",
        tagBg: "#1e293b",
        tagText: "#cbd5e1",
        cardBg: "#111c30",
        cardBorder: "#1e2e4a",
        imageBorder: "#334155",
        imageBg: "#020617",
        iconColor: "#e2e8f0",
        iconBg: "#1e293b",
        techTagBg: "#0b192e",
        techTagText: "#38bdf8",
        linkColor: "#38bdf8",
        strongColor: "#f1f5f9",
        sectionBorder: "#2563eb",
        sectionIcon: "#38bdf8",
        contactIcon: "#64748b",
        dateColor: "#64748b",
        internalText: "#64748b",
    },
    light: {
        bg: "#ffffff",
        sidebarBg: "#f1f5f9",
        sidebarBorder: "#cbd5e1",
        textColorPrimary: "#0f172a",
        textColorSecondary: "#334155",
        textColorAccent: "#0284c7",
        badgeBg: "#e0f2fe",
        badgeText: "#0369a1",
        tagBg: "#e2e8f0",
        tagText: "#0f172a",
        cardBg: "#f8fafc",
        cardBorder: "#cbd5e1",
        imageBorder: "#94a3b8",
        imageBg: "#e2e8f0",
        iconColor: "#0f172a",
        iconBg: "#cbd5e1",
        techTagBg: "#e0f2fe",
        techTagText: "#0369a1",
        linkColor: "#0284c7",
        strongColor: "#0f172a",
        sectionBorder: "#38bdf8",
        sectionIcon: "#0284c7",
        contactIcon: "#475569",
        dateColor: "#475569",
        internalText: "#475569",
    },
};

const CVViewer: FC<ICVProps> = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [zoom, setZoom] = useState<number>(1);
    const [isPrint, setIsPrint] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const colors = themeConfig[theme];
    const { me, skills, experience, education, works } = info;

    function calculateExperienceYears(exp: Array<{ date: string }>): string {
        const MONTHS: Record<string, number> = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const parseStartDate = (part: string): Date | null => {
            const trimmed = part.trim();
            if (trimmed === "Present") return null;
            const [monthStr, yearStr] = trimmed.split(/\s+/);
            const month = MONTHS[monthStr as keyof typeof MONTHS] ?? 0;
            const year = parseInt(yearStr || "0", 10);
            if (Number.isNaN(year)) return null;
            return new Date(year, month, 1);
        };
        let earliestStart: Date | null = null;
        for (const { date } of exp) {
            const clean = date.replace(/\s*\([^)]*\)/g, "").trim();
            const [rangeStart] = clean.split(/\s*-\s*/);
            if (!rangeStart) continue;
            const start = parseStartDate(rangeStart);
            if (start && (!earliestStart || start < earliestStart)) earliestStart = start;
        }
        if (!earliestStart) return "4+ years";
        const now = new Date();
        const totalMonths =
            (now.getFullYear() - earliestStart.getFullYear()) * 12 +
            (now.getMonth() - earliestStart.getMonth());
        const years = Math.max(0, Math.floor(totalMonths / 12));
        return `${years}+ years`;
    }

    const totalExperience = calculateExperienceYears(experience);

    // Auto-fit on small screens
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 24;
                const a4WidthPx = 794; // approx 210mm in px at 96dpi
                if (containerWidth < a4WidthPx) {
                    setZoom(Math.max(0.35, containerWidth / a4WidthPx));
                } else {
                    setZoom(1);
                }
            }
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: `Nazmul_Haque_CV_${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 0 !important; padding: 0 !important; }
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                text-rendering: optimizeLegibility !important;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                box-sizing: border-box !important;
            }
            body { background: ${colors.bg} !important; }
            #cv-print-sheet {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                overflow: hidden !important;
            }
        `,
        onBeforePrint: async () => {
            setIsPrint(true);
            await new Promise((r) => setTimeout(r, 200));
        },
        onAfterPrint: () => {
            setIsPrint(false);
        },
    });

    const handlePrint = () => {
        reactToPrintFn();
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen pb-20" ref={containerRef}>
            {/* ════════════ TOP CONTROLS TOOLBAR ════════════ */}
            <header className="sticky top-4 z-40 w-full max-w-5xl px-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-6 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-xl border border-line rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                    {/* Back button & Status */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg border border-line transition-all duration-200 hover:-translate-x-0.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Portfolio</span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-mono text-muted">A4 Document Viewer</span>
                        </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Theme Toggle */}
                        <div className="flex bg-[var(--surface-2)] rounded-lg p-0.5 border border-line">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                    theme === "dark"
                                        ? "bg-slate-800 text-sky-400 shadow-sm"
                                        : "text-muted hover:text-fg"
                                }`}
                                title="Dark Theme"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                <span className="hidden sm:inline">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                    theme === "light"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-muted hover:text-fg"
                                }`}
                                title="Light Theme"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="hidden sm:inline">Light</span>
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="hidden md:flex items-center bg-[var(--surface-2)] rounded-lg p-0.5 border border-line">
                            <button
                                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                                className="px-2 py-1 text-xs font-bold text-muted hover:text-fg rounded hover:bg-[var(--surface-3)]"
                                title="Zoom Out"
                            >
                                −
                            </button>
                            <span className="px-2 text-[11px] font-mono text-muted">{Math.round(zoom * 100)}%</span>
                            <button
                                onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                                className="px-2 py-1 text-xs font-bold text-muted hover:text-fg rounded hover:bg-[var(--surface-3)]"
                                title="Zoom In"
                            >
                                +
                            </button>
                            <button
                                onClick={() => setZoom(1)}
                                className="px-2 py-1 text-[11px] font-medium text-muted hover:text-fg rounded hover:bg-[var(--surface-3)] border-l border-line"
                                title="Reset Zoom"
                            >
                                100%
                            </button>
                        </div>

                        {/* Print / Save Button */}
                        <button
                            onClick={handlePrint}
                            disabled={isPrint}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer overflow-hidden"
                            title="Print / Save CV"
                        >
                            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"></div>
                            <svg className="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span className="relative z-10 tracking-wide">
                                {isPrint ? "Preparing..." : "Print / Save"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ════════════ LIVE A4 DOCUMENT CANVAS ════════════ */}
            <main
                className="w-full flex justify-center items-start overflow-hidden transition-all duration-300 px-2 sm:px-4"
            >
                <div
                    style={{
                        width: `${210 * zoom}mm`,
                        height: `${297 * zoom}mm`,
                        position: "relative",
                        overflow: "visible",
                    }}
                >
                    <div
                        style={{
                            width: "210mm",
                            height: "297mm",
                            transform: `scale(${zoom})`,
                            transformOrigin: "top left",
                            transition: "transform 0.2s ease-out",
                        }}
                    >
                        <section
                            id="cv-print-sheet"
                            ref={contentRef}
                            className="cv-sheet-container"
                        style={{
                            width: "210mm",
                            height: "297mm",
                            background: colors.bg,
                            color: colors.textColorPrimary,
                            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                            fontSize: "12px",
                            lineHeight: 1.45,
                            overflow: "hidden",
                            margin: 0,
                            padding: 0,
                            borderRadius: "12px",
                            boxShadow: theme === "dark" 
                                ? "0 25px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                                : "0 20px 60px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)",
                            WebkitFontSmoothing: "antialiased",
                            MozOsxFontSmoothing: "grayscale",
                            textRendering: "optimizeLegibility",
                            letterSpacing: "0.01em",
                        }}
                    >
                        {/* ══════════ TWO-COLUMN BODY ══════════ */}
                        <div style={{ display: "flex", height: "297mm" }}>

                            {/* ── LEFT SIDEBAR ── */}
                            <div
                                style={{
                                    width: "34%",
                                    background: colors.sidebarBg,
                                    padding: "18px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "13px",
                                    borderRight: `1px solid ${colors.sidebarBorder}`,
                                }}
                            >
                                {/* Profile */}
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            width: "95px",
                                            height: "95px",
                                            borderRadius: "14px",
                                            border: `2px solid ${colors.imageBorder}`,
                                            margin: "0 auto 8px",
                                            position: "relative",
                                            overflow: "hidden",
                                            background: colors.imageBg,
                                        }}
                                    >
                                        {/* Blurred ambient background */}
                                        <img
                                            alt=""
                                            src={me.image}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                filter: "blur(6px)",
                                                opacity: 0.4,
                                                transform: "scale(1.1)",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        {/* Sharp foreground portrait */}
                                        <img
                                            alt={me.name}
                                            src={me.image}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                position: "relative",
                                                zIndex: 10,
                                                display: "block",
                                            }}
                                        />
                                    </div>
                                    <h1
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: 800,
                                            color: colors.textColorPrimary,
                                            margin: "0 0 2px",
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {me.name}
                                    </h1>
                                    <p style={{ fontSize: "12.5px", color: colors.textColorSecondary, margin: 0, fontWeight: 500 }}>
                                        {me.title}
                                    </p>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            marginTop: "6px",
                                            background: colors.badgeBg,
                                            color: colors.badgeText,
                                            fontSize: "10.5px",
                                            fontWeight: 600,
                                            padding: "2px 10px",
                                            borderRadius: "999px",
                                            letterSpacing: "0.04em",
                                        }}
                                    >
                                        {totalExperience} Professional Experience
                                    </span>
                                </div>

                                {/* Contact */}
                                <div>
                                    <SectionTitle colors={colors} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                        Contact
                                    </SectionTitle>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4.5px", marginTop: "5px" }}>
                                        <ContactRow
                                            colors={colors}
                                            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            text={me.email}
                                            href={`mailto:${me.email}`}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            text={`Phone: ${me.phone}`}
                                            href={`tel:${me.phone}`}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            text={`WhatsApp: ${me.whatsapp}`}
                                            href={`https://wa.me/${me.whatsapp}`}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                            text={me.mysite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                            href={me.mysite}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            text="linkedin.com/in/nazzmulhq"
                                            href={me.linkedin}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            text="github.com/nazzmulhq"
                                            href={me.github}
                                        />
                                        <ContactRow
                                            colors={colors}
                                            icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            text="Dhaka, Bangladesh"
                                        />
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <SectionTitle colors={colors} icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                                        Technical Skills
                                    </SectionTitle>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "4px",
                                            marginTop: "5px",
                                        }}
                                    >
                                        {skills.map((skill, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: colors.tagBg,
                                                    padding: "3.5px 6px",
                                                    borderRadius: "4px",
                                                    fontSize: "10px",
                                                    textAlign: "center",
                                                    color: colors.tagText,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                <div>
                                    <SectionTitle colors={colors} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                                        Education
                                    </SectionTitle>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "5px" }}>
                                        {education.map((edu, i) => (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                    <h3 style={{ fontSize: "11px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                        {edu.for_pdf_degree}
                                                    </h3>
                                                    <span style={{ fontSize: "9px", color: colors.dateColor, whiteSpace: "nowrap", marginLeft: "4px" }}>
                                                        {edu.date}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "10px", color: colors.textColorSecondary, margin: "1px 0 0" }}>
                                                    {edu.for_pdf_title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Languages */}
                                <div>
                                    <SectionTitle colors={colors} icon="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129">
                                        Languages
                                    </SectionTitle>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4.5px", marginTop: "5px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "10px", color: colors.tagText, fontWeight: 500 }}>Bengali</span>
                                            <span style={{ fontSize: "9px", color: colors.textColorSecondary }}>Native</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "10px", color: colors.tagText, fontWeight: 500 }}>English</span>
                                            <span style={{ fontSize: "9px", color: colors.textColorSecondary }}>Conversational</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div>
                                    <SectionTitle colors={colors} icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                                        Interests
                                    </SectionTitle>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3.5px", marginTop: "5px" }}>
                                        {["Open Source", "DevOps", "System Design", "UI/UX", "Cloud", "Ollama", "Golang", "CI/CD", "Automation", "Performance"].map((item, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: "8.5px",
                                                    background: colors.tagBg,
                                                    color: colors.textColorSecondary,
                                                    padding: "2.5px 6px",
                                                    borderRadius: "4px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Links Footer in Sidebar */}
                                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "auto", paddingTop: "6px" }}>
                                    <a
                                        href={me.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: colors.iconBg }}
                                        title="GitHub Profile"
                                    >
                                        <svg viewBox="0 0 496 512" style={{ width: "13px", height: "13px", fill: colors.iconColor }}>
                                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                                        </svg>
                                    </a>
                                    <a
                                        href={me.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: colors.iconBg }}
                                        title="LinkedIn Profile"
                                    >
                                        <svg viewBox="0 0 448 512" style={{ width: "13px", height: "13px", fill: colors.iconColor }}>
                                            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.1v383.9C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32V64.1c0-17.6-14.4-32.1-32-32.1zM135.4 416H69V215.5h66.5V416zm-33.2-240c-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5 39.5 17.7 39.5 39.5-17.7 39.5-39.5 39.5zm282.6 240h-66.4V299c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V215.5h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.6 44.3 79.6 101.9V416z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* ── RIGHT MAIN CONTENT ── */}
                            <div
                                style={{
                                    flex: 1,
                                    padding: "13px 15px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px",
                                }}
                            >
                                {/* Professional Summary */}
                                <div>
                                    <SectionTitle colors={colors} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                        Professional Summary
                                    </SectionTitle>
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            color: colors.textColorSecondary,
                                            margin: "3px 0 0",
                                            lineHeight: 1.45,
                                        }}
                                    >
                                        Results-driven Senior Software Specialist with {totalExperience} of
                                        hands-on experience building enterprise-grade web applications. Specialized
                                        in full-stack development with Next.js, NestJS, and TypeScript ecosystems.
                                        Proven track record of architecting scalable ERP systems, establishing CI/CD
                                        pipelines, and leading frontend architecture standards across cross-functional teams.
                                    </p>
                                </div>

                                {/* Experience */}
                                <div>
                                    <SectionTitle colors={colors} icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                        Experience
                                    </SectionTitle>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5.5px", marginTop: "3.5px" }}>
                                        {experience.map((exp, i) => (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                    <h3 style={{ fontSize: "11px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                        {exp.title}
                                                    </h3>
                                                    <span
                                                        style={{
                                                            fontSize: "8.5px",
                                                            background: colors.tagBg,
                                                            color: colors.textColorSecondary,
                                                            padding: "1px 5px",
                                                            borderRadius: "3px",
                                                            whiteSpace: "nowrap",
                                                            fontWeight: 600,
                                                            marginLeft: "6px",
                                                        }}
                                                    >
                                                        {exp.date}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "8.5px", color: colors.textColorAccent, margin: "1px 0 0", fontStyle: "italic", fontWeight: 500 }}>
                                                    {exp.company}{exp.address ? ` — ${exp.address}` : ""}
                                                </p>
                                                <ul
                                                    style={{
                                                        margin: "2px 0 0",
                                                        paddingLeft: "11px",
                                                        listStyleType: "disc",
                                                    }}
                                                >
                                                    {exp.description.slice(0, 3).map((d, j) => (
                                                        <li
                                                            key={j}
                                                            style={{
                                                                fontSize: "9px",
                                                                color: colors.textColorSecondary,
                                                                lineHeight: 1.35,
                                                                marginBottom: "0px",
                                                            }}
                                                        >
                                                            {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {/* Tech tags */}
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "2.5px" }}>
                                                    {exp.technologies.slice(0, 6).map((t, j) => (
                                                        <span
                                                            key={j}
                                                            style={{
                                                                fontSize: "8px",
                                                                background: colors.techTagBg,
                                                                border: `1px solid ${colors.cardBorder}`,
                                                                color: colors.techTagText,
                                                                padding: "0.5px 4px",
                                                                borderRadius: "2px",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Projects */}
                                <div>
                                    <SectionTitle colors={colors} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                        Key Projects
                                    </SectionTitle>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginTop: "4px" }}>
                                        {works.slice(0, 4).map((work, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: colors.cardBg,
                                                    border: `1px solid ${colors.cardBorder}`,
                                                    borderRadius: "5px",
                                                    padding: "5px 6px",
                                                }}
                                            >
                                                <h3 style={{ fontSize: "10px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                    {work.title}
                                                </h3>
                                                <p style={{ fontSize: "8.5px", color: colors.textColorSecondary, margin: "2px 0 2.5px", lineHeight: 1.3 }}>
                                                    {work.description[0]}
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "2px" }}>
                                                    {work.technologies.slice(0, 4).map((t, j) => (
                                                        <span
                                                            key={j}
                                                            style={{
                                                                fontSize: "7.5px",
                                                                background: colors.techTagBg,
                                                                color: colors.techTagText,
                                                                padding: "0.5px 3px",
                                                                borderRadius: "2px",
                                                                border: `1px solid ${colors.cardBorder}`,
                                                            }}
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                                {work.link ? (
                                                    <a
                                                        href={work.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: "8px",
                                                            color: colors.linkColor,
                                                            textDecoration: "none",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "2px",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        View Project
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: "6.5px", height: "6.5px" }}>
                                                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: "8px", color: colors.internalText }}>Internal &amp; confidential</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Domain Expertise & Contributions */}
                                <div>
                                    <SectionTitle colors={colors} icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9">
                                        Domain Expertise & Contributions
                                    </SectionTitle>
                                    <div style={{ marginTop: "4px" }}>
                                        <p style={{ fontSize: "8.5px", color: colors.textColorSecondary, margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Enterprise ERP Systems &amp; Industry Domains
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "5px" }}>
                                            {[
                                                "Enterprise ERP",
                                                "e-Tender & Procurement",
                                                "Inventory & Warehouse",
                                                "Fleet Transportation",
                                                "Production Planning",
                                                "Manufacturing",
                                                "E-Commerce SaaS",
                                                "E-Learning (LMS)",
                                                "Agri-Tech & AI",
                                            ].map((domain, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: "8px",
                                                        background: colors.tagBg,
                                                        color: colors.textColorPrimary,
                                                        padding: "2px 6px",
                                                        borderRadius: "3px",
                                                        fontWeight: 500,
                                                        border: `1px solid ${colors.sidebarBorder}`,
                                                    }}
                                                >
                                                    {domain}
                                                </span>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: "8.5px", color: colors.textColorSecondary, margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Open Source Contributions
                                        </p>
                                        <ul style={{ margin: "0", paddingLeft: "11px", listStyleType: "disc" }}>
                                            <li style={{ fontSize: "8.5px", color: colors.textColorSecondary, lineHeight: 1.35, marginBottom: "1.5px" }}>
                                                <strong style={{ color: colors.strongColor }}>QuickDB</strong> — VS Code extension for multi-database management (MySQL, PostgreSQL, MongoDB, Redis, SQLite) with Query Builder, AI query generation & MCP server.
                                            </li>
                                            <li style={{ fontSize: "8.5px", color: colors.textColorSecondary, lineHeight: 1.35 }}>
                                                Published <strong style={{ color: colors.strongColor }}>3 npm packages</strong> — ESLint/Prettier configs, Quick UI Design scaffolding, Quick Dockerize CLI tool.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>
);
};

/* ── Reusable sub-components ── */

const SectionTitle: FC<{ icon: string; children: React.ReactNode; colors: any }> = ({
    icon,
    children,
    colors,
}) => (
    <h2
        style={{
            fontSize: "12.5px",
            fontWeight: 800,
            color: colors.textColorPrimary,
            margin: 0,
            paddingBottom: "3px",
            borderBottom: `2px solid ${colors.sectionBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
        }}
    >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "12px", height: "12px", flexShrink: 0, color: colors.sectionIcon }}
        >
            <path d={icon} />
        </svg>
        {children}
    </h2>
);

const ContactRow: FC<{ icon: string; text: string; href?: string; colors: any }> = ({
    icon,
    text,
    href,
    colors,
}) => {
    const content = (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "10px",
                color: href ? colors.linkColor : colors.tagText,
            }}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "10px", height: "10px", flexShrink: 0, color: colors.contactIcon }}
            >
                <path d={icon} />
            </svg>
            <span style={{ wordBreak: "break-all" }}>{text}</span>
        </div>
    );
    return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            {content}
        </a>
    ) : (
        content
    );
};

export default CVViewer;
