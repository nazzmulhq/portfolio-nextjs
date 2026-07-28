import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";
import { iconFor } from "./techIcons";

export interface ISkills {}

const TechMark: FC<{ name: string }> = ({ name }) => {
    const icon = iconFor(name);
    if (!icon) return null;

    return (
        <svg
            aria-hidden
            className="tile-icon"
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
    );
};

const Skills: FC<ISkills> = () => {
    const { skillGroups } = info;

    // Flattened once so the matrix is a single continuous grid — the
    // discipline stays legible through each tile's own tag.
    const cells = skillGroups.flatMap((group, gi) =>
        group.items.map((item) => ({
            name: item,
            group: group.label,
            tag: group.label.slice(0, 3).toUpperCase(),
            groupIndex: gi,
            hex: iconFor(item)?.hex,
        })),
    );

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="skills">
            <SectionHeading
                index="01"
                label="Capabilities"
                note={`${cells.length} tools · ${skillGroups.length} disciplines`}
                title="What I work with"
            />

            {/* Legend — maps each three-letter tag back to its discipline. */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2" data-skill-legend>
                {skillGroups.map((group) => (
                    <span className="flex items-baseline gap-2" key={group.label}>
                        <span className="digit text-[0.6rem] text-accent">
                            {group.label.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="label text-muted">{group.label}</span>
                        <span className="digit text-[0.6rem] text-faint">
                            {String(group.items.length).padStart(2, "0")}
                        </span>
                    </span>
                ))}
            </div>

            {/* Matrix. A scan line sweeps down it on scroll (see HomeMotion). */}
            <div className="matrix mt-6" data-skill-matrix>
                <span aria-hidden className="matrix-scan" data-skill-scan />

                {cells.map((cell, i) => (
                    <article
                        className="tile"
                        data-skill-tile
                        key={cell.name}
                        // --brand drives the hover colour. Icons sit monochrome by
                        // default: eighteen brand palettes at once would drown the
                        // single-accent scheme, so the real colour is the reward
                        // for pointing at one.
                        style={
                            {
                                "--g": cell.groupIndex,
                                "--brand": cell.hex ?? "var(--accent)",
                            } as React.CSSProperties
                        }
                    >
                        <span className="tile-idx">{String(i + 1).padStart(2, "0")}</span>
                        <span className="tile-tag">{cell.tag}</span>
                        <TechMark name={cell.name} />
                        <span className="tile-name">{cell.name}</span>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Skills;
