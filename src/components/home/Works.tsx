import Link from "next/link";
import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-28" id="works">
            <SectionHeading
                index="04"
                label="Selected work"
                note={`${works.length} projects · open source`}
                title="Things I've shipped"
            />

            <div className="mt-10 sm:mt-16">
                {works.map((work, i) => {
                    const external = !work.link?.startsWith("/");

                    return (
                        <article className="work-entry group" data-work-row key={work.title}>
                            {/* Media sticks while its own copy scrolls past, then
                                the next project's shot pushes it up — the stacking
                                comes from CSS `position: sticky`, so it costs no
                                pin and no JS. */}
                            <div className="work-shot" data-parallax-wrap data-work-media>
                                <Link
                                    className="work-card block"
                                    href={work.link}
                                    rel={external ? "noopener noreferrer" : undefined}
                                    tabIndex={-1}
                                    target={external ? "_blank" : undefined}
                                >
                                    <span aria-hidden className="work-sweep" data-work-sweep />
                                    <span aria-hidden className="work-brackets">
                                        <span />
                                        <span />
                                    </span>
                                    <div className="work-image-wrap aspect-[16/10]">
                                        <img alt={work.title} data-parallax src={work.imageOrVideo} />
                                    </div>
                                </Link>
                            </div>

                            <div className="work-copy" data-work-copy>
                                <div className="flex items-center gap-4">
                                    <span className="digit text-4xl leading-none text-accent opacity-25 transition-opacity duration-500 group-hover:opacity-70 sm:text-6xl">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="h-px flex-1 bg-[var(--line)]" />
                                    <span className="label whitespace-nowrap">
                                        {external ? "npm package" : "case study"}
                                    </span>
                                </div>

                                <h3 className="display mt-5 text-2xl leading-tight text-fg transition-colors duration-300 group-hover:text-accent sm:mt-6 sm:text-4xl">
                                    <Link
                                        className="link-wipe"
                                        href={work.link}
                                        rel={external ? "noopener noreferrer" : undefined}
                                        target={external ? "_blank" : undefined}
                                    >
                                        {work.title}
                                    </Link>
                                </h3>

                                <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted sm:mt-5 sm:text-base">
                                    {work.description[0]}
                                </p>

                                <ul className="mt-5 flex flex-wrap gap-2 sm:mt-7">
                                    {work.technologies.map((tech) => (
                                        <li className="tag" key={tech}>
                                            {tech}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    className="label mt-6 inline-flex items-center gap-2 text-accent transition-transform duration-300 group-hover:translate-x-1 sm:mt-8"
                                    href={work.link}
                                    rel={external ? "noopener noreferrer" : undefined}
                                    target={external ? "_blank" : undefined}
                                >
                                    {external ? "Visit project" : "Read the case study"}
                                    <span aria-hidden>{external ? "↗" : "→"}</span>
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Works;
