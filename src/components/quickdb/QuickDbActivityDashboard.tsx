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
    firstOpenedAt: string | null;
    filteredOpens?: string[];
}

interface QuickDbActivityDashboardProps {
    initialEvents: ParsedActivityEvent[];
    initialSummary: ActivitySummary;
    initialDeviceStore?: Record<string, any>;
}

type DateFilterPreset = "all" | "today" | "yesterday" | "7days" | "30days" | "custom";

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
    const [currentTimeZone, setCurrentTimeZone] = useState<string>("Asia/Dhaka");
    const [deviceToDelete, setDeviceToDelete] = useState<DeviceRecord | null>(null);
    const [isDeletingDevice, setIsDeletingDevice] = useState(false);

    // Date & Time filter states
    const [datePreset, setDatePreset] = useState<DateFilterPreset>("all");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const [specificDate, setSpecificDate] = useState<string>("");
    const [showOnlyActiveInRange, setShowOnlyActiveInRange] = useState<boolean>(true);
    const [connectionFilter, setConnectionFilter] = useState<"all" | "new_today" | "active_today">("all");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Timestamp parser helper to convert UTC string to epoch ms
    const parseTsMs = (timeStr?: string | null): number | null => {
        if (!timeStr) return null;
        let normalized = timeStr.trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
            normalized = normalized.replace(" ", "T") + "Z";
        } else if (!normalized.endsWith("Z") && !normalized.includes("+") && normalized.includes("T")) {
            normalized = normalized + "Z";
        }
        const d = new Date(normalized);
        const ms = d.getTime();
        return isNaN(ms) ? null : ms;
    };

    // Helper to get formatted YYYY-MM-DD in the active timezone
    const getTzDateStr = (ms: number, tz: string = currentTimeZone): string => {
        try {
            const formatter = new Intl.DateTimeFormat("en-CA", {
                timeZone: tz,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
            return formatter.format(new Date(ms));
        } catch {
            return new Date(ms).toISOString().slice(0, 10);
        }
    };

    const handleDeleteDevice = async () => {
        if (!deviceToDelete) return;
        setIsDeletingDevice(true);
        try {
            const res = await fetch(`/api/v1/activity/events?device_id=${encodeURIComponent(deviceToDelete.deviceId)}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setDeviceStore((prev) => {
                    const next = { ...prev };
                    delete next[deviceToDelete.deviceId];
                    return next;
                });
                setEvents((prev) => prev.filter((e) => e.device_id !== deviceToDelete.deviceId));
                setDeviceToDelete(null);
                void refreshData();
            }
        } catch (err) {
            console.error("Failed to delete device:", err);
        } finally {
            setIsDeletingDevice(false);
        }
    };

    // Refresh data from API
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v1/activity/events", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setEvents(data.events || []);
                    setDeviceStore(data.deviceStore || {});
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
                const rawOpens: string[] = Array.isArray(devObj["how many time open quickdb in a day"])
                    ? devObj["how many time open quickdb in a day"]
                    : Array.isArray(devObj.opens)
                    ? devObj.opens
                    : [];

                // Sort chronological
                const sortedOpens = [...rawOpens].sort((a, b) => {
                    const tA = parseTsMs(a) || 0;
                    const tB = parseTsMs(b) || 0;
                    return tA - tB;
                });

                const explicitFirst = (devObj as any).first_connected || (devObj as any).first_opened || (devObj as any).created_at || null;
                const firstOpened = explicitFirst || (sortedOpens.length > 0 ? sortedOpens[0] : null);
                const lastOpened = sortedOpens.length > 0 ? sortedOpens[sortedOpens.length - 1] : null;

                return {
                    deviceId: devId,
                    codeEditor: editor,
                    country,
                    city,
                    location,
                    opens: sortedOpens,
                    openCount: sortedOpens.length,
                    lastOpenedAt: lastOpened,
                    firstOpenedAt: firstOpened
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
                    lastOpenedAt: null,
                    firstOpenedAt: null
                };
            }
            const time = evt.occurred_at || evt.received_at;
            if (time) {
                groups[dId].opens.push(time);
            }
        }

        return Object.values(groups).map((d) => {
            const sortedOpens = [...d.opens].sort((a, b) => {
                const tA = parseTsMs(a) || 0;
                const tB = parseTsMs(b) || 0;
                return tA - tB;
            });
            return {
                ...d,
                opens: sortedOpens,
                openCount: sortedOpens.length,
                firstOpenedAt: sortedOpens.length > 0 ? sortedOpens[0] : null,
                lastOpenedAt: sortedOpens.length > 0 ? sortedOpens[sortedOpens.length - 1] : null
            };
        });
    }, [deviceStore, events]);

    // Unique editors for filtering
    const availableEditors = useMemo(() => {
        const set = new Set<string>();
        devicesList.forEach((d) => {
            if (d.codeEditor) set.add(d.codeEditor);
        });
        return Array.from(set);
    }, [devicesList]);

    // Check if a date filter is active
    const isDateFilterActive = useMemo(() => {
        return datePreset !== "all" || Boolean(specificDate);
    }, [datePreset, specificDate]);

    // Current Date string in active timezone for "Today"
    const todayDateStr = useMemo(() => {
        return getTzDateStr(Date.now(), currentTimeZone);
    }, [currentTimeZone]);

    // Helper: is a timestamp matching the active date/time filter?
    const isTimestampInFilter = (timeStr: string): boolean => {
        if (!isDateFilterActive) return true;
        const ms = parseTsMs(timeStr);
        if (ms === null) return false;

        if (specificDate) {
            return getTzDateStr(ms, currentTimeZone) === specificDate;
        }

        if (datePreset === "today") {
            return getTzDateStr(ms, currentTimeZone) === todayDateStr;
        }

        if (datePreset === "yesterday") {
            const yestMs = Date.now() - 86400000;
            return getTzDateStr(ms, currentTimeZone) === getTzDateStr(yestMs, currentTimeZone);
        }

        if (datePreset === "7days") {
            return ms >= Date.now() - 7 * 86400000;
        }

        if (datePreset === "30days") {
            return ms >= Date.now() - 30 * 86400000;
        }

        if (datePreset === "custom") {
            if (customStartDate) {
                const sMs = new Date(customStartDate).getTime();
                if (!isNaN(sMs) && ms < sMs) return false;
            }
            if (customEndDate) {
                const eMs = new Date(customEndDate).getTime();
                if (!isNaN(eMs) && ms > eMs) return false;
            }
            return true;
        }

        return true;
    };

    // Filter & Sort Devices
    const filteredDevices = useMemo(() => {
        const listWithFilter = devicesList.map((d) => {
            const matchedOpens = d.opens.filter(isTimestampInFilter);
            return {
                ...d,
                filteredOpens: matchedOpens
            };
        });

        const result = listWithFilter.filter((d) => {
            // Connection Filter: new_today vs active_today
            if (connectionFilter === "new_today") {
                const isNewToday = Boolean(
                    d.firstOpenedAt &&
                    parseTsMs(d.firstOpenedAt) !== null &&
                    getTzDateStr(parseTsMs(d.firstOpenedAt)!, currentTimeZone) === todayDateStr
                );
                if (!isNewToday) return false;
            } else if (connectionFilter === "active_today") {
                const isActiveToday = d.opens.some((ts) => {
                    const ms = parseTsMs(ts);
                    return ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr;
                });
                if (!isActiveToday) return false;
            }

            // If date filter is active and showOnlyActiveInRange is true, only include devices active in that period
            if (isDateFilterActive && showOnlyActiveInRange && d.filteredOpens.length === 0) {
                return false;
            }

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
                const countA = isDateFilterActive ? a.filteredOpens.length : a.openCount;
                const countB = isDateFilterActive ? b.filteredOpens.length : b.openCount;
                return countB - countA;
            }
            if (sortBy === "recent") {
                const tA = a.lastOpenedAt ? parseTsMs(a.lastOpenedAt) || 0 : 0;
                const tB = b.lastOpenedAt ? parseTsMs(b.lastOpenedAt) || 0 : 0;
                return tB - tA;
            }
            return a.deviceId.localeCompare(b.deviceId);
        });

        return result;
    }, [
        devicesList,
        isDateFilterActive,
        showOnlyActiveInRange,
        connectionFilter,
        todayDateStr,
        datePreset,
        specificDate,
        customStartDate,
        customEndDate,
        currentTimeZone,
        selectedEditor,
        searchQuery,
        sortBy
    ]);

    // Aggregated metrics across devices
    const totalAllTimeOpens = useMemo(() => {
        return devicesList.reduce((acc, d) => acc + d.openCount, 0);
    }, [devicesList]);

    const periodOpensCount = useMemo(() => {
        return filteredDevices.reduce((acc, d) => acc + (d.filteredOpens?.length || 0), 0);
    }, [filteredDevices]);

    // Metric 3: Today Opens count across all devices
    const todayOpensCount = useMemo(() => {
        let count = 0;
        devicesList.forEach((d) => {
            d.opens.forEach((ts) => {
                const ms = parseTsMs(ts);
                if (ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr) {
                    count++;
                }
            });
        });
        return count;
    }, [devicesList, currentTimeZone, todayDateStr]);

    // Metric 4: Devices that opened / connected today
    const todayActiveDevices = useMemo(() => {
        return devicesList.filter((d) => {
            return d.opens.some((ts) => {
                const ms = parseTsMs(ts);
                return ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr;
            });
        });
    }, [devicesList, currentTimeZone, todayDateStr]);

    // Newly connected devices today (first opened at is today)
    const todayNewlyConnectedDevices = useMemo(() => {
        return devicesList.filter((d) => {
            if (!d.firstOpenedAt) return false;
            const ms = parseTsMs(d.firstOpenedAt);
            return ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr;
        });
    }, [devicesList, currentTimeZone, todayDateStr]);

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

    const formatDateTimeInZone = (timeStr?: string | null, tz: string = currentTimeZone) => {
        if (!timeStr) return "Never";
        let normalized = timeStr.trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
            normalized = normalized.replace(" ", "T") + "Z";
        } else if (!normalized.endsWith("Z") && !normalized.includes("+") && normalized.includes("T")) {
            normalized = normalized + "Z";
        }
        const d = new Date(normalized);
        if (isNaN(d.getTime())) return timeStr;

        try {
            return new Intl.DateTimeFormat("en-US", {
                timeZone: tz,
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZoneName: "short"
            }).format(d);
        } catch {
            return timeStr;
        }
    };

    const formatRelativeTime = (timeStr?: string | null, tz: string = currentTimeZone) => {
        if (!timeStr) return "Never";
        let normalized = timeStr.trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
            normalized = normalized.replace(" ", "T") + "Z";
        } else if (!normalized.endsWith("Z") && !normalized.includes("+") && normalized.includes("T")) {
            normalized = normalized + "Z";
        }
        const d = new Date(normalized);
        if (isNaN(d.getTime())) return timeStr;

        const now = Date.now();
        const diffMs = now - d.getTime();

        if (diffMs < 45000 && diffMs >= 0) {
            return "just now";
        }

        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) {
            return `${Math.max(1, diffMins)}min ago`;
        }

        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 24) {
            return `${diffHours}h ago`;
        }

        // Calendar-aware check for yesterday in active timezone
        const targetDateStr = getTzDateStr(d.getTime(), tz);
        const yesterdayDateStr = getTzDateStr(now - 86400000, tz);

        if (targetDateStr === yesterdayDateStr) {
            return "yesterday";
        }

        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays <= 1) {
            return "yesterday";
        }
        if (diffDays < 7) {
            return `${diffDays} days ago`;
        }

        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks === 1) {
            return "1 week ago";
        }
        if (diffWeeks < 4) {
            return `${diffWeeks} weeks ago`;
        }

        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths === 1) {
            return "1 month ago";
        }
        if (diffMonths < 12) {
            return `${diffMonths} months ago`;
        }

        const diffYears = Math.floor(diffDays / 365);
        return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    };

    // Human-readable date filter label
    const dateFilterLabel = useMemo(() => {
        if (specificDate) return `Day: ${specificDate}`;
        if (datePreset === "today") return `Today (${todayDateStr})`;
        if (datePreset === "yesterday") return `Yesterday (${getTzDateStr(Date.now() - 86400000, currentTimeZone)})`;
        if (datePreset === "7days") return "Last 7 Days";
        if (datePreset === "30days") return "Last 30 Days";
        if (datePreset === "custom") {
            return `Custom: ${customStartDate || "Start"} → ${customEndDate || "Now"}`;
        }
        return "All Time";
    }, [specificDate, datePreset, todayDateStr, currentTimeZone, customStartDate, customEndDate]);

    const handleResetDateFilter = () => {
        setDatePreset("all");
        setSpecificDate("");
        setCustomStartDate("");
        setCustomEndDate("");
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
                                Live MongoDB Atlas Feed
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                🇧🇩 Timezone: {currentTimeZone === "Asia/Dhaka" ? "Bangladesh Time (BST / UTC+6)" : currentTimeZone}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--muted)]">
                            Real-time engagement telemetry stored globally in{" "}
                            <code className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--accent)] font-mono text-xs border border-[var(--line)]">
                                MongoDB Atlas
                            </code>
                            {" "}(displayed in Bangladesh Local Timezone)
                        </p>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Timezone Selector */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] text-xs font-mono">
                            <span className="text-sm">🇧🇩</span>
                            <span className="text-[var(--muted)] text-[10px] uppercase font-semibold">TZ:</span>
                            <select
                                value={currentTimeZone}
                                onChange={(e) => setCurrentTimeZone(e.target.value)}
                                className="bg-transparent text-[var(--fg)] font-semibold text-xs outline-none cursor-pointer"
                            >
                                <option value="Asia/Dhaka" className="bg-[var(--surface)] text-[var(--fg)]">
                                    Asia/Dhaka (GMT+6)
                                </option>
                                <option value="UTC" className="bg-[var(--surface)] text-[var(--fg)]">
                                    Global UTC (Z)
                                </option>
                                {typeof Intl !== "undefined" && (
                                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone} className="bg-[var(--surface)] text-[var(--fg)]">
                                        Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                                    </option>
                                )}
                            </select>
                        </div>

                        <a
                            href="/api/v1/activity/store"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-all"
                        >
                            <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            View Store API
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

                {/* 4 Core KPI Metrics Cards:
                    1. Total DEVICES
                    2. Total OPENS
                    3. TOTAL OPEN TODAY (Today Device Opens)
                    4. TODAY CONNECTED DEVICES (Today Device Connect)
                */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Devices */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span className="font-semibold tracking-wider">TOTAL DEVICES</span>
                            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                {isDateFilterActive ? filteredDevices.length : devicesList.length}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 font-medium">
                                {isDateFilterActive ? `of ${devicesList.length} total` : "● 100% recorded"}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            {isDateFilterActive ? `Active devices in filter` : `Unique devices in MongoDB`}
                        </p>
                    </div>

                    {/* Card 2: Total Opens */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span className="font-semibold tracking-wider">TOTAL OPENS</span>
                            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                {isDateFilterActive ? periodOpensCount : totalAllTimeOpens}
                            </span>
                            <span className="text-xs font-mono text-[var(--muted)]">
                                {isDateFilterActive ? `(${totalAllTimeOpens} all-time)` : "sessions"}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono">
                            {isDateFilterActive ? `Opens in selected period` : `All-time QuickDB open sessions`}
                        </p>
                    </div>

                    {/* Card 3: Total Open Today (Today Device Open) */}
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--line-strong)] transition-all group">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span className="font-semibold tracking-wider">TOTAL OPEN TODAY</span>
                            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                {todayOpensCount}
                            </span>
                            <span className="text-xs font-mono text-amber-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Today
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)] truncate font-mono" suppressHydrationWarning>
                            Opens on {todayDateStr} ({currentTimeZone === "Asia/Dhaka" ? "BST" : currentTimeZone})
                        </p>
                    </div>

                    {/* Card 4: Today Connected Devices & New Connect Today */}
                    <div
                        className={`relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all group ${
                            connectionFilter === "new_today"
                                ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30"
                                : connectionFilter === "active_today"
                                ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                                : "border-[var(--line)] bg-[var(--surface)] hover:border-violet-500/50"
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                            <span className="font-semibold tracking-wider flex items-center gap-1.5">
                                TODAY CONNECTED DEVICES
                                {connectionFilter === "new_today" && (
                                    <span className="px-1.5 py-0.5 rounded bg-violet-500 text-white text-[9px] font-bold">
                                        FILTER: NEW TODAY
                                    </span>
                                )}
                                {connectionFilter === "active_today" && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                                        FILTER: ACTIVE TODAY
                                    </span>
                                )}
                            </span>
                            <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.394 9.393a15 15 0 0121.213 0" />
                                </svg>
                            </span>
                        </div>

                        <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-bold font-mono text-[var(--fg)]">
                                    {todayActiveDevices.length}
                                </span>
                                <span className="text-xs font-mono text-[var(--muted)]">
                                    active today
                                </span>
                            </div>

                            <div className="h-4 w-px bg-[var(--line)]" />

                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold font-mono text-violet-400">
                                    {todayNewlyConnectedDevices.length}
                                </span>
                                <span className="text-xs font-mono text-violet-400 font-medium">
                                    new connect today
                                </span>
                            </div>
                        </div>

                        {/* Interactive Filter Action Buttons */}
                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[var(--line)]/50 text-xs font-mono">
                            <button
                                onClick={() => setConnectionFilter((prev) => (prev === "new_today" ? "all" : "new_today"))}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                    connectionFilter === "new_today"
                                        ? "bg-violet-600 text-white shadow-xs"
                                        : "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border border-violet-500/30"
                                }`}
                                title="Filter only new devices that connected today"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                {connectionFilter === "new_today" ? "✕ Showing New" : `Filter New (${todayNewlyConnectedDevices.length})`}
                            </button>

                            <button
                                onClick={() => setConnectionFilter((prev) => (prev === "active_today" ? "all" : "active_today"))}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                    connectionFilter === "active_today"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                                }`}
                                title="Filter devices active today"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {connectionFilter === "active_today" ? "✕ Showing Active" : `Filter Active (${todayActiveDevices.length})`}
                            </button>

                            {connectionFilter !== "all" && (
                                <button
                                    onClick={() => setConnectionFilter("all")}
                                    className="ml-auto text-[10px] text-[var(--muted)] hover:text-[var(--fg)] underline cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Full-Page Date & Time Filter Bar */}
                <section className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <div>
                                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg)] flex items-center gap-2">
                                    Full-Page Date & Time Filter
                                    {(isDateFilterActive || connectionFilter !== "all") && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 lowercase">
                                            active: {connectionFilter === "new_today" ? `new connect today (${todayNewlyConnectedDevices.length})` : connectionFilter === "active_today" ? `active today (${todayActiveDevices.length})` : dateFilterLabel}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-[11px] font-mono text-[var(--muted)]">
                                    Filter device cards, activity counters, and sessions by specific date, range, or time
                                </p>
                            </div>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                onClick={() => {
                                    setDatePreset("all");
                                    setSpecificDate("");
                                    setConnectionFilter("all");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "all" && !specificDate && connectionFilter === "all"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => {
                                    setConnectionFilter((prev) => (prev === "new_today" ? "all" : "new_today"));
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                    connectionFilter === "new_today"
                                        ? "bg-violet-500 text-white font-bold shadow-xs border border-violet-400"
                                        : "bg-[var(--surface-2)] text-violet-400 hover:text-white hover:bg-violet-500/20 border border-violet-500/30"
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                ✨ New Today ({todayNewlyConnectedDevices.length})
                            </button>
                            <button
                                onClick={() => {
                                    setDatePreset("today");
                                    setSpecificDate("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "today" && !specificDate
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    setDatePreset("yesterday");
                                    setSpecificDate("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "yesterday" && !specificDate
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                Yesterday
                            </button>
                            <button
                                onClick={() => {
                                    setDatePreset("7days");
                                    setSpecificDate("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "7days" && !specificDate
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                Last 7 Days
                            </button>
                            <button
                                onClick={() => {
                                    setDatePreset("30days");
                                    setSpecificDate("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "30days" && !specificDate
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                Last 30 Days
                            </button>
                            <button
                                onClick={() => {
                                    setDatePreset("custom");
                                    setSpecificDate("");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    datePreset === "custom"
                                        ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                                        : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)]"
                                }`}
                            >
                                Custom Range
                            </button>
                        </div>
                    </div>

                    {/* Date Inputs / Pickers */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-[var(--line)]">
                        {/* Quick Day Picker */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-mono text-[var(--muted)] whitespace-nowrap">
                                📅 Filter Day:
                            </label>
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => {
                                    setSpecificDate(e.target.value);
                                    if (e.target.value) {
                                        setDatePreset("all");
                                    }
                                }}
                                className="bg-[var(--surface-2)] text-[var(--fg)] text-xs font-mono rounded-lg px-2.5 py-1.5 border border-[var(--line)] focus:border-[var(--accent)] outline-none cursor-pointer"
                            />
                            {specificDate && (
                                <button
                                    onClick={() => setSpecificDate("")}
                                    className="text-xs text-[var(--muted)] hover:text-[var(--fg)] font-mono p-1"
                                    title="Clear Day"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Custom Date & Time Inputs when custom is active */}
                        {datePreset === "custom" && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono text-[var(--muted)]">From:</span>
                                <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-[var(--surface-2)] text-[var(--fg)] text-xs font-mono rounded-lg px-2.5 py-1.5 border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                                />
                                <span className="text-xs font-mono text-[var(--muted)]">To:</span>
                                <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-[var(--surface-2)] text-[var(--fg)] text-xs font-mono rounded-lg px-2.5 py-1.5 border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                                />
                            </div>
                        )}

                        {/* Active Only Checkbox */}
                        {isDateFilterActive && (
                            <label className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] cursor-pointer select-none ml-auto">
                                <input
                                    type="checkbox"
                                    checked={showOnlyActiveInRange}
                                    onChange={(e) => setShowOnlyActiveInRange(e.target.checked)}
                                    className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                                />
                                Hide devices with 0 opens in filter
                            </label>
                        )}

                        {/* Clear Date Filter Button */}
                        {isDateFilterActive && (
                            <button
                                onClick={handleResetDateFilter}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap"
                            >
                                ✕ Reset Date Filter
                            </button>
                        )}
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
                                Device Store Inspector
                            </button>
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-auto">
                            <span className="text-[var(--muted)]">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[var(--accent)] cursor-pointer"
                            >
                                <option value="opens_desc">Most Opens First</option>
                                <option value="recent">Recently Active</option>
                                <option value="id">Device ID (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Search & Editor Filter Pills */}
                    <div className="space-y-3">
                        {/* Connection Status Filter Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                <span className="text-[11px] font-mono text-[var(--muted)] uppercase font-semibold mr-1 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Connection:
                                </span>

                                <button
                                    onClick={() => setConnectionFilter("all")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer font-medium ${
                                        connectionFilter === "all"
                                            ? "bg-[var(--surface)] text-[var(--fg)] border border-[var(--line-strong)] font-bold shadow-xs"
                                            : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] border border-transparent"
                                    }`}
                                >
                                    All Devices ({devicesList.length})
                                </button>

                                <button
                                    onClick={() => setConnectionFilter((prev) => (prev === "new_today" ? "all" : "new_today"))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                        connectionFilter === "new_today"
                                            ? "bg-violet-600 text-white font-bold shadow-xs border border-violet-400 ring-2 ring-violet-500/30"
                                            : "bg-violet-500/10 text-violet-400 hover:text-white hover:bg-violet-500/25 border border-violet-500/30 font-medium"
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full bg-violet-400 ${connectionFilter === "new_today" ? "animate-ping" : "animate-pulse"}`} />
                                    ✨ New Connect Today ({todayNewlyConnectedDevices.length})
                                </button>

                                <button
                                    onClick={() => setConnectionFilter((prev) => (prev === "active_today" ? "all" : "active_today"))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                        connectionFilter === "active_today"
                                            ? "bg-emerald-600 text-white font-bold shadow-xs border border-emerald-400 ring-2 ring-emerald-500/30"
                                            : "bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/25 border border-emerald-500/30 font-medium"
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full bg-emerald-400 ${connectionFilter === "active_today" ? "animate-ping" : "animate-pulse"}`} />
                                    ⚡ Active Today ({todayActiveDevices.length})
                                </button>
                            </div>

                            {/* Active filter notification pill */}
                            {connectionFilter !== "all" && (
                                <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-[var(--muted)]">Active:</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold">
                                        {connectionFilter === "new_today"
                                            ? `✨ New Connect Today (${filteredDevices.length})`
                                            : `⚡ Active Today (${filteredDevices.length})`}
                                        <button
                                            onClick={() => setConnectionFilter("all")}
                                            className="ml-1 text-violet-300 hover:text-white cursor-pointer"
                                            title="Clear connection filter"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Search Input & Editor Pills Row */}
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
                    </div>
                </section>

                {/* Content View Modes */}
                {viewTab === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredDevices.length === 0 ? (
                            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)]/50 space-y-3">
                                <p className="text-sm font-mono text-[var(--muted)]">
                                    {connectionFilter === "new_today"
                                        ? `No new devices connected today (${todayDateStr}). All existing devices connected on earlier dates.`
                                        : connectionFilter === "active_today"
                                        ? `No devices active today (${todayDateStr}).`
                                        : "No devices match your search or date filter criteria."}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    {connectionFilter !== "all" && (
                                        <button
                                            onClick={() => setConnectionFilter("all")}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-violet-600 text-white font-medium cursor-pointer hover:bg-violet-500 transition-colors"
                                        >
                                            Show All Devices ({devicesList.length})
                                        </button>
                                    )}
                                    {isDateFilterActive && (
                                        <button
                                            onClick={handleResetDateFilter}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[var(--accent)] text-[var(--accent-contrast)] font-medium cursor-pointer"
                                        >
                                            Reset Date Filter
                                        </button>
                                    )}
                                    {(searchQuery || selectedEditor !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedEditor("all");
                                            }}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] cursor-pointer"
                                        >
                                            Reset Search & Editors
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            filteredDevices.map((device, index) => {
                                const isExpanded = Boolean(expandedDevices[device.deviceId]);
                                const hasFilteredOpens = Boolean(device.filteredOpens && isDateFilterActive);
                                const displayedOpensCount = hasFilteredOpens ? device.filteredOpens!.length : device.openCount;
                                const isActiveToday = device.opens.some((ts) => {
                                    const ms = parseTsMs(ts);
                                    return ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr;
                                });
                                const isNewToday = Boolean(
                                    device.firstOpenedAt &&
                                    parseTsMs(device.firstOpenedAt) !== null &&
                                    getTzDateStr(parseTsMs(device.firstOpenedAt)!, currentTimeZone) === todayDateStr
                                );

                                return (
                                    <div
                                        key={device.deviceId}
                                        className={`rounded-2xl border p-5 space-y-4 transition-all shadow-xs flex flex-col justify-between ${
                                            isNewToday
                                                ? "border-violet-500/40 bg-[var(--surface)] hover:border-violet-500/70"
                                                : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                                        }`}
                                    >
                                        <div className="space-y-3.5">
                                            {/* Card Top: Device Index, Device Tag Badge, Status, and Actions */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="w-6 h-6 rounded-md bg-[var(--surface-2)] text-[var(--muted)] text-xs font-mono font-bold flex items-center justify-center border border-[var(--line)]">
                                                        #{index + 1}
                                                    </span>

                                                    {/* Device Tag */}
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                                        💻 Device: {device.deviceId.length > 20 ? `${device.deviceId.slice(0, 8)}...${device.deviceId.slice(-4)}` : device.deviceId}
                                                        <button
                                                            onClick={() => handleCopy(device.deviceId, `copy_${device.deviceId}`)}
                                                            title="Copy full unique Device ID"
                                                            className="p-0.5 rounded text-sky-400/70 hover:text-sky-300 transition-colors cursor-pointer"
                                                        >
                                                            {copiedId === `copy_${device.deviceId}` ? (
                                                                <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </span>

                                                    {/* Status Badge */}
                                                    {isNewToday ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold shadow-xs">
                                                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                                                            ✨ New Connect Today
                                                        </span>
                                                    ) : isActiveToday ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                            Connected Today
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                                                            Device Connected
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Open Count Badge */}
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                                        ⚡ {displayedOpensCount} open{displayedOpensCount === 1 ? "" : "s"}
                                                        {isDateFilterActive && (
                                                            <span className="text-[10px] text-emerald-400/70 font-normal">
                                                                ({device.openCount} all-time)
                                                            </span>
                                                        )}
                                                    </span>

                                                    {/* Delete Device Button */}
                                                    <button
                                                        onClick={() => setDeviceToDelete(device)}
                                                        title="Delete this device from database"
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tag Badges Row on Card */}
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                                                <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-sky-400 border border-[var(--line)] flex items-center gap-1">
                                                    💻 Tag: Device
                                                </span>
                                                {isNewToday && (
                                                    <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1 font-semibold">
                                                        ✨ New Connect Today
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] flex items-center gap-1">
                                                    ⚙️ {device.codeEditor}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)] flex items-center gap-1">
                                                    📍 {device.location}
                                                </span>
                                                {device.firstOpenedAt && (
                                                    <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]" suppressHydrationWarning>
                                                        🔌 First: {formatRelativeTime(device.firstOpenedAt, currentTimeZone)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Prominent Card Section: LAST OPEN DATE & TIME */}
                                            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[var(--surface-2)] to-transparent border border-emerald-500/30 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5 font-mono">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        Last Open Date & Time
                                                    </span>
                                                    {device.lastOpenedAt && (
                                                        <span className="text-[11px] font-mono text-[var(--muted)]" suppressHydrationWarning>
                                                            {formatDateTimeInZone(device.lastOpenedAt, currentTimeZone).split(',').slice(0, 2).join(',')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-base sm:text-lg font-bold font-mono text-[var(--fg)] flex items-center gap-2" suppressHydrationWarning>
                                                    <span className="text-emerald-400 text-lg">🕒</span>
                                                    <span className="text-emerald-400 font-extrabold capitalize text-base sm:text-lg">
                                                        {device.lastOpenedAt ? formatRelativeTime(device.lastOpenedAt, currentTimeZone) : "No open recorded"}
                                                    </span>
                                                </div>
                                                {device.lastOpenedAt && (
                                                    <div className="text-[10px] font-mono text-[var(--muted)] flex items-center justify-between gap-2 pt-1 border-t border-[var(--line)]/50">
                                                        <span className="truncate" suppressHydrationWarning>
                                                            Exact: {formatDateTimeInZone(device.lastOpenedAt, currentTimeZone)}
                                                        </span>
                                                        <span className="text-sky-400/80 whitespace-nowrap">
                                                            (UTC: {device.lastOpenedAt})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attribute Information Grid */}
                                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">name of code editor</span>
                                                    <span className="text-[var(--fg)] font-medium flex items-center gap-1 truncate" title={device.codeEditor}>
                                                        ⚙️ {device.codeEditor}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">location (country & city)</span>
                                                    <span className="text-[var(--fg)] font-medium flex items-center gap-1 truncate" title={device.location}>
                                                        📍 {device.location}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">first device connect</span>
                                                    <span className="text-[var(--fg)] font-medium flex items-center gap-1 truncate" suppressHydrationWarning title={device.firstOpenedAt || "N/A"}>
                                                        🔌 {device.firstOpenedAt ? formatRelativeTime(device.firstOpenedAt, currentTimeZone) : "N/A"}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-0.5">
                                                    <span className="text-[10px] uppercase text-[var(--muted)] font-semibold block">total recorded sessions</span>
                                                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                                                        ⚡ {device.openCount} sessions total
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
                                                <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
                                                    {device.opens.length === 0 ? (
                                                        <p className="text-[11px] text-[var(--muted)]">No open timestamps recorded.</p>
                                                    ) : (
                                                        device.opens.map((timeStr, idx) => {
                                                            const matchesFilter = isTimestampInFilter(timeStr);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-[11px] ${
                                                                        matchesFilter && isDateFilterActive
                                                                            ? "bg-emerald-500/10 border-emerald-500/40 text-[var(--fg)]"
                                                                            : "bg-[var(--surface)] border-[var(--line)]/60 text-[var(--fg)]"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-[var(--muted)] font-bold">#{idx + 1}</span>
                                                                        <span className="text-emerald-400 font-bold font-mono text-xs flex items-center gap-1.5" suppressHydrationWarning>
                                                                            <span className="text-emerald-400">🕒</span>
                                                                            {formatRelativeTime(timeStr, currentTimeZone)}
                                                                        </span>
                                                                        <span className="text-[11px] text-[var(--muted)] font-mono hidden sm:inline" suppressHydrationWarning>
                                                                            ({formatDateTimeInZone(timeStr, currentTimeZone)})
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                        {matchesFilter && isDateFilterActive && (
                                                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                                                                                In Filter Range
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[10px] text-[var(--muted)] font-mono" title="Stored UTC Timestamp">
                                                                            (UTC: {timeStr})
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] text-[var(--accent)] font-mono font-semibold" suppressHydrationWarning>
                                                                            {formatRelativeTime(timeStr, currentTimeZone)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
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
                                    <th className="py-3 px-4 font-semibold uppercase">Device ID & Tag</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Status</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Code Editor</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Location</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-center">
                                        {isDateFilterActive ? "Opens in Filter" : "Total Opens"}
                                    </th>
                                    <th className="py-3 px-4 font-semibold uppercase">
                                        Last Opened ({currentTimeZone === "Asia/Dhaka" ? "BST" : "Time"})
                                    </th>
                                    <th className="py-3 px-4 font-semibold uppercase">First Connected</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)] text-[var(--fg)]">
                                {filteredDevices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-[var(--muted)]">
                                            No matching devices found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDevices.map((device) => {
                                        const isActiveToday = device.opens.some((ts) => {
                                            const ms = parseTsMs(ts);
                                            return ms !== null && getTzDateStr(ms, currentTimeZone) === todayDateStr;
                                        });
                                        const isNewToday = Boolean(
                                            device.firstOpenedAt &&
                                            parseTsMs(device.firstOpenedAt) !== null &&
                                            getTzDateStr(parseTsMs(device.firstOpenedAt)!, currentTimeZone) === todayDateStr
                                        );

                                        return (
                                            <tr key={device.deviceId} className={`transition-colors ${isNewToday ? "bg-violet-500/5 hover:bg-violet-500/10" : "hover:bg-[var(--surface-2)]/50"}`}>
                                                <td className="py-3 px-4 font-semibold text-[var(--fg)]">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] border border-sky-500/30">
                                                            💻 Device
                                                        </span>
                                                        <span>{device.deviceId.slice(0, 14)}...</span>
                                                        <button
                                                            onClick={() => handleCopy(device.deviceId, `table_${device.deviceId}`)}
                                                            className="text-[var(--muted)] hover:text-[var(--accent)] cursor-pointer"
                                                            title="Copy ID"
                                                        >
                                                            {copiedId === `table_${device.deviceId}` ? "✓" : "📋"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {isNewToday ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                                            ✨ New Today
                                                        </span>
                                                    ) : isActiveToday ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            Active Today
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-2)] text-[var(--muted)]">
                                                            Connected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[11px]">
                                                        ⚙️ {device.codeEditor}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-[var(--muted)]">{device.location || "—"}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        {isDateFilterActive ? `${device.filteredOpens?.length || 0} / ${device.openCount}` : `${device.openCount}x`}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-[var(--muted)]" suppressHydrationWarning>
                                                    <div className="font-semibold text-emerald-400 capitalize">
                                                        {formatRelativeTime(device.lastOpenedAt, currentTimeZone)}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--muted)]">
                                                        {formatDateTimeInZone(device.lastOpenedAt, currentTimeZone)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-[var(--muted)]" suppressHydrationWarning>
                                                    <div className="capitalize">{formatRelativeTime(device.firstOpenedAt, currentTimeZone)}</div>
                                                    <div className="text-[10px] opacity-75">{device.firstOpenedAt ? formatDateTimeInZone(device.firstOpenedAt, currentTimeZone).split(',')[0] : "—"}</div>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => setDeviceToDelete(device)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                                MongoDB Atlas Device Store (Total: {Object.keys(deviceStore).length} entries)
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

            {/* Delete Single Device Modal */}
            {deviceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-[var(--fg)] font-mono">Delete Device Entry</h3>
                                <p className="text-xs text-[var(--muted)] font-mono">Remove from MongoDB Atlas permanently</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-[var(--muted)]">Device ID:</span>
                                <span className="text-[var(--fg)] font-semibold truncate max-w-[220px]" title={deviceToDelete.deviceId}>
                                    {deviceToDelete.deviceId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--muted)]">Code Editor:</span>
                                <span className="text-[var(--fg)]">{deviceToDelete.codeEditor}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--muted)]">Location:</span>
                                <span className="text-[var(--fg)]">{deviceToDelete.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--muted)]">Open Count:</span>
                                <span className="text-emerald-400 font-bold">{deviceToDelete.openCount} opens</span>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                            Are you sure you want to delete this device and all its recorded timestamps? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeviceToDelete(null)}
                                disabled={isDeletingDevice}
                                className="px-4 py-2 rounded-lg text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteDevice}
                                disabled={isDeletingDevice}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isDeletingDevice ? "Deleting..." : "Yes, Delete Device"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-xl">
                        <h3 className="text-base font-bold text-[var(--fg)]">Clear Activity Data</h3>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                            Are you sure you want to clear all device entries from <code className="text-[var(--accent)]">MongoDB Atlas</code>? This action cannot be undone.
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
