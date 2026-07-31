"use client";

import { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from "react";
import {
    CATEGORIES,
    CUST,
    DESIGN_W,
    EMPTY_ROWS,
    FIELDS,
    P0,
    PAY_ROWS,
    PREVIEW_ROWS,
    STEP_DETAILS,
    STEP_STARTS,
    STEPS,
    TABLES,
    TAIL,
    TARGETS,
    TOASTS,
    TOOLS,
    TRACK_VH,
} from "./landingData";

/* ────────────────────────────────────────────────────────────────
   Palette lifted from the design component. This block is a mock of
   VS Code's dark theme, so it is deliberately fixed rather than
   themed — it should look the same in the site's light mode, the way
   a screenshot would.
   ──────────────────────────────────────────────────────────────── */
const C = {
    canvas: "#08080b",
    chrome: "#181818",
    panel: "#1f1f1f",
    raised: "#202020",
    line: "#2b2b2b",
    line2: "#2f2f2f",
    line3: "#3a3a3a",
    rowLine: "#262626",
    text: "#e0e0e0",
    textStrong: "#e8e8e8",
    textDim: "#cccccc",
    muted: "#9d9d9d",
    faint: "#8b8b8b",
    dark: "#6f6f6f",
    blue: "#0078d4",
    blueLight: "#4daafc",
    bluePale: "#7cc4f5",
    amber: "#e2b13c",
    amberPale: "#f5cf6a",
    /** Focus ring on an active filter clause — dimmer than --amber, which is
        reserved for dirty-cell and key highlights inside the grid. */
    amberLine: "#c8862c",
    green: "#a8cf8f",
    cell: "#d4d4d4",
} as const;

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const UI = "-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif";

/** Ref keys the cursor can aim at, plus the stage elements the engine drives. */
type RefKey =
    | "track"
    | "lap"
    | "bez"
    | "base"
    | "screen"
    | "glow"
    | "hero"
    | "cap"
    | "cur"
    | "qdbIcon"
    | "extIcon"
    | "extCard"
    | "installBtn"
    | "addConn"
    | "pasteBtn"
    | "importBtn"
    | "fkRow"
    | "fkChip"
    | "filterVal"
    | "gridWrap"
    | "toast"
    | "toastText"
    | "extSearch"
    | "findBox"
    | "findText"
    | "custRow"
    | "saveBtn"
    | "rangeBox"
    | "rangeTip"
    | "closeTab"
    | "editCell"
    | "undoBtn"
    | "curArrow"
    | "curPointer"
    | "pasteArea";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CELL_COLS = "56px 200px 230px 190px 190px 190px 240px 210px 150px";
const PAY_COLS = "56px 420px 320px 390px 260px";

/**
 * Pointer height in the screen's 1920-wide design space, with the width
 * derived so the glyph keeps its 13:19 aspect. The mock's body text is 13px
 * in that space; much past this and the pointer stops reading as part of the
 * window and starts reading as an overlay sitting on top of it.
 */
const CURSOR_H = 20;
const CURSOR_W = (13 / 19) * CURSOR_H;

/**
 * Fraction into step 16 ("Close the tab, back to customers") at which the
 * payments tab actually closes. Lines up with the middle of the click-pulse
 * window in `glide` (0.58–0.74), so the tab disappears right as the cursor's
 * dip reads as a click on the ✕ rather than the tab vanishing on its own the
 * instant the step changes.
 */
const CLOSE_AT = 0.50;

/**
 * Fraction into step 10 ("customers · 122 rows") at which the customers tab
 * actually opens. The same problem as CLOSE_AT, mirrored: `grid = s >= 10`
 * flipped the main pane from the welcome logo straight to the open tab the
 * instant step 10 began, before the cursor had even arrived at the
 * `customers` row in the sidebar tree to click it.
 *
 * No longer the same literal value as CLOSE_AT: step 10 is now STEP10_WEIGHT
 * (8x) wider than every other step (see landingData.ts) so the slow
 * delete/type animation in phase 1 has real room to play out. That extra
 * width is spent entirely on phase 1 — this tab-open dwell already worked
 * fine at its old absolute size (46.2vh, i.e. 66% of the old 70vh-wide
 * step), so it keeps that exact same vh here, just as a smaller fraction
 * (46.2 / 560) of the new, wider step.
 */
const OPEN_AT = 0.12;

/**
 * Row index (into CUST) that step 10's edit/save/undo/save-again beat runs
 * against — CUST[8] is customerNumber 129, "Mini Wheels Co.", contactLastName
 * "Murphy". Picked because it sits inside the first page of an unfiltered
 * customers grid, away from the phone fill-down demo's own rows (steps
 * 11–13 touch indices 1–4), so the two beats never collide.
 */
const EDIT_ROW = 8;
const EDIT_VALUE = "Haque";

/**
 * The tab-open beat (OPEN_AT) claims step 10's first 46.2vh; everything
 * after that is split into five phases for edit → save → undo → save-again.
 * Each phase's content change is caused by the click the *previous* phase
 * spent traveling toward — the same "cursor arrives, then the state flips"
 * ordering as OPEN_AT/CLOSE_AT, just four beats instead of one.
 *
 * Phase 1 is uneven with the rest on purpose: it now runs a real focus →
 * backspace-out → retype animation (see runEditTypeAnim), which doesn't
 * start until the cursor has actually *arrived* at the cell (gated on
 * glide's own "near" check, not a fixed delay — the cursor is gliding here
 * from the sidebar tree, a long enough hop that a fixed delay would either
 * fire early or waste time), then takes ~2.2s more to play out at a pace
 * slow enough to actually read each letter, not just register that text is
 * changing.
 *
 * Phases 2-5 (each a single click, no animation of their own) already had
 * enough room at their old absolute size (~1.5vh apiece, out of the old
 * 70vh-wide step 10) — so rather than growing everything proportionally
 * when step 10 became STEP10_WEIGHT (8x) wider, they keep those exact old
 * vh widths, and *all* of the new space step 10 gained goes to phase 1,
 * which is the only phase that actually needed more. There's still no way
 * to *guarantee* enough wall-clock time inside a scroll-fraction window for
 * every possible scroll speed — the fallback is that phase 2 renders
 * EDIT_VALUE outright regardless of animation progress, so outrunning it
 * just skips straight to the finished word instead of freezing mid-type.
 *
 *   1  focus → delete "Murphy" → type EDIT_VALUE  — cursor heads to the cell
 *   2  dirty, showing EDIT_VALUE                  — cursor heads to Save
 *   3  saved, showing EDIT_VALUE                  — cursor heads to Undo
 *   4  dirty, reverted to original (instant — a real Ctrl+Z restores
 *      content atomically, not by backspacing)     — cursor heads to Save
 *   5  saved, reverted (final)                    — Undo stays lit from here on
 */
const EDIT_PHASE_BOUNDS = [0.45, 0.65, 0.80, 0.95] as const;

// Removed wall-clock timers for phase 1; it is now strictly scroll-driven.

const editPhaseFor = (step: number, frac: number): 0 | 1 | 2 | 3 | 4 | 5 => {
    if (step !== 10 || frac < OPEN_AT) return 0;
    if (frac < EDIT_PHASE_BOUNDS[0]) return 1;
    if (frac < EDIT_PHASE_BOUNDS[1]) return 2;
    if (frac < EDIT_PHASE_BOUNDS[2]) return 3;
    if (frac < EDIT_PHASE_BOUNDS[3]) return 4;
    return 5;
};

/**
 * GLIDE_EASE: set to 0.28 so the cursor rapidly and smoothly glides to the target
 * element as soon as you scroll into the step/sub-phase. This ensures the mouse
 * pointer ALWAYS arrives first at the element before any click pulse, hover, or action triggers.
 */
const GLIDE_EASE = 0.28;

const QuickDBStory: FC = () => {
    const refs = useRef({} as Record<RefKey, HTMLElement | SVGElement | null>);
    const set = (k: RefKey) => (el: HTMLElement | SVGElement | null) => {
        refs.current[k] = el;
    };

    const [step, setStep] = useState(1);
    const [selN, setSelN] = useState(0);
    const [findDone, setFindDone] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [tableOpen, setTableOpen] = useState(false);
    const [pastHover, setPastHover] = useState(false);
    const [pastClick, setPastClick] = useState(false);
    const [editPhase, setEditPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
    // One-way latch: real editors keep undo history around after a save, so
    // once this beat has made its first edit, Undo stays available (and lit)
    // for the rest of the story rather than greying out again once phase
    // settles back to a "saved, nothing pending" state.
    const [hasEditHistory, setHasEditHistory] = useState(false);
    // Live text for phase 1's focus/delete/type animation, plus whether it
    // has started. Both needed, not just the text: "" is also the genuine
    // mid-animation state right after "Murphy" is fully backspaced, so
    // rendering can't tell "not started" from "deliberately empty" by
    // looking at the text alone.
    const [editCellText, setEditCellText] = useState("");
    const [editAnimStarted, setEditAnimStartedState] = useState(false);



    const jumpToStep = (stepNum: number) => {
        const track = refs.current.track;
        if (!track) return;
        const vpH = typeof window !== "undefined" ? window.innerHeight : 800;
        const r = track.getBoundingClientRect();
        const span = Math.max(1, r.height - vpH);
        const targetP = STEP_STARTS[Math.max(0, Math.min(STEP_STARTS.length - 1, stepNum - 1))];
        const trackTop = window.scrollY + r.top;
        const targetY = trackTop + targetP * span;
        window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    const triggerToast = (msg: string) => {
        const t = refs.current.toast;
        const txt = refs.current.toastText;
        if (t && txt) {
            txt.textContent = msg;
            t.style.opacity = "1";
            t.style.transform = "translateY(0)";
            if (eng.current.toastTimer) clearTimeout(eng.current.toastTimer);
            eng.current.toastTimer = setTimeout(() => {
                const t2 = refs.current.toast;
                if (t2) {
                    t2.style.opacity = "0";
                    t2.style.transform = "translateY(10px)";
                }
            }, 3200);
        }
    };

    const NAV_ITEMS = [
        { label: "Data View", icon: "▤", live: true },
        { label: "Query Console", icon: "⌘", live: false },
        { label: "Query Builder", icon: "⚙", live: false },
        { label: "ERD Maker", icon: "◫", live: false },
        { label: "AI & MCP", icon: "⚡", live: false },
        { label: "Make Dashboard", icon: "▮▮", live: false },
    ] as const;

    const DATA_VIEW_SUBSTEPS = [
        { label: "Install", step: 1 },
        { label: "Connect", step: 7 },
        { label: "Edit Grid", step: 10 },
        { label: "Fill Down", step: 12 },
        { label: "FK Rel", step: 13 },
        { label: "Paste Import", step: 16 },
        { label: "Save IDs", step: 19 },
    ] as const;

    // Mutable engine scratch — deliberately outside React state so the scroll
    // loop can run at frame rate without re-rendering.
    const eng = useRef({
        targetP: 0,
        smoothP: 0,
        animatingP: false,
        p: 0,
        frac: 0,
        visible: false,
        cx: null as number | null,
        cy: null as number | null,
        aim: null as { x: number; y: number } | null,
        gliding: false,
        seen: {} as Record<string, { x: number; y: number }>,
        sh: 0,
        step: 1,
        selN: 0,
        paymentsOpen: false,
        tableOpen: false,
        pastHover: false,
        pastClick: false,
        editPhase: 0 as 0 | 1 | 2 | 3 | 4 | 5,
        hasEditHistory: false,
        editCellText: "",
        editAnimStarted: false,
        findDone: false,
        typeP: { extSearch: 0, findText: 0 } as Record<string, number>,
        typeD: { extSearch: 0, findText: 0 } as Record<string, number>,
        typeTs: 0,
        typeRaf: 0,
        raf: 0,
        toastTimer: 0 as ReturnType<typeof setTimeout> | 0,
    });

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const narrow = window.matchMedia("(max-width: 1023px)").matches;
        // The story is a 1920px-wide artefact. Below the breakpoint the compact
        // version is what is on screen, so there is nothing here to drive.
        if (reduced || narrow) return undefined;

        const e = eng.current;
        const el = (k: RefKey) => refs.current[k];

        const viewport = () => {
            const st = el("track")?.firstElementChild as HTMLElement | null;
            const de = document.documentElement;
            return {
                w: st?.clientWidth || de.clientWidth || window.innerWidth,
                h: de.clientHeight || window.innerHeight,
            };
        };

        /* ── cursor ─────────────────────────────────────────────── */
        const resolveAim = (s: number) => {
            const scr = el("screen");
            if (!scr) return;
            const toDesign = (node: Element) => {
                const sr = scr.getBoundingClientRect();
                const r = node.getBoundingClientRect();
                const k = sr.width / DESIGN_W || 1;
                if (!r.width) return null;
                return {
                    x: (r.left + r.width / 2 - sr.left) / k,
                    y: (r.top + r.height / 2 - sr.top) / k,
                };
            };

            // Step 10's tail (past the tab-open threshold) hands the cursor
            // between the edited cell, Save and Undo as the edit/save/undo/
            // save-again beat plays out. Each target is the control whose
            // click causes the *next* phase's content change — see
            // editPhaseFor's phase-by-phase comment.
            if (s === 10 && e.editPhase > 0) {
                const target: RefKey =
                    e.editPhase === 1
                        ? "editCell"
                        : e.editPhase === 2
                          ? "saveBtn"
                          : e.editPhase === 3
                            ? "undoBtn"
                            : "saveBtn";
                const node = el(target);
                if (node) {
                    const a = toDesign(node);
                    if (a) {
                        e.aim = a;
                        return;
                    }
                }
            }
            // Step 13 hands off from the FK chip to the popover row midway.
            if (s === 13) {
                const node = e.frac < 0.45 ? el("fkChip") : el("fkRow");
                if (node) {
                    const a = toDesign(node);
                    if (a) {
                        e.aim = a;
                        return;
                    }
                }
            }
            // Step 14 displays the filtered payments tab cleanly — hold pointer still (no hover over table).
            if (s === 14) {
                if (e.seen["fkRow"]) {
                    e.aim = e.seen["fkRow"];
                    return;
                }
            }
            // Step 11 tracks the growing selection rather than a fixed node:
            // the drag handle rides the bottom-right corner of the range box,
            // which is n rows tall and offset by the grid's header.
            //
            // The grid's own top is measured, not assumed. The design hardcoded
            // 204 here, which was exactly the chrome above it (28 menu + 38
            // window + 36 tabs + 60 toolbar + 42 filter) — so any change to a
            // toolbar's height silently put the cursor in the wrong place.
            if (s === 11) {
                const n = e.selN || 1;
                const wrap = el("gridWrap");
                if (wrap) {
                    const sr = scr.getBoundingClientRect();
                    const k = sr.width / DESIGN_W || 1;
                    const gridTop = (wrap.getBoundingClientRect().top - sr.top) / k;
                    e.aim = { x: 1496, y: gridTop + 34 + n * 31 - 6 };
                    return;
                }
            }

            const t = TARGETS[s];
            if (Array.isArray(t)) {
                e.aim = { x: t[0], y: t[1] };
                return;
            }
            const node = el(t as RefKey);
            if (node) {
                const a = toDesign(node);
                // Cache the last good position: the node may unmount on the
                // next step while the cursor is still gliding away from it.
                if (a) e.seen[t as string] = a;
            }
            if (e.seen[t as string]) e.aim = e.seen[t as string];
        };

        const glide = () => {
            const cur = el("cur");
            resolveAim(e.step);
            if (!cur || !e.aim) {
                e.gliding = false;
                return;
            }
            if (e.cx == null || e.cy == null) {
                e.cx = e.aim.x;
                e.cy = e.aim.y;
            }
            const dx = e.aim.x - e.cx;
            const dy = e.aim.y - e.cy;
            e.cx += dx * GLIDE_EASE;
            e.cy += dy * GLIDE_EASE;
            const near = Math.abs(dx) < 24 && Math.abs(dy) < 24;
            
            // Toggle cursor style: Pointer Hand when near target, Arrow when gliding across empty canvas
            const arr = el("curArrow");
            const ptr = el("curPointer");
            if (arr && ptr) {
                if (near) {
                    arr.style.display = "none";
                    ptr.style.display = "block";
                } else {
                    arr.style.display = "block";
                    ptr.style.display = "none";
                }
            }

            // A brief dip while parked reads as the click. Shallower than the
            // dot's 0.62: an arrow shrinking that far reads as broken rather
            // than pressed, because its silhouette carries the meaning.
            const isClickWindow =
                e.step === 10
                    ? (e.frac > 0.06 && e.frac < 0.11) ||
                      (e.frac > 0.50 && e.frac < 0.54) ||
                      (e.frac > 0.70 && e.frac < 0.74) ||
                      (e.frac > 0.85 && e.frac < 0.89)
                    : e.frac > 0.40 && e.frac < 0.65;
            const pulse = near && isClickWindow ? 0.84 : 1;
            cur.style.left = `${e.cx.toFixed(1)}px`;
            cur.style.top = `${e.cy.toFixed(1)}px`;
            cur.style.opacity = e.visible ? "1" : "0";
            // Tip-anchored: the element's origin is the arrow's point.
            cur.style.transform = `scale(${pulse})`;
            if (Math.abs(dx) > 0.6 || Math.abs(dy) > 0.6 || pulse !== 1) {
                e.gliding = true;
                requestAnimationFrame(glide);
            } else {
                e.gliding = false;
            }
        };

        const aimCursor = (s: number) => {
            if (!el("screen") || !el("cur")) return;
            resolveAim(s);
            if (!e.aim) return;
            if (e.cx == null) {
                e.cx = e.aim.x;
                e.cy = e.aim.y;
            }
            if (!e.gliding) glide();
        };

        /* ── typing ─────────────────────────────────────────────── */
        const typeLoop = (ts: number) => {
            e.typeRaf = 0;
            const last = e.typeTs || ts;
            const dt = Math.min(64, ts - last);
            e.typeTs = ts;
            let busy = false;

            FIELDS.forEach((fd) => {
                const node = el(fd.key);
                const on = fd.active(e.step);
                const target = on ? 1 : 0;
                let p = e.typeP[fd.key];

                if (on) {
                    e.typeD[fd.key] += dt;
                    if (e.typeD[fd.key] < fd.delay) {
                        busy = true;
                        if (node && p === 0) {
                            node.textContent = fd.placeholder;
                            node.style.color = C.faint;
                        }
                        return;
                    }
                } else {
                    e.typeD[fd.key] = 0;
                }

                const span = fd.word.length * fd.per;
                const amt = dt / span;
                if (p < target) p = Math.min(1, p + amt);
                else if (p > target) p = Math.max(0, p - amt * 1.6);
                e.typeP[fd.key] = p;
                if (p !== target) busy = true;

                if (node) {
                    const n = Math.round(fd.word.length * p);
                    node.textContent = n ? fd.word.slice(0, n) : fd.placeholder;
                    node.style.color = n ? C.text : C.faint;
                }
                if (fd.key === "findText") {
                    const done = p >= 1;
                    if (done !== e.findDone) {
                        e.findDone = done;
                        setFindDone(done);
                    }
                }
            });

            if (busy) e.typeRaf = requestAnimationFrame(typeLoop);
        };

        const kickTyping = () => {
            if (e.typeRaf) return;
            e.typeTs = 0;
            e.typeRaf = requestAnimationFrame(typeLoop);
        };



        /* ── per-step chrome (icon highlight + toast) ───────────── */
        const applyStep = (s: number) => {
            const cap = el("cap");
            if (cap) {
                cap.style.opacity = "0";
                requestAnimationFrame(() => {
                    const c2 = el("cap");
                    if (c2) c2.style.opacity = e.p >= P0 * 0.55 ? "1" : "0";
                });
            }
            const mark = (node: HTMLElement | SVGElement | Element | null, on: boolean) => {
                if (!node || !("style" in node)) return;
                node.style.color = on ? C.textStrong : C.faint;
                node.style.boxShadow = on ? `inset 2px 0 0 0 ${C.blue}` : "none";
            };
            mark(el("extIcon"), s >= 2 && s <= 6);
            mark(el("qdbIcon"), s >= 7);

            const msg = TOASTS[s];
            const t = el("toast");
            if (t) {
                if (msg) {
                    const txt = el("toastText");
                    if (txt) txt.textContent = msg;
                    t.style.opacity = "1";
                    t.style.transform = "translateY(0)";
                } else {
                    t.style.opacity = "0";
                    t.style.transform = "translateY(10px)";
                }
                if (e.toastTimer) clearTimeout(e.toastTimer);
                if (msg) {
                    e.toastTimer = setTimeout(() => {
                        const t2 = el("toast");
                        if (t2) {
                            t2.style.opacity = "0";
                            t2.style.transform = "translateY(10px)";
                        }
                    }, 3400);
                }
            }
            requestAnimationFrame(() => aimCursor(s));
            kickTyping();
        };

        /* ── scroll tick ────────────────────────────────────────── */
        const tick = () => {
            const track = el("track");
            if (!track) return;
            const vp = viewport();
            const r = track.getBoundingClientRect();
            const span = Math.max(1, r.height - vp.h);
            const p = clamp01(-r.top / span);

            // The screen keeps a fixed 1920-wide design space; its height is
            // derived so the laptop matches the viewport's aspect.
            const sh = Math.max(720, Math.round((DESIGN_W * vp.h) / vp.w));
            if (e.sh !== sh) {
                e.sh = sh;
                [el("lap"), el("screen")].forEach((node) => {
                    if (node) node.style.height = `${sh}px`;
                });
            }

            const full = vp.w / DESIGN_W;
            const start = Math.min((vp.w * 0.52) / DESIGN_W, (vp.h * 0.46) / sh);
            const k = start + (full - start) * easeInOutCubic(clamp01(p / 0.075));
            const lap = el("lap");
            if (lap) lap.style.transform = `translate(-50%,-50%) scale(${k.toFixed(4)})`;

            // Bezel, base and glow dissolve as the screen goes full-bleed.
            const chrome = 1 - clamp01((p - 0.05) / 0.055);
            (["bez", "base", "glow"] as const).forEach((n) => {
                const node = el(n);
                if (node) node.style.opacity = String(chrome);
            });
            const scr = el("screen");
            if (scr) scr.style.borderRadius = `${(12 * chrome).toFixed(2)}px`;
            const hero = el("hero");
            if (hero) hero.style.opacity = String(1 - clamp01(p / 0.03));

            e.p = p;
            const cap = el("cap");
            if (cap) cap.style.opacity = p >= P0 * 0.55 ? "1" : "0";

            // Steps aren't equal width any more (step 10 is STEP10_WEIGHT
            // times wider than the rest — see landingData.ts), so "which
            // step, and how far into it" is a lookup against STEP_STARTS
            // rather than a flat division. Only 20 entries; a linear scan
            // on a scroll-throttled tick is free.
            let s = 1;
            while (s < STEPS.length && p >= STEP_STARTS[s]) s++;
            const stepStart = STEP_STARTS[s - 1];
            const stepEnd = STEP_STARTS[s];
            e.frac = clamp01((p - stepStart) / (stepEnd - stepStart));
            e.visible = p >= 0.06 && p <= 0.995;
            aimCursor(s);

            const n =
                s === 11
                    ? Math.min(5, 1 + Math.floor(clamp01((e.frac - 0.08) / 0.74) * 5))
                    : s >= 12 && s <= 20
                      ? 5
                      : 0;
            if (n) {
                const box = el("rangeBox");
                const tip = el("rangeTip");
                if (box) box.style.height = `${n * 31}px`;
                if (tip) tip.style.top = `${34 + n * 31 - 30}px`;
            }

            // The payments tab stays open through the first part of step 15 so
            // the cursor has something to travel to and click — CLOSE_AT lines
            // up with the middle of the pulse window above, so the tab closes
            // right as the click reads. Past that point TARGETS[15]'s ref is
            // gone; resolveAim falls back to the last cached position, so the
            // cursor holds still where it clicked rather than jumping.
            const paymentsOpen = s === 14 || (s === 15 && e.frac < CLOSE_AT);

            // Mirror of paymentsOpen: the customers tab stays CLOSED through
            // the first part of step 10, so the cursor visibly arrives at the
            // customers row in the sidebar tree and "clicks" it before the
            // tab appears, instead of the tab being open before the cursor
            // even sets off toward the row.
            const tableOpen = s > 10 || (s === 10 && e.frac >= OPEN_AT);

            // Edit → save → undo → save-again, in step 10's tail. See
            // editPhaseFor's comment for what each phase shows and where the
            // cursor heads next. hasEditHistory is a one-way latch: once the
            // first dirty phase (2) is reached it never resets, so Undo stays
            // lit for the rest of the story rather than greying out again
            // once this beat settles back to "saved, nothing pending".
            const editPhase = editPhaseFor(s, e.frac);
            const hasEditHistory = e.hasEditHistory || editPhase >= 2;
            const isPastHover = e.frac > 0.4;
            const isPastClick = e.frac > 0.45;

            // Scroll-driven typing animation for phase 1
            if (s === 10 && editPhase === 1) {
                const start = OPEN_AT;
                const end = EDIT_PHASE_BOUNDS[0];
                const f = clamp01((e.frac - start) / (end - start));
                const originalLast = CUST[EDIT_ROW][2];

                let text = originalLast;
                if (f < 0.20) {
                    text = originalLast;
                } else if (f < 0.50) {
                    const p = (f - 0.20) / 0.30;
                    const keep = Math.round((1 - p) * originalLast.length);
                    text = originalLast.slice(0, Math.max(0, keep));
                } else if (f < 0.60) {
                    text = "";
                } else {
                    const p = (f - 0.60) / 0.40;
                    const len = Math.round(p * EDIT_VALUE.length);
                    text = EDIT_VALUE.slice(0, Math.min(EDIT_VALUE.length, len));
                }

                if (text !== e.editCellText) {
                    e.editCellText = text;
                    setEditCellText(text);
                }
                
                if (!e.editAnimStarted) {
                    e.editAnimStarted = true;
                    setEditAnimStartedState(true);
                }
            } else if (editPhase !== 1) {
                if (e.editAnimStarted) {
                    e.editAnimStarted = false;
                    e.editCellText = "";
                    setEditAnimStartedState(false);
                    setEditCellText("");
                }
            }

            if (
                s !== e.step ||
                n !== e.selN ||
                paymentsOpen !== e.paymentsOpen ||
                tableOpen !== e.tableOpen ||
                isPastHover !== e.pastHover ||
                isPastClick !== e.pastClick ||
                editPhase !== e.editPhase ||
                hasEditHistory !== e.hasEditHistory
            ) {
                const changedStep = s !== e.step;
                const changedSelN = n !== e.selN;
                const changedTableOpen = tableOpen !== e.tableOpen;
                const changedPaymentsOpen = paymentsOpen !== e.paymentsOpen;
                const changedPastHover = isPastHover !== e.pastHover;
                const changedPastClick = isPastClick !== e.pastClick;
                const changedEditPhase = editPhase !== e.editPhase;
                const changedHasEditHistory = hasEditHistory !== e.hasEditHistory;

                e.step = s;
                e.selN = n;
                e.paymentsOpen = paymentsOpen;
                e.tableOpen = tableOpen;
                e.pastHover = isPastHover;
                e.pastClick = isPastClick;
                e.editPhase = editPhase;
                e.hasEditHistory = hasEditHistory;

                if (changedStep) setStep(s);
                if (changedSelN) setSelN(n);
                if (changedTableOpen) setTableOpen(tableOpen);
                if (changedPaymentsOpen) setPaymentsOpen(paymentsOpen);
                if (changedPastHover) setPastHover(isPastHover);
                if (changedPastClick) setPastClick(isPastClick);
                if (changedEditPhase) setEditPhase(editPhase);
                if (changedHasEditHistory) setHasEditHistory(hasEditHistory);
                if (changedStep) applyStep(s);
            }
        };

        const onScroll = () => {
            if (e.raf) return;
            e.raf = requestAnimationFrame(() => {
                e.raf = 0;
                tick();
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        window.addEventListener("resize", onScroll, { passive: true });
        tick();
        applyStep(e.step);

        return () => {
            window.removeEventListener("scroll", onScroll, { capture: true });
            window.removeEventListener("resize", onScroll);
            if (e.raf) cancelAnimationFrame(e.raf);
            if (e.typeRaf) cancelAnimationFrame(e.typeRaf);
            if (e.toastTimer) clearTimeout(e.toastTimer);
        };
    }, []);

    /* ── derived view model (mirrors the design's renderVals) ──── */
    const s = step;
    // Not just s === 15: the payments tab stays mounted into the first part
    // of step 16 so there's something for the cursor to close (see tick()).
    const pay = paymentsOpen;
    // Step 20 is the save landing: same tail rows as step 19 (the pasted
    // records are still the last thing in the table), but now committed.
    const tail = (s === 18 && pastClick) || s === 19 || s === 20;
    const imported = (s === 19 && pastClick) || s === 20;
    // Not just s >= 10: the tab stays closed into the first part of step 10
    // so the cursor visibly clicks the customers row first (see tick()).
    const grid = tableOpen;
    const filtering = s === 9 && findDone;
    const dirty = s === 12 && !pastClick;
    const filled = s >= 12 && !tail;
    const fillVal = CUST[0][4];
    const changes = (s === 18 && pastClick) || (s === 19 && !pastClick) ? 7 : (s === 12 && !pastClick) ? 4 : editPhase === 2 || editPhase === 4 ? 1 : 0;
    const editFocused = editPhase === 1;
    const editShowingValue = editPhase === 2 || editPhase === 3;
    const editDirty = editPhase === 2 || editPhase === 4;

    const src = tail ? TAIL : CUST;
    const rows = src.map((c, i) => {
        const swap = filled && i >= 1 && i <= 4;
        const isEditRow = s === 10 && !tail && i === EDIT_ROW;
        // The pasted rows land without an assigned customerNumber (the paste
        // preview's "Auto-generate IDs" checkbox is what fills these in) —
        // blank through step 19's "staged" view, sequential once step 20
        // shows the committed table. i=10 is TAIL's first ID-less row.
        const isNewId = c[0] === "" && imported;
        const num = isNewId ? 497 + (i - 10) : c[0];
        // Phase 1: the live delete/type animation once it's actually
        // started (editAnimStarted), c[2] ("Murphy", untouched) before
        // that — editCellText is "" both before the animation starts and
        // mid-delete once "Murphy" is genuinely fully backspaced, so the
        // text alone can't tell those two states apart.
        const last = isEditRow
            ? editFocused
                ? editAnimStarted
                    ? editCellText
                    : c[2]
                : editShowingValue
                  ? EDIT_VALUE
                  : c[2]
            : c[2];
        return {
            i: tail ? 113 + i : i + 1,
            num,
            isNewId,
            name: c[1],
            last,
            lastBg: isEditRow && editDirty ? "rgba(226,177,60,.16)" : "transparent",
            // Matches the row's own ambient text colour (C.cell) when not
            // dirty — this cell has no colour override the rest of the time.
            lastFg: isEditRow && editDirty ? C.amberPale : C.cell,
            lastFocused: isEditRow && editFocused,
            lastRef: isEditRow ? "editCell" : undefined,
            first: c[3],
            phone: swap ? fillVal : c[4],
            phoneBg: swap && dirty ? "rgba(226,177,60,.16)" : "transparent",
            phoneFg: swap && dirty ? C.amberPale : C.cell,
            a1: c[5],
            a2: c[6],
            city: c[7],
            staged: tail && c[0] === "" && !imported,
        };
    });

    const visibleTables = TABLES.filter((t) => !filtering || t[0].startsWith("cust"));
    // Overrides only what the caption pill displays — the underlying step
    // number (and everything keyed off it) is untouched, so this doesn't
    // carry the renumbering risk a real new step would: every other
    // conditional in this file keeps reading the same s === 10 it always did.
    const EDIT_CAPTIONS: Record<number, string> = {
        1: "Click into a cell to edit it",
        2: "Edited — contactLastName → “Haque”",
        3: "Saved",
        4: "Undo — reverts the edit",
        5: "Saved again",
    };
    const capStep =
        s === 10 && editPhase > 0
            ? (["10", EDIT_CAPTIONS[editPhase]] as const)
            : s === 20 && !pastClick
              ? (STEPS[18] ?? STEPS[0])
              : (STEPS[s - 1] ?? STEPS[0]);

    const sideExt = s >= 2 && s <= 6;
    const sideQdb = s >= 7;
    const sideAny = s >= 2;
    // Extends into step 10 until tableOpen flips: without that, the welcome
    // pane would disappear (grid still false, mainWelcome already false) and
    // the pane briefly shows neither — an empty gap between logo and grid.
    const mainWelcome = s <= 3 || (s >= 7 && s <= 9) || (s === 10 && !grid);
    const mainExt = s >= 4 && s <= 6;
    const pastePanel = (s === 16 && pastClick) || s === 17 || (s === 18 && !pastClick);

    const th: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "0 9px",
        borderRight: `1px solid ${C.line2}`,
    };
    const td: CSSProperties = {
        display: "flex",
        alignItems: "center",
        padding: "0 9px",
        borderRight: `1px solid ${C.rowLine}`,
        overflow: "hidden",
        whiteSpace: "nowrap",
    };
    const typeTag = (bg: string, fg: string, label: string) => (
        <span style={{ fontSize: 9.5, background: bg, color: fg, borderRadius: 2, padding: "1.5px 3px" }}>
            {label}
        </span>
    );
    const key = <span style={{ color: C.amber }}>🔑</span>;
    const colMenu = <span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>;

    return (
        <div
            className="qd-track"
            ref={set("track")}
            style={{ position: "relative", height: `${TRACK_VH}vh` }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflow: "hidden",
                    background:
                        "radial-gradient(120% 90% at 50% 6%,#15151d 0%,#0a0a0e 55%,#08080b 100%)",
                }}
            >
                <div
                    aria-hidden
                    ref={set("glow")}
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "52%",
                        width: 1200,
                        height: 640,
                        transform: "translate(-50%,-50%)",
                        background:
                            "radial-gradient(50% 50% at 50% 50%,rgba(0,120,212,.2),rgba(0,120,212,0) 70%)",
                        filter: "blur(24px)",
                        pointerEvents: "none",
                    }}
                />

                {/* ── laptop ── */}
                <div
                    ref={set("lap")}
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: DESIGN_W,
                        height: 1080,
                        transformOrigin: "50% 50%",
                        transform: "translate(-50%,-50%) scale(.4)",
                    }}
                >
                    <div
                        aria-hidden
                        ref={set("bez")}
                        style={{
                            position: "absolute",
                            inset: "-18px -18px -48px",
                            borderRadius: 30,
                            background: "linear-gradient(160deg,#3a3a44,#191920 40%,#101016)",
                            boxShadow:
                                "0 70px 140px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06) inset",
                        }}
                    />
                    <div
                        aria-hidden
                        ref={set("base")}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "100%",
                            marginTop: 50,
                            transform: "translateX(-50%)",
                            width: 2260,
                            height: 30,
                            borderRadius: "0 0 22px 22px",
                            background: "linear-gradient(180deg,#44444e,#22222a 40%,#0e0e12)",
                            boxShadow: "0 50px 70px -20px rgba(0,0,0,.85)",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: 0,
                                transform: "translateX(-50%)",
                                width: 230,
                                height: 9,
                                borderRadius: "0 0 9px 9px",
                                background: "#0b0b10",
                            }}
                        />
                    </div>

                    {/* ── screen ── */}
                    <div
                        ref={set("screen")}
                        style={{
                            position: "relative",
                            width: DESIGN_W,
                            height: 1080,
                            overflow: "hidden",
                            borderRadius: 12,
                            background: C.chrome,
                            display: "flex",
                            flexDirection: "column",
                            fontFamily: UI,
                        }}
                    >
                        {/* macOS menu bar */}
                        <div
                            style={{
                                height: 28,
                                flex: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 18,
                                padding: "0 14px",
                                background: "#0b0b0f",
                                fontSize: 13,
                                color: "rgba(255,255,255,.92)",
                            }}
                        >
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,.9)" }} />
                            <span style={{ fontWeight: 600 }}>Editor</span>
                            {["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Window", "Help"].map((m) => (
                                <span key={m}>{m}</span>
                            ))}
                            <div
                                style={{
                                    marginLeft: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 15,
                                    color: "rgba(255,255,255,.85)",
                                    fontSize: 12.5,
                                }}
                            >
                                <span>28°C</span>
                                <span>100%</span>
                                <div
                                    style={{
                                        width: 24,
                                        height: 12,
                                        borderRadius: 3,
                                        border: "1px solid rgba(255,255,255,.5)",
                                        padding: 1.5,
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div style={{ width: "100%", height: "100%", borderRadius: 1, background: "rgba(255,255,255,.9)" }} />
                                </div>
                                <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.7)" }} />
                                <span>Tue 28 Jul 8:51 PM</span>
                            </div>
                        </div>

                        {/* window bar */}
                        <div
                            style={{
                                height: 38,
                                flex: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                padding: "0 12px",
                                background: C.chrome,
                                borderBottom: `1px solid ${C.line}`,
                            }}
                        >
                            <div style={{ display: "flex", gap: 8 }}>
                                {["#ff5f57", "#febc2e", "#28c840"].map((bg) => (
                                    <div key={bg} style={{ width: 12, height: 12, borderRadius: "50%", background: bg }} />
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 14, color: C.faint, fontSize: 14, marginLeft: 8 }}>
                                <span>←</span>
                                <span>→</span>
                            </div>
                            <div
                                style={{
                                    margin: "0 auto",
                                    width: 600,
                                    height: 24,
                                    borderRadius: 6,
                                    background: C.raised,
                                    border: `1px solid ${C.line2}`,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                    fontSize: 12,
                                    color: C.faint,
                                }}
                            >
                                Search
                            </div>
                            <div style={{ display: "flex", gap: 10, opacity: 0.5 }}>
                                {["", "borderLeftWidth", "borderBottomWidth", "borderRightWidth"].map((k2, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 16,
                                            height: 12,
                                            border: "1.4px solid #b0b0b0",
                                            borderRadius: 2,
                                            ...(k2 ? { [k2]: 5 } : {}),
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                            {/* activity bar */}
                            <div
                                style={{
                                    width: 48,
                                    flex: "none",
                                    background: C.chrome,
                                    borderRight: `1px solid ${C.line}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "6px 0",
                                }}
                            >
                                <ActIcon>
                                    <rect x="4.5" y="2.5" width="11" height="16" rx="1.5" />
                                    <path d="M15.5 6.5h4v15h-11" />
                                </ActIcon>
                                {s >= 6 && (
                                    <div
                                        ref={set("qdbIcon")}
                                        style={{ width: 48, height: 48, display: "grid", placeItems: "center", position: "relative" }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt="QuickDB"
                                            src="/images/quickdb-logo.png"
                                            style={{ width: 24, height: 24, borderRadius: 5, objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                                <ActIcon>
                                    <circle cx="10.5" cy="10.5" r="6.5" />
                                    <path d="M15.5 15.5L20 20" />
                                </ActIcon>
                                <ActIcon>
                                    <circle cx="7" cy="5.5" r="2.5" />
                                    <circle cx="7" cy="18.5" r="2.5" />
                                    <circle cx="17" cy="9" r="2.5" />
                                    <path d="M7 8v8M9.5 5.5H14a3 3 0 0 1 3 3" />
                                </ActIcon>
                                <ActIcon>
                                    <path d="M7 4.5l11 7.5-11 7.5z" />
                                </ActIcon>
                                <ActIcon>
                                    <circle cx="12" cy="12" r="3.4" />
                                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
                                </ActIcon>
                                <div
                                    ref={set("extIcon")}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        display: "grid",
                                        placeItems: "center",
                                        color: C.faint,
                                        position: "relative",
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                                        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
                                        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
                                        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
                                        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
                                    </svg>
                                </div>
                                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
                                    <ActIcon>
                                        <circle cx="12" cy="9" r="3.4" />
                                        <circle cx="12" cy="12" r="9" />
                                    </ActIcon>
                                    <ActIcon>
                                        <circle cx="12" cy="12" r="3.2" />
                                        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.7 15H3.4a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.7 8.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10.2 4V3.7a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2Z" />
                                    </ActIcon>
                                </div>
                            </div>

                            {/* side bar */}
                            {sideAny && (
                                <div
                                    style={{
                                        width: 392,
                                        flex: "none",
                                        background: C.chrome,
                                        borderRight: `1px solid ${C.line}`,
                                        display: "flex",
                                        flexDirection: "column",
                                        overflow: "hidden",
                                    }}
                                >
                                    {sideExt && (
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                                            <PanelTitle>
                                                EXTENSIONS: MARKETPLACE
                                                <span style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 13, color: C.muted }}>
                                                    ↻ ···
                                                </span>
                                            </PanelTitle>
                                            <div
                                                style={{
                                                    margin: "0 14px",
                                                    height: 26,
                                                    border: `1px solid ${C.line3}`,
                                                    background: C.raised,
                                                    borderRadius: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "0 8px",
                                                    fontSize: 12.5,
                                                    color: C.text,
                                                }}
                                            >
                                                <span ref={set("extSearch")} style={{ color: C.faint }}>
                                                    Search Extensions in Marketplace
                                                </span>
                                                {s === 2 && <Caret />}
                                                <span style={{ marginLeft: "auto", display: "flex", gap: 8, color: C.muted, fontSize: 12 }}>
                                                    ⌫ ⚟
                                                </span>
                                            </div>

                                            {s === 2 && (
                                                <div style={{ marginTop: 8, fontSize: 11, letterSpacing: ".06em", color: C.textDim, fontWeight: 600 }}>
                                                    <TreeRow label="INSTALLED" badge="35" />
                                                    <TreeRow label="RECOMMENDED" badge="6" />
                                                    <div
                                                        style={{
                                                            height: 23,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            padding: "0 10px",
                                                            background: "#04395e",
                                                            outline: `1px solid ${C.blue}`,
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 9, color: C.muted }}>›</span>
                                                        MCP SERVERS - INSTALLED
                                                    </div>
                                                </div>
                                            )}

                                            {s >= 3 && (
                                                <div ref={set("extCard")} style={{ marginTop: 8, display: "flex", gap: 12, padding: "10px 12px" }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        alt="QuickDB"
                                                        src="/images/quickdb-logo.png"
                                                        style={{ width: 44, height: 44, flex: "none", borderRadius: 8, objectFit: "cover" }}
                                                    />
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                                            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.textStrong }}>QuickDB</span>
                                                            <span style={{ marginLeft: "auto", fontSize: 11.5, color: C.muted }}>⇩ 465</span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: C.muted,
                                                                marginTop: 2,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            Lightweight database browser for VS Code. Conn…
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", marginTop: 5 }}>
                                                            <span style={{ fontSize: 12, color: "#bbbbbb", fontWeight: 600 }}>Nazmul Haque</span>
                                                            {(s === 3 || s === 4) && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: "auto",
                                                                        background: C.blue,
                                                                        color: "#fff",
                                                                        fontSize: 11.5,
                                                                        padding: "2px 9px",
                                                                        borderRadius: 2,
                                                                    }}
                                                                >
                                                                    Install
                                                                </span>
                                                            )}
                                                            {s === 5 && (
                                                                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 11.5 }}>Installing</span>
                                                            )}
                                                            {s >= 6 && <span style={{ marginLeft: "auto", color: C.muted, fontSize: 13 }}>⚙</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {sideQdb && (
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                                            <PanelTitle>
                                                QUICKDB
                                                <span style={{ marginLeft: "auto", fontSize: 14, color: C.muted }}>···</span>
                                            </PanelTitle>
                                            <div
                                                style={{
                                                    height: 26,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 7,
                                                    padding: "0 12px",
                                                    fontSize: 11,
                                                    letterSpacing: ".06em",
                                                    color: C.textDim,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                <span style={{ fontSize: 9, color: C.muted }}>⌄</span>
                                                CONNECTIONS
                                                <span
                                                    ref={set("addConn")}
                                                    style={{ marginLeft: "auto", display: "flex", gap: 14, color: C.muted, fontSize: 13 }}
                                                >
                                                    ＋ ↻ ⌕
                                                </span>
                                            </div>

                                            <div style={{ flex: "none", minHeight: 0, overflow: "hidden", maxHeight: 340 }}>
                                                {s === 7 && (
                                                    <div
                                                        style={{
                                                            margin: "34px auto 0",
                                                            width: 236,
                                                            padding: "22px 18px",
                                                            borderRadius: 8,
                                                            background: C.panel,
                                                            border: "1px solid #333",
                                                            textAlign: "center",
                                                            position: "relative",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                left: 0,
                                                                right: 0,
                                                                top: 0,
                                                                height: 2,
                                                                background: "linear-gradient(90deg,#0078d4,#8a5cf6)",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                width: 56,
                                                                height: 26,
                                                                margin: "0 auto 12px",
                                                                borderRadius: 13,
                                                                background: "#0b3a5e",
                                                                display: "grid",
                                                                placeItems: "center",
                                                                color: C.blueLight,
                                                            }}
                                                        >
                                                            <DbGlyph size={16} stroke="currentColor" full />
                                                        </div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textStrong }}>No Connections</div>
                                                        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: C.muted, marginTop: 5 }}>
                                                            Explore SQLite, PostgreSQL, MySQL, Redis, or MongoDB databases.
                                                        </div>
                                                    </div>
                                                )}

                                                {s === 8 && (
                                                    <div className="qd-fade">
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                padding: "0 12px",
                                                                background: C.panel,
                                                                fontSize: 13,
                                                                color: C.text,
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 9, color: C.muted }}>›</span>
                                                            <DbGlyph />
                                                            Demo
                                                            <span style={{ marginLeft: "auto", display: "flex", gap: 12, color: C.muted, fontSize: 12 }}>
                                                                ▤ ✎ 🗑
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                margin: "6px 0 0 172px",
                                                                display: "inline-block",
                                                                background: "#252526",
                                                                border: "1px solid #454545",
                                                                padding: "3px 8px",
                                                                fontSize: 12,
                                                                color: C.textDim,
                                                                boxShadow: "0 3px 8px rgba(0,0,0,.5)",
                                                            }}
                                                        >
                                                            Create database
                                                        </div>
                                                    </div>
                                                )}

                                                {s >= 9 && (
                                                    <div style={{ fontSize: 13, color: C.textDim }}>
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                padding: "0 12px",
                                                                background: C.panel,
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 9, color: C.muted }}>⌄</span>
                                                            <DbGlyph />
                                                            Demo
                                                        </div>
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                padding: "0 12px 0 24px",
                                                                background: C.panel,
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 9, color: C.muted }}>⌄</span>
                                                            <DbGlyph />
                                                            classicmodels
                                                        </div>
                                                        <div
                                                            ref={set("findBox")}
                                                            style={{
                                                                margin: "3px 12px 3px 26px",
                                                                height: 26,
                                                                border: `1px solid ${C.line3}`,
                                                                background: C.raised,
                                                                borderRadius: 2,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 7,
                                                                padding: "0 8px",
                                                                fontSize: 12.5,
                                                            }}
                                                        >
                                                            <span style={{ color: C.faint }}>⌕</span>
                                                            <span ref={set("findText")} style={{ color: C.faint }}>
                                                                Find table in database
                                                            </span>
                                                            {s === 9 && <Caret />}
                                                        </div>
                                                        {visibleTables.map((t) => (
                                                            <div
                                                                className="qd-hover"
                                                                key={t[0]}
                                                                ref={t[0] === "customers" ? set("custRow") : undefined}
                                                                style={{
                                                                    height: 26,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 8,
                                                                    padding: "0 12px 0 40px",
                                                                }}
                                                            >
                                                                <span style={{ fontSize: 9, color: C.muted }}>›</span>
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5">
                                                                    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                                                                    <path d="M3.5 9.5h17M9 9.5v10M15 9.5v10" />
                                                                </svg>
                                                                {t[0]}
                                                                <span style={{ marginLeft: "auto", fontSize: 11.5, color: C.faint }}>{t[1]}</span>
                                                            </div>
                                                        ))}
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                padding: "0 12px 0 24px",
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 9, color: C.muted }}>›</span>
                                                            <DbGlyph />
                                                            demo
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* tools */}
                                            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", borderTop: `1px solid ${C.line}`, marginTop: 8 }}>
                                                <div
                                                    style={{
                                                        height: 26,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 7,
                                                        padding: "0 12px",
                                                        fontSize: 11,
                                                        letterSpacing: ".06em",
                                                        color: C.textDim,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <span style={{ fontSize: 9, color: C.muted }}>⌄</span>TOOLS
                                                </div>
                                                <div style={{ fontSize: 13, color: C.textDim }}>
                                                    <div style={{ height: 24, display: "flex", alignItems: "center", gap: 8, padding: "0 12px 0 22px" }}>
                                                        <span style={{ color: C.amber }}>▮▮</span>Dashboard
                                                    </div>
                                                    {TOOLS.map((g) => (
                                                        <div key={g.name}>
                                                            <div style={{ height: 24, display: "flex", alignItems: "center", gap: 7, padding: "0 12px 0 22px" }}>
                                                                <span style={{ fontSize: 9, color: C.muted }}>⌄</span>
                                                                <span style={{ color: g.tint }}>{g.icon}</span>
                                                                {g.name}
                                                                <span style={{ marginLeft: 6, fontSize: 11.5, color: C.faint }}>{g.count}</span>
                                                            </div>
                                                            {g.items.map((it) => (
                                                                <div
                                                                    key={it}
                                                                    style={{
                                                                        height: 24,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 8,
                                                                        padding: "0 12px 0 40px",
                                                                        color: C.textDim,
                                                                    }}
                                                                >
                                                                    <span style={{ color: C.muted, fontSize: 11 }}>▫</span>
                                                                    {it}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    flex: "none",
                                                    borderTop: `1px solid ${C.line}`,
                                                    fontSize: 11,
                                                    letterSpacing: ".06em",
                                                    color: C.textDim,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                <div style={{ height: 26, display: "flex", alignItems: "center", gap: 7, padding: "0 12px" }}>
                                                    <span style={{ fontSize: 9, color: C.muted }}>›</span>QUERY HISTORY
                                                </div>
                                                <div
                                                    style={{
                                                        height: 26,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 7,
                                                        padding: "0 12px",
                                                        borderTop: `1px solid ${C.line}`,
                                                    }}
                                                >
                                                    <span style={{ fontSize: 9, color: C.muted }}>›</span>SAVED QUERIES
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* editor area */}
                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: C.panel, position: "relative" }}>
                                {grid && (
                                    <div
                                        style={{
                                            height: 36,
                                            flex: "none",
                                            display: "flex",
                                            alignItems: "stretch",
                                            background: C.chrome,
                                            borderBottom: `1px solid ${C.line}`,
                                        }}
                                    >
                                        <Tab active={!pay} name="customers" />
                                        {pay && <Tab active name="payments" closeRef={set("closeTab")} />}
                                        <div
                                            style={{
                                                marginLeft: "auto",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 16,
                                                padding: "0 14px",
                                                color: C.muted,
                                                fontSize: 13,
                                            }}
                                        >
                                            <span style={{ color: C.amber }}>✳</span>
                                            <span>◫</span>
                                            <span>···</span>
                                        </div>
                                    </div>
                                )}

                                {mainWelcome && <WelcomePane />}
                                {mainExt && <ExtensionPane step={s} installBtnRef={set("installBtn")} />}

                                {grid && (
                                    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                                        <GridToolbar
                                            changes={changes}
                                            hasEditHistory={hasEditHistory}
                                            pasteActive={pastePanel}
                                            pasteBtnRef={set("pasteBtn")}
                                            saveBtnRef={set("saveBtn")}
                                            undoBtnRef={set("undoBtn")}
                                        />
                                        <FilterBar filterOn={pay} filterValRef={set("filterVal")} />

                                        <div
                                            ref={set("gridWrap")}
                                            style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}
                                        >
                                            {!pay && (
                                                <div>
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: CELL_COLS,
                                                            height: 34,
                                                            background: C.raised,
                                                            borderBottom: `1px solid ${C.line2}`,
                                                            fontSize: 12.5,
                                                            color: C.textDim,
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.line2}`, color: C.faint }}>
                                                            #
                                                        </div>
                                                        <div style={th}>
                                                            {typeTag("#0b3a5e", C.bluePale, "123")}
                                                            {key}customerNumber{colMenu}
                                                        </div>
                                                        {["customerName", "contactLastName", "contactFirstName"].map((h) => (
                                                            <div key={h} style={th}>
                                                                {typeTag("#2f3a2a", C.green, "Aa")}
                                                                {h}
                                                                {colMenu}
                                                            </div>
                                                        ))}
                                                        <div style={th}>
                                                            {typeTag("#2f3a2a", C.green, "Aa")}phone{colMenu}
                                                        </div>
                                                        {["addressLine1", "addressLine2"].map((h) => (
                                                            <div key={h} style={th}>
                                                                {typeTag("#2f3a2a", C.green, "Aa")}
                                                                {h}
                                                                {colMenu}
                                                            </div>
                                                        ))}
                                                        <div style={{ ...th, borderRight: "none" }}>
                                                            {typeTag("#2f3a2a", C.green, "Aa")}city
                                                        </div>
                                                    </div>
                                                    {rows.map((r, i) => (
                                                        <div
                                                            className="qd-row"
                                                            key={`${r.num}-${i}`}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: CELL_COLS,
                                                                height: 31,
                                                                borderBottom: `1px solid ${C.rowLine}`,
                                                                fontSize: 12.5,
                                                                color: C.cell,
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.rowLine}`, color: C.faint, fontSize: 12 }}>
                                                                {r.i}
                                                            </div>
                                                            <div style={{ ...td, fontWeight: 600, color: r.isNewId ? "#7ee787" : C.textStrong }}>{r.num}</div>
                                                            <div style={td}>{r.name}</div>
                                                            <div
                                                                ref={r.lastRef ? set(r.lastRef as RefKey) : undefined}
                                                                style={{
                                                                    ...td,
                                                                    background: r.lastFocused ? C.raised : r.lastBg,
                                                                    color: r.lastFg,
                                                                    // inset shadow, not border: a real border would grow
                                                                    // the box and shove every cell after it sideways for
                                                                    // as long as phase 1 runs.
                                                                    boxShadow: r.lastFocused ? `inset 0 0 0 1.5px ${C.blueLight}` : "none",
                                                                }}
                                                            >
                                                                {r.last}
                                                                {r.lastFocused && <Caret />}
                                                            </div>
                                                            <div style={td}>{r.first}</div>
                                                            <div style={{ ...td, background: r.phoneBg, color: r.phoneFg }}>{r.phone}</div>
                                                            <div style={td}>{r.a1}</div>
                                                            <div style={td}>{r.a2}</div>
                                                            <div style={{ ...td, borderRight: "none" }}>{r.city}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {pay && <PaymentsGrid />}

                                            {(s === 11 || s === 12) && (
                                                <div
                                                    ref={set("rangeBox")}
                                                    style={{
                                                        position: "absolute",
                                                        left: 866,
                                                        top: 34,
                                                        width: 190,
                                                        height: 31,
                                                        border: `2px solid ${C.blue}`,
                                                        background: "rgba(0,120,212,.07)",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 29, background: "rgba(0,120,212,.16)" }} />
                                                    <div style={{ position: "absolute", right: 6, bottom: 7, fontSize: 12, color: C.muted }}>⧉</div>
                                                    <Handle style={{ left: -4, top: -4 }} />
                                                    <Handle style={{ right: -4, top: -4 }} />
                                                    <Handle style={{ left: -4, bottom: -4 }} />
                                                    <Handle style={{ right: -4, bottom: -4, width: 8, height: 8, borderColor: "#fff" }} />
                                                </div>
                                            )}
                                            {s === 11 && (
                                                <div
                                                    ref={set("rangeTip")}
                                                    style={{
                                                        position: "absolute",
                                                        left: 1066,
                                                        top: 40,
                                                        padding: "6px 10px",
                                                        background: "#252526",
                                                        border: "1px solid #454545",
                                                        fontSize: 12,
                                                        color: C.textStrong,
                                                        boxShadow: "0 4px 12px rgba(0,0,0,.55)",
                                                        pointerEvents: "none",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {selN} cells · ⌘C copies as TSV
                                                </div>
                                            )}
                                            {s === 12 && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        left: 1066,
                                                        top: 150,
                                                        padding: "6px 10px",
                                                        background: "#252526",
                                                        border: "1px solid #454545",
                                                        font: `500 12px ${MONO}`,
                                                        color: C.amberPale,
                                                        boxShadow: "0 4px 12px rgba(0,0,0,.55)",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    40.32.2555 → 4 cells
                                                </div>
                                            )}

                                            {s === 13 && <ForeignKeyPopover chipRef={set("fkChip")} rowRef={set("fkRow")} open={pastClick} />}
                                            {pastePanel && <PastePanel filled={s > 17 || (s === 17 && pastClick)} hoverImport={s === 18 && pastHover} pasteAreaRef={set("pasteArea")} importBtnRef={set("importBtn")} />}
                                        </div>

                                        <Pagination
                                            showing={
                                                pay ? "Showing 1-4 of 4" : tail ? "Showing 113-129 of 129" : "Showing 1-27 of 122"
                                            }
                                        />
                                    </div>
                                )}

                                {/* toast */}
                                <div
                                    ref={set("toast")}
                                    style={{
                                        position: "absolute",
                                        right: 20,
                                        bottom: 20,
                                        minWidth: 420,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 11,
                                        padding: "12px 14px",
                                        background: "#252526",
                                        border: "1px solid #454545",
                                        boxShadow: "0 12px 34px rgba(0,0,0,.6)",
                                        fontSize: 13,
                                        color: C.text,
                                        opacity: 0,
                                        transform: "translateY(10px)",
                                        transition: "opacity .3s ease, transform .3s cubic-bezier(.22,1,.36,1)",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <span style={{ color: C.blueLight }}>ⓘ</span>
                                    <span ref={set("toastText")}>Connection &quot;Demo&quot; added.</span>
                                    <span style={{ marginLeft: "auto", display: "flex", gap: 12, color: C.muted }}>⚙ ⌃ ✕</span>
                                </div>
                            </div>
                        </div>

                        {/* status bar */}
                        <div
                            style={{
                                height: 24,
                                flex: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: "0 10px",
                                background: C.chrome,
                                borderTop: `1px solid ${C.line}`,
                                fontSize: 12,
                                color: C.textDim,
                            }}
                        >
                            <span>✕</span>
                            <span>⇄ Launchpad</span>
                            <span>⊗ 0 ⚠ 0</span>
                            {s >= 8 && <span style={{ color: "#8ef0a8" }}>● QuickDB · Demo</span>}
                            <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                                <span>⚗</span>
                                <span>((·)) Go Live</span>
                                <span>🔔</span>
                            </span>
                        </div>

                        {/* Arrow pointer. The path's tip sits at the SVG origin, so
                            left/top can be the aim point directly and the scale
                            pulse pivots on the tip — no centring offset, unlike the
                            dot this replaces. overflow:visible lets the outline
                            bleed past the viewBox at the tip.

                            Position (left/top) is written every frame by the JS
                            glide loop, which already eases — a CSS transition on
                            those would fight it with a second, competing lag. The
                            click-pulse (transform: scale) is the opposite: it's a
                            two-state flip written directly with no easing of its
                            own, which read as a snap. Transitioning transform only
                            smooths that dip without touching the glide. */}
                        <div
                            aria-hidden
                            ref={set("cur")}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                opacity: 0,
                                pointerEvents: "none",
                                transformOrigin: "0 0",
                                transition: "transform 0.16s ease-out",
                                filter: "drop-shadow(0 3px 7px rgba(0,0,0,.7))",
                            }}
                        >
                            {/* Default Arrow Pointer */}
                            <svg
                                ref={set("curArrow")}
                                height={CURSOR_H}
                                style={{ display: "block", overflow: "visible" }}
                                viewBox="0 0 13 19"
                                width={CURSOR_W}
                            >
                                <path
                                    d="M0 0 L0 17 L4.4 12.9 L7.1 18.9 L9.9 17.6 L7.3 11.8 L12.8 11.6 Z"
                                    fill="#fff"
                                    stroke="rgba(0,0,0,.62)"
                                    strokeLinejoin="round"
                                    strokeWidth="1.1"
                                />
                            </svg>
                            {/* Interactive Hand Pointer */}
                            <svg
                                ref={set("curPointer")}
                                height={26}
                                style={{ display: "none", overflow: "visible", transform: "translate(-8px, -2px)", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.4))" }}
                                viewBox="0 0 24 28"
                                width={22}
                            >
                                <path
                                    d="M 8 2.5 C 8 0.8, 13 0.8, 13 2.5 L 13 8.5 C 13 7.2, 16.8 7.2, 16.8 8.8 L 16.8 10 C 16.8 8.8, 20.2 8.8, 20.2 10.5 L 20.2 11.5 C 20.2 10.5, 23 10.5, 23 12.5 C 23 18.5, 18.5 24.5, 12.5 24.5 C 8 24.5, 4.2 21.5, 3.2 17.5 L 1.2 14.2 C 0.1 12.5, 2.1 10.5, 3.8 11.8 C 5.5 13.2, 6.8 14.2, 8 14.2 L 8 2.5 Z"
                                    fill="#ffffff"
                                    stroke="#000000"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                />
                                <path d="M 13 8.5 L 13 13" stroke="#000000" strokeLinecap="round" strokeWidth="1.4" />
                                <path d="M 16.8 10 L 16.8 14" stroke="#000000" strokeLinecap="round" strokeWidth="1.4" />
                                <path d="M 20.2 11.5 L 20.2 14.5" stroke="#000000" strokeLinecap="round" strokeWidth="1.4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* hero overlay */}
                <div
                    ref={set("hero")}
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5vh 24px",
                        pointerEvents: "none",
                        textAlign: "center",
                    }}
                >
                    <div style={{ maxWidth: 960 }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 9,
                                padding: "6px 13px",
                                borderRadius: 99,
                                border: "1px solid #2a2a36",
                                background: "rgba(20,20,26,.7)",
                                font: `400 11.5px ${MONO}`,
                                color: "#8fc9ff",
                                letterSpacing: ".04em",
                            }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue }} />
                            QuickDB 1.2.6 — editor extension &amp; desktop app
                        </div>
                        <h1
                            style={{
                                margin: "18px 0 0",
                                fontSize: "clamp(30px,4.1vw,58px)",
                                lineHeight: 1.04,
                                letterSpacing: "-.035em",
                                fontWeight: 600,
                                textWrap: "pretty",
                            }}
                        >
                            Your whole database,
                            <br />
                            inside your editor.
                        </h1>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: "clamp(13px,1.2vw,16px)", color: C.muted, maxWidth: 540, textWrap: "pretty" }}>
                            Browse and query 30+ engines without leaving the window you already have open.
                        </div>
                        <div className="qd-bob" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                            <div style={{ font: `400 10.5px ${MONO}`, letterSpacing: ".14em", color: C.dark }}>SCROLL</div>
                            <div style={{ width: 1, height: 26, background: "linear-gradient(180deg,#6f6f6f,transparent)" }} />
                        </div>
                    </div>
                </div>

                {/* ── Right-side Curved Clock Scale Timeline (Ultra-Clean & High-Contrast Visibility) ── */}
                {s >= 1 && (
                    <>
                        {/* Soft vignette gradient strip for crystal-clear contrast against laptop content */}
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: 340,
                                background: "linear-gradient(270deg, rgba(8, 10, 15, 0.82) 0%, rgba(8, 10, 15, 0.4) 60%, rgba(8, 10, 15, 0) 100%)",
                                pointerEvents: "none",
                                zIndex: 44,
                            }}
                        />
                        <div
                            aria-label="Step Clock Dial Timeline"
                            style={{
                                position: "absolute",
                                right: 20,
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: 760,
                                width: 380,
                                zIndex: 46,
                                pointerEvents: "none",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                userSelect: "none",
                            }}
                        >

                            {STEPS.map(([stepStr], stepIdx) => {
                                const stepNum = stepIdx + 1;
                                const isCurrent = s === stepNum;
                                const isMajor = stepNum === 1 || stepNum % 3 === 1 || stepNum === 20;

                                const norm = stepIdx / (STEPS.length - 1); // 0 to 1
                                const arcX = Math.sin(norm * Math.PI) * -150; // Symmetrical full circle arc curve depth
                                const rotAngle = (0.5 - norm) * 38; // Dynamic tangent rotation sweep

                                const tickWidth = isCurrent ? 40 : isMajor ? 22 : 14;
                                const tickColor = isCurrent
                                    ? "#4daafc"
                                    : isMajor
                                      ? "#ffffff"
                                      : "rgba(255, 255, 255, 0.65)";

                                return (
                                    <div key={stepNum} style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 2, pointerEvents: "none" }}>
                                        {/* Main Step Item */}
                                        <div
                                            style={{
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-end",
                                                height: 20,
                                                pointerEvents: "none",
                                                transform: `translateX(${arcX.toFixed(1)}px) rotate(${rotAngle.toFixed(1)}deg)`,
                                                transformOrigin: "right center",
                                                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                                            }}
                                        >
                                            {/* Active Step Floating Title & Description (Pixel-Perfect Dark Glass Badge) */}
                                            {isCurrent && (
                                                <div
                                                    style={{
                                                        marginRight: 18,
                                                        textAlign: "right",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "flex-end",
                                                        pointerEvents: "none",
                                                        transform: `rotate(${-rotAngle.toFixed(1)}deg)`,
                                                        transformOrigin: "right center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            background: "rgba(8, 12, 20, 0.94)",
                                                            border: "1px solid rgba(0, 120, 212, 0.5)",
                                                            padding: "8px 13px",
                                                            borderRadius: 8,
                                                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                                                            backdropFilter: "blur(16px)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "flex-end",
                                                            gap: 5,
                                                            maxWidth: 275,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 7,
                                                                fontSize: 12.5,
                                                                fontWeight: 600,
                                                                textAlign: "right",
                                                            }}
                                                        >
                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4daafc", boxShadow: "0 0 8px #4daafc", flexShrink: 0 }} />
                                                            <span
                                                                style={{
                                                                    font: `600 10.5px ${MONO}`,
                                                                    background: "rgba(0, 120, 212, 0.3)",
                                                                    border: "1px solid rgba(77, 170, 252, 0.4)",
                                                                    color: "#8fc9ff",
                                                                    padding: "1px 5px",
                                                                    borderRadius: 4,
                                                                    lineHeight: 1.2,
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {String(stepNum).padStart(2, "0")}
                                                            </span>
                                                            <span style={{ color: "#ffffff", letterSpacing: ".02em", textShadow: "0 0 10px rgba(0, 120, 212, 0.6)" }}>
                                                                {STEP_DETAILS[stepNum]?.title ?? ""}
                                                            </span>
                                                        </div>
                                                        {STEP_DETAILS[stepNum]?.description && (
                                                            <div
                                                                style={{
                                                                    fontSize: 11.5,
                                                                    color: "rgba(226, 241, 255, 0.85)",
                                                                    lineHeight: 1.45,
                                                                    textAlign: "right",
                                                                }}
                                                            >
                                                                {STEP_DETAILS[stepNum].description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Major Step Number Label (Solid Luminous White) */}
                                            {!isCurrent && isMajor && (
                                                <span
                                                    style={{
                                                        marginRight: 10,
                                                        fontSize: 10,
                                                        font: `600 10px ${MONO}`,
                                                        color: "#ffffff",
                                                        textShadow: "0 1px 8px #000000, 0 0 4px #000000, 0 0 2px #000000",
                                                        whiteSpace: "nowrap",
                                                        transform: `rotate(${-rotAngle.toFixed(1)}deg)`,
                                                        transition: "all 0.2s ease",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {String(stepNum).padStart(2, "0")}
                                                </span>
                                            )}

                                            {/* Tick Line (Compact High-Visibility Scale Bar) */}
                                            <div
                                                onClick={() => jumpToStep(stepNum)}
                                                title={`Step ${stepNum}: ${STEP_DETAILS[stepNum]?.title ?? ""}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    padding: "5px 0",
                                                    cursor: "pointer",
                                                    pointerEvents: "auto",
                                                }}
                                            >
                                                <div
                                                    className="qd-tick-bar"
                                                    style={{
                                                        width: tickWidth,
                                                        height: isCurrent ? 3.5 : isMajor ? 2 : 1.4,
                                                        borderRadius: 0,
                                                        background: isCurrent ? "linear-gradient(90deg, #0078d4, #4daafc)" : tickColor,
                                                        boxShadow: isCurrent ? "0 0 16px #0078d4, 0 0 6px #4daafc" : "0 0 4px rgba(255, 255, 255, 0.4), 0 1px 5px rgba(0, 0, 0, 0.95)",
                                                        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* quick feature navigator */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 84,
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 99,
                        background: "rgba(14, 14, 20, 0.94)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        boxShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.85)",
                        zIndex: 40,
                        pointerEvents: "auto",
                        maxWidth: "94vw",
                        overflowX: "auto",
                        backdropFilter: "blur(14px)",
                    }}
                >
                    {NAV_ITEMS.map((nav) => {
                        if (nav.live) {
                            return (
                                <button
                                    key={nav.label}
                                    onClick={() => jumpToStep(1)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "4.5px 12px",
                                        borderRadius: 99,
                                        border: "1px solid rgba(0, 120, 212, 0.6)",
                                        background: "linear-gradient(135deg, #0078d4, #005a9e)",
                                        color: "#ffffff",
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        boxShadow: "0 2px 10px rgba(0, 120, 212, 0.45)",
                                    }}
                                >
                                    <span style={{ fontSize: 11 }}>{nav.icon}</span>
                                    {nav.label}
                                </button>
                            );
                        }

                        return (
                            <button
                                key={nav.label}
                                onClick={() => triggerToast(`${nav.label} — Coming Soon! Data View (Steps 1–20) is active.`)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "4.5px 11px",
                                    borderRadius: 99,
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    color: "#999999",
                                    fontSize: 11.5,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.18s ease",
                                }}
                            >
                                <span style={{ fontSize: 11, opacity: 0.6 }}>{nav.icon}</span>
                                {nav.label}
                                <span
                                    style={{
                                        fontSize: 8.5,
                                        font: `600 8.5px ${MONO}`,
                                        background: "rgba(255, 255, 255, 0.12)",
                                        color: C.amberPale,
                                        padding: "1px 5px",
                                        borderRadius: 3,
                                        letterSpacing: ".04em",
                                    }}
                                >
                                    SOON
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────────────
   Small presentational pieces
   ──────────────────────────────────────────────────────────────── */

const ActIcon: FC<{ children: ReactNode }> = ({ children }) => (
    <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", color: C.faint }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            {children}
        </svg>
    </div>
);

const DbGlyph: FC<{ size?: number; stroke?: string; full?: boolean }> = ({
    size = 13,
    stroke = C.muted,
    full = false,
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6">
        <ellipse cx="12" cy="6" rx="7" ry="2.6" />
        <path d="M5 6v12c0 1.4 3.13 2.6 7 2.6s7-1.2 7-2.6V6" />
        {full && <path d="M5 12c0 1.4 3.13 2.6 7 2.6s7-1.2 7-2.6" />}
    </svg>
);

const Caret: FC = () => <span style={{ width: 1.5, height: 13, background: C.blueLight, marginLeft: 1 }} />;

const Handle: FC<{ style?: CSSProperties }> = ({ style }) => (
    <div
        style={{
            position: "absolute",
            width: 7,
            height: 7,
            background: C.blue,
            border: `1px solid ${C.textStrong}`,
            ...style,
        }}
    />
);

const PanelTitle: FC<{ children: ReactNode }> = ({ children }) => (
    <div
        style={{
            height: 34,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontSize: 11,
            letterSpacing: ".08em",
            color: "#bbbbbb",
            fontWeight: 600,
        }}
    >
        {children}
    </div>
);

const TreeRow: FC<{ label: string; badge: string }> = ({ label, badge }) => (
    <div style={{ height: 23, display: "flex", alignItems: "center", gap: 8, padding: "0 10px" }}>
        <span style={{ fontSize: 9, color: C.muted }}>›</span>
        {label}
        <span
            style={{
                marginLeft: "auto",
                background: C.blue,
                color: "#fff",
                borderRadius: 9,
                padding: "1px 7px",
                fontSize: 10.5,
                letterSpacing: 0,
            }}
        >
            {badge}
        </span>
    </div>
);

const Tab: FC<{ active: boolean; name: string; closeRef?: (el: HTMLElement | null) => void }> = ({
    active,
    name,
    closeRef,
}) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 14px",
            fontSize: 13,
            color: active ? C.textStrong : C.muted,
            background: active ? C.panel : C.chrome,
            borderRight: `1px solid ${C.line}`,
            borderTop: `1px solid ${active ? C.blue : "transparent"}`,
        }}
    >
        <span style={{ color: C.muted, fontSize: 12 }}>▤</span>
        {name}
        <span ref={closeRef} style={{ color: C.muted, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3 }}>
            ✕
        </span>
    </div>
);

const WelcomePane: FC = () => (
    <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
            style={{
                position: "relative",
                width: 300,
                height: 300,
                borderRadius: 44,
                border: "18px solid #232323",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                alt="QuickDB"
                src="/images/quickdb-logo.png"
                style={{ width: 120, height: 120, borderRadius: 22, objectFit: "cover" }}
            />
        </div>
    </div>
);

const ExtensionPane: FC<{ step: number; installBtnRef: (el: HTMLElement | null) => void }> = ({
    step,
    installBtnRef,
}) => (
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0, padding: "26px 40px 0 34px" }}>
            <div style={{ display: "flex", gap: 26 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt="QuickDB"
                    src="/images/quickdb-logo.png"
                    style={{ width: 128, height: 128, flex: "none", borderRadius: 14, objectFit: "cover" }}
                />
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-.02em", color: C.textStrong }}>QuickDB</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, fontSize: 13.5, color: "#bbbbbb" }}>
                        <span>Nazmul Haque</span>
                        <span style={{ color: C.muted }}>⇩ 465</span>
                        <span style={{ color: C.dark, letterSpacing: 2 }}>☆☆☆☆☆</span>
                    </div>
                    <div style={{ fontSize: 14, color: C.textDim, marginTop: 12 }}>
                        Lightweight database browser for VS Code. Connect to databases, browse tables, and run queries.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
                        {(step === 3 || step === 4) && (
                            <div
                                ref={installBtnRef}
                                style={{ background: C.blue, color: "#fff", fontSize: 13, padding: "5px 14px", borderRadius: 2 }}
                            >
                                Install
                            </div>
                        )}
                        {step === 5 && (
                            <div style={{ background: "#2a2a2a", color: C.muted, fontSize: 13, padding: "5px 14px", borderRadius: 2 }}>
                                Installing
                            </div>
                        )}
                        {step >= 6 && (
                            <div style={{ display: "flex", gap: 10 }}>
                                <div style={{ background: "#2a2a2a", color: C.text, fontSize: 13, padding: "5px 14px", borderRadius: 2 }}>Disable</div>
                                <div style={{ background: "#2a2a2a", color: C.text, fontSize: 13, padding: "5px 14px", borderRadius: 2 }}>
                                    Uninstall ⌄
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textDim }}>
                            <span
                                style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: 2,
                                    background: C.blue,
                                    color: "#fff",
                                    display: "grid",
                                    placeItems: "center",
                                    fontSize: 11,
                                }}
                            >
                                ✓
                            </span>
                            Auto Update
                        </div>
                        <span style={{ color: C.muted, fontSize: 14 }}>⚙</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 22,
                            marginTop: 22,
                            fontSize: 13,
                            color: C.muted,
                            borderBottom: `1px solid ${C.line}`,
                            paddingBottom: 8,
                        }}
                    >
                        <span style={{ color: C.textStrong, borderBottom: `2px solid ${C.textStrong}`, paddingBottom: 8, marginBottom: -9 }}>
                            DETAILS
                        </span>
                        <span>FEATURES</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 26, padding: "0 60px", textAlign: "center" }}>
                {/* The design shipped a separate wordmark PNG here; the mark plus
                    the product name in the page's own display face reads the same
                    at this size without carrying a second near-duplicate asset. */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src="/images/quickdb-logo.png" style={{ width: 30, height: 30, borderRadius: 6 }} />
                    <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.03em", color: C.textStrong }}>QuickDB</span>
                </div>
                <div style={{ height: 1, background: C.line, margin: "22px 0" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: C.textStrong }}>
                    The Ultimate Database Management &amp; AI Integration Platform
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: C.textDim, marginTop: 14, textWrap: "pretty" }}>
                    An IDE-grade universal database client available as a <strong>VS Code extension</strong> and a{" "}
                    <strong>standalone desktop app</strong> (Windows · macOS · Linux). Browse schemas, execute complex
                    queries, design interactive dashboards, and supercharge your developer workflow with a built-in MCP
                    server for AI tools.
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 14, fontSize: 13.5, color: C.blueLight }}>
                    {["Quick Start", "Features", "Databases", "MCP / AI", "Desktop"].map((t, i) => (
                        <span key={t}>
                            {i > 0 && <span style={{ color: "#5a5a5a", marginRight: 14 }}>·</span>}
                            {t}
                        </span>
                    ))}
                </div>
                <div style={{ marginTop: 20, padding: "26px 0 30px", borderTop: `1px solid ${C.line}`, textAlign: "left" }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: C.textStrong }}>Quick start</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 14 }}>
                        {(
                            [
                                ["01", "Open the QuickDB panel", "The database icon in the activity bar, or ⇧⌘D."],
                                ["02", "Add a connection", "Pick an engine, paste a URL, or point at a file."],
                                ["03", "Browse and query", "Click a table for rows, ⌘↵ to run a query."],
                            ] as const
                        ).map(([n, title, body]) => (
                            <div key={n} style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "14px 16px" }}>
                                <div style={{ font: `400 11.5px ${MONO}`, color: C.blueLight }}>{n}</div>
                                <div style={{ fontSize: 13, color: C.textStrong, marginTop: 7, fontWeight: 600 }}>{title}</div>
                                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: C.muted, marginTop: 5 }}>{body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div style={{ width: 360, flex: "none", padding: "26px 30px 0 0" }}>
            <div style={{ fontSize: 17, color: C.textStrong, fontWeight: 600 }}>Marketplace</div>
            <div style={{ marginTop: 12, font: `400 12.5px ${MONO}`, color: C.textDim }}>
                {(
                    [
                        ["Identifier", "quickdb.quickdb", true],
                        ["Version", "1.2.6", false],
                        ["Published", "6 months ago", true],
                        ["Last Released", "11 hours ago", false],
                    ] as const
                ).map(([k, v, shade]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: shade ? "#232323" : undefined }}>
                        <span style={{ color: C.muted, fontFamily: UI }}>{k}</span>
                        <span>{v}</span>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: 17, color: C.textStrong, fontWeight: 600, marginTop: 26 }}>Categories</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {CATEGORIES.map((c) => (
                    <span key={c} style={{ fontSize: 12, color: C.textDim, border: `1px solid ${C.line3}`, borderRadius: 3, padding: "3px 8px" }}>
                        {c}
                    </span>
                ))}
            </div>
            <div style={{ fontSize: 17, color: C.textStrong, fontWeight: 600, marginTop: 26 }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12, fontSize: 13, color: C.blueLight }}>
                {["Repository", "Issues", "License", "Nazmul Haque", "Marketplace"].map((r) => (
                    <span key={r}>{r}</span>
                ))}
            </div>
        </div>
    </div>
);

