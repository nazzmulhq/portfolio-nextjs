import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24" id="education">
            {/* Pinned stage, like Experience: the heading travels with the cards
                so the section stays labelled while records cycle through.
                [data-edu-ready] gates the absolute stacking on JS being live —
                without it these stay a readable three-column grid. */}
            <div className="edu-stage" data-edu-stage>
                <SectionHeading
                    index="03"
                    label="Education"
                    note={`${education.length} records · 2010 — 2020`}
                    title="Where I studied"
                />

                <div className="edu-nodes mb-5 mt-6 sm:mt-8" data-edu-nodes>
                    {education.map((edu, i) => (
                        <span
                            className="exp-node"
                            data-edu-node
                            data-on={i === 0 ? "" : undefined}
                            key={edu.title}
                        />
                    ))}
                </div>

                <div className="edu-deck" data-edu-deck>
                    {education.map((edu, i) => {
                        const startYear = edu.date.split(/[\s–-]+/)[0];
                        return (
                            <article className="edu-card" data-edu-card key={edu.title}>
                                <div className="edu-panel">
                                    {/* Oversized year watermark — the sequence is
                                        the information here. */}
                                    <span aria-hidden className="edu-year">
                                        {startYear}
                                    </span>

                                    <div className="relative flex items-center gap-3">
                                        <span className="digit text-[0.65rem] text-accent">
                                            {String(i + 1).padStart(2, "0")} /{" "}
                                            {String(education.length).padStart(2, "0")}
                                        </span>
                                        <span className="h-px flex-1 bg-[var(--line)]" />
                                        <span className="label">{edu.date}</span>
                                    </div>

                                    <h3 className="display relative mt-7 text-2xl leading-tight text-fg sm:text-3xl lg:text-4xl">
                                        {edu.title}
                                    </h3>

                                    <p className="relative mt-4 max-w-lg text-base leading-relaxed text-muted">
                                        {edu.degree}
                                    </p>

                                    <p className="label relative mt-8">
                                        Dhaka · Bangladesh
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Education;
