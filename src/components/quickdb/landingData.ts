/**
 * Data for the QuickDB landing scroll story.
 *
 * Ported verbatim from the "QuickDB Landing.dc.html" design component. The
 * source also declared an `ENG` engine list and `createBtn`/`pickFile` refs
 * that no template branch ever rendered — those are dropped rather than
 * carried over as dead weight.
 */

/** Caption shown in the pill at the bottom of the stage, per step. */
export const STEPS: readonly (readonly [string, string])[] = [
    ["01", "Your editor, before QuickDB"],
    ["02", "Extensions view"],
    ["03", "Search the marketplace"],
    ["04", "QuickDB — by Nazmul Haque"],
    ["05", "Installing…"],
    ["06", "Installed"],
    ["07", "QuickDB opens in the side bar"],
    ["08", "Connection “Demo” added"],
    ["09", "Schema loaded — 8 tables"],
    ["10", "customers · 122 rows"],
    ["11", "Drag-select the phone cells"],
    ["12", "Fill down — first value into range"],
    ["13", "Follow a foreign key"],
    ["14", "payments where customerNumber = 121"],
    ["15", "Close the tab, back to customers"],
    ["16", "Paste playground"],
    ["17", "7 records detected"],
    ["18", "7 rows staged — ⌘S to save"],
    ["19", "Saved — 129 customers in table"],
    ["20", "Database synced & ready"],
    ["21", "Hover the SQL Console tool"],
    ["22", "SQL Console opens"],
    ["23", "New Query"],
    ["24", "Query Console: Demo › classicmodels"],
    ["25", "Select a connection"],
    ["26", "Connection options"],
    ["27", "Demo · mysql selected"],
    ["28", "Select a database"],
    ["29", "Database options"],
    ["30", "classicmodels selected"],
    ["31", "Write SQL statements…"],
    ["32", "Typing SELECT"],
    ["33", "SELECT — autocomplete"],
    ["34", "SELECT *"],
    ["35", "FROM — autocomplete"],
    ["36", "FROM customers"],
    ["37", "LEFT JOIN — autocomplete"],
    ["38", "…LEFT JOIN payments"],
    ["39", "Hover Run"],
    ["40", "297 rows returned"],
    ["41", "Schema Explorer"],
    ["42", "customers · 122 rows"],
    ["43", "Query History"],
    ["44", "Local history log"],
    ["45", "Saved Queries"],
    ["46", "Save as new"],
    ["47", "Update saved query"],
    ["48", "Typing the query title"],
    ["49", "Hover Update"],
    ["50", "Query saved"],
    ["51", "SQL Snippets"],
    ["52", "Top 10 newest rows"],
    ["53", "Search snippets"],
    ["54", "orderDetails snippet"],
    ["55", "Snippet inserted"],
    ["56", "Retarget to orderNumber"],
    ["57", "Hover Run again"],
    ["58", "10 rows returned"],
    ["59", "Head to Visualize"],
    ["60", "Hover Visualize"],
    ["61", "Chart rendered"],
    ["62", "Close the chart tab"],
] as const;

export interface StepDetail {
    title: string;
    category: string;
    description: string;
    mechanism: string;
}

