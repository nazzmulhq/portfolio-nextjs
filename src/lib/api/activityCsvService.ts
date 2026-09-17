import * as fs from "fs";
import * as path from "path";

export interface ActivityEventInput {
    event_id: string;
    session_id?: string;
    feature_name: string;
    action: string;
    item_id?: string;
    item_name?: string;
    occurred_at: string;
    device_id: string;
    device_name?: string;
    os_name?: string;
    ip_address?: string;
    location?: string;
    metadata?: Record<string, any> | string;
}

export interface DailySyncPayload {
    device_id: string;
    events: ActivityEventInput[];
}

export interface DailySyncResult {
    success: boolean;
    sync_id: string;
    accepted_event_ids: string[];
    duplicate_event_ids: string[];
    failed_event_ids: string[];
}

const CSV_HEADER = [
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
].join(",") + "\n";

class ActivityCsvService {
    private readonly filePath: string;
    private seenEventIds: Set<string> | null = null;
    private writeLock: Promise<void> = Promise.resolve();

    constructor() {
        const dataDir = process.env.QUICKDB_ACTIVITY_DATA_DIR || path.join(process.cwd(), "data");
        this.filePath = path.join(dataDir, "activity_events.csv");
    }

    private escapeCsv(val: any): string {
        if (val === null || val === undefined) return "";
        let str = typeof val === "object" ? JSON.stringify(val) : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    private async ensureInitialized(): Promise<void> {
        if (this.seenEventIds !== null) return;
        this.seenEventIds = new Set<string>();

        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }

        if (!fs.existsSync(this.filePath)) {
            await fs.promises.writeFile(this.filePath, CSV_HEADER, "utf8");
            return;
        }

        // Read existing CSV to index event_ids for idempotency
        try {
            const content = await fs.promises.readFile(this.filePath, "utf8");
            const lines = content.split(/\r?\n/);
            // Skip header (line 0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                // event_id is the first comma-separated field
                const firstComma = line.indexOf(",");
                const id = (firstComma >= 0 ? line.substring(0, firstComma) : line)
                    .replace(/^"|"$/g, "")
                    .trim();
                if (id) {
                    this.seenEventIds.add(id);
                }
            }
        } catch (err) {
            console.error("Failed to read existing activity CSV:", err);
        }
    }

    public async saveEvents(payload: DailySyncPayload, clientIp?: string): Promise<DailySyncResult> {
        const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const acceptedEventIds: string[] = [];
        const duplicateEventIds: string[] = [];
        const failedEventIds: string[] = [];

        if (!payload || !Array.isArray(payload.events)) {
            return {
                success: false,
                sync_id: syncId,
                accepted_event_ids: [],
                duplicate_event_ids: [],
                failed_event_ids: []
            };
        }

        // Enqueue through write lock to serialize concurrent batch writes
        return new Promise<DailySyncResult>((resolve, reject) => {
            this.writeLock = this.writeLock
                .then(async () => {
                    await this.ensureInitialized();
                    const seen = this.seenEventIds!;
                    const rowsToAppend: string[] = [];
                    const receivedAt = new Date().toISOString();

                    for (const evt of payload.events) {
                        if (!evt || !evt.event_id) {
                            continue;
                        }

                        // Idempotency: if event_id already recorded, mark as duplicate
                        if (seen.has(evt.event_id)) {
                            duplicateEventIds.push(evt.event_id);
                            continue;
                        }

                        try {
                            const row = [
                                this.escapeCsv(evt.event_id),
                                this.escapeCsv(evt.session_id || ""),
                                this.escapeCsv(evt.feature_name || "unknown"),
                                this.escapeCsv(evt.action || "unknown"),
                                this.escapeCsv(evt.item_id || ""),
                                this.escapeCsv(evt.item_name || ""),
                                this.escapeCsv(evt.occurred_at || receivedAt),
                                this.escapeCsv(evt.device_id || payload.device_id || ""),
                                this.escapeCsv(evt.device_name || ""),
                                this.escapeCsv(evt.os_name || ""),
                                this.escapeCsv(evt.ip_address || clientIp || ""),
                                this.escapeCsv(evt.location || ""),
                                this.escapeCsv("synced"),
                                this.escapeCsv(receivedAt),
                                this.escapeCsv(evt.metadata || "")
                            ].join(",") + "\n";

                            rowsToAppend.push(row);
                            seen.add(evt.event_id);
                            acceptedEventIds.push(evt.event_id);
                        } catch {
                            failedEventIds.push(evt.event_id);
                        }
                    }

                    if (rowsToAppend.length > 0) {
                        await fs.promises.appendFile(this.filePath, rowsToAppend.join(""), "utf8");
                    }

                    resolve({
                        success: true,
                        sync_id: syncId,
                        accepted_event_ids: acceptedEventIds,
                        duplicate_event_ids: duplicateEventIds,
                        failed_event_ids: failedEventIds
                    });
                })
                .catch((err) => {
                    console.error("Error writing activity events to CSV:", err);
                    reject(err);
                });
        });
    }

    public getCsvPath(): string {
        return this.filePath;
    }

    /**
     * Read and parse all activity events from the CSV file, returning typed events and aggregated metrics.
     */
    public async getParsedEvents(): Promise<{ events: ParsedActivityEvent[]; summary: ActivitySummary }> {
        await this.ensureInitialized();

        if (!fs.existsSync(this.filePath)) {
            return {
                events: [],
                summary: this.buildEmptySummary()
            };
        }

        try {
            const content = await fs.promises.readFile(this.filePath, "utf8");
            const rawLines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

            if (rawLines.length <= 1) {
                return {
                    events: [],
                    summary: this.buildEmptySummary()
                };
            }

            const events: ParsedActivityEvent[] = [];
            // Skip header (index 0)
            for (let i = 1; i < rawLines.length; i++) {
                const cols = this.parseCsvLine(rawLines[i]);
                if (!cols[0]) continue; // skip if event_id is missing

                let metadataObj: Record<string, any> | null = null;
                if (cols[14]) {
                    try {
                        metadataObj = JSON.parse(cols[14]);
                    } catch {
                        metadataObj = { raw: cols[14] };
                    }
                }

                events.push({
                    event_id: cols[0] || "",
                    session_id: cols[1] || "",
                    feature_name: cols[2] || "unknown",
                    action: cols[3] || "unknown",
                    item_id: cols[4] || "",
                    item_name: cols[5] || "",
                    occurred_at: cols[6] || "",
                    device_id: cols[7] || "",
                    device_name: cols[8] || "desktop",
                    os_name: cols[9] || "unknown",
                    ip_address: cols[10] || "",
                    location: cols[11] || "",
                    status: cols[12] || "synced",
                    received_at: cols[13] || "",
                    metadata: metadataObj
                });
            }

            // Sort most recent first
            events.sort((a, b) => {
                const ta = new Date(a.occurred_at || a.received_at).getTime() || 0;
                const tb = new Date(b.occurred_at || b.received_at).getTime() || 0;
                return tb - ta;
            });

            return {
                events,
                summary: this.computeSummary(events)
            };
        } catch (err) {
            console.error("Error reading activity CSV:", err);
            return {
                events: [],
                summary: this.buildEmptySummary()
            };
        }
    }

    private parseCsvLine(text: string): string[] {
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                if (inQuotes && text[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(cur);
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur);
        return result;
    }

    private buildEmptySummary(): ActivitySummary {
        return {
            totalEvents: 0,
            uniqueDevices: 0,
            topFeature: { name: "None", count: 0 },
            latestSyncAt: null,
            featureDistribution: [],
            deviceDistribution: { laptop: 0, desktop: 0, unknown: 0 },
            osDistribution: [],
            locationDistribution: [],
            timeline: []
        };
    }

    private computeSummary(events: ParsedActivityEvent[]): ActivitySummary {
        const devices = new Set<string>();
        const featureCounts: Record<string, number> = {};
        const osCounts: Record<string, number> = {};
        const locationCounts: Record<string, number> = {};
        const timelineCounts: Record<string, number> = {};
        const deviceTypeCounts = { laptop: 0, desktop: 0, unknown: 0 };

        for (const evt of events) {
            if (evt.device_id) devices.add(evt.device_id);

            // Feature counts
            const feat = evt.feature_name || "other";
            featureCounts[feat] = (featureCounts[feat] || 0) + 1;

            // Form factor
            const dev = (evt.device_name || "").toLowerCase();
            if (dev === "laptop") deviceTypeCounts.laptop++;
            else if (dev === "desktop") deviceTypeCounts.desktop++;
            else deviceTypeCounts.unknown++;

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
}

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
    deviceDistribution: { laptop: number; desktop: number; unknown: number };
    osDistribution: Array<{ name: string; count: number }>;
    locationDistribution: Array<{ location: string; count: number }>;
    timeline: Array<{ date: string; count: number }>;
}

export const activityCsvService = new ActivityCsvService();
