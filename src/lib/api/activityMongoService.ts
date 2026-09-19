import { getMongoDb } from "../mongodb";
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
    code_editor?: string;
    country?: string;
    city?: string;
    opens?: string[];
}

export type DeviceActivityStore = Record<string, DeviceActivityRecord>;

export interface DailySyncResult {
    success: boolean;
    sync_id: string;
    accepted_event_ids: string[];
    duplicate_event_ids: string[];
    failed_event_ids: string[];
}

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

const OPENS_KEY = "how many time open quickdb in a day";

export class ActivityMongoService {
    private async getCollection() {
        const db = await getMongoDb();
        return db.collection("activity_devices");
    }

    public async readDeviceStore(): Promise<DeviceActivityStore> {
        try {
            const col = await this.getCollection();
            const docs = await col.find({}).toArray();
            const store: DeviceActivityStore = {};

            for (const doc of docs) {
                const deviceId = (doc.device_id || String(doc._id)) as string;
                const rawOpens = Array.isArray(doc[OPENS_KEY])
                    ? doc[OPENS_KEY]
                    : Array.isArray(doc.opens)
                    ? doc.opens
                    : [];

                store[deviceId] = {
                    "name of code editor":
                        doc["name of code editor"] ||
                        doc.code_editor ||
                        "Visual Studio Code",
                    "name of country":
                        doc["name of country"] || doc.country || "",
                    "name of city": doc["name of city"] || doc.city || "",
                    "how many time open quickdb in a day": Array.from(
                        new Set(rawOpens.map(formatOpenTimestamp))
                    ).sort()
                };
            }

            return store;
        } catch (err) {
            console.error("Error reading device store from MongoDB:", err);
            return {};
        }
    }

    public async writeDeviceStore(store: DeviceActivityStore): Promise<void> {
        if (!store || typeof store !== "object") return;
        try {
            const col = await this.getCollection();
            for (const [deviceId, devData] of Object.entries(store)) {
                if (!devData || typeof devData !== "object") continue;
                const rawOpens =
                    devData[OPENS_KEY] || devData.opens || [];
                const formattedOpens = (
                    Array.isArray(rawOpens) ? rawOpens : [rawOpens]
                )
                    .filter(Boolean)
                    .map(formatOpenTimestamp);

                await col.updateOne(
                    { device_id: deviceId },
                    {
                        $set: {
                            device_id: deviceId,
                            "name of code editor":
                                devData["name of code editor"] ||
                                devData.code_editor ||
                                "Visual Studio Code",
                            "name of country":
                                devData["name of country"] ||
                                devData.country ||
                                "",
                            "name of city":
                                devData["name of city"] ||
                                devData.city ||
                                "",
                            updated_at: new Date()
                        },
                        $addToSet: {
                            [OPENS_KEY]: { $each: formattedOpens }
                        }
                    },
                    { upsert: true }
                );
            }
        } catch (err) {
            console.error("Error writing device store to MongoDB:", err);
        }
    }