export const STEP_DETAILS: Record<number, StepDetail> = {
    1: {
        title: "Your Editor Before QuickDB",
        category: "EXTENSIONS",
        description: "Clean VS Code layout before launching database management features.",
        mechanism: "Pointer navigates to the activity bar extensions icon.",
    },
    2: {
        title: "Marketplace Search",
        category: "EXTENSIONS",
        description: "Opening marketplace search pane to locate QuickDB extension.",
        mechanism: "Types 'quickdb' into the extension marketplace search input.",
    },
    3: {
        title: "Extension Found",
        category: "EXTENSIONS",
        description: "QuickDB extension by Nazmul Haque highlighted in search results.",
        mechanism: "Cursor hovers over extension card to inspect details and install button.",
    },
    4: {
        title: "Installing Extension",
        category: "EXTENSIONS",
        description: "Triggering installation of QuickDB into the editor workspace.",
        mechanism: "Cursor clicks 'Install', initiating background loading state.",
    },
    5: {
        title: "Package Unpacking",
        category: "EXTENSIONS",
        description: "Downloading and unpacking Webview UI and engine binary handlers.",
        mechanism: "Button updates to 'Installing' progress indicator.",
    },
    6: {
        title: "Installation Complete",
        category: "EXTENSIONS",
        description: "QuickDB extension successfully registered in VS Code.",
        mechanism: "Lightning bolt icon ⚡ renders in the activity bar sidebar.",
    },
    7: {
        title: "Open QuickDB Sidebar",
        category: "CONNECTIONS",
        description: "Opening QuickDB database connection manager panel.",
        mechanism: "Activity sidebar switches view to QuickDB panel.",
    },
    8: {
        title: "Add Connection 'Demo'",
        category: "CONNECTIONS",
        description: "Creating SQLite/PostgreSQL connection 'Demo' in connection manager.",
        mechanism: "Toast notification confirms connection 'Demo' initialized.",
    },
    9: {
        title: "Schema Explorer & Filter",
        category: "SCHEMA",
        description: "Schema explorer loads 8 database tables. Filtering for 'cust' tables.",
        mechanism: "Types 'cust' in search box to filter tree down to 'customers' table.",
    },
    10: {
        title: "Undo/Redo Support ",
        category: "DATA VIEW",
        description: "Opening 'customers' table grid displaying 122 records.",
        mechanism: "Single click cell to edit inline, tracking dirty state and undo buffer.",
    },
    11: {
        title: "Multi-Cell Editing (Drag-Select)",
        category: "BULK EDIT",
        description: "Selecting a vertical range across 4 phone number cells.",
        mechanism: "Bounding box highlights selection range with '40.32.2555 → 4 cells' tooltip.",
    },
    12: {
        title: "Save to DB (Multi-Cell)",
        category: "BULK EDIT",
        description: "Applying initial cell value across all 4 selected phone number cells.",
        mechanism: "Range values update instantly across all selected cells.",
    },
    13: {
        title: "Foreign Key Navigation",
        category: "RELATIONS",
        description: "Clicking FK chip on customerNumber = 121 in rows grid.",
        mechanism: "QuickDB inspects FK constraints and prepares related payments query.",
    },
    14: {
        title: "Filtered Payments View",
        category: "RELATIONS",
        description: "Opens new 'payments' tab filtered by customerNumber = 121.",
        mechanism: "Displays 4 matching payment records with active amber filter pill.",
    },
    15: {
        title: "Tab Management",
        category: "NAVIGATION",
        description: "Closing 'payments' tab and returning to primary 'customers' table.",
        mechanism: "Tab closes and view restores main customers grid state.",
    },
    16: {
        title: "Paste Playground Modal",
        category: "IMPORT & AI",
        description: "Clicking 'Paste' opens CSV / TSV / JSON import modal.",
        mechanism: "Opens Paste Playground overlay with target column mapping.",
    },
    17: {
        title: "Auto Data Detection",
        category: "IMPORT & AI",
        description: "Pasting 7 raw customer records into import playground input.",
        mechanism: "Parser detects 7 records with NULL primary keys for auto-generation.",
    },
    18: {
        title: "Stage 7 Rows Without IDs",
        category: "IMPORT & AI",
        description: "Clicking 'Import Data' appends 7 rows into table without IDs.",
        mechanism: "Rows 123–129 appear at bottom of table. Toolbar displays 'Save 7'.",
    },
    19: {
        title: "Commit & Auto-Generate IDs",
        category: "SAVE & PERSIST",
        description: "Clicking 'Save' commits changes and auto-assigns primary key IDs.",
        mechanism: "'Save 7' clears to 'Save'. Sequential IDs (497–503) light up in emerald (#7ee787)!",
    },
    20: {
        title: "Database Synced & Live",
        category: "COMPLETE",
        description: "All 129 customer records fully synchronized and persistent.",
        mechanism: "QuickDB live engine keeps local cache in sync with upstream DB.",
    },
    21: {
        title: "Open SQL Console",
        category: "QUERY CONSOLE",
        description: "Hovering the SQL Console tool in the sidebar's Query group.",
        mechanism: "Pointer travels to the Query › SQL Console item in the TOOLS tree.",
    },
    23: {
        title: "Start a New Query",
        category: "QUERY CONSOLE",
        description: "SQL Console tab opens with a New Query card and no saved queries yet.",
        mechanism: "Clicking New Query opens a blank SQL console.",
    },
    30: {
        title: "Pick Connection & Database",
        category: "QUERY CONSOLE",
        description: "Connection set to Demo · mysql, database set to classicmodels.",
        mechanism: "Selectors resolve the schema before the editor becomes writable.",
    },
    31: {
        title: "Write the Query",
        category: "SQL EDITOR",
        description: "IntelliSense-driven SQL editor with keyword, table, and FK-aware autocomplete.",
        mechanism: "Typing triggers context-aware suggestions at each token boundary.",
    },
    40: {
        title: "Run & Inspect Results",
        category: "SQL EDITOR",
        description: "Query executes and returns 297 rows across 17 columns.",
        mechanism: "Run compiles and executes the statement against the live connection.",
    },
    44: {
        title: "Query History",
        category: "QUERY CONSOLE",
        description: "Local history logs every SELECT/UPDATE/INSERT with timing and status.",
        mechanism: "Opens via the clock icon or Ctrl/Cmd+Alt+E.",
    },
    48: {
        title: "Rename & Update",
        category: "SAVED QUERIES",
        description: "Editing the saved query's title before committing the update.",
        mechanism: "Backspaces the auto-generated title, types a human-readable one.",
    },
    54: {
        title: "Insert a Snippet",
        category: "SQL SNIPPETS",
        description: "Reusable query templates, searchable and inserted at the cursor.",
        mechanism: "Filtering by “orderDetails” narrows the snippet list to one match.",
    },
    60: {
        title: "Visualize the Result Set",
        category: "VISUALIZATION",
        description: "Chart builder maps result columns to X/Y axes for a live preview.",
        mechanism: "Opens QuickDB Visualization in a new tab, pre-wired to the last result set.",
    },
};

