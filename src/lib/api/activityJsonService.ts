import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { activityMongoService, sanitizeDeviceId } from "./activityMongoService";
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
    event_id?: string;
    id?: string;
    session_id?: string;
    feature_name?: string;
    action?: string;
    item_id?: string;
    item_name?: string;
    occurred_at?: string;
    time?: string;
    timestamp?: string;
    device_id?: string;
    deviceId?: string;
    device_name?: string;
    os_name?: string;
    code_editor?: string;
    editor_name?: string;
    ip_address?: string;
    location?: string;
    country?: string;
    city?: string;
    metadata?: Record<string, any> | string;
    "name of code editor"?: string;
    "name of country"?: string;
    "name of city"?: string;
}

export interface DailySyncPayload {
    device_id?: string;
    deviceId?: string;
    code_editor?: string;
    editor_name?: string;
    editor?: string;
    location?: string;
    country?: string;
    city?: string;
    occurred_at?: string;
    time?: string;
    events?: ActivityEventInput[];
    "name of code editor"?: string;
    "name of country"?: string;
    "name of city"?: string;
    [key: string]: any;
}

export interface DailySyncResult {
    success: boolean;
    sync_id: string;
    accepted_event_ids: string[];
    duplicate_event_ids: string[];
    failed_event_ids: string[];
}

// MongoDB Atlas is the source of truth
export const DEFAULT_SEED_STORE: DeviceActivityStore = {};

function parseLocation(loc?: string): { city?: string; country?: string } {
    if (!loc || typeof loc !== "string") return {};
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 1) {
        return { city: parts[0] };
    }
    if (parts.length >= 2) {
        return {
            city: parts[0],
            country: parts[parts.length - 1]
        };
    }
    return {};
}

function formatToYmdHms(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

function formatOpenTimestamp(ts?: string | number | Date): string {
    if (!ts) {
        return formatToYmdHms(new Date());
    }
    if (typeof ts === "string") {
        const trimmed = ts.trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
            return trimmed;
        }
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
            return formatToYmdHms(d);
        }
        return trimmed;
    }
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
        return formatToYmdHms(d);
    }
    return String(ts);
}

export class ActivityJsonService {
    private filePath: string;
    private seenEventIds: Set<string> | null = null;
    private writeLock: Promise<void> = Promise.resolve();
    private memoryStore: DeviceActivityStore | null = null;
    private isExplicitlyCleared: boolean = false;

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
            // 1. public/data.json primary path
            const publicPath = path.join(process.cwd(), "public", "data.json");
            if (fs.existsSync(/*turbopackIgnore: true*/ publicPath)) {
                return publicPath;
            }

