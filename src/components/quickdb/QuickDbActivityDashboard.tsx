"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ParsedActivityEvent, ActivitySummary, computeActivitySummary } from "@src/lib/api/activitySummaryHelper";

interface QuickDbActivityDashboardProps {
    initialEvents: ParsedActivityEvent[];
    initialSummary: ActivitySummary;
}

export interface DeviceGroup {
    deviceId: string;
    deviceName: string;
    osName: string;
    ipAddress: string;
    location: string;
    events: ParsedActivityEvent[];
    eventCount: number;
    topFeature: { name: string; count: number };
    firstSeenAt: string | null;
    lastActiveAt: string | null;
}

export default function QuickDbActivityDashboard({
    initialEvents,
    initialSummary
}: QuickDbActivityDashboardProps) {
    const [events, setEvents] = useState<ParsedActivityEvent[]>(initialEvents);
    const [rawSummary, setRawSummary] = useState<ActivitySummary>(initialSummary);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<"stream" | "devices">("stream");
    const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});
    const [devicePage, setDevicePage] = useState(1);
    const [devicesPerPage, setDevicesPerPage] = useState<number | "all">(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeature, setSelectedFeature] = useState<string>("all");
    const [selectedDevice, setSelectedDevice] = useState<string>("all");
    const [selectedOs, setSelectedOs] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "7d" | "30d" | "single" | "range">("all");
    const [singleDate, setSingleDate] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedMetadataEvent, setSelectedMetadataEvent] = useState<ParsedActivityEvent | null>(null);
    const [pageSize, setPageSize] = useState<number | "all">(25);
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
                    setRawSummary(data.summary || initialSummary);
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

    // Dynamic lists of unique features, devices, platforms, statuses with event counts
    const availableFeatures = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const evt of events) {
            const f = evt.feature_name || "other";
            counts[f] = (counts[f] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));
    }, [events]);

    const availableDevices = useMemo(() => {
        const map = new Map<string, { id: string; name: string; count: number }>();
        for (const evt of events) {
            const id = evt.device_id || "unknown";
            const existing = map.get(id);
            if (existing) {
                existing.count++;
                if (evt.device_name && existing.name === "Unknown") existing.name = evt.device_name;
            } else {
                map.set(id, {
                    id,
                    name: evt.device_name || "Unknown",
                    count: 1
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [events]);

    const availablePlatforms = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const evt of events) {
            const os = evt.os_name || "unknown";
            counts[os] = (counts[os] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));
    }, [events]);

    const availableStatuses = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const evt of events) {
            const s = evt.status || "synced";
            counts[s] = (counts[s] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));
    }, [events]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (dateFilter !== "all") count++;
        if (selectedFeature !== "all") count++;
        if (selectedDevice !== "all") count++;
        if (selectedOs !== "all") count++;
        if (selectedStatus !== "all") count++;
        return count;
    }, [searchQuery, dateFilter, selectedFeature, selectedDevice, selectedOs, selectedStatus]);

    const handleResetAllFilters = () => {
        setSearchQuery("");
        setSelectedFeature("all");
        setSelectedDevice("all");
        setSelectedOs("all");
        setSelectedStatus("all");
        setDateFilter("all");
        setSingleDate("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        setDevicePage(1);
    };

    // Filtered events with global search, feature, OS, device, status, and date filtering support
    const filteredEvents = useMemo(() => {
        const now = new Date();
        const nowTime = now.getTime();
        const todayUtc = now.toISOString().split("T")[0];
        const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const startOfTodayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfTodayLocal = startOfTodayLocal + 24 * 60 * 60 * 1000;

        const yesterday = new Date(nowTime - 24 * 60 * 60 * 1000);
        const yesterdayUtc = yesterday.toISOString().split("T")[0];
        const yesterdayLocal = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        const startOfYesterdayLocal = startOfTodayLocal - 24 * 60 * 60 * 1000;

        const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;

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
                evt.device_name.toLowerCase().includes(query) ||
                evt.location.toLowerCase().includes(query) ||
                evt.ip_address.toLowerCase().includes(query);

            const matchesFeature =
                selectedFeature === "all" ||
                evt.feature_name.toLowerCase() === selectedFeature.toLowerCase();

            const matchesDevice =
                selectedDevice === "all" ||
                evt.device_id === selectedDevice;

            const matchesOs =
                selectedOs === "all" ||
                evt.os_name.toLowerCase() === selectedOs.toLowerCase();

            const matchesStatus =
                selectedStatus === "all" ||
                (evt.status || "synced").toLowerCase() === selectedStatus.toLowerCase();

            // Date filtering
            let matchesDate = true;
            const rawDate = evt.occurred_at || evt.received_at;
            if (rawDate && dateFilter !== "all") {
                const d = new Date(rawDate);
                const evtTime = d.getTime();
                const evtUtc = rawDate.split("T")[0];
                const evtLocal = !isNaN(evtTime)
                    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                    : evtUtc;

                if (dateFilter === "today") {
                    matchesDate =
                        evtUtc === todayUtc ||
                        evtLocal === todayLocal ||
                        (evtTime >= startOfTodayLocal && evtTime < endOfTodayLocal);
                } else if (dateFilter === "yesterday") {
                    matchesDate =
                        evtUtc === yesterdayUtc ||
                        evtLocal === yesterdayLocal ||
                        (evtTime >= startOfYesterdayLocal && evtTime < startOfTodayLocal);
                } else if (dateFilter === "7d") {
                    matchesDate = evtTime >= sevenDaysAgo;
                } else if (dateFilter === "30d") {
                    matchesDate = evtTime >= thirtyDaysAgo;
                } else if (dateFilter === "single") {
                    if (singleDate) {
                        matchesDate = evtLocal === singleDate || evtUtc === singleDate;
                    }
                } else if (dateFilter === "range") {
                    if (startDate && evtLocal < startDate && evtUtc < startDate) matchesDate = false;
                    if (endDate && evtLocal > endDate && evtUtc > endDate) matchesDate = false;
                }
            }

            return matchesQuery && matchesFeature && matchesDevice && matchesOs && matchesStatus && matchesDate;
        });
    }, [events, searchQuery, selectedFeature, selectedDevice, selectedOs, selectedStatus, dateFilter, singleDate, startDate, endDate]);

    // Derived summary: dynamically recalculate metrics for filtered view
    const summary = useMemo(() => {
        const isFilterActive =
            Boolean(searchQuery) ||
            selectedFeature !== "all" ||
            selectedDevice !== "all" ||
            selectedOs !== "all" ||
            selectedStatus !== "all" ||
            dateFilter !== "all" ||
            Boolean(singleDate) ||
            Boolean(startDate) ||
            Boolean(endDate);

        if (!isFilterActive && rawSummary.totalEvents > 0 && events.length === rawSummary.totalEvents) {
            return rawSummary;
        }
        return computeActivitySummary(filteredEvents);
    }, [filteredEvents, searchQuery, selectedFeature, selectedDevice, selectedOs, selectedStatus, dateFilter, singleDate, startDate, endDate, rawSummary, events.length]);

    // Pagination for flat stream
    const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(filteredEvents.length / pageSize));
    const paginatedEvents = useMemo(() => {
        if (pageSize === "all") return filteredEvents;
        const start = (currentPage - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, currentPage, pageSize]);

    // Group filtered events by unique device for nested table view
    const deviceGroups = useMemo<DeviceGroup[]>(() => {
        const map = new Map<string, DeviceGroup>();

        for (const evt of filteredEvents) {
            const id = evt.device_id || "unknown-device";
            let group = map.get(id);
            if (!group) {
                group = {
                    deviceId: id,
                    deviceName: evt.device_name || "Unknown",
                    osName: evt.os_name || "Unknown OS",
                    ipAddress: evt.ip_address || "Unknown IP",
                    location: evt.location || "Unknown Location",
                    events: [],
                    eventCount: 0,
                    topFeature: { name: "None", count: 0 },
                    firstSeenAt: null,
                    lastActiveAt: null
                };
                map.set(id, group);
            }

            group.events.push(evt);
            group.eventCount++;

            if (evt.device_name && group.deviceName === "Unknown") group.deviceName = evt.device_name;
            if (evt.os_name && (group.osName === "Unknown OS" || group.osName === "unknown")) group.osName = evt.os_name;
            if (evt.ip_address && (group.ipAddress === "Unknown IP" || group.ipAddress === "unknown")) group.ipAddress = evt.ip_address;
            if (evt.location && group.location === "Unknown Location") group.location = evt.location;
        }

        const groups = Array.from(map.values()).map((g) => {
            // Sort device events (newest first)
            g.events.sort((a, b) => {
                const timeA = new Date(a.occurred_at || a.received_at || 0).getTime();
                const timeB = new Date(b.occurred_at || b.received_at || 0).getTime();
                return timeB - timeA;
            });

            g.lastActiveAt = g.events[0]?.occurred_at || g.events[0]?.received_at || null;
            g.firstSeenAt = g.events[g.events.length - 1]?.occurred_at || g.events[g.events.length - 1]?.received_at || null;

            // Top feature
            const featCounts: Record<string, number> = {};
            for (const e of g.events) {
                const f = e.feature_name || "other";
                featCounts[f] = (featCounts[f] || 0) + 1;
            }
            let maxCount = 0;
            let topFeat = "None";
            for (const [name, count] of Object.entries(featCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    topFeat = name;
                }
            }
            g.topFeature = { name: topFeat, count: maxCount };

            return g;
        });

        // Sort device groups: highest activity first, then latest active
        groups.sort((a, b) => {
            if (b.eventCount !== a.eventCount) {
                return b.eventCount - a.eventCount;
            }
            const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
            const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
            return timeB - timeA;
        });

        return groups;
    }, [filteredEvents]);

    const totalDevicePages = devicesPerPage === "all" ? 1 : Math.max(1, Math.ceil(deviceGroups.length / devicesPerPage));
    const paginatedDeviceGroups = useMemo(() => {
        if (devicesPerPage === "all") return deviceGroups;
        const start = (devicePage - 1) * devicesPerPage;
        return deviceGroups.slice(start, start + devicesPerPage);
    }, [deviceGroups, devicePage, devicesPerPage]);

    const toggleDevice = (deviceId: string) => {
        setExpandedDevices((prev) => {
            const current = prev[deviceId] !== undefined ? prev[deviceId] : false;
            return { ...prev, [deviceId]: !current };
        });
    };

    const expandAllDevices = () => {
        const next: Record<string, boolean> = {};
        deviceGroups.forEach((g) => {
            next[g.deviceId] = true;
        });
        setExpandedDevices(next);
    };

    const collapseAllDevices = () => {
        const next: Record<string, boolean> = {};
        deviceGroups.forEach((g) => {
            next[g.deviceId] = false;
        });
        setExpandedDevices(next);
    };

    const handleExportDeviceCsv = (group: DeviceGroup) => {
        if (!group.events.length) return;
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
        const rows = group.events.map((e) => [
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
        link.setAttribute("download", `quickdb_activity_${group.deviceId}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

                {/* Top Global Filter Toolbar */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm space-y-4">
                    {/* Header: Title, Matches Count & Reset All */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="p-1.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </span>
                            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--fg)]">
                                Global Activity Filters
                            </h2>
                            {activeFilterCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                                    {activeFilterCount} active
                                </span>
                            )}
                            <span className="text-xs font-mono text-[var(--muted)]">
                                Showing{" "}
                                <span className="text-[var(--fg)] font-semibold">
                                    {filteredEvents.length.toLocaleString()}
                                </span>{" "}
                                of {events.length.toLocaleString()} events
                                {events.length > filteredEvents.length && (
                                    <span className="text-[var(--muted)] ml-1">
                                        ({events.length - filteredEvents.length} filtered out)
                                    </span>
                                )}
                            </span>
                        </div>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleResetAllFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                                title="Reset all applied filters"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reset All Filters
                            </button>
                        )}
                    </div>

                    {/* Row 1: Search & Date Presets */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[260px]">
                            <svg
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                placeholder="Search by ID, action, feature, device, OS, IP..."
                                className="w-full pl-10 pr-9 py-2 rounded-lg text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setCurrentPage(1);
                                        setDevicePage(1);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] p-1 rounded-md transition-colors cursor-pointer"
                                    title="Clear search"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Quick Date Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                            <button
                                onClick={() => {
                                    setDateFilter("all");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "all"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("today");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "today"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("yesterday");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "yesterday"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                Yesterday
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("7d");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "7d"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("30d");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "30d"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                30 Days
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("single");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "single"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Custom Date
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("range");
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                    dateFilter === "range"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-3)]"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Date Range
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Dynamic Dropdown Selectors (Feature, Device, Platform, Status) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Feature Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                                <span>Feature Module</span>
                                {selectedFeature !== "all" && (
                                    <button
                                        onClick={() => setSelectedFeature("all")}
                                        className="text-[var(--accent)] hover:underline cursor-pointer lowercase font-normal"
                                    >
                                        reset
                                    </button>
                                )}
                            </label>
                            <select
                                value={selectedFeature}
                                onChange={(e) => {
                                    setSelectedFeature(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-2)] border text-[var(--fg)] focus:outline-none transition-colors cursor-pointer ${
                                    selectedFeature !== "all"
                                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                                        : "border-[var(--line)] focus:border-[var(--accent)]"
                                }`}
                            >
                                <option value="all">All Features ({events.length})</option>
                                {availableFeatures.map((f) => (
                                    <option key={f.name} value={f.name}>
                                        {f.name} ({f.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Device Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                                <span>Specific Device</span>
                                {selectedDevice !== "all" && (
                                    <button
                                        onClick={() => setSelectedDevice("all")}
                                        className="text-[var(--accent)] hover:underline cursor-pointer lowercase font-normal"
                                    >
                                        reset
                                    </button>
                                )}
                            </label>
                            <select
                                value={selectedDevice}
                                onChange={(e) => {
                                    setSelectedDevice(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-2)] border text-[var(--fg)] focus:outline-none transition-colors cursor-pointer ${
                                    selectedDevice !== "all"
                                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                                        : "border-[var(--line)] focus:border-[var(--accent)]"
                                }`}
                            >
                                <option value="all">All Devices ({availableDevices.length})</option>
                                {availableDevices.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} · {d.id.length > 12 ? `${d.id.slice(0, 10)}...` : d.id} ({d.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Platform / OS Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                                <span>Platform / OS</span>
                                {selectedOs !== "all" && (
                                    <button
                                        onClick={() => setSelectedOs("all")}
                                        className="text-[var(--accent)] hover:underline cursor-pointer lowercase font-normal"
                                    >
                                        reset
                                    </button>
                                )}
                            </label>
                            <select
                                value={selectedOs}
                                onChange={(e) => {
                                    setSelectedOs(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-2)] border text-[var(--fg)] focus:outline-none transition-colors cursor-pointer ${
                                    selectedOs !== "all"
                                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                                        : "border-[var(--line)] focus:border-[var(--accent)]"
                                }`}
                            >
                                <option value="all">All Platforms ({availablePlatforms.length})</option>
                                {availablePlatforms.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.name} ({p.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Event Status Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                                <span>Event Status</span>
                                {selectedStatus !== "all" && (
                                    <button
                                        onClick={() => setSelectedStatus("all")}
                                        className="text-[var(--accent)] hover:underline cursor-pointer lowercase font-normal"
                                    >
                                        reset
                                    </button>
                                )}
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-2)] border text-[var(--fg)] focus:outline-none transition-colors cursor-pointer ${
                                    selectedStatus !== "all"
                                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                                        : "border-[var(--line)] focus:border-[var(--accent)]"
                                }`}
                            >
                                <option value="all">All Statuses ({events.length})</option>
                                {availableStatuses.map((s) => (
                                    <option key={s.name} value={s.name}>
                                        {s.name.toUpperCase()} ({s.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Conditional Custom Date / Range Inputs */}
                    {dateFilter === "single" && (
                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                            <span className="text-xs font-mono font-medium text-[var(--fg)]">Select Date:</span>
                            <input
                                type="date"
                                value={singleDate}
                                onChange={(e) => {
                                    setSingleDate(e.target.value);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--surface)] border border-[var(--line)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                            />
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split("T")[0];
                                    setSingleDate(today);
                                    setCurrentPage(1);
                                    setDevicePage(1);
                                }}
                                className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-[var(--surface)] hover:bg-[var(--surface-3)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                            >
                                Today
                            </button>
                            {singleDate && (
                                <button
                                    onClick={() => {
                                        setSingleDate("");
                                        setCurrentPage(1);
                                        setDevicePage(1);
                                    }}
                                    className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    {dateFilter === "range" && (
                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-[var(--muted)]">From:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                        setDevicePage(1);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--surface)] border border-[var(--line)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-[var(--muted)]">To:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                        setDevicePage(1);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--surface)] border border-[var(--line)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                        setCurrentPage(1);
                                        setDevicePage(1);
                                    }}
                                    className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                                >
                                    Clear Range
                                </button>
                            )}
                        </div>
                    )}

                    {/* Row 4: Active Filter Chips Bar */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--line)]">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                                Applied Filters:
                            </span>

                            {searchQuery.trim() && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">search:</span>
                                    <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove search filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {dateFilter !== "all" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">date:</span>
                                    <span className="font-semibold">
                                        {dateFilter === "today"
                                            ? "Today"
                                            : dateFilter === "yesterday"
                                            ? "Yesterday"
                                            : dateFilter === "7d"
                                            ? "Past 7 Days"
                                            : dateFilter === "30d"
                                            ? "Past 30 Days"
                                            : dateFilter === "single"
                                            ? singleDate || "Custom Date"
                                            : startDate || endDate
                                            ? `${startDate || "..."} → ${endDate || "..."}`
                                            : "Date Range"}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setDateFilter("all");
                                            setSingleDate("");
                                            setStartDate("");
                                            setEndDate("");
                                        }}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove date filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {selectedFeature !== "all" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">feature:</span>
                                    <span className="font-semibold text-[var(--accent)]">{selectedFeature}</span>
                                    <button
                                        onClick={() => setSelectedFeature("all")}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove feature filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {selectedDevice !== "all" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">device:</span>
                                    <span className="font-semibold text-sky-400">
                                        {availableDevices.find((d) => d.id === selectedDevice)?.name || selectedDevice}
                                    </span>
                                    <button
                                        onClick={() => setSelectedDevice("all")}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove device filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {selectedOs !== "all" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">OS:</span>
                                    <span className="font-semibold">{selectedOs}</span>
                                    <button
                                        onClick={() => setSelectedOs("all")}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove OS filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {selectedStatus !== "all" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)]">
                                    <span className="text-[var(--muted)]">status:</span>
                                    <span className="font-semibold uppercase">{selectedStatus}</span>
                                    <button
                                        onClick={() => setSelectedStatus("all")}
                                        className="text-[var(--muted)] hover:text-rose-400 ml-0.5 cursor-pointer"
                                        title="Remove status filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            <button
                                onClick={handleResetAllFilters}
                                className="text-xs font-mono text-rose-400 hover:underline cursor-pointer ml-auto"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
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
                    <div
                        onClick={() => setViewMode((m) => (m === "devices" ? "stream" : "devices"))}
                        title="Click to toggle nested unique devices table"
                        className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer group p-5 shadow-sm ${
                            viewMode === "devices"
                                ? "border-[var(--accent)] bg-[var(--surface-2)] ring-1 ring-[var(--accent)]/30"
                                : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                                Unique Devices
                                <span className="text-[10px] text-[var(--accent)] font-bold">{viewMode === "devices" ? "● active" : "→"}</span>
                            </span>
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

                {/* Activity Events Data Table & Nested Devices View */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm">
                    {/* View Mode Switcher Header */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[var(--surface-2)] border-b border-[var(--line)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--muted)]">View:</span>
                            <div className="inline-flex p-1 rounded-lg bg-[var(--surface-3)] border border-[var(--line)]">
                                <button
                                    onClick={() => setViewMode("stream")}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                        viewMode === "stream"
                                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                            : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    Flat Stream ({filteredEvents.length})
                                </button>
                                <button
                                    onClick={() => setViewMode("devices")}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                        viewMode === "devices"
                                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                            : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Unique Devices ({deviceGroups.length})
                                </button>
                            </div>
                        </div>

                        {/* Quick Page Size & Action Controls in Table Header */}
                        {viewMode === "stream" ? (
                            <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-auto">
                                <span className="text-[var(--muted)]">Rows:</span>
                                <div className="inline-flex p-0.5 rounded-lg bg-[var(--surface-3)] border border-[var(--line)]">
                                    {([10, 25, 50, 100, "all"] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setPageSize(size);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                                pageSize === size
                                                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                                    : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]"
                                            }`}
                                        >
                                            {size === "all" ? "All" : size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono self-end sm:self-auto">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[var(--muted)]">Show:</span>
                                    <div className="inline-flex p-0.5 rounded-lg bg-[var(--surface-3)] border border-[var(--line)]">
                                        {([5, 10, 25, 50, "all"] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    setDevicesPerPage(size);
                                                    setDevicePage(1);
                                                }}
                                                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                                                    devicesPerPage === size
                                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                                        : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]"
                                                }`}
                                            >
                                                {size === "all" ? "All" : size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={expandAllDevices}
                                        className="px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-3)] border border-[var(--line)] text-[var(--fg)] transition-colors cursor-pointer"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        onClick={collapseAllDevices}
                                        className="px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-3)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {viewMode === "stream" ? (
                        <>
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
                                <div className="flex flex-wrap items-center gap-3">
                                    <div>
                                        {pageSize === "all" ? (
                                            <>
                                                Showing all <span className="font-semibold text-[var(--fg)]">{filteredEvents.length.toLocaleString()}</span> events
                                            </>
                                        ) : (
                                            <>
                                                Showing{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {Math.min(currentPage * pageSize, filteredEvents.length)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {filteredEvents.length.toLocaleString()}
                                                </span>{" "}
                                                events
                                            </>
                                        )}
                                        {filteredEvents.length !== events.length && (
                                            <span className="text-[var(--accent)] font-semibold ml-1.5">
                                                (filtered from {events.length.toLocaleString()} total)
                                            </span>
                                        )}
                                    </div>

                                    {/* Rows per page selector */}
                                    <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--line)]">
                                        <span className="text-[var(--muted)]">Rows:</span>
                                        <div className="inline-flex rounded-md bg-[var(--surface-2)] p-0.5 border border-[var(--line)]">
                                            {([10, 25, 50, 100, "all"] as const).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => {
                                                        setPageSize(size);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                                        pageSize === size
                                                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                                            : "text-[var(--muted)] hover:text-[var(--fg)]"
                                                    }`}
                                                >
                                                    {size === "all" ? "All" : size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1 || pageSize === "all"}
                                        className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        Page {pageSize === "all" ? 1 : currentPage} of {pageSize === "all" ? 1 : totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || pageSize === "all"}
                                        className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Device-Wise Nested Table View */}
                            {deviceGroups.length === 0 ? (
                                <div className="py-12 text-center text-xs font-mono text-[var(--muted)]">
                                    No unique devices found matching your criteria.
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--line)]">
                                    {paginatedDeviceGroups.map((group, groupIdx) => {
                                        const isExpanded = expandedDevices[group.deviceId] ?? (groupIdx === 0 && devicePage === 1);
                                        return (
                                            <div key={group.deviceId} className="transition-colors">
                                                {/* Device Summary Header Bar */}
                                                <div
                                                    onClick={() => toggleDevice(group.deviceId)}
                                                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)]/60 cursor-pointer transition-colors select-none"
                                                >
                                                    <div className="flex items-start sm:items-center gap-3">
                                                        {/* Chevron Indicator */}
                                                        <span className="p-1 rounded bg-[var(--surface-2)] text-[var(--muted)] mt-0.5 sm:mt-0 transition-transform duration-200">
                                                            <svg
                                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90 text-[var(--accent)]" : ""}`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </span>

                                                        {/* Device Icon */}
                                                        <span className="text-xl">
                                                            {group.deviceName.toLowerCase().includes("laptop") ? "💻" : group.deviceName.toLowerCase().includes("desktop") ? "🖥️" : "📱"}
                                                        </span>

                                                        {/* Device ID and Meta */}
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-xs font-mono font-bold text-[var(--fg)]">
                                                                    {group.deviceId}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)] font-semibold">
                                                                    {group.deviceName}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                                                                    {group.osName}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono text-[var(--muted)]">
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-3 h-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    </svg>
                                                                    {group.location}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="text-[var(--faint)]">IP: {group.ipAddress}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right side stats */}
                                                    <div className="flex items-center gap-3 self-end lg:self-center">
                                                        <div className="text-right font-mono">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                                                                {group.eventCount} event{group.eventCount === 1 ? "" : "s"}
                                                            </span>
                                                            <div className="text-[10px] text-[var(--muted)] mt-1">
                                                                Last active: {formatRelativeTime(group.lastActiveAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Nested Table for this Device */}
                                                {isExpanded && (
                                                    <div className="border-t border-[var(--line)] bg-[var(--canvas)]/50 p-4 space-y-3">
                                                        {/* Device Ribbon */}
                                                        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] text-xs font-mono border border-[var(--line)]">
                                                            <div className="flex flex-wrap items-center gap-3 text-[var(--muted)]">
                                                                <span>First Seen: <strong className="text-[var(--fg)]">{group.firstSeenAt ? new Date(group.firstSeenAt).toLocaleString() : "N/A"}</strong></span>
                                                                <span>•</span>
                                                                <span>Top Feature: <strong className="text-[var(--accent)] capitalize">{group.topFeature.name} ({group.topFeature.count}x)</strong></span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleExportDeviceCsv(group);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--fg)] text-[11px] border border-[var(--line)] transition-colors cursor-pointer"
                                                            >
                                                                <svg className="w-3 h-3 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                                Export Device Events
                                                            </button>
                                                        </div>

                                                        {/* Nested Sub-Table */}
                                                        <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-xs">
                                                            <table className="w-full text-left text-xs font-mono border-collapse">
                                                                <thead>
                                                                    <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]">
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Timestamp</th>
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Feature</th>
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Action</th>
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Item / Target</th>
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Status</th>
                                                                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-[var(--line)] text-[var(--fg)]">
                                                                    {group.events.map((evt) => (
                                                                        <tr key={evt.event_id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                                                                            <td className="py-2 px-3 whitespace-nowrap text-[var(--muted)]">
                                                                                {formatRelativeTime(evt.occurred_at || evt.received_at)}
                                                                                <span className="text-[10px] text-[var(--faint)] ml-1.5">
                                                                                    {(evt.occurred_at || evt.received_at).split("T")[1]?.slice(0, 8)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 whitespace-nowrap">
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getFeatureBadge(evt.feature_name)}`}>
                                                                                    {evt.feature_name}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 whitespace-nowrap font-medium text-[var(--fg)]">
                                                                                {evt.action}
                                                                            </td>
                                                                            <td className="py-2 px-3 whitespace-nowrap text-[var(--accent-2)]">
                                                                                {evt.item_name || evt.item_id || "—"}
                                                                            </td>
                                                                            <td className="py-2 px-3 whitespace-nowrap">
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                                    {evt.status || "ok"}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 whitespace-nowrap text-right">
                                                                                <div className="flex items-center justify-end gap-1.5">
                                                                                    {evt.metadata && (
                                                                                        <button
                                                                                            onClick={() => setSelectedMetadataEvent(evt)}
                                                                                            className="px-2 py-0.5 rounded bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--muted)] border border-[var(--line)] text-[10px] transition-colors cursor-pointer"
                                                                                        >
                                                                                            JSON
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => handleDeleteEvent(evt.event_id)}
                                                                                        disabled={deletingId === evt.event_id}
                                                                                        title="Delete this row from CSV"
                                                                                        className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                                                                                    >
                                                                                        {deletingId === evt.event_id ? (
                                                                                            <span className="w-2 h-2 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
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
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Device Pagination Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[var(--line)] text-xs font-mono text-[var(--muted)]">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div>
                                        {devicesPerPage === "all" ? (
                                            <>
                                                Showing all <span className="font-semibold text-[var(--fg)]">{deviceGroups.length.toLocaleString()}</span> unique devices (totaling {filteredEvents.length.toLocaleString()} events)
                                            </>
                                        ) : (
                                            <>
                                                Showing{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {deviceGroups.length === 0 ? 0 : (devicePage - 1) * devicesPerPage + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {Math.min(devicePage * devicesPerPage, deviceGroups.length)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold text-[var(--fg)]">
                                                    {deviceGroups.length.toLocaleString()}
                                                </span>{" "}
                                                unique devices (totaling {filteredEvents.length.toLocaleString()} events)
                                            </>
                                        )}
                                    </div>

                                    {/* Devices per page selector */}
                                    <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--line)]">
                                        <span className="text-[var(--muted)]">Show:</span>
                                        <div className="inline-flex rounded-md bg-[var(--surface-2)] p-0.5 border border-[var(--line)]">
                                            {([5, 10, 25, 50, "all"] as const).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => {
                                                        setDevicesPerPage(size);
                                                        setDevicePage(1);
                                                    }}
                                                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                                        devicesPerPage === size
                                                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-xs"
                                                            : "text-[var(--muted)] hover:text-[var(--fg)]"
                                                    }`}
                                                >
                                                    {size === "all" ? "All" : size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDevicePage((p) => Math.max(1, p - 1))}
                                        disabled={devicePage === 1 || devicesPerPage === "all"}
                                        className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        Page {devicesPerPage === "all" ? 1 : devicePage} of {devicesPerPage === "all" ? 1 : totalDevicePages}
                                    </span>
                                    <button
                                        onClick={() => setDevicePage((p) => Math.min(totalDevicePages, p + 1))}
                                        disabled={devicePage === totalDevicePages || devicesPerPage === "all"}
                                        className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
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
