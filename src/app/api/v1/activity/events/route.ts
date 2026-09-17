import { NextRequest, NextResponse } from "next/server";
import { activityCsvService } from "../../../../../lib/api/activityCsvService";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const data = await activityCsvService.getParsedEvents();
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
