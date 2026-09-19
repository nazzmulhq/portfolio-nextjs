import { NextRequest, NextResponse } from "next/server";
import { activityJsonService } from "../../../../../lib/api/activityJsonService";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const store = await activityJsonService.readDeviceStore();
        return new NextResponse(JSON.stringify(store, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-id"
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await activityJsonService.clearAllEvents();
        return new NextResponse(JSON.stringify({}, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON payload in request body." },
                { status: 400 }
            );
        }
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
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-id"
        }
    });
}
