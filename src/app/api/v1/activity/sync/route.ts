import { NextRequest, NextResponse } from "next/server";
import { activityCsvService, DailySyncPayload } from "../../../../../lib/api/activityCsvService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as DailySyncPayload;

        if (!body || !body.device_id || !Array.isArray(body.events)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payload. 'device_id' and 'events' array are required."
                },
                { status: 400 }
            );
        }

        // Extract client IP from proxy headers
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const clientIp = (forwarded ? forwarded.split(",")[0].trim() : realIp) || undefined;

        const result = await activityCsvService.saveEvents(body, clientIp);
        return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
        console.error("Error processing activity sync:", err);
        return NextResponse.json(
            {
                success: false,
                message: err.message || "Failed to process activity sync"
            },
            { status: 500 }
        );
    }
}
