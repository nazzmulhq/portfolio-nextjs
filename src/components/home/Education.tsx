import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="education">
            <SectionHeading index="03" label="Education" note="Foundations" title="Where I studied" />

            <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-3">
                {education.map((edu, i) => {
                    const startYear = edu.date.split(/[\s–-]+/)[0];
                    return (
                        // data-edu-card, not .reveal — the generic reveal handler
                        // must not claim these; they have their own scrubbed
                        // enter → centre → zoom → exit timeline.
                        <article
                            className="hud group relative flex flex-col overflow-hidden p-6 sm:p-7"
                            data-edu-card
                            key={edu.title}
                        >
                            <span
                                aria-hidden
                                className="display pointer-events-none absolute -right-3 -top-5 text-[5.5rem] leading-none text-fg opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.09]"
                            >
                                {startYear}
                            </span>

                            <div className="relative flex items-center gap-3">
                                <span className="digit text-[0.65rem] text-accent">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="h-px flex-1 bg-[var(--line)]" />
                                <span className="label">{edu.date}</span>
                            </div>

                            <h3 className="display relative mt-6 text-lg leading-snug text-fg transition-colors duration-300 group-hover:text-accent sm:text-xl">
                                {edu.title}
                            </h3>

                            <p className="relative mt-auto pt-5 text-sm leading-relaxed text-muted">
                                {edu.degree}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Education;