/**
 * Where the cursor points on each step: either a ref name resolved live from
 * the DOM, or fixed coordinates in the screen's 1920-wide design space.
 */
export const TARGETS: Record<number, string | readonly [number, number]> = {
    1: "extIcon",
    2: "extSearch",
    3: "extCard",
    4: "installBtn",
    5: "installBtn",
    6: "qdbIcon",
    7: "addConn",
    8: "addConn",
    9: "findBox",
    10: "custRow",
    11: [1496, 393],
    12: "saveBtn",
    13: "fkRow",
    14: "filterVal",
    15: "closeTab",
    16: "pasteBtn",
    17: "pasteArea",
    18: "importBtn",
    19: "saveBtn",
    20: "saveBtn",
    21: "sidebarSqlConsole",
    22: "sidebarSqlConsole",
    23: "newQueryBtnCard",
    24: "newQueryBtnCard",
    25: "topConnSelectBtn",
    26: "topConnSelectBtn",
    27: "connOptionDemoItem",
    28: "topDbSelectBtn",
    29: "topDbSelectBtn",
    30: "dbOptionClassicItem",
    31: "monacoSqlEditor",
    32: "monacoSqlEditor",
    33: "monacoSqlEditor",
    34: "monacoSqlEditor",
    35: "monacoSqlEditor",
    36: "monacoSqlEditor",
    37: "monacoSqlEditor",
    38: "monacoSqlEditor",
    39: "topRunQueryBtn",
    40: "topRunQueryBtn",
    41: "schemaExpRightIcon",
    42: "schemaExpRightIcon",
    43: "queryHistoryRightIcon",
    44: "queryHistoryRightIcon",
    45: "savedQueriesRightIcon",
    46: "saveQueryAsBtn",
    47: "queryTitleModalInput",
    48: "queryTitleModalInput",
    49: "updateQueryModalBtn",
    50: "updateQueryModalBtn",
    51: "sqlSnippetsRightIcon",
    52: "sqlSnippetsRightIcon",
    53: "monacoSqlEditor",
    54: "snippetCardItem",
    55: "snippetCardItem",
    56: "monacoSqlEditor",
    57: "topRunQueryBtn",
    58: "topRunQueryBtn",
    59: "visualizeBarBtn",
    60: "visualizeBarBtn",
    61: "visualizeBarBtn",
    62: "closeVizTabBtn",
};

