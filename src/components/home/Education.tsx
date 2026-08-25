"use client";

import { FC, useRef, useState } from "react";
import SectionHeading from "./SectionHeading";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface IEducation {}

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
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.45)]",
        glowHover: "group-hover:shadow-[0_0_35px_rgba(6,182,212,0.7)]",
        textAccent: "text-cyan-400",
        isTop: true,
        highlight: true,
    },
    {
        number: "02",
        year: "2012 — 2016",
        tag: "Diploma",
        title: "Diploma in Computer Engineering",
        institution: "Meherpur College of Eng. & Tech.",
        details: "4-Year Diploma in Computer Engineering",
        theme: "blue",
        badgeBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
        badgeBorder: "border-blue-400",
        glow: "shadow-[0_0_25px_rgba(59,130,246,0.45)]",
        glowHover: "group-hover:shadow-[0_0_35px_rgba(59,130,246,0.7)]",
        textAccent: "text-blue-400",
        isTop: false,
        highlight: false,
    },
    {
        number: "03",
        year: "2010 — 2012",
        tag: "SSC",
        title: "Secondary School Certificate (SSC)",
        institution: "Kobi Nazrul Shikkha Manzil",
        details: "Secondary School Certificate with Concentration in General Science",
        theme: "purple",
        badgeBg: "bg-gradient-to-tr from-purple-600 to-indigo-500",
        badgeBorder: "border-purple-400",
        glow: "shadow-[0_0_25px_rgba(168,85,247,0.45)]",
        glowHover: "group-hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]",
        textAccent: "text-purple-400",
        isTop: true,
        highlight: false,
    },
];

