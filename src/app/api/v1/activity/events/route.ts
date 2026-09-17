import { NextResponse } from "next/server";
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
