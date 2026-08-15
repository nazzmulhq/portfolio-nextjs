"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * RoutePrerender
 * Prerenders and prefetches the /quickdb route in the background when the user visits the home page.
 * Uses:
 * 1. Next.js router.prefetch() on browser idle
 * 2. Speculation Rules API for modern Chromium background prerendering (safely injected in useEffect)
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

            // Safely inject Speculation Rules for Chromium if supported without triggering React script warnings
            if (
                typeof HTMLScriptElement !== "undefined" &&
                HTMLScriptElement.supports &&
                HTMLScriptElement.supports("speculationrules")
            ) {
                const existing = document.querySelector('script[type="speculationrules"]');
                if (!existing) {
                    const specScript = document.createElement("script");
                    specScript.type = "speculationrules";
                    specScript.textContent = JSON.stringify({
                        prerender: [{ source: "list", urls: ["/quickdb"], eagerness: "moderate" }],
                        prefetch: [{ source: "list", urls: ["/quickdb"], eagerness: "eager" }],
                    });
                    document.head.appendChild(specScript);
                }
            }
        }
    }, [router]);

    return null;
}
