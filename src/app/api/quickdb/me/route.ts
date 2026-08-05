import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { AuthService } from "../../../../lib/api/auth.service";
import * as jwt from "jsonwebtoken";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "development_secret";
        
        const decoded = jwt.verify(token, secret) as any;
        if (!decoded || !decoded.sub) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const db = await getDb();
        const authService = new AuthService(db);
        const result = await authService.me(decoded.sub);
        
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ message: err.message || "Unauthorized" }, { status: 401 });
    }
}
