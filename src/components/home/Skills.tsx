import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface ISkills {}

/**
 * Horizontal track. On desktop the section pins and these panels travel
 * sideways with scroll; below that breakpoint the same markup is a plain
 * responsive grid, so it stays readable with JS off.
 */
const Skills: FC<ISkills> = () => {
    const { skillGroups } = info;
    const total = skillGroups.reduce((n, g) => n + g.items.length, 0);

    return (
        <section className="py-20 sm:py-28" id="skills">
            {/* Heading and track are pinned together — pinning the track alone
                scrolls the heading off the screen while the panels travel, so
                the moving row loses the label that explains it. */}
            <div className="skill-stage" data-skill-stage>
                <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
                    <SectionHeading
                        index="01"
                        label="Capabilities"
                        note={`${total} tools · ${skillGroups.length} disciplines`}
                        title="What I work with"
                    />
                </div>

                {/* Padding lives on the track, not the section, so the first
                    panel still lines up with the heading before it travels. */}
                <div className="skill-viewport mt-10">
                    <div
                        className="skill-track px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3"
                        data-skill-track
                    >
                        {skillGroups.map((group, i) => (
                            <article
                                className="skill-panel"
                                data-index={String(i + 1).padStart(2, "0")}
                                data-skill-panel
                                key={group.label}
                            >
                                <div className="flex items-baseline justify-between gap-4">
                                    <h3 className="display text-2xl text-fg">{group.label}</h3>
                                    <span className="digit text-[0.65rem] text-faint">
                                        {String(group.items.length).padStart(2, "0")}
                                    </span>
                                </div>

                                <ul className="mt-6">
                                    {group.items.map((item, j) => (
                                        <li className="skill-item" key={item}>
                                            <span className="idx">
                                                {String(j + 1).padStart(2, "0")}
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <span className="label mt-6 block border-t border-line pt-4 text-accent">
                                    {group.label.slice(0, 3)}—{String(i + 1).padStart(2, "0")}
                                </span>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;
