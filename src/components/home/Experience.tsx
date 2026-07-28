"use client";

import { FC, useState } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IExperience {}

interface Role {
    title: string;
    company: string;
    date: string;
    description: string[];
    problemSolved?: string;
    technologies?: string[];
}

const TimelineCard: FC<{ role: Role; index: number }> = ({ role, index }) => {
    // The current role opens by default — it's the one worth reading first.
    const [open, setOpen] = useState(index === 0);
    const [start, end] = role.date.split(/\s*[–-]\s*/);
    const isCurrent = /present/i.test(role.date);

    return (
        <article className="timeline-card reveal py-6 sm:py-8">
            <div className="timeline-dot" style={{ top: "2rem" }} />

            <div className="glass-card group/card overflow-hidden p-5 transition-colors duration-300 sm:p-7">
                {/* Period leads the record — the sequence is the information */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                    <div className="min-w-0">
                        <p className="label flex items-center gap-2">
                            <span>{start}</span>
                            <span className="text-faint">→</span>
                            <span className={isCurrent ? "text-accent" : undefined}>
                                {end ?? "Present"}
                            </span>
                            {isCurrent && (
                                <span className="relative ml-1 flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                                </span>
                            )}
                        </p>

                        <h3 className="display mt-3 text-xl leading-tight text-fg transition-colors duration-300 group-hover/card:text-[var(--accent)] sm:text-2xl">
                            {role.title}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-accent">{role.company}</p>
                    </div>

                    <button
                        aria-expanded={open}
                        className="label inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-accent transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]"
                        onClick={() => setOpen((v) => !v)}
                        type="button"
                    >
                        <span>{open ? "Less" : "Detail"}</span>
                        <svg
                            className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {role.problemSolved && (
                    <p className="mt-4 max-w-2xl text-[0.95rem] font-medium leading-relaxed text-fg/90">
                        {role.problemSolved}
                    </p>
                )}

                {role.technologies && (
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                        {role.technologies.map((tech) => (
                            <li className="font-mono text-[0.7rem] text-faint" key={tech}>
                                {tech}
                            </li>
                        ))}
                    </ul>
                )}

                {/* grid-rows 0fr → 1fr animates to auto height without measuring */}
                <div
                    className="grid transition-[grid-template-rows] duration-500 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                    <div className="overflow-hidden">
                        <ul className="mt-5 space-y-2.5 border-l-2 border-[var(--accent)]/30 pl-4">
                            {role.description.map((line) => (
                                <li
                                    className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                                    key={line}
                                >
                                    <span className="mt-1 text-xs text-[var(--accent)]">▹</span>
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </article>
    );
};

const Experience: FC<IExperience> = () => {
    const { experience } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="experience">
            <SectionHeading
                label="Experience"
                note={`${experience.length} roles · 2021 — present`}
                title="Where I've built"
            />

            <div className="relative mt-12" data-timeline>
                <span aria-hidden className="timeline-line" data-timeline-rule />
                {(experience as Role[]).map((role, i) => (
                    <TimelineCard index={i} key={`${role.company}-${role.date}`} role={role} />
                ))}
            </div>
        </section>
    );
};

export default Experience;