    public async saveEvents(
        payload: any,
        _clientIp?: string,
        geoInfo?: { country?: string; city?: string }
    ): Promise<DailySyncResult> {
        const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        if (!payload || typeof payload !== "object") {
            return {
                success: false,
                sync_id: syncId,
                accepted_event_ids: [],
                duplicate_event_ids: [],
                failed_event_ids: []
            };
        }

        try {
            const col = await this.getCollection();

            // Direct device store passed: { "deviceId": { "name of code editor": ... } }
            if (
                !payload.device_id &&
                !payload.deviceId &&
                !payload.events &&
                !Array.isArray(payload)
            ) {
                let hasDeviceEntry = false;
                for (const [key, val] of Object.entries(payload)) {
                    if (val && typeof val === "object" && !Array.isArray(val)) {
                        const incoming = val as any;
                        const rawIncomingOpens =
                            incoming[OPENS_KEY] || incoming.opens || [];
                        const formattedIncomingOpens = (
                            Array.isArray(rawIncomingOpens)
                                ? rawIncomingOpens
                                : [rawIncomingOpens]
                        )
                            .filter(Boolean)
                            .map(formatOpenTimestamp);

                        await col.updateOne(
                            { device_id: key },
                            {
                                $set: {
                                    device_id: key,
                                    "name of code editor":
                                        incoming["name of code editor"] ||
                                        incoming.code_editor ||
                                        "Visual Studio Code",
                                    "name of country":
                                        incoming["name of country"] ||
                                        incoming.country ||
                                        "",
                                    "name of city":
                                        incoming["name of city"] ||
                                        incoming.city ||
                                        "",
                                    updated_at: new Date()
                                },
                                $addToSet: {
                                    [OPENS_KEY]: {
                                        $each: formattedIncomingOpens
                                    }
                                }
                            },
                            { upsert: true }
                        );
                        hasDeviceEntry = true;
                    }
                }
                if (hasDeviceEntry) {
                    return {
                        success: true,
                        sync_id: syncId,
                        accepted_event_ids: [syncId],
                        duplicate_event_ids: [],
                        failed_event_ids: []
                    };
                }
            }

            // Normal sync payload with events: { device_id, events: [...] }
            const rawEvents: any[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.events)
                ? payload.events
                : [payload];

            const acceptedEventIds: string[] = [];
            const duplicateEventIds: string[] = [];
            const failedEventIds: string[] = [];

            // Group by deviceId
            const updatesByDevice: Record<
                string,
                {
                    editor?: string;
                    country?: string;
                    city?: string;
                    opens: string[];
                    eventIds: string[];
                }
            > = {};

            for (const evt of rawEvents) {
                if (!evt || typeof evt !== "object") continue;

                const deviceId =
                    evt.device_id ||
                    payload.device_id ||
                    evt.deviceId ||
                    payload.deviceId ||
                    "unknown_device";

                const eventId =
                    evt.event_id ||
                    evt.id ||
                    `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

                const editor =
                    evt["name of code editor"] ||
                    evt.code_editor ||
                    evt.editor_name ||
                    payload["name of code editor"] ||
                    payload.code_editor ||
                    payload.editor_name ||
                    payload.editor ||
                    (evt.metadata &&
                        (evt.metadata.code_editor ||
                            evt.metadata.editor_name));

                const locFromEvt = parseLocation(
                    evt.location || payload.location
                );
                const country =
                    evt["name of country"] ||
                    evt.country ||
                    payload["name of country"] ||
                    payload.country ||
                    locFromEvt.country ||
                    geoInfo?.country;

                const city =
                    evt["name of city"] ||
                    evt.city ||
                    payload["name of city"] ||
                    payload.city ||
                    locFromEvt.city ||
                    geoInfo?.city;

                if (!updatesByDevice[deviceId]) {
                    updatesByDevice[deviceId] = {
                        editor,
                        country,
                        city,
                        opens: [],
                        eventIds: []
                    };
                } else {
                    if (editor && editor !== "Visual Studio Code") {
                        updatesByDevice[deviceId].editor = editor;
                    }
                    if (country) updatesByDevice[deviceId].country = country;
                    if (city) updatesByDevice[deviceId].city = city;
                }

                updatesByDevice[deviceId].eventIds.push(eventId);

                const incomingTimes: string[] = [];
                if (
                    evt.occurred_at ||
                    evt.time ||
                    evt.timestamp ||
                    evt.received_at
                ) {
                    incomingTimes.push(
                        evt.occurred_at ||
                            evt.time ||
                            evt.timestamp ||
                            evt.received_at
                    );
                }
                if (Array.isArray(evt[OPENS_KEY])) {
                    incomingTimes.push(...evt[OPENS_KEY]);
                }
                if (Array.isArray(evt.opens)) {
                    incomingTimes.push(...evt.opens);
                }
                if (incomingTimes.length === 0) {
                    if (
                        payload.occurred_at ||
                        payload.time ||
                        payload.timestamp
                    ) {
                        incomingTimes.push(
                            payload.occurred_at ||
                                payload.time ||
                                payload.timestamp
                        );
                    } else if (Array.isArray(payload[OPENS_KEY])) {
                        incomingTimes.push(...payload[OPENS_KEY]);
                    } else if (Array.isArray(payload.opens)) {
                        incomingTimes.push(...payload.opens);
                    } else {
                        incomingTimes.push(new Date().toISOString());
                    }
                }

                for (const rawTime of incomingTimes) {
                    updatesByDevice[deviceId].opens.push(
                        formatOpenTimestamp(rawTime)
                    );
                }
            }

            for (const [deviceId, data] of Object.entries(updatesByDevice)) {
                const uniqueOpens = Array.from(new Set(data.opens));
                const existingDoc = await col.findOne({ device_id: deviceId });
                const existingOpens: string[] =
                    (existingDoc && existingDoc[OPENS_KEY]) || [];

                for (const evtId of data.eventIds) {
                    // Check if open timestamps already exist
                    const isNew = uniqueOpens.some(
                        (t) => !existingOpens.includes(t)
                    );
                    if (isNew) {
                        acceptedEventIds.push(evtId);
                    } else {
                        duplicateEventIds.push(evtId);
                    }
                }

                const setFields: Record<string, any> = {
                    device_id: deviceId,
                    updated_at: new Date()
                };
                if (data.editor)
                    setFields["name of code editor"] = data.editor;
                if (data.country) setFields["name of country"] = data.country;
                if (data.city) setFields["name of city"] = data.city;

                await col.updateOne(
                    { device_id: deviceId },
                    {
                        $set: setFields,
                        $addToSet: {
                            [OPENS_KEY]: { $each: uniqueOpens }
                        }
                    },
                    { upsert: true }
                );
            }

            return {
                success: true,
                sync_id: syncId,
                accepted_event_ids:
                    acceptedEventIds.length > 0
                        ? acceptedEventIds
                        : [syncId],
                duplicate_event_ids: duplicateEventIds,
                failed_event_ids: failedEventIds
            };
        } catch (err: any) {
            console.error("Error saving events to MongoDB:", err);
            return {
                success: false,
                sync_id: syncId,
                accepted_event_ids: [],
                duplicate_event_ids: [],
                failed_event_ids: [syncId]
            };
        }
    }

    public async readEvents(options?: {
        limit?: number;
        offset?: number;
        feature?: string;
        search?: string;
    }): Promise<{
        events: ParsedActivityEvent[];
        total: number;
        summary: ActivitySummary;
        deviceStore: DeviceActivityStore;
    }> {
        const store = await this.readDeviceStore();
        const events: ParsedActivityEvent[] = [];

        for (const [deviceId, devData] of Object.entries(store)) {
            if (!devData || typeof devData !== "object") continue;

            const codeEditor =
                devData["name of code editor"] ||
                devData.code_editor ||
                "Visual Studio Code";
            const country = devData["name of country"] || devData.country || "";
            const city = devData["name of city"] || devData.city || "";
            const location =
                [city, country].filter(Boolean).join(", ") || "Global";
            const opens = devData[OPENS_KEY] || devData.opens || [];

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
                        location,
                        status: "synced",
                        received_at: isoTime,
                        metadata: {
                            "name of code editor": codeEditor,
                            "name of country": country,
                            "name of city": city,
                            "how many time open quickdb in a day":
                                opens.length,
                            daily_opens_count: opens.length,
                            open_timestamp: timeStr,
                            open_timestamps: opens
                        }
                    });
                });
            }
        }

        // Sort descending
        events.sort(
            (a, b) =>
                new Date(b.occurred_at).getTime() -
                new Date(a.occurred_at).getTime()
        );

        let filtered = events;
        if (options?.feature && options.feature !== "all") {
            filtered = filtered.filter(
                (e) => e.feature_name === options.feature
            );
        }
        if (options?.search) {
            const query = options.search.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    e.feature_name.toLowerCase().includes(query) ||
                    e.action.toLowerCase().includes(query) ||
                    e.device_id.toLowerCase().includes(query) ||
                    (e.code_editor &&
                        e.code_editor.toLowerCase().includes(query)) ||
                    (e.location && e.location.toLowerCase().includes(query))
            );
        }

        const total = filtered.length;
        const offset = options?.offset || 0;
        const limit = options?.limit || 50;
        const paginated = filtered.slice(offset, offset + limit);
        const summary = computeActivitySummary(events);

        return {
            events: paginated,
            total,
            summary,
            deviceStore: store
        };
    }

    public async getParsedEvents(): Promise<{
        events: ParsedActivityEvent[];
        summary: ActivitySummary;
        deviceStore?: DeviceActivityStore;
    }> {
        const result = await this.readEvents();
        return {
            events: result.events,
            summary: result.summary,
            deviceStore: result.deviceStore
        };
    }

    public async deleteEvent(eventId: string): Promise<boolean> {
        const count = await this.deleteEvents([eventId]);
        return count > 0;
    }

    public async deleteEvents(eventIds: string[]): Promise<number> {
        if (!Array.isArray(eventIds) || eventIds.length === 0) return 0;
        // In MongoDB, we can remove specific timestamps matching eventIds if needed
        return 0;
    }

    public async clearAllEvents(): Promise<boolean> {
        try {
            const col = await this.getCollection();
            await col.deleteMany({});
            return true;
        } catch (err) {
            console.error("Error clearing events from MongoDB:", err);
            return false;
        }
    }
}

export const activityMongoService = new ActivityMongoService();
