"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Home page motion. Each section gets its own technique rather than one shared
 * fade, so the page keeps revealing something new as you scroll:
 *
 *   hero        orchestrated load, then drifts away on scrub
 *   skills      rows enter from alternating sides; marquees skew with velocity
 *   experience  rule draws, cards wipe upward, dots pop in
 *   education   rows wipe open horizontally, like records being read
 *   works       media unmasks sideways while the image parallaxes
 *   footer      the address rises on its own
 */
const HomeMotion = ({ children }: { children: ReactNode }) => {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const scope = root.current;
            if (!scope) return;

            const q = <T extends HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, scope);
            const heroBits = q("[data-hero]");
            const allReveals = q(".reveal, .reveal-left, .reveal-right");

            const showEverything = () =>
                gsap.set([...heroBits, ...allReveals], {
                    autoAlpha: 1,
                    clearProps: "clipPath,transform",
                });

            // An entrance that starts hidden makes the animation responsible for
            // the content being visible at all — so if motion is off or the tab
            // is hidden (rAF throttled), jump straight to the finished state.
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) {
                showEverything();
                return;
            }

            // Elements handled by a section-specific treatment below; the generic
            // reveal must skip them or the two tweens fight over the same props.
            const claimed = new Set<HTMLElement>();
            const claim = <T extends HTMLElement>(els: T[]) => {
                els.forEach((el) => claimed.add(el));
                return els;
            };

            /* ── HERO ────────────────────────────────────────────── */
            const intro = gsap.timeline({ defaults: { ease: "power3.out" } }).fromTo(
                heroBits,
                { yPercent: 90, autoAlpha: 0 },
                { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07 },
            );
            // setTimeout still fires when rAF is throttled, so a stalled ticker
            // can never leave the hero permanently blank.
            const safety = setTimeout(() => {
                if (intro.progress() < 1) intro.progress(1);
            }, 2600);

            const heroShell = scope.querySelector<HTMLElement>("#home > div");
            if (heroShell) {
                gsap.to(heroShell, {
                    yPercent: -8,
                    autoAlpha: 0.25,
                    ease: "none",
                    scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: 0.5 },
                });
            }

            /* ── SKILLS — rows drift left/right for the whole pass ─ */
            claim(q("#skills .reveal")).forEach((row, i) => {
                const dir = i % 2 === 0 ? 1 : -1;
                // Continuous horizontal travel tied to scroll position…
                gsap.fromTo(
                    row,
                    { xPercent: -6 * dir },
                    {
                        xPercent: 6 * dir,
                        ease: "none",
                        scrollTrigger: {
                            trigger: "#skills",
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 0.6,
                        },
                    },
                );
                // …and a separate fade so entering and leaving both read.
                // Different property from the scrub tween, so they compose.
                gsap.fromTo(
                    row,
                    { autoAlpha: 0 },
                    {
                        autoAlpha: 1,
                        duration: 0.7,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: row,
                            start: "top 90%",
                            end: "bottom 12%",
                            toggleActions: "play reverse play reverse",
                        },
                    },
                );
            });

            // Skew the marquee *wrappers* by scroll velocity — the tracks
            // themselves run a CSS transform animation that an inline transform
            // would override, stopping the marquee dead.
            const marqueeWraps = q("#skills .marquee-track").map((t) => t.parentElement as HTMLElement);
            if (marqueeWraps.length) {
                ScrollTrigger.create({
                    trigger: "#skills",
                    start: "top bottom",
                    end: "bottom top",
                    onUpdate: (self) => {
                        const skew = gsap.utils.clamp(-7, 7, self.getVelocity() / 300);
                        gsap.to(marqueeWraps, {
                            skewX: skew,
                            duration: 0.5,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    },
                    onLeave: () => gsap.to(marqueeWraps, { skewX: 0, duration: 0.4 }),
                    onLeaveBack: () => gsap.to(marqueeWraps, { skewX: 0, duration: 0.4 }),
                });
            }

            /* ── EXPERIENCE ──────────────────────────────────────── */
            claim(q("#experience .timeline-card")).forEach((card) => {
                const panel = card.querySelector<HTMLElement>(".glass-card");
                const dot = card.querySelector<HTMLElement>(".timeline-dot");
                // Plays on the way in and reverses on the way out, so the card
                // zooms back down as it leaves rather than just sitting there.
                const trigger = {
                    trigger: card,
                    start: "top 88%",
                    end: "bottom 10%",
                    toggleActions: "play reverse play reverse",
                } as const;

                if (panel) {
                    gsap.fromTo(
                        panel,
                        { scale: 0.84, autoAlpha: 0, y: 30 },
                        {
                            scale: 1,
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.9,
                            ease: "power3.out",
                            scrollTrigger: trigger,
                        },
                    );
                }
                if (dot) {
                    gsap.fromTo(
                        dot,
                        { scale: 0 },
                        { scale: 1, duration: 0.7, ease: "back.out(3)", scrollTrigger: trigger },
                    );
                }
            });

            const rule = scope.querySelector<HTMLElement>("[data-timeline-rule]");
            const timeline = scope.querySelector<HTMLElement>("[data-timeline]");
            if (rule && timeline) {
                gsap.fromTo(
                    rule,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        ease: "none",
                        scrollTrigger: { trigger: timeline, start: "top 75%", end: "bottom 85%", scrub: 0.4 },
                    },
                );
            }

            /* ── EDUCATION ───────────────────────────────────────── */
            const eduRows = claim(q("#education .reveal"));
            if (eduRows.length) {
                gsap.fromTo(
                    eduRows,
                    { clipPath: "inset(0% 100% 0% 0%)", autoAlpha: 0 },
                    {
                        clipPath: "inset(0% 0% 0% 0%)",
                        autoAlpha: 1,
                        duration: 0.9,
                        ease: "power2.out",
                        stagger: 0.12,
                        scrollTrigger: {
                            trigger: eduRows[0],
                            start: "top 90%",
                            end: "bottom 5%",
                            toggleActions: "play reverse play reverse",
                        },
                    },
                );
            }

            /* ── WORKS ───────────────────────────────────────────── */
            q("[data-work-media]").forEach((media) => {
                gsap.fromTo(
                    media,
                    { clipPath: "inset(0% 0% 0% 100%)", yPercent: 8 },
                    {
                        clipPath: "inset(0% 0% 0% 0%)",
                        yPercent: 0,
                        duration: 1.1,
                        ease: "power3.inOut",
                        scrollTrigger: {
                            trigger: media,
                            start: "top 88%",
                            end: "bottom 8%",
                            toggleActions: "play reverse play reverse",
                        },
                    },
                );
            });

            q("[data-parallax]").forEach((img) => {
                gsap.fromTo(
                    img,
                    { yPercent: -6 },
                    {
                        yPercent: 6,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.closest("[data-parallax-wrap]") ?? img,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 0.5,
                        },
                    },
                );
            });

            /* ── FOOTER ──────────────────────────────────────────── */
            const address = scope.querySelector<HTMLElement>("footer a.display");
            if (address) {
                claim([address]);
                gsap.fromTo(
                    address,
                    { yPercent: 40, autoAlpha: 0 },
                    {
                        yPercent: 0,
                        autoAlpha: 1,
                        duration: 1,
                        ease: "power4.out",
                        scrollTrigger: { trigger: address, start: "top 92%", once: true },
                    },
                );
            }

            /* ── GENERIC (headings and anything not claimed above) ─ */
            allReveals
                .filter((el) => !claimed.has(el))
                .forEach((el) => {
                    const dir = el.classList.contains("reveal-left")
                        ? { x: -50 }
                        : el.classList.contains("reveal-right")
                          ? { x: 50 }
                          : { y: 34 };
                    gsap.fromTo(
                        el,
                        { ...dir, autoAlpha: 0 },
                        {
                            x: 0,
                            y: 0,
                            autoAlpha: 1,
                            duration: 0.85,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: el,
                                start: "top 90%",
                                end: "bottom 8%",
                                toggleActions: "play reverse play reverse",
                            },
                        },
                    );
                });

            /* ── COUNTERS ────────────────────────────────────────── */
            q("[data-counter]").forEach((el) => {
                const raw = el.getAttribute("data-counter") || el.innerText;
                const match = raw.match(/^(\d+)(.*)$/);
                if (!match) return;
                const target = parseInt(match[1], 10);
                const suffix = match[2] || "";
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: "power2.out",
                    scrollTrigger: { trigger: el, start: "top 90%", once: true },
                    onUpdate: () => {
                        el.innerText = `${Math.floor(obj.val)}${suffix}`;
                    },
                });
            });

            const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
            return () => {
                clearTimeout(safety);
                cancelAnimationFrame(raf);
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
