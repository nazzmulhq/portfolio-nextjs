import { slugify } from "../doc/mdSlug";
import { DocStats, TocItem } from "./types";

export function parseMarkdownMeta(markdown: string): {
    toc: TocItem[];
    stats: DocStats;
} {
    const lines = markdown.split("\n");
    const toc: TocItem[] = [];
    const slugCounts: Record<string, number> = {};

    let inCodeBlock = false;
    let codeBlocksCount = 0;
    let tablesCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            if (!inCodeBlock) {
                codeBlocksCount += 1;
            }
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) continue;

        // Check for table header line
        if (/^\|[-:\s|]+\|$/.test(trimmed)) {
            tablesCount += 1;
        }

        // Match markdown headings (# H1, ## H2, ### H3, #### H4)
        const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const rawTitle = match[2].trim();
            // Remove markdown links, bold, code ticks, etc. from title
            const cleanTitle = rawTitle
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                .replace(/[*_`]/g, "")
                .trim();

            let slug = slugify(cleanTitle);
            if (!slug) {
                slug = `section-${toc.length + 1}`;
            }

            if (slugCounts[slug]) {
                slugCounts[slug] += 1;
                slug = `${slug}-${slugCounts[slug]}`;
            } else {
                slugCounts[slug] = 1;
            }

            toc.push({
                id: slug,
                title: cleanTitle,
                level,
                raw: rawTitle,
            });
        }
    }

    const words = markdown.split(/\s+/).filter(Boolean).length;
    const chars = markdown.length;
    const readTimeMin = Math.max(1, Math.ceil(words / 220));

    return {
        toc,
        stats: {
            words,
            chars,
            readTimeMin,
            headingsCount: toc.length,
            codeBlocksCount,
            tablesCount,
        },
    };
}
