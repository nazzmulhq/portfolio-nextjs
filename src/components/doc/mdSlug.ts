/** Shared heading → anchor-id slugifier (used by the renderer and the TOC). */
export const slugify = (s: string): string =>
    s
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
