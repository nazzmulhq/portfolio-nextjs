"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HomeMotion = ({ children }: { children: ReactNode }) => {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const scope = root.current;
            if (!scope) return;

            const q = <T extends HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, scope);
            const heroBits = q("[data-hero]");

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(heroBits, { autoAlpha: 1, clearProps: "transform" });
                return;
            }

            /* ── HERO ENTRANCE ── */
            const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

            intro.fromTo(
                heroBits,
                { y: 28, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12 },
                0.1,
            );

            const safety = setTimeout(() => {
                if (intro.progress() < 1) intro.progress(1);
            }, 2500);

            /* ── SECTION HEADINGS ── */
            q("[data-heading]").forEach((header) => {
                const rule = header.querySelector<HTMLElement>("[data-heading-rule]");
                const meta = header.querySelector<HTMLElement>("[data-heading-label]");
                const title = header.querySelector<HTMLElement>("[data-decode]");

                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: {
                        trigger: header,
                        start: "top 88%",
                        once: true,
                    },
                });

                if (rule) {
                    tl.fromTo(
                        rule,
                        { scaleX: 0, transformOrigin: "0 50%" },
                        { scaleX: 1, duration: 0.8, ease: "power3.inOut" },
                        0,
                    );
                }
                if (meta) {
                    tl.fromTo(meta, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 0.15);
                }
                if (title) {
                    tl.fromTo(title, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.2);
                }
            });

            const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

            const onVisible = () => {
                if (document.hidden) return;
                if (intro.progress() < 1) intro.progress(1);
                ScrollTrigger.refresh();
            };
            document.addEventListener("visibilitychange", onVisible);

            return () => {
                clearTimeout(safety);
                cancelAnimationFrame(raf);
                document.removeEventListener("visibilitychange", onVisible);
                ScrollTrigger.getAll().forEach((st) => st.kill());
            };
        },
        { scope: root },
    );

    return (
        <div data-motion ref={root}>
            {children}
        </div>
    );
};

export default HomeMotion;
