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

    const displayCode = code ? code.replace(/\n$/, "") : "";
    const lines = displayCode.split("\n");

    return (
        <div className="group my-5 overflow-hidden rounded-2xl border border-line bg-[var(--surface-2)] shadow-[0_12px_40px_-20px_var(--shadow)]">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-4 py-3 text-muted">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ef4444]/30 transition-colors group-hover:bg-[#ef4444]" />
                    <span className="h-3 w-3 rounded-full bg-[#eab308]/30 transition-colors group-hover:bg-[#eab308]" />
                    <span className="h-3 w-3 rounded-full bg-[#22c55e]/30 transition-colors group-hover:bg-[#22c55e]" />
                    <span className="ml-2.5 font-mono text-xs font-semibold uppercase tracking-wider opacity-70">
                        {language || "code"}
                    </span>
                </div>

                <button
                    aria-label={copyLabel}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-sans text-xs font-semibold transition-all duration-200 ${
                        copyLabel === "Copied!"
                            ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)] text-accent"
                            : "border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] text-muted hover:text-fg"
                    }`}
                    onClick={handleCopy}
                    type="button"
                >
                    {copyLabel === "Copied!" ? (
                        <>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            <pre
                className="max-h-[400px] overflow-x-auto bg-[color-mix(in_srgb,var(--canvas)_40%,transparent)] p-4 font-mono text-sm leading-relaxed text-fg sm:p-5"
                data-language={language || "text"}
            >
                <code className="block">
                    {lines.map((line, i) => (
                        <span className="-mx-4 flex px-4 transition-colors hover:bg-[var(--surface)]" key={i}>
                            <span className="mr-4 inline-block w-8 shrink-0 select-none border-r border-line pr-5 pt-0.5 text-right font-sans text-xs text-faint">
                                {i + 1}
                            </span>
                            <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                        </span>
                    ))}
                </code>
            </pre>
        </div>
    );
}
