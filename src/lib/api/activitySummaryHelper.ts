export interface ParsedActivityEvent {
    event_id: string;
    session_id: string;
    feature_name: string;
    action: string;
    item_id: string;
    item_name: string;
    occurred_at: string;
    device_id: string;
    device_name: string;
    os_name: string;
    ip_address: string;
    location: string;
    status: string;
    received_at: string;
    metadata: Record<string, any> | null;
}

export interface ActivitySummary {
    totalEvents: number;
    uniqueDevices: number;
    topFeature: { name: string; count: number };
    latestSyncAt: string | null;
    featureDistribution: Array<{ name: string; count: number; percentage: number }>;
    deviceDistribution: { laptop: number; desktop: number; mobile: number; unknown: number };
    osDistribution: Array<{ name: string; count: number }>;
    locationDistribution: Array<{ location: string; count: number }>;
    timeline: Array<{ date: string; count: number }>;
}

export function buildEmptyActivitySummary(): ActivitySummary {
    return {
        totalEvents: 0,
        uniqueDevices: 0,
        topFeature: { name: "None", count: 0 },
        latestSyncAt: null,
        featureDistribution: [],
        deviceDistribution: { laptop: 0, desktop: 0, mobile: 0, unknown: 0 },
        osDistribution: [],
        locationDistribution: [],
        timeline: []
    };
}

export function computeActivitySummary(events: ParsedActivityEvent[]): ActivitySummary {
    const devices = new Set<string>();
    const deviceTypeMap = new Map<string, string>();
    const featureCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const timelineCounts: Record<string, number> = {};

    for (const evt of events) {
        const devId = evt.device_id || "unknown";
        devices.add(devId);

        if (!deviceTypeMap.has(devId) || deviceTypeMap.get(devId) === "unknown") {
            if (evt.device_name && evt.device_name.toLowerCase() !== "unknown") {
                deviceTypeMap.set(devId, evt.device_name);
            } else if (!deviceTypeMap.has(devId)) {
                deviceTypeMap.set(devId, evt.device_name || "unknown");
            }
        }

        // Feature counts
        const feat = evt.feature_name || "other";
        featureCounts[feat] = (featureCounts[feat] || 0) + 1;

        // OS counts
        const os = evt.os_name || "unknown";
        osCounts[os] = (osCounts[os] || 0) + 1;

        // Location
        if (evt.location) {
            locationCounts[evt.location] = (locationCounts[evt.location] || 0) + 1;
        }

        // Timeline (by date YYYY-MM-DD)
        const dateStr = (evt.occurred_at || evt.received_at || "").split("T")[0] || "unknown";
        if (dateStr !== "unknown") {
            timelineCounts[dateStr] = (timelineCounts[dateStr] || 0) + 1;
        }
    }

    // Top Feature
    let topFeature = { name: "None", count: 0 };
    const featureDistribution = Object.entries(featureCounts)
        .map(([name, count]) => ({
            name,
            count,
            percentage: events.length > 0 ? Math.round((count / events.length) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

    if (featureDistribution.length > 0) {
        topFeature = { name: featureDistribution[0].name, count: featureDistribution[0].count };
    }

    const osDistribution = Object.entries(osCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const locationDistribution = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

    const timeline = Object.entries(timelineCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Unique devices breakdown by device type (NOT event count)
    const deviceTypeCounts = { laptop: 0, desktop: 0, mobile: 0, unknown: 0 };
    for (const devName of deviceTypeMap.values()) {
        const dev = (devName || "").toLowerCase();
        if (dev.includes("laptop") || dev.includes("macbook") || dev.includes("notebook") || dev.includes("thinkpad") || dev.includes("chromebook")) {
            deviceTypeCounts.laptop++;
        } else if (dev.includes("mobile") || dev.includes("phone") || dev.includes("iphone") || dev.includes("android") || dev.includes("tablet") || dev.includes("ipad")) {
            deviceTypeCounts.mobile++;
        } else if (dev.includes("desktop") || dev.includes("pc") || dev.includes("imac") || dev.includes("mac mini") || dev.includes("workstation") || dev.includes("tower")) {
            deviceTypeCounts.desktop++;
        } else if (!dev || dev === "unknown") {
            deviceTypeCounts.unknown++;
        } else {
            deviceTypeCounts.desktop++;
        }
    }

    return {
        totalEvents: events.length,
        uniqueDevices: devices.size,
        topFeature,
        latestSyncAt: events.length > 0 ? events[0].received_at || events[0].occurred_at : null,
        featureDistribution,
        deviceDistribution: deviceTypeCounts,
        osDistribution,
        locationDistribution,
        timeline
    };
}
