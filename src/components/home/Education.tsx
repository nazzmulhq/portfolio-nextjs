import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section className="mb-0 overflow-hidden relative" id="education">
            <ScrollAnimate blur direction="up">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2 sm:px-6 mt-10 sm:mt-16 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-emerald-500/40 flex-1 min-w-[10px] max-w-xs"></div>
                    <h2 className="text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center shrink-0 whitespace-nowrap">
                        <span className="text-emerald-400 mr-2 sm:mr-3 text-sm sm:text-lg leading-none">✦</span>
                        Education
                        <span className="text-teal-400 ml-2 sm:ml-3 text-sm sm:text-lg leading-none">✦</span>
                    </h2>
                    <div className="h-px bg-gradient-to-r from-emerald-500/40 to-transparent flex-1 min-w-[10px] max-w-xs"></div>
                </div>
            </ScrollAnimate>
            <div className="w-full max-w-4xl mx-auto py-10 px-6 space-y-6">
                {education.map((edu, index) => (
                    <ScrollAnimate
                        delay={index * 100}
                        direction="up"
                        key={index}
                        scale
                    >
                        <div className="group relative p-5 sm:px-8 min-h-24 sm:min-h-28 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:-translate-y-1.5 flex flex-col justify-center">
                            {/* Glowing Left Accent Line */}
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-md opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-y-50 group-hover:scale-y-100 z-30"></div>
                            
                            {/* Hover gradient background effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <time className="text-[10px] sm:text-xs font-mono tracking-wider text-slate-500 mb-2 uppercase block bg-black/30 w-max px-2 py-1 rounded-md border border-slate-800">
                                    {edu.date}
                                </time>
                                <div className="text-base sm:text-xl font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors duration-300">
                                    {edu.title}
                                </div>
                                <div className="font-semibold text-emerald-400/90 text-[11px] sm:text-base mt-1 sm:mt-1.5">
                                    {edu.degree}
                                </div>
                            </div>
                        </div>
                    </ScrollAnimate>
                ))}
            </div>
        </section>
    );
};

export default Education;
