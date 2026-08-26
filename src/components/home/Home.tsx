"use client";

import { FC, useState } from "react";
import Link from "next/link";
import info from "./data";
import MagneticButton from "./MagneticButton";

export interface IHome {}

const HIGHLIGHT_STATS = [
    { label: "Experience", value: "4+ Years", desc: "Enterprise & SaaS" },
    { label: "Core Stack", value: "Next.js · FastAPI · Django", desc: "NestJS · TypeScript & Python" },
    { label: "Open Source", value: "QuickDB · 3 NPM", desc: "DevTools & Extensions" },
    { label: "Location", value: "Dhaka, Bangladesh", desc: "23.8103° N, 90.4125° E", isLive: true },
];

const Home: FC<IHome> = () => {
    const { me } = info;
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(me.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section
            className="relative flex min-h-[92vh] flex-col justify-center px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24 overflow-hidden"
            id="home"
        >
            <div className="mx-auto w-full max-w-6xl">
                {/* ── Top Status Strip ── */}
                <div
                    className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4"
                    data-hero
                >
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-line backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-wide text-fg">
                            Available for Opportunities
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-line text-fg/90 font-medium">
                            Senior Software Specialist
                        </span>
                        <span className="text-faint">·</span>
                        <span>Full-Stack Architecture</span>
                    </div>
                </div>

                {/* ── Main Hero Grid ── */}
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)] lg:gap-14">
                    {/* Left: Text & Actions */}
                    <div className="min-w-0" data-hero>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-fg leading-[1.1]">
                            Nazmul{" "}
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                                Haque
                            </span>
                        </h1>

                        <p className="mt-3 text-lg sm:text-xl font-bold text-[var(--accent)]">
                            Senior Software Specialist &amp; Full-Stack Architect
                        </p>

                        <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-muted">
                            Specializing in scalable <strong className="text-fg font-semibold">Enterprise ERPs</strong> (Production Planning &amp; MRP),{" "}
                            <strong className="text-fg font-semibold">Multi-tenant SaaS Platforms</strong> (Zcommerz E-Commerce &amp; LMS), and{" "}
                            <strong className="text-fg font-semibold">Developer Tooling</strong> (QuickDB VS Code Extension &amp; CLI Packages) built on Next.js, NestJS &amp; TypeScript.
                        </p>

                        {/* Quick Stats Grid (2 rows for better readability & responsive view) */}
                        <div className="mt-6 sm:mt-8 grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-3.5 max-w-xl">
                            {HIGHLIGHT_STATS.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="p-3.5 sm:p-4 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_80%,transparent)] border border-line hover:border-emerald-500/40 hover:bg-[color-mix(in_srgb,var(--surface-2)_95%,transparent)] backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 group"
                                >
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted font-mono font-medium">
                                        <span>{stat.label}</span>
                                        {stat.isLive ? (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className="text-sm sm:text-base font-bold text-fg block mt-1.5 tracking-tight group-hover:text-emerald-400 transition-colors">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs text-muted/80 block mt-0.5">
                                        {stat.desc}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons Hub */}
                        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
                            {/* Primary Action */}
                            <MagneticButton
                                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                                onClick={() => {
                                    const el = document.getElementById("works");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1000ms] ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"></div>
                                <span className="relative z-10">Explore Work</span>
                                <svg
                                    className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-y-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </MagneticButton>

                            {/* View CV */}
                            <Link
                                href="/cv"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg text-sm font-bold border border-line hover:border-[var(--line-strong)] transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                            >
                                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Curriculum Vitae (CV)</span>
                            </Link>

                            {/* Copy Email Button */}
                            <button
                                onClick={handleCopyEmail}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-muted hover:text-fg text-xs font-mono border border-line transition-all duration-200 cursor-pointer"
                                title="Click to copy email address"
                                type="button"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {copied ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    )}
                                </svg>
                                <span>{copied ? "Copied to Clipboard!" : me.email}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Portrait & Featured Console Card */}
                    <div className="flex justify-center lg:justify-end" data-hero>
                        <div className="relative group w-full max-w-sm sm:max-w-md">
                            {/* Ambient Halo Glow */}
                            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"></div>

                            {/* Elevated Glass Frame */}
                            <div className="relative rounded-3xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] border border-line p-4 sm:p-5 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Window Header */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                                        <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                                        <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                                    </div>
                                    <span className="text-xs font-mono font-medium text-muted">nazmulhaque.dev</span>
                                </div>

                                {/* Portrait Image Container */}
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-line">
                                    {/* Ambient blurred backdrop */}
                                    <img
                                        alt=""
                                        src={me.image}
                                        className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110 pointer-events-none"
                                    />
                                    {/* Crisp foreground portrait */}
                                    <img
                                        alt={me.name}
                                        src={me.image}
                                        className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Glass Overlay Bar */}
                                    <div className="absolute bottom-3 left-3 right-3 z-20 p-3 rounded-xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-md border border-line flex items-center justify-between shadow-md">
                                        <div>
                                            <p className="text-xs font-bold text-fg leading-tight">Nazmul Haque</p>
                                            <p className="text-[10.5px] text-[var(--accent)] font-medium">Sr. Software Specialist</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={me.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg/90 hover:text-[var(--accent)] border border-line transition-colors"
                                                title="GitHub"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                </svg>
                                            </a>
                                            <a
                                                href={me.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg/90 hover:text-[var(--accent)] border border-line transition-colors"
                                                title="LinkedIn"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
