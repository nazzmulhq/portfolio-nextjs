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
                note={`${works.length} projects`}
                title="Things I've shipped"
            />

            <div className="mt-10 sm:mt-16">
                {works.map((work, i) => {
                    const hasLink = Boolean(work.link);
                    const external = hasLink && !work.link!.startsWith("/");
                    const npmPackage = external && work.link!.includes("npmjs.com");
                    const linkProps = hasLink
                        ? {
                              href: work.link!,
                              rel: external ? "noopener noreferrer" : undefined,
                              target: external ? "_blank" : undefined,
                          }
                        : null;

                    const media = (
                        <div className="work-image-wrap aspect-[16/10]">
                            {work.imageOrVideo ? (
                                <img alt={work.title} data-parallax src={work.imageOrVideo} />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-line bg-surface px-6 text-center text-muted">
                                    <svg aria-hidden className="h-8 w-8 opacity-60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-base font-semibold text-fg sm:text-lg">{work.title}</span>
                                    <span className="label">Internal &amp; confidential</span>
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <article className="work-entry group" data-work-row key={work.title}>
                            {/* Media sticks while its own copy scrolls past, then
                                the next project's shot pushes it up — the stacking
                                comes from CSS `position: sticky`, so it costs no
                                pin and no JS. */}
                            <div className="work-shot" data-parallax-wrap data-work-media>
                                {linkProps ? (
                                    <Link className="work-card block" tabIndex={-1} {...linkProps}>
                                        <span aria-hidden className="work-sweep" data-work-sweep />
                                        <span aria-hidden className="work-brackets">
                                            <span />
                                            <span />
                                        </span>
                                        {media}
                                    </Link>
                                ) : (
                                    <div className="work-card block">
                                        <span aria-hidden className="work-brackets">
                                            <span />
                                            <span />
                                        </span>
                                        {media}
                                    </div>
                                )}
                            </div>

                            <div className="work-copy" data-work-copy>
                                <div className="flex items-center gap-4">
                                    <span className="digit text-4xl leading-none text-accent opacity-25 transition-opacity duration-500 group-hover:opacity-70 sm:text-6xl">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="h-px flex-1 bg-[var(--line)]" />
                                    <span className="label whitespace-nowrap">
                                        {!hasLink ? "internal system" : npmPackage ? "npm package" : external ? "live project" : "case study"}
                                    </span>
                                </div>

                                <h3 className="display mt-5 text-2xl leading-tight text-fg transition-colors duration-300 group-hover:text-accent sm:mt-6 sm:text-4xl">
                                    {linkProps ? (
                                        <Link className="link-wipe" {...linkProps}>
                                            {work.title}
                                        </Link>
                                    ) : (
                                        work.title
                                    )}
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

                                {linkProps && (
                                    <Link
                                        className="label mt-6 inline-flex items-center gap-2 text-accent transition-transform duration-300 group-hover:translate-x-1 sm:mt-8"
                                        {...linkProps}
                                    >
                                        {external ? "Visit project" : "Read the case study"}
                                        <span aria-hidden>{external ? "↗" : "→"}</span>
                                    </Link>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default Works;
