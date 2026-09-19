import { NextRequest, NextResponse } from "next/server";
import { activityJsonService } from "../../../../../lib/api/activityJsonService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON payload in request body."
                },
                { status: 400 }
            );
        }

        if (!body || (typeof body === "object" && !Array.isArray(body) && Object.keys(body).length === 0)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payload: body is required and cannot be empty."
                },
                { status: 400 }
            );
        }

        // Extract client IP and Geo from Vercel / proxy headers
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const clientIp = (forwarded ? forwarded.split(",")[0].trim() : realIp) || undefined;

        const vercelCountry = req.headers.get("x-vercel-ip-country") || undefined;
        const vercelCity = req.headers.get("x-vercel-ip-city") || undefined;

        const geoInfo = {
            country: vercelCountry ? decodeURIComponent(vercelCountry) : undefined,
            city: vercelCity ? decodeURIComponent(vercelCity) : undefined
        };

        const result = await activityJsonService.saveEvents(body, clientIp, geoInfo);
        return NextResponse.json(result, {
            status: 200,
            headers: {
                "Cache-Control": "no-store, max-age=0",
                "Access-Control-Allow-Origin": "*"
            }
        });
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

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-id"
        }
    });
}
