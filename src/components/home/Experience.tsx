import { FC } from "react";
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

const RoleCard: FC<{ role: Role; index: number; total: number }> = ({ role, index, total }) => {
    const [start, end] = role.date.split(/\s*[–-]\s*/);
    const isCurrent = /present/i.test(role.date);

    return (
        <article className="exp-card" data-exp-card style={{ zIndex: index + 1 }}>
            <div className="exp-panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3 sm:gap-4 sm:pb-4">
                    <div className="min-w-0">
                        <p className="label flex items-center gap-2">
                            <span>{start}</span>
                            <span className="text-faint">→</span>
                            <span className={isCurrent ? "text-hot" : undefined}>
                                {end ?? "Present"}
                            </span>
                            {isCurrent && <span className="pulse-dot ml-1" />}
                        </p>

                        <h3 className="display mt-2.5 text-lg leading-tight text-fg sm:mt-3 sm:text-2xl lg:text-3xl">
                            {role.title}
                        </h3>
                        <p className="mt-1.5 font-mono text-xs tracking-wide text-accent">
                            {role.company}
                        </p>
                    </div>

                    <span className="digit shrink-0 text-[0.65rem] tracking-[0.2em] text-faint">
                        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                </div>

                {role.problemSolved && (
                    <p className="mt-4 max-w-2xl text-[0.875rem] leading-relaxed text-fg/90 sm:mt-5 sm:text-[0.95rem]">
                        {role.problemSolved}
                    </p>
                )}

                <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                    {role.description.map((line) => (
                        <li
                            className="flex items-start gap-2.5 text-[0.8rem] leading-relaxed text-muted sm:gap-3 sm:text-sm"
                            key={line}
                        >
                            <span className="mt-[0.45rem] h-px w-3 shrink-0 bg-[var(--accent)] opacity-60" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>

                {role.technologies && (
                    <ul className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-3 sm:mt-6 sm:gap-2 sm:pt-4">
                        {role.technologies.map((tech) => (
                            <li className="tag" key={tech}>
                                {tech}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </article>
    );
};

const Experience: FC<IExperience> = () => {
    const roles = info.experience as Role[];

    return (
        // Tighter desktop padding: the pinned stage supplies its own height, so
        // full section padding only adds dead space above and below.
        <section
            className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24 lg:py-8"
            id="experience"
        >
            {/* Pinned stage holds the heading too — pinning only the deck
                scrolls "Where I've built" off screen for the whole sequence,
                leaving five unlabelled cards cycling on their own.

                The absolute stacking is gated behind [data-deck-ready], which
                JS only sets once the pinned timeline is actually running, so a
                failure leaves a readable vertical list rather than a pile of
                overlapping cards. */}
            <div className="exp-stage mt-2 lg:mt-0" data-exp-stage>
                <SectionHeading
                    index="02"
                    label="Experience"
                    note={`${roles.length} roles · 2021 — present`}
                    title="Where I've built"
                />

                <div className="exp-nodes mb-5 mt-6 sm:mt-8" data-exp-nodes>
                    {roles.map((role, i) => (
                        <span
                            className="exp-node"
                            data-exp-node
                            data-on={i === 0 ? "" : undefined}
                            key={`${role.company}-${role.date}`}
                        />
                    ))}
                </div>

                <div className="exp-deck" data-exp-deck>
                    {roles.map((role, i) => (
                        <RoleCard
                            index={i}
                            key={`${role.company}-${role.date}`}
                            role={role}
                            total={roles.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