const Education: FC<IEducation> = () => {
    const containerRef = useRef<HTMLElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useGSAP(
        () => {
            const container = containerRef.current;
            if (!container) return;

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    "[data-edu-stage], [data-edu-rail-fill], [data-edu-node], [data-edu-card], [data-edu-connector], [data-edu-mobile-card]",
                    {
                        autoAlpha: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        clearProps: "all",
                    }
                );
                return;
            }

            const stage = container.querySelector<HTMLElement>("[data-edu-stage]");
            const railFill = container.querySelector<HTMLElement>("[data-edu-rail-fill]");
            const beam = container.querySelector<HTMLElement>("[data-edu-beam]");

            let mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                /* ── DESKTOP SCROLL-SCRUB PROGRESSION WITH PINNING ── */
                
                // 1. Stage container reveal & subtle zoom in
                if (stage) {
                    gsap.fromTo(
                        stage,
                        { autoAlpha: 0.2, y: 40, scale: 0.97 },
                        { 
                            autoAlpha: 1, y: 0, scale: 1, duration: 0.8,
                            scrollTrigger: {
                                trigger: stage,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            }
                        }
                    );
                }

                // As the user scrolls to near the top, the entire section pins and the rail progressively fills
                const scrubTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        start: "center center", // Pin when the section is centered on screen so it's fully visible
                        end: "+=1500", // Distance to scroll while pinned to play the animation
                        scrub: 1.2,
                        pin: true,
                        anticipatePin: 1,
                    },
                    defaults: { ease: "power2.out" },
                });

                // 2. Continuous rail fill drawing from left to right on scroll
                if (railFill) {
                    scrubTl.fromTo(
                        railFill,
                        { scaleX: 0, transformOrigin: "left center" },
                        { scaleX: 1, duration: 3, ease: "none" },
                        0
                    );
                }

                // 3. Staggered milestone reveals synchronized with scroll track
                const nodeTimes = [0.2, 1.2, 2.2];
                MILESTONE_CONFIGS.forEach((m, idx) => {
                    const node = container.querySelector<HTMLElement>(`[data-edu-node="${idx}"]`);
                    const connector = container.querySelector<HTMLElement>(`[data-edu-connector="${idx}"]`);
                    const card = container.querySelector<HTMLElement>(`[data-edu-card="${idx}"]`);
                    const t = nodeTimes[idx];

                    if (node) {
                        scrubTl.fromTo(
                            node,
                            { scale: 0, autoAlpha: 0, rotation: -30 },
                            { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
                            t
                        );
                    }

                    if (connector) {
                        const origin = m.isTop ? "bottom center" : "top center";
                        scrubTl.fromTo(
                            connector,
                            { scaleY: 0, transformOrigin: origin },
                            { scaleY: 1, duration: 0.4 },
                            t + 0.15
                        );
                    }

                    if (card) {
                        const yOffset = m.isTop ? -30 : 30;
                        scrubTl.fromTo(
                            card,
                            { autoAlpha: 0, y: yOffset, scale: 0.92 },
                            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" },
                            t + 0.25
                        );
                    }
                });
            });

            mm.add("(max-width: 1023px)", () => {
                // 1. Stage container reveal
                if (stage) {
                    gsap.fromTo(
                        stage,
                        { autoAlpha: 0.2, y: 40, scale: 0.97 },
                        { 
                            autoAlpha: 1, y: 0, scale: 1, duration: 0.8,
                            scrollTrigger: {
                                trigger: stage,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            }
                        }
                    );
                }

                /* ── MOBILE SCROLL REVEALS ── */
                const mobileCards = container.querySelectorAll<HTMLElement>("[data-edu-mobile-card]");
                mobileCards.forEach((cardEl, idx) => {
                    gsap.fromTo(
                        cardEl,
                        { autoAlpha: 0, x: -30, scale: 0.96 },
                        {
                            autoAlpha: 1,
                            x: 0,
                            scale: 1,
                            duration: 0.7,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: cardEl,
                                start: "top 88%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            });

            /* ── CONTINUOUS SHIMMER BEAM ── */
            if (beam) {
                gsap.fromTo(
                    beam,
                    { left: "-15%" },
                    {
                        left: "115%",
                        duration: 2.8,
                        repeat: -1,
                        ease: "power1.inOut",
                        delay: 0.5,
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return (
        <section
            ref={containerRef}
            className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
            id="education"
        >
            <SectionHeading
                index="03"
                label="Academic Foundation"
                note={`${MILESTONE_CONFIGS.length} verified degrees &amp; certifications`}
                title="Education &amp; Background"
            />

            {/* ── Square Grid Blueprint Stage Container ── */}
            <div
                data-edu-stage
                className="mt-10 sm:mt-14 relative rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/60 overflow-hidden"
            >
                {/* Square Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--line)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--line)_35%,transparent)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-80" />

                {/* Subtle Ambient Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

                {/* ── Desktop View: Alternating Horizontal Timeline ── */}
                <div className="hidden lg:block relative z-10 py-10">
                    {/* Background Rail Track */}
                    <div className="absolute top-1/2 left-6 right-6 h-1 bg-line/50 -translate-y-1/2 z-0 rounded-full overflow-hidden" />

                    {/* Active Rail Fill (Progressively draws on scroll) */}
                    <div
                        data-edu-rail-fill
                        className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 -translate-y-1/2 z-0 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] overflow-hidden"
                    >
                        {/* Shimmer / Energy Pulse Beam */}
                        <div
                            data-edu-beam
                            className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-white to-transparent opacity-75 blur-[1px]"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-8 relative z-10">
                        {MILESTONE_CONFIGS.map((m, idx) => {
                            const isHovered = hoveredIndex === idx;

                            return (
                                <div
                                    key={m.number}
                                    className="flex flex-col items-center group cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* ── Top Milestone Slot (if isTop is true) ── */}
                                    <div className="h-[210px] w-full flex flex-col justify-end">
                                        {m.isTop && (
                                            <div
                                                data-edu-card={idx}
                                                className={`p-5 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] border transition-all duration-300 backdrop-blur-md shadow-md shadow-slate-900/5 dark:shadow-black/40 ${
                                                    isHovered
                                                        ? "-translate-y-2 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30"
                                                        : "border-line hover:border-[var(--line-strong)]"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <span
                                                        className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}
                                                    >
                                                        {m.tag}
                                                    </span>
                                                    <span
                                                        className={`text-2xl font-extrabold font-mono transition-colors ${
                                                            isHovered ? "text-[var(--accent)]" : "text-fg/80"
                                                        }`}
                                                    >
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
                                            <div
                                                data-edu-connector={idx}
                                                className={`w-0.5 h-6 bg-gradient-to-b transition-all duration-300 ${
                                                    isHovered
                                                        ? "from-[var(--accent)] to-[var(--accent)] w-1 shadow-[0_0_8px_var(--accent)]"
                                                        : "from-[var(--line-strong)] to-[var(--accent)]"
                                                }`}
                                            />
                                        )}

                                        {/* Center Circular Gradient Node with Number */}
                                        <div
                                            data-edu-node={idx}
                                            className={`relative w-12 h-12 rounded-full ${m.badgeBg} ${m.glow} border-2 ${
                                                m.badgeBorder
                                            } flex items-center justify-center shadow-md transition-all duration-300 ${
                                                isHovered ? "scale-125 " + m.glowHover : "hover:scale-110"
                                            }`}
                                        >
                                            {/* Pulse Ring for Active / Latest Degree */}
                                            {m.highlight && (
                                                <span className="absolute -inset-1.5 rounded-full bg-cyan-400/25 animate-ping pointer-events-none" />
                                            )}

                                            <span className="text-base font-extrabold font-mono text-white tracking-wider">
                                                {m.number}
                                            </span>
                                        </div>

                                        {/* Vertical Connector Line (Bottom) */}
                                        {!m.isTop && (
                                            <div
                                                data-edu-connector={idx}
                                                className={`w-0.5 h-6 bg-gradient-to-b transition-all duration-300 ${
                                                    isHovered
                                                        ? "from-[var(--accent)] to-[var(--accent)] w-1 shadow-[0_0_8px_var(--accent)]"
                                                        : "from-[var(--accent)] to-[var(--line-strong)]"
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* ── Bottom Milestone Slot (if isTop is false) ── */}
                                    <div className="h-[210px] w-full flex flex-col justify-start">
                                        {!m.isTop && (
                                            <div
                                                data-edu-card={idx}
                                                className={`p-5 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] border transition-all duration-300 backdrop-blur-md shadow-md shadow-slate-900/5 dark:shadow-black/40 ${
                                                    isHovered
                                                        ? "translate-y-2 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30"
                                                        : "border-line hover:border-[var(--line-strong)]"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[11px] font-mono text-faint pb-2.5 mb-2 border-b border-line">
                                                    <span className="font-bold text-fg/90">{m.year}</span>
                                                    <span>Dhaka, Bangladesh</span>
                                                </div>

                                                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                                                    {m.institution}
                                                </p>

                                                <div className="flex items-center justify-between gap-2 mt-2">
                                                    <span
                                                        className={`text-2xl font-extrabold font-mono transition-colors ${
                                                            isHovered ? "text-[var(--accent)]" : "text-fg/80"
                                                        }`}
                                                    >
                                                        {m.number}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}
                                                    >
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
                            data-edu-mobile-card
                            className="p-6 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_90%,transparent)] border border-line backdrop-blur-md shadow-md shadow-slate-900/5 dark:shadow-black/40 transition-all duration-300 hover:border-[var(--line-strong)]"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`relative w-11 h-11 rounded-full ${m.badgeBg} ${m.glow} border-2 ${m.badgeBorder} flex items-center justify-center shrink-0 shadow-md`}
                                >
                                    {m.highlight && (
                                        <span className="absolute -inset-1 rounded-full bg-cyan-400/25 animate-ping pointer-events-none" />
                                    )}
                                    <span className="text-sm font-extrabold font-mono text-white">
                                        {m.number}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                        <span
                                            className={`text-xs font-mono font-bold uppercase tracking-wider ${m.textAccent}`}
                                        >
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


