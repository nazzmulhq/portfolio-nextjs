"use client";

import {
    CSSProperties,
    FC,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    CATEGORIES,
    CUST,
    DESIGN_W,
    EMPTY_ROWS,
    FIELDS,
    P0,
    PAY_ROWS,
    PREVIEW_ROWS,
    STEP_STARTS,
    STEPS,
    TABLES,
    TAIL,
    TARGETS,
    TOASTS,
    TOOLS,
    TRACK_VH,
} from "./landingData";
import QuickDBBottomNav from "./QuickDBBottomNav";

import QuickDBTopMenuBar from "./QuickDBTopMenuBar";
import {
    formatInstallCount,
    useQuickDBMarketplace,
} from "./useQuickDBMarketplace";

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
    | "pasteArea"
    | "sidebarSqlConsole"
    | "newQueryBtnCard"
    | "topConnSelectBtn"
    | "connOptionDemoItem"
    | "topDbSelectBtn"
    | "dbOptionClassicItem"
    | "monacoSqlEditor"
    | "topRunQueryBtn"
    | "schemaExpRightIcon"
    | "queryHistoryRightIcon"
    | "savedQueriesRightIcon"
    | "saveQueryAsBtn"
    | "queryTitleModalInput"
    | "updateQueryModalBtn"
    | "sqlSnippetsRightIcon"
    | "snippetCardItem"
    | "closeSnippetRightBtn"
    | "visualizeBarBtn";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Scroll-driven "focus → backspace old → pause → type new" text reveal,
 * shared by every character-by-character beat in this story (step 10's
 * cell edit, the saved-query title rename, the second query's table/column
 * swap). `f` is local progress in [0, 1] through whatever window the
 * caller has mapped to this beat — driven by scroll fraction rather than
 * wall-clock time, so it can never desync from how fast the user is
 * actually scrolling: 20% dwell (cursor visibly arrives before anything
 * changes), 30% backspacing `before` away, 10% pause on empty, 40% typing
 * `after` in.
 */
const scrollTypeReveal = (before: string, after: string, f: number): string => {
    if (f < 0.2) return before;
    if (f < 0.5) {
        const p = (f - 0.2) / 0.3;
        return before.slice(0, Math.max(0, Math.round((1 - p) * before.length)));
    }
    if (f < 0.6) return "";
    const p = (f - 0.6) / 0.4;
    return after.slice(0, Math.min(after.length, Math.round(p * after.length)));
};

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
const CLOSE_AT = 0.5;

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
 * Fraction into step 21 ("Query Console") at which the old Data View grid
 * (customers table + its Refresh/Add/Paste/Clone toolbar) actually closes
 * and the Query Console webview takes over the editor pane. Same problem as
 * OPEN_AT/CLOSE_AT again: step 20 ends on the Save button, and the cursor
 * needs to visibly glide from there over to "SQL Console" in the sidebar
 * (sidebarSqlConsole) before the body flips — not the instant scroll crosses
 * into step 21. None of the reference screenshots ever show the Data View
 * grid once the Query Console is open, so past this threshold it stays
 * closed for the rest of the story, unlike tableOpen's other toggles.
 */
const QC_OPEN_AT = 0.45;

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
 * Step 47's saved-query rename: the modal opens with the auto-generated SQL
 * preview as its title (truncated in the reference screenshots, but the
 * animation runs against the real full string since the truncation is a
 * CSS overflow effect, not a shorter underlying value) and backspaces it
 * away in favor of a human-readable question — same scrollTypeReveal shape
 * as step 10's cell edit, mapped to step 47's own frac window.
 */
const QUERY_TITLE_BEFORE =
    "SELECT * FROM customers LEFT JOIN payments ON payments.customerNumber = customers.customerNumber;";
const QUERY_TITLE_AFTER = "How many total customers have made a payment?";

/**
 * Step 56's second query edit: the "Top 10 newest rows" snippet landed with
 * placeholder table/column names (my_table, created_at) that don't exist in
 * this schema — retargeted to the real orderdetails table and its
 * orderNumber column. Two sequential scrollTypeReveal beats sharing one
 * step's frac window (table name over the first half, order column over
 * the second) rather than two separate steps, since both edits happen to
 * the same already-open editor without the cursor leaving it.
 */
