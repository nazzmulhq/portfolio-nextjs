"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Clearance kept above pinned stages, for the fixed nav. */
const PIN_OFFSET = 104;

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}#$%&*+=—";

/**
 * Scramble text into place. Only used on monospace copy — a proportional
 * face would reflow on every frame as the random glyphs change width.
 */
const decode = (el: HTMLElement) => {
    const final = el.dataset.decodeText ?? el.textContent ?? "";
    el.dataset.decodeText = final;
    const chars = [...final];
    const state = { p: 0 };

    return gsap.to(state, {
        p: 1,
        duration: Math.min(1.6, 0.4 + chars.length * 0.012),
        ease: "power2.inOut",
        onUpdate: () => {
            const settled = state.p * chars.length;
            el.textContent = chars
                .map((c, i) => {
                    if (i < settled || c === " ") return c;
                    return GLYPHS[(Math.random() * GLYPHS.length) | 0];
                })
                .join("");
        },
        onComplete: () => {
            el.textContent = final;
        },
    });
};

/**
 * Split into per-character spans, each word wrapped in its own overflow-hidden
 * box so characters can be masked upward. Returns the character spans.
 *
 * Idempotent: the original string is stashed on the element, so a re-run (React
 * strict-mode double invoke, or a resize-driven rebuild) starts from the text
 * rather than from already-split markup.
 */
const splitChars = (el: HTMLElement) => {
    const text = el.dataset.splitText ?? el.textContent ?? "";
    el.dataset.splitText = text;
    el.textContent = "";

    const chars: HTMLElement[] = [];
    const words = text.split(" ");

    words.forEach((word, wi) => {
        const box = document.createElement("span");
        box.style.display = "inline-block";
        box.style.overflow = "hidden";
        box.style.verticalAlign = "top";
        // The mask would otherwise crop descenders ("q", "y", "p").
        box.style.paddingBottom = "0.14em";
        box.style.marginBottom = "-0.14em";

        [...word].forEach((ch) => {
            const s = document.createElement("span");
            s.textContent = ch;
            s.style.display = "inline-block";
            s.style.willChange = "transform";
            box.appendChild(s);
            chars.push(s);
        });

        el.appendChild(box);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });

    return chars;
};

