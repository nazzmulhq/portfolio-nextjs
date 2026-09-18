"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ParsedActivityEvent, ActivitySummary } from "@src/lib/api/activitySummaryHelper";

export interface DeviceRecord {
    deviceId: string;
    codeEditor: string;
    country: string;
    city: string;
    location: string;
    opens: string[];
    openCount: number;
    lastOpenedAt: string | null;
}

interface QuickDbActivityDashboardProps {
    initialEvents: ParsedActivityEvent[];
    initialSummary: ActivitySummary;
    initialDeviceStore?: Record<string, any>;
}

export default function QuickDbActivityDashboard({
    initialEvents,
    initialSummary,
    initialDeviceStore = {}
}: QuickDbActivityDashboardProps) {
    const [events, setEvents] = useState<ParsedActivityEvent[]>(initialEvents);
    const [deviceStore, setDeviceStore] = useState<Record<string, any>>(initialDeviceStore);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [viewTab, setViewTab] = useState<"cards" | "table" | "json">("cards");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEditor, setSelectedEditor] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"opens_desc" | "recent" | "id">("opens_desc");
    const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});
    const [showClearModal, setShowClearModal] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Refresh data from API
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v1/activity/events", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setEvents(data.events || []);
                    if (data.deviceStore) {
                        setDeviceStore(data.deviceStore);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to refresh activity data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Parse deviceStore or fallback to events grouping
    const devicesList: DeviceRecord[] = useMemo(() => {
        const storeEntries = Object.entries(deviceStore);

        if (storeEntries.length > 0) {
            return storeEntries.map(([devId, data]) => {
                const devObj = (typeof data === "object" && data !== null) ? data : {};
                const editor =
                    devObj["name of code editor"] ||
                    devObj.code_editor ||
                    "Visual Studio Code";
                const country = devObj["name of country"] || devObj.country || "";
                const city = devObj["name of city"] || devObj.city || "";
                const location = [city, country].filter(Boolean).join(", ") || "Global";
                const opens: string[] = Array.isArray(devObj["how many time open quickdb in a day"])
                    ? devObj["how many time open quickdb in a day"]
                    : Array.isArray(devObj.opens)
                    ? devObj.opens
                    : [];

                const lastOpened = opens.length > 0 ? opens[opens.length - 1] : null;

                return {
                    deviceId: devId,
                    codeEditor: editor,
                    country,
                    city,
                    location,
                    opens,
                    openCount: opens.length,
                    lastOpenedAt: lastOpened
                };
            });
        }

        // Fallback: group events by device_id
        const groups: Record<string, DeviceRecord> = {};
        for (const evt of events) {
            const dId = evt.device_id || "unknown";
            if (!groups[dId]) {
                const loc = evt.location || "Global";
                const locParts = loc.split(",").map((s) => s.trim());
                groups[dId] = {
                    deviceId: dId,
                    codeEditor: evt.code_editor || "Visual Studio Code",
                    country: locParts[1] || "",
                    city: locParts[0] || "",
                    location: loc,
                    opens: [],
                    openCount: 0,
                    lastOpenedAt: null
                };
            }
            const time = evt.occurred_at || evt.received_at;
            if (time) {
                groups[dId].opens.push(time);
                groups[dId].openCount++;
                groups[dId].lastOpenedAt = time;
            }
        }

        return Object.values(groups);
    }, [deviceStore, events]);

    // Unique editors for filtering
    const availableEditors = useMemo(() => {
        const set = new Set<string>();
        devicesList.forEach((d) => {
            if (d.codeEditor) set.add(d.codeEditor);
        });
        return Array.from(set);
    }, [devicesList]);

    // Filter & Sort
    const filteredDevices = useMemo(() => {
        let result = devicesList.filter((d) => {
            if (selectedEditor !== "all" && d.codeEditor.toLowerCase() !== selectedEditor.toLowerCase()) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matches =
                    d.deviceId.toLowerCase().includes(q) ||
                    d.codeEditor.toLowerCase().includes(q) ||
                    d.country.toLowerCase().includes(q) ||
                    d.city.toLowerCase().includes(q) ||
                    d.location.toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        });

        result.sort((a, b) => {
            if (sortBy === "opens_desc") {
                return b.openCount - a.openCount;
            }
            if (sortBy === "recent") {
                const tA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
                const tB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
                return tB - tA;
            }
            return a.deviceId.localeCompare(b.deviceId);
        });

        return result;
    }, [devicesList, selectedEditor, searchQuery, sortBy]);

    // Aggregated metrics
    const totalOpens = useMemo(() => {
        return devicesList.reduce((acc, d) => acc + d.openCount, 0);
    }, [devicesList]);

    const topEditor = useMemo(() => {
        if (devicesList.length === 0) return "N/A";
        const counts: Record<string, number> = {};
        for (const d of devicesList) {
            counts[d.codeEditor] = (counts[d.codeEditor] || 0) + d.openCount;
        }
        let best = "None";
        let max = -1;
        for (const [name, cnt] of Object.entries(counts)) {
            if (cnt > max) {
                max = cnt;
                best = name;
            }
        }
        return best;
    }, [devicesList]);

    const topLocation = useMemo(() => {
        if (devicesList.length === 0) return "Global";
        const counts: Record<string, number> = {};
        for (const d of devicesList) {
            if (d.location && d.location !== "Global") {
                counts[d.location] = (counts[d.location] || 0) + 1;
            }
        }
        let best = "Global";
        let max = 0;
        for (const [loc, cnt] of Object.entries(counts)) {
            if (cnt > max) {
                max = cnt;
                best = loc;
            }
        }
        return best;
    }, [devicesList]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleExpand = (deviceId: string) => {
        setExpandedDevices((prev) => ({
            ...prev,
            [deviceId]: !prev[deviceId]
        }));
    };

    const handleExportJson = () => {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deviceStore, null, 2));
        const a = document.createElement("a");
        a.href = jsonStr;
        a.download = `quickdb_data_${Date.now()}.json`;
        a.click();
    };

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            const res = await fetch("/api/v1/activity/events?all=true", { method: "DELETE" });
            if (res.ok) {
                setDeviceStore({});
                setEvents([]);
                setShowClearModal(false);
            }
        } catch (err) {
            console.error("Error clearing data:", err);
        } finally {
            setIsClearing(false);
        }
    };

    const formatRelativeTime = (timeStr?: string | null) => {
        if (!timeStr) return "Never";
        if (!mounted) return timeStr.slice(0, 10);
        const d = new Date(timeStr);
        if (isNaN(d.getTime())) return timeStr;
        const diffMs = Date.now() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
            {/* Background grid texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Banner */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[var(--line)]">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                            <Link href="/quickdb" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to QuickDB
                            </Link>
                            <span>/</span>
                            <span className="text-[var(--accent)]">Activity & Telemetry</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
                                QuickDB Device Activity
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live data.json Feed
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--muted)]">
                            Real-time engagement telemetry stored as unique device keys in{" "}
                            <code className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--accent)] font-mono text-xs border border-[var(--line)]">
                                public/data.json
                            </code>
                        </p>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href="/data.json"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-all"
                        >
                            <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            View /data.json
                        </a>

                        <button
                            onClick={refreshData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-all cursor-pointer disabled:opacity-50"
                        >
                            <svg
                                className={`w-3.5 h-3.5 text-[var(--muted)] ${isLoading ? "animate-spin text-[var(--accent)]" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isLoading ? "Reading..." : "Refresh"}
                        </button>

                        <button
                            onClick={handleExportJson}
                            disabled={devicesList.length === 0}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export JSON
                        </button>

                        <button
                            onClick={() => setShowClearModal(true)}
                            disabled={devicesList.length === 0 || isClearing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-40"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear
                        </button>
                    </div>
                </header>

                {/* KPI Metrics Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Unique Devices */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span>UNIQUE DEVICES</span>
                            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                {devicesList.length}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 font-medium">● 100% active</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            JSON keys recorded
                        </p>
                    </div>

                    {/* Card 2: Total Opens Today */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span>TOTAL OPENS IN DAY</span>
                            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                {totalOpens}
                            </span>
                            <span className="text-xs font-mono text-[var(--muted)]">sessions</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            Combined daily open events
                        </p>
                    </div>

                    {/* Card 3: Top Code Editor */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span>PRIMARY CODE EDITOR</span>
                            <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-bold font-mono text-[var(--fg)] truncate block">
                                {topEditor}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            {availableEditors.length} IDE{availableEditors.length === 1 ? "" : "s"} detected
                        </p>
                    </div>

                    {/* Card 4: Top Location */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span>PRIMARY LOCATION</span>
                            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-bold font-mono text-[var(--fg)] truncate block">
                                {topLocation}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            Client country & city
                        </p>
                    </div>
                </section>

                {/* Filter and View Tabs Bar */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* View Tabs */}
                        <div className="inline-flex p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] self-start">
                            <button
                                onClick={() => setViewTab("cards")}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                                    viewTab === "cards"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)]"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Device Cards ({filteredDevices.length})
                            </button>

                            <button
                                onClick={() => setViewTab("table")}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                                    viewTab === "table"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)]"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Table View
                            </button>

                            <button
                                onClick={() => setViewTab("json")}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                                    viewTab === "json"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)]"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                data.json Inspector
                            </button>
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-auto">
                            <span className="text-[var(--muted)]">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[var(--accent)]"
                            >
                                <option value="opens_desc">Most Opens First</option>
                                <option value="recent">Recently Active</option>
                                <option value="id">Device ID (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Search & Editor Filter Pills */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Device ID, Code Editor, City, or Country..."
                                className="w-full bg-[var(--surface)] text-[var(--fg)] text-xs font-mono rounded-xl pl-10 pr-4 py-2.5 border border-[var(--line)] focus:border-[var(--accent)] outline-none transition-all placeholder:text-[var(--muted)]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--fg)] font-mono"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Editor Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                onClick={() => setSelectedEditor("all")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                                    selectedEditor === "all"
                                        ? "bg-[var(--surface-3)] text-[var(--fg)] border border-[var(--line-strong)] font-semibold"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] border border-transparent"
                                }`}
                            >
                                All Editors
                            </button>
                            {availableEditors.map((ed) => (
                                <button
                                    key={ed}
                                    onClick={() => setSelectedEditor(ed)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                                        selectedEditor.toLowerCase() === ed.toLowerCase()
                                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                                            : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] border border-[var(--line)]"
                                    }`}
                                >
                                    {ed}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content View Modes */}
                {viewTab === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredDevices.length === 0 ? (
                            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)]/50">
                                <p className="text-sm font-mono text-[var(--muted)]">No devices match your search criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedEditor("all");
                                    }}
                                    className="mt-3 text-xs font-mono text-[var(--accent)] underline hover:opacity-80"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            filteredDevices.map((device, index) => {
                                const isExpanded = Boolean(expandedDevices[device.deviceId]);
                                return (
                                    <div
                                        key={device.deviceId}
                                        className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 hover:border-[var(--line-strong)] transition-all shadow-xs flex flex-col justify-between"
                                    >
                                        {/* Card Header */}
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="w-6 h-6 rounded-md bg-[var(--surface-2)] text-[var(--muted)] text-xs font-mono font-bold flex items-center justify-center border border-[var(--line)]">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="font-mono text-xs font-semibold text-[var(--fg)] tracking-tight">
                                                        {device.deviceId.length > 24 ? `${device.deviceId.slice(0, 12)}...${device.deviceId.slice(-6)}` : device.deviceId}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(device.deviceId, device.deviceId)}
                                                        title="Copy unique device ID"
                                                        className="p-1 rounded text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                                                    >
                                                        {copiedId === device.deviceId ? (
                                                            <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Open Count Badge */}
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                                    ⚡ {device.openCount} open{device.openCount === 1 ? "" : "s"} in day
                                                </span>
                                            </div>

                                            {/* Attribute Pills */}
                                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">name of code editor</span>
                                                    <span className="text-[var(--fg)] font-medium flex items-center gap-1">
                                                        ⚙️ {device.codeEditor}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">location (country & city)</span>
                                                    <span className="text-[var(--fg)] font-medium flex items-center gap-1 truncate" title={device.location}>
                                                        📍 {device.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable Timestamps Section */}
                                        <div className="border-t border-[var(--line)] pt-3">
                                            <button
                                                onClick={() => toggleExpand(device.deviceId)}
                                                className="w-full flex items-center justify-between text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer py-1"
                                            >
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    how many time open quickdb in a day ({device.opens.length})
                                                </span>
                                                <span className="text-[10px] text-[var(--accent)]">
                                                    {isExpanded ? "Hide date & time" : "Show all date & time"}
                                                </span>
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2 max-h-52 overflow-y-auto font-mono text-xs">
                                                    {device.opens.length === 0 ? (
                                                        <p className="text-[11px] text-[var(--muted)]">No open timestamps recorded.</p>
                                                    ) : (
                                                        device.opens.map((timeStr, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--line)]/60 text-[11px]"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-[var(--muted)] font-bold">#{idx + 1}</span>
                                                                    <span className="text-[var(--fg)] font-semibold">{timeStr}</span>
                                                                </div>
                                                                <span className="text-[10px] text-[var(--muted)] font-mono" suppressHydrationWarning>
                                                                    {formatRelativeTime(timeStr)}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Table View */}
                {viewTab === "table" && (
                    <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
                        <table className="w-full text-left text-xs font-mono border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]">
                                    <th className="py-3 px-4 font-semibold uppercase">Device ID (Key)</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Code Editor</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Country</th>
                                    <th className="py-3 px-4 font-semibold uppercase">City</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-center">Daily Opens</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Last Opened</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)] text-[var(--fg)]">
                                {filteredDevices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[var(--muted)]">
                                            No matching devices found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDevices.map((device) => (
                                        <tr key={device.deviceId} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-[var(--fg)]">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{device.deviceId.slice(0, 16)}...</span>
                                                    <button
                                                        onClick={() => handleCopy(device.deviceId, device.deviceId)}
                                                        className="text-[var(--muted)] hover:text-[var(--accent)]"
                                                        title="Copy ID"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[11px]">
                                                    ⚙️ {device.codeEditor}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[var(--muted)]">{device.country || "—"}</td>
                                            <td className="py-3 px-4 text-[var(--muted)]">{device.city || "—"}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {device.openCount}x
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[var(--muted)]" suppressHydrationWarning>
                                                {formatRelativeTime(device.lastOpenedAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Raw JSON Inspector View */}
                {viewTab === "json" && (
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xs">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--surface-2)]">
                            <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                public/data.json Live Content
                            </span>
                            <button
                                onClick={() => handleCopy(JSON.stringify(deviceStore, null, 2), "raw_json")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--fg)] border border-[var(--line)] transition-colors cursor-pointer"
                            >
                                {copiedId === "raw_json" ? "Copied!" : "Copy JSON"}
                            </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-emerald-400 bg-[var(--surface-3)] overflow-x-auto max-h-[600px] leading-relaxed">
                            {JSON.stringify(deviceStore, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Clear Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-xl">
                        <h3 className="text-base font-bold text-[var(--fg)]">Clear Activity Data</h3>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                            Are you sure you want to clear all device entries from <code className="text-[var(--accent)]">data.json</code>? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="px-4 py-2 rounded-lg text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAll}
                                disabled={isClearing}
                                className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isClearing ? "Clearing..." : "Yes, Clear All"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
