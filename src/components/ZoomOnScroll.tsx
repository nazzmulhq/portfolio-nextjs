"use client";

import { useEffect, useRef } from "react";

interface ZoomOnScrollProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Scroll-scrubbed media: as the element travels up through the viewport it
 * zooms in (scale 0.88 → 1.08) and lifts toward the top (parallax). Driven by
 * rAF + scroll so it works in every browser (CSS scroll-timelines are
 * Chromium-only). Disabled under prefers-reduced-motion.
 */
const ZoomOnScroll = ({ src, alt, className = "" }: ZoomOnScrollProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.style.transform = "none";
            return;
        }

        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // 0 when the element's top is at the viewport bottom, 1 once it has
            // fully scrolled past the top.
            const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
            const scale = 0.88 + p * 0.2;
            const ty = (0.5 - p) * 72; // +36px → -36px (rises as you scroll)
            el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line shadow-[0_30px_80px_-30px_var(--glow)] [will-change:transform] ${className}`}
            style={{ transform: "translate3d(0,0,0) scale(0.88)" }}
        >
            <img alt={alt} className="block h-auto w-full object-cover" src={src} />
        </div>
    );
};

export default ZoomOnScroll;
