import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "404 - Page Not Found",
    description: "The page you are looking for does not exist on Nazmul Haque's portfolio.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-fg">
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>
            <div className="relative z-10 mx-auto max-w-md text-center">
                <h1 className="font-display text-8xl font-extrabold tracking-tight lg:text-9xl">
                    <span className="text-gradient">404</span>
                </h1>
                <p className="font-display mt-4 text-2xl font-bold md:text-3xl">Something&apos;s missing.</p>
                <p className="mx-auto mt-3 max-w-sm text-base font-light text-muted">
                    Sorry, we can&apos;t find that page. There&apos;s lots to explore back on the home page.
                </p>
                <Link className="btn-accent sheen mt-7" href="/">
                    <span className="relative z-10">Back to Homepage</span>
                </Link>
            </div>
        </section>
    );
}