/** Box-with-arrow mark on the CSV / JSON export actions. */
const ExportGlyph: FC = () => (
    <svg
        fill="none"
        height="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
        width="12"
    >
        <path d="M14 4h6v6M20 4l-8 8" />
        <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5" />
    </svg>
);

const GridToolbar: FC<{
    changes: number;
    hasEditHistory: boolean;
    pasteActive: boolean;
    pasteBtnRef: (el: HTMLElement | null) => void;
    saveBtnRef: (el: HTMLElement | null) => void;
    undoBtnRef: (el: HTMLElement | null) => void;
}> = ({ changes, hasEditHistory, pasteActive, pasteBtnRef, saveBtnRef, undoBtnRef }) => (
    // One row, not two stacked pairs: the history buttons sit side by side and
    // Refresh / Edit Table run inline, matching the product's own toolbar.
    //
    // nowrap + flex-shrink:0 on every group matters here. Inline, the row's
    // natural width lands within a few px of the editor pane, and flex's
    // default shrinking broke each label onto two lines ("↻" over "Refresh").
    // The hint is the one flexible item, so any shortfall truncates there.
    <div
        style={{
            height: 46,
            flex: "none",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            borderBottom: `1px solid ${C.line}`,
            background: C.panel,
            whiteSpace: "nowrap",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 20, flexShrink: 0 }}>
            {/* Undo lights up once there's something to undo — either a
                pending change right now, or (from the edit/save/undo/save
                beat in step 10 on) any edit ever made, matching how real
                undo history outlives a save. Redo stays dim throughout the
                story since nothing here is ever redone. */}
            {["↺", "↻"].map((g, i) => {
                const active = i === 0 && (changes > 0 || hasEditHistory);
                return (
                    <span
                        key={g}
                        ref={i === 0 ? undoBtnRef : undefined}
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: `1.4px solid ${active ? C.blueLight : C.line3}`,
                            display: "grid",
                            placeItems: "center",
                            fontSize: 11,
                            color: active ? C.blueLight : C.dark,
                        }}
                    >
                        {g}
                    </span>
                );
            })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, color: C.textDim, flexShrink: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>↻ Refresh</span>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>✎ Edit Table</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 22, fontSize: 13, color: C.textDim, flexShrink: 0 }}>
            <span>＋ Add</span>
            <span
                ref={pasteBtnRef}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3.5px 10px",
                    borderRadius: 4,
                    background: pasteActive ? "#0078d4" : "transparent",
                    color: pasteActive ? "#ffffff" : C.textDim,
                    border: pasteActive ? "1px solid #2b88d8" : "1px solid transparent",
                    boxShadow: pasteActive ? "0 2px 10px rgba(0, 120, 212, 0.45)" : "none",
                    fontWeight: pasteActive ? 600 : 400,
                    transition: "all 0.18s ease",
                }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
                Paste
            </span>
            <span style={{ color: C.dark }}>⧉ Clone</span>
            <span style={{ color: C.dark }}>🗑 Delete</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 22, fontSize: 13, flexShrink: 0 }}>
            {changes > 0 ? (
                <>
                    <span
                        ref={saveBtnRef}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#e9e9e9",
                            color: "#1b1b1b",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 3,
                        }}
                    >
                        Save
                        <span style={{ background: "#1b1b1b", color: "#fff", borderRadius: 9, padding: "0 6px", fontSize: 11 }}>{changes}</span>
                    </span>
                    <span style={{ color: C.text, padding: "4px 10px" }}>Discard</span>
                </>
            ) : (
                // Disabled, but still shaped like the buttons they become once
                // there are edits to commit.
                ["Save", "Discard"].map((t, idx) => (
                    <span
                        key={t}
                        ref={idx === 0 ? saveBtnRef : undefined}
                        style={{ padding: "4px 10px", borderRadius: 3, background: "#252525", color: C.dark }}
                    >
                        {t}
                    </span>
                ))
            )}
        </div>
        <div style={{ display: "flex", marginLeft: 22, border: `1px solid ${C.line3}`, borderRadius: 4, overflow: "hidden", fontSize: 13, flexShrink: 0 }}>
            <span style={{ padding: "4px 12px", background: "#3f3f3f", color: "#fff" }}>Table</span>
            {["Transpose", "Text", "Tree"].map((t) => (
                <span key={t} style={{ padding: "4px 12px", color: C.textDim }}>
                    {t}
                </span>
            ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: 22, fontSize: 13, color: C.textDim, flexShrink: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ExportGlyph />
                CSV
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ExportGlyph />
                JSON
            </span>
        </div>
        <div
            style={{
                marginLeft: 18,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 11,
                color: C.faint,
            }}
        >
            Click Edit | Drag Select | Ctrl+S Save | Ctrl+N Add | Ctrl+G Go To Row
        </div>
    </div>
);

const Funnel: FC<{ size?: number }> = ({ size = 13 }) => (
    <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width={size}
    >
        <path d="M21.5 3.5h-19l7.6 9v6.2l3.8 1.8v-8z" />
    </svg>
);

const FilterBar: FC<{ filterOn: boolean; filterValRef: (el: HTMLElement | null) => void }> = ({
    filterOn,
    filterValRef,
}) => {
    // One amber ring around the whole clause with grey dividers inside it,
    // rather than a border per segment — the row reads as a single active
    // filter that way, which is what the ring is signalling.
    const divider: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 9px",
        borderRight: `1px solid ${C.line3}`,
        whiteSpace: "nowrap",
    };
    return (
        <div
            style={{
                height: 42,
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "0 14px",
                borderBottom: `1px solid ${C.line}`,
                background: C.panel,
            }}
        >
            {filterOn && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "stretch",
                        height: 28,
                        border: `1px solid ${C.amberLine}`,
                        borderRadius: 4,
                        overflow: "hidden",
                        background: C.raised,
                        fontSize: 12.5,
                        color: C.text,
                    }}
                >
                    <span
                        style={{
                            width: 30,
                            display: "grid",
                            placeItems: "center",
                            borderRight: `1px solid ${C.line3}`,
                        }}
                    >
                        <span
                            style={{
                                width: 13,
                                height: 13,
                                display: "grid",
                                placeItems: "center",
                                border: `1.5px solid ${C.amberLine}`,
                                borderRadius: 2,
                                fontSize: 9,
                                lineHeight: 1,
                                color: C.textStrong,
                            }}
                        >
                            ✓
                        </span>
                    </span>
                    <span style={divider}>
                        customerNumber…<span style={{ color: C.faint }}>⌄</span>
                    </span>
                    {/* "=" not the reference shot's "contains": step 15's caption
                        reads "payments where customerNumber = 121", and the grid
                        below is an equality match on 121. */}
                    <span style={divider}>
                        =<span style={{ color: C.faint }}>⌄</span>
                    </span>
                    <span
                        ref={filterValRef}
                        style={{
                            width: 150,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 9px",
                        }}
                    >
                        121
                    </span>
                    <span
                        style={{
                            width: 28,
                            display: "grid",
                            placeItems: "center",
                            color: C.faint,
                            fontSize: 12,
                        }}
                    >
                        ✕
                    </span>
                </div>
            )}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12.5,
                    color: C.textDim,
                }}
            >
                <Funnel />
                Add filter
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", fontSize: 12.5 }}>
                <span
                    style={{
                        display: "flex",
                        alignItems: "stretch",
                        height: 28,
                        border: `1px solid ${C.line3}`,
                        borderRadius: 4,
                        overflow: "hidden",
                        background: C.raised,
                    }}
                >
                    <span style={{ width: 150, display: "flex", alignItems: "center", padding: "0 9px", color: C.faint }}>
                        Go to row
                    </span>
                    <span
                        style={{
                            width: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderLeft: `1px solid ${C.line3}`,
                            color: C.faint,
                        }}
                    >
                        #
                    </span>
                    <span
                        style={{
                            padding: "0 12px",
                            display: "flex",
                            alignItems: "center",
                            borderLeft: `1px solid ${C.line3}`,
                            background: "#2a2a2a",
                            color: C.text,
                        }}
                    >
                        GO
                    </span>
                </span>
                <span
                    style={{
                        height: 28,
                        width: 260,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "0 9px",
                        marginLeft: 16,
                        border: `1px solid ${C.line3}`,
                        borderRadius: 4,
                        background: C.raised,
                        color: C.faint,
                    }}
                >
                    ⌕ Search all columns…
                </span>
            </div>
        </div>
    );
};

