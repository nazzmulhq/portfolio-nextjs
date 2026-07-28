"use client";
import { FC, useEffect, useRef, useState } from "react";

export interface INavBar {}

const SECTIONS = ["Home", "Skills", "Experience", "Education", "Works"];

/** Active section from live geometry — whichever panel holds the viewport. */
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
        top: el.getBoundingClientRect().top + window.pageYOffset - 24,
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
        <header className="fixed left-0 right-0 top-6 z-40 hidden justify-center md:flex pointer-events-none">
            <div ref={navRef} className="nav-pill pointer-events-auto">
                <span
                    className="nav-indicator"
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
                            className="nav-pill-item"
                            onClick={() => scrollTo(id)}
                            type="button"
                        >
                            {item}
                        </button>
                    );
                })}
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
            <ul className="flex items-center justify-between rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-2 py-2 backdrop-blur-xl shadow-lg">
                {SECTIONS.map((item) => {
                    const id = item.toLowerCase();
                    return (
                        <li className="flex-1" key={item}>
                            <button
                                className={`w-full rounded-full px-1 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                                    active === id
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-md"
                                        : "text-faint hover:text-fg"
                                }`}
                                onClick={() => scrollTo(id)}
                                type="button"
                            >
                                {item === "Experience" ? "Exp" : item === "Education" ? "Edu" : item}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
