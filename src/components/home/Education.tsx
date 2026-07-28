import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="education">
            <SectionHeading label="Education" note="Foundations" title="Where I studied" />

            <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-3">
                {education.map((edu) => {
                    const startYear = edu.date.split(/[\s–-]+/)[0];
                    return (
                        <article
                            className="glass-card group relative flex flex-col overflow-hidden p-6 sm:p-7"
                            data-edu-card
                            key={edu.title}
                        >
                            {/* Oversized start year, set as a watermark rather than a label —
                                the sequence is the information here. */}
                            <span
                                aria-hidden
                                className="display pointer-events-none absolute -right-2 -top-4 text-[5.5rem] leading-none text-[var(--accent)] opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.14]"
                            >
                                {startYear}
                            </span>

                            <p className="label relative">{edu.date}</p>

                            <h3 className="display relative mt-4 text-lg leading-snug text-fg transition-colors duration-300 group-hover:text-[var(--accent)] sm:text-xl">
                                {edu.title}
                            </h3>

                            <p className="relative mt-auto pt-4 text-sm leading-relaxed text-muted">
                                {edu.degree}
                            </p>

                            <span
                                aria-hidden
                                className="mt-5 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 group-hover:scale-x-100"
                            />
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Education;
