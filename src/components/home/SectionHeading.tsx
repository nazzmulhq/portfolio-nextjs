import { FC } from "react";

export interface ISectionHeading {
    label: string;
    title?: string;
}

const SectionHeading: FC<ISectionHeading> = ({ label, title }) => (
    <div className="reveal mt-12 flex flex-col items-center gap-4 px-4 text-center sm:mt-20">
        <div className="flex w-full items-center justify-center gap-4">
            <span className="h-px max-w-[120px] flex-1 bg-gradient-to-r from-transparent to-[color-mix(in_srgb,var(--accent)_50%,transparent)]" />
            <span className="eyebrow shrink-0">{label}</span>
            <span className="h-px max-w-[120px] flex-1 bg-gradient-to-l from-transparent to-[color-mix(in_srgb,var(--accent)_50%,transparent)]" />
        </div>
        {title && (
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-fg sm:text-4xl">
                {title}
            </h2>
        )}
    </div>
);

export default SectionHeading;
