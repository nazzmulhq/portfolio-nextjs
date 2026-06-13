"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

const getInitial = (): Mode => {
    if (typeof document === "undefined") return "dark";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const ThemeToggle = () => {
    const [mode, setMode] = useState<Mode>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setMode(getInitial());
    }, []);

    const toggle = () => {
        const next: Mode = mode === "dark" ? "light" : "dark";
        setMode(next);
        document.documentElement.setAttribute("data-theme", next);
        try {
            localStorage.setItem("theme", next);
        } catch {
            /* ignore */
        }
    };

    return (
        <button
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full glass text-fg transition-transform duration-300 hover:scale-105 active:scale-95"
            onClick={toggle}
            type="button"
        >
            <span className="sr-only">Toggle theme</span>
            {/* Sun / Moon morph */}
            <svg
                className="h-5 w-5 transition-all duration-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
            >
                {mounted && mode === "dark" ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                ) : (
                    <>
                        <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
                        />
                    </>
                )}
            </svg>
            <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[var(--accent)]/0 transition-all duration-300 group-hover:ring-[var(--accent)]/40" />
        </button>
    );
};

export default ThemeToggle;
