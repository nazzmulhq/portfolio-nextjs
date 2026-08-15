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

const MILESTONE_CONFIGS = [
    {
        number: "01",
        year: "2016 — 2020",
        tag: "B.Sc. in CSE",
        title: "B.Sc. in Computer Science & Engineering",
        institution: "Daffodil International University",
        details: "4-Year Undergraduate Degree in Software Engineering, Algorithms & Database Systems",
        theme: "cyan",
        badgeBg: "bg-gradient-to-tr from-cyan-500 to-teal-400",
        badgeBorder: "border-cyan-400",
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]",
        textAccent: "text-cyan-400",
        isTop: true,
    },
    {
        number: "02",
        year: "2013 — 2015",
        tag: "HSC (Science)",
        title: "Higher Secondary Certificate (HSC) - Science",
        institution: "Govt. Science College, Tejgaon, Dhaka",
        details: "Higher Secondary Foundation with Majors in Physics, Chemistry & Higher Mathematics",
        theme: "blue",
        badgeBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
        badgeBorder: "border-blue-400",
        glow: "shadow-[0_0_25px_rgba(59,130,246,0.4)]",
        textAccent: "text-blue-400",
        isTop: false,
    },
    {
        number: "03",
        year: "2011 — 2013",
        tag: "SSC (Science)",
        title: "Secondary School Certificate (SSC) - Science",
        institution: "Civil Aviation High School, Tejgaon, Dhaka",
        details: "Secondary School Certificate with Concentration in General Science & Mathematics",
        theme: "purple",
        badgeBg: "bg-gradient-to-tr from-purple-600 to-indigo-500",
        badgeBorder: "border-purple-400",
        glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
        textAccent: "text-purple-400",
        isTop: true,
    },
];

const Education: FC<IEducation> = () => {
    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24" id="education">
            <SectionHeading
                index="03"
                label="Academic Foundation"
                note={`${MILESTONE_CONFIGS.length} verified degrees &amp; certifications`}
                title="Education &amp; Background"
            />

            {/* ── Square Grid Blueprint Stage Container ── */}
            <div className="mt-10 sm:mt-14 relative rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/60 overflow-hidden">
                {/* Square Grid Pattern Overlay (`squr bg add`) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--line)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--line)_35%,transparent)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-80" />

                {/* Subtle Ambient Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* ── Desktop View: Alternating Horizontal Timeline (Matching Reference) ── */}
                <div className="hidden lg:block relative z-10 py-10">
                    {/* Continuous Center Horizontal Rail */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-[var(--line-strong)] via-[var(--accent)] to-[var(--line-strong)] -translate-y-1/2 z-0 opacity-80" />

                    <div className="grid grid-cols-3 gap-8 relative z-10">
                        {MILESTONE_CONFIGS.map((m) => {
                            return (
                                <div key={m.number} className="flex flex-col items-center">
                                    {/* ── Top Milestone Slot (if isTop is true) ── */}
                                    <div className="h-[210px] w-full flex flex-col justify-end">
                                        {m.isTop && (
                                            <div className="p-5 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] border border-line shadow-md shadow-slate-900/5 dark:shadow-black/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--line-strong)] group">
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}>
                                                        {m.tag}
                                                    </span>
                                                    <span className="text-2xl font-extrabold font-mono text-fg/80 group-hover:text-[var(--accent)] transition-colors">
                                                        {m.number}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-fg leading-snug">
                                                    {m.title}
                                                </h4>

                                                <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                                                    {m.institution}
                                                </p>

                                                <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-[11px] font-mono text-faint">
                                                    <span>Dhaka, Bangladesh</span>
                                                    <span className="font-bold text-fg/90">{m.year}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Center Connector & Circular Icon Node ── */}
                                    <div className="relative my-4 flex flex-col items-center z-20">
                                        {/* Vertical Connector Line (Top) */}
                                        {m.isTop && (
                                            <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--line-strong)] to-[var(--accent)]" />
                                        )}

                                        {/* Center Circular Gradient Node with Number */}
                                        <div
                                            className={`w-12 h-12 rounded-full ${m.badgeBg} ${m.glow} border-2 ${m.badgeBorder} flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110 cursor-pointer`}
                                        >
                                            <span className="text-base font-extrabold font-mono text-white tracking-wider">
                                                {m.number}
                                            </span>
                                        </div>

                                        {/* Vertical Connector Line (Bottom) */}
                                        {!m.isTop && (
                                            <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--line-strong)]" />
                                        )}
                                    </div>

                                    {/* ── Bottom Milestone Slot (if isTop is false) ── */}
                                    <div className="h-[210px] w-full flex flex-col justify-start">
                                        {!m.isTop && (
                                            <div className="p-5 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] border border-line shadow-md shadow-slate-900/5 dark:shadow-black/40 backdrop-blur-md transition-all duration-300 hover:translate-y-1 hover:border-[var(--line-strong)] group">
                                                <div className="flex items-center justify-between text-[11px] font-mono text-faint pb-2.5 mb-2 border-b border-line">
                                                    <span className="font-bold text-fg/90">{m.year}</span>
                                                    <span>Dhaka, Bangladesh</span>
                                                </div>

                                                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                                                    {m.institution}
                                                </p>

                                                <div className="flex items-center justify-between gap-2 mt-2">
                                                    <span className="text-2xl font-extrabold font-mono text-fg/80 group-hover:text-[var(--accent)] transition-colors">
                                                        {m.number}
                                                    </span>
                                                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}>
                                                        {m.tag}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-fg leading-snug mt-1">
                                                    {m.title}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Mobile / Tablet View: Vertical Connected Blueprint Stream ── */}
                <div className="block lg:hidden relative z-10 space-y-6">
                    {MILESTONE_CONFIGS.map((m) => (
                        <article
                            key={m.number}
                            className="p-6 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-line backdrop-blur-md shadow-md shadow-slate-900/5 dark:shadow-black/40"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-11 h-11 rounded-full ${m.badgeBg} ${m.glow} border-2 ${m.badgeBorder} flex items-center justify-center shrink-0 shadow-md`}
                                >
                                    <span className="text-sm font-extrabold font-mono text-white">
                                        {m.number}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}>
                                            Phase {m.number} · {m.tag}
                                        </span>
                                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface)] text-fg/90 border border-line">
                                            {m.year}
                                        </span>
                                    </div>

                                    <h4 className="text-base sm:text-lg font-bold text-fg leading-snug">
                                        {m.title}
                                    </h4>

                                    <p className="text-xs sm:text-sm text-muted mt-1.5 leading-relaxed font-medium">
                                        {m.institution} · Dhaka, Bangladesh
                                    </p>

                                    <p className="text-xs text-muted/80 mt-2 leading-relaxed">
                                        {m.details}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Education;