export interface TypedField {
    /** Ref key of the text node being typed into. */
    key: "extSearch" | "findText";
    word: string;
    placeholder: string;
    /** Whether the field should be typed at this step. */
    active: (step: number) => boolean;
    /** Delay before typing starts, ms. */
    delay: number;
    /** Milliseconds per character. */
    per: number;
}

export const FIELDS: readonly TypedField[] = [
    {
        key: "extSearch",
        word: "quickdb",
        placeholder: "Search Extensions in Marketplace",
        active: (s) => s >= 2,
        delay: 90,
        per: 52,
    },
    {
        key: "findText",
        word: "cust",
        placeholder: "Find table in database",
        active: (s) => s === 9,
        delay: 120,
        per: 58,
    },
];

/** customers rows: [number, name, lastName, firstName, phone, addr1, addr2, city] */
export type CustomerRow = readonly [number, string, string, string, string, string, string, string];

export const CUST: readonly CustomerRow[] = [
    [103, "Atelier graphique", "Schmitt", "Carine", "40.32.2555", "54, rue Royale", "", "Nantes"],
    [112, "Signal Gift Stores", "King", "Jean", "7025551838", "8489 Strong St.", "", "Las Vegas"],
    [114, "Australian Collectors, Co.", "Ferguson", "Peter", "03 9520 4555", "636 St Kilda Road", "Level 3", "Melbourne"],
    [119, "La Rochelle Gifts", "Labrune", "Janine", "40.67.8555", "67, rue des Cinquante Otages", "", "Nantes"],
    [121, "Baane Mini Imports", "Bergulfsen", "Jonas", "07-98 9555", "Erling Skakkes gate 78", "", "Stavern"],
    [124, "Mini Gifts Distributors Ltd.", "Nelson", "Susan", "4155551450", "5677 Strong St.", "", "San Rafael"],
    [125, "Havel & Zbyszek Co", "Piestrzeniewicz", "Zbyszek", "(26) 642-7555", "ul. Filtrowa 68", "", "Warszawa"],
    [128, "Blauer See Auto, Co.", "Keitel", "Roland", "+49 69 66 90 2555", "Lyonerstr. 34", "", "Frankfurt"],
    [129, "Mini Wheels Co.", "Murphy", "Julie", "6505555787", "5557 North Pendale Street", "", "San Francisco"],
    [131, "Land of Toys Inc.", "Lee", "Kwai", "2125557818", "897 Long Airport Avenue", "", "NYC"],
    [141, "Euro+ Shopping Channel", "Freyre", "Diego", "(91) 555 94 44", "C/ Moralzarzal, 86", "", "Madrid"],
    [144, "Volvo Model Replicas, Co", "Berglund", "Christina", "0921-12 3555", "Berguvsvägen 8", "", "Luleå"],
    [145, "Danish Wholesale Imports", "Petersen", "Jytte", "31 12 3555", "Vinbæltet 34", "", "Kobenhavn"],
    [146, "Saveley & Henriot, Co.", "Saveley", "Mary", "78.32.5555", "2, rue du Commerce", "", "Lyon"],
    [148, "Dragon Souveniers, Ltd.", "Natividad", "Eric", "+65 221 7555", "Bronz Sok.", "Bronz Apt. 3/6 Tesvikiye", "Singapore"],
    [151, "Muscle Machine Inc", "Young", "Jeff", "2125557413", "4092 Furth Circle", "Suite 400", "NYC"],
    [157, "Diecast Classics Inc.", "Leong", "Kelvin", "2155551555", "7586 Pompton St.", "", "Allentown"],
    [161, "Technics Stores Inc.", "Hashimoto", "Juri", "6505556809", "9408 Furth Circle", "", "Burlingame"],
    [166, "Handji Gifts& Co", "Victorino", "Wendy", "+65 224 1555", "106 Linden Road Sandown", "2nd Floor", "Singapore"],
    [167, "Herkku Gifts", "Oeztan", "Veysel", "+47 2267 3215", "Brehmen St. 121", "PR 334 Sentrum", "Bergen"],
    [168, "American Souvenirs Inc", "Franco", "Keith", "2035557845", "149 Spinnaker Dr.", "Suite 101", "New Haven"],
    [169, "Porto Imports Co.", "de Castro", "Isabel", "(1) 356-5555", "Estrada da saúde n. 58", "", "Lisboa"],
    [171, "Daedalus Designs Imports", "Rancé", "Martine", "20.16.1555", "184, chaussée de Tournai", "", "Lille"],
    [172, "La Corne D'abondance, Co.", "Bertrand", "Marie", "(1) 42.34.2555", "265, boulevard Charonne", "", "Paris"],
    [173, "Cambridge Collectables Co.", "Tseng", "Jerry", "6175555555", "4658 Baden Av.", "", "Cambridge"],
    [175, "Gift Depot Inc.", "King", "Julie", "2035552570", "25593 South Bay Ln.", "", "Bridgewater"],
    [177, "Osaka Souveniers Co.", "Kentary", "Mory", "+81 06 6342 5555", "1-6-20 Dojima", "", "Osaka"],
] as const;

