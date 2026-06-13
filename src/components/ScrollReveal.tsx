"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, [data-stagger] > *";

/**
 * Drives scroll reveals + the top progress bar with IntersectionObserver /
 * a scroll listener, so animations work in every browser (CSS scroll-driven
 * timelines are Chromium-only). Mounted once in the root layout, but re-scans
 * the DOM on every route change — the layout (and this effect) doesn't remount
 * during client-side navigation, so without this a navigated-to page's
 * elements would stay hidden until a full reload.
 */
const ScrollReveal = () => {
    const pathname = usePathname();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add("js-reveal");

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));

        let io: IntersectionObserver | undefined;

        if (reduce || !("IntersectionObserver" in window)) {
            els.forEach((el) => el.classList.add("in"));
        } else {
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // Toggle (not one-time) so elements re-animate whether
                        // you scroll down or back up.
                        entry.target.classList.toggle("in", entry.isIntersecting);
                    });
                },
                // threshold 0 fires as soon as any part enters, so it stays
                // reliable even for elements taller than the viewport.
                { threshold: 0, rootMargin: "0px 0px -10% 0px" },
            );
            els.forEach((el) => io!.observe(el));
        }

        // Top scroll-progress bar
        const bar = document.querySelector<HTMLElement>(".scroll-progress");
        const onScroll = () => {
            const max = root.scrollHeight - root.clientHeight;
            const p = max > 0 ? Math.min(1, root.scrollTop / max) : 0;
            if (bar) bar.style.transform = `scaleX(${p})`;
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });

        return () => {
            io?.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [pathname]);

    return null;
};

export default ScrollReveal;
