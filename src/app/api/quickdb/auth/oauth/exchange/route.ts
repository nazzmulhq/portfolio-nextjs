import { NextResponse } from "next/server";
import { getDb } from "../../../../../../lib/db";
import { AuthService } from "../../../../../../lib/api/auth.service";
import * as jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const code = body.code;
        if (!code) {
            return NextResponse.json({ message: "Code is required" }, { status: 400 });
        }

        const secret = process.env.JWT_SECRET || "development_secret";
        let payload: any;
        try {
            payload = jwt.verify(code, secret);
        } catch {
            return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
        }

        if (!payload || !payload.sub || payload.typ !== "oauth_code") {
            return NextResponse.json({ message: "Invalid code payload" }, { status: 400 });
        }

        const db = await getDb();
        const authService = new AuthService(db);
        
        const meta = {
            ip: req.headers.get("x-forwarded-for") || undefined,
            country: req.headers.get("cf-ipcountry") || undefined,
            product: "vscode-extension", // default product for exchanged tokens like in NestJS backend
        };

        const result = await authService.issueForUser(payload.sub, meta);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
    }
}
