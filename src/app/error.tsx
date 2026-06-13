"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-fg">
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>
            <div className="glass-card relative z-10 mx-auto max-w-md p-8 text-center sm:p-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    <span className="text-gradient">Something went wrong</span>
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm font-light text-muted">
                    An unexpected error occurred. You can try reloading this section.
                </p>
                <button className="btn-accent sheen mt-7" onClick={() => reset()} type="button">
                    <span className="relative z-10">Try again</span>
                </button>
            </div>
        </section>
    );
}
