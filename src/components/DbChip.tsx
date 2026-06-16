"use client";

import { useState } from "react";

interface DbChipProps {
    name: string;
    /** simpleicons.org slug, if the engine has a known brand logo */
    slug?: string;
}

/**
 * A "supported database" pill with its brand logo on a white tile (so dark
 * brand marks like Kafka/SQLite stay visible in both themes). Falls back to a
 * generic database glyph when the engine has no slug or the logo fails to
 * load, so the grid never shows broken images.
 */
const DbChip = ({ name, slug }: DbChipProps) => {
    const [failed, setFailed] = useState(false);
    const showLogo = Boolean(slug) && !failed;

    return (
        <span className="chip gap-2 py-1 pl-1 pr-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-white ring-1 ring-black/5">
                {showLogo ? (
                    <img
                        alt=""
                        aria-hidden
                        className="h-3.5 w-3.5 object-contain"
                        loading="lazy"
                        onError={() => setFailed(true)}
                        src={`https://cdn.simpleicons.org/${slug}`}
                    />
                ) : (
                    <svg
                        aria-hidden
                        className="h-3.5 w-3.5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                        />
                    </svg>
                )}
            </span>
            {name}
        </span>
    );
};

export default DbChip;
