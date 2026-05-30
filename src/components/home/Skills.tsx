import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface ISkills {}

const Skills: FC<ISkills> = () => {
    const { skills } = info;
    return (
        <section className="mb-0 overflow-hidden relative" id="skills">
            <ScrollAnimate blur direction="up">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2 sm:px-6 mt-10 sm:mt-16 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-emerald-500/40 flex-1 min-w-[10px] max-w-xs"></div>
                    <h2 className="text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center shrink-0 whitespace-nowrap">
                        <span className="text-emerald-400 mr-2 sm:mr-3 text-sm sm:text-lg leading-none">✦</span>
                        Skills
                        <span className="text-teal-400 ml-2 sm:ml-3 text-sm sm:text-lg leading-none">✦</span>
                    </h2>
                    <div className="h-px bg-gradient-to-r from-emerald-500/40 to-transparent flex-1 min-w-[10px] max-w-xs"></div>
                </div>
            </ScrollAnimate>
            <div className="py-6 sm:py-10">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6">
                    {skills.map((skill, index) => (
                        <ScrollAnimate
                            delay={Math.min(index * 30, 300)}
                            direction="up"
                            key={index}
                            scale
                        >
                            <div className="group relative h-12 sm:h-14 flex items-center justify-center px-3 sm:px-4 rounded-xl bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-400/60 transition-all duration-300 overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.25)] hover:-translate-y-1 select-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none"></div>
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-y-50 group-hover:scale-y-100"></div>
                                <span className="relative z-10 text-sm font-semibold tracking-wide text-slate-300 group-hover:text-white transition-colors duration-300">
                                    {skill}
                                </span>
                            </div>
                        </ScrollAnimate>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
