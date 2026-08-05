import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { AuthService, SessionMeta } from "../../../../../lib/api/auth.service";

function getSessionMeta(req: Request, body: any): SessionMeta {
    return {
        deviceId: body.deviceId,
        product: body.product,
        appVersion: body.appVersion,
        os: body.os,
        arch: body.arch,
        ip: req.headers.get("x-forwarded-for") || undefined,
        country: req.headers.get("cf-ipcountry") || undefined,
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.refreshToken) {
            return NextResponse.json({ message: "Refresh token is required." }, { status: 400 });
        }

        const db = await getDb();
        const authService = new AuthService(db);
        const meta = getSessionMeta(req, body);

        const result = await authService.refresh(body.refreshToken, meta);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ message: err.message || "Invalid token" }, { status: 401 });
    }
}
