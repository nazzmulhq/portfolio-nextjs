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
            // 1. If configured path exists, check it
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
            // Fallback to /tmp if write permission denied (e.g. read-only filesystem on Vercel)
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
                        await fs.promises.writeFile(this.filePath, "[]", "utf8");
                    }
                } else {
                    await fs.promises.writeFile(this.filePath, "[]", "utf8");
                }
            }

            const targetPath = this.resolveReadFilePath();
            if (fs.existsSync(/*turbopackIgnore: true*/ targetPath)) {
                const content = await fs.promises.readFile(targetPath, "utf8");
                const parsed = JSON.parse(content);
                const rawEvents: ParsedActivityEvent[] = Array.isArray(parsed) ? parsed : parsed.events || [];
                for (const evt of rawEvents) {
                    if (evt?.event_id) {
                        this.seenEventIds.add(evt.event_id);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to initialize activity JSON data:", err);
        }
    }

    private async readEventsFromFile(): Promise<ParsedActivityEvent[]> {
        const targetPath = this.resolveReadFilePath();
        if (!targetPath || !fs.existsSync(targetPath)) {
            return [];
        }

        try {
            const content = await fs.promises.readFile(targetPath, "utf8");
            if (!content.trim()) return [];
            const parsed = JSON.parse(content);
            const events: ParsedActivityEvent[] = Array.isArray(parsed) ? parsed : parsed.events || [];
            return events;
        } catch (err) {
            console.error("Error reading events from JSON file:", err);
            return [];
        }
    }

    private async writeEventsToFile(events: ParsedActivityEvent[]): Promise<void> {
        const jsonContent = JSON.stringify(events, null, 2);
        await fs.promises.writeFile(this.filePath, jsonContent, "utf8");

        const publicFile = path.join(process.cwd(), "public", "data.json");
        if (fs.existsSync(publicFile) && publicFile !== this.filePath) {
            try {
                await fs.promises.writeFile(publicFile, jsonContent, "utf8");
            } catch {
                // ignore in read-only environment
            }
        }
    }

    public getDataPath(): string {
        return this.resolveReadFilePath();
    }

    public getCsvPath(): string {
        return this.getDataPath();
    }

    public async getParsedEvents(): Promise<{ events: ParsedActivityEvent[]; summary: ActivitySummary }> {
        try {
            const events = await this.readEventsFromFile();
            if (events.length === 0) {
                return {
                    events: [],
                    summary: buildEmptyActivitySummary()
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
                summary: computeActivitySummary(events)
            };
        } catch (err) {
            console.error("Error getting parsed events:", err);
            return {
                events: [],
                summary: buildEmptyActivitySummary()
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
                    const seen = this.seenEventIds!;
                    const existingEvents = await this.readEventsFromFile();
                    const newEvents: ParsedActivityEvent[] = [];
                    const receivedAt = new Date().toISOString();

                    for (const evt of payload.events) {
                        if (!evt || !evt.event_id) continue;

                        if (seen.has(evt.event_id)) {
                            duplicateEventIds.push(evt.event_id);
                            continue;
                        }

                        try {
                            const codeEditor =
                                evt.code_editor ||
                                evt.editor_name ||
                                (typeof evt.metadata === "object" && (evt.metadata?.code_editor || evt.metadata?.editor_name)) ||
                                payload.code_editor ||
                                payload.editor_name ||
                                "Visual Studio Code";

                            let metadataObj: Record<string, any> | null = null;
                            if (typeof evt.metadata === "object") {
                                metadataObj = evt.metadata;
                            } else if (typeof evt.metadata === "string") {
                                try {
                                    metadataObj = JSON.parse(evt.metadata);
                                } catch {
                                    metadataObj = { raw: evt.metadata };
                                }
                            }

                            const newEvt: ParsedActivityEvent = {
                                event_id: evt.event_id,
                                session_id: evt.session_id || "",
                                feature_name: evt.feature_name || "unknown",
                                action: evt.action || "unknown",
                                item_id: evt.item_id || "",
                                item_name: evt.item_name || "",
                                occurred_at: evt.occurred_at || receivedAt,
                                device_id: evt.device_id || payload.device_id || "",
                                device_name: evt.device_name || "desktop",
                                os_name: evt.os_name || "unknown",
                                code_editor: codeEditor,
                                ip_address: evt.ip_address || clientIp || "",
                                location: evt.location || "",
                                status: "synced",
                                received_at: receivedAt,
                                metadata: metadataObj
                            };

                            newEvents.push(newEvt);
                            seen.add(evt.event_id);
                            acceptedEventIds.push(evt.event_id);
                        } catch {
                            failedEventIds.push(evt.event_id);
                        }
                    }

                    if (newEvents.length > 0) {
                        const updated = [...newEvents, ...existingEvents];
                        await this.writeEventsToFile(updated);
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
                    console.error("Error writing activity events to JSON:", err);
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
                    const existingEvents = await this.readEventsFromFile();
                    const retainedEvents = existingEvents.filter((e) => !idSet.has(e.event_id));
                    const deletedCount = existingEvents.length - retainedEvents.length;

                    for (const id of idSet) {
                        this.seenEventIds?.delete(id);
                    }

                    await this.writeEventsToFile(retainedEvents);
                    resolve(deletedCount);
                })
                .catch((err) => {
                    console.error("Error deleting activity event(s):", err);
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
                    await this.writeEventsToFile([]);
                    resolve(true);
                })
                .catch((err) => {
                    console.error("Error clearing all activity events:", err);
                    reject(err);
                });
        });
    }
}

export const activityCsvService = new ActivityCsvService();
export const activityDataService = activityCsvService;
