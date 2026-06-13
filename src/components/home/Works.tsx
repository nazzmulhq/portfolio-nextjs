import Link from "next/link";
import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IWorks {}

const isImage = (src: string) => /\.(png|jpg|jpeg|webp|gif)$/i.test(src);

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="relative px-4 pb-12 sm:px-6" id="works">
            <SectionHeading label="Works" />
            <div
                className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 py-6 sm:grid-cols-2"
                data-stagger
            >
                {works.map((work, index) => (
                    <div
                        key={work.title}
                        style={{ ["--i" as string]: index }}
                        className="group glass-card rail flex h-full flex-col overflow-hidden"
                    >
                        <div className="relative h-36 w-full overflow-hidden border-b border-line bg-[var(--surface-2)] sm:h-48">
                            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-70" />
                            {isImage(work.imageOrVideo) ? (
                                <img
                                    alt={work.title}
                                    className="relative z-10 h-full w-full object-cover opacity-90"
                                    src={work.imageOrVideo}
                                />
                            ) : (
                                <video className="relative z-10 h-full w-full object-cover" controls>
                                    <source src={work.imageOrVideo} />
                                </video>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                            <h3 className="font-display text-lg font-bold leading-tight text-fg transition-colors duration-300 group-hover:text-accent sm:text-xl">
                                {work.title}
                            </h3>
                            <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-muted">
                                {work.description.join(". ")}.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {work.technologies.slice(0, 4).map((tech) => (
                                    <span key={tech} className="chip">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            {work.link && (
                                <Link
                                    className="btn-ghost sheen mt-5 w-full text-sm"
                                    href={work.link}
                                    rel="noopener noreferrer"
                                    target={work.link.startsWith("/") ? undefined : "_blank"}
                                >
                                    <span className="relative z-10">View Project</span>
                                    <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Works;
