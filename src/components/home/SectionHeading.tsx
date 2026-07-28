import { FC, ReactNode } from "react";

export interface ISectionHeading {
    label: string;
    title: string;
    note?: ReactNode;
}

const SectionHeading: FC<ISectionHeading> = ({ label, title, note }) => (
    <header className="reveal">
        <div className="section-divider mb-8" />
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="label flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {label}
            </p>
            {note && <p className="label">{note}</p>}
        </div>
        <h2 className="display mt-5 text-[clamp(2rem,6vw,4rem)] text-fg">{title}</h2>
    </header>
);

export default SectionHeading;
