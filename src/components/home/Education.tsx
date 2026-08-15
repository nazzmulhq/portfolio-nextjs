"use client";

import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IEducation {}

interface EduMilestone {
    title: string;
    degree: string;
    for_pdf_degree: string;
    date: string;
}

const MILESTONE_THEMES = [
    {
        theme: "cyan",
        badgeBg: "bg-gradient-to-tr from-cyan-500 to-teal-400",
        badgeBorder: "border-cyan-400",
        arcBorder: "border-cyan-500",
        arcBg: "bg-cyan-500",
        cardBorder: "border-cyan-500/30 hover:border-cyan-500/60",
        shadow: "shadow-[0_0_25px_rgba(6,182,212,0.3)]",
        textAccent: "text-cyan-400",
        bottomBar: "bg-cyan-500",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        ),
    },
    {
        theme: "blue",
        badgeBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
        badgeBorder: "border-blue-400",
        arcBorder: "border-blue-500",
        arcBg: "bg-blue-500",
        cardBorder: "border-blue-500/30 hover:border-blue-500/60",
        shadow: "shadow-[0_0_25px_rgba(59,130,246,0.3)]",
        textAccent: "text-blue-400",
        bottomBar: "bg-blue-500",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        ),
    },
    {
        theme: "purple",
        badgeBg: "bg-gradient-to-tr from-purple-600 to-indigo-500",
        badgeBorder: "border-purple-400",
        arcBorder: "border-purple-500",
        arcBg: "bg-purple-500",
        cardBorder: "border-purple-500/30 hover:border-purple-500/60",
        shadow: "shadow-[0_0_25px_rgba(168,85,247,0.3)]",
        textAccent: "text-purple-400",
        bottomBar: "bg-purple-500",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
];

const Education: FC<IEducation> = () => {
    const { education } = info;
    const milestones = education as EduMilestone[];

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24" id="education">
            <SectionHeading
                index="03"
                label="Academic Foundation"
                note={`${milestones.length} degrees &amp; certifications · 2011 — 2020`}
                title="Education &amp; Background"
            />

            {/* ── Infographic Connected Process Flow ── */}
            <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 relative">
                {milestones.map((item, index) => {
                    const theme = MILESTONE_THEMES[index % MILESTONE_THEMES.length];
                    const isLast = index === milestones.length - 1;

                    return (
                        <div key={item.title} className="relative flex flex-col items-center group">
                            {/* ── Connecting Flow Line & Arrow (Desktop) ── */}
                            {!isLast && (
                                <div className="hidden md:flex items-center absolute top-10 left-[60%] w-[80%] z-0 pointer-events-none">
                                    <div className="h-0.5 w-full bg-gradient-to-r from-[var(--line-strong)] via-[var(--accent)] to-[var(--line-strong)] relative">
                                        <svg
                                            className="w-3.5 h-3.5 absolute -right-1 -top-1.5 text-[var(--accent)]"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* ── Top Circular Badge with Crescent Arcs ── */}
                            <div className="relative z-10 flex flex-col items-center mb-[-40px]">
                                {/* Outer Top Crescent Arc */}
                                <div
                                    className={`w-[84px] h-[84px] rounded-full border-t-2 border-r-2 border-l-2 ${theme.arcBorder} opacity-80 flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105`}
                                >
                                    {/* Main Center Circular Badge */}
                                    <div
                                        className={`w-16 h-16 rounded-full ${theme.badgeBg} ${theme.shadow} flex items-center justify-center shadow-lg border-2 ${theme.badgeBorder} transition-all duration-300 group-hover:scale-110`}
                                    >
                                        {theme.icon}
                                    </div>
                                </div>

                                {/* Outer Bottom Arc Trim */}
                                <div className={`w-12 h-1.5 rounded-full ${theme.arcBg} opacity-80 mt-1`} />
                            </div>

                            {/* ── Main Infographic Card Container ── */}
                            <article
                                className={`w-full pt-14 pb-8 px-6 sm:px-7 rounded-3xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border ${theme.cardBorder} backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[310px] relative overflow-hidden`}
                            >
                                <div>
                                    {/* Milestone Index & Duration Badge */}
                                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-line">
                                        <span className="text-xs font-mono font-bold text-fg/80 px-2.5 py-0.5 rounded-md bg-[var(--surface-2)] border border-line">
                                            Phase 0{index + 1}
                                        </span>
                                        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--surface-2)] ${theme.textAccent} border border-line`}>
                                            {item.date}
                                        </span>
                                    </div>

                                    {/* Degree Tag */}
                                    <div className="mb-2.5">
                                        <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {item.for_pdf_degree}
                                        </span>
                                    </div>

                                    {/* Degree Title */}
                                    <h3 className="text-lg font-bold text-fg group-hover:text-[var(--accent)] transition-colors leading-snug">
                                        {item.degree}
                                    </h3>

                                    {/* Institution Name */}
                                    <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed font-medium">
                                        {item.title}
                                    </p>
                                </div>

                                {/* Footer & Bottom Arc Accent */}
                                <div className="mt-6 pt-4 border-t border-line">
                                    <div className="flex items-center justify-between text-xs font-mono text-muted">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Dhaka, Bangladesh</span>
                                        </span>
                                        <span className="text-emerald-400 font-semibold">Graduated</span>
                                    </div>

                                    {/* Bottom Centered Arc Accent */}
                                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 rounded-t-full ${theme.bottomBar} opacity-80`} />
                                </div>
                            </article>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Education;
