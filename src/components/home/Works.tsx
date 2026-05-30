import ScrollAnimate from "@src/components/ScrollAnimate";
import Link from "next/link";
import { FC } from "react";
import info from "./data";

export interface IWorks {}

const Works: FC<IWorks> = () => {
    const { works } = info;
    return (
        <section className="mb-0 overflow-hidden relative" id="works">
            <ScrollAnimate blur direction="up">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2 sm:px-6 mt-10 sm:mt-16 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-emerald-500/40 flex-1 min-w-[10px] max-w-xs"></div>
                    <h2 className="text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center shrink-0 whitespace-nowrap">
                        <span className="text-emerald-400 mr-2 sm:mr-3 text-sm sm:text-lg leading-none">✦</span>
                        Works
                        <span className="text-teal-400 ml-2 sm:ml-3 text-sm sm:text-lg leading-none">✦</span>
                    </h2>
                    <div className="h-px bg-gradient-to-r from-emerald-500/40 to-transparent flex-1 min-w-[10px] max-w-xs"></div>
                </div>
            </ScrollAnimate>
            <div className="w-full px-6 py-10">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((work, i) => (
                        <ScrollAnimate
                            delay={Math.min(i * 80, 320)}
                            direction="up"
                            key={work.title}
                            scale
                        >
                            <div className="group relative h-full flex flex-col rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:-translate-y-1.5">
                                {/* Glowing Left Accent Line */}
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-md opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-y-50 group-hover:scale-y-100 z-30"></div>
                                
                                {/* Hover gradient background effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    {work.imageOrVideo.includes("png") || work.imageOrVideo.includes("jpg") ? (
                                        <div className="w-full h-32 sm:h-48 bg-slate-900/80 border-b border-slate-700/50 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-20"></div>
                                            <img
                                                alt={work.title}
                                                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 relative z-10"
                                                src={work.imageOrVideo}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 sm:h-48 bg-slate-900/80 border-b border-slate-700/50 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-20"></div>
                                            <video
                                                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
                                                controls
                                            >
                                                <source src={work.imageOrVideo} />
                                            </video>
                                        </div>
                                    )}
                                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                                        <h3 className="text-base sm:text-xl font-bold leading-tight text-white group-hover:text-emerald-400 transition-colors duration-300 mb-2">
                                            {work.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-1 font-light mb-4">
                                            {work.description.join(". ")}.
                                        </p>
                                        {work.link && (
                                            <Link
                                                className="group mt-auto relative w-full overflow-hidden inline-flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-2 sm:py-2.5 bg-slate-800/80 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                                                href={work.link}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                                <span className="relative z-10">View Project</span>
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </Link>
                                        )}
                                    </div>
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
