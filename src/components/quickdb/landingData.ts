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
    ["12", "Fill down — first value into the range"],
    ["13", "Save the 4 edits"],
    ["14", "Follow a foreign key"],
    ["15", "payments where customerNumber = 121"],
    ["16", "Close the tab, back to customers"],
    ["17", "Paste playground"],
    ["18", "7 records detected"],
    ["19", "7 rows staged — ⌘S to save"],
] as const;

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
    13: [912, 134],
    14: "fkRow",
    15: "filterVal",
    16: "closeTab",
    17: "pasteBtn",
    18: "importBtn",
    19: "importBtn",
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
export const CUST: readonly (readonly [number, string, string, string, string, string, string, string])[] = [
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
export const TAIL: readonly (readonly [number | string, string, string, string, string, string, string, string])[] = [
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
        count: "7",
        icon: "⌘",
        tint: "#7cc4f5",
        items: [
            "New Query (SQL Console)",
            "Query Builder",
            "ERD Diagram",
            "Aggregation Builder",
            "Pivot Table",
            "Query History Dashboard",
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

export const PAY_ROWS: readonly { i: number; chk: string; date: string; amt: string }[] = [
    { i: 1, chk: "DB889831", date: "2003-02-15T18:00:00.000Z", amt: "50218.95" },
    { i: 2, chk: "FD317790", date: "2003-10-27T18:00:00.000Z", amt: "1491.38" },
    { i: 3, chk: "KI831359", date: "2004-11-03T18:00:00.000Z", amt: "17876.32" },
    { i: 4, chk: "MA302151", date: "2004-11-27T18:00:00.000Z", amt: "34638.14" },
] as const;

export const EMPTY_ROWS: readonly number[] = [
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const;

export const PREVIEW_ROWS: readonly { n: string; l: string; f: string }[] = [
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
};

/** Scroll progress at which step 1 begins, and the span each step occupies. */
export const P0 = 0.11;
export const PSTEP = 0.0463;

/** The screen is laid out in a fixed 1920-wide space and scaled to fit. */
export const DESIGN_W = 1920;
