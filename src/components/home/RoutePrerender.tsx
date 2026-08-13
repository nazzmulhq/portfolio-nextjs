"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * RoutePrerender
 * Prerenders and prefetches the /quickdb route in the background when the user visits the home page.
 * Uses:
 * 1. Next.js router.prefetch() on browser idle
 * 2. Speculation Rules API for modern Chromium background prerendering
 * 3. <link rel="prefetch"> as document fallback
 */
export default function RoutePrerender() {
    const router = useRouter();

    useEffect(() => {
        const prefetchTargets = () => {
            router.prefetch("/quickdb");
        };

        if (typeof window !== "undefined") {
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(prefetchTargets, { timeout: 2500 });
            } else {
                setTimeout(prefetchTargets, 1200);
            }
        }
    }, [router]);

    const speculationRules = JSON.stringify({
        prerender: [
            {
                source: "list",
                urls: ["/quickdb"],
                eagerness: "moderate",
            },
        ],
        prefetch: [
            {
                source: "list",
                urls: ["/quickdb"],
                eagerness: "eager",
            },
        ],
    });

    return (
        <>
            {/* W3C Speculation Rules for Chromium background prerendering */}
            <script
                dangerouslySetInnerHTML={{ __html: speculationRules }}
                type="speculationrules"
            />
            {/* Standard link prefetch fallback */}
            <link as="document" href="/quickdb" rel="prefetch" />
        </>
    );
}
