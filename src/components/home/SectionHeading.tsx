import { FC, ReactNode } from "react";

export interface ISectionHeading {
    /** Two-digit section number shown in the rule, e.g. "02". */
    index: string;
    label: string;
    title: string;
    note?: ReactNode;
}

const SectionHeading: FC<ISectionHeading> = ({ index, label, title, note }) => (
    <header data-heading>
        <div className="flex items-center gap-4" data-heading-rule>
            <span className="digit text-xs text-accent">{index}</span>
            <span className="section-rule flex-1" />
            {note && <span className="label whitespace-nowrap">{note}</span>}
        </div>

        <p className="label mt-6 flex items-center gap-2" data-heading-label>
            {label}
        </p>

        {/* data-decode is picked up by the motion controller, which scrambles
            the characters back into place as the heading enters. */}
        <h2
            className="display mt-3 text-[clamp(2.25rem,7vw,4.5rem)] text-fg"
            data-decode
        >
            {title}
        </h2>
    </header>
);

export default SectionHeading;
