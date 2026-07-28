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
            <div className="glass-card exp-panel">
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

                        <h3 className="display mt-3 text-xl leading-tight text-fg sm:text-2xl lg:text-3xl">
                            {role.title}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-accent">{role.company}</p>
                    </div>

                    <span className="label shrink-0 text-faint">
                        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                </div>

                {role.problemSolved && (
                    <p className="mt-4 max-w-2xl text-[0.95rem] font-medium leading-relaxed text-fg/90">
                        {role.problemSolved}
                    </p>
                )}

                <ul className="mt-4 space-y-2 border-l-2 border-[var(--accent)]/30 pl-4">
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

                {role.technologies && (
                    <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4">
                        {role.technologies.map((tech) => (
                            <li className="font-mono text-[0.7rem] text-faint" key={tech}>
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
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="experience">
            <SectionHeading
                label="Experience"
                note={`${roles.length} roles · 2021 — present`}
                title="Where I've built"
            />

            {/* Pinned stage: on desktop the roles stack as panels and advance with
                scroll. Without JS (or on mobile) they stay a normal vertical list —
                the deck only becomes absolutely-positioned once JS marks it ready. */}
            <div className="exp-stage mt-12" data-exp-stage>
                <div className="exp-rail" data-exp-rail>
                    <span className="exp-rail-fill" data-exp-rail-fill />
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