const PaymentsGrid: FC = () => {
    const th: CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "0 9px", borderRight: `1px solid ${C.line2}` };
    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: PAY_COLS,
                    height: 34,
                    background: C.raised,
                    borderBottom: `1px solid ${C.line2}`,
                    fontSize: 12.5,
                    color: C.textDim,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.line2}`, color: C.faint }}>#</div>
                <div style={th}>
                    <span style={{ fontSize: 9.5, background: "#0b3a5e", color: C.bluePale, borderRadius: 2, padding: "1.5px 3px" }}>123</span>
                    <span style={{ color: C.amber }}>🔑</span>customerNumber
                    <span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>
                </div>
                <div style={th}>
                    <span style={{ fontSize: 9.5, background: "#2f3a2a", color: C.green, borderRadius: 2, padding: "1.5px 3px" }}>Aa</span>
                    <span style={{ color: C.amber }}>🔑</span>checkNumber
                    <span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>
                </div>
                <div style={th}>
                    <span style={{ fontSize: 9.5, background: "#3a2f45", color: "#c9a8e8", borderRadius: 2, padding: "1.5px 3px" }}>17</span>
                    paymentDate<span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>
                </div>
                <div style={{ ...th, borderRight: "none" }}>
                    <span style={{ fontSize: 9.5, background: "#0b3a5e", color: C.bluePale, borderRadius: 2, padding: "1.5px 3px" }}>123</span>
                    amount<span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>
                </div>
            </div>
            {PAY_ROWS.map((p) => (
                <div
                    className="qd-row"
                    key={p.chk}
                    style={{ display: "grid", gridTemplateColumns: PAY_COLS, height: 31, borderBottom: `1px solid ${C.rowLine}`, fontSize: 12.5, color: C.cell }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.rowLine}`, color: C.faint, fontSize: 12 }}>{p.i}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 9px", borderRight: `1px solid ${C.rowLine}` }}>
                        <span style={{ fontSize: 9.5, background: "#3a3320", color: C.amber, borderRadius: 2, padding: "1.5px 3px" }}>FK</span>
                        <span style={{ fontWeight: 600, color: C.textStrong }}>121</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: `1px solid ${C.rowLine}` }}>{p.chk}</div>
                    <div style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: `1px solid ${C.rowLine}` }}>{p.date}</div>
                    <div style={{ display: "flex", alignItems: "center", padding: "0 9px" }}>{p.amt}</div>
                </div>
            ))}
            {EMPTY_ROWS.map((n) => (
                <div
                    key={n}
                    style={{ display: "grid", gridTemplateColumns: PAY_COLS, height: 31, borderBottom: `1px solid ${C.rowLine}`, fontSize: 12, color: C.faint }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${C.rowLine}` }}>{n}</div>
                    <div style={{ borderRight: `1px solid ${C.rowLine}` }} />
                    <div style={{ borderRight: `1px solid ${C.rowLine}` }} />
                    <div style={{ borderRight: `1px solid ${C.rowLine}` }} />
                    <div />
                </div>
            ))}
        </div>
    );
};

const ForeignKeyPopover: FC<{
    chipRef: (el: HTMLElement | null) => void;
    rowRef: (el: HTMLElement | null) => void;
    open?: boolean;
}> = ({ chipRef, rowRef, open = true }) => (
    <>
        <div style={{ position: "absolute", left: 56, top: 158, width: 200, height: 31, border: `2px solid ${C.blue}`, background: "rgba(0,120,212,.12)", pointerEvents: "none" }} />
        <div
            ref={chipRef}
            style={{
                position: "absolute",
                left: 200,
                top: 162,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 6px",
                borderRadius: 3,
                background: "#04395e",
                fontSize: 11,
                color: C.bluePale,
                pointerEvents: "none",
            }}
        >
            <span>⑃ 2</span>
            <span style={{ color: C.muted }}>⧉</span>
        </div>
        {open && (
            <div style={{ position: "absolute", left: 218, top: 196, width: 216, padding: "12px 0", background: "#252526", border: "1px solid #454545", boxShadow: "0 10px 28px rgba(0,0,0,.6)" }}>
                <div style={{ padding: "0 14px 10px", fontSize: 12.5, color: C.textDim }}>Show rows referencing this</div>
                <div ref={rowRef} style={{ margin: "0 8px", padding: "6px 8px", background: "#04395e", font: `400 12.5px ${MONO}`, color: C.textStrong }}>
                    payments.<span style={{ color: "#9cdcfe" }}>customerNumber</span>
                </div>
                <div style={{ margin: "4px 8px 0", padding: "6px 8px", font: `400 12.5px ${MONO}`, color: C.textDim }}>
                    orders.<span style={{ color: "#9cdcfe" }}>customerNumber</span>
                </div>
            </div>
        )}
    </>
);

const PastePanel: FC<{
    filled: boolean;
    hoverImport?: boolean;
    pasteAreaRef?: (el: HTMLElement | SVGElement | null) => void;
    importBtnRef: (el: HTMLElement | SVGElement | null) => void;
}> = ({ filled, hoverImport, pasteAreaRef, importBtnRef }) => (
    <div
        style={{
            position: "absolute",
            right: 24,
            bottom: 16,
            width: 566,
            background: "#1e1e1e",
            border: "1px solid #333333",
            borderRadius: 6,
            boxShadow: "0 20px 50px rgba(0,0,0,.75)",
            display: "flex",
            flexDirection: "column",
        }}
    >
        <div style={{ height: 38, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid #2a2a2a", fontSize: 13, color: C.text, fontWeight: 600 }}>
            <span style={{ color: "#8fc9ff", fontSize: 14 }}>⧉</span>Paste Playground
            <span style={{ marginLeft: "auto", display: "flex", gap: 14, color: C.muted, fontSize: 13 }}>▤ ✕</span>
        </div>
        <div
            ref={pasteAreaRef}
            style={{
                margin: "12px 14px",
                height: 104,
                border: filled ? "1px solid rgba(0, 120, 212, 0.6)" : "1px solid #333333",
                background: filled ? "rgba(0, 120, 212, 0.04)" : "#181818",
                borderRadius: 4,
                padding: "9px 11px",
                position: "relative",
                font: `400 12px/1.5 ${MONO}`,
                color: C.cell,
                overflow: "hidden",
                transition: "all 0.2s ease",
            }}
        >
            {filled ? (
                <div>
                    495,Diecast Collectables,Franco,Valarie,6175552555,6251 Ingle Ln.,,Boston,MA,51003,USA,1188,85100.00
                    <br />
                    496,Kelly&apos;s Gift Shop,Snowden,Tony,+64 9 5555500,Arenales 1938 3&apos;A&apos;,,Auckland,,,New Zealand,1612,110000.00
                    <span style={{ display: "inline-block", width: 1.5, height: 12, background: C.blueLight, verticalAlign: -2 }} />
                </div>
            ) : (
                <div style={{ fontFamily: UI, fontSize: 12.5, color: "#666666" }}>
                    Paste CSV, TSV, or JSON array of objects here...
                </div>
            )}
            <div
                style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    font: `600 9px ${UI}`,
                    letterSpacing: ".08em",
                    color: filled ? C.blueLight : "#888888",
                    border: filled ? "1px solid rgba(0,120,212,0.4)" : "1px solid #3a3a3a",
                    background: filled ? "rgba(0,120,212,0.15)" : "#2a2a2a",
                    padding: "2px 5px",
                    borderRadius: 3,
                }}
            >
                INPUT
            </div>
        </div>
        <div style={{ margin: "0 14px", border: "1px solid #2a2a2a", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: 30, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", background: "#232323", fontSize: 11, letterSpacing: ".06em", color: "#aaaaaa", fontWeight: 600 }}>
                PREVIEW
                <span style={{ display: "flex", alignItems: "center", gap: 6, letterSpacing: 0, fontWeight: 400, fontSize: 11.5, color: "#cccccc" }}>
                    <span style={{ width: 13, height: 13, borderRadius: 2, background: C.blue, color: "#fff", display: "grid", placeItems: "center", fontSize: 9 }}>✓</span>
                    Auto-generate IDs (Clear PKs)
                </span>
                <span style={{ marginLeft: "auto", letterSpacing: 0, fontWeight: 600, fontSize: 11.5, color: filled ? C.bluePale : "#888888" }}>
                    {filled ? "7 records detected" : "0 records detected"}
                </span>
            </div>
            {filled ? (
                <div style={{ height: 246, overflow: "hidden" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "108px 168px 130px 128px",
                            height: 28,
                            background: C.panel,
                            borderBottom: `1px solid ${C.line2}`,
                            fontSize: 11.5,
                            color: C.textDim,
                        }}
                    >
                        {["customerNumber", "customerName", "contactLastName", "contactFirstName"].map((h, i) => (
                            <div key={h} style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: i < 3 ? `1px solid ${C.line2}` : undefined }}>
                                {h}
                            </div>
                        ))}
                    </div>
                    {PREVIEW_ROWS.map((pr) => (
                        <div key={pr.n} style={{ display: "grid", gridTemplateColumns: "108px 168px 130px 128px", height: 30, borderBottom: `1px solid ${C.rowLine}`, fontSize: 12, color: C.cell }}>
                            <div style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: `1px solid ${C.rowLine}`, color: C.faint }}>NULL</div>
                            <div style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: `1px solid ${C.rowLine}`, overflow: "hidden", whiteSpace: "nowrap" }}>{pr.n}</div>
                            <div style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRight: `1px solid ${C.rowLine}` }}>{pr.l}</div>
                            <div style={{ display: "flex", alignItems: "center", padding: "0 9px" }}>{pr.f}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ height: 246, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#555555" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <div style={{ fontSize: 12.5, color: "#666666", fontStyle: "italic" }}>Pasted data will appear here</div>
                </div>
            )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 12.5, color: "#cccccc", lineHeight: 1.45, fontWeight: 600 }}>
                Target Table
                <br />
                <span style={{ color: "#777777", fontWeight: 400, fontSize: 11.5 }}>13 columns available</span>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 12.5, color: "#cccccc", padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 4, background: "#222226" }}>Cancel</div>
            <div
                ref={importBtnRef}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: "5.5px 14px",
                    borderRadius: 4,
                    background: !filled ? "#222226" : hoverImport ? "linear-gradient(135deg, #0078d4, #005a9e)" : "#0078d4",
                    color: !filled ? "#4e4e52" : "#ffffff",
                    border: !filled ? "1px solid #2e2e32" : "1px solid rgba(0,120,212,0.6)",
                    boxShadow: filled ? "0 2px 10px rgba(0, 120, 212, 0.45)" : "none",
                    cursor: filled ? "pointer" : "default",
                    transition: "all 0.18s ease",
                }}
            >
                ⇱ Import Data
            </div>
        </div>
    </div>
);

const Pagination: FC<{ showing: string }> = ({ showing }) => (
    <div
        style={{
            height: 34,
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            borderTop: `1px solid ${C.line}`,
            background: C.panel,
            fontSize: 12.5,
            color: C.textDim,
        }}
    >
        <span style={{ color: C.muted }}>Rows per page:</span>
        <span style={{ height: 24, padding: "0 9px", display: "flex", alignItems: "center", gap: 20, border: `1px solid ${C.line3}`, borderRadius: 3, background: C.raised }}>
            Auto (27)<span style={{ color: C.faint }}>⌄</span>
        </span>
        <span style={{ marginLeft: "auto", color: C.muted }}>{showing}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 14, color: C.muted }}>
            <span>‹</span>
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    style={{
                        minWidth: 22,
                        height: 22,
                        display: "grid",
                        placeItems: "center",
                        background: n === 1 ? C.blue : undefined,
                        color: n === 1 ? "#fff" : undefined,
                        borderRadius: 3,
                    }}
                >
                    {n}
                </span>
            ))}
            <span>›</span>
        </span>
    </div>
);

export default QuickDBStory;