/** Rows shown after the paste import lands (step 19). */
export type TailRow = readonly [number | string, string, string, string, string, string, string, string];

export const TAIL: readonly TailRow[] = [
    [475, "West Coast Collectables Co.", "Thompson", "Steve", "3105553722", "3675 Furth Circle", "", "Burbank"],
    [477, "Mit Vergnügen & Co.", "Moos", "Hanna", "0621-08555", "Forsterstr. 57", "", "Mannheim"],
    [480, "Kremlin Collectables, Co.", "Semenov", "Alexander", "+7 812 293 0521", "2 Pobedy Square", "", "Saint Petersburg"],
    [481, "Raanan Stores, Inc", "Altagar,G M", "Raanan", "+ 972 9 959 8555", "3 Hagalim Blv.", "", "Herzlia"],
    [484, "Iberia Gift Imports, Corp.", "Roel", "José Pedro", "(95) 555 82 82", "C/ Romero, 33", "", "Sevilla"],
    [486, "Motor Mint Distributors Inc.", "Salazar", "Rosa", "2155559857", "11328 Douglas Av.", "", "Philadelphia"],
    [487, "Signal Collectibles Ltd.", "Taylor", "Sue", "4155554312", "2793 Furth Circle", "", "Brisbane"],
    [489, "Double Decker Gift Stores, Ltd", "Smith", "Thomas", "(171) 555-7555", "120 Hanover Sq.", "", "London"],
    [495, "Diecast Collectables", "Franco", "Valarie", "6175552555", "6251 Ingle Ln.", "", "Boston"],
    [496, "Kelly's Gift Shop", "Snowden", "Tony", "+64 9 5555500", "Arenales 1938 3'A'", "", "Auckland"],
    ["", "Raanan Stores", "Inc", "Altagar", "G M", "Raanan", "+ 972 9 959 8555", "3 Hagalim Blv."],
    ["", "Iberia Gift Imports", "Corp.", "Roel", "José Pedro", "(95) 555 82 82", "C/ Romero", "33"],
    ["", "Motor Mint Distributors Inc.", "Salazar", "Rosa", "2155559857", "11328 Douglas Av.", "", "Philadelphia"],
    ["", "Signal Collectibles Ltd.", "Taylor", "Sue", "4155554312", "2793 Furth Circle", "", "Brisbane"],
    ["", "Double Decker Gift Stores", "Ltd", "Smith", "Thomas", "(171) 555-7555", "120 Hanover Sq.", ""],
    ["", "Diecast Collectables", "Franco", "Valarie", "6175552555", "6251 Ingle Ln.", "", "Boston"],
    ["", "Kelly's Gift Shop", "Snowden", "Tony", "+64 9 5555500", "Arenales 1938 3'A'", "", "Auckland"],
] as const;

export interface ToolGroup {
    name: string;
    count: string;
    icon: string;
    tint: string;
    items: readonly string[];
}

