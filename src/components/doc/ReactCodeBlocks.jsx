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

    const lines = (code || "").split("\n");

    return (
        <div className="relative group">
            <button
                aria-label={copyLabel}
                className="absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                onClick={handleCopy}
                type="button"
            >
                {copyLabel}
            </button>
            <pre
                className="overflow-x-auto rounded p-4 text-sm bg-gray-900 text-gray-100 border border-gray-700 font-mono"
                data-language={language || "text"}
            >
                <code className="block">
                    {lines.map((line, i) => (
                        <span className="block" key={i}>
                            <span className="select-none text-gray-500 pr-4 inline-block w-10 text-right">
                                {i + 1}
                            </span>
                            {line || "\u00A0"}
                        </span>
                    ))}
                </code>
            </pre>
        </div>
    );
}
