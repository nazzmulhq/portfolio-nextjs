"use client";
import React, { useState } from "react";
import Link from "next/link";
import ReactCodeBlocks from "./ReactCodeBlocks";
import ScrollAnimate from "../ScrollAnimate";

export default function QuickCiCdDoc({ data, title }) {
    const getComponent = (item, idx) => {
        switch (item.type) {
            case "basic":
                return (
                    <ScrollAnimate direction="up" delay={idx * 50} blur key={item.title || idx}>
                        <div className="w-full relative rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 sm:p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300">
                            {item?.step && (
                                <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/30 z-20">
                                    {item.step}
                                </div>
                            )}

                            <div className="space-y-4">
                                {item.title && (
                                    <h3 className="text-xl sm:text-2xl text-white font-extrabold flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
                                        {item.title}
                                    </h3>
                                )}

                                {item.content && (
                                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
                                        {item.content}
                                    </p>
                                )}
                                {item.code && (
                                    <ReactCodeBlocks
                                        code={item.code}
                                        language={item.language}
                                    />
                                )}
                            </div>
                        </div>
                    </ScrollAnimate>
                );
            case "list":
                return (
                    <ScrollAnimate direction="up" delay={idx * 50} blur key={item.title || idx}>
                        <div className="w-full relative rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 sm:p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300">
                            {item?.step && (
                                <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/30 z-20">
                                    {item.step}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                {item.title && (
                                    <h3 className="text-xl sm:text-2xl text-white font-extrabold flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
                                        {item.title}
                                    </h3>
                                )}
                                {item.content && (
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                                        {item.content}
                                    </p>
                                )}
                                {item.list && (
                                    <div className="space-y-4 mt-6">
                                        {item.list.map((listItem, index) => (
                                            <div
                                                key={`${item.title}-${index}`}
                                                className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-800 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center mt-0.5">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 space-y-2">
                                                        {listItem.title && (
                                                            <h4 className="text-white font-bold text-sm sm:text-base">
                                                                {listItem.title}
                                                            </h4>
                                                        )}
                                                        {listItem.content && (
                                                            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                                                                {listItem.content}
                                                            </p>
                                                        )}
                                                        {listItem.code && (
                                                            <div className="mt-3">
                                                                <ReactCodeBlocks
                                                                    code={listItem.code}
                                                                    language={listItem.language}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollAnimate>
                );
            case "tabs":
                const [activeTab, setActiveTab] = useState(item.tabs[0]);
                return (
                    <ScrollAnimate direction="up" delay={idx * 50} blur key={item.title || idx}>
                        <div className="w-full relative rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 sm:p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300">
                            {item?.step && (
                                <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/30 z-20">
                                    {item.step}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
                                    <h3 className="text-xl sm:text-2xl text-white font-extrabold flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
                                        Setup Guides
                                    </h3>
                                    
                                    {/* Styled Tab list */}
                                    <div className="flex flex-wrap gap-1.5 bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-xl self-center sm:self-start">
                                        {item.tabs.map((tab, index) => (
                                            <button
                                                key={index}
                                                aria-selected={activeTab.title === tab.title}
                                                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${
                                                    activeTab.title === tab.title
                                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                                                }`}
                                                onClick={() => setActiveTab(tab)}
                                                type="button"
                                            >
                                                {tab.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full space-y-4 pt-2">
                                    <div className="space-y-4">
                                        {activeTab.title && (
                                            <h4 className="text-lg sm:text-xl text-white font-extrabold">
                                                {activeTab.title} Config
                                            </h4>
                                        )}

                                        {activeTab.content && (
                                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                                                {activeTab.content}
                                            </p>
                                        )}

                                        {activeTab.code && (
                                            <ReactCodeBlocks
                                                code={activeTab.code}
                                                language={activeTab.language}
                                            />
                                        )}
                                        
                                        {activeTab.videoLink && (
                                            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-slate-950/40 relative group/video">
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 pointer-events-none z-10"></div>
                                                <video
                                                    controls
                                                    className="w-full h-auto object-cover opacity-90 group-hover/video:opacity-100 transition-opacity duration-300 relative z-0"
                                                    src={activeTab.videoLink}
                                                    controlsList="nodownload"
                                                >
                                                    <source
                                                        src={activeTab.videoLink}
                                                        type="video/mp4"
                                                    />
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimate>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full text-slate-200 selection:bg-emerald-500/30 font-sans">
            {/* Header section inside the glass frame */}
            <div className="relative overflow-hidden border-b border-slate-800 bg-slate-950/20 backdrop-blur-3xl pt-16 sm:pt-24 pb-10 sm:pb-16 px-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[180px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center text-center">
                    
                    {/* Floating circular icon container */}
                    <ScrollAnimate direction="up" delay={100} scale blur>
                        <div className="mb-6 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-sm group hover:scale-105 transition-transform duration-500">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:rotate-3 transition-transform duration-500">
                                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </ScrollAnimate>

                    <ScrollAnimate direction="up" delay={150} scale blur>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4 tracking-tight drop-shadow-xl">
                            {title}
                        </h1>
                    </ScrollAnimate>

                    <ScrollAnimate direction="up" delay={200} blur>
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
                            A lightweight, zero-dependency CLI scaffolding tool built to automatically containerize Node.js, Next.js, and PHP Laravel projects with production-grade Docker environments and CI/CD templates.
                        </p>
                    </ScrollAnimate>

                    {/* Navigation bar actions */}
                    <ScrollAnimate direction="up" delay={250} blur>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none mx-auto">
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-700/50 hover:border-slate-500/60 shadow-[0_0_15px_rgba(255,255,255,0.01)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 backdrop-blur-md flex items-center justify-center gap-2 relative overflow-hidden group select-none"
                            >
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="relative z-10 text-sm sm:text-base">Back to Portfolio</span>
                            </Link>
                            
                            <Link
                                target="_blank"
                                href="https://www.npmjs.com/package/quick-cicd"
                                className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 flex items-center justify-center gap-2 relative overflow-hidden group border border-emerald-400/30 hover:border-emerald-400/60 select-none"
                            >
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                <svg className="w-4 h-4 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                <span className="relative z-10 text-sm sm:text-base">Go to NPM Package</span>
                                <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                        </div>
                    </ScrollAnimate>
                </div>
            </div>

            {/* Documentation contents container */}
            <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10 relative z-10">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                
                {data.map((item, i) => (
                    <React.Fragment key={i}>
                        {getComponent(item, i)}
                    </React.Fragment>
                ))}
            </div>
            
            {/* Footer inside the documentation page */}
            <div className="border-t border-slate-900 bg-slate-950/60 py-12 text-center text-slate-500 relative z-10">
                <p className="text-sm font-light">Quick Dockerize Tool - Built by Nazmul Haque</p>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                    <Link href="/" className="hover:text-emerald-400 transition-colors">Portfolio Home</Link>
                    <span>&bull;</span>
                    <Link href="https://www.npmjs.com/package/quick-cicd" target="_blank" className="hover:text-emerald-400 transition-colors">NPM Registry</Link>
                </div>
            </div>
        </div>
    );
}
