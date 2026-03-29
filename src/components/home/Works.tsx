import ScrollAnimate from "@src/components/ScrollAnimate";
import Link from "next/link";
import { FC } from "react";
import info from "./data";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="pb-6" id="works">
            <ScrollAnimate blur direction="right">
                <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                    Works
                </h2>
            </ScrollAnimate>
            <div className="w-full px-4 pb-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((work, i) => (
                        <ScrollAnimate
                            delay={Math.min(i * 80, 320)}
                            direction="up"
                            key={work.title}
                            scale
                        >
                            <div className="border border-white flex flex-col h-full card-hover overflow-hidden">
                                {work.imageOrVideo.includes("png") ||
                                work.imageOrVideo.includes("jpg") ? (
                                    <img
                                        alt={work.title}
                                        className="object-cover w-full h-44 sm:h-48 opacity-80"
                                        src={work.imageOrVideo}
                                    />
                                ) : (
                                    <video
                                        className="object-cover w-full h-44 sm:h-48 opacity-80"
                                        controls
                                    >
                                        <source src={work.imageOrVideo} />
                                    </video>
                                )}
                                <div className="p-3 sm:p-4 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="text-sm sm:text-base font-bold leading-tight">
                                            {work.title}
                                        </h3>
                                        {work.link && (
                                            <Link
                                                className="shrink-0 text-center text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors duration-200"
                                                href={work.link}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                More
                                            </Link>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed flex-1">
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
