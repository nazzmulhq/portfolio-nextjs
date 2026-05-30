"use client";

import { useState } from "react";

export default function ReactCodeBlocks({ code, language }) {
    const [copyLabel, setCopyLabel] = useState("Copy");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopyLabel("Copied!");
            setTimeout(() => setCopyLabel("Copy"), 2000);
        } catch {
            setCopyLabel("Failed");
        }
    };

    // Trim trailing newline if present to avoid empty last line number
    const displayCode = code ? code.replace(/\n$/, "") : "";
    const lines = displayCode.split("\n");

    return (
        <div className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-[#0b0f19] shadow-xl group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/10">
            {/* Window controls header bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-900 text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]/20 group-hover:bg-[#ef4444] transition-colors duration-300"></div>
                    <div className="w-3 h-3 rounded-full bg-[#eab308]/20 group-hover:bg-[#eab308] transition-colors duration-300 delay-75"></div>
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]/20 group-hover:bg-[#22c55e] transition-colors duration-300 delay-150"></div>
                    <span className="ml-2.5 text-xs font-mono tracking-wider opacity-60 uppercase text-slate-400 font-semibold">
                        {language || "code"}
                    </span>
                </div>
                
                <button
                    aria-label={copyLabel}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-sans border transition-all duration-200 ${
                        copyLabel === "Copied!" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                    onClick={handleCopy}
                    type="button"
                >
                    {copyLabel === "Copied!" ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="relative">
                <pre
                    className="overflow-x-auto p-4 sm:p-5 text-sm bg-slate-950/40 text-slate-300 font-mono leading-relaxed max-h-[400px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                    data-language={language || "text"}
                >
                    <code className="block">
                        {lines.map((line, i) => (
                            <span className="flex group/line hover:bg-slate-900/40 -mx-4 px-4 transition-colors" key={i}>
                                <span className="select-none text-slate-600 group-hover/line:text-slate-500 pr-5 inline-block w-8 text-right shrink-0 border-r border-slate-900/50 mr-4 font-sans text-xs pt-0.5">
                                    {i + 1}
                                </span>
                                <span className="break-all whitespace-pre-wrap">{line || "\u00A0"}</span>
                            </span>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
}
