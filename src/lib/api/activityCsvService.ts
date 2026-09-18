import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
    ParsedActivityEvent,
    ActivitySummary,
    computeActivitySummary,
    buildEmptyActivitySummary
} from "./activitySummaryHelper";

export type { ParsedActivityEvent, ActivitySummary };
export { computeActivitySummary, buildEmptyActivitySummary };

export interface DeviceActivityRecord {
    "name of code editor"?: string;
    "name of country"?: string;
    "name of city"?: string;
    "how many time open quickdb in a day"?: string[];
    // Standard aliases for internal code access
    code_editor?: string;
    country?: string;
    city?: string;
    opens?: string[];
}

export type DeviceActivityStore = Record<string, DeviceActivityRecord>;

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
    code_editor?: string;
    editor_name?: string;
    ip_address?: string;
    location?: string;
    metadata?: Record<string, any> | string;
}

export interface DailySyncPayload {
    device_id: string;
    code_editor?: string;
    editor_name?: string;
    events: ActivityEventInput[];
}

export interface DailySyncResult {
    success: boolean;
    sync_id: string;
    accepted_event_ids: string[];
    duplicate_event_ids: string[];
    failed_event_ids: string[];
}

export const DEFAULT_SEED_STORE: DeviceActivityStore = {
    "e22bcd81383d63cb4cee7aa180d3604d6bae47da892f84545d10c063fc04be1a": {
        "name of code editor": "Antigravity IDE",
        "name of country": "Bangladesh",
        "name of city": "Dhaka",
        "how many time open quickdb in a day": [
            "2026-09-18 14:16:15",
            "2026-09-18 14:23:47",
            "2026-09-18 16:42:46",
            "2026-09-18 17:38:25",
            "2026-09-18 18:01:46",
            "2026-09-18 20:24:38",
            "2026-09-18 20:30:43"
        ]
    },
    "dev_1789735198240": {
        "name of code editor": "Visual Studio Code",
        "name of country": "United States",
        "name of city": "San Francisco",
        "how many time open quickdb in a day": [
            "2026-09-18 12:39:58",
            "2026-09-18 15:10:22",
            "2026-09-18 18:45:00"
        ]
    },
    "dev_1789731935828": {
        "name of code editor": "Cursor",
        "name of country": "Germany",
        "name of city": "Berlin",
        "how many time open quickdb in a day": [
            "2026-09-18 08:30:15",
            "2026-09-18 11:45:35",
            "2026-09-18 16:20:10"
        ]
    },
    "dev_1789730815993": {
        "name of code editor": "Antigravity IDE",
        "name of country": "United Kingdom",
        "name of city": "London",
        "how many time open quickdb in a day": [
            "2026-09-18 10:15:00",
            "2026-09-18 11:26:56",
            "2026-09-18 14:50:30",
            "2026-09-18 19:10:45"
        ]
    }
};

class ActivityCsvService {
    private filePath: string;
    private seenEventIds: Set<string> | null = null;
    private writeLock: Promise<void> = Promise.resolve();

    constructor() {
        const isServerless = Boolean(
            process.env.VERCEL ||
            process.env.AWS_LAMBDA_FUNCTION_NAME ||
            process.env.LAMBDA_TASK_ROOT
        );
        const defaultDir = isServerless
            ? path.join(os.tmpdir(), "quickdb_activity")
            : path.join(process.cwd(), "public");
        const dataDir = process.env.QUICKDB_ACTIVITY_DATA_DIR || defaultDir;
        this.filePath = path.join(dataDir, "data.json");
    }

    private resolveReadFilePath(): string {
        try {
            // 1. Configured file path
            if (fs.existsSync(/*turbopackIgnore: true*/ this.filePath)) {
                return this.filePath;
            }

            // 2. Main repo public/data.json
            const publicFallback = path.join(process.cwd(), "public", "data.json");
            if (fs.existsSync(/*turbopackIgnore: true*/ publicFallback)) {
                return publicFallback;
            }

            // 3. Serverless tmp fallback
            const tmpFallback = path.join(os.tmpdir(), "quickdb_activity", "data.json");
            if (fs.existsSync(/*turbopackIgnore: true*/ tmpFallback)) {
                return tmpFallback;
            }
        } catch (err) {
            console.error("Error resolving activity JSON path:", err);
        }

        return path.join(process.cwd(), "public", "data.json");
    }

    private async ensureInitialized(): Promise<void> {
        if (this.seenEventIds !== null) return;
        this.seenEventIds = new Set<string>();

        let dir = path.dirname(this.filePath);
        try {
            if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
        } catch {
            const fallbackDir = path.join(os.tmpdir(), "quickdb_activity");
            this.filePath = path.join(fallbackDir, "data.json");
            dir = fallbackDir;
            if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
        }

        try {
            const publicSeed = path.join(process.cwd(), "public", "data.json");
            if (!fs.existsSync(/*turbopackIgnore: true*/ this.filePath)) {
                if (fs.existsSync(/*turbopackIgnore: true*/ publicSeed) && publicSeed !== this.filePath) {
                    try {
                        await fs.promises.copyFile(publicSeed, this.filePath);
                    } catch {
                        await fs.promises.writeFile(this.filePath, "{}", "utf8");
                    }
                } else {
                    await fs.promises.writeFile(this.filePath, "{}", "utf8");
                }
            }

            const events = await this.readEventsFromFile();
            for (const evt of events) {
                if (evt?.event_id) {
                    this.seenEventIds.add(evt.event_id);
                }
            }
        } catch (err) {
            console.error("Failed to initialize activity JSON data:", err);
        }
    }

