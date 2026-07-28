"use client";

import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface ISkills {}

/** Repeat items enough times to fill any viewport so the loop never shows a gap. */
const MarqueeRow: FC<{ items: string[]; reverse?: boolean; speed?: number }> = ({
    items,
    reverse = false,
    speed = 30,
}) => {
    const repeated = Array(6).fill(items).flat();

    return (
        <div
            aria-label={items.join(", ")}
            className="relative overflow-hidden py-1"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
            }}
        >
            <div
                className="marquee-track"
                data-reverse={reverse || undefined}
                style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
            >
                {repeated.map((item, i) => (
                    <span className="marquee-pill shrink-0" key={`${item}-${i}`}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Skills: FC<ISkills> = () => {
    const { skillGroups } = info;
    const total = skillGroups.reduce((n, g) => n + g.items.length, 0);

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="skills">
            <SectionHeading
                label="Capabilities"
                note={`${total} tools · ${skillGroups.length} disciplines`}
                title="What I work with"
            />

            <div className="mt-12">
                {skillGroups.map((group, i) => (
                    <div
                        className="reveal grid gap-3 border-t border-line py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-8"
                        key={group.label}
                    >
                        {/* Labelled index column gives the moving track something to
                            read against — the discipline is the information. */}
                        <div className="flex items-baseline gap-3 sm:flex-col sm:items-start sm:gap-1">
                            <p className="label text-fg">{group.label}</p>
                            <p className="font-mono text-[0.65rem] text-faint">
                                {String(group.items.length).padStart(2, "0")} tools
                            </p>
                        </div>

                        <MarqueeRow items={group.items} reverse={i % 2 === 1} speed={26 + i * 4} />
                    </div>
                ))}
                <div className="border-t border-line" />
            </div>
        </section>
    );
};

export default Skills;
