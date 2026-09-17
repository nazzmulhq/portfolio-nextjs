"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ParsedActivityEvent, ActivitySummary } from "@src/lib/api/activityCsvService";

interface QuickDbActivityDashboardProps {
    initialEvents: ParsedActivityEvent[];
    initialSummary: ActivitySummary;
}

export default function QuickDbActivityDashboard({
    initialEvents,
    initialSummary
}: QuickDbActivityDashboardProps) {
    const [events, setEvents] = useState<ParsedActivityEvent[]>(initialEvents);
    const [summary, setSummary] = useState<ActivitySummary>(initialSummary);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeature, setSelectedFeature] = useState<string>("all");
    const [selectedOs, setSelectedOs] = useState<string>("all");
    const [selectedMetadataEvent, setSelectedMetadataEvent] = useState<ParsedActivityEvent | null>(null);
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showClearModal, setShowClearModal] = useState<boolean>(false);
    const [isClearing, setIsClearing] = useState<boolean>(false);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v1/activity/events", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setEvents(data.events || []);
                    setSummary(data.summary || initialSummary);
                }
            }
        } catch (err) {
            console.error("Failed to refresh activity data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!eventId || deletingId) return;
        setDeletingId(eventId);
        try {
            const res = await fetch(`/api/v1/activity/events?event_id=${encodeURIComponent(eventId)}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
                if (selectedMetadataEvent?.event_id === eventId) {
                    setSelectedMetadataEvent(null);
                }
                await refreshData();
            } else {
                alert(data.message || "Failed to delete event row");
            }
        } catch (err) {
            console.error("Failed to delete event row:", err);
            alert("Network error while deleting event row");
        } finally {
            setDeletingId(null);
        }
    };

    const handleClearAllEvents = async () => {
        setIsClearing(true);
        try {
            const res = await fetch("/api/v1/activity/events?all=true", {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setEvents([]);
                setShowClearModal(false);
                if (selectedMetadataEvent) {
                    setSelectedMetadataEvent(null);
                }
                await refreshData();
            } else {
                alert(data.message || "Failed to clear CSV");
            }
        } catch (err) {
            console.error("Failed to clear CSV:", err);
            alert("Network error while clearing CSV");
        } finally {
            setIsClearing(false);
        }
    };

    // Auto-refresh every 30 seconds and handle client mount
    useEffect(() => {
        setMounted(true);
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter((evt) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !query ||
                evt.event_id.toLowerCase().includes(query) ||
                evt.item_name.toLowerCase().includes(query) ||
                evt.item_id.toLowerCase().includes(query) ||
                evt.feature_name.toLowerCase().includes(query) ||
                evt.action.toLowerCase().includes(query) ||
                evt.device_id.toLowerCase().includes(query) ||
                evt.location.toLowerCase().includes(query) ||
                evt.ip_address.toLowerCase().includes(query);

            const matchesFeature =
                selectedFeature === "all" ||
                evt.feature_name.toLowerCase() === selectedFeature.toLowerCase();

            const matchesOs =
                selectedOs === "all" ||
                evt.os_name.toLowerCase() === selectedOs.toLowerCase();

            return matchesQuery && matchesFeature && matchesOs;
        });
    }, [events, searchQuery, selectedFeature, selectedOs]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, currentPage, pageSize]);

    // Export CSV from client
    const handleExportCsv = () => {
        if (!events.length) return;
        const headers = [
            "event_id",
            "session_id",
            "feature_name",
            "action",
            "item_id",
            "item_name",
            "occurred_at",
            "device_id",
            "device_name",
            "os_name",
            "ip_address",
            "location",
            "status",
            "received_at",
            "metadata"
        ];
        const rows = events.map((e) => [
            e.event_id,
            e.session_id,
            e.feature_name,
            e.action,
            e.item_id,
            e.item_name,
            e.occurred_at,
            e.device_id,
            e.device_name,
            e.os_name,
            e.ip_address,
            e.location,
            e.status,
            e.received_at,
            e.metadata ? JSON.stringify(e.metadata).replace(/"/g, '""') : ""
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `quickdb_activity_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatRelativeTime = (isoString?: string | null) => {
        if (!isoString) return "Never";
        if (!mounted) return isoString.slice(0, 10);
        const date = new Date(isoString);
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const getFeatureBadge = (feature: string) => {
        const f = feature.toLowerCase();
        if (f === "table") {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        }
        if (f === "query" || f === "sql_console") {
            return "bg-sky-500/10 text-sky-400 border-sky-500/20";
        }
        if (f === "erd") {
            return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        }
        if (f.startsWith("ai")) {
            return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        }
        return "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
    };

    return (
        <div className="min-h-screen bg-[var(--canvas)] text-[var(--fg)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] font-sans antialiased">
            {/* Top Engineering Grid & Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(63,221,159,0.12),rgba(0,0,0,0))] z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--line)] pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/quickdb"
                                className="inline-flex items-center text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to QuickDB
                            </Link>
                            <span className="text-[var(--line-strong)]">/</span>
                            <span className="text-xs font-mono text-[var(--accent)]">Analytics & Activity Log</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
                                QuickDB Activity Stream
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live CSV Feed
                            </span>
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            Synchronized once per calendar day from local SQLite instances into backend CSV storage.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={refreshData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-all cursor-pointer disabled:opacity-50"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[var(--accent)]" : "text-[var(--muted)]"}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isLoading ? "Reading CSV..." : "Refresh"}
                        </button>

                        <button
                            onClick={handleExportCsv}
                            disabled={events.length === 0}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-2)] transition-all cursor-pointer font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>

                        <button
                            onClick={() => setShowClearModal(true)}
                            disabled={events.length === 0 || isClearing}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear CSV
                        </button>
                    </div>
                </div>

                {/* Hero KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Events */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">Total Events</span>
                            <span className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-mono font-bold text-[var(--fg)]">
                                {summary.totalEvents.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--muted)]">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Permanently written in CSV
                            </div>
                        </div>
                    </div>

                    {/* Unique Devices */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">Unique Devices</span>
                            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-mono font-bold text-[var(--fg)]">
                                {summary.uniqueDevices}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)] font-mono">
                                <span>💻 {summary.deviceDistribution.laptop} laptops</span>
                                <span>🖥️ {summary.deviceDistribution.desktop} desktops</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Active Feature */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">Top Feature</span>
                            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-mono font-bold text-[var(--accent)] truncate">
                                {summary.topFeature.name.toUpperCase()}
                            </div>
                            <div className="mt-1 text-xs text-[var(--muted)]">
                                {summary.topFeature.count} interactions recorded
                            </div>
                        </div>
                    </div>

                    {/* Latest Ingestion */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">Latest Sync</span>
                            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl font-mono font-bold text-[var(--fg)]">
                                {formatRelativeTime(summary.latestSyncAt)}
                            </div>
                            <div className="mt-1 text-xs text-[var(--muted)] truncate">
                                {summary.latestSyncAt ? new Date(summary.latestSyncAt).toLocaleString() : "No sync yet"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Distribution Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feature Breakdown */}
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[var(--fg)]">Feature Distribution</h2>
                            <span className="text-xs font-mono text-[var(--muted)]">Interactions</span>
                        </div>
                        <div className="space-y-3 pt-2">
                            {summary.featureDistribution.length === 0 ? (
                                <div className="text-xs text-[var(--muted)] py-4 text-center font-mono">No data in CSV yet</div>
                            ) : (
                                summary.featureDistribution.map((feat) => (
                                    <div key={feat.name} className="space-y-1">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-[var(--fg)] capitalize">{feat.name}</span>
                                            <span className="text-[var(--muted)]">
                                                {feat.count} ({feat.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(5, feat.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Operating System Distribution */}
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[var(--fg)]">Operating System Breakdown</h2>
                            <span className="text-xs font-mono text-[var(--muted)]">Devices</span>
                        </div>
                        <div className="space-y-3 pt-2">
                            {summary.osDistribution.length === 0 ? (
                                <div className="text-xs text-[var(--muted)] py-4 text-center font-mono">No OS data</div>
                            ) : (
                                summary.osDistribution.map((os) => {
                                    const pct = summary.totalEvents > 0 ? Math.round((os.count / summary.totalEvents) * 100) : 0;
                                    return (
                                        <div key={os.name} className="space-y-1">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-[var(--fg)] uppercase">{os.name}</span>
                                                <span className="text-[var(--muted)]">{os.count} events ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-sky-400 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max(5, pct)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Detected Locations */}
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[var(--fg)]">Geographic Nodes</h2>
                            <span className="text-xs font-mono text-[var(--muted)]">Geo & IP</span>
                        </div>
                        <div className="pt-2 flex flex-wrap gap-2">
                            {summary.locationDistribution.length === 0 ? (
                                <div className="text-xs text-[var(--muted)] py-4 text-center font-mono w-full">Local / Private networks</div>
                            ) : (
                                summary.locationDistribution.map((loc) => (
                                    <div
                                        key={loc.location}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs font-mono text-[var(--fg)]"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>{loc.location}</span>
                                        <span className="text-[var(--muted)]">({loc.count})</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search by feature, item, device, IP..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3.5 py-2 pl-9 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-mono"
                            />
                            <svg
                                className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                            {/* Feature Filter */}
                            <select
                                value={selectedFeature}
                                onChange={(e) => {
                                    setSelectedFeature(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                            >
                                <option value="all">All Features</option>
                                <option value="table">Tables</option>
                                <option value="query">Query Console</option>
                                <option value="erd">ERD Diagram</option>
                                <option value="ai">AI Assistant</option>
                                <option value="tools">Tools</option>
                            </select>

                            {/* OS Filter */}
                            <select
                                value={selectedOs}
                                onChange={(e) => {
                                    setSelectedOs(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                            >
                                <option value="all">All Platforms</option>
                                <option value="mac">macOS</option>
                                <option value="windows">Windows</option>
                                <option value="linux">Linux</option>
                                <option value="ubuntu">Ubuntu</option>
                            </select>

                            {/* Clear Filters */}
                            {(searchQuery || selectedFeature !== "all" || selectedOs !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedFeature("all");
                                        setSelectedOs("all");
                                        setCurrentPage(1);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-[var(--hot)] hover:bg-[var(--hot-soft)] transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Events Data Table */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]">
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Timestamp</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Feature</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Action</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Item / Target</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Device & OS</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">IP / Location</th>
                                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)] text-[var(--fg)]">
                                {paginatedEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-[var(--muted)]">
                                            No activity events found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEvents.map((evt) => (
                                        <tr key={evt.event_id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                                            <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)]">
                                                {formatRelativeTime(evt.occurred_at || evt.received_at)}
                                                <div className="text-[10px] text-[var(--faint)]">
                                                    {(evt.occurred_at || evt.received_at).split("T")[1]?.slice(0, 8)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${getFeatureBadge(evt.feature_name)}`}>
                                                    {evt.feature_name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap font-medium text-[var(--fg)]">
                                                {evt.action}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-[var(--accent-2)]">
                                                {evt.item_name || evt.item_id || "—"}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)]">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{evt.device_name === "laptop" ? "💻" : "🖥️"}</span>
                                                    <span className="uppercase text-[11px]">{evt.os_name || "unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)]">
                                                {evt.location ? (
                                                    <span>{evt.location}</span>
                                                ) : (
                                                    <span className="text-[var(--faint)]">{evt.ip_address || "local"}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {evt.metadata ? (
                                                        <button
                                                            onClick={() => setSelectedMetadataEvent(evt)}
                                                            className="px-2 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--muted)] border border-[var(--line)] text-[10px] transition-colors cursor-pointer"
                                                        >
                                                            JSON
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => handleDeleteEvent(evt.event_id)}
                                                        disabled={deletingId === evt.event_id}
                                                        title="Delete this row from CSV"
                                                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {deletingId === evt.event_id ? (
                                                            <span className="w-2.5 h-2.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[var(--line)] text-xs font-mono text-[var(--muted)]">
                        <div>
                            Showing {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                            {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} events
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                            >
                                Prev
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata Modal */}
            {selectedMetadataEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                                    Event: {selectedMetadataEvent.event_id}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedMetadataEvent(null)}
                                className="text-[var(--muted)] hover:text-[var(--fg)] text-lg leading-none cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="text-xs space-y-1 text-[var(--muted)] font-mono">
                            <div>Feature: <span className="text-[var(--fg)]">{selectedMetadataEvent.feature_name}</span> ({selectedMetadataEvent.action})</div>
                            <div>Occurred At: <span className="text-[var(--fg)]">{selectedMetadataEvent.occurred_at}</span></div>
                            <div>Device ID: <span className="text-[var(--fg)]">{selectedMetadataEvent.device_id}</span></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-mono text-[var(--muted)]">Metadata JSON:</span>
                            <pre className="p-3 rounded-lg bg-[var(--canvas)] border border-[var(--line)] text-emerald-400 text-xs font-mono overflow-auto max-h-60">
                                {JSON.stringify(selectedMetadataEvent.metadata, null, 2)}
                            </pre>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => handleDeleteEvent(selectedMetadataEvent.event_id)}
                                disabled={deletingId === selectedMetadataEvent.event_id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deletingId === selectedMetadataEvent.event_id ? "Deleting..." : "Delete Row"}
                            </button>
                            <button
                                onClick={() => setSelectedMetadataEvent(null)}
                                className="px-4 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--fg)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Events Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-rose-400">
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[var(--fg)]">Clear CSV Activity Log</h3>
                                <p className="text-xs text-[var(--muted)] font-mono">Irreversible Action</p>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                            Are you sure you want to permanently delete all{" "}
                            <strong className="text-[var(--fg)] font-mono">{events.length}</strong> activity event row
                            {events.length === 1 ? "" : "s"} from the CSV log?
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                            <button
                                onClick={() => setShowClearModal(false)}
                                disabled={isClearing}
                                className="px-4 py-2 rounded-lg text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] border border-transparent transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllEvents}
                                disabled={isClearing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isClearing ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Clearing CSV...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete All Rows
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
