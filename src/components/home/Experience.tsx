"use client";

import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC, useState } from "react";
import info from "./data";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    
    // Track the currently active (expanded) card index. Defaults to 0 (first card).
    const [activeIdx, setActiveIdx] = useState<number | null>(0);

    const toggleExpand = (index: number, e: React.MouseEvent) => {
        // Prevent toggling if user clicks interactive items like links inside cards
        const target = e.target as HTMLElement;
        if (target.closest("a") || target.closest("button")) return;

        setActiveIdx((prev) => (prev === index ? null : index));
    };

    return (
        <section className="mb-0 overflow-hidden relative" id="experience">
            <ScrollAnimate blur direction="up">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2 sm:px-6 mt-10 sm:mt-16 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent to-emerald-500/40 flex-1 min-w-[10px] max-w-xs"></div>
                    <h2 className="text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center shrink-0 whitespace-nowrap">
                        <span className="text-emerald-400 mr-2 sm:mr-3 text-sm sm:text-lg leading-none">✦</span>
                        Experience
                        <span className="text-teal-400 ml-2 sm:ml-3 text-sm sm:text-lg leading-none">✦</span>
                    </h2>
                    <div className="h-px bg-gradient-to-r from-emerald-500/40 to-transparent flex-1 min-w-[10px] max-w-xs"></div>
                </div>
            </ScrollAnimate>
            <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
                {experience.map((exp: any, index: number) => {
                    const isCardExpanded = activeIdx === index;
                    return (
                        <ScrollAnimate
                            className="w-full"
                            delay={Math.min(index * 75, 300)}
                            direction={index % 2 === 0 ? "left" : "right"}
                            key={index}
                            scale
                        >
                            <div 
                                onClick={(e) => toggleExpand(index, e)}
                                className="group relative p-5 sm:p-6 h-full flex flex-col rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:-translate-y-1.5 cursor-pointer select-none"
                            >
                                {/* Glowing Left Accent Line */}
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-md opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-y-50 group-hover:scale-y-100"></div>
                                
                                {/* Hover gradient background effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col h-full w-full">
                                    {/* Responsive Header Layout */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                        <div className="space-y-0.5">
                                            <h3 className="text-base sm:text-lg font-bold leading-tight text-white group-hover:text-emerald-400 transition-colors duration-300">
                                                {exp.title}
                                            </h3>
                                            <h4 className="text-xs sm:text-sm font-semibold text-emerald-400/90">
                                                {exp.company}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                                            <span className="text-[9px] sm:text-xs font-mono tracking-wider text-slate-400 uppercase bg-black/30 px-2.5 py-1 rounded border border-slate-800 whitespace-nowrap">
                                                {exp.date}
                                            </span>
                                            {/* Chevron Toggle Icon */}
                                            <div className="w-5 h-5 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                                                <svg 
                                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isCardExpanded ? "rotate-180 text-emerald-400" : ""}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Brief snippet visible when collapsed */}
                                    {!isCardExpanded && (
                                        <p className="text-xs text-slate-400 font-light line-clamp-1 mb-2">
                                            {exp.description[0]}
                                        </p>
                                    )}

                                    {/* Collapsible Content Area */}
                                    <div 
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                            isCardExpanded 
                                                ? "max-h-[800px] opacity-100 mb-4" 
                                                : "max-h-0 opacity-0 pointer-events-none"
                                        }`}
                                    >
                                        <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light space-y-2 mt-2">
                                            {exp.description.map((desc: string, i: number) => (
                                                <li className="flex items-start gap-2.5" key={i}>
                                                    <span className="text-emerald-500 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full shrink-0">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                    <span>{desc}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {exp.problemSolved && (
                                            <div className="mt-4">
                                                <div className="p-3.5 bg-emerald-950/20 rounded-xl border border-emerald-900/30 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="mt-0.5 shrink-0">
                                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">Key Problem Solved</span>
                                                            <p className="text-xs text-emerald-100/90 leading-relaxed font-light">{exp.problemSolved}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Technologies tags (always visible for visual parsing) */}
                                    {exp.technologies && (
                                        <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                                            {exp.technologies.map((tech: string, i: number) => (
                                                <span key={i} className="text-[9px] font-mono tracking-wide px-2 py-0.5 bg-slate-800/40 text-slate-300 rounded border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollAnimate>
                    );
                })}
            </div>
        </section>
    );
};

export default Experience;
