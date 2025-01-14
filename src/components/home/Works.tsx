import Link from "next/link";
import { FC } from "react";
import info from "./data";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="" id="works">
            <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                Works
            </h2>
            <div className="w-full px-4 pb-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((_, i) => (
                        <div className=" border border-white" key={i}>
                            {_.imageOrVideo.includes("png") ? (
                                <img
                                    alt={_.title}
                                    className="object-cover w-full h-48 opacity-80"
                                    src={_.imageOrVideo}
                                />
                            ) : (
                                <video
                                    className="object-cover w-full h-48 opacity-80"
                                    controls
                                >
                                    <source src={_.imageOrVideo} />
                                </video>
                            )}
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm lg:text-xl font-bold">
                                        {_.title}
                                    </h3>
                                    {_.link && (
                                        <Link
                                            className="text-center text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                                            href={_.link}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            More
                                        </Link>
                                    )}
                                </div>
                                <p className="text-xs lg:text-sm">
                                    {_.description.join(". ")}.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Works;
