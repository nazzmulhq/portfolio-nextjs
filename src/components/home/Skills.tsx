"use client";

import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";
import { iconFor } from "./techIcons";

export interface ISkills {}

const TechPill: FC<{ name: string }> = ({ name }) => {
    const icon = iconFor(name);

    return (
        <div
            className="group/pill inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-line hover:border-[var(--line-strong)] transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-default"
            style={{
                ["--brand" as any]: icon?.hex ?? "var(--accent)",
            }}
        >
            {icon && (
                <svg
                    aria-hidden
                    className="w-3.5 h-3.5 text-muted group-hover/pill:text-[var(--brand)] transition-colors duration-200 shrink-0"
                    fill={icon.stroke ? "none" : "currentColor"}
                    role="presentation"
                    stroke={icon.stroke ? "currentColor" : undefined}
                    strokeLinecap={icon.stroke ? "round" : undefined}
                    strokeLinejoin={icon.stroke ? "round" : undefined}
                    strokeWidth={icon.stroke ? 1.6 : undefined}
                    viewBox="0 0 24 24"
                >
                    {icon.paths.map((d) => (
                        <path d={d} key={d} />
                    ))}
                </svg>
            )}
            <span className="text-xs font-semibold text-fg/90 group-hover/pill:text-fg transition-colors">
                {name}
            </span>
        </div>
    );
};

const DOMAIN_CONFIG: Record<string, { icon: string; badge: string; color: string }> = {
    Frontend: {
        icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        badge: "Client Architecture",
        color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    Backend: {
        icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
        badge: "Services & APIs",
        color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    Data: {
        icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
        badge: "Storage & Cache",
        color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    Infrastructure: {
        icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
        badge: "DevOps & Cloud",
        color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
    Languages: {
        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        badge: "Core Engineering",
        color: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30",
    },
};

const Skills: FC<ISkills> = () => {
    const { skillGroups } = info;
    const totalSkills = skillGroups.reduce((acc, g) => acc + g.items.length, 0);

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24" id="skills">
            <SectionHeading
                index="01"
                label="Technical Capabilities"
                note={`${totalSkills} tools &amp; frameworks · ${skillGroups.length} disciplines`}
                title="Skills &amp; Technologies"
            />

            {/* Categorized Capability Cards */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {skillGroups.map((group) => {
                    const config = DOMAIN_CONFIG[group.label] ?? {
                        icon: "M13 10V3L4 14h7v7l9-11h-7z",
                        badge: "Domain",
                        color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
                    };

                    return (
                        <div
                            key={group.label}
                            className="group rounded-3xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] border border-line hover:border-[var(--line-strong)] p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] border border-line shadow-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={config.icon}
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-fg tracking-tight">
                                                {group.label}
                                            </h3>
                                            <span className="text-[10px] font-mono text-muted">
                                                {config.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold text-faint bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-line">
                                        {group.items.length}
                                    </span>
                                </div>

                                {/* Skill Pills */}
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((item) => (
                                        <TechPill key={item} name={item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Skills;