export const TOOLS: readonly ToolGroup[] = [
    {
        name: "Query",
        count: "6",
        icon: "⌘",
        tint: "#7cc4f5",
        items: [
            "SQL Console",
            "Query Builder",
            "ERD Diagram",
            "Aggregation Builder",
            "Pivot Table",
            "SQL Snippets",
        ],
    },
    {
        name: "Import / Export & Backup",
        count: "4",
        icon: "⇄",
        tint: "#9aa5ff",
        items: ["Import Database", "Export Database", "Backup Database", "Restore Database"],
    },
    {
        name: "Compare & Move Data",
        count: "3",
        icon: "◫",
        tint: "#a8cf8f",
        items: ["Data Compare", "Schema Compare", "Seed Data"],
    },
    {
        name: "Insights & Health",
        count: "5",
        icon: "∿",
        tint: "#ffab6b",
        items: ["Database Health", "Data Profile", "Index Analysis", "Query Profiler", "Server Monitor"],
    },
    {
        name: "Design & Generate",
        count: "3",
        icon: "⌗",
        tint: "#c79bff",
        items: ["Code Generator", "Schema Docs", "Migration Generator"],
    },
    { name: "Security", count: "1", icon: "⛨", tint: "#7cd68f", items: ["Users & Privileges"] },
    {
        name: "AI",
        count: "5",
        icon: "✦",
        tint: "#f5cf6a",
        items: [
            "AI Settings (Provider / Key)",
            "AI SQL Assistant",
            "AI Chat",
            "AI Advisor (Index/Perf)",
            "AI Data Quality",
        ],
    },
    { name: "MCP", count: "2", icon: "⚯", tint: "#ff9bb0", items: ["MCP Tools", "Setup MCP for AI Clients"] },
] as const;

export const TABLES: readonly (readonly [string, string])[] = [
    ["customers", "122"],
    ["employees", "23"],
    ["offices", "7"],
    ["orderdetails", "2,996"],
    ["orders", "326"],
    ["payments", "273"],
    ["productlines", "7"],
    ["products", "110"],
] as const;

export const CATEGORIES: readonly string[] = [
    "Programming Languages",
    "Snippets",
    "Linters",
    "Debuggers",
    "Formatters",
    "Extension Packs",
    "Data Science",
    "Machine Learning",
    "Visualization",
    "Notebooks",
    "Education",
    "Testing",
    "AI",
    "Chat",
] as const;

export interface PayRow { i: number; chk: string; date: string; amt: string }

export const PAY_ROWS: readonly PayRow[] = [
    { i: 1, chk: "DB889831", date: "2003-02-15T18:00:00.000Z", amt: "50218.95" },
    { i: 2, chk: "FD317790", date: "2003-10-27T18:00:00.000Z", amt: "1491.38" },
    { i: 3, chk: "KI831359", date: "2004-11-03T18:00:00.000Z", amt: "17876.32" },
    { i: 4, chk: "MA302151", date: "2004-11-27T18:00:00.000Z", amt: "34638.14" },
] as const;

