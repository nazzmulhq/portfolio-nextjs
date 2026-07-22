"use client";

import { useEffect, useState } from "react";

export default function DocChapterNav({ items }) {
    const [active, setActive] = useState(items[0]?.id);

    useEffect(() => {
        const ids = items.map((i) => i.id);
        const onScroll = () => {
            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top - 140 <= 0) current = id;
            }
            setActive(current);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [items]);

    const go = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <nav aria-label="Documentation chapters" className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--canvas)_78%,transparent)] backdrop-blur-xl">
            <div className="container mx-auto overflow-x-auto px-4 sm:px-6">
                <ul className="flex w-max min-w-full items-center gap-1.5 py-3">
                    {items.map((item) => (
                        <li key={item.id}>
                            <a
                                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                    active === item.id
                                        ? "bg-[linear-gradient(120deg,var(--accent-strong),var(--accent-2))] text-[var(--accent-contrast)] shadow-[0_0_16px_-3px_var(--glow)]"
                                        : "text-muted hover:bg-[var(--surface-2)] hover:text-fg"
                                }`}
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
