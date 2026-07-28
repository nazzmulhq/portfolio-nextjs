import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface ISkills {}

/**
 * Two-letter symbols, periodic-table style. Derived by hand rather than
 * generated: an automatic rule collides (React/REST both give "Re") and
 * produces unreadable pairs for names like CI/CD or Kubernetes.
 */
const SYMBOLS: Record<string, string> = {
    "TypeScript": "Ts",
    "JavaScript": "Js",
    "Python": "Py",
    "React.js": "Re",
    "Next.js": "Nx",
    "Redux Toolkit": "Rx",
    "TailwindCSS": "Tw",
    "Ant Design": "An",
    "Nest.js": "Ns",
    "FastAPI": "Fa",
    "Django": "Dj",
    "REST APIs": "Ra",
    "Microservices": "Ms",
    "PostgreSQL": "Pg",
    "MySQL": "My",
    "MongoDB": "Mg",
    "Redis": "Rd",
    "Docker": "Dk",
    "Kubernetes": "K8",
    "GitHub Actions": "Ga",
    "CI/CD": "Ci",
};

const symbolFor = (name: string) =>
    SYMBOLS[name] ?? (name[0] + (name[1] ?? "")).replace(/^./, (c) => c.toUpperCase());

const Skills: FC<ISkills> = () => {
    const { skillGroups } = info;

    // Flattened once so the matrix is a single continuous grid — the
    // discipline stays legible through each tile's own tag.
    const cells = skillGroups.flatMap((group, gi) =>
        group.items.map((item) => ({
            name: item,
            group: group.label,
            tag: group.label.slice(0, 3).toUpperCase(),
            groupIndex: gi,
        })),
    );

    return (
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28" id="skills">
            <SectionHeading
                index="01"
                label="Capabilities"
                note={`${cells.length} tools · ${skillGroups.length} disciplines`}
                title="What I work with"
            />

            {/* Legend — maps each three-letter tag back to its discipline. */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2" data-skill-legend>
                {skillGroups.map((group, i) => (
                    <span className="flex items-baseline gap-2" key={group.label}>
                        <span className="digit text-[0.6rem] text-accent">
                            {group.label.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="label text-muted">{group.label}</span>
                        <span className="digit text-[0.6rem] text-faint">
                            {String(group.items.length).padStart(2, "0")}
                        </span>
                    </span>
                ))}
            </div>

            {/* Matrix. A scan line sweeps down it on scroll (see HomeMotion). */}
            <div className="matrix mt-6" data-skill-matrix>
                <span aria-hidden className="matrix-scan" data-skill-scan />

                {cells.map((cell, i) => (
                    <article
                        className="tile"
                        data-skill-tile
                        key={cell.name}
                        style={{ "--g": cell.groupIndex } as React.CSSProperties}
                        title={`${cell.name} · ${cell.group}`}
                    >
                        <span className="tile-idx">{String(i + 1).padStart(2, "0")}</span>
                        <span className="tile-tag">{cell.tag}</span>
                        <span className="tile-sym">{symbolFor(cell.name)}</span>
                        <span className="tile-name">{cell.name}</span>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Skills;
