"use client";

import { useEffect, useState } from "react";

export interface QuickDBMarketplaceStats {
    version: string;
    installs: number;
    downloads: number;
    updates: number;
    rating: number;
    loading: boolean;
}

const DEFAULT_STATS: QuickDBMarketplaceStats = {
    version: "1.2.7",
    installs: 496,
    downloads: 876,
    updates: 1078,
    rating: 4.5,
    loading: false,
};

let cachedStats: QuickDBMarketplaceStats | null = null;
let fetchPromise: Promise<QuickDBMarketplaceStats> | null = null;
const listeners = new Set<(stats: QuickDBMarketplaceStats) => void>();

async function getOrFetchMarketplaceStats(): Promise<QuickDBMarketplaceStats> {
    if (cachedStats && !cachedStats.loading) {
        return cachedStats;
    }

    // Try reading from sessionStorage first to prevent extra API calls on route changes
    if (typeof window !== "undefined") {
        try {
            const stored = sessionStorage.getItem("quickdb_marketplace_stats");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.version) {
                    const validStats: QuickDBMarketplaceStats = { ...parsed, loading: false };
                    cachedStats = validStats;
                    return validStats;
                }
            }
        } catch {
            // Ignore storage read error
        }
    }

    // If an API request is already in progress, await the existing promise
    const activePromise = fetchPromise;
    if (activePromise) {
        return await activePromise;
    }

    const promise = (async (): Promise<QuickDBMarketplaceStats> => {
        try {
            const res = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json;api-version=3.0-preview.1",
                },
                body: JSON.stringify({
                    filters: [
                        {
                            criteria: [{ filterType: 7, value: "quickdb.quickdb" }],
                        },
                    ],
                    flags: 914,
                }),
            });

            if (!res.ok) throw new Error("HTTP Error");

            const data = await res.json();
            const ext = data?.results?.[0]?.extensions?.[0];

            if (ext) {
                const version = ext.versions?.[0]?.version || "1.2.7";
                const statistics: Array<{ statisticName: string; value: number }> = ext.statistics || [];
                const installStat = statistics.find((s) => s.statisticName === "install");
                const downloadStat = statistics.find((s) => s.statisticName === "downloadCount");
                const updateStat = statistics.find((s) => s.statisticName === "updateCount");
                const ratingStat = statistics.find((s) => s.statisticName === "weightedRating");

                const newStats: QuickDBMarketplaceStats = {
                    version,
                    installs: installStat ? Math.round(installStat.value) : 496,
                    downloads: downloadStat ? Math.round(downloadStat.value) : 876,
                    updates: updateStat ? Math.round(updateStat.value) : 1078,
                    rating: ratingStat ? Number(ratingStat.value.toFixed(1)) : 4.5,
                    loading: false,
                };

                cachedStats = newStats;
                if (typeof window !== "undefined") {
                    try {
                        sessionStorage.setItem("quickdb_marketplace_stats", JSON.stringify(newStats));
                    } catch {
                        // Ignore storage write error
                    }
                }

                listeners.forEach((listener) => listener(newStats));
                return newStats;
            }
        } catch {
            // Keep default fallback stats on failure
        } finally {
            fetchPromise = null;
        }

        return cachedStats ? cachedStats : DEFAULT_STATS;
    })();

    fetchPromise = promise;
    return await promise;
}

export function useQuickDBMarketplace(): QuickDBMarketplaceStats {
    const [stats, setStats] = useState<QuickDBMarketplaceStats>(() => cachedStats || DEFAULT_STATS);

    useEffect(() => {
        let isMounted = true;

        const handleUpdate = (updated: QuickDBMarketplaceStats) => {
            if (isMounted) {
                setStats(updated);
            }
        };

        listeners.add(handleUpdate);

        getOrFetchMarketplaceStats().then((data) => {
            if (isMounted) {
                setStats(data);
            }
        });

        return () => {
            isMounted = false;
            listeners.delete(handleUpdate);
        };
    }, []);

    return stats;
}

export function formatInstallCount(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
    return `${n.toLocaleString()}+`;
}