export const EMPTY_ROWS: readonly number[] = [
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const;

export interface PreviewRow { n: string; l: string; f: string }

export const PREVIEW_ROWS: readonly PreviewRow[] = [
    { n: "Raanan Stores, Inc", l: "Altagar,G M", f: "Raanan" },
    { n: "Iberia Gift Imports", l: "Corp.", f: "Roel" },
    { n: "Motor Mint Distributors…", l: "Salazar", f: "Rosa" },
    { n: "Signal Collectibles Ltd.", l: "Taylor", f: "Sue" },
    { n: "Double Decker Gift Stor…", l: "Ltd", f: "Smith" },
    { n: "Diecast Collectables", l: "Franco", f: "Valarie" },
    { n: "Kelly's Gift Shop", l: "Snowden", f: "Tony" },
] as const;

/** Toast copy, keyed by the step that raises it. */
export const TOASTS: Record<number, string> = {
    8: 'Connection "Demo" added.',
    9: "Schema loaded — 8 tables in classicmodels.",
    13: "4 cells updated in customers.",
    19: "Added 7 rows to the table preview",
    20: "7 rows saved to customers.",
};

/** Total steps in the story — STEPS.length would work too, but the scroll-
 *  span math below (P0 + STEP_COUNT * PSTEP) reads clearer spelled out.
 *  Grew from 20 to 61 when the Query Console beat (steps 21-61) was added
 *  on top of the original Data View story (steps 1-20), then to 62 for the
 *  closing beat — hovering and clicking the Visualization tab's own ✕ to
 *  land back on the Query Console tab. */
export const STEP_COUNT = 62;

/**
 * Most steps are the same width, but a handful run a real character-by-
 * character type/delete animation in place (see runEditTypeAnim-style
 * helpers in QuickDBStory.tsx) rather than just flipping content on arrival
 * — those need real extra *scroll track*, not just a bigger percentage of
 * everyone else's track:
 *
 *   10  the customers-grid cell edit: focus → delete "Murphy" → type
 *       "Haque" (~2.2s)
 *   47  the saved-query title: delete the auto-generated SQL preview →
 *       type "How many total customers have made a payment?"
 *   56  the second query edit: delete "my_table" → type "orderdetails",
 *       delete "created_at" → autocomplete-select "orderNumber"
 *
 * A first version of this tried giving a wide step a bigger share of a
 * fixed-height track — dividing the SAME total space differently rather
 * than adding to it. That doesn't work: with a fixed total, growing one
 * step's share necessarily *shrinks* PSTEP (the width of one "normal"
 * step) for every other step too, and even at the extreme of giving one
 * step the whole track, its slice tops out short of the pixels a real
 * animation needs at a normal scroll speed. So the track height instead
 * scales with the sum of every step's weight (see TRACK_VH below): every
 * weight-1 step keeps the *exact* pixel width it had before (UNIT_VH,
 * already tuned and verified), and each wide step's extra weight adds new
 * track length on top rather than carving it out of everyone else's.
 */
export const STEP_WEIGHTS: Record<number, number> = {
    10: 8,
    47: 3,
    56: 3,
};

/** The original fixed track height, and how many equal-width steps it was
 *  divided into before any step needed to be wider than the rest. Kept as
 *  literals decoupled from the live STEP_COUNT above — extending the story
 *  with more (weight-1) steps shouldn't retroactively shrink the width of
 *  ones already tuned.
 *  Increased from 1400 to 3500 to require more physical scrolling, slowing down the pace. */
const ORIGINAL_TRACK_VH = 3500;
const ORIGINAL_STEP_COUNT = 20;
/** One "normal" (weight-1) step's share of that track, in vh — fixed
 *  regardless of STEP_WEIGHTS, since this is the pixel width every
 *  unweighted step keeps. */
const UNIT_VH = ORIGINAL_TRACK_VH / ORIGINAL_STEP_COUNT;
/** Absolute vh consumed by the intro zoom-in before step 1's content
 *  starts (P0's original meaning, fixed rather than stretched — that
 *  animation is unrelated to step weighting and already tuned on its own). */
const P0_VH = 0.11 * ORIGINAL_TRACK_VH;

const TOTAL_UNITS = (() => {
    let sum = 0;
    for (let n = 1; n <= STEP_COUNT; n++) sum += STEP_WEIGHTS[n] ?? 1;
    return sum;
})();
/** New total track height: the intro, plus every step at its own weight
 *  (1 for most, wider for the animated ones above). Exported so the track
 *  element's own CSS height can be driven by this instead of a literal. */
export const TRACK_VH = P0_VH + UNIT_VH * TOTAL_UNITS;

/** P0 and PSTEP re-expressed as fractions of the new, taller TRACK_VH —
 *  same quantities as before in vh terms, just a smaller share of a
 *  bigger whole, which is what keeps every unweighted step's actual pixel
 *  width unchanged. */
export const P0 = P0_VH / TRACK_VH;
export const PSTEP = UNIT_VH / TRACK_VH;

/**
 * Scroll fraction at which each step begins — STEP_STARTS[n - 1] is step
 * n's start, STEP_STARTS[STEP_COUNT] is 1.0 (the end of the last step).
 * Precomputed once here rather than re-derived from a flat step index on
 * every scroll tick, since the weighted steps mean "step n's start" is no
 * longer just P0 + (n - 1) * PSTEP.
 */
export const STEP_STARTS: readonly number[] = (() => {
    const starts = [P0];
    for (let n = 1; n <= STEP_COUNT; n++) {
        starts.push(starts[n - 1] + PSTEP * (STEP_WEIGHTS[n] ?? 1));
    }
    return starts;
})();

/** The screen is laid out in a fixed 1920-wide space and scaled to fit. */
export const DESIGN_W = 1920;
