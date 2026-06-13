import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface ISkills {}

const Skills: FC<ISkills> = () => {
    const { skills } = info;
    return (
        <section className="relative px-4 sm:px-6" id="skills">
            <SectionHeading label="Skills" title="Technologies & Tools" />
            <p className="reveal mx-auto mt-3 max-w-md text-center text-sm font-light text-muted">
                The stack I reach for across full-stack, DevOps, and product work.
            </p>
            <div
                className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 py-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
                data-stagger
            >
                {skills.map((skill, index) => (
                    <div
                        key={skill}
                        style={{ ["--i" as string]: index }}
                        className="group glass-card rail flex h-14 items-center gap-2.5 overflow-hidden px-4"
                    >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--accent)_45%,var(--faint))] shadow-[0_0_0_0_var(--glow)] transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:shadow-[0_0_10px_var(--glow)]" />
                        <span className="relative z-10 truncate text-sm font-semibold tracking-wide text-muted transition-colors duration-300 group-hover:text-fg">
                            {skill}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Skills;