/**
 * Home page motion. Every section gets its own technique rather than one shared
 * fade, so the page keeps introducing something new as you scroll:
 *
 *   hero        brackets draw, name masks up per character, copy decodes;
 *               powers down (scale + blur) on the way out
 *   skills      capability matrix powers on across the grid's diagonal,
 *               with a scan line sweeping down it
 *   experience  pinned deck; roles are drawn on with a top-down blind wipe
 *               while a node rail tracks position
 *   education   pinned; one record at a time enters from the right, zooms
 *               in, zooms back out, then exits left
 *   works       media sticks while its copy scrolls past it, unmasking
 *               sideways with a scan sweep on arrival
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
            const heroLines = q("[data-hero-line]");

            // Only reduced-motion skips setup. A hidden tab must NOT: the pinned
            // stages are layout features, and bailing here left them unbuilt for
            // anyone whose tab was backgrounded at load. A throttled ticker is
            // handled by the safety timeout and the visibility resync below.
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set([...heroBits, ...heroLines], { autoAlpha: 1, clearProps: "transform" });
                return;
            }

            const mm = gsap.matchMedia();

            // GSAP's ticker is rAF-driven, and browsers stop rAF entirely in a
            // backgrounded tab. A one-shot entrance that fires while hidden is
            // therefore left frozen part-way — the tab comes back showing
            // half-drawn headings and a partly-lit matrix. Registering those
            // tweens here lets the visibility handler settle whichever ones
            // actually started. Scrubbed tweens don't need this: their value is
            // recomputed from scroll position on the next refresh.
            const entrances: gsap.core.Animation[] = [];
            const onceIn = <T extends gsap.core.Animation>(anim: T) => {
                entrances.push(anim);
                return anim;
            };

            /* ── HERO — brackets, character mask, decode ─────────── */
            const heroChars = heroLines.flatMap((line) => splitChars(line));
            const brackets = q("[data-brackets] > span");

            const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

            intro
                .fromTo(
                    heroChars,
                    { yPercent: 115 },
                    { yPercent: 0, duration: 1, stagger: 0.022 },
                    0,
                )
                .fromTo(
                    brackets,
                    { scale: 0, autoAlpha: 0 },
                    { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.08 },
                    0.25,
                )
                .fromTo(
                    heroBits,
                    { y: 26, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09 },
                    0.35,
                );

            const decodeNow = scope.querySelector<HTMLElement>("[data-decode-now]");
            if (decodeNow) intro.add(decode(decodeNow), 0.7);

            // setTimeout still fires when rAF is throttled, so a stalled ticker
            // can never leave the hero permanently blank.
            const safety = setTimeout(() => {
                if (intro.progress() < 1) intro.progress(1);
            }, 2800);

            // Power-down on exit: the hero recedes rather than merely fading.
            const heroShell = scope.querySelector<HTMLElement>("#home > div");
            if (heroShell) {
                gsap.to(heroShell, {
                    scale: 0.94,
                    filter: "blur(6px)",
                    autoAlpha: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#home",
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.5,
                    },
                });
            }

            /* ── SECTION HEADINGS — rule draws, title masks up ───── */
            q("[data-heading]").forEach((header) => {
                const rule = header.querySelector<HTMLElement>("[data-heading-rule]");
                const title = header.querySelector<HTMLElement>("[data-decode]");
                const meta = header.querySelector<HTMLElement>("[data-heading-label]");
                const titleChars = title ? splitChars(title) : [];

                const tl = onceIn(gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: {
                        trigger: header,
                        start: "top 88%",
                        // `once`, not play/reverse. Two of these headings live
                        // inside pinned stages: a pinned element stops moving,
                        // so a refresh re-measures it as "before start" and the
                        // reverse fires — leaving the heading permanently blank
                        // for the whole pinned sequence.
                        once: true,
                    },
                }));

                if (rule) {
                    tl.fromTo(
                        rule,
                        { scaleX: 0, transformOrigin: "0 50%" },
                        { scaleX: 1, duration: 0.9, ease: "power3.inOut" },
                        0,
                    );
                }
                if (meta) tl.fromTo(meta, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.2);
                if (titleChars.length) {
                    tl.fromTo(
                        titleChars,
                        { yPercent: 110 },
                        { yPercent: 0, duration: 0.8, stagger: 0.014 },
                        0.25,
                    );
                }
            });

            /* ── SKILLS — capability matrix ─────────────────────── */
            const matrix = scope.querySelector<HTMLElement>("[data-skill-matrix]");
            const tiles = q<HTMLElement>("[data-skill-tile]");
            const legend = q<HTMLElement>("[data-skill-legend] > *");
            const matrixScan = scope.querySelector<HTMLElement>("[data-skill-scan]");

            if (matrix && tiles.length) {
                onceIn(gsap.fromTo(
                    legend,
                    { autoAlpha: 0, y: 10 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.06,
                        ease: "power3.out",
                        scrollTrigger: { trigger: matrix, start: "top 88%", once: true },
                    },
                ));

                // Tiles power on across the grid's diagonal. `stagger.grid: "auto"`
                // has GSAP infer rows/columns from the rendered layout, so the
                // sequence still reads correctly after the grid re-flows at a
                // different width.
                onceIn(gsap.fromTo(
                    tiles,
                    { autoAlpha: 0, scale: 0.82, filter: "blur(5px)" },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.55,
                        ease: "power3.out",
                        stagger: { grid: "auto", from: "start", amount: 0.9 },
                        scrollTrigger: { trigger: matrix, start: "top 82%", once: true },
                    },
                ));

                // A scan line crosses the matrix as it passes through the
                // viewport — scrubbed, so it tracks the scroll in both
                // directions instead of firing once.
                if (matrixScan) {
                    gsap.fromTo(
                        matrixScan,
                        { top: "-12%", autoAlpha: 0 },
                        {
                            top: "100%",
                            autoAlpha: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: matrix,
                                start: "top 85%",
                                end: "bottom 25%",
                                scrub: 0.5,
                            },
                        },
                    );
                }
            }

            /* ── EXPERIENCE — pinned deck, blind-wipe transitions ── */
            const stage = scope.querySelector<HTMLElement>("[data-exp-stage]");
            const expCards = q<HTMLElement>("[data-exp-card]");
            const expNodes = q<HTMLElement>("[data-exp-node]");

            if (stage && expCards.length > 1) {
                mm.add("(min-width: 1024px)", () => {
                    stage.setAttribute("data-deck-ready", "");

                    const deckEl = scope.querySelector<HTMLElement>("[data-exp-deck]");

                    // Size the deck to its tallest panel, capped to whatever the
                    // viewport has left once the heading and node rail — which
                    // share the pinned stage — have taken their space. A fixed
                    // height crops the longer roles now that the cards are
                    // absolutely positioned; an uncapped one runs the card's
                    // base off the bottom edge.
                    const fitDeck = () => {
                        if (!deckEl) return;
                        const tallest = expCards.reduce((max, card) => {
                            const panel = card.querySelector<HTMLElement>(".exp-panel");
                            return Math.max(max, panel?.scrollHeight ?? 0);
                        }, 0);
                        if (!tallest) return;

                        // Measured, not guessed: the deck is the stage's last
                        // child, so its offset doesn't depend on the height
                        // we're about to set.
                        const offset =
                            deckEl.getBoundingClientRect().top - stage.getBoundingClientRect().top;
                        const available = window.innerHeight - offset - 32;
                        deckEl.style.height = `${Math.ceil(Math.max(260, Math.min(tallest, available)))}px`;
                    };
                    fitDeck();
                    ScrollTrigger.addEventListener("refreshInit", fitDeck);

                    // Each role is *drawn on* top-down rather than slid in. The
                    // content never moves, so long copy stays readable through
                    // the whole transition.
                    gsap.set(expCards, { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" });
                    gsap.set(expCards[0], { clipPath: "inset(0% 0% 0% 0%)" });

                    const span = () => (expCards.length - 1) * window.innerHeight * 0.9;

                    const deck = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: stage,
                            // Stage is viewport-tall, so pinning at the top
                            // leaves each role centred on screen.
                            start: "top top",
                            end: span,
                            pin: true,
                            scrub: 0.6,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                const lit = Math.round(self.progress * (expCards.length - 1));
                                expNodes.forEach((n, i) => {
                                    if (i <= lit) n.setAttribute("data-on", "");
                                    else n.removeAttribute("data-on");
                                });
                            },
                        },
                    });

                    expCards.forEach((card, i) => {
                        if (i === 0) return;
                        // Outgoing recedes underneath while the incoming panel
                        // is wiped in over the top of it.
                        deck.to(expCards[i - 1], { scale: 0.97, autoAlpha: 0.55 }, i - 1);
                        deck.to(card, { clipPath: "inset(0% 0% 0% 0%)" }, i - 1);
                    });

                    return () => {
                        ScrollTrigger.removeEventListener("refreshInit", fitDeck);
                        stage.removeAttribute("data-deck-ready");
                        if (deckEl) deckEl.style.height = "";
                        gsap.set(expCards, { clearProps: "all" });
                    };
                });

                mm.add("(max-width: 1023px)", () => {
                    const tweens = expCards.map((card) =>
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
                        ),
                    );
                    return () => {
                        tweens.forEach((t) => t.scrollTrigger?.kill());
                        gsap.set(expCards, { clearProps: "all" });
                    };
                });
            }

            /* ── EDUCATION — one record at a time, exits left ────── */
            const eduStage = scope.querySelector<HTMLElement>("[data-edu-stage]");
            const eduCards = q<HTMLElement>("[data-edu-card]");
            const eduNodes = q<HTMLElement>("[data-edu-node]");

            if (eduStage && eduCards.length) {
                mm.add("(min-width: 1024px)", () => {
                    eduStage.setAttribute("data-edu-ready", "");

                    const deckEl = scope.querySelector<HTMLElement>("[data-edu-deck]");
                    const fitDeck = () => {
                        if (!deckEl) return;
                        const tallest = eduCards.reduce((max, card) => {
                            const panel = card.querySelector<HTMLElement>(".edu-panel");
                            return Math.max(max, panel?.scrollHeight ?? 0);
                        }, 0);
                        if (!tallest) return;
                        // Measured from the deck's own offset in the stage — the
                        // deck is the last child, so this doesn't depend on the
                        // height we're about to set.
                        const offset =
                            deckEl.getBoundingClientRect().top -
                            eduStage.getBoundingClientRect().top;
                        const available = window.innerHeight - offset - 32;
                        deckEl.style.height = `${Math.ceil(Math.max(240, Math.min(tallest, available)))}px`;
                    };
                    fitDeck();
                    ScrollTrigger.addEventListener("refreshInit", fitDeck);

                    // Everything starts off-stage to the right.
                    gsap.set(eduCards, { xPercent: 120, autoAlpha: 0, scale: 0.9 });

                    const journey = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: eduStage,
                            start: "top top",
                            end: () => `+=${eduCards.length * window.innerHeight * 0.95}`,
                            pin: true,
                            scrub: 0.6,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                const lit = Math.min(
                                    eduCards.length - 1,
                                    Math.floor(self.progress * eduCards.length),
                                );
                                eduNodes.forEach((n, i) => {
                                    if (i <= lit) n.setAttribute("data-on", "");
                                    else n.removeAttribute("data-on");
                                });
                            },
                        },
                    });

                    // Each record gets its own slice of the timeline, so they
                    // arrive strictly one by one rather than overlapping:
                    // in from the right, zoom in, zoom back out, exit left.
                    eduCards.forEach((card, i) => {
                        const at = i * 6;
                        journey
                            .to(
                                card,
                                { xPercent: 0, autoAlpha: 1, scale: 1, duration: 2 },
                                at,
                            )
                            .to(card, { scale: 1.12, duration: 1.2 }, at + 2)
                            .to(card, { scale: 1, duration: 1.2 }, at + 3.2)
                            .to(
                                card,
                                { xPercent: -120, autoAlpha: 0, scale: 0.9, duration: 2 },
                                at + 4.4,
                            );
                    });

                    return () => {
                        ScrollTrigger.removeEventListener("refreshInit", fitDeck);
                        eduStage.removeAttribute("data-edu-ready");
                        if (deckEl) deckEl.style.height = "";
                        gsap.set(eduCards, { clearProps: "all" });
                    };
                });

                // Below the pin breakpoint the records are a plain stacked list.
                mm.add("(max-width: 1023px)", () => {
                    const tweens = eduCards.map((card) =>
                        onceIn(
                            gsap.fromTo(
                                card,
                                { y: 30, autoAlpha: 0 },
                                {
                                    y: 0,
                                    autoAlpha: 1,
                                    duration: 0.7,
                                    ease: "power3.out",
                                    scrollTrigger: { trigger: card, start: "top 90%", once: true },
                                },
                            ),
                        ),
                    );
                    return () => {
                        tweens.forEach((t) => t.scrollTrigger?.kill());
                        gsap.set(eduCards, { clearProps: "all" });
                    };
                });
            }

            /* ── WORKS — sticky media, copy rises alongside ──────── */
            q("[data-work-row]").forEach((row) => {
                const media = row.querySelector<HTMLElement>("[data-work-media]");
                const copy = row.querySelector<HTMLElement>("[data-work-copy]");
                const sweep = row.querySelector<HTMLElement>("[data-work-sweep]");
                const img = row.querySelector<HTMLElement>("[data-parallax]");

                // Unmask scrubbed, not toggled. A toggleActions version stalled
                // a fraction of a frame in and never resumed, leaving every
                // project image permanently masked; a scrubbed value is a pure
                // function of scroll position, so there is no play/pause state
                // that can get stuck.
                if (media) {
                    gsap.fromTo(
                        media,
                        { clipPath: "inset(0% 0% 0% 100%)" },
                        {
                            clipPath: "inset(0% 0% 0% 0%)",
                            ease: "none",
                            scrollTrigger: {
                                trigger: row,
                                start: "top 92%",
                                end: "top 50%",
                                scrub: 0.6,
                            },
                        },
                    );
                }

                // The copy column rises against the stuck image. No transform on
                // the media itself: it is `position: sticky`, and a transform
                // would make it its own containing block and break the stick.
                if (copy) {
                    gsap.fromTo(
                        copy,
                        { y: 60 },
                        {
                            y: -60,
                            ease: "none",
                            scrollTrigger: {
                                trigger: row,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 0.6,
                            },
                        },
                    );
                }

                if (sweep) {
                    onceIn(
                        gsap.fromTo(
                            sweep,
                            { top: "-30%", autoAlpha: 0 },
                            {
                                top: "100%",
                                autoAlpha: 1,
                                duration: 1.2,
                                ease: "power2.inOut",
                                scrollTrigger: { trigger: row, start: "top 75%", once: true },
                                onComplete: () => gsap.set(sweep, { autoAlpha: 0 }),
                            },
                        ),
                    );
                }

                // Slow drift inside the frame so the shot isn't locked to it.
                if (img) {
                    gsap.fromTo(
                        img,
                        { yPercent: -4, scale: 1.06 },
                        {
                            yPercent: 4,
                            scale: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: row,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 0.6,
                            },
                        },
                    );
                }
            });

            /* ── FOOTER ──────────────────────────────────────────── */
            const address = scope.querySelector<HTMLElement>("footer a.display");
            if (address) {
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

            /* ── GENERIC REVEALS (anything not claimed above) ─────── */
            q(".reveal, .reveal-left, .reveal-right").forEach((el) => {
                const from = el.classList.contains("reveal-left")
                    ? { x: -50 }
                    : el.classList.contains("reveal-right")
                      ? { x: 50 }
                      : { y: 34 };
                gsap.fromTo(
                    el,
                    { ...from, autoAlpha: 0 },
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

            /* ── TELEMETRY READOUT — scroll position + section ────── */
            const bar = scope.ownerDocument.querySelector<HTMLElement>("[data-readout-bar]");
            const pct = scope.ownerDocument.querySelector<HTMLElement>("[data-readout-pct]");
            if (bar || pct) {
                gsap.set(bar, { scaleX: 0 });
                ScrollTrigger.create({
                    start: 0,
                    end: "max",
                    onUpdate: (self) => {
                        if (bar) gsap.set(bar, { scaleX: self.progress });
                        if (pct) pct.textContent = `${Math.round(self.progress * 100)}`.padStart(3, "0");
                    },
                });
            }

            const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

            // Positions measured while the tab was hidden can be stale, and a
            // throttled ticker may have left tweens mid-flight — resync on the
            // first frame after the page becomes visible again.
            const onVisible = () => {
                if (document.hidden) return;
                if (intro.progress() < 1) intro.progress(1);
                // Only tweens that already started: anything still at 0 hasn't
                // been scrolled into view yet and should keep its entrance.
                entrances.forEach((anim) => {
                    const p = anim.progress();
                    if (p > 0 && p < 1) anim.progress(1);
                });
                ScrollTrigger.refresh();
            };
            document.addEventListener("visibilitychange", onVisible);

            return () => {
                clearTimeout(safety);
                cancelAnimationFrame(raf);
                document.removeEventListener("visibilitychange", onVisible);
                // Pins outlive useGSAP's own revert unless the media context is
                // torn down explicitly.
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
