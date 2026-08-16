"use client";

import { FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import info from "./data";
import SectionHeading from "./SectionHeading";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface IExperience {}

interface Role {
    title: string;
    company: string;
    date: string;
    address?: string;
    description: string[];
    problemSolved?: string;
    technologies?: string[];
}

const Experience: FC<IExperience> = () => {
    const rawRoles = info.experience as Role[];
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const container = containerRef.current;
            if (!container) return;

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            const cards = gsap.utils.toArray<HTMLElement>("[data-exp-card]", container);
            
            cards.forEach((card, index) => {
                if (index === cards.length - 1) return;
                const nextCard = cards[index + 1];

                gsap.to(card, {
                    scale: 0.96 - index * 0.012,
                    opacity: 0.72,
                    transformOrigin: "top center",
                    ease: "none",
                    scrollTrigger: {
                        trigger: nextCard,
                        start: "top 80%",
                        end: "top 25%",
                        scrub: true,
                    },
                });
            });
        },
        { scope: containerRef },
    );

    return (
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24" id="experience">
            <SectionHeading
                index="02"
                label="Career Progression"
                note={`${rawRoles.length} positions · 2021 — Present`}
                title="Professional Experience"
            />

            {/* ── Full-Width Cascading Stacked Cards Deck ── */}
            <div
                ref={containerRef}
                className="mt-8 sm:mt-14 space-y-48 sm:space-y-64 lg:space-y-72 pb-48 sm:pb-64 lg:pb-72 relative [--sticky-offset:10px] sm:[--sticky-offset:14px] md:[--sticky-offset:16px]"
            >
                {rawRoles.map((role, index) => {
                    const isCurrent = /present/i.test(role.date);
                    const isSslRole2 = index === 1;

                    return (
                        <article
                            id={`exp-card-${index}`}
                            data-exp-card
                            key={role.title + role.date}
                            style={{
                                top: `calc(4.5rem + ${index} * var(--sticky-offset))`,
                                zIndex: index + 10,
                            }}
                            className="sticky rounded-3xl bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] border border-line hover:border-[var(--line-strong)] p-5 sm:p-7 lg:p-8 backdrop-blur-2xl shadow-[0_-10px_35px_var(--shadow)] transition-colors duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* Header Tab Container (100% visible in the stacked deck) */}
                                <div className="flex flex-col justify-between pb-3.5 border-b border-line mb-3.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                                                {role.company}
                                            </span>
                                            {isCurrent && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Active Position
                                                </span>
                                            )}
                                            {isSslRole2 && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                                    Initial Role
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[var(--surface-2)] text-fg/90 border border-line shadow-xs whitespace-nowrap">
                                                {role.date}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-faint hidden sm:inline">
                                                0{index + 1} / 0{rawRoles.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-1.5">
                                        <h3 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight leading-snug">
                                            {role.title}
                                        </h3>
                                        {role.address && (
                                            <p className="text-xs text-muted flex items-center gap-1.5 font-mono mt-0.5">
                                                <svg className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{role.address}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Key Architectural Impact Box */}
                                {role.problemSolved && (
                                    <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-[color-mix(in_srgb,var(--surface-2)_85%,transparent)] border border-emerald-500/25 text-xs sm:text-sm leading-relaxed text-fg shadow-xs">
                                        <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider mb-1">
                                            <div className="w-4 h-4 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <span>Key Architectural Impact</span>
                                        </div>
                                        <p className="text-fg/90 pl-6 leading-relaxed font-medium">
                                            {role.problemSolved}
                                        </p>
                                    </div>
                                )}

                                {/* Key Deliverables & Responsibilities */}
                                <div className="mt-3.5">
                                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
                                        Key Deliverables &amp; Engineering Contributions
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {role.description.map((line, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2.5 text-xs sm:text-sm text-muted leading-relaxed"
                                            >
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                                                <span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Technologies Stack */}
                            {role.technologies && (
                                <div className="mt-4 pt-3.5 border-t border-line">
                                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
                                        Technologies &amp; Tools Used
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.technologies.map((tech) => (
                                            <span
                                                key={tech}
                                                className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-fg/90 border border-line shadow-xs transition-colors"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Experience;
