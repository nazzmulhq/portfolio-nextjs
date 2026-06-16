"use client";

import { useEffect, useState } from "react";

export default function DocToc({ items }) {
    const [active, setActive] = useState(items[0]?.id);

    useEffect(() => {
        const ids = items.map((i) => i.id);
        const onScroll = () => {
            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top - 120 <= 0) current = id;
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
        const top = el.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-faint">On this page</p>
                <ul className="space-y-0.5 border-l border-line">
                    {items.map((item) => (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                                className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                                    active === item.id
                                        ? "border-[var(--accent)] font-semibold text-accent"
                                        : "border-transparent text-muted hover:border-line-strong hover:text-fg"
                                }`}
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