    public async readDeviceStore(): Promise<DeviceActivityStore> {
        const targetPath = this.resolveReadFilePath();
        if (!targetPath || !fs.existsSync(/*turbopackIgnore: true*/ targetPath)) {
            return DEFAULT_SEED_STORE;
        }

        try {
            const content = await fs.promises.readFile(targetPath, "utf8");
            if (!content.trim()) return DEFAULT_SEED_STORE;
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
                return parsed as DeviceActivityStore;
            }
            return DEFAULT_SEED_STORE;
        } catch (err) {
            console.error("Error reading device store from data.json:", err);
            return DEFAULT_SEED_STORE;
        }
    }

    public async writeDeviceStore(store: DeviceActivityStore): Promise<void> {
        const jsonContent = JSON.stringify(store, null, 2);
        await fs.promises.writeFile(this.filePath, jsonContent, "utf8");

        const publicFile = path.join(process.cwd(), "public", "data.json");
        if (fs.existsSync(/*turbopackIgnore: true*/ publicFile) && publicFile !== this.filePath) {
            try {
                await fs.promises.writeFile(publicFile, jsonContent, "utf8");
            } catch {
                // ignore in read-only environment
            }
        }
    }

    private async readEventsFromFile(): Promise<ParsedActivityEvent[]> {
        const targetPath = this.resolveReadFilePath();
        if (!targetPath || !fs.existsSync(/*turbopackIgnore: true*/ targetPath)) {
            return [];
        }

        try {
            const content = await fs.promises.readFile(targetPath, "utf8");
            if (!content.trim()) return [];
            const parsed = JSON.parse(content);

            // Handle user-specified device-keyed schema: { "device_id": { ... } }
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                const events: ParsedActivityEvent[] = [];
                const store = parsed as DeviceActivityStore;

                for (const [deviceId, devData] of Object.entries(store)) {
                    if (!devData || typeof devData !== "object") continue;

                    const codeEditor =
                        devData["name of code editor"] ||
                        devData.code_editor ||
                        "Visual Studio Code";
                    const country = devData["name of country"] || devData.country || "";
                    const city = devData["name of city"] || devData.city || "";
                    const location = [city, country].filter(Boolean).join(", ") || "Global";
                    const opens =
                        devData["how many time open quickdb in a day"] ||
                        devData.opens ||
                        [];

                    if (Array.isArray(opens) && opens.length > 0) {
                        opens.forEach((timeStr, idx) => {
                            const dateObj = new Date(timeStr);
                            const isoTime = !isNaN(dateObj.getTime())
                                ? dateObj.toISOString()
                                : timeStr;

                            events.push({
                                event_id: `open_${deviceId.slice(0, 10)}_${idx}_${timeStr.replace(/[^0-9]/g, "").slice(0, 12)}`,
                                session_id: `sess_${deviceId.slice(0, 10)}_${idx}`,
                                feature_name: "app",
                                action: "open_quickdb",
                                item_id: "quickdb",
                                item_name: "QuickDB Extension",
                                occurred_at: isoTime,
                                device_id: deviceId,
                                device_name: "laptop",
                                os_name: "mac",
                                code_editor: codeEditor,
                                ip_address: "127.0.0.1",
                                location: location,
                                status: "synced",
                                received_at: isoTime,
                                metadata: {
                                    "name of code editor": codeEditor,
                                    "name of country": country,
                                    "name of city": city,
                                    "how many time open quickdb in a day": opens.length,
                                    daily_opens_count: opens.length,
                                    open_timestamp: timeStr,
                                    open_timestamps: opens
                                }
                            });
                        });
                    } else {
                        // Device registered but no opens yet
                        const nowIso = new Date().toISOString();
                        events.push({
                            event_id: `reg_${deviceId.slice(0, 10)}`,
                            session_id: `sess_${deviceId.slice(0, 10)}`,
                            feature_name: "app",
                            action: "registered",
                            item_id: "quickdb",
                            item_name: "QuickDB Extension",
                            occurred_at: nowIso,
                            device_id: deviceId,
                            device_name: "laptop",
                            os_name: "mac",
                            code_editor: codeEditor,
                            ip_address: "127.0.0.1",
                            location: location,
                            status: "synced",
                            received_at: nowIso,
                            metadata: {
                                "name of code editor": codeEditor,
                                "name of country": country,
                                "name of city": city,
                                "how many time open quickdb in a day": 0
                            }
                        });
                    }
                }

                return events;
            }

            // Legacy array support
            if (Array.isArray(parsed)) {
                return parsed as ParsedActivityEvent[];
            }

            return [];
        } catch (err) {
            console.error("Error reading events from data.json:", err);
            return [];
        }
    }

    public getDataPath(): string {
        return this.resolveReadFilePath();
    }

    public getCsvPath(): string {
        return this.getDataPath();
    }

    public async getParsedEvents(): Promise<{ events: ParsedActivityEvent[]; summary: ActivitySummary; deviceStore?: DeviceActivityStore }> {
        try {
            const events = await this.readEventsFromFile();
            const deviceStore = await this.readDeviceStore();

            if (events.length === 0) {
                return {
                    events: [],
                    summary: buildEmptyActivitySummary(),
                    deviceStore
                };
            }

            // Sort most recent first
            events.sort((a, b) => {
                const ta = new Date(a.occurred_at || a.received_at).getTime() || 0;
                const tb = new Date(b.occurred_at || b.received_at).getTime() || 0;
                return tb - ta;
            });

            return {
                events,
                summary: computeActivitySummary(events),
                deviceStore
            };
        } catch (err) {
            console.error("Error getting parsed events:", err);
            return {
                events: [],
                summary: buildEmptyActivitySummary(),
                deviceStore: {}
            };
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

        return new Promise<DailySyncResult>((resolve, reject) => {
            this.writeLock = this.writeLock
                .then(async () => {
                    await this.ensureInitialized();
                    const deviceStore = await this.readDeviceStore();
                    const deviceId = payload.device_id || "unknown_device";

                    const editor =
                        payload.code_editor ||
                        payload.editor_name ||
                        "Visual Studio Code";

                    if (!deviceStore[deviceId]) {
                        deviceStore[deviceId] = {
                            "name of code editor": editor,
                            "name of country": "",
                            "name of city": "",
                            "how many time open quickdb in a day": []
                        };
                    }

                    if (!Array.isArray(deviceStore[deviceId]["how many time open quickdb in a day"])) {
                        deviceStore[deviceId]["how many time open quickdb in a day"] = [];
                    }

                    const openTimes = deviceStore[deviceId]["how many time open quickdb in a day"]!;

                    for (const evt of payload.events) {
                        if (!evt || !evt.event_id) continue;

                        const time = evt.occurred_at || new Date().toISOString();
                        if (openTimes.includes(time)) {
                            duplicateEventIds.push(evt.event_id);
                        } else {
                            openTimes.push(time);
                            acceptedEventIds.push(evt.event_id);
                        }
                    }

                    await this.writeDeviceStore(deviceStore);

                    resolve({
                        success: true,
                        sync_id: syncId,
                        accepted_event_ids: acceptedEventIds,
                        duplicate_event_ids: duplicateEventIds,
                        failed_event_ids: failedEventIds
                    });
                })
                .catch((err) => {
                    console.error("Error saving events to data.json:", err);
                    reject(err);
                });
        });
    }

    public async deleteEvent(eventId: string): Promise<boolean> {
        const count = await this.deleteEvents([eventId]);
        return count > 0;
    }

    public async deleteEvents(eventIds: string[]): Promise<number> {
        const idSet = new Set(eventIds.filter(Boolean));
        if (idSet.size === 0) return 0;

        return new Promise<number>((resolve, reject) => {
            this.writeLock = this.writeLock
                .then(async () => {
                    await this.ensureInitialized();
                    const deviceStore = await this.readDeviceStore();
                    let deletedCount = 0;

                    for (const id of idSet) {
                        // If id matches a device ID directly
                        if (deviceStore[id]) {
                            delete deviceStore[id];
                            deletedCount++;
                            continue;
                        }

                        // Check inside each device's open timestamps
                        for (const device of Object.values(deviceStore)) {
                            if (Array.isArray(device["how many time open quickdb in a day"])) {
                                const prevLen = device["how many time open quickdb in a day"]!.length;
                                device["how many time open quickdb in a day"] = device[
                                    "how many time open quickdb in a day"
                                ]!.filter((t) => !id.includes(t.replace(/[^0-9]/g, "").slice(0, 10)));
                                if (device["how many time open quickdb in a day"]!.length < prevLen) {
                                    deletedCount++;
                                }
                            }
                        }
                    }

                    await this.writeDeviceStore(deviceStore);
                    resolve(deletedCount);
                })
                .catch((err) => {
                    console.error("Error deleting events from data.json:", err);
                    reject(err);
                });
        });
    }

    public async clearAllEvents(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.writeLock = this.writeLock
                .then(async () => {
                    await this.ensureInitialized();
                    this.seenEventIds = new Set<string>();
                    await this.writeDeviceStore({});
                    resolve(true);
                })
                .catch((err) => {
                    console.error("Error clearing data.json:", err);
                    reject(err);
                });
        });
    }
}

export const activityCsvService = new ActivityCsvService();
export const activityDataService = activityCsvService;
