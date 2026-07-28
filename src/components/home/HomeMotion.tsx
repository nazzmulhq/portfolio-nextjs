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

            // Only reduced-motion skips setup entirely. A hidden tab must NOT:
            // the pinned deck is a layout feature, and bailing out here left it
            // un-built for anyone whose tab was backgrounded at load. rAF being
            // throttled is handled by the safety timeout and the refresh below.
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

            /* ── EXPERIENCE — pinned panel deck ──────────────────── */
            const stage = scope.querySelector<HTMLElement>("[data-exp-stage]");
            const expCards = claim(q<HTMLElement>("[data-exp-card]"));
            const railFill = scope.querySelector<HTMLElement>("[data-exp-rail-fill]");

            // Desktop only. Pinning fights mobile's dynamic viewport, and the
            // deck needs the height a small screen doesn't have.
            const mm = gsap.matchMedia();
            if (stage && expCards.length > 1) {
                mm.add("(min-width: 1024px)", () => {
                    // Gate the absolute stacking on JS being live, so a failure
                    // leaves a readable list rather than a pile of cards.
                    stage.setAttribute("data-deck-ready", "");

                    // Size the deck to its tallest panel. A fixed height crops
                    // the longer roles once the cards are absolutely positioned.
                    const deckEl = scope.querySelector<HTMLElement>("[data-exp-deck]");
                    const fitDeck = () => {
                        if (!deckEl) return;
                        const tallest = expCards.reduce((max, card) => {
                            const panel = card.querySelector<HTMLElement>(".exp-panel");
                            return Math.max(max, panel?.scrollHeight ?? 0);
                        }, 0);
                        if (tallest) deckEl.style.height = `${Math.ceil(tallest)}px`;
                    };
                    fitDeck();
                    // Re-measure whenever ScrollTrigger recalculates (resize, fonts).
                    ScrollTrigger.addEventListener("refreshInit", fitDeck);

                    // Panels stay fully opaque and slide over one another. Cross-
                    // fading makes both semi-transparent mid-transition, so the
                    // outgoing role reads straight through the incoming one.
                    gsap.set(expCards, { autoAlpha: 1, yPercent: 100, scale: 1 });
                    gsap.set(expCards[0], { yPercent: 0 });

                    const deck = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: stage,
                            start: "top top",
                            end: () => `+=${(expCards.length - 1) * window.innerHeight * 0.85}`,
                            pin: true,
                            scrub: 0.6,
                            invalidateOnRefresh: true,
                        },
                    });

                    expCards.forEach((card, i) => {
                        if (i === 0) return;
                        // Outgoing settles back a touch; the incoming panel
                        // slides up over it at full opacity and occludes it.
                        deck.to(expCards[i - 1], { yPercent: -6, scale: 0.97 }, i - 1);
                        deck.to(card, { yPercent: 0 }, i - 1);
                    });

                    if (railFill) {
                        gsap.fromTo(
                            railFill,
                            { scaleY: 0 },
                            {
                                scaleY: 1,
                                ease: "none",
                                scrollTrigger: {
                                    trigger: stage,
                                    start: "top top",
                                    end: () => `+=${(expCards.length - 1) * window.innerHeight * 0.85}`,
                                    scrub: 0.6,
                                },
                            },
                        );
                    }

                    return () => {
                        ScrollTrigger.removeEventListener("refreshInit", fitDeck);
                        stage.removeAttribute("data-deck-ready");
                        if (deckEl) deckEl.style.height = "";
                        gsap.set(expCards, { clearProps: "all" });
                    };
                });

                // Below the deck breakpoint the roles read as a plain list, so
                // give them the same quiet entrance the rest of the page uses.
                mm.add("(max-width: 1023px)", () => {
                    expCards.forEach((card) => {
                        gsap.fromTo(
                            card,
                            { y: 30, autoAlpha: 0 },
                            {
                                y: 0,
                                autoAlpha: 1,
                                duration: 0.8,
                                ease: "power3.out",
                                scrollTrigger: { trigger: card, start: "top 90%", once: true },
                            },
                        );
                    });
                    return () => gsap.set(expCards, { clearProps: "all" });
                });
            }

            /* ── EDUCATION — enter right, centre, pulse, exit right ─ */
            const eduCards = claim(q<HTMLElement>("[data-edu-card]"));
            if (eduCards.length) {
                eduCards.forEach((card, i) => {
                    // Scrubbed, so the whole journey is driven by scroll position
                    // rather than firing once. Each card is nudged slightly later
                    // than the last so they arrive as a cascade.
                    const tl = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: "#education",
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 0.6,
                        },
                    });

                    tl.fromTo(
                        card,
                        { xPercent: 130, autoAlpha: 0, scale: 0.9 },
                        { xPercent: 0, autoAlpha: 1, scale: 1, duration: 3 },
                        i * 0.35,
                    )
                        .to(card, { scale: 1.09, duration: 1.2 }) // zoom in
                        .to(card, { scale: 1, duration: 1.2 }) // zoom back out
                        .to(card, { xPercent: 130, autoAlpha: 0, duration: 3 }); // exit right
                });
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

            // Positions measured while the tab was hidden can be stale, and a
            // throttled ticker may have left tweens mid-flight — resync on the
            // first frame after the page becomes visible again.
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
                // The pin outlives useGSAP's own revert if the media context
                // isn't torn down explicitly.
                mm.revert();
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
