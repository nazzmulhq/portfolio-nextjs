"use client";

import { FC, useState } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    const [activeIdx, setActiveIdx] = useState<number | null>(0);

    const toggle = (index: number, e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("a") || target.closest("button")) return;
        setActiveIdx((prev) => (prev === index ? null : index));
    };

    return (
        <section className="relative px-4 sm:px-6" id="experience">
            <SectionHeading label="Experience" />
            <div className="mx-auto mt-8 w-full max-w-4xl space-y-5 py-6" data-stagger>
                {experience.map((exp: any, index: number) => {
                    const open = activeIdx === index;
                    return (
                        <div
                            key={`${exp.company}-${index}`}
                            style={{ ["--i" as string]: index }}
                            className="group glass-card rail cursor-pointer overflow-hidden p-5 sm:p-6"
                            onClick={(e) => toggle(index, e)}
                        >
                            <div className="relative z-10 flex h-full flex-col">
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="font-display text-base font-bold leading-tight text-fg transition-colors duration-300 group-hover:text-accent sm:text-lg">
                                            {exp.title}
                                        </h3>
                                        <h4 className="text-xs font-semibold text-accent/90 sm:text-sm">
                                            {exp.company}
                                        </h4>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-center">
                                        <span className="chip font-mono uppercase">{exp.date}</span>
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-muted">
                                            <svg
                                                className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180 text-accent" : ""}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {!open && (
                                    <p className="mb-2 line-clamp-1 text-xs font-light text-muted">
                                        {exp.description[0]}
                                    </p>
                                )}

                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                        open ? "mb-4 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <ul className="mt-2 space-y-2 text-xs font-light leading-relaxed text-muted sm:text-sm">
                                        {exp.description.map((desc: string, i: number) => (
                                            <li className="flex items-start gap-2.5" key={i}>
                                                <svg className="mt-1 h-3 w-3 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{desc}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {exp.problemSolved && (
                                        <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[var(--accent-soft)] p-3.5">
                                            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-accent">
                                                Key Problem Solved
                                            </span>
                                            <p className="text-xs font-light leading-relaxed text-fg/90">
                                                {exp.problemSolved}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {exp.technologies && (
                                    <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-3">
                                        {exp.technologies.map((tech: string) => (
                                            <span key={tech} className="chip">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Experience;
