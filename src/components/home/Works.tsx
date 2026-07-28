import Link from "next/link";
import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="works">
            <SectionHeading
                index="04"
                label="Selected work"
                note={`${works.length} projects · open source`}
                title="Things I've shipped"
            />

            <div className="mt-14">
                {works.map((work, i) => {
                    const external = !work.link?.startsWith("/");
                    const flip = i % 2 === 1;

                    return (
                        <article
                            className="group border-t border-line py-10 sm:py-14"
                            data-work-row
                            key={work.title}
                        >
                            <Link
                                className="block"
                                href={work.link}
                                rel={external ? "noopener noreferrer" : undefined}
                                target={external ? "_blank" : undefined}
                            >
                                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
                                    {/* Media — unmasks sideways with a sweep passing over it */}
                                    <div
                                        className={`work-card group/img relative overflow-hidden ${flip ? "lg:order-2" : ""}`}
                                        data-parallax-wrap
                                        data-work-media
                                    >
                                        <span aria-hidden className="work-sweep" data-work-sweep />
                                        <div className="work-image-wrap aspect-[16/10]">
                                            <img alt={work.title} data-parallax src={work.imageOrVideo} />
                                        </div>
                                    </div>

                                    {/* Copy — travels against the media column */}
                                    <div
                                        className={`min-w-0 ${flip ? "lg:order-1" : ""}`}
                                        data-work-copy
                                    >
                                        <div className="flex items-baseline gap-4">
                                            <span className="digit text-3xl leading-none text-accent opacity-30 transition-opacity duration-300 group-hover:opacity-80">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="label">
                                                {external ? "npm package" : "case study"}
                                            </span>
                                        </div>

                                        <h3 className="display mt-4 text-2xl leading-tight text-fg transition-colors duration-300 group-hover:text-accent sm:text-3xl lg:text-4xl">
                                            <span className="link-wipe">{work.title}</span>
                                        </h3>

                                        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
                                            {work.description[0]}
                                        </p>

                                        <ul className="mt-6 flex flex-wrap gap-2">
                                            {work.technologies.map((tech) => (
                                                <li className="tag" key={tech}>
                                                    {tech}
                                                </li>
                                            ))}
                                        </ul>

                                        <span className="label mt-7 inline-flex items-center gap-2 text-accent transition-transform duration-300 group-hover:translate-x-1">
                                            {external ? "Visit project" : "Read the case study"}
                                            <span aria-hidden>{external ? "↗" : "→"}</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    );
                })}
                <div className="border-t border-line" />
            </div>
        </section>
    );
};

export default Works;
