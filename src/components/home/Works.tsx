import ScrollAnimate from "@src/components/ScrollAnimate";
import Link from "next/link";
import { FC } from "react";
import info from "./data";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="mb-0 overflow-hidden" id="works">
            <ScrollAnimate blur direction="right">
                <div className="flex justify-end">
                    <h2 className="text-sm font-semibold tracking-[0.2em] uppercase border-b border-l border-white/10 bg-black/40 py-3 px-8 text-neutral-400">
                        Works
                    </h2>
                </div>
            </ScrollAnimate>
            <div className="w-full px-6 py-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((work, i) => (
                        <ScrollAnimate
                            delay={Math.min(i * 80, 320)}
                            direction="up"
                            key={work.title}
                            scale
                        >
                            <div className="card-nextjs spotlight-glow flex flex-col h-full rounded-xl overflow-hidden shadow-lg group">
                                {work.imageOrVideo.includes("png") ||
                                work.imageOrVideo.includes("jpg") ? (
                                    <img
                                        alt={work.title}
                                        className="object-cover w-full h-44 sm:h-48 opacity-80 group-hover:opacity-100 transition-opacity duration-300 border-b border-white/10"
                                        src={work.imageOrVideo}
                                    />
                                ) : (
                                    <video
                                        className="object-cover w-full h-44 sm:h-48 opacity-80 group-hover:opacity-100 transition-opacity duration-300 border-b border-white/10"
                                        controls
                                    >
                                        <source src={work.imageOrVideo} />
                                    </video>
                                )}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-3">
                                        <h3 className="text-base sm:text-lg font-bold leading-tight text-white">
                                            {work.title}
                                        </h3>
                                        {work.link && (
                                            <Link
                                                className="shrink-0 text-center text-xs px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-md font-medium transition-colors duration-200 shadow-sm"
                                                href={work.link}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                View
                                            </Link>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-400 leading-relaxed flex-1 mt-3 font-light">
                                        {work.description.join(". ")}.
                                    </p>
                                </div>
                            </div>
                        </ScrollAnimate>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Works;
