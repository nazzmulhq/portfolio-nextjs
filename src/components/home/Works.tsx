"use client";

import Link from "next/link";
import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;

    return (
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24" id="works">
            <SectionHeading
                index="04"
                label="Featured Products &amp; Tools"
                note={`${works.length} showcased engineering projects`}
                title="Selected Works &amp; Products"
            />

            {/* ── Full-Width Vertical Sticky Stacking Cards Deck ── */}
            <div className="mt-10 sm:mt-14 space-y-16 sm:space-y-24 pb-36 relative">
                {works.map((work, i) => {
                    const hasLink = Boolean(work.link);
                    const external = hasLink && !work.link!.startsWith("/");
                    const linkHref = work.link || "#";

                    // Incremental top offset so headers stack neatly
                    const stickyTop = `calc(4.5rem + ${i * 85}px)`;

                    return (
                        <article
                            id={`work-card-${i}`}
                            key={work.title}
                            style={{
                                top: stickyTop,
                                zIndex: i + 10,
                            }}
                            className="sticky rounded-3xl bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] border border-line hover:border-[var(--line-strong)] p-6 sm:p-8 lg:p-9 backdrop-blur-2xl shadow-[0_-10px_35px_var(--shadow)] transition-all duration-300 min-h-[440px] flex flex-col justify-between"
                        >
                            {/* Card Header (Visible in Stacked Deck) */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 mb-6">
                                <div className="flex items-center gap-2.5">
                                    <span className="font-mono font-extrabold text-xs text-[var(--accent)] bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-line">
                                        PROJECT 0{i + 1}
                                    </span>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] border border-[var(--accent-soft)]">
                                        {external ? "Live SaaS / Tool" : "Case Study &amp; Docs"}
                                    </span>
                                </div>

                                <span className="text-xs font-mono font-bold text-faint hidden sm:inline">
                                    0{i + 1} / 0{works.length}
                                </span>
                            </div>

                            {/* Split Content: Spec & Deliverables on Left, Media on Right */}
                            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-center">
                                {/* Left: Info & Tech Stack */}
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-fg group-hover:text-[var(--accent)] transition-colors leading-tight">
                                            {hasLink ? (
                                                <Link
                                                    href={linkHref}
                                                    target={external ? "_blank" : undefined}
                                                    rel={external ? "noopener noreferrer" : undefined}
                                                >
                                                    {work.title}
                                                </Link>
                                            ) : (
                                                work.title
                                            )}
                                        </h3>

                                        <div className="mt-3.5 space-y-2">
                                            {work.description.map((desc, j) => (
                                                <p key={j} className="text-xs sm:text-sm text-muted leading-relaxed">
                                                    {desc}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tech Tags */}
                                    <div className="mt-5 pt-4 border-t border-line flex flex-wrap gap-1.5">
                                        {work.technologies.map((t) => (
                                            <span
                                                key={t}
                                                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-fg/90 border border-line"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action Launch Button */}
                                    {hasLink && (
                                        <div className="mt-5">
                                            <Link
                                                href={linkHref}
                                                target={external ? "_blank" : undefined}
                                                rel={external ? "noopener noreferrer" : undefined}
                                                className="inline-flex items-center justify-between w-full sm:w-auto sm:min-w-[260px] px-5 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs sm:text-sm font-bold text-fg hover:text-[var(--accent)] border border-line hover:border-[var(--line-strong)] transition-all duration-200 shadow-sm"
                                            >
                                                <span>{external ? "Visit Live Platform" : "Explore Case Study & Documentation"}</span>
                                                <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={external ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                                                </svg>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Media Preview Container */}
                                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-line shadow-lg group/img">
                                    {work.imageOrVideo ? (
                                        <img
                                            alt={work.title}
                                            src={work.imageOrVideo}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--surface-2)] text-muted p-6 text-center">
                                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <span className="text-sm font-semibold text-fg">{work.title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Works;
