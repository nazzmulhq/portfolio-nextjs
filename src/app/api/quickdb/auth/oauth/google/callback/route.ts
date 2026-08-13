import { NextResponse } from "next/server";
import { getDb } from "../../../../../../../lib/db";
import { AuthService } from "../../../../../../../lib/api/auth.service";
import { OAuthState } from "../../../../../../../entities";
import * as jwt from "jsonwebtoken";

function baseUrlOf(req: Request): string {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return process.env.QUICKDB_PUBLIC_URL || `${protocol}://${host}`;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
        return new NextResponse(`Google OAuth Error: ${errorDescription || error}`, { status: 400, headers: { "Content-Type": "text/html" }});
    }
    if (!code || !state) {
        return new NextResponse("Missing code or state from Google.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return new NextResponse("Google OAuth is not configured.", { status: 500, headers: { "Content-Type": "text/html" }});
    }

    const db = await getDb();
    const oauthStates = db.getRepository(OAuthState);
    const stateRecord = await oauthStates.findOne({ where: { state, provider: "google" } });

    if (!stateRecord) {
        return new NextResponse("Invalid or expired OAuth state.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    await oauthStates.delete({ state });

    if (stateRecord.expiresAt < new Date()) {
        return new NextResponse("OAuth state expired.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    const redirectUri = `${baseUrlOf(req)}/quickdb/auth/oauth/google/callback`;

    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
                grant_type: "authorization_code"
            }),
        });

        const tokenData = await tokenResponse.json() as any;
        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error("No access token returned from Google.");
        }

        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const userData = await userResponse.json() as any;
        if (!userData || !userData.id) {
            throw new Error("Failed to fetch Google user profile.");
        }

        const primaryEmail = userData.email;
        if (!primaryEmail) {
            throw new Error("Google profile did not contain an email.");
        }

        const authService = new AuthService(db);
        const userId = await authService.upsertOAuthUser("google", String(userData.id), primaryEmail, userData.name || userData.given_name);

        if (stateRecord.callbackUri) {
            const secret = process.env.JWT_SECRET || "development_secret";
            const authCode = jwt.sign({ sub: userId, typ: "oauth_code" }, secret, { expiresIn: "5m" });
            
            if (stateRecord.callbackUri.startsWith("/")) {
                const relativeUrl = new URL(stateRecord.callbackUri, baseUrlOf(req));
                relativeUrl.searchParams.set("code", authCode);
                return NextResponse.redirect(relativeUrl.toString());
            } 
                const absoluteUrl = new URL(stateRecord.callbackUri);
                absoluteUrl.searchParams.set("code", authCode);
                return NextResponse.redirect(absoluteUrl.toString());
            
        }

        return new NextResponse(`
            <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f111a; color: white;">
                <div style="text-align: center;">
                    <h2>Successfully Authenticated!</h2>
                    <p>You can close this window and return to QuickDB.</p>
                    <script>window.close();</script>
                </div>
            </body>
            </html>
        `, { status: 200, headers: { "Content-Type": "text/html" } });

    } catch (err: any) {
        console.error("Google OAuth Error:", err);
        return new NextResponse("Authentication failed. Please try signing in again.", { status: 500, headers: { "Content-Type": "text/html" }});
    }
}
