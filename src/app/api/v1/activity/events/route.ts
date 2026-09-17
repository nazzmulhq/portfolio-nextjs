import { NextRequest, NextResponse } from "next/server";
import { activityCsvService, computeActivitySummary } from "../../../../../lib/api/activityCsvService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const range = url.searchParams.get("range")?.toLowerCase();
        const date = url.searchParams.get("date");
        const startDate = url.searchParams.get("start_date");
        const endDate = url.searchParams.get("end_date");
        const q = url.searchParams.get("q")?.toLowerCase().trim();
        const feature = url.searchParams.get("feature")?.toLowerCase();
        const deviceId = url.searchParams.get("device_id");
        const os = url.searchParams.get("os")?.toLowerCase();
        const status = url.searchParams.get("status")?.toLowerCase();

        const data = await activityCsvService.getParsedEvents();
        let events = data.events;

        const hasFilter = Boolean(range || date || startDate || endDate || q || feature || deviceId || os || status);

        if (hasFilter) {
            const now = new Date();
            const nowTime = now.getTime();
            const todayUtc = now.toISOString().split("T")[0];
            const yesterdayUtc = new Date(nowTime - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000;
            const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;

            events = events.filter((evt) => {
                if (q) {
                    const matchText =
                        evt.event_id.toLowerCase().includes(q) ||
                        evt.item_name.toLowerCase().includes(q) ||
                        evt.item_id.toLowerCase().includes(q) ||
                        evt.feature_name.toLowerCase().includes(q) ||
                        evt.action.toLowerCase().includes(q) ||
                        evt.device_id.toLowerCase().includes(q) ||
                        evt.device_name.toLowerCase().includes(q) ||
                        evt.location.toLowerCase().includes(q) ||
                        evt.ip_address.toLowerCase().includes(q);
                    if (!matchText) return false;
                }

                if (feature && evt.feature_name.toLowerCase() !== feature) return false;
                if (deviceId && evt.device_id !== deviceId) return false;
                if (os && evt.os_name.toLowerCase() !== os) return false;
                if (status && (evt.status || "synced").toLowerCase() !== status) return false;

                const rawDate = evt.occurred_at || evt.received_at;
                if (range || date || startDate || endDate) {
                    if (!rawDate) return false;
                    const d = new Date(rawDate);
                    const evtTime = d.getTime();
                    const evtUtc = rawDate.split("T")[0];
                    const evtLocal = !isNaN(evtTime)
                        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        : evtUtc;

                    if (range === "today" || range === "day") {
                        const matchesToday = evtUtc === todayUtc || evtLocal === todayUtc || (evtTime >= (nowTime - 24 * 60 * 60 * 1000) && evtTime <= nowTime);
                        if (!matchesToday) return false;
                    }
                    if (range === "yesterday") {
                        const matchesYesterday = evtUtc === yesterdayUtc || evtLocal === yesterdayUtc;
                        if (!matchesYesterday) return false;
                    }
                    if (range === "7d" || range === "week") {
                        if (evtTime < sevenDaysAgo) return false;
                    }
                    if (range === "30d" || range === "month") {
                        if (evtTime < thirtyDaysAgo) return false;
                    }
                    if (date) {
                        if (evtUtc !== date && evtLocal !== date) return false;
                    }
                    if (startDate && evtUtc < startDate && evtLocal < startDate) return false;
                    if (endDate && evtUtc > endDate && evtLocal > endDate) return false;
                }

                return true;
            });

            return NextResponse.json({
                success: true,
                events,
                summary: computeActivitySummary(events)
            });
        }

        return NextResponse.json({
            success: true,
            ...data
        });
    } catch (err: any) {
        console.error("Error fetching activity events:", err);
        return NextResponse.json(
            {
                success: false,
                message: err.message || "Failed to load activity events"
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const eventId = url.searchParams.get("event_id");
        const clearAll = url.searchParams.get("all") === "true";

        if (clearAll) {
            await activityCsvService.clearAllEvents();
            return NextResponse.json({
                success: true,
                message: "All activity events cleared successfully"
            });
        }

        if (eventId) {
            const deleted = await activityCsvService.deleteEvent(eventId);
            return NextResponse.json({
                success: true,
                deleted,
                message: deleted ? `Event ${eventId} deleted successfully` : `Event ${eventId} not found`
            });
        }

        try {
            const body = await req.json();
            if (body && Array.isArray(body.event_ids) && body.event_ids.length > 0) {
                const count = await activityCsvService.deleteEvents(body.event_ids);
                return NextResponse.json({
                    success: true,
                    count,
                    message: `${count} events deleted successfully`
                });
            }
        } catch {
            // body was empty or not JSON
        }

        return NextResponse.json(
            { success: false, message: "Missing event_id or 'all=true' parameter" },
            { status: 400 }
        );
    } catch (err: any) {
        console.error("Error deleting activity event(s):", err);
        return NextResponse.json(
            {
                success: false,
                message: err.message || "Failed to delete events"
            },
            { status: 500 }
        );
    }
}
