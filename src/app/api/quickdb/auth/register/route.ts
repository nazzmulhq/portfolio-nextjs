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
        if (!body.email || !body.password) {
            return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
        }

        const db = await getDb();
        const authService = new AuthService(db);
        const meta = getSessionMeta(req, body);

        const result = await authService.register(body.email, body.password, body.name, meta);
        return NextResponse.json(result);
    } catch (err: any) {
        const status = err.message.includes("already exists") ? 409 : 400;
        return NextResponse.json({ message: err.message || "Internal server error" }, { status });
    }
}
