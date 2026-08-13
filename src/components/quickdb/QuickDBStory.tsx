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
    AI_CHAT_QUESTION,
    AI_CHAT_RESULT_ROWS,
    AI_CHAT_SQL,
    CATEGORIES,
    CUST,
    DESIGN_W,
    EMPTY_ROWS,
    FIELDS,
    MCP_CLIENTS,
    MCP_DATABASES,
    MCP_TOOLS,
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

/** Badge tint per MCP tool category, used on the MCP Tools catalog (steps 79-80). */
const BADGE_TINT: Record<string, string> = {
    Help: "#9d9d9d",
    Connections: "#7cc4f5",
    Schema: "#c79bff",
    Read: "#7cd68f",
    Write: "#ff8a8a",
    Stats: "#9aa5ff",
    Reports: "#f5cf6a",
    Visualization: "#ff9bb0",
    Design: "#ffab6b",
};

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
    | "visualizeBarBtn"
    | "closeVizTabBtn"
    | "aiSettingsNavItem"
    | "aiProviderCloudBtn"
    | "aiProviderLocalBtn"
    | "aiSqlAssistantNavItem"
    | "aiChatNavItem"
    | "aiChatConnBtn"
    | "aiChatConnDemoOption"
    | "aiChatDbBtn"
    | "aiChatDbClassicOption"
    | "aiChatInput"
    | "aiChatSendBtn"
    | "aiChatRunBtn"
    | "aiChatOpenConsoleBtn"
    | "aiConsoleRunBtn"
    | "aiConsoleCloseTabBtn"
    | "mcpToolsNavItem"
    | "mcpClientSetupLinkBtn"
    | "mcpPerDbAccessLink"
    | "mcpReadBtn"
    | "mcpUpdateBtn"
    | "toolsScrollWrap"
    | "settingsGearIcon"
    | "openUserSettingsMenuItem"
    | "customizationsNavItem"
    | "settingsModalCloseBtn"
    | "agentChatInput"
    | "mcpAutocompleteQuickdbOption"
    | "agentSendBtn"
    | "mcpServerQuickdbItem"
    | "claudeCodeIcon"
    | "claudeCodeMcpOption"
    | "claudeCodeInput"
    | "claudeCodeSendBtn"
    | "claudeCodeYesBtn"
    | "claudeCodeChatLog";

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

/**
 * The intro zoom-in (laptop → full-bleed VS Code) and its chrome/hero fades
 * were originally tuned as fractions of `p` (scroll progress over the WHOLE
 * track) — 0.075 for the zoom, 0.05-0.105 for the bezel/glow fade, 0.03 for
 * the hero fade — back when the track was just the 20-step, 3500vh original.
 * Since then STEP_COUNT has grown a lot (Query Console, AI & MCP, the IDE
 * epilogue), and each added step keeps its own fixed vh width (UNIT_VH) —
 * so TRACK_VH has grown right along with it while the *intro's* own vh
 * budget (P0_VH) stayed fixed. A fraction of the whole track no longer
 * means the same fraction of the intro: those old 0.075/0.05/0.105/0.03
 * thresholds, read literally against the new bigger `p`, now stretch the
 * zoom out over several steps' worth of scrolling instead of finishing
 * before step 1 even starts — so the extensions drawer opens and "quickdb"
 * starts typing while the laptop is still visibly zooming in.
 *
 * Fix: rescale those thresholds by how much the track has grown relative
 * to its original size (P0 / 0.11 — P0 is P0_VH/TRACK_VH today, and 0.11
 * was exactly P0_VH/ORIGINAL_TRACK_VH), so the zoom keeps finishing within
 * the same fixed vh budget it always had, however many steps get added
 * after it.
 */
const INTRO_SCALE = P0 / 0.11;

/**
 * Steps 63-84 (AI Settings → AI SQL Assistant → AI Chat → its own Query
 * Console round-trip → MCP Tools → MCP Setup) are a long, strictly linear
 * chain of hover-then-click beats, same discipline as the rest of the story:
 * a click's visible consequence can't land before the cursor has actually
 * glided to and "clicked" its target. Rather than the usual one useState +
 * one engine-ref field + one diff line per boolean (viable for a handful of
 * toggles, unworkable for ~20 of them), every derived value here is a pure
 * function of (step, frac) collapsed into one object, computed and
 * shallow-diffed as a single unit in tick() — see AiMcpState below.
 */
interface AiMcpState {
    /** AI Settings' Provider toggle (steps 63 default / 64 / 65). */
    provider: "editor" | "cloud" | "local";
    /** AI SQL Assistant tab is open and active (step 66, until Chat resets it at 67). */
    sqlAssistantOpen: boolean;
    /** AI Chat tab is open (step 67 on — stays true for the rest of the story). */
    chatOpen: boolean;
    /** Chat's Connection dropdown is open (step 68, through 69 until picked). */
    connDropdownOpen: boolean;
    /** "Demo (mysql)" picked as the chat's connection (step 69's click). */
    connPicked: boolean;
    /** Chat's Database dropdown is open (step 70, through 71 until picked). */
    dbDropdownOpen: boolean;
    /** "classicmodels" picked as the chat's database (step 71's click) — this is what enables the input bar. */
    dbPicked: boolean;
    /** Characters of AI_CHAT_QUESTION revealed so far (step 72's type-in). */
    questionChars: number;
    /** The question was sent — renders as a right-aligned bubble (step 73's click). */
    sent: boolean;
    /** The "thinking…" beat is done and the SQL reply + Run/Open-in-Console/Copy row is showing (step 74). */
    responded: boolean;
    /** The reply's own Run was clicked — results table appears inline in chat (step 75's click). */
    ranInChat: boolean;
    /** The AI-generated-query Query Console tab is open (step 76's click, until closed at 78). */
    consoleOpen: boolean;
    /** That console's own Run was clicked — its results grid is showing (step 77's click). */
    consoleRan: boolean;
    /** That console tab was closed via its own ✕ (step 78's click) — back to just AI Chat. */
    consoleClosed: boolean;
    /** MCP Tools tab is open (step 79's click). */
    mcpToolsOpen: boolean;
    /** Scroll offset (px) into the MCP Tools catalog list (steps 80-81). */
    mcpScroll: number;
    /** MCP Setup tab is open (step 81's click on "MCP client setup →"). */
    mcpSetupOpen: boolean;
    /** Antigravity card's "› Per-database access" row is expanded (step 82's click). */
    perDbExpanded: boolean;
    /** classicmodels row's Read toggle is on, under Antigravity (step 83's click). */
    readSelected: boolean;
    /** Antigravity's Update was clicked — the "configured" toast is showing (step 84's click). */
    updateClicked: boolean;
}

const AI_MCP_INITIAL: AiMcpState = {
    provider: "editor",
    sqlAssistantOpen: false,
    chatOpen: false,
    connDropdownOpen: false,
    connPicked: false,
    dbDropdownOpen: false,
    dbPicked: false,
    questionChars: 0,
    sent: false,
    responded: false,
    ranInChat: false,
    consoleOpen: false,
    consoleRan: false,
    consoleClosed: false,
    mcpToolsOpen: false,
    mcpScroll: 0,
    mcpSetupOpen: false,
    perDbExpanded: false,
    readSelected: false,
    updateClicked: false,
};

/** A step's click "lands" once the cursor is past it — either scrolled fully
 *  past (s > step) or into its own second half (s === step && frac >= 0.5),
 *  same 0.5 threshold as every other single-step click gate in this file. */
const clickLanded = (s: number, frac: number, step: number) =>
    s > step || (s === step && frac >= 0.5);

const computeAiMcpState = (s: number, frac: number): AiMcpState => {
    if (s < 63) return AI_MCP_INITIAL;
    const past = (step: number) => clickLanded(s, frac, step);
    const connPicked = past(69);
    const dbPicked = past(71);
    const consoleClosed = past(78);
    return {
        provider: past(65) ? "local" : past(64) ? "cloud" : "editor",
        sqlAssistantOpen: past(66) && !past(67),
        chatOpen: past(67),
        connDropdownOpen: !connPicked && (s === 68 || s === 69),
        connPicked,
        dbDropdownOpen: connPicked && !dbPicked && (s === 70 || s === 71),
        dbPicked,
        questionChars:
            s > 72
                ? AI_CHAT_QUESTION.length
                : s === 72
                  ? Math.round(clamp01((frac - 0.15) / 0.8) * AI_CHAT_QUESTION.length)
                  : 0,
        sent: past(73),
        responded: s >= 74,
        ranInChat: past(75),
        consoleOpen: past(76) && !consoleClosed,
        consoleRan: past(77),
        consoleClosed,
        mcpToolsOpen: past(79),
        mcpScroll: s < 80 ? 0 : s === 80 ? Math.round(clamp01(frac) * 640) : 640,
        mcpSetupOpen: past(81),
        perDbExpanded: past(82),
        readSelected: past(83),
        updateClicked: past(84),
    };
};

/** Which of the AI & MCP webview tabs is on top — the tab bar accumulates
 *  (AI Settings, then +AI SQL Assistant) until AI Chat opens and resets it
 *  to just itself, same as the reference recording. Checked in descending
 *  step order and returns on the first match, which works because `past()`
 *  is monotonic in s: whichever stage most recently landed wins. */
type AiTab = "settings" | "sqlAssistant" | "chat" | "console" | "mcpTools" | "mcpSetup";

const aiActiveTab = (ai: AiMcpState): AiTab => {
    if (ai.mcpSetupOpen) return "mcpSetup";
    if (ai.mcpToolsOpen) return "mcpTools";
    if (ai.consoleOpen) return "console";
    if (ai.chatOpen) return "chat";
    if (ai.sqlAssistantOpen) return "sqlAssistant";
    return "settings";
};

const aiOpenTabs = (ai: AiMcpState): readonly AiTab[] => {
    if (ai.chatOpen) {
        if (ai.mcpSetupOpen) return ["chat", "mcpTools", "mcpSetup"];
        if (ai.mcpToolsOpen) return ["chat", "mcpTools"];
        if (ai.consoleOpen) return ["chat", "console"];
        return ["chat"];
    }
    if (ai.sqlAssistantOpen) return ["settings", "sqlAssistant"];
    return ["settings"];
};

/**
 * Steps 85-95: the epilogue proving the Update at step 84 actually wired
 * quickdb into the real editor — its own gear-icon Settings (General →
 * Customizations, where the 48 registered tools are listed), then its own
 * docked Agent panel driven through an @mcp:quickdb mention to a real
 * answer. Overlays the MCP Setup page rather than replacing it (every
 * reference screenshot still shows "MCP Setup" as the active tab
 * underneath), so this is a second, independent combined-state object
 * layered on top of AiMcpState rather than folded into it.
 */
interface IdeState {
    /** The gear icon's dropdown (Editor Settings / Open User Settings / …) is open (step 86, until 87's click). */
    settingsDropdownOpen: boolean;
    /** The Settings modal is open (step 87's click, until step 89 closes it). */
    modalOpen: boolean;
    /** Which modal section is showing — General is the modal's own default; Customizations is step 88's click. */
    settingsTab: "general" | "customizations";
    /** The editor's docked Agent panel is visible — revealed together with step 89's modal-close click. */
    agentPanelOpen: boolean;
    /** The "@mcp:" mention autocomplete (chrome-devtools-mcp / quickdb) is open (step 90, through 91 until picked). */
    mcpAutocompleteOpen: boolean;
    /** "quickdb" was picked from the mention autocomplete (step 91's click). */
    mcpPicked: boolean;
    /** Characters of AI_CHAT_QUESTION revealed so far in the Agent input (step 92's type-in). */
    questionChars: number;
    /** The message was sent to the Agent (step 93's click). */
    sent: boolean;
    /** 0 = idle, 1 = simple "Working" line, 2 = expanded trace (exploring rows + generated SQL) — step 94. */
    workingPhase: 0 | 1 | 2;
    /** The full natural-language answer is showing (step 95). */
    resultReady: boolean;
}

const IDE_INITIAL: IdeState = {
    settingsDropdownOpen: false,
    modalOpen: false,
    settingsTab: "general",
    agentPanelOpen: false,
    mcpAutocompleteOpen: false,
    mcpPicked: false,
    questionChars: 0,
    sent: false,
    workingPhase: 0,
    resultReady: false,
};

const computeIdeState = (s: number, frac: number): IdeState => {
    if (s < 85) return IDE_INITIAL;
    const past = (step: number) => clickLanded(s, frac, step);
    const modalOpen = past(87) && !past(89);
    const agentPanelOpen = past(89);
    const mcpPicked = past(91);
    const sent = past(93);
    return {
        settingsDropdownOpen: !past(87) && (s === 86 || s === 87),
        modalOpen,
        settingsTab: past(88) ? "customizations" : "general",
        agentPanelOpen,
        mcpAutocompleteOpen: agentPanelOpen && !mcpPicked && (s === 90 || s === 91),
        mcpPicked,
        questionChars:
            s > 92
                ? AI_CHAT_QUESTION.length
                : s === 92
                  ? Math.round(clamp01((frac - 0.15) / 0.8) * AI_CHAT_QUESTION.length)
                  : 0,
        sent,
        workingPhase: !sent ? 0 : s === 94 ? (frac < 0.5 ? 1 : 2) : s > 94 ? 2 : 0,
        resultReady: past(95),
    };
};

/**
 * Steps 96-103: a second, independent proof that step 84's Update actually
 * registered quickdb — this time from a plain VS Code window rather than
 * the editor's own Settings/Agent (steps 85-95): its Extensions view lists
 * quickdb under "MCP Servers - Installed" outside any QuickDB-specific UI,
 * and the separate Claude Code extension's own panel reaches the same
 * answer a third way, through its /mcp servers picker and a real
 * tool-call permission prompt. Which activity-bar view is active
 * (`view`) also decides what the left sidebar shows — see the render
 * side for the quickdb/extensions/claudeCode branch.
 */