            // 2. Configured file path
            if (fs.existsSync(/*turbopackIgnore: true*/ this.filePath)) {
                return this.filePath;
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
            const initialSeedJson =
                Object.keys(DEFAULT_SEED_STORE).length > 0
                    ? JSON.stringify(DEFAULT_SEED_STORE, null, 2)
                    : "{}";

            if (!fs.existsSync(/*turbopackIgnore: true*/ this.filePath)) {
                await fs.promises.writeFile(this.filePath, initialSeedJson, "utf8");
            }

            const publicFile = path.join(process.cwd(), "public", "data.json");
            if (!fs.existsSync(/*turbopackIgnore: true*/ publicFile)) {
                try {
                    await fs.promises.writeFile(publicFile, initialSeedJson, "utf8");
                } catch {
                    // ignore if read-only
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
        try {
            const mongoStore = await activityMongoService.readDeviceStore();
            if (mongoStore && Object.keys(mongoStore).length > 0) {
                this.memoryStore = mongoStore;
                this.isExplicitlyCleared = false;
                return mongoStore;
            }
        } catch (err) {
            console.error("Failed to read device store from MongoDB:", err);
        }

        const targetPath = this.resolveReadFilePath();
        if (targetPath && fs.existsSync(/*turbopackIgnore: true*/ targetPath)) {
            try {
                const content = await fs.promises.readFile(targetPath, "utf8");
                const trimmed = content.trim();
                if (trimmed) {
                    const parsed = JSON.parse(trimmed);
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        const sanitizedStore: DeviceActivityStore = {};
                        for (const [key, val] of Object.entries(parsed)) {
                            if (val && typeof val === "object") {
                                const rec = val as DeviceActivityRecord;
                                const country = rec["name of country"] || rec.country || "";
                                const city = rec["name of city"] || rec.city || "";
                                const cleanKey = sanitizeDeviceId(key, country, city);
                                sanitizedStore[cleanKey] = rec;
                            }
                        }
                        if (Object.keys(sanitizedStore).length > 0) {
                            this.memoryStore = sanitizedStore;
                            this.isExplicitlyCleared = false;
                            return this.memoryStore;
                        }
                    }
                }
            } catch (err) {
                console.error("Error reading device store from data.json:", err);
            }
        }

        if (this.isExplicitlyCleared && (!this.memoryStore || Object.keys(this.memoryStore).length === 0)) {
            return {};
        }

        if (!this.memoryStore || Object.keys(this.memoryStore).length === 0) {
            if (Object.keys(DEFAULT_SEED_STORE).length > 0) {
                this.memoryStore = JSON.parse(JSON.stringify(DEFAULT_SEED_STORE));
                return this.memoryStore!;
            }
        }

        return this.memoryStore || {};
    }

    public async writeDeviceStore(store: DeviceActivityStore): Promise<void> {
        this.memoryStore = store;
        if (Object.keys(store).length === 0) {
            this.isExplicitlyCleared = true;
        } else {
            this.isExplicitlyCleared = false;
        }

        try {
            await activityMongoService.writeDeviceStore(store);
        } catch (err) {
            console.error("Failed to write device store to MongoDB:", err);
        }

        const jsonContent = JSON.stringify(store, null, 2);

        // 1. Write to primary file path
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            await fs.promises.writeFile(this.filePath, jsonContent, "utf8");
        } catch (err) {
            console.error("Failed to write to primary data file:", err);
        }

        // 2. Also write directly to public/data.json
        const publicFile = path.join(process.cwd(), "public", "data.json");
        if (publicFile !== this.filePath) {
            try {
                const pDir = path.dirname(publicFile);
                if (!fs.existsSync(/*turbopackIgnore: true*/ pDir)) {
                    await fs.promises.mkdir(pDir, { recursive: true });
                }
                await fs.promises.writeFile(publicFile, jsonContent, "utf8");
            } catch {
                // ignore in read-only environment
            }
        }
    }

