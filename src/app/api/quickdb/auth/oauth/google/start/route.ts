import { NextResponse } from "next/server";
import { getDb } from "../../../../../../../lib/db";
import { randomBytes } from "crypto";
import { OAuthState } from "../../../../../../../entities";

function baseUrlOf(req: Request): string {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return process.env.QUICKDB_PUBLIC_URL || `${protocol}://${host}`;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const callbackUri = searchParams.get("callback_uri") || "";
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ message: "Google OAuth is not configured on this server." }, { status: 400 });
    }

    const db = await getDb();
    const state = randomBytes(16).toString("hex");
    
    await db.getRepository(OAuthState).insert({
        state,
        provider: "google",
        callbackUri: callbackUri || null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    const redirectUri = `${baseUrlOf(req)}/quickdb/auth/oauth/google/callback`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);

    return NextResponse.redirect(url.toString());
}
