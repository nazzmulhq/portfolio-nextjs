"use client";
import { FC, useEffect, useState } from "react";

export interface INavBar {}

const SECTIONS = ["Home", "Skills", "Experience", "Education", "Works"];

const useScrollSpy = (offset: number) => {
    const [active, setActive] = useState("Home");

    useEffect(() => {
        const ids = SECTIONS.map((s) => s.toLowerCase());
        const onScroll = () => {
            let current = "home";
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top - offset <= 1) current = id;
            }
            setActive(current.charAt(0).toUpperCase() + current.slice(1));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [offset]);

    return active;
};

const scrollTo = (label: string, offset: number) => {
    const el = document.getElementById(label.toLowerCase());
    if (!el) return;
    const top = label.toLowerCase() === "home" ? 0 : el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
};

export const NavBar: FC<INavBar> = () => {
    const active = useScrollSpy(70);

    return (
        <div className="fixed top-6 left-0 right-0 z-50 hidden justify-center md:flex">
            <nav className="glass rounded-full p-1.5 shadow-[0_18px_50px_-24px_var(--shadow)]">
                <ul className="flex items-center gap-1">
                    {SECTIONS.map((item) => (
                        <li key={item}>
                            <button
                                className={`rounded-full px-5 py-1.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                                    active === item
                                        ? "bg-[linear-gradient(120deg,var(--accent-strong),var(--accent-2))] text-[var(--accent-contrast)] shadow-[0_0_18px_-2px_var(--glow)]"
                                        : "text-muted hover:bg-[var(--surface-2)] hover:text-fg"
                                }`}
                                onClick={() => scrollTo(item, 70)}
                                type="button"
                            >
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export const NavBarMobile: FC<INavBar> = () => {
    const active = useScrollSpy(52);

    return (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[95%] max-w-sm -translate-x-1/2 justify-center md:hidden">
            <nav className="glass flex items-center gap-0.5 rounded-full p-1 shadow-[0_18px_50px_-24px_var(--shadow)] sm:gap-1 sm:p-1.5">
                {SECTIONS.map((item) => (
                    <button
                        key={item}
                        className={`whitespace-nowrap rounded-full px-2 py-1.5 text-[9px] font-medium capitalize transition-all duration-300 sm:px-3 sm:py-2 sm:text-xs ${
                            active === item
                                ? "bg-[linear-gradient(120deg,var(--accent-strong),var(--accent-2))] text-[var(--accent-contrast)] shadow-[0_0_12px_-2px_var(--glow)]"
                                : "text-muted hover:bg-[var(--surface-2)] hover:text-fg"
                        }`}
                        onClick={() => scrollTo(item, 52)}
                        type="button"
                    >
                        {item === "Experience" ? "Exp" : item === "Education" ? "Edu" : item}
                    </button>
                ))}
            </nav>
        </div>
    );
};