interface VscState {
    /** Which activity-bar destination is selected — drives the sidebar's content, not just an icon highlight. */
    view: "quickdb" | "extensions" | "claudeCode";
    /** The "MCP Server: quickdb" config tab is open (step 97's click). */
    mcpServerTabOpen: boolean;
    /** The "/mcp" slash-command palette is open under Claude Code's input (step 99, until its own click). */
    mcpPaletteOpen: boolean;
    /** The "MCP servers" modal (quickdb Connected, claude.ai * Needs Auth) is open — opened by 99's click, closes once step 100 starts typing. */
    mcpModalOpen: boolean;
    /** Characters of "mcp quickdb\n" + AI_CHAT_QUESTION revealed in Claude Code's input (step 100). */
    questionChars: number;
    /** The question was sent to Claude Code — a new session appears in the left list (step 101's click). */
    sent: boolean;
    /** 0 = idle, 1 = "Thinking… · N tokens", 2 = "Working…" + the first (blocked) tool-call line — step 101 tail into 102. */
    workingPhase: 0 | 1 | 2;
    /** The "Do you want to proceed with mcp__quickdb__quickdb_execute_query?" dialog is showing (step 102, until 103's click). */
    permissionOpen: boolean;
    /** "Yes" was clicked (step 103) — the blocked call resolves and the rest of the trace plays out. */
    approved: boolean;
    /** How far the post-approval trace has revealed, driven by step 103's own frac: 0 nothing yet (dialog just closed) → 1 the first call's real error ("No database selected") → 2 the self-correcting quickdb_list_databases lookup → 3 the retried query's results table → 4 the final numbered-list answer. */
    tracePhase: 0 | 1 | 2 | 3 | 4;
}

const VSC_INITIAL: VscState = {
    view: "quickdb",
    mcpServerTabOpen: false,
    mcpPaletteOpen: false,
    mcpModalOpen: false,
    questionChars: 0,
    sent: false,
    workingPhase: 0,
    permissionOpen: false,
    approved: false,
    tracePhase: 0,
};

const CLAUDE_CODE_PROMPT = `mcp quickdb\n${AI_CHAT_QUESTION}`;