    private async readEventsFromFile(): Promise<ParsedActivityEvent[]> {
        const store = await this.readDeviceStore();
        if (!store || typeof store !== "object" || Object.keys(store).length === 0) {
            return [];
        }

        const events: ParsedActivityEvent[] = [];

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

    public getDataPath(): string {
        return this.resolveReadFilePath();
    }

    public getJsonPath(): string {
        return this.getDataPath();
    }

    public getCsvPath(): string {
        return this.getDataPath();
    }

    public async getParsedEvents(): Promise<{ events: ParsedActivityEvent[]; summary: ActivitySummary; deviceStore?: DeviceActivityStore }> {
        try {
            const mongoResult = await activityMongoService.getParsedEvents();
            if (mongoResult.events.length > 0) {
                return mongoResult;
            }
        } catch (err) {
            console.error("Error getting parsed events from MongoDB:", err);
        }

        try {
            const deviceStore = await this.readDeviceStore();
            const events = await this.readEventsFromFile();

            if (events.length === 0) {
                return {
                    events: [],
                    summary: buildEmptyActivitySummary(),
                    deviceStore
                };
            }

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

    public async saveEvents(
        payload: any,
        clientIp?: string,
        geoInfo?: { country?: string; city?: string }
    ): Promise<DailySyncResult> {
        try {
            const mongoRes = await activityMongoService.saveEvents(payload, clientIp, geoInfo);
            if (mongoRes.success) {
                return mongoRes;
            }
        } catch (err) {
            console.error("MongoDB saveEvents error, falling back:", err);
        }

        const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const acceptedEventIds: string[] = [];
        const duplicateEventIds: string[] = [];
        const failedEventIds: string[] = [];

        if (!payload || typeof payload !== "object") {
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

                    // Direct device store passed: { "deviceId": { "name of code editor": ... } }
                    if (!payload.device_id && !payload.deviceId && !payload.events && !Array.isArray(payload)) {
                        let hasDeviceEntry = false;
                        const opensKey = "how many time open quickdb in a day";
                        for (const [key, val] of Object.entries(payload)) {
                            if (val && typeof val === "object" && !Array.isArray(val)) {
                                const incoming = val as any;
                                const country = incoming["name of country"] || incoming.country || "";
                                const city = incoming["name of city"] || incoming.city || "";
                                const sanitizedKey = sanitizeDeviceId(key, country, city);
                                if (key !== sanitizedKey && deviceStore[key]) {
                                    delete deviceStore[key];
                                }
                                const existing = deviceStore[sanitizedKey];
                                const rawIncomingOpens = incoming[opensKey] || incoming.opens || [];
                                const formattedIncomingOpens = (Array.isArray(rawIncomingOpens) ? rawIncomingOpens : [rawIncomingOpens])
                                    .filter(Boolean)
                                    .map(formatOpenTimestamp);

                                if (!existing) {
                                    deviceStore[sanitizedKey] = {
                                        "name of code editor": incoming["name of code editor"] || incoming.code_editor || "Visual Studio Code",
                                        "name of country": country,
                                        "name of city": city,
                                        [opensKey]: Array.from(new Set(formattedIncomingOpens)).sort()
                                    };
                                } else {
                                    // Merge: never lose previous data!
                                    if (incoming["name of code editor"] || incoming.code_editor) {
                                        existing["name of code editor"] = incoming["name of code editor"] || incoming.code_editor;
                                    }
                                    if (country) {
                                        existing["name of country"] = country;
                                    }
                                    if (city) {
                                        existing["name of city"] = city;
                                    }
                                    const existingOpens: string[] = Array.isArray(existing[opensKey])
                                        ? existing[opensKey]!
                                        : Array.isArray((existing as any).opens)
                                        ? (existing as any).opens
                                        : [];

                                    existing[opensKey] = Array.from(new Set([...existingOpens, ...formattedIncomingOpens])).sort();
                                    deviceStore[sanitizedKey] = existing;
                                }
                                hasDeviceEntry = true;
                            }
                        }
                        if (hasDeviceEntry) {
                            await this.writeDeviceStore(deviceStore);
                            return resolve({
                                success: true,
                                sync_id: syncId,
                                accepted_event_ids: [syncId],
                                duplicate_event_ids: [],
                                failed_event_ids: []
                            });
                        }
                    }

                    const rawEvents: any[] = Array.isArray(payload)
                        ? payload
                        : Array.isArray(payload.events)
                        ? payload.events
                        : [payload];

                    for (const evt of rawEvents) {
                        if (!evt || typeof evt !== "object") continue;

                        const rawDeviceId =
                            evt.device_id ||
                            payload.device_id ||
                            evt.deviceId ||
                            payload.deviceId ||
                            "unknown_device";

                        const eventId =
                            evt.event_id ||
                            evt.id ||
                            `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

                        const locFromEvt = parseLocation(evt.location || payload.location);
                        const country =
                            evt["name of country"] ||
                            evt.country ||
                            payload["name of country"] ||
                            payload.country ||
                            locFromEvt.country ||
                            (evt.metadata && (evt.metadata["name of country"] || evt.metadata.country)) ||
                            geoInfo?.country ||
                            "";

                        const city =
                            evt["name of city"] ||
                            evt.city ||
                            payload["name of city"] ||
                            payload.city ||
                            locFromEvt.city ||
                            (evt.metadata && (evt.metadata["name of city"] || evt.metadata.city)) ||
                            geoInfo?.city ||
                            "";

                        const deviceId = sanitizeDeviceId(rawDeviceId, country, city);

                        const editor =
                            evt["name of code editor"] ||
                            evt.code_editor ||
                            evt.editor_name ||
                            payload["name of code editor"] ||
                            payload.code_editor ||
                            payload.editor_name ||
                            payload.editor ||
                            (evt.metadata && (evt.metadata.code_editor || evt.metadata.editor_name)) ||
                            deviceStore[deviceId]?.["name of code editor"] ||
                            deviceStore[deviceId]?.code_editor ||
                            "Visual Studio Code";

                        if (!deviceStore[deviceId]) {
                            deviceStore[deviceId] = {
                                "name of code editor": editor,
                                "name of country": country || deviceStore[deviceId]?.["name of country"] || "",
                                "name of city": city || deviceStore[deviceId]?.["name of city"] || "",
                                "how many time open quickdb in a day": []
                            };
                        } else {
                            if (editor && editor !== "Visual Studio Code") {
                                deviceStore[deviceId]["name of code editor"] = editor;
                            }
                            if (country) {
                                deviceStore[deviceId]["name of country"] = country;
                            }
                            if (city) {
                                deviceStore[deviceId]["name of city"] = city;
                            }
                        }

                        const opensKey = "how many time open quickdb in a day";
                        if (!Array.isArray(deviceStore[deviceId][opensKey])) {
                            deviceStore[deviceId][opensKey] = [];
                        }

                        const openTimes = deviceStore[deviceId][opensKey]!;

                        // Gather all timestamps from evt and payload without discarding existing opens
                        const incomingTimes: string[] = [];
                        if (evt.occurred_at || evt.time || evt.timestamp || evt.received_at) {
                            incomingTimes.push(evt.occurred_at || evt.time || evt.timestamp || evt.received_at);
                        }
                        if (Array.isArray(evt[opensKey])) {
                            incomingTimes.push(...evt[opensKey]);
                        }
                        if (Array.isArray(evt.opens)) {
                            incomingTimes.push(...evt.opens);
                        }
                        if (incomingTimes.length === 0) {
                            if (payload.occurred_at || payload.time || payload.timestamp) {
                                incomingTimes.push(payload.occurred_at || payload.time || payload.timestamp);
                            } else if (Array.isArray(payload[opensKey])) {
                                incomingTimes.push(...payload[opensKey]);
                            } else if (Array.isArray(payload.opens)) {
                                incomingTimes.push(...payload.opens);
                            } else {
                                incomingTimes.push(new Date().toISOString());
                            }
                        }

                        for (const rawTime of incomingTimes) {
                            const formattedTime = formatOpenTimestamp(rawTime);
                            if (openTimes.includes(formattedTime)) {
                                duplicateEventIds.push(eventId);
                            } else {
                                openTimes.push(formattedTime);
                                acceptedEventIds.push(eventId);
                                this.seenEventIds?.add(eventId);
                            }
                        }
                    }

                    for (const dev of Object.values(deviceStore)) {
                        const opensKey = "how many time open quickdb in a day";
                        if (Array.isArray(dev[opensKey])) {
                            dev[opensKey]!.sort();
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

    public async deleteDevice(deviceId: string): Promise<boolean> {
        try {
            await activityMongoService.deleteDevice(deviceId);
        } catch (err) {
            console.error("Error deleting device from MongoDB:", err);
        }
        const count = await this.deleteEvents([deviceId]);
        return count > 0;
    }

    public async deleteDevices(deviceIds: string[]): Promise<number> {
        try {
            await activityMongoService.deleteDevices(deviceIds);
        } catch (err) {
            console.error("Error deleting devices from MongoDB:", err);
        }
        return this.deleteEvents(deviceIds);
    }

    public async deleteEvent(eventId: string): Promise<boolean> {
        return this.deleteDevice(eventId);
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
                        // 1. Exact match on device ID
                        if (deviceStore[id]) {
                            delete deviceStore[id];
                            deletedCount++;
                            continue;
                        }

                        // 2. Match reg_ event ID (e.g. reg_<deviceId> or reg_<deviceIdSlice>)
                        if (id.startsWith("reg_")) {
                            const regTarget = id.slice(4);
                            let foundDev = false;
                            for (const devId of Object.keys(deviceStore)) {
                                if (devId === regTarget || devId.startsWith(regTarget)) {
                                    delete deviceStore[devId];
                                    deletedCount++;
                                    foundDev = true;
                                    break;
                                }
                            }
                            if (foundDev) continue;
                        }

                        // 3. Match open_ event ID (scoped to the specific device)
                        for (const [devId, device] of Object.entries(deviceStore)) {
                            const devSlice = devId.slice(0, 10);
                            // Ensure this open event belongs to this device
                            if (id.startsWith("open_") && !id.startsWith(`open_${devSlice}_`)) {
                                continue;
                            }

                            const opensKey = "how many time open quickdb in a day";
                            if (Array.isArray(device[opensKey])) {
                                const prevLen = device[opensKey]!.length;
                                device[opensKey] = device[opensKey]!.filter((t) => {
                                    const tsClean = t.replace(/[^0-9]/g, "").slice(0, 10);
                                    return !id.includes(tsClean);
                                });
                                if (device[opensKey]!.length < prevLen) {
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
        try {
            await activityMongoService.clearAllEvents();
        } catch (err) {
            console.error("MongoDB clearAllEvents error:", err);
        }

        return new Promise<boolean>((resolve, reject) => {
            this.writeLock = this.writeLock
                .then(async () => {
                    await this.ensureInitialized();
                    this.seenEventIds = new Set<string>();
                    this.isExplicitlyCleared = true;
                    this.memoryStore = {};
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

export const activityJsonService = new ActivityJsonService();
export const activityCsvService = activityJsonService;
export const activityDataService = activityJsonService;
export { activityMongoService };
