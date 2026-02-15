"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

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
            <SyntaxHighlighter
                customStyle={{ margin: 0, borderRadius: "4px" }}
                language={language || "text"}
                showLineNumbers
                style={dracula}
                wrapLongLines
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
