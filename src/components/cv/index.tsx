"use client";

import { FC, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import info from "../home/data";

export interface ICV {
    children?: React.ReactNode;
}

const themeConfig = {
    dark: {
        bg: "#0a0f1a",
        sidebarBg: "#111827",
        sidebarBorder: "#1e293b",
        textColorPrimary: "#f1f5f9",
        textColorSecondary: "#94a3b8",
        textColorAccent: "#dbeafe",
        badgeBg: "#1e40af",
        badgeText: "#dbeafe",
        tagBg: "#1e293b",
        tagText: "#cbd5e1",
        cardBg: "#111827",
        cardBorder: "#1e293b",
        imageBorder: "#334155",
        imageBg: "#020617",
        iconColor: "#e2e8f0",
        iconBg: "#1e293b",
        techTagBg: "#0f172a",
        techTagText: "#7dd3fc",
        linkColor: "#7dd3fc",
        strongColor: "#e2e8f0",
        sectionBorder: "#1e40af",
        sectionIcon: "#3b82f6",
        contactIcon: "#64748b",
        dateColor: "#64748b",
        internalText: "#64748b",
    },
    light: {
        bg: "#ffffff",
        sidebarBg: "#f0f4f8",
        sidebarBorder: "#cbd5e1",
        textColorPrimary: "#0f172a",
        textColorSecondary: "#1e293b",
        textColorAccent: "#1e40af",
        badgeBg: "#dbeafe",
        badgeText: "#1d4ed8",
        tagBg: "#e2e8f0",
        tagText: "#0f172a",
        cardBg: "#f8fafc",
        cardBorder: "#cbd5e1",
        imageBorder: "#94a3b8",
        imageBg: "#e2e8f0",
        iconColor: "#0f172a",
        iconBg: "#cbd5e1",
        techTagBg: "#dbeafe",
        techTagText: "#1e40af",
        linkColor: "#1d4ed8",
        strongColor: "#0f172a",
        sectionBorder: "#93c5fd",
        sectionIcon: "#1d4ed8",
        contactIcon: "#334155",
        dateColor: "#334155",
        internalText: "#334155",
    }
};

const CVBtn: FC<ICV> = ({ children }) => {
    const [isPrint, setIsPrint] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const contentRef = useRef<HTMLDivElement>(null);

    const colors = themeConfig[theme];

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: "Nazmul_Haque_CV",
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
            #cv-print-area {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                -webkit-font-smoothing: antialiased !important;
                text-rendering: optimizeLegibility !important;
            }
            img {
                image-rendering: -webkit-optimize-contrast !important;
                image-rendering: high-quality !important;
            }
        `,
        onBeforePrint: async () => {
            setIsPrint(true);
            setShowContent(true);
            await new Promise((r) => setTimeout(r, 300));
        },
        onAfterPrint: () => {
            setIsPrint(false);
            setShowContent(false);
        },
    });

    const { me, skills, experience, education, works } = info;
    const totalExperience = calculateExperienceYears(experience);

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
        if (!earliestStart) return "0 years";
        const now = new Date();
        const totalMonths =
            (now.getFullYear() - earliestStart.getFullYear()) * 12 +
            (now.getMonth() - earliestStart.getMonth());
        const years = Math.max(0, Math.floor(totalMonths / 12));
        return `${years}+ years`;
    }

    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/cv/generate-pdf?theme=${theme}`);
            if (!response.ok) throw new Error("Failed to generate PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Nazmul_Haque_CV_${theme}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            reactToPrintFn();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-72 bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-1.5 rounded-xl border border-line shadow-sm">
                <span className="text-xs text-muted font-medium ml-3">PDF Theme:</span>
                <div className="flex bg-[var(--background)] rounded-lg p-1 border border-line">
                    <button
                        onClick={() => setTheme("dark")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            theme === "dark" 
                                ? "bg-[var(--accent)] text-white shadow-sm" 
                                : "text-muted hover:text-foreground"
                        }`}
                    >
                        Dark
                    </button>
                    <button
                        onClick={() => setTheme("light")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            theme === "light" 
                                ? "bg-[var(--accent)] text-white shadow-sm" 
                                : "text-muted hover:text-foreground"
                        }`}
                    >
                        Light
                    </button>
                </div>
            </div>
            
            <button
                className="group relative w-72 flex justify-center items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] border border-emerald-400/50 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 select-none cursor-pointer"
                disabled={isGenerating || isPrint}
                onClick={handleDownloadPDF}
            >
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none z-0"></div>
                <span className="relative z-10 tracking-wider">
                    {isGenerating ? "Generating PDF..." : isPrint ? "Preparing..." : children || "Generate PDF"}
                </span>
                {!isGenerating && !isPrint && (
                    <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
            </button>

            {showContent && (
                <div
                    aria-hidden="true"
                    className="fixed"
                    style={{ left: "-9999px", top: "-9999px" }}
                >
                    <section
                        id="cv-print-area"
                        ref={contentRef}
                        className="cv-print-page"
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
                                    gap: "14px",
                                    borderRight: `1px solid ${colors.sidebarBorder}`,
                                }}
                            >
                                {/* Profile */}
                                <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "14px",
                                        border: `2px solid ${colors.imageBorder}`,
                                        margin: "0 auto 8px",
                                        position: "relative",
                                        overflow: "hidden",
                                        background: colors.imageBg,
                                    }}
                                >
                                    {/* Blurred background image */}
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
                                    {/* Full sharp foreground image */}
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
                                            fontSize: "22px",
                                            fontWeight: 800,
                                            color: colors.textColorPrimary,
                                            margin: "0 0 2px",
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {me.name}
                                    </h1>
                                    <p style={{ fontSize: "13px", color: colors.textColorSecondary, margin: 0 }}>
                                        {me.title}
                                    </p>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            marginTop: "6px",
                                            background: colors.badgeBg,
                                            color: colors.badgeText,
                                            fontSize: "11px",
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px" }}>
                                        <ContactRow
                                            colors={colors}
                                            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            text={me.email}
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
                                            marginTop: "6px",
                                        }}
                                    >
                                        {skills.map((skill, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: colors.tagBg,
                                                    padding: "4px 6px",
                                                    borderRadius: "4px",
                                                    fontSize: "10.5px",
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                                        {education.map((edu, i) => (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                    <h3 style={{ fontSize: "11.5px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                        {edu.for_pdf_degree}
                                                    </h3>
                                                    <span style={{ fontSize: "9px", color: colors.dateColor, whiteSpace: "nowrap", marginLeft: "6px" }}>
                                                        {edu.date}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "10.5px", color: colors.textColorSecondary, margin: "1px 0 0" }}>
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px" }}>
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
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                                        {["Open Source", "DevOps", "System Design", "UI/UX", "Cloud Computing", "Ollama", "Golang", "CI/CD", "Automation", "Agile", "Mentoring", "Performance Optimization"].map((item, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: "9px",
                                                    background: colors.tagBg,
                                                    color: colors.textColorSecondary,
                                                    padding: "3px 7px",
                                                    borderRadius: "4px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
                                    <a href={me.github} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: colors.iconBg }}>
                                        <svg viewBox="0 0 496 512" style={{ width: "14px", height: "14px", fill: colors.iconColor }}>
                                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                                        </svg>
                                    </a>
                                    <a href={me.linkedin} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: colors.iconBg }}>
                                        <svg viewBox="0 0 448 512" style={{ width: "14px", height: "14px", fill: colors.iconColor }}>
                                            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.1v383.9C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32V64.1c0-17.6-14.4-32.1-32-32.1zM135.4 416H69V215.5h66.5V416zm-33.2-240c-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5 39.5 17.7 39.5 39.5-17.7 39.5-39.5 39.5zm282.6 240h-66.4V299c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V215.5h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.6 44.3 79.6 101.9V416z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* ── RIGHT MAIN CONTENT ── */}
                            <div
                                style={{
                                    flex: 1,
                                    padding: "16px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                {/* Professional Summary */}
                                <div>
                                    <SectionTitle colors={colors} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                        Professional Summary
                                    </SectionTitle>
                                    <p
                                        style={{
                                            fontSize: "10.5px",
                                            color: colors.textColorSecondary,
                                            margin: "4px 0 0",
                                            lineHeight: 1.5,
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "5px" }}>
                                        {experience.map((exp, i) => (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                    <h3 style={{ fontSize: "11.5px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                        {exp.title}
                                                    </h3>
                                                    <span
                                                        style={{
                                                            fontSize: "9px",
                                                            background: colors.tagBg,
                                                            color: colors.textColorSecondary,
                                                            padding: "1px 6px",
                                                            borderRadius: "3px",
                                                            whiteSpace: "nowrap",
                                                            fontWeight: 600,
                                                            marginLeft: "6px",
                                                        }}
                                                    >
                                                        {exp.date}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "9px", color: colors.textColorSecondary, margin: "1px 0 0", fontStyle: "italic" }}>
                                                    {exp.company}{exp.address ? ` — ${exp.address}` : ""}
                                                </p>
                                                <ul
                                                    style={{
                                                        margin: "2px 0 0",
                                                        paddingLeft: "12px",
                                                        listStyleType: "disc",
                                                    }}
                                                >
                                                    {exp.description.slice(0, 3).map((d, j) => (
                                                        <li
                                                            key={j}
                                                            style={{
                                                                fontSize: "9.5px",
                                                                color: colors.textColorSecondary,
                                                                lineHeight: 1.4,
                                                                marginBottom: "0px",
                                                            }}
                                                        >
                                                            {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {/* Tech tags */}
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "3px" }}>
                                                    {exp.technologies.slice(0, 6).map((t, j) => (
                                                        <span
                                                            key={j}
                                                            style={{
                                                                fontSize: "8.5px",
                                                                background: colors.techTagBg,
                                                                border: `1px solid ${colors.cardBorder}`,
                                                                color: colors.techTagText,
                                                                padding: "1px 5px",
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

                                {/* Projects */}
                                <div>
                                    <SectionTitle colors={colors} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                        Key Projects
                                    </SectionTitle>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "5px" }}>
                                        {works.map((work, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: colors.cardBg,
                                                    border: `1px solid ${colors.cardBorder}`,
                                                    borderRadius: "5px",
                                                    padding: "6px 7px",
                                                }}
                                            >
                                                <h3 style={{ fontSize: "10.5px", fontWeight: 700, color: colors.textColorPrimary, margin: 0 }}>
                                                    {work.title}
                                                </h3>
                                                <p style={{ fontSize: "9px", color: colors.textColorSecondary, margin: "2px 0 3px", lineHeight: 1.35 }}>
                                                    {work.description[0]}
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "2px" }}>
                                                    {work.technologies.map((t, j) => (
                                                        <span
                                                            key={j}
                                                            style={{
                                                                fontSize: "8px",
                                                                background: colors.techTagBg,
                                                                color: colors.techTagText,
                                                                padding: "1px 4px",
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
                                                            fontSize: "8.5px",
                                                            color: colors.linkColor,
                                                            textDecoration: "none",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "2px",
                                                        }}
                                                    >
                                                        View Project
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "7px", height: "7px" }}>
                                                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: "8.5px", color: colors.internalText }}>Internal &amp; confidential</span>
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
                                    <div style={{ marginTop: "6px" }}>
                                        <p style={{ fontSize: "9px", color: colors.textColorSecondary, margin: "0 0 5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Industry Domains
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                                            {["ERP Systems", "E-Learning", "E-Commerce", "Website Builder", "Governance", "Healthcare", "SaaS"].map((domain, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: "8.5px",
                                                        background: colors.tagBg,
                                                        color: colors.textColorPrimary,
                                                        padding: "3px 8px",
                                                        borderRadius: "4px",
                                                        fontWeight: 500,
                                                        border: `1px solid ${colors.sidebarBorder}`,
                                                    }}
                                                >
                                                    {domain}
                                                </span>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: "9px", color: colors.textColorSecondary, margin: "0 0 5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Open Source Contributions
                                        </p>
                                        <ul style={{ margin: "0", paddingLeft: "12px", listStyleType: "disc" }}>
                                            <li style={{ fontSize: "9px", color: colors.textColorSecondary, lineHeight: 1.45, marginBottom: "2px" }}>
                                                <strong style={{ color: colors.strongColor }}>QuickDB</strong> — VS Code extension for multi-database management supporting MySQL, PostgreSQL, MongoDB, Redis, SQLite. Features include Query Builder, Query Console, real-time auto-suggestions, MCP server integration, AI-powered query generation, table management, data export/import, schema visualization, and connection manager.
                                            </li>
                                            <li style={{ fontSize: "9px", color: colors.textColorSecondary, lineHeight: 1.45, marginBottom: "2px" }}>
                                                Published <strong style={{ color: colors.strongColor }}>3 npm packages</strong> — ESLint & Prettier setup, Quick UI Design scaffolding, Quick Dockerize CLI tool.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

/* ── Reusable sub-components ── */

const SectionTitle: FC<{ icon: string; children: React.ReactNode; colors: any }> = ({
    icon,
    children,
    colors
}) => (
    <h2
        style={{
            fontSize: "14px",
            fontWeight: 800,
            color: colors.textColorPrimary,
            margin: 0,
            paddingBottom: "4px",
            borderBottom: `2px solid ${colors.sectionBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
        }}
    >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "13px", height: "13px", flexShrink: 0, color: colors.sectionIcon }}
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
    colors
}) => {
    const content = (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
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
                style={{ width: "11px", height: "11px", flexShrink: 0, color: colors.contactIcon }}
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

export default CVBtn;