const computeVscState = (s: number, frac: number): VscState => {
    if (s < 96) return VSC_INITIAL;
    const past = (step: number) => clickLanded(s, frac, step);
    const mcpServerTabOpen = past(97);
    const claudeCodeOpen = past(98);
    const mcpModalOpen = past(99) && !past(100);
    const sent = past(101);
    const approved = past(103);
    return {
        view: claudeCodeOpen ? "claudeCode" : past(96) ? "extensions" : "quickdb",
        mcpServerTabOpen,
        mcpPaletteOpen: claudeCodeOpen && s === 99 && !past(99),
        mcpModalOpen,
        questionChars:
            s > 100
                ? CLAUDE_CODE_PROMPT.length
                : s === 100
                  ? Math.round(clamp01((frac - 0.1) / 0.85) * CLAUDE_CODE_PROMPT.length)
                  : 0,
        sent,
        workingPhase: !sent ? 0 : s === 101 && frac < 0.6 ? 1 : 2,
        permissionOpen: sent && !approved,
        approved,
        tracePhase: !approved
            ? 0
            : s === 103
              ? frac < 0.2
                  ? 0
                  : frac < 0.4
                    ? 1
                    : frac < 0.6
                      ? 2
                      : frac < 0.8
                        ? 3
                        : 4
              : 4,
    };
};

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
    const [vizTabClosed, setVizTabClosed] = useState(false);
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
    // Steps 63-84 (AI & MCP) — see AiMcpState's own comment for why this is
    // one combined object instead of ~20 individual useState/engine-ref pairs.
    const [ai, setAi] = useState<AiMcpState>(AI_MCP_INITIAL);
    // Steps 85-95 (editor Settings + Agent panel epilogue) — see IdeState's own comment.
    const [ide, setIde] = useState<IdeState>(IDE_INITIAL);
    // Steps 96-103 (VS Code Extensions + Claude Code epilogue) — see VscState's own comment.
    const [vsc, setVsc] = useState<VscState>(VSC_INITIAL);

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
        const targetY = Math.ceil(trackTop + targetP * span) + (stepNum > 1 ? 4 : 0);
        try {
            window.scrollTo({ top: targetY, behavior: "smooth" });
        } catch {
            window.scrollTo(0, targetY);
        }
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
        { label: "AI & MCP", icon: "⚡", live: true, step: 63 },
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
        vizTabClosed: false,
        pastHover: false,
        pastClick: false,
        editPhase: 0 as 0 | 1 | 2 | 3 | 4 | 5,
        hasEditHistory: false,
        editCellText: "",
        editAnimStarted: false,
        queryTitleText: QUERY_TITLE_AFTER,
        secondEditTable: SECOND_EDIT_TABLE_AFTER,
        secondEditOrderCol: SECOND_EDIT_ORDERCOL_AFTER,
        ai: AI_MCP_INITIAL as AiMcpState,
        ide: IDE_INITIAL as IdeState,
        vsc: VSC_INITIAL as VscState,
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
            mark(el("extIcon"), (s >= 2 && s <= 6) || (s >= 96 && e.vsc.view === "extensions"));
            mark(el("qdbIcon"), s >= 7 && s < 96);
            mark(el("claudeCodeIcon"), s >= 96 && e.vsc.view === "claudeCode");

            const chatLog = el("claudeCodeChatLog");
            if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;

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
            // Steps 63+ (AI & MCP): the group they target sits at the very
            // bottom of the TOOLS tree, below QUERY HISTORY/SAVED QUERIES in
            // source order but visually the last group in TOOLS — scroll the
            // whole tree's wrapper down so it's actually in view instead of
            // clipped past the sidebar's fixed height. Not frac-gated like a
            // click's consequence would be: this is a passive scroll, not
            // something the cursor's own click causes.
            const toolsWrap = el("toolsScrollWrap");
            if (toolsWrap) toolsWrap.scrollTop = s >= 63 ? toolsWrap.scrollHeight : 0;

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
                start + (full - start) * easeInOutCubic(clamp01(p / (0.075 * INTRO_SCALE)));
            const lap = el("lap");
            if (lap)
                lap.style.transform = `translate(-50%,-50%) scale(${k.toFixed(4)})`;

            // Bezel, base and glow dissolve as the screen goes full-bleed.
            const chrome = 1 - clamp01((p - 0.05 * INTRO_SCALE) / (0.055 * INTRO_SCALE));
            (["bez", "base", "glow"] as const).forEach(n => {
                const node = el(n);
                if (node) node.style.opacity = String(chrome);
            });
            const scr = el("screen");
            if (scr) scr.style.borderRadius = `${(12 * chrome).toFixed(2)}px`;
            const hero = el("hero");
            if (hero) hero.style.opacity = String(1 - clamp01(p / (0.03 * INTRO_SCALE)));

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
            e.visible = s >= 1 && p <= 0.998;
            aimCursor(s);

            // Steps 63-84 (AI & MCP): one combined object, computed and
            // shallow-diffed every tick rather than folded into the big
            // step-gated diff block below — several of its fields (typing
            // progress, scroll offset) change continuously within a single
            // step as frac moves, not just when s itself changes.
            const nextAi = computeAiMcpState(s, e.frac);
            let aiChanged = false;
            for (const k in nextAi) {
                if (nextAi[k as keyof AiMcpState] !== e.ai[k as keyof AiMcpState]) {
                    aiChanged = true;
                    break;
                }
            }
            if (aiChanged) {
                e.ai = nextAi;
                setAi(nextAi);
            }

            // Steps 85-95 (editor Settings + Agent panel epilogue) — same
            // shallow-diff-every-tick treatment as AiMcpState above.
            const nextIde = computeIdeState(s, e.frac);
            let ideChanged = false;
            for (const k in nextIde) {
                if (nextIde[k as keyof IdeState] !== e.ide[k as keyof IdeState]) {
                    ideChanged = true;
                    break;
                }
            }
            if (ideChanged) {
                e.ide = nextIde;
                setIde(nextIde);
            }

            // Steps 96-103 (VS Code Extensions + Claude Code epilogue) —
            // same shallow-diff-every-tick treatment as AiMcpState/IdeState.
            const nextVsc = computeVscState(s, e.frac);
            let vscChanged = false;
            for (const k in nextVsc) {
                if (nextVsc[k as keyof VscState] !== e.vsc[k as keyof VscState]) {
                    vscChanged = true;
                    break;
                }
            }
            if (vscChanged) {
                e.vsc = nextVsc;
                setVsc(nextVsc);
            }

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

            // Step 62: hover then click the Visualization tab's own ✕,
            // landing back on the Query Console tab and its results grid.
            // Only ever set at s===62 — TARGETS[62] is the only step at this
            // target, so it needs the same single-step frac-gating as
            // savedPanelOpen/connSelected. There's no s>62 to also cover
            // since this is the story's last step.
            const vizTabClosed = s === 62 && e.frac >= 0.5;

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
                vizTabClosed !== e.vizTabClosed ||
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
                const changedVizTabClosed = vizTabClosed !== e.vizTabClosed;
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
                e.vizTabClosed = vizTabClosed;
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
                if (changedVizTabClosed) setVizTabClosed(vizTabClosed);
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
    // Steps 63-84 (AI & MCP) — which of the AI/MCP tabs/panels is on top.
    const activeAiTab = s >= 63 ? aiActiveTab(ai) : null;
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
                        <QuickDBTopMenuBar appName={s >= 96 ? "Code" : "Editor"} />

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

                            {/* Steps 85-89: the editor's own gear-icon Settings —
                                proves the step-84 Update actually wired quickdb
                                into the real editor, not just the QuickDB webview.
                                marginLeft: auto so it sits at the window bar's far
                                right edge; the icons before it only fill the space
                                immediately after the centered search box (see that
                                box's own margin: 0 auto). */}
                            {s >= 63 && (
                                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <span style={{ fontSize: 14, opacity: 0.85 }}>🔥</span>
                                    <div
                                        ref={set("settingsGearIcon")}
                                        title="Editor-Specific Settings"
                                        style={{
                                            display: "grid",
                                            placeItems: "center",
                                            width: 20,
                                            height: 20,
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            background: s === 85 || ide.settingsDropdownOpen ? C.raised : "transparent",
                                            color: s === 85 || ide.settingsDropdownOpen ? C.text : C.faint,
                                            fontSize: 13,
                                        }}
                                    >
                                        ⚙
                                    </div>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#7cc4f5,#c79bff)", flex: "none" }} />

                                    {ide.settingsDropdownOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 28,
                                                right: 40,
                                                width: 260,
                                                background: "#252526",
                                                border: "1px solid #454545",
                                                borderRadius: 6,
                                                boxShadow: "0 12px 34px rgba(0,0,0,.6)",
                                                fontSize: 12.5,
                                                color: C.text,
                                                zIndex: 30,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div style={{ padding: "8px 14px", cursor: "pointer" }}>Editor Settings</div>
                                            <div
                                                ref={set("openUserSettingsMenuItem")}
                                                style={{
                                                    padding: "8px 14px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    background: s === 87 ? "#0078d4" : "transparent",
                                                    color: "#fff",
                                                }}
                                            >
                                                <span>Open Editor User Settings</span>
                                                <span style={{ opacity: 0.7 }}>⌘,</span>
                                            </div>
                                            <div style={{ borderTop: "1px solid #3a3a3a" }} />
                                            <div style={{ padding: "8px 14px", cursor: "pointer" }}>Extensions</div>
                                            <div style={{ padding: "8px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                                                <span>Open Keyboard Shortcuts</span>
                                                <span style={{ opacity: 0.7 }}>⇧⌘S</span>
                                            </div>
                                            <div style={{ padding: "8px 14px", cursor: "pointer" }}>Configure Snippets</div>
                                            <div style={{ borderTop: "1px solid #3a3a3a" }} />
                                            <div style={{ padding: "8px 14px", cursor: "pointer" }}>Tasks</div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                            boxShadow: s >= 7 && s < 96 ? `inset 2px 0 0 0 ${C.blue}` : "none",
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
                                <div
                                    ref={set("extIcon")}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        display: "grid",
                                        placeItems: "center",
                                        color: (s >= 2 && s <= 6) || (s >= 96 && vsc.view === "extensions") ? "#fff" : C.faint,
                                        position: "relative",
                                        boxShadow: (s >= 2 && s <= 6) || (s >= 96 && vsc.view === "extensions") ? `inset 2px 0 0 0 ${C.blue}` : "none",
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
                                        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
                                        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
                                        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
                                        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
                                    </svg>
                                </div>
                                {/* Steps 98-103: Claude Code extension icon placed directly below Extensions (extIcon) in upper Activity Bar */}
                                {s >= 96 && (
                                    <div
                                        ref={set("claudeCodeIcon")}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            display: "grid",
                                            placeItems: "center",
                                            color: vsc.view === "claudeCode" ? "#fff" : "#888",
                                            position: "relative",
                                            cursor: "pointer",
                                            boxShadow: vsc.view === "claudeCode" ? `inset 2px 0 0 0 ${C.blue}` : "none",
                                        }}
                                    >
                                        <svg
                                            width="22"
                                            height="22"
                                            viewBox="0 0 100 100"
                                            fill={vsc.view === "claudeCode" ? "#fff" : "#d97757"}
                                        >
                                            <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
                                        </svg>
                                    </div>
                                )}
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
                                                    border: `1px solid ${s >= 3 ? C.blue : C.line3}`,
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
                                                    style={{
                                                        color: s >= 3 ? C.textStrong : C.faint,
                                                        fontWeight: s >= 3 ? 600 : 400,
                                                    }}
                                                >
                                                    {s <= 2
                                                        ? "Search Extensions in Marketplace"
                                                        : s > 3
                                                          ? "quickdb"
                                                          : "quickdb".slice(
                                                                0,
                                                                Math.min(
                                                                    7,
                                                                    Math.max(
                                                                        1,
                                                                        Math.floor(
                                                                            (eng.current?.frac ||
                                                                                0) *
                                                                                8.5,
                                                                        ),
                                                                    ),
                                                                ),
                                                            )}
                                                </span>
                                                {(s === 2 || s === 3) && <Caret />}
                                                <span
                                                    style={{
                                                        marginLeft: "auto",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        color: C.muted,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {s >= 3 ? (
                                                        <span style={{ fontSize: 11, color: C.faint }}>✕</span>
                                                    ) : (
                                                        <>⌫ ⚟</>
                                                    )}
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

                                    {sideQdb && vsc.view === "quickdb" && (
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

                                            {/* tools — TOOLS + QUERY HISTORY + SAVED QUERIES. Scrollable
                                                (not just clipped) so steps 63+ can bring the AI/MCP group,
                                                added at the bottom of TOOLS, into view — see applyStep's
                                                toolsScrollWrap handling below. */}
                                            <div
                                                ref={set("toolsScrollWrap")}
                                                style={{
                                                    flex: 1,
                                                    minHeight: 0,
                                                    overflow: "auto",
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
                                                            {g.items.map(it => {
                                                                const ref: RefKey | undefined =
                                                                    it === "SQL Console"
                                                                        ? "sidebarSqlConsole"
                                                                        : it === "AI Settings (Provider / Key)"
                                                                          ? "aiSettingsNavItem"
                                                                          : it === "AI SQL Assistant"
                                                                            ? "aiSqlAssistantNavItem"
                                                                            : it === "AI Chat"
                                                                              ? "aiChatNavItem"
                                                                              : it === "MCP Tools"
                                                                                ? "mcpToolsNavItem"
                                                                                : undefined;
                                                                const active =
                                                                    (it === "SQL Console" && s >= 21) ||
                                                                    (it === "AI Settings (Provider / Key)" && activeAiTab === "settings") ||
                                                                    (it === "AI SQL Assistant" && activeAiTab === "sqlAssistant") ||
                                                                    (it === "AI Chat" && activeAiTab === "chat") ||
                                                                    (it === "MCP Tools" && activeAiTab === "mcpTools") ||
                                                                    (it === "Setup MCP for AI Clients" && activeAiTab === "mcpSetup");
                                                                return (
                                                                    <div
                                                                        key={it}
                                                                        ref={ref ? set(ref) : undefined}
                                                                        style={{
                                                                            height: 24,
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 8,
                                                                            padding:
                                                                                "0 12px 0 40px",
                                                                            background: active
                                                                                ? C.raised
                                                                                : "transparent",
                                                                            color: active
                                                                                ? C.text
                                                                                : C.textDim,
                                                                            fontWeight: active
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
                                                                );
                                                            })}
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

                                    {/* Steps 96-97: a real VS Code Extensions view — Installed /
                                        Recommended lists (decorative), and "MCP Servers - Installed"
                                        with quickdb as the one actually clicked (step 97, opens its
                                        config tab). */}
                                    {vsc.view === "extensions" && (
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "auto" }}>
                                            <PanelTitle>Extensions</PanelTitle>
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
                                                    color: C.muted,
                                                    fontSize: 12,
                                                }}
                                            >
                                                Search Extensions in Marketplace
                                            </div>

                                            <div style={{ marginTop: 8, fontSize: 11, letterSpacing: ".06em", color: C.textDim, fontWeight: 600 }}>
                                                <TreeRow label="INSTALLED" badge="36" />
                                            </div>
                                            {[
                                                ["</tag>", "Auto Close Tag", "Automatically add HTML/XML close tag, sam…", "Jun Han", "#e2b13c"],
                                                ["◧", "Auto Import", "Automatically finds, parses and provides cod…", "steoates", "#7cc4f5"],
                                                ["⛭", "Auto Rename Tag", "Auto rename paired HTML/XML tag", "Jun Han", "#7cc4f5"],
                                                ["//", "Better Comments", "Improve your code commenting by annotatin…", "Aaron Bond", "#a8cf8f"],
                                                ["◐", "Better Folding", "Improve the folding experience in VS Code", "Mohammad Baqer", "#9d9d9d"],
                                                ["✱", "Claude Code for VS Code", "Claude Code for VS Code: Harness the powe…", "Anthropic", "#d97757"],
                                            ].map(([icon, name, desc, author, tint]) => (
                                                <div key={name} style={{ display: "flex", gap: 10, padding: "8px 12px", background: name === "Claude Code for VS Code" ? C.raised : "transparent" }}>
                                                    <div style={{ width: 32, height: 32, flex: "none", borderRadius: 6, background: "#252526", display: "grid", placeItems: "center", color: tint, fontSize: 13 }}>{icon}</div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: 12.5, color: C.textStrong, fontWeight: 600 }}>{name}</div>
                                                        <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</div>
                                                        <div style={{ fontSize: 11, color: C.faint, display: "flex", alignItems: "center", gap: 4 }}>
                                                            {name === "Claude Code for VS Code" && <span style={{ color: "#7cd68f" }}>✓</span>} {author}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div style={{ marginTop: 8, fontSize: 11, letterSpacing: ".06em", color: C.textDim, fontWeight: 600 }}>
                                                <TreeRow label="RECOMMENDED" badge="8" />
                                            </div>
                                            {["Dev Containers", "Container Tools", "Microsoft Edge Tools for VS …"].map(name => (
                                                <div key={name} style={{ display: "flex", gap: 10, padding: "8px 12px" }}>
                                                    <div style={{ width: 32, height: 32, flex: "none", borderRadius: 6, background: "#252526", display: "grid", placeItems: "center", color: "#4daafc", fontSize: 13 }}>⬡</div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: 12.5, color: C.textStrong, fontWeight: 600 }}>{name}</div>
                                                        <div style={{ fontSize: 11, color: C.faint }}>Microsoft</div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div
                                                style={{
                                                    marginTop: 8,
                                                    fontSize: 11,
                                                    letterSpacing: ".06em",
                                                    color: C.textDim,
                                                    fontWeight: 600,
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
                                            {["console-ninja", "quickdb"].map(name => (
                                                <div
                                                    key={name}
                                                    ref={name === "quickdb" ? set("mcpServerQuickdbItem") : undefined}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                        padding: "8px 12px",
                                                        cursor: name === "quickdb" ? "pointer" : undefined,
                                                        background: name === "quickdb" && vsc.mcpServerTabOpen ? C.raised : "transparent",
                                                    }}
                                                >
                                                    <div style={{ width: 32, height: 32, flex: "none", borderRadius: 6, background: "#252526", display: "grid", placeItems: "center", color: "#c79bff", fontSize: 14 }}>📎</div>
                                                    <div style={{ fontSize: 13, color: C.textStrong, fontWeight: 600 }}>{name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Steps 98-103: the Claude Code extension's own panel — session
                                        list (left) driving a chat main pane; opened at step 98, the
                                        session itself only appears once step 101 sends the message. */}
                                    {vsc.view === "claudeCode" && (
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                                            <PanelTitle>Claude Code</PanelTitle>
                                            <div style={{ padding: "10px 14px", color: "#d97757", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ fontSize: 14 }}>+</span> New session
                                            </div>
                                            <div style={{ display: "flex", margin: "0 14px 10px", border: `1px solid ${C.line3}`, borderRadius: 4, overflow: "hidden", fontSize: 11.5 }}>
                                                <div style={{ flex: 1, textAlign: "center", padding: "4px 0", background: C.raised, color: C.textStrong }}>Local</div>
                                                <div style={{ flex: 1, textAlign: "center", padding: "4px 0", color: C.muted }}>Web</div>
                                            </div>
                                            <div style={{ margin: "0 14px 10px", height: 24, border: `1px solid ${C.line3}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", color: C.muted, fontSize: 11.5 }}>
                                                Search sessions…
                                            </div>
                                            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                                                {vsc.sent ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.raised, fontSize: 12.5, color: C.textStrong }}>
                                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: vsc.approved ? "#7cd68f" : "#4daafc", flex: "none" }} />
                                                        Query Atelier Graphique customer orders
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: "8px 14px", color: C.faint, fontSize: 12.5 }}>No sessions yet</div>
                                                )}
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
                                            {/* Query Console tab stays active through step 60 too —
                                                TARGETS[60,61] both point at visualizeBarBtn (hover, then
                                                click), same as the other icon-triggered panels, so the
                                                Visualization tab shouldn't take over until 61's click,
                                                not the instant 60 begins with the cursor still en route.
                                                Also active again once vizTabClosed (step 62's click on
                                                the Visualization tab's own ✕ lands back here). */}
                                            {((s >= 24 && s <= 60) || vizTabClosed) && (
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
                                            {/* Hidden again once vizTabClosed — step 62 closes this
                                                tab entirely, back to just Query Console above. */}
                                            {s >= 61 && s <= 62 && !vizTabClosed && (
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
                                                        <span>📊</span> QuickDB Visualization{" "}
                                                        <span
                                                            ref={set("closeVizTabBtn")}
                                                            style={{
                                                                opacity: s === 62 ? 1 : 0.6,
                                                                fontSize: 10,
                                                                cursor: "pointer",
                                                                color: s === 62 ? "#70baff" : undefined,
                                                            }}
                                                        >
                                                            ✕
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            {/* Steps 63-84: AI & MCP tabs. Accumulate (AI Settings, then
                                                +AI SQL Assistant) until AI Chat opens and resets the bar
                                                to just itself — same as the reference recording — then a
                                                Query Console tab appears/disappears around the "Open in
                                                Console" round trip (76-78), and MCP Tools/MCP Setup
                                                accumulate the same way Settings/SQL Assistant did. See
                                                aiOpenTabs/aiActiveTab. */}
                                            {s >= 63 &&
                                                vsc.view === "quickdb" &&
                                                aiOpenTabs(ai).map(t => {
                                                    const label =
                                                        t === "settings"
                                                            ? "AI Settings"
                                                            : t === "sqlAssistant"
                                                              ? "AI SQL Assistant"
                                                              : t === "chat"
                                                                ? "AI Chat"
                                                                : t === "console"
                                                                  ? "Query Console: Demo > classicmodels"
                                                                  : t === "mcpTools"
                                                                    ? "MCP Tools"
                                                                    : "MCP Setup";
                                                    const icon = t === "console" ? "📄" : t === "mcpTools" || t === "mcpSetup" ? "🧩" : "✨";
                                                    const isActive = activeAiTab === t;
                                                    return (
                                                        <div
                                                            key={t}
                                                            style={{
                                                                padding: "0 14px",
                                                                background: isActive ? "#1e1e1e" : "#181818",
                                                                borderTop: isActive ? "2px solid #0078d4" : "none",
                                                                borderRight: isActive ? "none" : "1px solid #2d2d2d",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                color: isActive ? "#fff" : "#888",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            <span>{icon}</span> {label}{" "}
                                                            {t === "console" ? (
                                                                <span
                                                                    ref={set("aiConsoleCloseTabBtn")}
                                                                    style={{
                                                                        opacity: s === 78 ? 1 : 0.6,
                                                                        fontSize: 10,
                                                                        cursor: "pointer",
                                                                        color: s === 78 ? "#70baff" : undefined,
                                                                    }}
                                                                >
                                                                    ✕
                                                                </span>
                                                            ) : (
                                                                <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                            {/* Steps 63-66 (AI Settings / AI SQL Assistant only): the
                                                reference recording still shows "employees", "customers"
                                                and the original Query Console tab sitting inactive in the
                                                background — left open rather than closed when AI Settings
                                                took over. They vanish once AI Chat opens and resets the
                                                bar to just itself (aiOpenTabs), matching the reference. */}
                                            {(activeAiTab === "settings" || activeAiTab === "sqlAssistant") && (
                                                <>
                                                    {["employees", "customers"].map(name => (
                                                        <div
                                                            key={name}
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
                                                            <span>📄</span> {name} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                        </div>
                                                    ))}
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
                                                        <span>📄</span> Query Console: Demo &gt; classicmodels <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                    </div>
                                                </>
                                            )}

                                            {/* Steps 96-103: In VS Code Extensions view (steps 96-97),
                                                "MCP Setup" and "MCP Server: quickdb" tabs are shown. Once
                                                the story moves into Claude Code panel (steps 98-103), those
                                                tabs are closed, leaving only the active Claude Code / session
                                                tab matching the reference image. */}
                                            {s >= 96 && (
                                                <>
                                                    {vsc.view !== "claudeCode" && (
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
                                                                <span>🧩</span> MCP Setup <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                            </div>
                                                            {vsc.mcpServerTabOpen && (
                                                                <div
                                                                    style={{
                                                                        padding: "0 14px",
                                                                        background: vsc.view === "extensions" ? "#1e1e1e" : "#181818",
                                                                        borderTop: vsc.view === "extensions" ? "2px solid #0078d4" : "none",
                                                                        borderRight: vsc.view === "extensions" ? "none" : "1px solid #2d2d2d",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 8,
                                                                        color: vsc.view === "extensions" ? "#fff" : "#888",
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    <span>📎</span> MCP Server: quickdb <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {vsc.view === "claudeCode" && (
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
                                                            <span>✱</span> {vsc.sent ? "Query Atelier Graphique …" : "Claude Code"} <span style={{ opacity: 0.6, fontSize: 10 }}>✕</span>
                                                        </div>
                                                    )}
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
                                                    ✳/◫/⋯ icons at the very top, not next to Run/AI. Stays
                                                    through step 60 too, and again once vizTabClosed — see
                                                    the tab-title comment above for why. */}
                                                {((s >= 24 && s <= 60) || vizTabClosed) && (
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

                                            {/* Step 24+: Active Query Console Webview Studio. Runs
                                                through step 60 (not just 59) — the Visualize button's
                                                hover step, so the results grid is still what's on screen
                                                while the cursor travels to it, matching the reference
                                                (image 40: still the results table, Visualize just
                                                highlighted on hover, no chart yet). Shows again once
                                                vizTabClosed (step 62 closes the chart tab). */}
                                            {((s >= 24 && s <= 60) || vizTabClosed) && (
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
                                                                                    background: s >= 59 ? "#0078d4" : "#2c2c2c",
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
                                                            panels — opens on the click step, not the hover.
                                                            Stays open through the Visualize hover (59, 60)
                                                            — there's no dedicated "close" step in the cursor
                                                            path (TARGETS[59] heads straight to Visualize
                                                            instead), and the drawer isn't force-closed early
                                                            either; it only goes away because step 61 swaps
                                                            the whole pane over to the Visualization view. */}
                                                        {s >= 52 && s <= 60 && (
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
                                                            <div ref={set("sqlSnippetsRightIcon")} title="SQL Snippets" style={{ color: s >= 51 && s <= 60 ? "#70baff" : "#888", cursor: "pointer" }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                                    <path d="M7 4.5h8.5L19 8v11.5a1 1 0 01-1 1H7a1 1 0 01-1-1v-14a1 1 0 011-1z" strokeLinejoin="round" />
                                                                    <path d="M15 4.5V8h4" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 61: QuickDB Visualization Full View — a real chart-
                                                builder layout (chart type, axis config, aggregation,
                                                style options, data inspector, and a labeled preview
                                                canvas), matching the reference. The earlier version was
                                                a bare two-box sketch with none of this.
                                                Gated on s>=61, not 60 — TARGETS[60,61] both point at
                                                visualizeBarBtn (hover, then click), so this shouldn't
                                                take over the instant step 60 begins, before the cursor
                                                has even set off toward the button. Step 60 still shows
                                                the results grid with Visualize highlighted on hover
                                                (image 40); only 61's click actually opens it (image 41).
                                                Closes again once vizTabClosed — step 62 hovers and clicks
                                                this view's own tab ✕, landing back on Query Console. */}
                                            {s >= 61 && s <= 62 && !vizTabClosed && (
                                                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#141418" }}>
                                                    {/* Toolbar */}
                                                    <div style={{ height: 38, flex: "none", background: "#1c1c22", borderBottom: "1px solid #2d2d35", display: "flex", alignItems: "center", padding: "0 14px", gap: 16, fontSize: 11.5, color: "#aaa" }}>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>⇄ Swap</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>+ Load Examples</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>⧉ Copy Spec</span>
                                                        <span style={{ flex: 1, textAlign: "center", color: "#eee", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            SELECT * FROM orderdetails ORDER B…
                                                        </span>
                                                        <span>↻</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>💾 Save</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>⬇ Download</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Go to ▾</span>
                                                        <span>?</span>
                                                    </div>

                                                    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
                                                        {/* Left Controls Panel */}
                                                        <div style={{ width: 280, background: "#1c1c22", borderRight: "1px solid #2d2d35", padding: 16, display: "flex", flexDirection: "column", gap: 18, fontSize: 11, overflow: "auto" }}>
                                                            <div>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <span style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>CHART TYPE</span>
                                                                    <span style={{ color: "#70baff", fontSize: 10.5 }}>Browse visual gallery →</span>
                                                                </div>
                                                                <div style={{ marginTop: 8, padding: "6px 10px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#fff", display: "flex", justifyContent: "space-between" }}>
                                                                    <span>Chart link</span>
                                                                    <span style={{ opacity: 0.6 }}>▾</span>
                                                                </div>
                                                                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                                                                    <span style={{ padding: "2px 8px", background: "#0078d4", color: "#fff", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>XY CHART</span>
                                                                    <span style={{ padding: "2px 8px", background: "#2a2a35", color: "#ccc", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>Line</span>
                                                                </div>
                                                                <div style={{ marginTop: 8, color: "#888", lineHeight: 1.4 }}>
                                                                    Map an X axis (category or time) and a Y axis (numeric value).
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ display: "flex", justifyContent: "space-between", color: "#ddd", fontWeight: 700 }}>
                                                                    <span>Axes &amp; Grouping</span>
                                                                    <span style={{ opacity: 0.6 }}>▾</span>
                                                                </div>
                                                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                                                                    <div>
                                                                        <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em" }}>X FIELD (AXIS)</div>
                                                                        <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                            <span style={{ color: "#fff" }}>productCode</span>
                                                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                                <span style={{ fontSize: 8.5, color: "#34d399", border: "1px solid #34d399", borderRadius: 2, padding: "0 3px" }}>ABC</span>
                                                                                <span style={{ fontSize: 8.5, color: "#34d399", border: "1px solid #34d399", borderRadius: 2, padding: "0 3px" }}>STR</span>
                                                                                <span style={{ opacity: 0.6 }}>▾</span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em" }}>Y FIELD (AXIS / VALUE)</div>
                                                                        <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                            <span style={{ color: "#fff" }}>orderLineNumber</span>
                                                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                                <span style={{ fontSize: 8.5, color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 2, padding: "0 3px" }}>#</span>
                                                                                <span style={{ fontSize: 8.5, color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 2, padding: "0 3px" }}>NUM</span>
                                                                                <span style={{ opacity: 0.6 }}>▾</span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ display: "flex", justifyContent: "space-between", color: "#ddd", fontWeight: 700 }}>
                                                                    <span>Configuration</span>
                                                                    <span style={{ opacity: 0.6 }}>▾</span>
                                                                </div>
                                                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                                                    <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em" }}>AGGREGATION</div>
                                                                    <div style={{ padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#666" }}>—</div>
                                                                    <div style={{ display: "flex", gap: 8 }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700 }}>X AXIS LABEL</div>
                                                                            <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#666" }}>Auto</div>
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700 }}>Y AXIS LABEL</div>
                                                                            <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#666" }}>Auto</div>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: "flex", gap: 8 }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700 }}>WIDTH</div>
                                                                            <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#666" }}>Auto</div>
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700 }}>HEIGHT</div>
                                                                            <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#666" }}>Auto</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ display: "flex", justifyContent: "space-between", color: "#ddd", fontWeight: 700 }}>
                                                                    <span>Style &amp; Options</span>
                                                                    <span style={{ opacity: 0.6 }}>▾</span>
                                                                </div>
                                                                <div style={{ marginTop: 8, padding: "6px 10px", background: "#252530", border: "1px dashed #3c3c4a", borderRadius: 4, color: "#70baff", textAlign: "center" }}>
                                                                    + Add option (29)
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>CUSTOM</div>
                                                                <div style={{ marginTop: 8 }}>
                                                                    <div style={{ color: "#888", fontSize: 9.5, fontWeight: 700 }}>Height</div>
                                                                    <div style={{ marginTop: 4, padding: "5px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#fff", display: "flex", justifyContent: "space-between" }}>
                                                                        <span>200</span>
                                                                        <span style={{ color: "#888" }}>🗑</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>DATA INSPECTOR</div>
                                                                <div style={{ marginTop: 8, color: "#aaa" }}>
                                                                    rows: <span style={{ color: "#70baff" }}>10</span> &nbsp; columns: <span style={{ color: "#70baff" }}>5</span>
                                                                </div>
                                                                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                                    {[
                                                                        ["orderNumber", "#"],
                                                                        ["productCode", "abc"],
                                                                        ["quantityOrdered", "#"],
                                                                        ["priceEach", "#"],
                                                                        ["orderLineNumber", "#"],
                                                                    ].map(([name, kind]) => (
                                                                        <span key={name} style={{ padding: "3px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#ccc", display: "flex", alignItems: "center", gap: 5 }}>
                                                                            {name} <span style={{ color: "#666" }}>{kind}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Preview Canvas */}
                                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#0e0e12" }}>
                                                            <div style={{ height: 30, flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#888", fontWeight: 700, letterSpacing: "0.05em" }}>
                                                                <span>PREVIEW CANVAS</span>
                                                                <span style={{ color: "#70baff" }}>10 rows</span>
                                                                <span>Chart link</span>
                                                            </div>
                                                            <div style={{ flex: 1, minHeight: 0, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                                                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>SELECT * FROM orderdetails ORDER BY orderNumber DESC LIMIT 1</div>
                                                                <div style={{ flex: 1, position: "relative" }}>
                                                                    <svg width="100%" height="100%" viewBox="0 0 780 300" preserveAspectRatio="xMidYMid meet">
                                                                        {[0, 2, 4, 6, 8, 10, 12, 14].map(v => {
                                                                            const y = 260 - (v / 14) * 240;
                                                                            return (
                                                                                <g key={v}>
                                                                                    <line x1="40" y1={y} x2="780" y2={y} stroke="rgba(255,255,255,0.06)" />
                                                                                    <text x="0" y={y + 4} fill="#666" fontSize="11">{v}</text>
                                                                                </g>
                                                                            );
                                                                        })}
                                                                        <polyline
                                                                            fill="none"
                                                                            stroke="#0078d4"
                                                                            strokeWidth="2"
                                                                            points="40,171 116,86 192,257 268,120 344,171 420,17 496,138 572,103 648,60 724,120"
                                                                        />
                                                                        {["S50_1392", "S32_2509", "S32_1268", "S24_2840", "S24_2300", "S24_1444", "S18_4600", "S18_3232", "S18_2432", "S18_2319"].map((label, i) => (
                                                                            <text key={label} x={40 + i * 76} y={282} fill="#888" fontSize="10" textAnchor="middle">{label}</text>
                                                                        ))}
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 63-65: AI Settings — Provider toggle (Editor model /
                                                Cloud (API key) / Local (Ollama)), each with its own
                                                description + config box, plus the shared GENERATION box
                                                underneath every provider. */}
                                            {activeAiTab === "settings" && (
                                                <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#181818", padding: "28px 40px", fontSize: 12.5, color: "#ccc" }}>
                                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <span style={{ fontSize: 22 }}>✨</span>
                                                            <div>
                                                                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>AI Settings</div>
                                                                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Choose how QuickDB&apos;s AI features run</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 8, flex: "none" }}>
                                                            <span style={{ padding: "6px 14px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Test providers</span>
                                                            <span style={{ padding: "6px 14px", background: "#e8e8e8", color: "#181818", borderRadius: 5, fontWeight: 700 }}>Save</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ maxWidth: 620, margin: "0 auto" }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 8 }}>Provider</div>
                                                        <div style={{ display: "flex", border: "1px solid #3a3a3a", borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
                                                            {(["editor", "cloud", "local"] as const).map(p => (
                                                                <div
                                                                    key={p}
                                                                    ref={p === "cloud" ? set("aiProviderCloudBtn") : p === "local" ? set("aiProviderLocalBtn") : undefined}
                                                                    style={{
                                                                        flex: 1,
                                                                        textAlign: "center",
                                                                        padding: "8px 0",
                                                                        cursor: "pointer",
                                                                        fontWeight: 600,
                                                                        background: ai.provider === p ? "#e8e8e8" : "transparent",
                                                                        color: ai.provider === p ? "#181818" : "#ccc",
                                                                        borderRight: p !== "local" ? "1px solid #3a3a3a" : "none",
                                                                    }}
                                                                >
                                                                    {p === "editor" ? "Editor model" : p === "cloud" ? "Cloud (API key)" : "Local (Ollama)"}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div style={{ color: "#999", marginBottom: 18, lineHeight: 1.6 }}>
                                                            {ai.provider === "editor" && "Uses your editor's built-in language model (Copilot / Continue / Cursor). No key needed — just be signed in to that model."}
                                                            {ai.provider === "cloud" && "Calls Anthropic, OpenAI, or Google Gemini directly with your own API key (stored securely in SecretStorage)."}
                                                            {ai.provider === "local" && "Calls a self-hosted Ollama server — fully local & private. Pick an installed model or pull a new one below."}
                                                        </div>

                                                        {ai.provider === "editor" && (
                                                            <div style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 16, marginBottom: 20, lineHeight: 1.6 }}>
                                                                The model is managed by your editor. Make sure Copilot (or a compatible language-model provider) is installed and signed in. Use <b style={{ color: "#fff" }}>Test providers</b> above to confirm.
                                                            </div>
                                                        )}

                                                        {ai.provider === "cloud" && (
                                                            <div style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 16, marginBottom: 20 }}>
                                                                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#888", letterSpacing: "0.05em", marginBottom: 12 }}>CLOUD</div>
                                                                <div style={{ display: "flex", border: "1px solid #3a3a3a", borderRadius: 6, overflow: "hidden", marginBottom: 12, maxWidth: 420 }}>
                                                                    {["Anthropic (Claude)", "OpenAI", "Google (Gemini)"].map((p, i) => (
                                                                        <div key={p} style={{ flex: 1, textAlign: "center", padding: "6px 0", fontSize: 11.5, fontWeight: 600, background: i === 0 ? "#e8e8e8" : "transparent", color: i === 0 ? "#181818" : "#ccc", borderRight: i < 2 ? "1px solid #3a3a3a" : "none" }}>{p}</div>
                                                                    ))}
                                                                </div>
                                                                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                                                    <div style={{ flex: 1, padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                        <span>API key (sk-ant-…)</span>
                                                                        <span style={{ opacity: 0.6, fontSize: 11 }}>⃠</span>
                                                                    </div>
                                                                    <span style={{ padding: "7px 14px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Save key</span>
                                                                </div>
                                                                <div style={{ color: "#70baff", fontSize: 11, marginBottom: 14 }}>Get a key at console.anthropic.com →</div>
                                                                <div style={{ fontSize: 11.5, color: "#ccc", marginBottom: 4 }}>Model <span style={{ color: "#777" }}>(blank = default)</span></div>
                                                                <div style={{ padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#666", marginBottom: 12 }}>claude-sonnet-4-5</div>
                                                                <div style={{ fontSize: 11.5, color: "#ccc", marginBottom: 4 }}>Custom API base URL <span style={{ color: "#777" }}>(optional)</span></div>
                                                                <div style={{ padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#666" }}>https://api.openai.com</div>
                                                                <div style={{ color: "#777", fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>Point the OpenAI vendor at any OpenAI-compatible endpoint — LM Studio, vLLM, OpenRouter, Groq, Together or Azure. Leave blank for the official API.</div>
                                                            </div>
                                                        )}

                                                        {ai.provider === "local" && (
                                                            <div style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 16, marginBottom: 20 }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                                                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>LOCAL (OLLAMA)</div>
                                                                    <span style={{ padding: "2px 8px", background: "rgba(124,214,143,0.15)", color: "#7cd68f", borderRadius: 10, fontSize: 10.5 }}>reachable · 5 models</span>
                                                                </div>
                                                                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                                                                    <div style={{ fontSize: 11.5, color: "#ccc" }}>URL</div>
                                                                    <div style={{ flex: 1, padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>http://localhost:11434</div>
                                                                    <span style={{ padding: "7px 14px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Check</span>
                                                                </div>
                                                                <div style={{ fontSize: 11.5, color: "#ccc", marginBottom: 4 }}>Active model <span style={{ color: "#777" }}>(blank = default llama3.1)</span></div>
                                                                <div style={{ padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#666", marginBottom: 12 }}>Pick an installed model ▾</div>
                                                                <div style={{ fontSize: 11.5, color: "#ccc", marginBottom: 4 }}>Pull a model</div>
                                                                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                                                    <div style={{ flex: 1, padding: "7px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#666" }}>e.g. qwen2.5-coder:7b</div>
                                                                    <span style={{ padding: "7px 14px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Pull</span>
                                                                </div>
                                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                                                    {["qwen2.5-coder:7b", "sqlcoder:7b", "llama3.1:8b", "llama3.2:3b"].map(m => (
                                                                        <span key={m} style={{ padding: "3px 8px", background: "#252530", border: "1px solid #3c3c4a", borderRadius: 4, color: "#aaa", fontSize: 10.5 }}>{m}</span>
                                                                    ))}
                                                                </div>
                                                                <div style={{ color: "#70baff", fontSize: 11 }}>Browse the full Ollama model library →</div>
                                                            </div>
                                                        )}

                                                        <div style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 16 }}>
                                                            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#888", letterSpacing: "0.05em", marginBottom: 14 }}>GENERATION</div>
                                                            <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ color: "#ccc", marginBottom: 6 }}>Temperature <span style={{ color: "#fff", fontWeight: 700 }}>0.20</span></div>
                                                                    <div style={{ height: 3, background: "#3a3a3a", borderRadius: 2, position: "relative" }}>
                                                                        <div style={{ position: "absolute", left: "20%", top: -4, width: 11, height: 11, borderRadius: "50%", background: "#e8e8e8" }} />
                                                                    </div>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#777", marginTop: 4 }}><span>exact</span><span>creative</span></div>
                                                                    <div style={{ color: "#777", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>Low values keep generated SQL predictable — 0–0.3 is a good range.</div>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ color: "#ccc", marginBottom: 6 }}>Max tokens</div>
                                                                    <div style={{ padding: "6px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc", maxWidth: 120 }}>1024</div>
                                                                    <div style={{ color: "#777", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>Upper bound on the reply length. Raise it if long schemas get truncated.</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ color: "#ccc", marginBottom: 6 }}>Request timeout</div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <div style={{ padding: "6px 10px", background: "#141414", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc", maxWidth: 90 }}>60</div>
                                                                <span style={{ color: "#888" }}>s</span>
                                                            </div>
                                                            <div style={{ color: "#777", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>Gives up instead of spinning forever when a model stalls.</div>
                                                        </div>

                                                        <div style={{ color: "#777", fontSize: 11, marginTop: 16, marginBottom: 24, lineHeight: 1.6 }}>
                                                            All four AI tools (SQL Assistant, Chat, Advisor, Data Quality) use whatever you pick here. Don&apos;t forget to <b style={{ color: "#ccc" }}>Save</b>.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 66: AI SQL Assistant — a brief glance at the NL→SQL
                                                tab before the cursor moves on to AI Chat; nothing here is
                                                actually clicked in the reference flow. */}
                                            {activeAiTab === "sqlAssistant" && (
                                                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#181818" }}>
                                                    <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2b2b2b" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <span style={{ fontSize: 18 }}>✨</span>
                                                            <div>
                                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI SQL Assistant</div>
                                                                <div style={{ fontSize: 11, color: "#888" }}>Editor model</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                                                            <span style={{ padding: "4px 10px", background: "#252526", border: "1px solid #3a3a3a", borderRadius: 4, color: "#ccc" }}>Demo (mysql)</span>
                                                            <span style={{ padding: "4px 10px", background: "#252526", border: "1px solid #3a3a3a", borderRadius: 4, color: "#ccc" }}>classicmodels</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", padding: "10px 24px", gap: 4, borderBottom: "1px solid #2b2b2b", fontSize: 12 }}>
                                                        {["NL → SQL", "Explain", "Optimize", "Fix", "Document"].map((t, i) => (
                                                            <span key={t} style={{ padding: "5px 12px", borderRadius: 5, background: i === 0 ? "#2a2a2a" : "transparent", color: i === 0 ? "#fff" : "#888", fontWeight: i === 0 ? 600 : 400 }}>{t}</span>
                                                        ))}
                                                        <span style={{ marginLeft: "auto", padding: "5px 14px", background: "#e8e8e8", color: "#181818", borderRadius: 5, fontWeight: 700, fontSize: 11.5 }}>Generate</span>
                                                    </div>
                                                    <div style={{ padding: "16px 24px" }}>
                                                        <div style={{ padding: "10px 12px", background: "#1e1e1e", border: "1px solid #3a3a3a", borderRadius: 6, color: "#666", fontSize: 12.5, minHeight: 60 }}>
                                                            Describe what you want, e.g. &quot;top 10 customers by total order value last month&quot;
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#777" }}>
                                                        <span style={{ fontSize: 24 }}>✨</span>
                                                        <div style={{ fontSize: 12.5 }}>Pick a connection, describe your query, and let AI write the SQL.</div>
                                                        <div style={{ fontSize: 11 }}>Schema is sent as context so columns are accurate.</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 67-75: AI Chat — connection/database pick, type and
                                                send a question, a simulated "thinking…" pause, the SQL
                                                reply with Run/Open in Console/Copy, and its own inline
                                                results once Run is clicked. */}
                                            {activeAiTab === "chat" && (
                                                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#181818" }}>
                                                    <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2b2b2b" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <span style={{ fontSize: 18 }}>💬</span>
                                                            <div>
                                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI Chat</div>
                                                                <div style={{ fontSize: 11, color: "#888" }}>Grounded in your schema · Editor model</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 8, fontSize: 11, position: "relative" }}>
                                                            {ai.sent ? (
                                                                <span style={{ padding: "4px 12px", border: "1px solid #3a3a3a", borderRadius: 4, color: "#ccc" }}>Clear</span>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        ref={set("aiChatConnBtn")}
                                                                        style={{
                                                                            padding: "4px 10px",
                                                                            background: ai.connDropdownOpen ? "rgba(0,120,212,0.3)" : "#252526",
                                                                            border: ai.connDropdownOpen ? "1px solid #0078d4" : "1px solid #3a3a3a",
                                                                            borderRadius: 4,
                                                                            color: ai.connPicked ? "#fff" : "#888",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 4,
                                                                        }}
                                                                    >
                                                                        {ai.connPicked ? "Demo (mysql)" : "Connection"} <span style={{ opacity: 0.6 }}>▾</span>
                                                                    </div>
                                                                    {ai.connPicked && (
                                                                        <div
                                                                            ref={set("aiChatDbBtn")}
                                                                            style={{
                                                                                padding: "4px 10px",
                                                                                background: ai.dbDropdownOpen ? "rgba(0,120,212,0.3)" : "#252526",
                                                                                border: ai.dbDropdownOpen ? "1px solid #0078d4" : "1px solid #3a3a3a",
                                                                                borderRadius: 4,
                                                                                color: ai.dbPicked ? "#fff" : "#888",
                                                                                cursor: "pointer",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 4,
                                                                            }}
                                                                        >
                                                                            {ai.dbPicked ? "classicmodels" : "Database"} <span style={{ opacity: 0.6 }}>▾</span>
                                                                        </div>
                                                                    )}
                                                                    {ai.connDropdownOpen && (
                                                                        <div style={{ position: "absolute", top: 28, left: 0, background: "#252526", border: "1px solid #454545", borderRadius: 4, minWidth: 130, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                                                                            <div ref={set("aiChatConnDemoOption")} style={{ padding: "8px 12px", background: "rgba(0,120,212,0.25)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                                                                                Demo (mysql)
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {ai.dbDropdownOpen && (
                                                                        <div style={{ position: "absolute", top: 28, right: 0, background: "#252526", border: "1px solid #454545", borderRadius: 4, minWidth: 150, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                                                                            {MCP_DATABASES.map(db => (
                                                                                <div
                                                                                    key={db}
                                                                                    ref={db === "classicmodels" ? set("aiChatDbClassicOption") : undefined}
                                                                                    style={{
                                                                                        padding: "8px 12px",
                                                                                        background: db === "classicmodels" ? "rgba(0,120,212,0.25)" : "transparent",
                                                                                        color: db === "classicmodels" ? "#fff" : "#ccc",
                                                                                        cursor: "pointer",
                                                                                        whiteSpace: "nowrap",
                                                                                    }}
                                                                                >
                                                                                    {db}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", padding: 24, gap: 16 }}>
                                                        {!ai.sent && (
                                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#777" }}>
                                                                <span style={{ fontSize: 24 }}>💬</span>
                                                                <div style={{ fontSize: 12.5, textAlign: "center" }}>Ask about your data, request a query, or iterate — the assistant knows your schema.</div>
                                                                <div style={{ fontSize: 11, textAlign: "center" }}>e.g. &quot;how many orders per status last week?&quot; then &quot;now only paid ones&quot;.</div>
                                                            </div>
                                                        )}

                                                        {ai.sent && (
                                                            <>
                                                                <div style={{ alignSelf: "flex-end", maxWidth: "70%", padding: "10px 16px", background: "#2a2a2a", color: "#fff", borderRadius: 10, fontSize: 12.5 }}>
                                                                    {AI_CHAT_QUESTION}
                                                                </div>

                                                                {!ai.responded && (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 12.5 }}>
                                                                        <span>⚙</span> thinking…
                                                                    </div>
                                                                )}

                                                                {ai.responded && (
                                                                    <div style={{ maxWidth: 620, border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", overflow: "hidden" }}>
                                                                        <pre style={{ margin: 0, padding: 14, fontFamily: MONO, fontSize: 12, color: "#7ee787", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{AI_CHAT_SQL}</pre>
                                                                        <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #2f2f2f" }}>
                                                                            <span ref={set("aiChatRunBtn")} style={{ padding: "5px 14px", background: ai.ranInChat ? "#0078d4" : "#2a2a2a", color: "#fff", borderRadius: 5, fontSize: 11.5, cursor: "pointer" }}>
                                                                                Run
                                                                            </span>
                                                                            <span ref={set("aiChatOpenConsoleBtn")} style={{ padding: "5px 14px", background: "#2a2a2a", color: "#ccc", borderRadius: 5, fontSize: 11.5, cursor: "pointer" }}>
                                                                                Open in Console
                                                                            </span>
                                                                            <span style={{ padding: "5px 14px", background: "#2a2a2a", color: "#ccc", borderRadius: 5, fontSize: 11.5, cursor: "pointer" }}>Copy</span>
                                                                        </div>
                                                                        {ai.ranInChat && (
                                                                            <div style={{ borderTop: "1px solid #2f2f2f" }}>
                                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", padding: "6px 14px", fontSize: 10.5, color: "#888", borderBottom: "1px solid #2b2b2b" }}>
                                                                                    <span>productName</span><span>totalOrdered</span>
                                                                                </div>
                                                                                {AI_CHAT_RESULT_ROWS.map(([name, n]) => (
                                                                                    <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 120px", padding: "6px 14px", fontSize: 11.5, color: "#ccc", borderBottom: "1px solid #232323" }}>
                                                                                        <span>{name}</span><span>{n}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <div style={{ padding: "14px 24px", borderTop: "1px solid #2b2b2b", display: "flex", gap: 10 }}>
                                                        <div
                                                            ref={set("aiChatInput")}
                                                            style={{
                                                                flex: 1,
                                                                padding: "9px 12px",
                                                                background: "#1e1e1e",
                                                                border: "1px solid #3a3a3a",
                                                                borderRadius: 6,
                                                                color: ai.dbPicked && !ai.sent && ai.questionChars ? "#eee" : "#666",
                                                                fontSize: 12.5,
                                                            }}
                                                        >
                                                            {ai.dbPicked
                                                                ? !ai.sent && ai.questionChars
                                                                    ? AI_CHAT_QUESTION.slice(0, ai.questionChars)
                                                                    : "Ask anything about your database… (Enter to send, Shift+Enter for newline)"
                                                                : ai.connPicked
                                                                  ? "Pick a database first"
                                                                  : "Pick a connection first"}
                                                        </div>
                                                        <span
                                                            ref={set("aiChatSendBtn")}
                                                            style={{
                                                                padding: "9px 20px",
                                                                borderRadius: 6,
                                                                fontSize: 12.5,
                                                                fontWeight: 600,
                                                                background: ai.dbPicked && !ai.sent ? (s === 73 ? "#0078d4" : "#2a2a2a") : "#222",
                                                                color: ai.dbPicked && !ai.sent ? "#fff" : "#555",
                                                                cursor: ai.dbPicked && !ai.sent ? "pointer" : "default",
                                                            }}
                                                        >
                                                            Send
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 76-78: the Query Console tab opened via AI Chat's
                                                "Open in Console" — the same generated SQL, run again, then
                                                closed via its own tab ✕ (wired in the tab bar above). */}
                                            {activeAiTab === "console" && (
                                                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
                                                    <div style={{ height: 38, flex: "none", display: "flex", alignItems: "center", padding: "0 14px", gap: 10, borderBottom: "1px solid #2d2d2d", fontSize: 11.5, color: "#ccc" }}>
                                                        <span
                                                            ref={set("aiConsoleRunBtn")}
                                                            style={{
                                                                padding: "5px 14px",
                                                                borderRadius: 5,
                                                                background: ai.consoleRan ? "#0078d4" : "#1e1e1e",
                                                                border: ai.consoleRan ? "none" : "1px solid #3a3a3a",
                                                                color: "#fff",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                            }}
                                                        >
                                                            ▷ Run
                                                        </span>
                                                        <span style={{ marginLeft: "auto", color: "#888" }}>Demo · mysql</span>
                                                        <span style={{ padding: "3px 10px", background: "#252526", border: "1px solid #3a3a3a", borderRadius: 4 }}>classicmodels</span>
                                                    </div>

                                                    <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#888", borderBottom: "1px solid #2b2b2b" }}>
                                                        <span style={{ letterSpacing: "0.05em", fontWeight: 700 }}>SQL QUERY</span>
                                                        <span>7 lines · 303 chars</span>
                                                    </div>

                                                    <div style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7, color: "#d4d4d4", flex: ai.consoleRan ? "none" : 1 }}>
                                                        {AI_CHAT_SQL.split("\n").map((line, i) => (
                                                            <div key={i} style={{ display: "flex", gap: 14 }}>
                                                                <span style={{ color: "#5a5a5a", width: 18, textAlign: "right", flex: "none" }}>{i + 1}</span>
                                                                <span>{line}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {ai.consoleRan && (
                                                        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", borderTop: "1px solid #2b2b2b" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", fontSize: 11 }}>
                                                                <span style={{ color: "#7cd68f" }}>OK</span><span style={{ color: "#ccc" }}>7 rows</span><span style={{ color: "#888" }}>2 cols · 6ms</span>
                                                            </div>
                                                            <div style={{ flex: 1, overflow: "auto" }}>
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", padding: "6px 14px", fontSize: 10.5, color: "#888", borderBottom: "1px solid #2b2b2b", position: "sticky", top: 0, background: "#1e1e1e" }}>
                                                                    <span>productName</span><span>totalOrdered</span>
                                                                </div>
                                                                {AI_CHAT_RESULT_ROWS.map(([name, n]) => (
                                                                    <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 120px", padding: "6px 14px", fontSize: 11.5, color: "#ccc", borderBottom: "1px solid #232323" }}>
                                                                        <span>{name}</span><span>{n}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ height: 22, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 10px", borderTop: "1px solid #2b2b2b", fontSize: 10.5, color: "#888" }}>
                                                        <span>{ai.consoleRan ? "7 rows · 6ms" : "Ready"}</span>
                                                        <span style={{ marginLeft: "auto" }}>Ln 1, Col 1 · Ctrl/Cmd+Enter: Run</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 79-81: MCP Tools — the 48-tool catalog, category
                                                pills, stat cards, and a scrollable two-column card grid
                                                (scroll driven by ai.mcpScroll, steps 80-81), plus the
                                                "MCP client setup →" link that opens MCP Setup. */}
                                            {activeAiTab === "mcpTools" && (
                                                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#181818" }}>
                                                    <div style={{ padding: "16px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #2b2b2b" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <span style={{ fontSize: 18 }}>🧩</span>
                                                            <div>
                                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>MCP Tools</div>
                                                                <div style={{ fontSize: 11, color: "#888" }}>48 tools exposed to AI agents · 4 write-gated</div>
                                                            </div>
                                                        </div>
                                                        <span
                                                            ref={set("mcpClientSetupLinkBtn")}
                                                            style={{ padding: "6px 14px", background: s >= 81 ? "#0078d4" : "#2a2a2a", color: "#fff", borderRadius: 5, fontSize: 11.5, cursor: "pointer", flex: "none" }}
                                                        >
                                                            MCP client setup →
                                                        </span>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 4, padding: "10px 24px", fontSize: 11, color: "#888", flexWrap: "wrap", borderBottom: "1px solid #2b2b2b" }}>
                                                        {["All (48)", "Connections (2)", "Schema (12)", "Read (44)", "Write (4)", "Stats (11)", "Visualization (4)", "Design (1)", "Admin (0)", "Reports (5)", "AI (0)", "Monitor (0)"].map((t, i) => (
                                                            <span key={t} style={{ padding: "4px 10px", borderRadius: 4, background: i === 0 ? "#2a2a2a" : "transparent", color: i === 0 ? "#fff" : "#888" }}>{t}</span>
                                                        ))}
                                                    </div>

                                                    <div style={{ display: "flex", gap: 12, padding: "16px 24px" }}>
                                                        {([["48", "Total Tools", "#fff"], ["4", "Write Tools", "#ff8a8a"], ["44", "Read Tools", "#7cd68f"], ["0", "AI Tools", "#9aa5ff"]] as const).map(([n, label, color]) => (
                                                            <div key={label} style={{ flex: 1, border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: "14px 0", textAlign: "center" }}>
                                                                <div style={{ fontSize: 20, fontWeight: 700, color }}>{n}</div>
                                                                <div style={{ fontSize: 10.5, color: "#888", marginTop: 4 }}>{label}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div style={{ padding: "0 24px 10px", fontSize: 11, color: "#888", lineHeight: 1.5 }}>
                                                        These tools are available to any MCP client (the in-editor @quickdb chat participant, Claude Desktop, etc.). <span style={{ color: "#ff8a8a" }}>Write tools</span> require auto-detected write privileges or explicit user overrides in the MCP Setup.
                                                    </div>

                                                    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "0 24px 24px" }}>
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, transform: `translateY(-${ai.mcpScroll}px)` }}>
                                                            {MCP_TOOLS.map(tool => (
                                                                <div key={tool.name} style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 12 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span style={{ fontFamily: MONO, fontSize: 12, color: "#eee", fontWeight: 700 }}>{tool.name}</span>
                                                                            <span style={{ fontSize: 9.5, padding: "1px 7px", borderRadius: 8, background: `${BADGE_TINT[tool.badge]}22`, color: BADGE_TINT[tool.badge] }}>{tool.badge}</span>
                                                                        </div>
                                                                        <span style={{ fontSize: 10.5, color: "#888" }}>Copy</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: "#999", marginTop: 6, lineHeight: 1.5 }}>{tool.desc}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 81-84: MCP Setup — Connections toggle, the AI
                                                Clients grid (only Antigravity is actually interacted
                                                with: expand per-database access, grant Read on
                                                classicmodels, Update). */}
                                            {activeAiTab === "mcpSetup" && !vsc.mcpServerTabOpen && vsc.view !== "claudeCode" && (
                                              <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                                                <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#181818", padding: "20px 24px", position: "relative" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <span style={{ fontSize: 18 }}>🧩</span>
                                                            <div>
                                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Setup MCP for AI Clients</div>
                                                                <div style={{ fontSize: 11, color: "#888" }}>Connect your databases to AI coding assistants</div>
                                                            </div>
                                                        </div>
                                                        <span style={{ padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc", fontSize: 11, flex: "none" }}>↻ Refresh</span>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: "#888", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>
                                                        <span>STEP 1</span><span style={{ color: "#ccc", fontWeight: 400, letterSpacing: 0 }}>Connections</span>
                                                        <span style={{ marginLeft: "auto", color: "#888", fontWeight: 400 }}>1 / 1 enabled</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: "10px 14px", marginBottom: 24 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#fff" }}>
                                                            <span style={{ color: "#4daafc" }}>⛁</span> Demo <span style={{ color: "#888", fontWeight: 400 }}>mysql</span>
                                                        </div>
                                                        <span style={{ width: 30, height: 16, borderRadius: 8, background: "#0078d4", position: "relative", display: "inline-block" }}>
                                                            <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                                                        </span>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: "#888", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 12 }}>
                                                        <span>STEP 2</span><span style={{ color: "#ccc", fontWeight: 400, letterSpacing: 0 }}>AI Clients</span>
                                                        <span style={{ color: "#888", fontWeight: 400 }}>6 detected · 6 configured</span>
                                                        <span style={{ marginLeft: "auto", padding: "5px 12px", background: "#e8e8e8", color: "#181818", borderRadius: 5, fontWeight: 700, fontSize: 11 }}>Setup All Detected</span>
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                                                        {MCP_CLIENTS.map(c => {
                                                            const isAg = c.name === "Antigravity";
                                                            const read = isAg && ai.readSelected;
                                                            return (
                                                                <div key={c.name} style={{ border: "1px solid #2f2f2f", borderRadius: 8, background: "#1e1e1e", padding: 14 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                        <span style={{ color: c.tint }}>{c.icon}</span>
                                                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{c.name}</span>
                                                                        <span style={{ fontSize: 10.5, color: c.configured ? "#7cd68f" : "#888" }}>{c.configured ? "✓ Configured" : "Not found"}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 10, color: "#666", marginBottom: 10, wordBreak: "break-all" }}>{c.path}</div>

                                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 6 }}>
                                                                        <span style={{ letterSpacing: "0.04em" }}>DATABASES &amp; PERMISSIONS</span>
                                                                        <span style={{ color: "#70baff" }}>Deselect all</span>
                                                                    </div>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#ccc", marginBottom: 4 }}>
                                                                        <span style={{ color: "#7cd68f" }}>✓</span>
                                                                        <span style={{ color: "#4daafc" }}>⛁</span> Demo
                                                                        <div style={{ marginLeft: "auto", display: "flex", gap: 4, fontSize: 10 }}>
                                                                            <span style={{ padding: "2px 7px", borderRadius: 3, background: "#0078d4", color: "#fff" }}>Auto</span>
                                                                            <span style={{ padding: "2px 7px", borderRadius: 3, background: "#2a2a2a", color: "#ccc" }}>Read</span>
                                                                            <span style={{ padding: "2px 7px", borderRadius: 3, background: "#2a2a2a", color: "#ccc" }}>Write</span>
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        ref={isAg ? set("mcpPerDbAccessLink") : undefined}
                                                                        style={{
                                                                            fontSize: 10.5,
                                                                            color: "#888",
                                                                            cursor: isAg ? "pointer" : undefined,
                                                                            textDecoration: isAg && ai.perDbExpanded ? "underline" : "none",
                                                                            marginBottom: 6,
                                                                        }}
                                                                    >
                                                                        › Per-database access{isAg && ai.perDbExpanded ? " (1 set)" : ""}
                                                                    </div>

                                                                    {isAg && ai.perDbExpanded && (
                                                                        <div style={{ marginBottom: 8 }}>
                                                                            {MCP_DATABASES.map(db => {
                                                                                const isClassic = db === "classicmodels";
                                                                                const dbRead = isClassic && read;
                                                                                return (
                                                                                    <div key={db} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#ccc", padding: "3px 0" }}>
                                                                                        <span style={{ flex: 1 }}>{db}</span>
                                                                                        {dbRead && <span style={{ color: "#666", fontSize: 9.5 }}>↺ inherit</span>}
                                                                                        <div style={{ display: "flex", gap: 4, fontSize: 10 }}>
                                                                                            <span style={{ padding: "2px 7px", borderRadius: 3, background: !dbRead ? "#0078d4" : "#2a2a2a", color: "#fff" }}>Auto</span>
                                                                                            <span
                                                                                                ref={isClassic ? set("mcpReadBtn") : undefined}
                                                                                                style={{
                                                                                                    padding: "2px 7px",
                                                                                                    borderRadius: 3,
                                                                                                    background: dbRead ? "#2e7d32" : "#2a2a2a",
                                                                                                    color: "#fff",
                                                                                                    cursor: isClassic ? "pointer" : undefined,
                                                                                                }}
                                                                                            >
                                                                                                Read
                                                                                            </span>
                                                                                            <span style={{ padding: "2px 7px", borderRadius: 3, background: "#2a2a2a", color: "#ccc" }}>Write</span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}

                                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                                                                        <div style={{ fontSize: 10, color: "#888" }}>
                                                                            1 / 1 databases
                                                                            <br />
                                                                            <span style={{ color: "#e2b13c" }}>↳ 48 tools (4 write)</span>
                                                                        </div>
                                                                        {c.configured ? (
                                                                            <span
                                                                                ref={isAg ? set("mcpUpdateBtn") : undefined}
                                                                                style={{
                                                                                    padding: "5px 14px",
                                                                                    background: isAg && ai.updateClicked ? "#0078d4" : "#2a2a2a",
                                                                                    color: "#fff",
                                                                                    borderRadius: 5,
                                                                                    fontSize: 11,
                                                                                    cursor: isAg ? "pointer" : undefined,
                                                                                }}
                                                                            >
                                                                                Update
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{ padding: "5px 14px", background: "#222", color: "#555", borderRadius: 5, fontSize: 11 }}>Setup</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {ai.updateClicked && (
                                                        <div style={{ position: "absolute", top: 70, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#252526", border: "1px solid #454545", borderRadius: 6, fontSize: 12, color: "#eee", boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                                                            <span style={{ color: "#7cd68f" }}>✓</span> antigravity configured — restart the client to load tools
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Steps 89-95: the editor's own docked Agent panel — proof
                                                    the Update actually wired quickdb in. Revealed together
                                                    with the Settings modal closing (step 89); header text
                                                    tracks the conversation's own state the same way a real
                                                    agent panel would (idle "Agent" → the mentioned server's
                                                    name once picked → a generated title once it starts
                                                    actually working). */}
                                                {ide.agentPanelOpen && vsc.view === "quickdb" && (
                                                    <div style={{ width: 320, flex: "none", background: "#1c1c1c", borderLeft: "1px solid #2d2d2d", display: "flex", flexDirection: "column" }}>
                                                        <div style={{ height: 38, flex: "none", display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid #2d2d2d", fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
                                                            {ide.workingPhase >= 2 || ide.resultReady ? "Atelier Graphique Order Analysis" : ide.mcpPicked ? "quickdb" : "Agent"}
                                                            <span style={{ marginLeft: "auto", display: "flex", gap: 10, color: "#888", fontWeight: 400, fontSize: 13 }}>
                                                                <span>+</span><span>↻</span><span>···</span><span>✕</span>
                                                            </span>
                                                        </div>

                                                        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12, fontSize: 12 }}>
                                                            {!ide.sent ? (
                                                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#777", textAlign: "center" }}>
                                                                    <span style={{ fontSize: 20 }}>✦</span>
                                                                    <div>Ask anything, @ to mention, / for actions</div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ color: "#ccc", lineHeight: 1.6 }}>
                                                                        <span style={{ color: "#70baff" }}>@mcp:quickdb:</span> {AI_CHAT_QUESTION}
                                                                    </div>

                                                                    {!ide.resultReady && (
                                                                        <div style={{ color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
                                                                            <span>⚙</span> Working
                                                                        </div>
                                                                    )}

                                                                    {ide.workingPhase >= 2 && !ide.resultReady && (
                                                                        <div style={{ border: "1px solid #2f2f2f", borderRadius: 6, background: "#181818", padding: 10 }}>
                                                                            <div style={{ color: "#ccc", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                                                                <span>📁</span> Exploring 1 file, 2 folders <span style={{ marginLeft: "auto", color: "#666" }}>⌄</span>
                                                                            </div>
                                                                            {AI_CHAT_RESULT_ROWS.slice(4, 7).map(([name], i) => (
                                                                                <div key={name} style={{ display: "flex", gap: 8, color: "#999", padding: "2px 0" }}>
                                                                                    <span style={{ color: "#666" }}>{i + 5}</span>
                                                                                    <span>{name}</span>
                                                                                </div>
                                                                            ))}
                                                                            <div style={{ color: "#ccc", marginTop: 8, marginBottom: 4, fontWeight: 700 }}>Generated SQL:</div>
                                                                            <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, color: "#7ee787", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{AI_CHAT_SQL}</pre>
                                                                            <div style={{ color: "#888", marginTop: 8 }}>Working..</div>
                                                                        </div>
                                                                    )}

                                                                    {ide.resultReady && (
                                                                        <div style={{ color: "#ccc" }}>
                                                                            <div style={{ color: "#70baff", display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                                                                                Worked for 33s <span>›</span>
                                                                            </div>
                                                                            <div style={{ lineHeight: 1.6, marginBottom: 10 }}>
                                                                                The customer <b style={{ color: "#fff" }}>Atelier Graphique</b> ordered <b style={{ color: "#fff" }}>7 different products</b> (totaling 270 items).
                                                                            </div>
                                                                            <div style={{ marginBottom: 8 }}>Here are the names of the products they ordered along with the quantities:</div>
                                                                            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                                                                                {[...AI_CHAT_RESULT_ROWS].sort((a, b) => b[1] - a[1]).map(([name, n]) => (
                                                                                    <li key={name}>
                                                                                        <b style={{ color: "#fff" }}>{name}</b> ({n} items)
                                                                                    </li>
                                                                                ))}
                                                                            </ol>
                                                                            <div style={{ marginTop: 10, display: "flex", gap: 12, color: "#666" }}>
                                                                                <span>⧉</span><span>👍</span><span>👎</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        <div style={{ flex: "none", padding: 10, borderTop: "1px solid #2d2d2d" }}>
                                                            {ide.mcpPicked && !ide.sent && (
                                                                <div style={{ marginBottom: 6 }}>
                                                                    <span style={{ padding: "2px 8px", borderRadius: 4, background: "#252530", border: "1px solid #3c3c4a", color: "#70baff", fontSize: 10.5 }}>quickdb</span>
                                                                </div>
                                                            )}
                                                            <div
                                                                ref={set("agentChatInput")}
                                                                style={{
                                                                    minHeight: 40,
                                                                    padding: "8px 10px",
                                                                    background: "#141414",
                                                                    border: "1px solid #3a3a3a",
                                                                    borderRadius: 6,
                                                                    fontSize: 11.5,
                                                                    color: ide.sent ? "#555" : "#ccc",
                                                                    position: "relative",
                                                                }}
                                                            >
                                                                {!ide.sent && ide.mcpAutocompleteOpen && (
                                                                    <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 6, width: 240, background: "#252526", border: "1px solid #454545", borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.5)", overflow: "hidden", zIndex: 10 }}>
                                                                        <div style={{ padding: "8px 12px", color: "#ccc", display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span>🔧</span> chrome-devtools-mcp
                                                                        </div>
                                                                        <div
                                                                            ref={set("mcpAutocompleteQuickdbOption")}
                                                                            style={{ padding: "8px 12px", background: "rgba(0,120,212,0.25)", color: "#fff", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                                                                        >
                                                                            <span>🔧</span> quickdb
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {ide.sent ? (
                                                                    "Ask anything, @ to mention, / for actions"
                                                                ) : ide.mcpPicked ? (
                                                                    <>
                                                                        <span style={{ color: "#70baff" }}>@mcp:quickdb:</span>{" "}
                                                                        {ide.questionChars ? AI_CHAT_QUESTION.slice(0, ide.questionChars) : ""}
                                                                    </>
                                                                ) : s >= 90 ? (
                                                                    <span style={{ color: "#70baff" }}>@mcp:</span>
                                                                ) : (
                                                                    <span style={{ color: "#666" }}>Ask anything, @ to mention, / for actions</span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 11, color: "#888" }}>
                                                                <span>+</span>
                                                                <span>Gemini 3.1 Pro High ⌄</span>
                                                                <span style={{ marginLeft: "auto" }}>🎤</span>
                                                                <span
                                                                    ref={set("agentSendBtn")}
                                                                    style={{
                                                                        width: 22,
                                                                        height: 22,
                                                                        borderRadius: "50%",
                                                                        display: "grid",
                                                                        placeItems: "center",
                                                                        background:
                                                                            !ide.sent && ide.mcpPicked
                                                                                ? s === 93
                                                                                    ? "#0078d4"
                                                                                    : "#2a2a2a"
                                                                                : ide.sent && !ide.resultReady
                                                                                  ? "#d64545"
                                                                                  : "#2a2a2a",
                                                                        color: "#fff",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    {ide.sent && !ide.resultReady ? "■" : "➤"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Step 97: the "MCP Server: quickdb" config tab opened from
                                                the Extensions view's MCP Servers list — the real server
                                                entry (command/args/env), not a QuickDB-drawn mockup. */}
                                            {vsc.view === "extensions" && vsc.mcpServerTabOpen && (
                                                <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#181818", padding: "28px 40px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                                                        <div style={{ width: 56, height: 56, borderRadius: 10, background: "#252526", display: "grid", placeItems: "center", color: "#c79bff", fontSize: 24 }}>📎</div>
                                                        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>quickdb</div>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                                                        <span style={{ padding: "5px 14px", background: "#0078d4", color: "#fff", borderRadius: 4, fontSize: 12 }}>Uninstall</span>
                                                        <span style={{ padding: "5px 14px", border: "1px solid #3a3a3a", color: "#ccc", borderRadius: 4, fontSize: 12 }}>Disable</span>
                                                    </div>
                                                    <div style={{ borderBottom: "2px solid #0078d4", display: "inline-block", padding: "4px 0", color: "#fff", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 20 }}>
                                                        CONFIGURATION
                                                    </div>
                                                    {([
                                                        ["Name:", "quickdb", false],
                                                        ["Type:", "stdio", false],
                                                        ["Command:", "node", true],
                                                    ] as const).map(([label, val, mono]) => (
                                                        <div key={label} style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 13 }}>
                                                            <span style={{ width: 90, color: "#999", flex: "none" }}>{label}</span>
                                                            <span style={{ color: "#eee", fontFamily: mono ? MONO : undefined }}>{val}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 13, alignItems: "flex-start" }}>
                                                        <span style={{ width: 90, color: "#999", flex: "none" }}>Arguments:</span>
                                                        <span style={{ color: "#ccc", fontFamily: MONO, fontSize: 12, background: "#1e1e1e", padding: "4px 8px", borderRadius: 4 }}>
                                                            /Users/nazmulhaque/.vscode/extensions/quickdb.quickdb-1.2.9/dist/server.js
                                                        </span>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 16, fontSize: 13, alignItems: "flex-start" }}>
                                                        <span style={{ width: 90, color: "#999", flex: "none" }}>Environment:</span>
                                                        <span style={{ color: "#ccc", fontFamily: MONO, fontSize: 11.5, background: "#1e1e1e", padding: "8px", borderRadius: 4, lineHeight: 1.6, maxWidth: 900 }}>
                                                            QUICKDB_CONNECTIONS=[{"{"}&quot;id&quot;:&quot;383303c1-2cd4-42dd-a4b3-e53dfae48231&quot;,&quot;name&quot;:&quot;Demo&quot;,&quot;type&quot;:&quot;mysql&quot;,&quot;engine&quot;:&quot;mysql&quot;,&quot;host&quot;:&quot;localhost&quot;,&quot;port&quot;:3306,&quot;database&quot;:&quot;&quot;{"}"}]
                                                            <br />
                                                            QUICKDB_OVERRIDES={"{}"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps 98-103: the Claude Code extension's own panel — a
                                                third, completely independent proof of the MCP wiring.
                                                Welcome state until step 101 sends a message, then a plain
                                                (non-QuickDB-styled) trace: thinking → a blocked tool call
                                                → permission prompt → the real error/retry/success beats →
                                                the final answer, mirroring AI Chat's round trip one more
                                                time through a different client entirely. */}
                                            {vsc.view === "claudeCode" && (
                                                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#141414", position: "relative" }}>
                                                    <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", position: "relative" }}>
                                                        {!vsc.sent ? (
                                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
                                                                <div style={{ fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                                                    <span style={{ color: "#d97757" }}>✱</span> <span style={{ color: "#eee" }}>Claude Code</span>
                                                                </div>
                                                                <div style={{ fontSize: 30 }}>👾</div>
                                                                <div style={{ color: "#999", fontSize: 13, textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
                                                                    You&apos;ve come to the absolutely right place!
                                                                </div>
                                                                <div style={{ border: "1px solid #333", borderRadius: 8, background: "#1c1c1c", padding: "10px 14px", fontSize: 12, color: "#aaa", maxWidth: 340, textAlign: "center" }}>
                                                                    Tackle your toughest work with Opus 5. Switch anytime with /model.
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#ddd" }}>
                                                                <div>
                                                                    <div style={{ color: "#eee" }}>mcp quickdb</div>
                                                                    <div style={{ color: "#ccc" }}>{AI_CHAT_QUESTION}</div>
                                                                </div>

                                                                {(vsc.permissionOpen || vsc.tracePhase >= 1) && (
                                                                    <>
                                                                        <div style={{ color: "#888", display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#666" }} /> Thought for 2s
                                                                        </div>
                                                                        <div style={{ color: "#888", display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#666" }} /> Thought for 0s
                                                                        </div>
                                                                        <div>
                                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: vsc.tracePhase >= 1 ? "#e05252" : "#e2b13c" }} />
                                                                                <b style={{ color: "#eee" }}>Quickdb</b> <span style={{ color: "#777" }}>[quickdb_execute_query]</span>{" "}
                                                                                <span style={{ fontFamily: MONO, color: "#999" }}>SELECT p.productName, od.quantityOrdered…</span>
                                                                            </div>
                                                                            {vsc.tracePhase >= 1 && (
                                                                                <div style={{ marginTop: 6, marginLeft: 14, padding: 10, background: "#161616", border: "1px solid #333", borderRadius: 6, fontFamily: MONO, fontSize: 11.5 }}>
                                                                                    <div style={{ color: "#888" }}>OUT</div>
                                                                                    <div style={{ color: "#e05252" }}>✗ **Error** [quickdb_execute_query]</div>
                                                                                    <div style={{ marginTop: 4, color: "#c99" }}>No database selected</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {vsc.tracePhase >= 2 && (
                                                                    <div>
                                                                        <div style={{ color: "#888", display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#666" }} /> Thought for 0s
                                                                        </div>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7cd68f" }} />
                                                                            <b style={{ color: "#eee" }}>Quickdb</b> <span style={{ color: "#777" }}>[quickdb_list_databases]</span>
                                                                        </div>
                                                                        <div style={{ marginTop: 6, marginLeft: 14, padding: 10, background: "#161616", border: "1px solid #333", borderRadius: 6, fontFamily: MONO, fontSize: 11.5, color: "#9c9" }}>
                                                                            <div style={{ color: "#888" }}>OUT</div>
                                                                            <div style={{ marginTop: 4 }}>
                                                                                &#123; &quot;connectionName&quot;: &quot;Demo&quot;, &quot;connectionId&quot;: &quot;383303c1-2cd4-42dd-a4b3-e53dfae48231&quot; &#125;
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {vsc.tracePhase >= 3 && (
                                                                    <div>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7cd68f" }} />
                                                                            <b style={{ color: "#eee" }}>Quickdb</b> <span style={{ color: "#777" }}>[quickdb_execute_query]</span>{" "}
                                                                            <span style={{ fontFamily: MONO, color: "#999" }}>SELECT p.productName, od.quantityOrdered…</span>
                                                                        </div>
                                                                        <div style={{ marginTop: 6, marginLeft: 14, padding: "8px 12px", background: "#161616", border: "1px solid #333", borderRadius: 6, fontSize: 11.5, color: "#ccc" }}>
                                                                            <div style={{ color: "#aaa", fontSize: 11, marginBottom: 6 }}>
                                                                                <span style={{ color: "#888" }}>OUT</span> &nbsp;<b style={{ color: "#eee" }}>Query Results</b> <span style={{ color: "#888" }}>(7 of 7 rows, 5ms)</span>
                                                                            </div>
                                                                            <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 110px 90px", gap: 6, color: "#777", fontSize: 10.5, borderTop: "1px solid #282828", paddingTop: 4 }}>
                                                                                <span>#</span><span>productName</span><span>quantityOrdered</span><span>orderNumber</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {vsc.tracePhase >= 4 && (
                                                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#666", marginTop: 8, flexShrink: 0 }} />
                                                                        <div style={{ lineHeight: 1.7, color: "#ccc" }}>
                                                                            <div>
                                                                                Atelier graphique ordered <b style={{ color: "#fff" }}>7 distinct products</b>, across 3 orders (10123, 10298, 10345):
                                                                            </div>
                                                                            <ol style={{ margin: "6px 0 0", paddingLeft: 20, color: "#eee" }}>
                                                                                <li>1965 Aston Martin DB5</li>
                                                                                <li>1999 Indy 500 Monte Carlo SS</li>
                                                                                <li>1948 Porsche Type 356 Roadster</li>
                                                                                <li>1966 Shelby Cobra 427 S/C</li>
                                                                                <li>1998 Moto Guzzi 1100i</li>
                                                                                <li>1938 Harley Davidson El Knucklehead</li>
                                                                                <li>1938 Cadillac V-16 Presidential Limousine</li>
                                                                            </ol>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {vsc.mcpModalOpen && (
                                                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
                                                                <div style={{ width: 420, background: "#1c1c1c", border: "1px solid #333", borderRadius: 10, padding: 20 }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                                                        <div style={{ fontSize: 15, color: "#eee", fontWeight: 600 }}>MCP servers</div>
                                                                        <span style={{ color: "#888" }}>✕</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>User (1)</div>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#242424", borderRadius: 6, marginBottom: 16 }}>
                                                                        <span style={{ color: "#eee", fontSize: 13 }}>quickdb</span>
                                                                        <span style={{ padding: "2px 8px", background: "rgba(124,214,143,0.15)", color: "#7cd68f", borderRadius: 10, fontSize: 11 }}>✓ Connected</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>claude.ai (3)</div>
                                                                    {["claude.ai Gmail", "claude.ai Google Calendar", "claude.ai Google Drive"].map(n => (
                                                                        <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#242424", borderRadius: 6, marginBottom: 8 }}>
                                                                            <span style={{ color: "#eee", fontSize: 13 }}>{n}</span>
                                                                            <span style={{ padding: "2px 8px", background: "rgba(226,177,60,0.15)", color: "#e2b13c", borderRadius: 10, fontSize: 11 }}>⚠ Needs Auth</span>
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ color: "#666", fontSize: 11.5, marginTop: 8 }}>Learn more about MCP</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {vsc.permissionOpen && (
                                                        <div style={{ position: "absolute", left: "50%", bottom: 160, transform: "translateX(-50%)", width: 480, background: "#1c1c1c", border: "1px solid #333", borderRadius: 8, padding: 16, zIndex: 30, boxShadow: "0 12px 34px rgba(0,0,0,.6)" }}>
                                                            <div style={{ color: "#eee", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                                                                Do you want to proceed with <b>mcp__quickdb__quickdb_execute_query</b>?
                                                            </div>
                                                            <div style={{ color: "#888", fontSize: 11, marginBottom: 12 }}>Details ⌄</div>
                                                            <div ref={set("claudeCodeYesBtn")} style={{ padding: "8px 12px", background: "#0078d4", color: "#fff", borderRadius: 6, fontSize: 12.5, marginBottom: 6, cursor: "pointer", fontWeight: 600 }}>
                                                                1 &nbsp;Yes
                                                            </div>
                                                            <div style={{ padding: "8px 12px", background: "#242424", border: "1px solid #333", color: "#ccc", borderRadius: 6, fontSize: 12.5, marginBottom: 6 }}>
                                                                2 &nbsp;Yes, allow mcp__quickdb__quickdb_execute_query for <u style={{ textDecorationStyle: "dotted" }}>this project (just you)</u>
                                                            </div>
                                                            <div style={{ padding: "8px 12px", background: "#242424", border: "1px solid #333", color: "#ccc", borderRadius: 6, fontSize: 12.5, marginBottom: 10 }}>
                                                                3 &nbsp;No
                                                            </div>
                                                            <div style={{ padding: "8px 12px", background: "#242424", border: "1px solid #333", color: "#666", borderRadius: 6, fontSize: 12, marginBottom: 8 }}>
                                                                Tell Claude what to do instead
                                                            </div>
                                                            <div style={{ color: "#777", fontSize: 10.5 }}>
                                                                Esc to cancel
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ padding: "10px 20px", borderTop: "1px solid #222" }}>
                                                        {vsc.sent && (
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "#2e2117", border: "1px solid #4a3320", borderRadius: 6, marginBottom: 8, fontSize: 11 }}>
                                                                <span style={{ color: "#d97757" }}>You&apos;ve used 93% of your weekly limit · resets in 3d</span>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                    <span style={{ color: "#aaa", fontSize: 11, cursor: "pointer" }}>View usage</span>
                                                                    <span style={{ color: "#777", fontSize: 11, cursor: "pointer" }}>✕</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {vsc.mcpPaletteOpen && (
                                                            <div style={{ background: "#1c1c1c", border: "1px solid #333", borderRadius: 8, marginBottom: 6, overflow: "hidden" }}>
                                                                <div style={{ padding: "6px 12px", fontSize: 10.5, color: "#777" }}>Slash Commands</div>
                                                                <div style={{ padding: "6px 12px", color: "#eee", fontSize: 12.5 }}>/mcp</div>
                                                                <div style={{ padding: "6px 12px", fontSize: 10.5, color: "#777", borderTop: "1px solid #2a2a2a" }}>Customize</div>
                                                                <div
                                                                    ref={set("claudeCodeMcpOption")}
                                                                    title="Configure Model Context Protocol servers"
                                                                    style={{ padding: "8px 12px", background: "#2a2a2a", color: "#fff", fontSize: 12.5, cursor: "pointer" }}
                                                                >
                                                                    MCP servers
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div
                                                            style={{
                                                                background: "#1c1c1c",
                                                                border: "1px solid #3a3a3a",
                                                                borderRadius: 10,
                                                                padding: "10px 14px",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: 10,
                                                            }}
                                                        >
                                                            <div
                                                                ref={set("claudeCodeInput")}
                                                                style={{ minHeight: 20, fontSize: 12.5, color: vsc.sent ? "#777" : vsc.questionChars ? "#eee" : "#666", whiteSpace: "pre-wrap" }}
                                                            >
                                                                {vsc.sent ? "Esc to focus or unfocus Claude" : vsc.questionChars ? CLAUDE_CODE_PROMPT.slice(0, vsc.questionChars) : "Esc to focus or unfocus Claude"}
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: "#888" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                    <span style={{ fontSize: 14, cursor: "pointer" }}>+</span>
                                                                    <span style={{ padding: "1px 5px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 4, fontSize: 10.5 }}>⌘</span>
                                                                </div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#252525", borderRadius: 12, fontSize: 11, color: "#aaa" }}>
                                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#aaa" }} /> Manual
                                                                    </span>
                                                                    <span
                                                                        ref={set("claudeCodeSendBtn")}
                                                                        style={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            borderRadius: 6,
                                                                            background: "#d97757",
                                                                            color: "#fff",
                                                                            display: "grid",
                                                                            placeItems: "center",
                                                                            cursor: "pointer",
                                                                            fontSize: 13,
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        ↑
                                                                    </span>
                                                                </div>
                                                            </div>
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

                        {/* Steps 87-89: the editor's own Settings modal — General
                            tab is the modal's own default (matches the reference:
                            it never shows anything else before 88's click), then
                            Customizations lists the two installed MCP servers,
                            quickdb expanded to its full 48 registered tools —
                            the actual payoff of step 84's Update. zIndex below the
                            cursor's 999 (see its own comment) so the pointer still
                            renders on top while "clicking" this modal's own close
                            button. */}
                        {ide.modalOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(0,0,0,0.55)",
                                    zIndex: 500,
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        marginTop: 130,
                                        width: 1400,
                                        height: 830,
                                        background: "#1c1c1c",
                                        border: "1px solid #3a3a3a",
                                        borderRadius: 8,
                                        boxShadow: "0 24px 60px rgba(0,0,0,.7)",
                                        display: "flex",
                                        flexDirection: "column",
                                        overflow: "hidden",
                                        fontSize: 12.5,
                                        color: C.text,
                                    }}
                                >
                                    <div style={{ height: 36, flex: "none", display: "flex", alignItems: "center", padding: "0 14px", position: "relative", borderBottom: "1px solid #2f2f2f" }}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <div
                                                ref={set("settingsModalCloseBtn")}
                                                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }}
                                            />
                                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                                        </div>
                                        <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", color: C.textDim, fontWeight: 600 }}>
                                            Settings - {ide.settingsTab === "customizations" ? "Customizations" : "General"}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                                        <div style={{ width: 200, flex: "none", borderRight: "1px solid #2f2f2f", padding: "14px 0", overflow: "auto", fontSize: 12.5 }}>
                                            {["Settings", "Account", "General", "Appearance", "Models", "Customizations", "Browser", "Tab", "Editor"].map(item => {
                                                const isCustomizations = item === "Customizations";
                                                const active = isCustomizations ? ide.settingsTab === "customizations" : item === "General" && ide.settingsTab === "general";
                                                return (
                                                    <div
                                                        key={item}
                                                        ref={isCustomizations ? set("customizationsNavItem") : undefined}
                                                        style={{
                                                            padding: "6px 18px",
                                                            cursor: "pointer",
                                                            color: active ? "#fff" : C.textDim,
                                                            fontWeight: active ? 700 : 400,
                                                            background: active ? "rgba(255,255,255,0.06)" : "transparent",
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                );
                                            })}
                                            <div style={{ marginTop: 14, padding: "0 18px", color: C.faint, fontSize: 11, fontWeight: 700 }}>Workspaces</div>
                                            {["interview", "me", "marketplace_merchant", "codelens-runtime-inspe…", "project-analysis", "marketplace_storefront", "agents-vicarious-cattle", "agents-controversial-ca…", "portfolio-nextjs", "ecommerce", "quickdb"].map(w => (
                                                <div key={w} style={{ padding: "6px 18px", color: C.faint, fontSize: 12 }}>{w}</div>
                                            ))}
                                            <div style={{ marginTop: 14, padding: "6px 18px", color: C.faint, fontSize: 12 }}>Shortcuts</div>
                                            <div style={{ padding: "6px 18px", color: C.faint, fontSize: 12 }}>Provide Feedback</div>
                                        </div>

                                        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 24 }}>
                                            {ide.settingsTab === "general" ? (
                                                <>
                                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>General</div>
                                                    <div style={{ color: C.faint, marginTop: 4, marginBottom: 24 }}>Configure agent execution, queued message delivery, and permissions.</div>

                                                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Execution</div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                                                        <div>
                                                            <div style={{ color: "#fff" }}>Queued Messages</div>
                                                            <div style={{ color: C.faint, fontSize: 11.5, marginTop: 2 }}>Configure when follow-up messages are sent.</div>
                                                        </div>
                                                        <div style={{ display: "flex", border: "1px solid #3a3a3a", borderRadius: 5, overflow: "hidden" }}>
                                                            <span style={{ padding: "5px 12px", background: "#2a2a2a", color: "#fff" }}>Queue</span>
                                                            <span style={{ padding: "5px 12px", color: C.faint }}>Send Immediately</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>Agent security mode</div>
                                                    <div style={{ color: C.faint, fontSize: 11.5, marginBottom: 12 }}>Select one of the three options. Agent settings and permissions can be further customized below.</div>
                                                    <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
                                                        {[
                                                            ["Full access", "Agents have full access to your machine and external resources.", true],
                                                            ["Sandboxed", "Agents run in a secure sandbox that restricts access to external resources outside of your trusted folders.", false],
                                                            ["Strict", "Terminal commands always require review and the agent cannot access files outside of its given workspaces.", false],
                                                        ].map(([title, desc, on]) => (
                                                            <div key={title as string} style={{ flex: 1, border: on ? "1px solid #0078d4" : "1px solid #3a3a3a", borderRadius: 6, padding: 14 }}>
                                                                <div style={{ color: on ? "#70baff" : "#fff", fontWeight: 700, marginBottom: 6 }}>{title as string}</div>
                                                                <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.5 }}>{desc as string}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Terminal</div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                                        <div>
                                                            <div style={{ color: "#fff" }}>Terminal Command Auto Execution</div>
                                                            <div style={{ color: C.faint, fontSize: 11.5, marginTop: 2, maxWidth: 480 }}>Controls whether terminal commands require your approval before running.</div>
                                                        </div>
                                                        <span style={{ padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Request Review ⌄</span>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <div>
                                                            <div style={{ color: "#fff" }}>Enable Shell Integration</div>
                                                            <div style={{ color: C.faint, fontSize: 11.5, marginTop: 2, maxWidth: 480 }}>When enabled, Agent will use IDE&apos;s shell integration to detect and report terminal command execution.</div>
                                                        </div>
                                                        <span style={{ width: 34, height: 18, borderRadius: 9, background: "#0078d4", position: "relative", display: "inline-block", flex: "none" }}>
                                                            <span style={{ position: "absolute", right: 2, top: 2, width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                                        <span style={{ color: "#fff", fontWeight: 700 }}>troubleshooting</span>
                                                        <span style={{ padding: "1px 8px", borderRadius: 8, background: "#2a2a2a", color: C.faint, fontSize: 10.5 }}>Global</span>
                                                        <span style={{ padding: "1px 8px", borderRadius: 8, background: "rgba(199,155,255,0.15)", color: "#c79bff", fontSize: 10.5 }}>Plugin: chrome-devtools-plugin</span>
                                                    </div>
                                                    <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.6, marginBottom: 24 }}>
                                                        Uses Chrome DevTools MCP and documentation to troubleshoot connection and target issues. Trigger this skill when list_pages, new_page, or navigate_page fail, or when the server initialization…
                                                    </div>

                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                                        <span style={{ color: "#fff", fontWeight: 700 }}>Installed MCP Servers</span>
                                                        <div style={{ display: "flex", gap: 8, fontSize: 11.5 }}>
                                                            <span style={{ padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Add MCP +</span>
                                                            <span style={{ padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Refresh ↻</span>
                                                            <span style={{ padding: "5px 12px", border: "1px solid #3a3a3a", borderRadius: 5, color: "#ccc" }}>Open MCP Config</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ border: "1px solid #2f2f2f", borderRadius: 6, marginBottom: 12 }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                                                            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700 }}>
                                                                chrome-devtools-mcp <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
                                                            </span>
                                                            <span style={{ width: 30, height: 16, borderRadius: 8, background: "#0078d4", position: "relative", display: "inline-block" }}>
                                                                <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                                                            </span>
                                                        </div>
                                                        <div style={{ padding: "0 14px 10px", color: C.faint, fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
                                                            <span>›</span> 29 tools enabled
                                                        </div>
                                                    </div>

                                                    <div style={{ border: "1px solid #2f2f2f", borderRadius: 6 }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                                                            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700 }}>
                                                                quickdb <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
                                                            </span>
                                                            <span style={{ width: 30, height: 16, borderRadius: 8, background: "#0078d4", position: "relative", display: "inline-block" }}>
                                                                <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                                                            </span>
                                                        </div>
                                                        <div style={{ padding: "0 14px 6px", color: "#ccc", fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
                                                            <span>⌄</span> 48 tools enabled
                                                        </div>
                                                        <div style={{ padding: "0 14px 14px", display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 340, overflow: "auto" }}>
                                                            {MCP_TOOLS.map(t => (
                                                                <span key={t.name} style={{ padding: "3px 9px", borderRadius: 4, background: "#252530", border: "1px solid #3c3c4a", color: "#ccc", fontSize: 11, fontFamily: MONO }}>
                                                                    {t.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                opacity: 1,
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
                    </div>
                </div>

                {/* ── Viewport Floating Scroll Cue (100% Scale, fixed at bottom center of viewport) ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 96,
                        left: "50%",
                        transform: s === 1 ? "translate(-50%, 0)" : "translate(-50%, 24px)",
                        zIndex: 90,
                        opacity: s === 1 ? 1 : 0,
                        pointerEvents: s === 1 ? "auto" : "none",
                        transition: "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    <div
                        className="qd-scroll-badge qd-pulse-glow"
                        onClick={() => jumpToStep(2)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(evt) => {
                            if (evt.key === "Enter" || evt.key === " ") {
                                jumpToStep(2);
                            }
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: "14px 28px",
                            borderRadius: 999,
                            cursor: "pointer",
                        }}
                    >
                        {/* Animated Mouse Icon */}
                        <div
                            style={{
                                width: 22,
                                height: 36,
                                borderRadius: 12,
                                border: "2px solid #3fdd9f",
                                position: "relative",
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: 6,
                                flexShrink: 0,
                                boxShadow: "0 0 14px rgba(63, 221, 159, 0.45)",
                            }}
                        >
                            <div
                                className="qd-wheel-anim"
                                style={{
                                    width: 4,
                                    height: 9,
                                    borderRadius: 3,
                                    background: "linear-gradient(180deg, #7ff0c4, #3fdd9f)",
                                    boxShadow: "0 0 10px #3fdd9f",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                <span
                                    style={{
                                        font: `700 14px ${MONO}`,
                                        letterSpacing: ".08em",
                                        color: "#ffffff",
                                        textShadow: "0 0 14px rgba(63, 221, 159, 0.5)",
                                    }}
                                >
                                    SCROLL DOWN TO EXPLORE
                                </span>
                                <span
                                    style={{
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        fontFamily: MONO,
                                        background: "rgba(63, 221, 159, 0.15)",
                                        border: "1px solid rgba(63, 221, 159, 0.45)",
                                        color: "#7ff0c4",
                                        padding: "2px 8px",
                                        borderRadius: 10,
                                        textTransform: "uppercase",
                                        letterSpacing: ".06em",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: "#3fdd9f",
                                            boxShadow: "0 0 6px #3fdd9f",
                                        }}
                                    />
                                    INTERACTIVE STORY
                                </span>
                            </div>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Scroll down or click here to watch live VS Code walkthrough
                            </span>
                        </div>

                        {/* Glowing Bouncing Action Button Circle */}
                        <div
                            className="qd-arrow-double"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #16b981, #3fdd9f)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: 4,
                                flexShrink: 0,
                                boxShadow: "0 0 20px rgba(63, 221, 159, 0.65)",
                                color: "#03130d",
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── Quick Feature Navigator Bottom Bar Client Component ── */}
                <QuickDBBottomNav
                    navItems={NAV_ITEMS}
                    currentStep={s}
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
