import {
    siAntdesign,
    siDjango,
    siDocker,
    siFastapi,
    siGithubactions,
    siJavascript,
    siKubernetes,
    siMongodb,
    siMysql,
    siNestjs,
    siNextdotjs,
    siPostgresql,
    siPython,
    siReact,
    siRedis,
    siRedux,
    siTailwindcss,
    siTypescript,
} from "simple-icons";

export interface TechIcon {
    /** Path data. Brand marks are single filled paths; concept glyphs are stroked. */
    paths: string[];
    /** Brand colour, revealed on hover. Concept glyphs inherit the accent instead. */
    hex?: string;
    stroke?: boolean;
}

const brand = (icon: { path: string; hex: string }): TechIcon => ({
    paths: [icon.path],
    hex: `#${icon.hex}`,
});

/**
 * Three entries — REST APIs, Microservices, CI/CD — are concepts rather than
 * products, so no brand mark exists. They get hand-drawn stroked glyphs on the
 * same 24-unit grid: braces, a node graph, and a pipeline loop.
 */
const CONCEPT: Record<string, TechIcon> = {
    "REST APIs": {
        stroke: true,
        paths: [
            "M9 3H7.5A2.5 2.5 0 0 0 5 5.5v3A2.5 2.5 0 0 1 2.5 11 2.5 2.5 0 0 1 5 13.5v3A2.5 2.5 0 0 0 7.5 19H9",
            "M15 3h1.5A2.5 2.5 0 0 1 19 5.5v3a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 1-2.5 2.5H15",
        ],
    },
    "Microservices": {
        stroke: true,
        paths: [
            "M12 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
            "M4.5 16a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
            "M19.5 16a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
            "M10.2 7.1 6.3 14.4",
            "M13.8 7.1l3.9 7.3",
            "M7 18.5h10",
        ],
    },
    "CI/CD": {
        stroke: true,
        paths: ["M20.5 12a8.5 8.5 0 1 1-2.5-6", "M20.5 3v5h-5"],
    },
};

const BRANDS: Record<string, TechIcon> = {
    "TypeScript": brand(siTypescript),
    "JavaScript": brand(siJavascript),
    "Python": brand(siPython),
    "React.js": brand(siReact),
    "Next.js": brand(siNextdotjs),
    "Redux Toolkit": brand(siRedux),
    "TailwindCSS": brand(siTailwindcss),
    "Ant Design": brand(siAntdesign),
    "Nest.js": brand(siNestjs),
    "FastAPI": brand(siFastapi),
    "Django": brand(siDjango),
    "PostgreSQL": brand(siPostgresql),
    "MySQL": brand(siMysql),
    "MongoDB": brand(siMongodb),
    "Redis": brand(siRedis),
    "Docker": brand(siDocker),
    "Kubernetes": brand(siKubernetes),
    "GitHub Actions": brand(siGithubactions),
};

const ICONS: Record<string, TechIcon> = { ...BRANDS, ...CONCEPT };

export const iconFor = (name: string): TechIcon | undefined => ICONS[name];

export default ICONS;
