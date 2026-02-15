import ScrollAnimate from "@src/components/ScrollAnimate";
import Link from "next/link";
import { FC } from "react";
import info from "./data";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="" id="works">
            <ScrollAnimate direction="right">
                <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                    Works
                </h2>
            </ScrollAnimate>
            <div className="w-full px-4 pb-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((work, i) => (
                        <ScrollAnimate
                            delay={i * 100}
                            direction="up"
                            key={work.title}
                        >
                            <div className=" border border-white">
                                {work.imageOrVideo.includes("png") ||
                                work.imageOrVideo.includes("jpg") ? (
                                    <img
                                        alt={work.title}
                                        className="object-cover w-full h-48 opacity-80"
                                        src={work.imageOrVideo}
                                    />
                                ) : (
                                    <video
                                        className="object-cover w-full h-48 opacity-80"
                                        controls
                                    >
                                        <source src={work.imageOrVideo} />
                                    </video>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm lg:text-xl font-bold">
                                            {work.title}
                                        </h3>
                                        {work.link && (
                                            <Link
                                                className="text-center text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                                                href={work.link}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                More
                                            </Link>
                                        )}
                                    </div>
                                    <p className="text-xs lg:text-sm">
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