const SECOND_EDIT_TABLE_BEFORE = "my_table";
const SECOND_EDIT_TABLE_AFTER = "orderdetails";
const SECOND_EDIT_ORDERCOL_BEFORE = "created_at";
const SECOND_EDIT_ORDERCOL_AFTER = "orderNumber";

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
const EDIT_PHASE_BOUNDS = [0.45, 0.65, 0.8, 0.95] as const;

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

    const marketplace = useQuickDBMarketplace();

    const [step, setStep] = useState(1);
    const [selN, setSelN] = useState(0);
    const [findDone, setFindDone] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [tableOpen, setTableOpen] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [connSelected, setConnSelected] = useState(false);
    const [dbSelected, setDbSelected] = useState(false);
    const [savedPanelOpen, setSavedPanelOpen] = useState(false);
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
    // Live text for the two Query Console character-reveal beats (steps 47
    // and 56). Defaulted to the *finished* strings rather than "" — unlike
    // editCellText, these fields only ever render while their own step is
    // active, so there's no "not started yet" ambiguity to preserve, and
    // defaulting to the final text means an interrupted render never shows
    // a half-built string.
    const [queryTitleText, setQueryTitleText] = useState(QUERY_TITLE_AFTER);
    const [secondEditTable, setSecondEditTable] = useState(SECOND_EDIT_TABLE_AFTER);
    const [secondEditOrderCol, setSecondEditOrderCol] = useState(SECOND_EDIT_ORDERCOL_AFTER);

    const jumpToStep = (stepNum: number) => {
        const track = refs.current.track;
        if (!track) return;
        const vpH = typeof window !== "undefined" ? window.innerHeight : 800;
        const r = track.getBoundingClientRect();
        const span = Math.max(1, r.height - vpH);
        const targetP =
            STEP_STARTS[
                Math.max(0, Math.min(STEP_STARTS.length - 1, stepNum - 1))
            ];
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
        { label: "Data View", icon: "▤", live: true, step: 1 },
        { label: "Query Console", icon: "⌘", live: true, step: 21 },
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
        saveModalOpen: false,
        connSelected: false,
        dbSelected: false,
        savedPanelOpen: false,
        pastHover: false,
        pastClick: false,
        editPhase: 0 as 0 | 1 | 2 | 3 | 4 | 5,
        hasEditHistory: false,
        editCellText: "",
        editAnimStarted: false,
        queryTitleText: QUERY_TITLE_AFTER,
        secondEditTable: SECOND_EDIT_TABLE_AFTER,
        secondEditOrderCol: SECOND_EDIT_ORDERCOL_AFTER,
        findDone: false,
        typeP: { extSearch: 0, findText: 0 } as Record<string, number>,
        typeD: { extSearch: 0, findText: 0 } as Record<string, number>,
        typeTs: 0,
        typeRaf: 0,
        raf: 0,
        toastTimer: 0 as ReturnType<typeof setTimeout> | 0,
    });

    useEffect(() => {
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
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
                    const gridTop =
                        (wrap.getBoundingClientRect().top - sr.top) / k;
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
                      (e.frac > 0.5 && e.frac < 0.54) ||
                      (e.frac > 0.7 && e.frac < 0.74) ||
                      (e.frac > 0.85 && e.frac < 0.89)
                    : e.frac > 0.4 && e.frac < 0.65;
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

            FIELDS.forEach(fd => {
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
            const mark = (
                node: HTMLElement | SVGElement | Element | null,
                on: boolean,
            ) => {
                if (!node || !("style" in node)) return;
                node.style.color = on ? C.textStrong : C.faint;
                node.style.boxShadow = on
                    ? `inset 2px 0 0 0 ${C.blue}`
                    : "none";
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
                [el("lap"), el("screen")].forEach(node => {
                    if (node) node.style.height = `${sh}px`;
                });
            }

            const full = vp.w / DESIGN_W;
            const start = Math.min(
                (vp.w * 0.52) / DESIGN_W,
                (vp.h * 0.46) / sh,
            );
            const k =
                start + (full - start) * easeInOutCubic(clamp01(p / 0.075));
            const lap = el("lap");
            if (lap)
                lap.style.transform = `translate(-50%,-50%) scale(${k.toFixed(4)})`;

            // Bezel, base and glow dissolve as the screen goes full-bleed.
            const chrome = 1 - clamp01((p - 0.05) / 0.055);
            (["bez", "base", "glow"] as const).forEach(n => {
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
                    ? Math.min(
                          5,
                          1 + Math.floor(clamp01((e.frac - 0.08) / 0.74) * 5),
                      )
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

            // The "Update saved query" modal only opens once the cursor has
            // actually arrived at the save icon and the click-pulse reads —
            // same idea as paymentsOpen/tableOpen, just for step 46. 0.5 sits
            // in the middle of the default (non-step-10) click-pulse window
            // (frac 0.4–0.65, see glide's isClickWindow), so the modal lands
            // right as the click registers instead of the instant step 46
            // begins, before the cursor has even set off toward the icon.
            //
            // It also has to actually CLOSE again — TARGETS[49-50] point the
            // cursor at the modal's own "Update" button, and clicking that is
            // exactly what reveals the saved-query card sitting in the panel
            // behind it (step 50's "show save query" beat). A modal that
            // never closes keeps that card permanently hidden. Mirrors the
            // open condition: closes at step 49's own click-pulse midpoint.
            const saveModalOpen =
                (s === 46 && e.frac >= 0.5) ||
                (s > 46 && s < 49) ||
                (s === 49 && e.frac < 0.5);

            // Same problem, twice more: the connection/database dropdown
            // popups were unmounting the instant their step ended (s===26,
            // s===29), while TARGETS still pointed the cursor at an option
            // *inside* them for the whole next step (27, 30) — the option
            // vanished before the cursor got anywhere near it, and the
            // "Demo · mysql" / "classicmodels" label just appeared on its
            // own with no visible click. Selection now lands mid-click
            // instead, and the popup (further down) stays mounted until then.
            const connSelected = s > 27 || (s === 27 && e.frac >= 0.5);
            const dbSelected = s > 30 || (s === 30 && e.frac >= 0.5);

            // The right-side vertical icon bar (Schema Explorer / Query
            // History / Saved Queries / SQL Snippets) has the same "opens
            // before the click" problem. Three of the four get two steps at
            // the same target (hover, then click) — TARGETS[41,42] etc. —
            // so by the second step the cursor already had a full step to
            // arrive; those just need to stop opening on the FIRST (hover)
            // step and wait for the second. Saved Queries is the odd one
            // out with only a single step (45) at its target, so it needs
            // real frac-gating like saveModalOpen/connSelected above,
            // rather than just picking the later of two steps.
            const savedPanelOpen = s > 45 || (s === 45 && e.frac >= 0.5);

            // Mirror of paymentsOpen: the customers tab stays CLOSED through
            // the first part of step 10, so the cursor visibly arrives at the
            // customers row in the sidebar tree and "clicks" it before the
            // tab appears, instead of the tab being open before the cursor
            // even sets off toward the row. And, same idea a third time at
            // the other end: the grid stays OPEN through the first part of
            // step 21 (see QC_OPEN_AT) rather than closing the instant step
            // 20 ends, then stays closed for good once the Query Console
            // webview takes over — the two panes never share the stage.
            const tableOpen =
                (s === 10 && e.frac >= OPEN_AT) ||
                (s > 10 && s < 21) ||
                (s === 21 && e.frac < QC_OPEN_AT);

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
                if (f < 0.2) {
                    text = originalLast;
                } else if (f < 0.5) {
                    const p = (f - 0.2) / 0.3;
                    const keep = Math.round((1 - p) * originalLast.length);
                    text = originalLast.slice(0, Math.max(0, keep));
                } else if (f < 0.6) {
                    text = "";
                } else {
                    const p = (f - 0.6) / 0.4;
                    const len = Math.round(p * EDIT_VALUE.length);
                    text = EDIT_VALUE.slice(
                        0,
                        Math.min(EDIT_VALUE.length, len),
                    );
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

            // Step 47: the saved-query title rename. A single
            // scrollTypeReveal across the whole step, same shape as step
            // 10's — resets to the pre-edit SQL preview the instant the
            // step is entered from either direction so scrolling back into
            // 47 later replays it rather than resuming a stale snapshot.
            if (s === 47) {
                const text = scrollTypeReveal(QUERY_TITLE_BEFORE, QUERY_TITLE_AFTER, e.frac);
                if (text !== e.queryTitleText) {
                    e.queryTitleText = text;
                    setQueryTitleText(text);
                }
            } else if (e.queryTitleText !== QUERY_TITLE_AFTER) {
                e.queryTitleText = QUERY_TITLE_AFTER;
                setQueryTitleText(QUERY_TITLE_AFTER);
            }

            // Step 56: the second query's table name, then its ORDER BY
            // column — two scrollTypeReveal beats back to back, the table
            // over the first half of the step's frac window and the column
            // over the second, so the retarget reads as one edit following
            // another rather than both fields changing at once.
            if (s === 56) {
                const table = scrollTypeReveal(
                    SECOND_EDIT_TABLE_BEFORE,
                    SECOND_EDIT_TABLE_AFTER,
                    clamp01(e.frac / 0.5),
                );
                const orderCol = scrollTypeReveal(
                    SECOND_EDIT_ORDERCOL_BEFORE,
                    SECOND_EDIT_ORDERCOL_AFTER,
                    clamp01((e.frac - 0.5) / 0.5),
                );
                if (table !== e.secondEditTable) {
                    e.secondEditTable = table;
                    setSecondEditTable(table);
                }
                if (orderCol !== e.secondEditOrderCol) {
                    e.secondEditOrderCol = orderCol;
                    setSecondEditOrderCol(orderCol);
                }
            } else if (
                e.secondEditTable !== SECOND_EDIT_TABLE_AFTER ||
                e.secondEditOrderCol !== SECOND_EDIT_ORDERCOL_AFTER
            ) {
                e.secondEditTable = SECOND_EDIT_TABLE_AFTER;
                e.secondEditOrderCol = SECOND_EDIT_ORDERCOL_AFTER;
                setSecondEditTable(SECOND_EDIT_TABLE_AFTER);
                setSecondEditOrderCol(SECOND_EDIT_ORDERCOL_AFTER);
            }

            if (
                s !== e.step ||
                n !== e.selN ||
                paymentsOpen !== e.paymentsOpen ||
                tableOpen !== e.tableOpen ||
                saveModalOpen !== e.saveModalOpen ||
                connSelected !== e.connSelected ||
                dbSelected !== e.dbSelected ||
                savedPanelOpen !== e.savedPanelOpen ||
                isPastHover !== e.pastHover ||
                isPastClick !== e.pastClick ||
                editPhase !== e.editPhase ||
                hasEditHistory !== e.hasEditHistory
            ) {
                const changedStep = s !== e.step;
                const changedSelN = n !== e.selN;
                const changedTableOpen = tableOpen !== e.tableOpen;
                const changedSaveModalOpen = saveModalOpen !== e.saveModalOpen;
                const changedConnSelected = connSelected !== e.connSelected;
                const changedDbSelected = dbSelected !== e.dbSelected;
                const changedSavedPanelOpen = savedPanelOpen !== e.savedPanelOpen;
                const changedPaymentsOpen = paymentsOpen !== e.paymentsOpen;
                const changedPastHover = isPastHover !== e.pastHover;
                const changedPastClick = isPastClick !== e.pastClick;
                const changedEditPhase = editPhase !== e.editPhase;
                const changedHasEditHistory =
                    hasEditHistory !== e.hasEditHistory;

                e.step = s;
                e.selN = n;
                e.paymentsOpen = paymentsOpen;
                e.tableOpen = tableOpen;
                e.saveModalOpen = saveModalOpen;
                e.connSelected = connSelected;
                e.dbSelected = dbSelected;
                e.savedPanelOpen = savedPanelOpen;
                e.pastHover = isPastHover;
                e.pastClick = isPastClick;
                e.editPhase = editPhase;
                e.hasEditHistory = hasEditHistory;

                if (changedStep) setStep(s);
                if (changedSelN) setSelN(n);
                if (changedTableOpen) setTableOpen(tableOpen);
                if (changedSaveModalOpen) setSaveModalOpen(saveModalOpen);
                if (changedConnSelected) setConnSelected(connSelected);
                if (changedDbSelected) setDbSelected(dbSelected);
                if (changedSavedPanelOpen) setSavedPanelOpen(savedPanelOpen);
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

        window.addEventListener("scroll", onScroll, {
            passive: true,
            capture: true,
        });
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
    const changes =
        (s === 18 && pastClick) || (s === 19 && !pastClick)
            ? 7
            : s === 12 && !pastClick
              ? 4
              : editPhase === 2 || editPhase === 4
                ? 1
                : 0;
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
            lastBg:
                isEditRow && editDirty ? "rgba(226,177,60,.16)" : "transparent",
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

    const visibleTables = TABLES.filter(
        t => !filtering || t[0].startsWith("cust"),
    );
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
    const pastePanel =
        (s === 16 && pastClick) || s === 17 || (s === 18 && !pastClick);

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
        <span
            style={{
                fontSize: 9.5,
                background: bg,
                color: fg,
                borderRadius: 2,
                padding: "1.5px 3px",
            }}
        >
            {label}
        </span>
    );
    const key = <span style={{ color: C.amber }}>🔑</span>;
    const colMenu = (
        <span style={{ marginLeft: "auto", color: C.faint }}>⚟ ⋮</span>
    );

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
                            background:
                                "linear-gradient(160deg,#3a3a44,#191920 40%,#101016)",
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
                            background:
                                "linear-gradient(180deg,#44444e,#22222a 40%,#0e0e12)",
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
                        {/* macOS-style top status bar with realtime time, date, battery, & weather */}
                        <QuickDBTopMenuBar />

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
                                {["#ff5f57", "#febc2e", "#28c840"].map(bg => (
                                    <div
                                        key={bg}
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            background: bg,
                                        }}
                                    />
                                ))}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 14,
                                    color: C.faint,
                                    fontSize: 14,
                                    marginLeft: 8,
                                }}
                            >
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
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    opacity: 0.5,
                                }}
                            >
                                {[
                                    "",
                                    "borderLeftWidth",
                                    "borderBottomWidth",
                                    "borderRightWidth",
                                ].map((k2, i) => (
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
                                    <rect
                                        x="4.5"
                                        y="2.5"
                                        width="11"
                                        height="16"
                                        rx="1.5"
                                    />
                                    <path d="M15.5 6.5h4v15h-11" />
                                </ActIcon>
                                {s >= 6 && (
                                    <div
                                        ref={set("qdbIcon")}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            display: "grid",
                                            placeItems: "center",
                                            position: "relative",
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt="QuickDB"
                                            src="/images/quickdb-logo.png"
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: 5,
                                                objectFit: "cover",
                                            }}
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
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                    >
                                        <rect
                                            x="3.5"
                                            y="3.5"
                                            width="7"
                                            height="7"
                                            rx="1"
                                        />
                                        <rect
                                            x="13.5"
                                            y="3.5"
                                            width="7"
                                            height="7"
                                            rx="1"
                                        />
                                        <rect
                                            x="3.5"
                                            y="13.5"
                                            width="7"
                                            height="7"
                                            rx="1"
                                        />
                                        <rect
                                            x="13.5"
                                            y="13.5"
                                            width="7"
                                            height="7"
                                            rx="1"
                                        />
                                    </svg>
                                </div>
                                <div
                                    style={{
                                        marginTop: "auto",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
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
                                        <div
                                            style={{
                                                flex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                minHeight: 0,
                                            }}
                                        >
                                            <PanelTitle>
                                                EXTENSIONS: MARKETPLACE
                                                <span
                                                    style={{
                                                        marginLeft: "auto",
                                                        display: "flex",
                                                        gap: 12,
                                                        fontSize: 13,
                                                        color: C.muted,
                                                    }}
                                                >
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
                                                <span
                                                    ref={set("extSearch")}
                                                    style={{ color: C.faint }}
                                                >
                                                    Search Extensions in
                                                    Marketplace
                                                </span>
                                                {s === 2 && <Caret />}
                                                <span
                                                    style={{
                                                        marginLeft: "auto",
                                                        display: "flex",
                                                        gap: 8,
                                                        color: C.muted,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    ⌫ ⚟
                                                </span>
                                            </div>

                                            {s === 2 && (
                                                <div
                                                    style={{
                                                        marginTop: 8,
                                                        fontSize: 11,
                                                        letterSpacing: ".06em",
                                                        color: C.textDim,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <TreeRow
                                                        label="INSTALLED"
                                                        badge="35"
                                                    />
                                                    <TreeRow
                                                        label="RECOMMENDED"
                                                        badge="6"
                                                    />
                                                    <div
                                                        style={{
                                                            height: 23,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 8,
                                                            padding: "0 10px",
                                                            background:
                                                                "#04395e",
                                                            outline: `1px solid ${C.blue}`,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                color: C.muted,
                                                            }}
                                                        >
                                                            ›
                                                        </span>
                                                        MCP SERVERS - INSTALLED
                                                    </div>
                                                </div>
                                            )}

                                            {s >= 3 && (
                                                <div
                                                    ref={set("extCard")}
                                                    style={{
                                                        marginTop: 8,
                                                        display: "flex",
                                                        gap: 12,
                                                        padding: "10px 12px",
                                                    }}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        alt="QuickDB"
                                                        src="/images/quickdb-logo.png"
                                                        style={{
                                                            width: 44,
                                                            height: 44,
                                                            flex: "none",
                                                            borderRadius: 8,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            minWidth: 0,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "baseline",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 13.5,
                                                                    fontWeight: 600,
                                                                    color: C.textStrong,
                                                                }}
                                                            >
                                                                QuickDB
                                                            </span>
                                                            <span
                                                                style={{
                                                                    marginLeft:
                                                                        "auto",
                                                                    fontSize: 11.5,
                                                                    color: C.muted,
                                                                }}
                                                            >
                                                                ⇩{" "}
                                                                {formatInstallCount(
                                                                    marketplace.installs,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: C.muted,
                                                                marginTop: 2,
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            Lightweight database
                                                            browser for VS Code.
                                                            Conn…
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                marginTop: 5,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: "#bbbbbb",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Nazmul Haque
                                                            </span>
                                                            {(s === 3 ||
                                                                s === 4) && (
                                                                <span
                                                                    style={{
                                                                        marginLeft:
                                                                            "auto",
                                                                        background:
                                                                            C.blue,
                                                                        color: "#fff",
                                                                        fontSize: 11.5,
                                                                        padding:
                                                                            "2px 9px",
                                                                        borderRadius: 2,
                                                                    }}
                                                                >
                                                                    Install
                                                                </span>
                                                            )}
                                                            {s === 5 && (
                                                                <span
                                                                    style={{
                                                                        marginLeft:
                                                                            "auto",
                                                                        color: C.muted,
                                                                        fontSize: 11.5,
                                                                    }}
                                                                >
                                                                    Installing
                                                                </span>
                                                            )}
                                                            {s >= 6 && (
                                                                <span
                                                                    style={{
                                                                        marginLeft:
                                                                            "auto",
                                                                        color: C.muted,
                                                                        fontSize: 13,
                                                                    }}
                                                                >
                                                                    ⚙
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {sideQdb && (
                                        <div
                                            style={{
                                                flex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                minHeight: 0,
                                            }}
                                        >
                                            <PanelTitle>
                                                QUICKDB
                                                <span
                                                    style={{
                                                        marginLeft: "auto",
                                                        fontSize: 14,
                                                        color: C.muted,
                                                    }}
                                                >
                                                    ···
                                                </span>
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
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        color: C.muted,
                                                    }}
                                                >
                                                    ⌄
                                                </span>
                                                CONNECTIONS
                                                <span
                                                    ref={set("addConn")}
                                                    style={{
                                                        marginLeft: "auto",
                                                        display: "flex",
                                                        gap: 14,
                                                        color: C.muted,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    ＋ ↻ ⌕
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    flex: "none",
                                                    minHeight: 0,
                                                    overflow: "hidden",
                                                    maxHeight: 340,
                                                }}
                                            >
                                                {s === 7 && (
                                                    <div
                                                        style={{
                                                            margin: "34px auto 0",
                                                            width: 236,
                                                            padding:
                                                                "22px 18px",
                                                            borderRadius: 8,
                                                            background: C.panel,
                                                            border: "1px solid #333",
                                                            textAlign: "center",
                                                            position:
                                                                "relative",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                left: 0,
                                                                right: 0,
                                                                top: 0,
                                                                height: 2,
                                                                background:
                                                                    "linear-gradient(90deg,#0078d4,#8a5cf6)",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                width: 56,
                                                                height: 26,
                                                                margin: "0 auto 12px",
                                                                borderRadius: 13,
                                                                background:
                                                                    "#0b3a5e",
                                                                display: "grid",
                                                                placeItems:
                                                                    "center",
                                                                color: C.blueLight,
                                                            }}
                                                        >
                                                            <DbGlyph
                                                                size={16}
                                                                stroke="currentColor"
                                                                full
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 600,
                                                                color: C.textStrong,
                                                            }}
                                                        >
                                                            No Connections
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11.5,
                                                                lineHeight: 1.5,
                                                                color: C.muted,
                                                                marginTop: 5,
                                                            }}
                                                        >
                                                            Explore SQLite,
                                                            PostgreSQL, MySQL,
                                                            Redis, or MongoDB
                                                            databases.
                                                        </div>
                                                    </div>
                                                )}

                                                {s === 8 && (
                                                    <div className="qd-fade">
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 8,
                                                                padding:
                                                                    "0 12px",
                                                                background:
                                                                    C.panel,
                                                                fontSize: 13,
                                                                color: C.text,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 9,
                                                                    color: C.muted,
                                                                }}
                                                            >
                                                                ›
                                                            </span>
                                                            <DbGlyph />
                                                            Demo
                                                            <span
                                                                style={{
                                                                    marginLeft:
                                                                        "auto",
                                                                    display:
                                                                        "flex",
                                                                    gap: 12,
                                                                    color: C.muted,
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                ▤ ✎ 🗑
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                margin: "6px 0 0 172px",
                                                                display:
                                                                    "inline-block",
                                                                background:
                                                                    "#252526",
                                                                border: "1px solid #454545",
                                                                padding:
                                                                    "3px 8px",
                                                                fontSize: 12,
                                                                color: C.textDim,
                                                                boxShadow:
                                                                    "0 3px 8px rgba(0,0,0,.5)",
                                                            }}
                                                        >
                                                            Create database
                                                        </div>
                                                    </div>
                                                )}

                                                {s >= 9 && (
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            color: C.textDim,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 8,
                                                                padding:
                                                                    "0 12px",
                                                                background:
                                                                    C.panel,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 9,
                                                                    color: C.muted,
                                                                }}
                                                            >
                                                                ⌄
                                                            </span>
                                                            <DbGlyph />
                                                            Demo
                                                        </div>
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 8,
                                                                padding:
                                                                    "0 12px 0 24px",
                                                                background:
                                                                    C.panel,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 9,
                                                                    color: C.muted,
                                                                }}
                                                            >
                                                                ⌄
                                                            </span>
                                                            <DbGlyph />
                                                            classicmodels
                                                        </div>
                                                        <div
                                                            ref={set("findBox")}
                                                            style={{
                                                                margin: "3px 12px 3px 26px",
                                                                height: 26,
                                                                border: `1px solid ${C.line3}`,
                                                                background:
                                                                    C.raised,
                                                                borderRadius: 2,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 7,
                                                                padding:
                                                                    "0 8px",
                                                                fontSize: 12.5,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: C.faint,
                                                                }}
                                                            >
                                                                ⌕
                                                            </span>
                                                            <span
                                                                ref={set(
                                                                    "findText",
                                                                )}
                                                                style={{
                                                                    color: C.faint,
                                                                }}
                                                            >
                                                                Find table in
                                                                database
                                                            </span>
                                                            {s === 9 && (
                                                                <Caret />
                                                            )}
                                                        </div>
                                                        {visibleTables.map(
                                                            t => (
                                                                <div
                                                                    className="qd-hover"
                                                                    key={t[0]}
                                                                    ref={
                                                                        t[0] ===
                                                                        "customers"
                                                                            ? set(
                                                                                  "custRow",
                                                                              )
                                                                            : undefined
                                                                    }
                                                                    style={{
                                                                        height: 26,
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 8,
                                                                        padding:
                                                                            "0 12px 0 40px",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            fontSize: 9,
                                                                            color: C.muted,
                                                                        }}
                                                                    >
                                                                        ›
                                                                    </span>
                                                                    <svg
                                                                        width="13"
                                                                        height="13"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke={
                                                                            C.muted
                                                                        }
                                                                        strokeWidth="1.5"
                                                                    >
                                                                        <rect
                                                                            x="3.5"
                                                                            y="4.5"
                                                                            width="17"
                                                                            height="15"
                                                                            rx="1.5"
                                                                        />
                                                                        <path d="M3.5 9.5h17M9 9.5v10M15 9.5v10" />
                                                                    </svg>
                                                                    {t[0]}
                                                                    <span
                                                                        style={{
                                                                            marginLeft:
                                                                                "auto",
                                                                            fontSize: 11.5,
                                                                            color: C.faint,
                                                                        }}
                                                                    >
                                                                        {t[1]}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                        <div
                                                            style={{
                                                                height: 26,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 8,
                                                                padding:
                                                                    "0 12px 0 24px",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: 9,
                                                                    color: C.muted,
                                                                }}
                                                            >
                                                                ›
                                                            </span>
                                                            <DbGlyph />
                                                            demo
                                                        </div>
                                                    </div>
                                                )}

                                            </div>

                                            {/* tools */}
                                            <div
                                                style={{
                                                    flex: 1,
                                                    minHeight: 0,
                                                    overflow: "hidden",
                                                    borderTop: `1px solid ${C.line}`,
                                                    marginTop: 8,
                                                }}
                                            >
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
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            color: C.muted,
                                                        }}
                                                    >
                                                        ⌄
                                                    </span>
                                                    TOOLS
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        color: C.textDim,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: 24,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 8,
                                                            padding:
                                                                "0 12px 0 22px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                color: C.amber,
                                                            }}
                                                        >
                                                            ▮▮
                                                        </span>
                                                        Dashboard
                                                    </div>
                                                    {TOOLS.map(g => (
                                                        <div key={g.name}>
                                                            <div
                                                                style={{
                                                                    height: 24,
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 7,
                                                                    padding:
                                                                        "0 12px 0 22px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontSize: 9,
                                                                        color: C.muted,
                                                                    }}
                                                                >
                                                                    ⌄
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        color: g.tint,
                                                                    }}
                                                                >
                                                                    {g.icon}
                                                                </span>
                                                                {g.name}
                                                                <span
                                                                    style={{
                                                                        marginLeft: 6,
                                                                        fontSize: 11.5,
                                                                        color: C.faint,
                                                                    }}
                                                                >
                                                                    {g.count}
                                                                </span>
                                                            </div>
                                                            {g.items.map(it => (
                                                                <div
                                                                    key={it}
                                                                    ref={
                                                                        it === "SQL Console"
                                                                            ? set("sidebarSqlConsole")
                                                                            : undefined
                                                                    }
                                                                    style={{
                                                                        height: 24,
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 8,
                                                                        padding:
                                                                            "0 12px 0 40px",
                                                                        background:
                                                                            it === "SQL Console" && s >= 21
                                                                                ? C.raised
                                                                                : "transparent",
                                                                        color:
                                                                            it === "SQL Console" && s >= 21
                                                                                ? C.text
                                                                                : C.textDim,
                                                                        fontWeight:
                                                                            it === "SQL Console" && s >= 21
                                                                                ? 600
                                                                                : 400,
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            color: C.muted,
                                                                            fontSize: 11,
                                                                        }}
                                                                    >
                                                                        ▫
                                                                    </span>
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
                                                <div
                                                    style={{
                                                        height: 26,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 7,
                                                        padding: "0 12px",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            color: C.muted,
                                                        }}
                                                    >
                                                        ›
                                                    </span>
                                                    QUERY HISTORY
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
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            color: C.muted,
                                                        }}
                                                    >
                                                        ›
                                                    </span>
                                                    SAVED QUERIES
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* editor area */}
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    background: C.panel,
                                    position: "relative",
                                }}
                            >
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
                                        {pay && (
                                            <Tab
                                                active
                                                name="payments"
                                                closeRef={set("closeTab")}
                                            />
                                        )}
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
                                            <span style={{ color: C.amber }}>
                                                ✳
                                            </span>
                                            <span>◫</span>
                                            <span>···</span>
                                        </div>
                                    </div>
                                )}

                                {mainWelcome && <WelcomePane />}
                                {mainExt && (
                                    <ExtensionPane
                                        step={s}
                                        installBtnRef={set("installBtn")}
                                    />
                                )}

                                {/* The Query Console webview only takes over the editor pane
                                    once the old Data View grid has actually closed (see
                                    QC_OPEN_AT) — gated on !grid, not a flat s>=21, so the two
                                    panes never show at the same time and the swap lands right
                                    as the cursor arrives at "SQL Console" in the sidebar. */}
                                {!grid && s >= 21 && (
                                    <div
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            minHeight: 0,
                                            background: "#1e1e1e",
                                            color: "#cccccc",
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Top Editor Tab Bar */}
                                        <div
                                            style={{
                                                height: 36,
                                                flex: "none",
                                                display: "flex",
                                                alignItems: "stretch",
                                                background: C.chrome,
                                                borderBottom: `1px solid ${C.line}`,
                                                fontSize: 12,
                                            }}
                                        >
                                            {s === 21 && (
                                                <div style={{ padding: "0 14px", display: "flex", alignItems: "center", color: C.muted }}>
                                                    VS Code
                                                </div>
                                            )}
                                            {s >= 22 && s <= 23 && (
                                                <div
                                                    style={{
                                                        padding: "0 14px",
                                                        background: "#1e1e1e",
                                                        borderTop: "2px solid #0078d4",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        color: "#fff",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    <span>📄</span> SQL Console <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                </div>
                                            )}
                                            {s >= 24 && s <= 59 && (
                                                <div
                                                    style={{
                                                        padding: "0 14px",
                                                        background: "#1e1e1e",
                                                        borderTop: "2px solid #0078d4",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        color: "#fff",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {/* Builds up as the connection, then the database,
                                                        actually get picked — not the full "Demo >
                                                        classicmodels" from the moment the console opens. */}
                                                    <span>📄</span> Query Console{connSelected && ": Demo"}
                                                    {dbSelected && " > classicmodels"} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                </div>
                                            )}
                                            {s >= 60 && (
                                                <>
                                                    <div
                                                        style={{
                                                            padding: "0 14px",
                                                            background: "#181818",
                                                            borderRight: "1px solid #2d2d2d",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            color: "#888",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        <span>📄</span> Query Console: Demo &gt; classicmodels
                                                    </div>
                                                    <div
                                                        style={{
                                                            padding: "0 14px",
                                                            background: "#1e1e1e",
                                                            borderTop: "2px solid #0078d4",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            color: "#fff",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        <span>📊</span> QuickDB Visualization <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                    </div>
                                                </>
                                            )}

                                            <div
                                                style={{
                                                    marginLeft: "auto",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "0 14px",
                                                    position: "relative",
                                                }}
                                            >
                                                {/* Connection/database selectors live on THIS row (the
                                                    file-tab bar), not the toolbar row below with Run —
                                                    the reference screenshots show them lined up with the
                                                    ✳/◫/⋯ icons at the very top, not next to Run/AI. */}
                                                {s >= 24 && s <= 59 && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                                                        <div
                                                            ref={set("topConnSelectBtn")}
                                                            style={{
                                                                padding: "3px 10px",
                                                                background: (s >= 25 && s <= 26) || (s === 27 && !connSelected) ? "rgba(0,120,212,0.3)" : "#252526",
                                                                border: (s >= 25 && s <= 26) || (s === 27 && !connSelected) ? "1px solid #0078d4" : "1px solid #3a3a3a",
                                                                borderRadius: 4,
                                                                color: connSelected ? "#fff" : "#aaa",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                            }}
                                                        >
                                                            <span>{connSelected ? "Demo · mysql" : "Select connection"}</span>
                                                            <span style={{ opacity: 0.6 }}>▾</span>
                                                        </div>

                                                        {/* Database Selector — doesn't exist until a
                                                            connection is actually picked; you can't choose
                                                            a database with no connection selected yet. */}
                                                        {connSelected && (
                                                            <div
                                                                ref={set("topDbSelectBtn")}
                                                                style={{
                                                                    padding: "3px 10px",
                                                                    background: (s >= 28 && s <= 29) || (s === 30 && !dbSelected) ? "rgba(0,120,212,0.3)" : "#252526",
                                                                    border: (s >= 28 && s <= 29) || (s === 30 && !dbSelected) ? "1px solid #0078d4" : "1px solid #3a3a3a",
                                                                    borderRadius: 4,
                                                                    color: dbSelected ? "#fff" : "#aaa",
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 6,
                                                                }}
                                                            >
                                                                <span>{dbSelected ? "classicmodels" : "Select database"}</span>
                                                                <span style={{ opacity: 0.6 }}>▾</span>
                                                            </div>
                                                        )}

                                                        {/* Connection Options Popup — stays mounted through
                                                            the first part of step 27 too (until connSelected
                                                            flips), so the cursor has something to actually
                                                            click on the whole time it's still traveling
                                                            toward this option. */}
                                                        {(s === 26 || (s === 27 && !connSelected)) && (
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 30,
                                                                    right: 74,
                                                                    width: 160,
                                                                    background: "#252526",
                                                                    border: "1px solid #0078d4",
                                                                    borderRadius: 4,
                                                                    boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                                                                    zIndex: 50,
                                                                    padding: 4,
                                                                }}
                                                            >
                                                                <div
                                                                    ref={set("connOptionDemoItem")}
                                                                    style={{ padding: "4px 8px", background: "#04395e", color: "#fff", borderRadius: 3, fontSize: 11, cursor: "pointer" }}
                                                                >
                                                                    Demo · mysql
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Database Options Popup — same fix, mirrored. */}
                                                        {(s === 29 || (s === 30 && !dbSelected)) && (
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 30,
                                                                    right: 74,
                                                                    width: 150,
                                                                    background: "#252526",
                                                                    border: "1px solid #0078d4",
                                                                    borderRadius: 4,
                                                                    boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                                                                    zIndex: 50,
                                                                    padding: 4,
                                                                }}
                                                            >
                                                                <div
                                                                    ref={set("dbOptionClassicItem")}
                                                                    style={{ padding: "4px 8px", background: "#04395e", color: "#fff", borderRadius: 3, fontSize: 11, cursor: "pointer" }}
                                                                >
                                                                    classicmodels
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <span style={{ color: C.amber, fontSize: 13 }}>✳</span>
                                                <span style={{ color: C.muted, fontSize: 13 }}>◫</span>
                                                <span style={{ color: C.muted, fontSize: 13 }}>···</span>
                                            </div>
                                        </div>

                                        {/* Webview Area */}
                                        <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
                                            
                                            {/* Step 21: VS Code Watermark Page */}
                                            {s === 21 && (
                                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#181818" }}>
                                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="rgba(255,255,255,0.06)">
                                                        <path d="M23.5 12l-5.5 5.5-12-12L1.5 8 0 9.5 6 12 0 14.5 1.5 16l4.5 2.5 12-12 5.5 5.5z"/>
                                                    </svg>
                                                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#666" }}>
                                                        <div>Open Chat <span style={{ background: "#252526", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>^ ⌘ I</span></div>
                                                        <div>Show All Commands <span style={{ background: "#252526", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>⇧ ⌘ P</span></div>
                                                        <div>Open Recent <span style={{ background: "#252526", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>^ R</span></div>
                                                        <div>Open File or Folder <span style={{ background: "#252526", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>⌘ O</span></div>
                                                        <div>New Untitled Text File <span style={{ background: "#252526", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>⌘ N</span></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 22-23: SQL Console Start Card */}
                                            {(s === 22 || s === 23) && (
                                                <div style={{ flex: 1, padding: 40, background: "#181818", display: "flex", flexDirection: "column", gap: 24 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <span style={{ fontSize: 28 }}>🚀</span>
                                                        <div>
                                                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>SQL Console</h2>
                                                            <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Open a saved query or start a new one</p>
                                                        </div>
                                                    </div>

                                                    <div
                                                        ref={set("newQueryBtnCard")}
                                                        style={{
                                                            border: s === 23 ? "1.5px solid #0078d4" : "1px dashed rgba(255,255,255,0.15)",
                                                            borderRadius: 8,
                                                            padding: "16px 20px",
                                                            background: s === 23 ? "rgba(0,120,212,0.1)" : "#222222",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 16,
                                                            transition: "all 0.2s ease",
                                                            maxWidth: 580,
                                                        }}
                                                    >
                                                        <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(0,120,212,0.2)", color: "#70baff", display: "grid", placeItems: "center", fontSize: 20 }}>+</div>
                                                        <div>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>New Query</div>
                                                            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Open a blank SQL console — pick the connection inside it</div>
                                                        </div>
                                                        <span style={{ marginLeft: "auto", color: "#666" }}>›</span>
                                                    </div>

                                                    <div style={{ marginTop: 20, textAlign: "center", color: "#555", fontSize: 12 }}>
                                                        📦<br />No saved queries yet — save one from the console and it'll show up here.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 24+: Active Query Console Webview Studio */}
                                            {s >= 24 && s <= 59 && (
                                                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#181818" }}>
                                                    
                                                    {/* Webview Studio Header Toolbar */}
                                                    <div style={{ height: 38, background: "#1f1f1f", borderBottom: "1px solid #2d2d2d", display: "flex", alignItems: "center", padding: "0 10px", gap: 10, fontSize: 11.5 }}>
                                                        
                                                        {/* Sub-tab Query 1 */}
                                                        <div style={{ padding: "3px 8px", background: "#2a2a2a", borderRadius: 4, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                                                            <span>📄</span> Query 1 <span style={{ opacity: 0.5 }}>+</span>
                                                        </div>

                                                        <div style={{ width: 1, height: 16, background: "#333" }} />

                                                        {/* Action Buttons Left */}
                                                        <button
                                                            ref={set("topRunQueryBtn")}
                                                            style={{
                                                                padding: "3px 10px",
                                                                borderRadius: 4,
                                                                background: s === 39 || s === 40 || s === 57 || s === 58 ? "#0078d4" : "#2a2a2a",
                                                                border: s === 39 || s === 40 || s === 57 || s === 58 ? "1px solid #4daafc" : "1px solid #3c3c3c",
                                                                color: "#fff",
                                                                fontWeight: 600,
                                                                fontSize: 11,
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <span>▷</span> Run
                                                        </button>
                                                        <span style={{ color: "#777", fontSize: 13, cursor: "pointer" }}>⛶</span>
                                                        <span style={{ color: "#777", fontSize: 13, cursor: "pointer" }}>🔗</span>
                                                        <span style={{ color: "#777", fontSize: 13, cursor: "pointer" }}>📊</span>
                                                        <span style={{ color: "#777", fontSize: 11, cursor: "pointer", background: "#282828", padding: "2px 6px", borderRadius: 3 }}>🤖 AI</span>

                                                        {/* Right side of the toolbar row — flat outline
                                                            icons (format / undo / redo / duplicate / save
                                                            / chart) plus the Templates/Go to dropdowns,
                                                            matching the reference (this row never held the
                                                            connection/database selectors — those live on
                                                            the tab bar above). */}
                                                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, color: "#777", fontSize: 12 }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <path d="M4 6h16M4 12h10M4 18h13" strokeLinecap="round" />
                                                            </svg>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <path d="M9 14L4 9l5-5M4 9h10a5 5 0 015 5v1" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <path d="M15 14l5-5-5-5M20 9H10a5 5 0 00-5 5v1" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <rect x="3.5" y="3.5" width="12" height="14" rx="1.5" />
                                                                <path d="M8.5 8.5h12v14a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-14z" />
                                                            </svg>
                                                            {/* The actual save trigger — hovering/clicking
                                                                THIS icon is what shows the "Update saved
                                                                query (Shift-click to save as new)" tooltip
                                                                and opens the modal, per the reference. Not
                                                                the star icon on the far-right vertical bar,
                                                                which only opens the Saved Queries list. */}
                                                            <div
                                                                ref={set("saveQueryAsBtn")}
                                                                title="Update saved query (Shift-click to save as new)"
                                                                style={{ color: s === 46 ? "#70baff" : "currentColor", cursor: "pointer", display: "flex" }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                    <path d="M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinejoin="round" />
                                                                    <path d="M8 4v5h7V4" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <path d="M4 20V11M11 20V4M18 20v-8" strokeLinecap="round" />
                                                            </svg>
                                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Templates… <span style={{ opacity: 0.6 }}>▾</span></span>
                                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Go to <span style={{ opacity: 0.6 }}>▾</span></span>
                                                        </div>
                                                    </div>

                                                    {/* Stage Body */}
                                                    <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
                                                        
                                                        {/* Empty Connection Prompt — gated on connSelected,
                                                            not a flat step range, so it stays up exactly as
                                                            long as the connection dropdown popup above does. */}
                                                        {!connSelected ? (
                                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#777", gap: 12 }}>
                                                                <span style={{ fontSize: 32 }}>🔌</span>
                                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>Select a connection</div>
                                                                <div style={{ fontSize: 12, maxWidth: 380, textAlign: "center", color: "#777" }}>
                                                                    Choose a connection from the selector in the top-right. The SQL editor opens once a connection and database are set.
                                                                </div>
                                                            </div>
                                                        ) : !dbSelected ? (
                                                            /* Empty Database Prompt: connection is picked,
                                                               still need a database. */
                                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#777", gap: 12 }}>
                                                                <span style={{ fontSize: 32 }}>🔌</span>
                                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>Select a database</div>
                                                                <div style={{ fontSize: 12, maxWidth: 380, textAlign: "center", color: "#777" }}>
                                                                    Choose a database on &quot;Demo&quot; from the selector in the top-right to start writing SQL.
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Active Editor & Results — shows once dbSelected */
                                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

                                                                {/* SQL QUERY section header — a separate bar
                                                                    above the editor, not a corner overlay
                                                                    inside it, matching the reference. */}
                                                                <div
                                                                    style={{
                                                                        height: 26,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        padding: "0 12px",
                                                                        background: "#1c1c1c",
                                                                        borderBottom: "1px solid #2d2d2d",
                                                                        fontSize: 10.5,
                                                                        color: "#888",
                                                                        fontWeight: 600,
                                                                        letterSpacing: "0.04em",
                                                                    }}
                                                                >
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
                                                                            <path d="M8 9h8M8 13h5" strokeLinecap="round" />
                                                                        </svg>
                                                                        SQL QUERY
                                                                    </span>
                                                                    <span>
                                                                        {s <= 31
                                                                            ? "0 lines · 0 chars"
                                                                            : s === 53
                                                                              ? "3 lines · 102 chars"
                                                                              : s >= 54
                                                                                ? "6 lines · 156 chars"
                                                                                : "1 line · 97 chars"}
                                                                    </span>
                                                                </div>

                                                                {/* Monaco SQL Editor. Before Run (no results
                                                                    panel below yet), it fills the whole
                                                                    remaining stage — the reference shows a
                                                                    tall, mostly-empty editor at this point,
                                                                    not a fixed-height box floating over dead
                                                                    space. Once results exist (step 40+) it
                                                                    settles to a fixed height so the results
                                                                    grid has real room too — every reference
                                                                    screenshot with results still shows a
                                                                    full-size editor above them, never a
                                                                    shrunk one. */}
                                                                <div
                                                                    ref={set("monacoSqlEditor")}
                                                                    style={{
                                                                        height: s >= 40 ? 360 : undefined,
                                                                        flex: s >= 40 ? "none" : 1,
                                                                        background: "#1e1e1e",
                                                                        padding: "12px 16px",
                                                                        fontFamily: "ui-monospace, monospace",
                                                                        fontSize: 13,
                                                                        position: "relative",
                                                                        borderBottom: "1px solid #2d2d2d",
                                                                        transition: "height 0.3s ease",
                                                                    }}
                                                                >
                                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                                        {/* Line 1 — the original first query. Once
                                                                            the SQL Snippets flow starts (step 51+)
                                                                            this line stays put; the reference
                                                                            composes the SECOND query below it on
                                                                            its own new lines rather than replacing
                                                                            it, so both queries are visible at once
                                                                            (matching the "Query 1" tab holding a
                                                                            multi-statement buffer). */}
                                                                        <div style={{ display: "flex", gap: 16 }}>
                                                                            <div style={{ color: "#555", width: 14, flexShrink: 0 }}>1</div>
                                                                            <div style={{ color: "#d4d4d4", flex: 1, whiteSpace: "pre-wrap" }}>
                                                                                {s === 31 && (
                                                                                    <span style={{ color: "#6a6a6a", fontStyle: "italic" }}>Write SQL statements...</span>
                                                                                )}
                                                                                {s === 32 && <span>s</span>}
                                                                                {s === 33 && <KW>SELECT</KW>}
                                                                                {s === 34 && (
                                                                                    <span>
                                                                                        <KW>SELECT</KW> *
                                                                                    </span>
                                                                                )}
                                                                                {s === 35 && (
                                                                                    <span>
                                                                                        <KW>SELECT</KW> * <KW>FROM</KW>
                                                                                    </span>
                                                                                )}
                                                                                {s === 36 && (
                                                                                    <span>
                                                                                        <KW>SELECT</KW> * <KW>FROM</KW> customers
                                                                                    </span>
                                                                                )}
                                                                                {s === 37 && (
                                                                                    <span>
                                                                                        <KW>SELECT</KW> * <KW>FROM</KW> customers <KW>LEFT JOIN</KW>
                                                                                    </span>
                                                                                )}
                                                                                {s >= 38 && (
                                                                                    <span>
                                                                                        <KW>SELECT</KW> * <KW>FROM</KW> customers <KW>LEFT JOIN</KW> payments <KW>ON</KW> payments.customerNumber = customers.customerNumber;
                                                                                    </span>
                                                                                )}
                                                                                {s < 53 && <span style={{ borderLeft: "2px solid #0078d4", marginLeft: 2 }} />}
                                                                            </div>
                                                                        </div>

                                                                        {s >= 53 && (
                                                                            <>
                                                                                <div style={{ display: "flex", gap: 16 }}>
                                                                                    <div style={{ color: "#555", width: 14, flexShrink: 0 }}>2</div>
                                                                                    <div style={{ flex: 1 }}>&nbsp;</div>
                                                                                </div>

                                                                                {s === 53 ? (
                                                                                    /* Typing "top" — this is what
                                                                                       actually triggers the snippet
                                                                                       autocomplete below, not a search
                                                                                       box inside the side panel. */
                                                                                    <div style={{ display: "flex", gap: 16 }}>
                                                                                        <div style={{ color: "#555", width: 14, flexShrink: 0 }}>3</div>
                                                                                        <div style={{ color: "#d4d4d4", flex: 1 }}>
                                                                                            top
                                                                                            <span style={{ borderLeft: "2px solid #0078d4", marginLeft: 2 }} />
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <div style={{ display: "flex", gap: 16 }}>
                                                                                            <div style={{ color: "#555", width: 14, flexShrink: 0 }}>3</div>
                                                                                            <div style={{ color: "#d4d4d4", flex: 1 }}>
                                                                                                <KW>SELECT</KW> *
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style={{ display: "flex", gap: 16 }}>
                                                                                            <div style={{ color: "#555", width: 14, flexShrink: 0 }}>4</div>
                                                                                            <div style={{ color: "#d4d4d4", flex: 1 }}>
                                                                                                <KW>FROM</KW> {s <= 55 ? SECOND_EDIT_TABLE_BEFORE : s === 56 ? secondEditTable : SECOND_EDIT_TABLE_AFTER}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style={{ display: "flex", gap: 16 }}>
                                                                                            <div style={{ color: "#555", width: 14, flexShrink: 0 }}>5</div>
                                                                                            <div style={{ color: "#d4d4d4", flex: 1 }}>
                                                                                                <KW>ORDER BY</KW> {s <= 55 ? SECOND_EDIT_ORDERCOL_BEFORE : s === 56 ? secondEditOrderCol : SECOND_EDIT_ORDERCOL_AFTER} <KW>DESC</KW>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style={{ display: "flex", gap: 16 }}>
                                                                                            <div style={{ color: "#555", width: 14, flexShrink: 0 }}>6</div>
                                                                                            <div style={{ color: "#d4d4d4", flex: 1 }}>
                                                                                                <KW>LIMIT</KW> 10;
                                                                                                {s >= 56 && <span style={{ borderLeft: "2px solid #0078d4", marginLeft: 2 }} />}
                                                                                            </div>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* Snippet Autocomplete — a single wide row
                                                                        (title + description inline), not the
                                                                        two-pane keyword popup below: matches the
                                                                        reference's distinct "text snippet" style
                                                                        suggestion. */}
                                                                    {s === 53 && (
                                                                        <div
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: 78,
                                                                                left: 30,
                                                                                width: 460,
                                                                                background: "#252526",
                                                                                border: "1px solid #0078d4",
                                                                                borderRadius: 4,
                                                                                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                                                                                padding: "4px 8px",
                                                                                fontSize: 12,
                                                                                display: "flex",
                                                                                alignItems: "baseline",
                                                                                gap: 8,
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                zIndex: 40,
                                                                            }}
                                                                        >
                                                                            <span style={{ color: "#c586c0", fontSize: 10, flexShrink: 0 }}>abc</span>
                                                                            <span style={{ color: "#fff", fontWeight: 700, flexShrink: 0 }}>Top 10 newest rows</span>
                                                                            <span style={{ color: "#888", textOverflow: "ellipsis", overflow: "hidden" }}>
                                                                                Quick peek at the latest data in a table. Swap my_table / cr…
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* IntelliSense Autocomplete Popup — two-pane, matching the
                                                                        reference screenshots: a suggestion list on the left,
                                                                        a detail card for the highlighted entry on the right. */}
                                                                    {s === 32 && (
                                                                        <AutocompletePopup
                                                                            items={[
                                                                                { label: "SELECT", hint: "Keyword", active: true },
                                                                                { label: "SELECT * snippet", hint: "" },
                                                                                { label: "SELECT COUNT snippet", hint: "" },
                                                                            ]}
                                                                            detailTitle="SELECT"
                                                                            detailBody="Choose the columns/expressions to return."
                                                                        />
                                                                    )}
                                                                    {s === 33 && (
                                                                        <AutocompletePopup
                                                                            items={[
                                                                                { label: "*", active: true },
                                                                                { label: "DISTINCT" },
                                                                                { label: "ALL" },
                                                                                { label: "CASE" },
                                                                                { label: "FROM" },
                                                                                { label: "COUNT", hint: "aggregate" },
                                                                                { label: "SUM", hint: "aggregate" },
                                                                            ]}
                                                                        />
                                                                    )}
                                                                    {s === 34 && (
                                                                        <AutocompletePopup
                                                                            items={[{ label: "FROM", hint: "Keyword", active: true }]}
                                                                            detailTitle="FROM"
                                                                            detailBody="The table(s) the rows come from."
                                                                        />
                                                                    )}
                                                                    {s === 35 && (
                                                                        <AutocompletePopup
                                                                            items={[
                                                                                { label: "customers", hint: "table", active: true },
                                                                                { label: "employees", hint: "table" },
                                                                                { label: "offices", hint: "table" },
                                                                                { label: "orderdetails", hint: "table" },
                                                                                { label: "orders", hint: "table" },
                                                                                { label: "payments", hint: "table" },
                                                                                { label: "productlines", hint: "table" },
                                                                            ]}
                                                                            detailTitle="customers"
                                                                            detailBody="table"
                                                                        />
                                                                    )}
                                                                    {s === 36 && (
                                                                        <AutocompletePopup
                                                                            items={[
                                                                                { label: "WHERE" },
                                                                                { label: "JOIN" },
                                                                                { label: "LEFT JOIN", active: true },
                                                                                { label: "INNER JOIN" },
                                                                                { label: "RIGHT JOIN" },
                                                                                { label: "GROUP BY" },
                                                                                { label: "ORDER BY" },
                                                                            ]}
                                                                            detailTitle="LEFT JOIN"
                                                                            detailBody="Keep all left rows; NULLs where the right side has no match."
                                                                        />
                                                                    )}
                                                                    {s === 37 && (
                                                                        <AutocompletePopup
                                                                            items={[
                                                                                { label: "employees", hint: "FK" },
                                                                                { label: "payments", hint: "FK", active: true },
                                                                                { label: "orders", hint: "FK" },
                                                                                { label: "employees", hint: "table" },
                                                                                { label: "offices", hint: "table" },
                                                                            ]}
                                                                            detailTitle="payments (FK)"
                                                                            detailBody="payments.customerNumber → customers.customerNumber"
                                                                        />
                                                                    )}

                                                                    {/* Step 56 retargets the second query's table,
                                                                        then its ORDER BY column — same two-pane
                                                                        autocomplete as the first query's build-up
                                                                        above, just anchored under lines 4 and 5
                                                                        instead of line 1. Only once the old value
                                                                        has fully backspaced out AND the first new
                                                                        character has been typed — a real editor's
                                                                        autocomplete doesn't appear mid-delete, only
                                                                        once there's a fresh prefix to match against.
                                                                        A string is "the first new character(s)
                                                                        typed" here if it's a non-empty proper
                                                                        prefix of the AFTER value — the delete
                                                                        phase's strings are all prefixes of BEFORE
                                                                        instead, so this can't fire early. */}
                                                                    {s === 56 && secondEditTable.length > 0 && secondEditTable !== SECOND_EDIT_TABLE_AFTER && SECOND_EDIT_TABLE_AFTER.startsWith(secondEditTable) && (
                                                                        <AutocompletePopup
                                                                            top={100}
                                                                            left={30}
                                                                            items={[
                                                                                { label: "orderdetails", hint: "table", active: true },
                                                                                { label: "orders", hint: "table" },
                                                                                { label: "orderdetails o", hint: "alias o" },
                                                                                { label: "orders o", hint: "alias o" },
                                                                            ]}
                                                                            detailTitle="orderdetails"
                                                                            detailBody="table"
                                                                        />
                                                                    )}
                                                                    {s === 56 && secondEditOrderCol.length > 0 && secondEditOrderCol !== SECOND_EDIT_ORDERCOL_AFTER && SECOND_EDIT_ORDERCOL_AFTER.startsWith(secondEditOrderCol) && (
                                                                        <AutocompletePopup
                                                                            top={122}
                                                                            left={30}
                                                                            items={[
                                                                                { label: "orderNumber", hint: "int · PK", active: true },
                                                                                { label: "productCode", hint: "varchar(15) · PK" },
                                                                                { label: "quantityOrdered", hint: "int" },
                                                                                { label: "priceEach", hint: "decimal(10,2)" },
                                                                                { label: "orderLineNumber", hint: "smallint" },
                                                                            ]}
                                                                            detailTitle="orderdetails.orderNumber"
                                                                            detailBody="int · NOT NULL · PRIMARY KEY · FK → orders.orderNumber"
                                                                        />
                                                                    )}
                                                                </div>

                                                                {/* Results Grid Stage (Step 40+) */}
                                                                {s >= 40 && (
                                                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#181818", minHeight: 0 }}>
                                                                        <div style={{ height: 30, background: "#222", borderBottom: "1px solid #2d2d2d", display: "flex", alignItems: "center", padding: "0 12px", gap: 12, fontSize: 11 }}>
                                                                            <span style={{ background: "#059669", color: "#fff", padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>OK</span>
                                                                            <span style={{ color: "#aaa" }}>{s >= 58 ? "10 rows • 5ms" : "297 rows 17 cols • 9ms"}</span>
                                                                            <div
                                                                                ref={set("visualizeBarBtn")}
                                                                                style={{
                                                                                    marginLeft: "auto",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: 4,
                                                                                    background: s >= 60 ? "#0078d4" : "#2c2c2c",
                                                                                    color: "#fff",
                                                                                    padding: "2px 8px",
                                                                                    borderRadius: 4,
                                                                                    cursor: "pointer",
                                                                                    fontSize: 11,
                                                                                }}
                                                                            >
                                                                                <span>📊</span> Visualize
                                                                            </div>
                                                                        </div>

                                                                        <div style={{ flex: 1, overflow: "auto" }}>
                                                                            {s >= 58 ? (
                                                                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, textAlign: "left" }}>
                                                                                    <thead>
                                                                                        <tr style={{ background: "#252526", borderBottom: "1px solid #333", color: "#888" }}>
                                                                                            <th style={{ padding: "6px 10px", width: 30 }}>#</th>
                                                                                            <th style={{ padding: "6px 10px" }}>orderNumber</th>
                                                                                            <th style={{ padding: "6px 10px" }}>productCode</th>
                                                                                            <th style={{ padding: "6px 10px" }}>quantityOrdered</th>
                                                                                            <th style={{ padding: "6px 10px" }}>priceEach</th>
                                                                                            <th style={{ padding: "6px 10px" }}>orderLineNumber</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {[
                                                                                            [1, "10425", "S10_1678", "33", "$95.70", "1"],
                                                                                            [2, "10425", "S12_1099", "50", "$100.00", "2"],
                                                                                            [3, "10424", "S18_2238", "28", "$68.44", "1"],
                                                                                            [4, "10424", "S24_3856", "41", "$120.50", "2"],
                                                                                            [5, "10423", "S32_1268", "24", "$83.79", "1"],
                                                                                            [6, "10423", "S32_2509", "11", "$50.32", "2"],
                                                                                            [7, "10422", "S24_2300", "49", "$127.79", "1"],
                                                                                            [8, "10422", "S24_1444", "55", "$53.75", "2"],
                                                                                            [9, "10421", "S18_2795", "26", "$167.06", "1"],
                                                                                            [10, "10421", "S700_3167", "24", "$68.80", "2"],
                                                                                        ].map(([r, c1, c2, c3, c4, c5]) => (
                                                                                            <tr key={r} style={{ borderBottom: "1px solid #222" }}>
                                                                                                <td style={{ padding: "6px 10px", color: "#666" }}>{r}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#70baff" }}>{c1}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#ddd" }}>{c2}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c3}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#34d399" }}>{c4}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c5}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            ) : (
                                                                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, textAlign: "left" }}>
                                                                                    <thead>
                                                                                        <tr style={{ background: "#252526", borderBottom: "1px solid #333", color: "#888" }}>
                                                                                            <th style={{ padding: "6px 10px", width: 30 }}>#</th>
                                                                                            <th style={{ padding: "6px 10px" }}>customerNumber</th>
                                                                                            <th style={{ padding: "6px 10px" }}>customerName</th>
                                                                                            <th style={{ padding: "6px 10px" }}>contactLastName</th>
                                                                                            <th style={{ padding: "6px 10px" }}>contactFirstName</th>
                                                                                            <th style={{ padding: "6px 10px" }}>phone</th>
                                                                                            <th style={{ padding: "6px 10px" }}>addressLine1</th>
                                                                                            <th style={{ padding: "6px 10px" }}>addressLine2</th>
                                                                                            <th style={{ padding: "6px 10px" }}>city</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {/* A real LEFT JOIN repeats a customer once per
                                                                                            matching payment row — the reference shows the
                                                                                            first customer 3x and the second 2x before
                                                                                            settling into single rows, so this mirrors
                                                                                            that instead of a flat, suspiciously-unique
                                                                                            list of 297 "customers". All 8 CUST fields are
                                                                                            shown as columns, matching the reference's
                                                                                            actual column set (not just 4 of them). */}
                                                                                        {CUST.flatMap((c, i) => {
                                                                                            const repeats = i === 0 ? 3 : i === 1 ? 2 : 1;
                                                                                            return Array.from({ length: repeats }, () => c);
                                                                                        }).map((c, i) => (
                                                                                            <tr key={i} style={{ borderBottom: "1px solid #222" }}>
                                                                                                <td style={{ padding: "6px 10px", color: "#666" }}>{i + 1}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#70baff" }}>{c[0]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#ddd" }}>{c[1]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c[2]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#34d399" }}>{c[3]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c[4]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c[5]}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#666", fontStyle: "italic" }}>{c[6] || "NULL"}</td>
                                                                                                <td style={{ padding: "6px 10px", color: "#aaa" }}>{c[7]}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Schema Explorer Drawer (Step 41–42) — a flat
                                                            list of the 8 tables with a search box, a TABLE
                                                            badge, and an Insert action each, matching the
                                                            reference exactly. Not a nested
                                                            connection/database/columns tree — that's a
                                                            different view (the sidebar's own tree already
                                                            covers it). */}
                                                        {/* Step 41 is hover-only (matches the reference's
                                                            "hover schema explorer" tooltip screenshot, no
                                                            drawer yet) — TARGETS[41,42] share the same icon,
                                                            so the cursor already gets all of step 41 to
                                                            arrive; the drawer only opens on 42's click. */}
                                                        {s === 42 && (
                                                            <div style={{ width: 320, background: "#222222", borderLeft: "1px solid #2d2d2d", padding: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5 }}>
                                                                <div style={{ fontWeight: 700, color: "#fff" }}>Schema Explorer</div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "#1c1c1c", border: "1px solid #3c3c3c", borderRadius: 4, color: "#666" }}>
                                                                    <span>⌕</span>
                                                                    <span style={{ fontSize: 11 }}>Search tables or columns...</span>
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                                    {TABLES.map(t => (
                                                                        <div
                                                                            key={t[0]}
                                                                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", borderBottom: "1px solid #2a2a2a" }}
                                                                        >
                                                                            <span style={{ color: "#666", fontSize: 9 }}>›</span>
                                                                            <span style={{ color: "#ddd", flex: 1 }}>{t[0]}</span>
                                                                            <span style={{ color: "#666", fontSize: 9, letterSpacing: "0.05em" }}>TABLE</span>
                                                                            <span style={{ color: "#70baff", fontSize: 10.5, cursor: "pointer" }}>Insert</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Local History Side Panel — a handful of varied
                                                            entries (SELECT/UPDATE/INSERT, success and
                                                            failure), matching the reference's populated
                                                            panel rather than a single row. Same hover(43)/
                                                            click(44) split as Schema Explorer above — opens
                                                            on the click step only. */}
                                                        {s === 44 && (
                                                            <div style={{ width: 300, background: "#222222", borderLeft: "1px solid #2d2d2d", padding: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 11, overflow: "auto" }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: 600 }}>
                                                                    <span>Local History</span>
                                                                    <span style={{ display: "flex", gap: 10 }}>
                                                                        <span style={{ color: "#888", fontSize: 11, cursor: "pointer" }}>Clear</span>
                                                                        <span style={{ color: "#888", fontSize: 11, cursor: "pointer" }}>Close</span>
                                                                    </span>
                                                                </div>
                                                                {[
                                                                    { kind: "SELECT", ok: true, time: "10/08/2026, 20:14:02", sql: "SELECT * FROM customers LEFT JOIN payments...", meta: "297 rows • 8ms" },
                                                                    { kind: "UPDATE", ok: true, time: "10/08/2026, 20:11:59", sql: "UPDATE `classicmodels`.`customers` SET `ph...", meta: "1 rows • 2ms" },
                                                                    { kind: "UPDATE", ok: true, time: "10/08/2026, 20:11:59", sql: "UPDATE `classicmodels`.`customers` SET `ph...", meta: "1 rows • 3ms" },
                                                                    { kind: "SELECT", ok: true, time: "10/08/2026, 19:46:04", sql: "SELECT * FROM customers LEFT JOIN payments...", meta: "297 rows • 9ms" },
                                                                    { kind: "SELECT", ok: true, time: "10/08/2026, 19:39:56", sql: "SELECT * FROM customers LEFT JOIN employee...", meta: "122 rows • 11ms" },
                                                                    { kind: "INSERT", ok: false, time: "28/07/2026, 21:59:17", sql: "INSERT INTO `classicmodels`.`customers` (`...", meta: "Field 'customerNumber' doesn't have a default value" },
                                                                ].map((h, i) => (
                                                                    <div key={i} style={{ padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4 }}>
                                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                            <span style={{ color: h.ok ? "#70baff" : "#f87171", fontWeight: 700, fontSize: 10 }}>
                                                                                {h.kind} {h.ok ? "✓" : "✕"}
                                                                            </span>
                                                                            <span style={{ color: "#666", fontSize: 9.5 }}>{h.time}</span>
                                                                        </div>
                                                                        <div style={{ color: "#fff", marginTop: 4, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.sql}</div>
                                                                        <div style={{ color: h.ok ? "#666" : "#f87171", marginTop: 4, fontSize: 10 }}>{h.meta}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Saved Queries Side Panel & Modal — unlike the
                                                            other three right-side panels, TARGETS[45] is
                                                            this icon's ONLY step (no separate hover step
                                                            first), so there's no prior step to have given
                                                            the cursor travel time. Gated on savedPanelOpen
                                                            (frac-based, opens mid-click) instead. */}
                                                        {savedPanelOpen && s <= 50 && (
                                                            <>
                                                                <div style={{ width: 320, background: "#222222", borderLeft: "1px solid #2d2d2d", padding: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5 }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: 600 }}>
                                                                        <span>Saved Queries</span>
                                                                        <span style={{ color: "#70baff", fontSize: 11, cursor: "pointer" }}>Close</span>
                                                                    </div>
                                                                    {s === 50 ? (
                                                                        // Full card — title, the actual SQL, and a
                                                                        // last-updated timestamp, with edit/delete
                                                                        // affordances, matching the reference. Not
                                                                        // just a single starred line.
                                                                        <div style={{ position: "relative", padding: "8px 0" }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                                                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{QUERY_TITLE_AFTER}</div>
                                                                                <div style={{ display: "flex", gap: 8, color: "#888", flexShrink: 0 }}>
                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" strokeLinejoin="round" /></svg>
                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ color: "#70baff", fontFamily: "ui-monospace, monospace", fontSize: 10.5, marginTop: 6, lineHeight: 1.4 }}>
                                                                                SELECT * FROM customers LEFT JOIN payments ON payments.customerNumber = customers.customerNumber;
                                                                            </div>
                                                                            <div style={{ color: "#666", fontSize: 10, marginTop: 6 }}>Updated 10/08/2026, 20:28:39</div>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ color: "#777", fontSize: 11, lineHeight: 1.5, textAlign: "center", marginTop: 8 }}>
                                                                            No saved queries yet. Write a query and hit <span style={{ color: "#ccc", fontWeight: 600 }}>Save</span> to pin it here.
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {saveModalOpen && (
                                                                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
                                                                    <div style={{ width: 440, background: "#252526", border: "1px solid #0078d4", borderRadius: 8, padding: 18, position: "relative" }}>
                                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                                                            <h4 style={{ margin: 0, color: "#fff", fontSize: 13 }}>Update saved query</h4>
                                                                            <span style={{ color: "#888", fontSize: 14, cursor: "pointer", lineHeight: 1 }}>✕</span>
                                                                        </div>
                                                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                                            <label style={{ color: "#999", fontSize: 10.5, fontWeight: 600 }}>Title</label>
                                                                            <input
                                                                                ref={set("queryTitleModalInput")}
                                                                                readOnly
                                                                                value={s === 46 ? QUERY_TITLE_BEFORE : s === 47 ? queryTitleText : QUERY_TITLE_AFTER}
                                                                                style={{ width: "100%", padding: "6px 10px", background: "#1e1e1e", border: "1px solid #0078d4", borderRadius: 4, color: "#fff", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}
                                                                            />
                                                                            <div style={{ color: "#777", fontSize: 10.5, marginTop: 2 }}>
                                                                                Updates the existing entry. Shift-click Save to store a copy instead.
                                                                            </div>
                                                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                                                                                <button style={{ padding: "4px 12px", background: "#333", border: "none", borderRadius: 4, color: "#ccc", fontSize: 11 }}>Cancel</button>
                                                                                <button ref={set("updateQueryModalBtn")} style={{ padding: "4px 14px", background: s >= 49 ? "#0078d4" : "#2a2a2a", border: s >= 49 ? "1px solid #4daafc" : "1px solid #3c3c3c", borderRadius: 4, color: "#fff", fontWeight: 600, fontSize: 11 }}>Update</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* SQL Snippets Side Panel — a full library of
                                                            cards, matching the reference's populated panel
                                                            rather than a single entry. Same hover(51)/
                                                            click(52) split as the other icon-triggered
                                                            panels — opens on the click step, not the hover. */}
                                                        {s >= 52 && s <= 59 && (
                                                            <div style={{ width: 320, background: "#222222", borderLeft: "1px solid #2d2d2d", padding: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5, overflow: "auto" }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", fontWeight: 600 }}>
                                                                    <span>SQL Snippets</span>
                                                                    <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                                        <span style={{ color: "#70baff", fontSize: 11, cursor: "pointer" }}>+ Save current query</span>
                                                                        <span ref={set("closeSnippetRightBtn")} style={{ color: "#888", fontSize: 11, cursor: "pointer" }}>Close</span>
                                                                    </span>
                                                                </div>
                                                                {/* No search box here at all — the reference
                                                                    doesn't have one. "Top 10 newest rows" is
                                                                    already the first card, and the "top" typing
                                                                    that finds it happens in the editor itself
                                                                    (step 53, see monacoSqlEditor), not in a
                                                                    filter field inside this panel. */}
                                                                <div
                                                                    ref={set("snippetCardItem")}
                                                                    style={{ padding: 10, background: s >= 54 ? "rgba(0,120,212,0.2)" : "#1c1c1c", border: "1px solid #0078d4", borderRadius: 4, cursor: "pointer" }}
                                                                >
                                                                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 11 }}>Top 10 newest rows</div>
                                                                    <div style={{ color: "#888", fontSize: 10, marginTop: 3 }}>Quick peek at the latest data in a table. Swap my_table / created_at for yours.</div>
                                                                    <div style={{ color: "#70baff", fontSize: 10, marginTop: 4 }}>SELECT * FROM my_table ORDER BY created_at DESC LIMIT 10;</div>
                                                                </div>
                                                                {[
                                                                    { title: "Count rows per group", desc: "How many rows share each value — great for status/category columns.", sql: "SELECT status, COUNT(*) AS row_count FROM orders GROUP BY status ORDER BY row_count DESC;" },
                                                                    { title: "Find duplicate values", desc: "Rows whose email appears more than once. Change the column to any that should be unique.", sql: "SELECT email, COUNT(*) AS times FROM users GROUP BY email HAVING COUNT(*) > 1 ORDER BY times D…" },
                                                                    { title: "Join two tables", desc: "Orders with their customer's name — the basic FK join pattern.", sql: "SELECT o.id, o.total, c.name AS customer FROM orders o JOIN customers c ON c.id = o.customer_i…" },
                                                                    { title: "Monthly totals", desc: "Revenue per month. MySQL: DATE_FORMAT · Postgres: TO_CHAR(created_at, 'YYYY-MM') · SQLite: strftime('%Y-%m', created_at).", sql: "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total) AS revenue FROM orders GROUP BY m…" },
                                                                    { title: "NULL audit for a column", desc: "How many rows are missing a value — COUNT(col) skips NULLs, COUNT(*) doesn't.", sql: "SELECT COUNT(*) AS total_rows, COUNT(email) AS with_email, COUNT(*) - COUNT(email) AS null_ema…" },
                                                                    { title: "Running total (window function)", desc: "Cumulative sum over time without a self-join. Works on MySQL 8+, Postgres, SQLite 3.25+.", sql: "SELECT id, created_at, total, SUM(total) OVER (ORDER BY created_at) AS running_total FROM orde…" },
                                                                ].map((snip, i) => (
                                                                    <div key={i} style={{ padding: 10, background: "#1c1c1c", border: "1px solid #333", borderRadius: 4, cursor: "pointer" }}>
                                                                        <div style={{ color: "#fff", fontWeight: 600, fontSize: 11 }}>{snip.title}</div>
                                                                        <div style={{ color: "#888", fontSize: 10, marginTop: 3 }}>{snip.desc}</div>
                                                                        <div style={{ color: "#70baff", fontSize: 10, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{snip.sql}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Webview Far Right Vertical Icon Bar — flat
                                                            outline icons (table grid / clock / star /
                                                            clipboard), matching the reference. Placed last
                                                            in this flex row (not before the panels) so it
                                                            stays pinned to the true right edge — a drawer
                                                            opening pushes in to its LEFT, it never gets
                                                            shoved off the edge by the panel appearing. */}
                                                        <div style={{ width: 36, background: "#1c1c1c", borderLeft: "1px solid #2d2d2d", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 14 }}>
                                                            <div ref={set("schemaExpRightIcon")} title="Schema Explorer" style={{ color: s === 41 || s === 42 ? "#70baff" : "#888", cursor: "pointer" }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                                    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                                                                    <path d="M3.5 9.5h17M9 9.5v10M15 9.5v10" />
                                                                </svg>
                                                            </div>
                                                            <div ref={set("queryHistoryRightIcon")} title="Query History" style={{ color: s === 43 || s === 44 ? "#70baff" : "#888", cursor: "pointer" }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                                    <circle cx="12" cy="12" r="8.5" />
                                                                    <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                            <div ref={set("savedQueriesRightIcon")} title="Saved Queries" style={{ color: s >= 45 && s <= 50 ? "#70baff" : "#888", cursor: "pointer" }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                                    <path d="M12 3.5l2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                            <div ref={set("sqlSnippetsRightIcon")} title="SQL Snippets" style={{ color: s >= 51 && s <= 59 ? "#70baff" : "#888", cursor: "pointer" }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                                    <path d="M7 4.5h8.5L19 8v11.5a1 1 0 01-1 1H7a1 1 0 01-1-1v-14a1 1 0 011-1z" strokeLinejoin="round" />
                                                                    <path d="M15 4.5V8h4" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 60-61: QuickDB Visualization Full View (Image 41) */}
                                            {s >= 60 && (
                                                <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#141418" }}>
                                                    
                                                    {/* Left Controls Panel */}
                                                    <div style={{ width: 280, background: "#1c1c22", borderRight: "1px solid #2d2d35", padding: 16, display: "flex", flexDirection: "column", gap: 16, fontSize: 11.5 }}>
                                                        <div>
                                                            <div style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>CHART TYPE</div>
                                                            <div style={{ padding: "6px 10px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#fff", marginTop: 6 }}>
                                                                XY CHART Line
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>AXES & GROUPING</div>
                                                            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                                                                <div style={{ padding: "6px 10px", background: "#252530", borderRadius: 4, color: "#70baff" }}>
                                                                    X: productCode <span style={{ color: "#34d399", float: "right" }}>STR</span>
                                                                </div>
                                                                <div style={{ padding: "6px 10px", background: "#252530", borderRadius: 4, color: "#70baff" }}>
                                                                    Y: orderLineNumber <span style={{ color: "#f59e0b", float: "right" }}>NUM</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Preview Canvas SVG */}
                                                    <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16, background: "#0e0e12" }}>
                                                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>SELECT * FROM orderdetails ORDER BY orderNumber DESC LIMIT 1</div>
                                                        <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 20, position: "relative" }}>
                                                            <svg width="100%" height="100%" viewBox="0 0 700 240" preserveAspectRatio="none">
                                                                <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.05)" />
                                                                <line x1="0" y1="90" x2="700" y2="90" stroke="rgba(255,255,255,0.05)" />
                                                                <line x1="0" y1="140" x2="700" y2="140" stroke="rgba(255,255,255,0.05)" />
                                                                <polyline
                                                                    fill="none"
                                                                    stroke="#0078d4"
                                                                    strokeWidth="2.5"
                                                                    points="0,180 70,140 140,40 210,120 280,70 350,190 420,30 490,90 560,60 630,90 700,120"
                                                                />
                                                                {[[0,180],[70,140],[140,40],[210,120],[280,70],[350,190],[420,30],[490,90],[560,60],[630,90],[700,120]].map(([x,y],i) => (
                                                                    <circle key={i} cx={x} cy={y} r="4" fill="#0078d4" stroke="#fff" strokeWidth="1.5" />
                                                                ))}
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {grid && (
                                    <div
                                        style={{
                                            flex: 1,
                                            minHeight: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <GridToolbar
                                            changes={changes}
                                            hasEditHistory={hasEditHistory}
                                            pasteActive={pastePanel}
                                            pasteBtnRef={set("pasteBtn")}
                                            saveBtnRef={set("saveBtn")}
                                            undoBtnRef={set("undoBtn")}
                                        />
                                        <FilterBar
                                            filterOn={pay}
                                            filterValRef={set("filterVal")}
                                        />

                                        <div
                                            ref={set("gridWrap")}
                                            style={{
                                                flex: 1,
                                                minHeight: 0,
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {!pay && (
                                                <div>
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns:
                                                                CELL_COLS,
                                                            height: 34,
                                                            background:
                                                                C.raised,
                                                            borderBottom: `1px solid ${C.line2}`,
                                                            fontSize: 12.5,
                                                            color: C.textDim,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                borderRight: `1px solid ${C.line2}`,
                                                                color: C.faint,
                                                            }}
                                                        >
                                                            #
                                                        </div>
                                                        <div style={th}>
                                                            {typeTag(
                                                                "#0b3a5e",
                                                                C.bluePale,
                                                                "123",
                                                            )}
                                                            {key}customerNumber
                                                            {colMenu}
                                                        </div>
                                                        {[
                                                            "customerName",
                                                            "contactLastName",
                                                            "contactFirstName",
                                                        ].map(h => (
                                                            <div
                                                                key={h}
                                                                style={th}
                                                            >
                                                                {typeTag(
                                                                    "#2f3a2a",
                                                                    C.green,
                                                                    "Aa",
                                                                )}
                                                                {h}
                                                                {colMenu}
                                                            </div>
                                                        ))}
                                                        <div style={th}>
                                                            {typeTag(
                                                                "#2f3a2a",
                                                                C.green,
                                                                "Aa",
                                                            )}
                                                            phone{colMenu}
                                                        </div>
                                                        {[
                                                            "addressLine1",
                                                            "addressLine2",
                                                        ].map(h => (
                                                            <div
                                                                key={h}
                                                                style={th}
                                                            >
                                                                {typeTag(
                                                                    "#2f3a2a",
                                                                    C.green,
                                                                    "Aa",
                                                                )}
                                                                {h}
                                                                {colMenu}
                                                            </div>
                                                        ))}
                                                        <div
                                                            style={{
                                                                ...th,
                                                                borderRight:
                                                                    "none",
                                                            }}
                                                        >
                                                            {typeTag(
                                                                "#2f3a2a",
                                                                C.green,
                                                                "Aa",
                                                            )}
                                                            city
                                                        </div>
                                                    </div>
                                                    {rows.map((r, i) => (
                                                        <div
                                                            className="qd-row"
                                                            key={`${r.num}-${i}`}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns:
                                                                    CELL_COLS,
                                                                height: 31,
                                                                borderBottom: `1px solid ${C.rowLine}`,
                                                                fontSize: 12.5,
                                                                color: C.cell,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    borderRight: `1px solid ${C.rowLine}`,
                                                                    color: C.faint,
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {r.i}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    ...td,
                                                                    fontWeight: 600,
                                                                    color: r.isNewId
                                                                        ? "#7ee787"
                                                                        : C.textStrong,
                                                                }}
                                                            >
                                                                {r.num}
                                                            </div>
                                                            <div style={td}>
                                                                {r.name}
                                                            </div>
                                                            <div
                                                                ref={
                                                                    r.lastRef
                                                                        ? set(
                                                                              r.lastRef as RefKey,
                                                                          )
                                                                        : undefined
                                                                }
                                                                style={{
                                                                    ...td,
                                                                    background:
                                                                        r.lastFocused
                                                                            ? C.raised
                                                                            : r.lastBg,
                                                                    color: r.lastFg,
                                                                    // inset shadow, not border: a real border would grow
                                                                    // the box and shove every cell after it sideways for
                                                                    // as long as phase 1 runs.
                                                                    boxShadow:
                                                                        r.lastFocused
                                                                            ? `inset 0 0 0 1.5px ${C.blueLight}`
                                                                            : "none",
                                                                }}
                                                            >
                                                                {r.last}
                                                                {r.lastFocused && (
                                                                    <Caret />
                                                                )}
                                                            </div>
                                                            <div style={td}>
                                                                {r.first}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    ...td,
                                                                    background:
                                                                        r.phoneBg,
                                                                    color: r.phoneFg,
                                                                }}
                                                            >
                                                                {r.phone}
                                                            </div>
                                                            <div style={td}>
                                                                {r.a1}
                                                            </div>
                                                            <div style={td}>
                                                                {r.a2}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    ...td,
                                                                    borderRight:
                                                                        "none",
                                                                }}
                                                            >
                                                                {r.city}
                                                            </div>
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
                                                        background:
                                                            "rgba(0,120,212,.07)",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            left: 0,
                                                            right: 0,
                                                            top: 0,
                                                            height: 29,
                                                            background:
                                                                "rgba(0,120,212,.16)",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            right: 6,
                                                            bottom: 7,
                                                            fontSize: 12,
                                                            color: C.muted,
                                                        }}
                                                    >
                                                        ⧉
                                                    </div>
                                                    <Handle
                                                        style={{
                                                            left: -4,
                                                            top: -4,
                                                        }}
                                                    />
                                                    <Handle
                                                        style={{
                                                            right: -4,
                                                            top: -4,
                                                        }}
                                                    />
                                                    <Handle
                                                        style={{
                                                            left: -4,
                                                            bottom: -4,
                                                        }}
                                                    />
                                                    <Handle
                                                        style={{
                                                            right: -4,
                                                            bottom: -4,
                                                            width: 8,
                                                            height: 8,
                                                            borderColor: "#fff",
                                                        }}
                                                    />
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
                                                        boxShadow:
                                                            "0 4px 12px rgba(0,0,0,.55)",
                                                        pointerEvents: "none",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {selN} cells · ⌘C copies as
                                                    TSV
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
                                                        boxShadow:
                                                            "0 4px 12px rgba(0,0,0,.55)",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    40.32.2555 → 4 cells
                                                </div>
                                            )}

                                            {s === 13 && (
                                                <ForeignKeyPopover
                                                    chipRef={set("fkChip")}
                                                    rowRef={set("fkRow")}
                                                    open={pastClick}
                                                />
                                            )}
                                            {pastePanel && (
                                                <PastePanel
                                                    filled={
                                                        s > 17 ||
                                                        (s === 17 && pastClick)
                                                    }
                                                    hoverImport={
                                                        s === 18 && pastHover
                                                    }
                                                    pasteAreaRef={set(
                                                        "pasteArea",
                                                    )}
                                                    importBtnRef={set(
                                                        "importBtn",
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <Pagination
                                            showing={
                                                pay
                                                    ? "Showing 1-4 of 4"
                                                    : tail
                                                      ? "Showing 113-129 of 129"
                                                      : "Showing 1-27 of 122"
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
                                        transition:
                                            "opacity .3s ease, transform .3s cubic-bezier(.22,1,.36,1)",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <span style={{ color: C.blueLight }}>
                                        ⓘ
                                    </span>
                                    <span ref={set("toastText")}>
                                        Connection &quot;Demo&quot; added.
                                    </span>
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            display: "flex",
                                            gap: 12,
                                            color: C.muted,
                                        }}
                                    >
                                        ⚙ ⌃ ✕
                                    </span>
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
                            {s >= 8 && (
                                <span style={{ color: "#8ef0a8" }}>
                                    ● QuickDB · Demo
                                </span>
                            )}
                            <span
                                style={{
                                    marginLeft: "auto",
                                    display: "flex",
                                    gap: 16,
                                }}
                            >
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
                                // Has to outrank every overlay it might need to
                                // "click" through, including the save-query
                                // modal's zIndex:60 backdrop — otherwise the
                                // cursor glides to the right spot but renders
                                // underneath the modal, invisible right when it
                                // matters most (mid-click on its own button).
                                zIndex: 999,
                            }}
                        >
                            {/* Default Arrow Pointer */}
                            <svg
                                ref={set("curArrow")}
                                height={CURSOR_H}
                                style={{
                                    display: "block",
                                    overflow: "visible",
                                }}
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
                                style={{
                                    display: "none",
                                    overflow: "visible",
                                    transform: "translate(-8px, -2px)",
                                    filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.4))",
                                }}
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
                                <path
                                    d="M 13 8.5 L 13 13"
                                    stroke="#000000"
                                    strokeLinecap="round"
                                    strokeWidth="1.4"
                                />
                                <path
                                    d="M 16.8 10 L 16.8 14"
                                    stroke="#000000"
                                    strokeLinecap="round"
                                    strokeWidth="1.4"
                                />
                                <path
                                    d="M 20.2 11.5 L 20.2 14.5"
                                    stroke="#000000"
                                    strokeLinecap="round"
                                    strokeWidth="1.4"
                                />
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
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: C.blue,
                                }}
                            />
                            QuickDB v{marketplace.version} ·{" "}
                            {formatInstallCount(marketplace.installs)} Installs
                            · {formatInstallCount(marketplace.downloads)}{" "}
                            Downloads
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
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                fontSize: "clamp(13px,1.2vw,16px)",
                                color: C.muted,
                                maxWidth: 540,
                                textWrap: "pretty",
                            }}
                        >
                            Browse and query 80+ engines without leaving the
                            window you already have open.
                        </div>
                        <div
                            className="qd-bob"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 7,
                            }}
                        >
                            <div
                                style={{
                                    font: `400 10.5px ${MONO}`,
                                    letterSpacing: ".14em",
                                    color: C.dark,
                                }}
                            >
                                SCROLL
                            </div>
                            <div
                                style={{
                                    width: 1,
                                    height: 26,
                                    background:
                                        "linear-gradient(180deg,#6f6f6f,transparent)",
                                }}
                            />
                        </div>
                    </div>
                </div>



                {/* ── Quick Feature Navigator Bottom Bar Client Component ── */}
                <QuickDBBottomNav
                    navItems={NAV_ITEMS}
                    jumpToStep={jumpToStep}
                    triggerToast={triggerToast}
                />
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────────────
   Small presentational pieces
   ──────────────────────────────────────────────────────────────── */

const ActIcon: FC<{ children: ReactNode }> = ({ children }) => (
    <div
        style={{
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            color: C.faint,
        }}
    >
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
        >
            {children}
        </svg>
    </div>
);

const DbGlyph: FC<{ size?: number; stroke?: string; full?: boolean }> = ({
    size = 13,
    stroke = C.muted,
    full = false,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
    >
        <ellipse cx="12" cy="6" rx="7" ry="2.6" />
        <path d="M5 6v12c0 1.4 3.13 2.6 7 2.6s7-1.2 7-2.6V6" />
        {full && <path d="M5 12c0 1.4 3.13 2.6 7 2.6s7-1.2 7-2.6" />}
    </svg>
);

/** SQL keyword highlight, used throughout the Query Console's editor snapshots. */
const KW: FC<{ children: ReactNode }> = ({ children }) => (
    <span style={{ color: "#569cd6", fontWeight: 600 }}>{children}</span>
);

/**
 * The two-pane IntelliSense popup used across the query-typing sequence
 * (steps 32-37): a suggestion list on the left, and — when the active item
 * has one — a detail card on the right, matching the real SQL Console's
 * autocomplete chrome in the reference screenshots.
 */
const AutocompletePopup: FC<{
    items: readonly { label: string; hint?: string; active?: boolean }[];
    detailTitle?: string;
    detailBody?: string;
    top?: number;
    left?: number;
}> = ({ items, detailTitle, detailBody, top = 34, left = 120 }) => (
    <div style={{ position: "absolute", top, left, display: "flex", zIndex: 40 }}>
        <div
            style={{
                width: 220,
                maxHeight: 150,
                overflow: "hidden",
                background: "#252526",
                border: "1px solid #0078d4",
                borderRadius: 4,
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                padding: 4,
                fontSize: 12,
            }}
        >
            {items.map((it, i) => (
                <div
                    key={i}
                    style={{
                        padding: "4px 8px",
                        background: it.active ? "#04395e" : "transparent",
                        color: it.active ? "#fff" : "#aaa",
                        borderRadius: 3,
                        display: "flex",
                        gap: 6,
                    }}
                >
                    <span>{it.label}</span>
                    {it.hint && <span style={{ color: it.active ? "#9cc7ea" : "#777" }}>{it.hint}</span>}
                </div>
            ))}
        </div>
        {detailTitle && (
            <div
                style={{
                    width: 260,
                    background: "#252526",
                    border: "1px solid #0078d4",
                    borderLeft: "none",
                    borderRadius: "0 4px 4px 0",
                    padding: "8px 10px",
                    fontSize: 12,
                }}
            >
                <div style={{ color: "#fff", fontWeight: 700 }}>{detailTitle}</div>
                <div style={{ color: "#aaa", marginTop: 4, lineHeight: 1.4 }}>{detailBody}</div>
            </div>
        )}
    </div>
);

const Caret: FC = () => (
    <span
        style={{
            width: 1.5,
            height: 13,
            background: C.blueLight,
            marginLeft: 1,
        }}
    />
);

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
    <div
        style={{
            height: 23,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 10px",
        }}
    >
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

const Tab: FC<{
    active: boolean;
    name: string;
    closeRef?: (el: HTMLElement | null) => void;
}> = ({ active, name, closeRef }) => (
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
        <span
            ref={closeRef}
            style={{
                color: C.muted,
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: 3,
            }}
        >
            ✕
        </span>
    </div>
);

const WelcomePane: FC = () => (
    <div
        style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
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
                style={{
                    width: 200,
                    height: 200,
                    borderRadius: 22,
                    objectFit: "cover",
                }}
            />
        </div>
    </div>
);

const ExtensionPane: FC<{
    step: number;
    installBtnRef: (el: HTMLElement | null) => void;
}> = ({ step, installBtnRef }) => {
    const marketplace = useQuickDBMarketplace();
    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
            }}
        >
            <div style={{ flex: 1, minWidth: 0, padding: "26px 40px 0 34px" }}>
                <div style={{ display: "flex", gap: 26 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt="QuickDB"
                        src="/images/quickdb-logo.png"
                        style={{
                            width: 128,
                            height: 128,
                            flex: "none",
                            borderRadius: 14,
                            objectFit: "cover",
                        }}
                    />
                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 34,
                                fontWeight: 600,
                                letterSpacing: "-.02em",
                                color: C.textStrong,
                            }}
                        >
                            QuickDB
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginTop: 8,
                                fontSize: 13.5,
                                color: "#bbbbbb",
                            }}
                        >
                            <span>Nazmul Haque</span>
                            <span style={{ color: C.muted }}>
                                ⇩ {formatInstallCount(marketplace.installs)}
                            </span>
                            <span style={{ color: C.dark, letterSpacing: 2 }}>
                                ☆☆☆☆☆
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: C.textDim,
                                marginTop: 12,
                            }}
                        >
                            Lightweight database browser for VS Code. Connect to
                            databases, browse tables, and run queries.
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                marginTop: 14,
                            }}
                        >
                            {(step === 3 || step === 4) && (
                                <div
                                    ref={installBtnRef}
                                    style={{
                                        background: C.blue,
                                        color: "#fff",
                                        fontSize: 13,
                                        padding: "5px 14px",
                                        borderRadius: 2,
                                    }}
                                >
                                    Install
                                </div>
                            )}
                            {step === 5 && (
                                <div
                                    style={{
                                        background: "#2a2a2a",
                                        color: C.muted,
                                        fontSize: 13,
                                        padding: "5px 14px",
                                        borderRadius: 2,
                                    }}
                                >
                                    Installing
                                </div>
                            )}
                            {step >= 6 && (
                                <div style={{ display: "flex", gap: 10 }}>
                                    <div
                                        style={{
                                            background: "#2a2a2a",
                                            color: C.text,
                                            fontSize: 13,
                                            padding: "5px 14px",
                                            borderRadius: 2,
                                        }}
                                    >
                                        Disable
                                    </div>
                                    <div
                                        style={{
                                            background: "#2a2a2a",
                                            color: C.text,
                                            fontSize: 13,
                                            padding: "5px 14px",
                                            borderRadius: 2,
                                        }}
                                    >
                                        Uninstall ⌄
                                    </div>
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 13,
                                    color: C.textDim,
                                }}
                            >
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
                            <span style={{ color: C.muted, fontSize: 14 }}>
                                ⚙
                            </span>
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
                            <span
                                style={{
                                    color: C.textStrong,
                                    borderBottom: `2px solid ${C.textStrong}`,
                                    paddingBottom: 8,
                                    marginBottom: -9,
                                }}
                            >
                                DETAILS
                            </span>
                            <span>FEATURES</span>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 26,
                        padding: "0 60px",
                        textAlign: "center",
                    }}
                >
                    {/* The design shipped a separate wordmark PNG here; the mark plus
                    the product name in the page's own display face reads the same
                    at this size without carrying a second near-duplicate asset. */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt=""
                            src="/images/quickdb-logo.png"
                            style={{ width: 30, height: 30, borderRadius: 6 }}
                        />
                        <span
                            style={{
                                fontSize: 26,
                                fontWeight: 700,
                                letterSpacing: "-.03em",
                                color: C.textStrong,
                            }}
                        >
                            QuickDB
                        </span>
                    </div>
                    <div
                        style={{
                            height: 1,
                            background: C.line,
                            margin: "22px 0",
                        }}
                    />
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: C.textStrong,
                        }}
                    >
                        The Ultimate Database Management &amp; AI Integration
                        Platform
                    </div>
                    <div
                        style={{
                            fontSize: 13.5,
                            lineHeight: 1.7,
                            color: C.textDim,
                            marginTop: 14,
                            textWrap: "pretty",
                        }}
                    >
                        An IDE-grade universal database client available as a{" "}
                        <strong>VS Code extension</strong> and a{" "}
                        <strong>standalone desktop app</strong> (Windows · macOS
                        · Linux). Browse schemas, execute complex queries,
                        design interactive dashboards, and supercharge your
                        developer workflow with a built-in MCP server for AI
                        tools.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 14,
                            marginTop: 14,
                            fontSize: 13.5,
                            color: C.blueLight,
                        }}
                    >
                        {[
                            "Quick Start",
                            "Features",
                            "Databases",
                            "MCP / AI",
                            "Desktop",
                        ].map((t, i) => (
                            <span key={t}>
                                {i > 0 && (
                                    <span
                                        style={{
                                            color: "#5a5a5a",
                                            marginRight: 14,
                                        }}
                                    >
                                        ·
                                    </span>
                                )}
                                {t}
                            </span>
                        ))}
                    </div>
                    <div
                        style={{
                            marginTop: 20,
                            padding: "26px 0 30px",
                            borderTop: `1px solid ${C.line}`,
                            textAlign: "left",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14.5,
                                fontWeight: 700,
                                color: C.textStrong,
                            }}
                        >
                            Quick start
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3,1fr)",
                                gap: 16,
                                marginTop: 14,
                            }}
                        >
                            {(
                                [
                                    [
                                        "01",
                                        "Open the QuickDB panel",
                                        "The database icon in the activity bar, or ⇧⌘D.",
                                    ],
                                    [
                                        "02",
                                        "Add a connection",
                                        "Pick an engine, paste a URL, or point at a file.",
                                    ],
                                    [
                                        "03",
                                        "Browse and query",
                                        "Click a table for rows, ⌘↵ to run a query.",
                                    ],
                                ] as const
                            ).map(([n, title, body]) => (
                                <div
                                    key={n}
                                    style={{
                                        border: `1px solid ${C.line}`,
                                        borderRadius: 6,
                                        padding: "14px 16px",
                                    }}
                                >
                                    <div
                                        style={{
                                            font: `400 11.5px ${MONO}`,
                                            color: C.blueLight,
                                        }}
                                    >
                                        {n}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: C.textStrong,
                                            marginTop: 7,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            lineHeight: 1.55,
                                            color: C.muted,
                                            marginTop: 5,
                                        }}
                                    >
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ width: 360, flex: "none", padding: "26px 30px 0 0" }}>
                <div
                    style={{
                        fontSize: 17,
                        color: C.textStrong,
                        fontWeight: 600,
                    }}
                >
                    Marketplace
                </div>
                <div
                    style={{
                        marginTop: 12,
                        font: `400 12.5px ${MONO}`,
                        color: C.textDim,
                    }}
                >
                    {(
                        [
                            ["Identifier", "quickdb.quickdb", true],
                            ["Version", marketplace.version, false],
                            [
                                "Installs",
                                formatInstallCount(marketplace.installs),
                                true,
                            ],
                            [
                                "Downloads",
                                formatInstallCount(marketplace.downloads),
                                false,
                            ],
                        ] as [string, string, boolean][]
                    ).map(([k, v, shade]) => (
                        <div
                            key={k}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "7px 10px",
                                background: shade ? "#232323" : undefined,
                            }}
                        >
                            <span style={{ color: C.muted, fontFamily: UI }}>
                                {k}
                            </span>
                            <span>{v}</span>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        fontSize: 17,
                        color: C.textStrong,
                        fontWeight: 600,
                        marginTop: 26,
                    }}
                >
                    Categories
                </div>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 12,
                    }}
                >
                    {CATEGORIES.map(c => (
                        <span
                            key={c}
                            style={{
                                fontSize: 12,
                                color: C.textDim,
                                border: `1px solid ${C.line3}`,
                                borderRadius: 3,
                                padding: "3px 8px",
                            }}
                        >
                            {c}
                        </span>
                    ))}
                </div>
                <div
                    style={{
                        fontSize: 17,
                        color: C.textStrong,
                        fontWeight: 600,
                        marginTop: 26,
                    }}
                >
                    Resources
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 9,
                        marginTop: 12,
                        fontSize: 13,
                        color: C.blueLight,
                    }}
                >
                    {[
                        "Repository",
                        "Issues",
                        "License",
                        "Nazmul Haque",
                        "Marketplace",
                    ].map(r => (
                        <span key={r}>{r}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

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
}> = ({
    changes,
    hasEditHistory,
    pasteActive,
    pasteBtnRef,
    saveBtnRef,
    undoBtnRef,
}) => (
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
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginRight: 20,
                flexShrink: 0,
            }}
        >
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
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontSize: 13,
                color: C.textDim,
                flexShrink: 0,
            }}
        >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                ↻ Refresh
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                ✎ Edit Table
            </span>
        </div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginLeft: 22,
                fontSize: 13,
                color: C.textDim,
                flexShrink: 0,
            }}
        >
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
                    border: pasteActive
                        ? "1px solid #2b88d8"
                        : "1px solid transparent",
                    boxShadow: pasteActive
                        ? "0 2px 10px rgba(0, 120, 212, 0.45)"
                        : "none",
                    fontWeight: pasteActive ? 600 : 400,
                    transition: "all 0.18s ease",
                }}
            >
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
                Paste
            </span>
            <span style={{ color: C.dark }}>⧉ Clone</span>
            <span style={{ color: C.dark }}>🗑 Delete</span>
        </div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 22,
                fontSize: 13,
                flexShrink: 0,
            }}
        >
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
                        <span
                            style={{
                                background: "#1b1b1b",
                                color: "#fff",
                                borderRadius: 9,
                                padding: "0 6px",
                                fontSize: 11,
                            }}
                        >
                            {changes}
                        </span>
                    </span>
                    <span style={{ color: C.text, padding: "4px 10px" }}>
                        Discard
                    </span>
                </>
            ) : (
                // Disabled, but still shaped like the buttons they become once
                // there are edits to commit.
                ["Save", "Discard"].map((t, idx) => (
                    <span
                        key={t}
                        ref={idx === 0 ? saveBtnRef : undefined}
                        style={{
                            padding: "4px 10px",
                            borderRadius: 3,
                            background: "#252525",
                            color: C.dark,
                        }}
                    >
                        {t}
                    </span>
                ))
            )}
        </div>
        <div
            style={{
                display: "flex",
                marginLeft: 22,
                border: `1px solid ${C.line3}`,
                borderRadius: 4,
                overflow: "hidden",
                fontSize: 13,
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    padding: "4px 12px",
                    background: "#3f3f3f",
                    color: "#fff",
                }}
            >
                Table
            </span>
            {["Transpose", "Text", "Tree"].map(t => (
                <span key={t} style={{ padding: "4px 12px", color: C.textDim }}>
                    {t}
                </span>
            ))}
        </div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginLeft: 22,
                fontSize: 13,
                color: C.textDim,
                flexShrink: 0,
            }}
        >
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
            Click Edit | Drag Select | Ctrl+S Save | Ctrl+N Add | Ctrl+G Go To
            Row
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

const FilterBar: FC<{
    filterOn: boolean;
    filterValRef: (el: HTMLElement | null) => void;
}> = ({ filterOn, filterValRef }) => {
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
            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12.5,
                }}
            >
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
                    <span
                        style={{
                            width: 150,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 9px",
                            color: C.faint,
                        }}
                    >
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
    const th: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "0 9px",
        borderRight: `1px solid ${C.line2}`,
    };
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: `1px solid ${C.line2}`,
                        color: C.faint,
                    }}
                >
                    #
                </div>
                <div style={th}>
                    <span
                        style={{
                            fontSize: 9.5,
                            background: "#0b3a5e",
                            color: C.bluePale,
                            borderRadius: 2,
                            padding: "1.5px 3px",
                        }}
                    >
                        123
                    </span>
                    <span style={{ color: C.amber }}>🔑</span>customerNumber
                    <span style={{ marginLeft: "auto", color: C.faint }}>
                        ⚟ ⋮
                    </span>
                </div>
                <div style={th}>
                    <span
                        style={{
                            fontSize: 9.5,
                            background: "#2f3a2a",
                            color: C.green,
                            borderRadius: 2,
                            padding: "1.5px 3px",
                        }}
                    >
                        Aa
                    </span>
                    <span style={{ color: C.amber }}>🔑</span>checkNumber
                    <span style={{ marginLeft: "auto", color: C.faint }}>
                        ⚟ ⋮
                    </span>
                </div>
                <div style={th}>
                    <span
                        style={{
                            fontSize: 9.5,
                            background: "#3a2f45",
                            color: "#c9a8e8",
                            borderRadius: 2,
                            padding: "1.5px 3px",
                        }}
                    >
                        17
                    </span>
                    paymentDate
                    <span style={{ marginLeft: "auto", color: C.faint }}>
                        ⚟ ⋮
                    </span>
                </div>
                <div style={{ ...th, borderRight: "none" }}>
                    <span
                        style={{
                            fontSize: 9.5,
                            background: "#0b3a5e",
                            color: C.bluePale,
                            borderRadius: 2,
                            padding: "1.5px 3px",
                        }}
                    >
                        123
                    </span>
                    amount
                    <span style={{ marginLeft: "auto", color: C.faint }}>
                        ⚟ ⋮
                    </span>
                </div>
            </div>
            {PAY_ROWS.map(p => (
                <div
                    className="qd-row"
                    key={p.chk}
                    style={{
                        display: "grid",
                        gridTemplateColumns: PAY_COLS,
                        height: 31,
                        borderBottom: `1px solid ${C.rowLine}`,
                        fontSize: 12.5,
                        color: C.cell,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRight: `1px solid ${C.rowLine}`,
                            color: C.faint,
                            fontSize: 12,
                        }}
                    >
                        {p.i}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "0 9px",
                            borderRight: `1px solid ${C.rowLine}`,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 9.5,
                                background: "#3a3320",
                                color: C.amber,
                                borderRadius: 2,
                                padding: "1.5px 3px",
                            }}
                        >
                            FK
                        </span>
                        <span style={{ fontWeight: 600, color: C.textStrong }}>
                            121
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0 9px",
                            borderRight: `1px solid ${C.rowLine}`,
                        }}
                    >
                        {p.chk}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0 9px",
                            borderRight: `1px solid ${C.rowLine}`,
                        }}
                    >
                        {p.date}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0 9px",
                        }}
                    >
                        {p.amt}
                    </div>
                </div>
            ))}
            {EMPTY_ROWS.map(n => (
                <div
                    key={n}
                    style={{
                        display: "grid",
                        gridTemplateColumns: PAY_COLS,
                        height: 31,
                        borderBottom: `1px solid ${C.rowLine}`,
                        fontSize: 12,
                        color: C.faint,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRight: `1px solid ${C.rowLine}`,
                        }}
                    >
                        {n}
                    </div>
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
        <div
            style={{
                position: "absolute",
                left: 56,
                top: 158,
                width: 200,
                height: 31,
                border: `2px solid ${C.blue}`,
                background: "rgba(0,120,212,.12)",
                pointerEvents: "none",
            }}
        />
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
            <div
                style={{
                    position: "absolute",
                    left: 218,
                    top: 196,
                    width: 216,
                    padding: "12px 0",
                    background: "#252526",
                    border: "1px solid #454545",
                    boxShadow: "0 10px 28px rgba(0,0,0,.6)",
                }}
            >
                <div
                    style={{
                        padding: "0 14px 10px",
                        fontSize: 12.5,
                        color: C.textDim,
                    }}
                >
                    Show rows referencing this
                </div>
                <div
                    ref={rowRef}
                    style={{
                        margin: "0 8px",
                        padding: "6px 8px",
                        background: "#04395e",
                        font: `400 12.5px ${MONO}`,
                        color: C.textStrong,
                    }}
                >
                    payments.
                    <span style={{ color: "#9cdcfe" }}>customerNumber</span>
                </div>
                <div
                    style={{
                        margin: "4px 8px 0",
                        padding: "6px 8px",
                        font: `400 12.5px ${MONO}`,
                        color: C.textDim,
                    }}
                >
                    orders.
                    <span style={{ color: "#9cdcfe" }}>customerNumber</span>
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
        <div
            style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
                borderBottom: "1px solid #2a2a2a",
                fontSize: 13,
                color: C.text,
                fontWeight: 600,
            }}
        >
            <span style={{ color: "#8fc9ff", fontSize: 14 }}>⧉</span>Paste
            Playground
            <span
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: 14,
                    color: C.muted,
                    fontSize: 13,
                }}
            >
                ▤ ✕
            </span>
        </div>
        <div
            ref={pasteAreaRef}
            style={{
                margin: "12px 14px",
                height: 104,
                border: filled
                    ? "1px solid rgba(0, 120, 212, 0.6)"
                    : "1px solid #333333",
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
                    495,Diecast Collectables,Franco,Valarie,6175552555,6251
                    Ingle Ln.,,Boston,MA,51003,USA,1188,85100.00
                    <br />
                    496,Kelly&apos;s Gift Shop,Snowden,Tony,+64 9
                    5555500,Arenales 1938 3&apos;A&apos;,,Auckland,,,New
                    Zealand,1612,110000.00
                    <span
                        style={{
                            display: "inline-block",
                            width: 1.5,
                            height: 12,
                            background: C.blueLight,
                            verticalAlign: -2,
                        }}
                    />
                </div>
            ) : (
                <div
                    style={{ fontFamily: UI, fontSize: 12.5, color: "#666666" }}
                >
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
                    border: filled
                        ? "1px solid rgba(0,120,212,0.4)"
                        : "1px solid #3a3a3a",
                    background: filled ? "rgba(0,120,212,0.15)" : "#2a2a2a",
                    padding: "2px 5px",
                    borderRadius: 3,
                }}
            >
                INPUT
            </div>
        </div>
        <div
            style={{
                margin: "0 14px",
                border: "1px solid #2a2a2a",
                borderRadius: 4,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 10px",
                    background: "#232323",
                    fontSize: 11,
                    letterSpacing: ".06em",
                    color: "#aaaaaa",
                    fontWeight: 600,
                }}
            >
                PREVIEW
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        letterSpacing: 0,
                        fontWeight: 400,
                        fontSize: 11.5,
                        color: "#cccccc",
                    }}
                >
                    <span
                        style={{
                            width: 13,
                            height: 13,
                            borderRadius: 2,
                            background: C.blue,
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 9,
                        }}
                    >
                        ✓
                    </span>
                    Auto-generate IDs (Clear PKs)
                </span>
                <span
                    style={{
                        marginLeft: "auto",
                        letterSpacing: 0,
                        fontWeight: 600,
                        fontSize: 11.5,
                        color: filled ? C.bluePale : "#888888",
                    }}
                >
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
                        {[
                            "customerNumber",
                            "customerName",
                            "contactLastName",
                            "contactFirstName",
                        ].map((h, i) => (
                            <div
                                key={h}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 9px",
                                    borderRight:
                                        i < 3
                                            ? `1px solid ${C.line2}`
                                            : undefined,
                                }}
                            >
                                {h}
                            </div>
                        ))}
                    </div>
                    {PREVIEW_ROWS.map(pr => (
                        <div
                            key={pr.n}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "108px 168px 130px 128px",
                                height: 30,
                                borderBottom: `1px solid ${C.rowLine}`,
                                fontSize: 12,
                                color: C.cell,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 9px",
                                    borderRight: `1px solid ${C.rowLine}`,
                                    color: C.faint,
                                }}
                            >
                                NULL
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 9px",
                                    borderRight: `1px solid ${C.rowLine}`,
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {pr.n}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 9px",
                                    borderRight: `1px solid ${C.rowLine}`,
                                }}
                            >
                                {pr.l}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 9px",
                                }}
                            >
                                {pr.f}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        height: 246,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        color: "#555555",
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#444444"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <div
                        style={{
                            fontSize: 12.5,
                            color: "#666666",
                            fontStyle: "italic",
                        }}
                    >
                        Pasted data will appear here
                    </div>
                </div>
            )}
        </div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
            }}
        >
            <div
                style={{
                    fontSize: 12.5,
                    color: "#cccccc",
                    lineHeight: 1.45,
                    fontWeight: 600,
                }}
            >
                Target Table
                <br />
                <span
                    style={{
                        color: "#777777",
                        fontWeight: 400,
                        fontSize: 11.5,
                    }}
                >
                    13 columns available
                </span>
            </div>
            <div
                style={{
                    marginLeft: "auto",
                    fontSize: 12.5,
                    color: "#cccccc",
                    padding: "5px 12px",
                    border: "1px solid #3a3a3a",
                    borderRadius: 4,
                    background: "#222226",
                }}
            >
                Cancel
            </div>
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
                    background: !filled
                        ? "#222226"
                        : hoverImport
                          ? "linear-gradient(135deg, #0078d4, #005a9e)"
                          : "#0078d4",
                    color: !filled ? "#4e4e52" : "#ffffff",
                    border: !filled
                        ? "1px solid #2e2e32"
                        : "1px solid rgba(0,120,212,0.6)",
                    boxShadow: filled
                        ? "0 2px 10px rgba(0, 120, 212, 0.45)"
                        : "none",
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
        <span
            style={{
                height: 24,
                padding: "0 9px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                border: `1px solid ${C.line3}`,
                borderRadius: 3,
                background: C.raised,
            }}
        >
            Auto (27)<span style={{ color: C.faint }}>⌄</span>
        </span>
        <span style={{ marginLeft: "auto", color: C.muted }}>{showing}</span>
        <span
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginLeft: 14,
                color: C.muted,
            }}
        >
            <span>‹</span>
            {[1, 2, 3, 4, 5].map(n => (
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
