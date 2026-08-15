"use client";

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface INavBar {}

const SECTIONS = ["Home", "Skills", "Experience", "Education", "Works"];

/** Active section tracker based on viewport geometry */
const useActiveSection = () => {
    const [active, setActive] = useState("home");

    useEffect(() => {
        const ids = SECTIONS.map((s) => s.toLowerCase());
        let queued = false;

        const measure = () => {
            queued = false;
            const line = window.innerHeight * 0.35;
            let current = ids[0];
            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            });
            setActive(current);
        };
        const onScroll = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return active;
};

const scrollTo = (id: string) => {
    if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 32,
        behavior: "smooth",
    });
};

export const NavBar: FC<INavBar> = () => {
    const active = useActiveSection();
    const navRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    useEffect(() => {
        if (!navRef.current) return;
        const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-id="${active}"]`);
        if (activeBtn) {
            setIndicatorStyle({
                left: activeBtn.offsetLeft,
                width: activeBtn.offsetWidth,
            });
        }
    }, [active]);

    return (
        <header className="fixed left-0 right-0 top-5 z-40 hidden justify-center md:flex pointer-events-none">
            <div
                ref={navRef}
                className="relative flex items-center gap-1 p-1.5 rounded-full bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] border border-line backdrop-blur-xl shadow-lg pointer-events-auto"
            >
                {/* Active indicator pill */}
                <span
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-[var(--accent)] transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        left: `${indicatorStyle.left}px`,
                        width: `${indicatorStyle.width}px`,
                        opacity: indicatorStyle.width > 0 ? 1 : 0,
                    }}
                />

                {SECTIONS.map((item) => {
                    const id = item.toLowerCase();
                    const isActive = active === id;
                    return (
                        <button
                            key={item}
                            data-id={id}
                            data-active={isActive}
                            className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                                isActive ? "text-[var(--accent-contrast)] font-bold" : "text-muted hover:text-fg"
                            }`}
                            onClick={() => scrollTo(id)}
                            type="button"
                        >
                            {item}
                        </button>
                    );
                })}

                {/* CV Link */}
                <Link
                    href="/cv"
                    className="relative z-10 ml-1 px-3.5 py-1.5 text-xs font-bold rounded-full bg-[var(--surface-2)] text-[var(--accent)] hover:text-fg border border-line transition-colors flex items-center gap-1.5"
                >
                    <span>CV</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </Link>
            </div>
        </header>
    );
};

export const NavBarMobile: FC<INavBar> = () => {
    const active = useActiveSection();

    return (
        <nav
            className="fixed left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:hidden"
            style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
        >
            <ul className="flex items-center justify-between rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-2 py-1.5 backdrop-blur-xl shadow-lg">
                {SECTIONS.map((item) => {
                    const id = item.toLowerCase();
                    const isActive = active === id;
                    return (
                        <li className="flex-1" key={item}>
                            <button
                                className={`w-full rounded-full px-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                                    isActive
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-md"
                                        : "text-muted hover:text-fg"
                                }`}
                                onClick={() => scrollTo(id)}
                                type="button"
                            >
                                {item === "Experience" ? "Exp" : item === "Education" ? "Edu" : item}
                            </button>
                        </li>
                    );
                })}
                <li className="flex-none pl-1">
                    <Link
                        href="/cv"
                        className="inline-block rounded-full bg-[var(--surface-2)] text-[var(--accent)] px-2.5 py-1 font-mono text-[10px] font-bold border border-line"
                    >
                        CV
                    </Link>
                </li>
            </ul>
        </nav>
    );
};
