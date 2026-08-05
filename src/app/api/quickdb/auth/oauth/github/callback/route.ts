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
        return new NextResponse(`GitHub OAuth Error: ${errorDescription || error}`, { status: 400, headers: { "Content-Type": "text/html" }});
    }
    if (!code || !state) {
        return new NextResponse("Missing code or state from GitHub.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return new NextResponse("GitHub OAuth is not configured.", { status: 500, headers: { "Content-Type": "text/html" }});
    }

    const db = await getDb();
    const oauthStates = db.getRepository(OAuthState);
    const stateRecord = await oauthStates.findOne({ where: { state, provider: "github" } });

    if (!stateRecord) {
        return new NextResponse("Invalid or expired OAuth state.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    await oauthStates.delete({ state });

    if (stateRecord.expiresAt < new Date()) {
        return new NextResponse("OAuth state expired.", { status: 400, headers: { "Content-Type": "text/html" }});
    }

    try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });

        const tokenData = await tokenResponse.json() as any;
        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error("No access token returned from GitHub.");
        }

        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "QuickDB",
            },
        });
        const userData = await userResponse.json() as any;
        if (!userData || !userData.id) {
            throw new Error("Failed to fetch GitHub user profile.");
        }

        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "QuickDB",
            },
        });
        const emailData = await emailResponse.json() as any[];
        const primaryEmail = emailData.find((e: any) => e.primary)?.email || emailData[0]?.email;

        const authService = new AuthService(db);
        const userId = await authService.upsertOAuthUser("github", String(userData.id), primaryEmail, userData.name || userData.login);

        if (stateRecord.callbackUri) {
            const secret = process.env.JWT_SECRET || "development_secret";
            const authCode = jwt.sign({ sub: userId, typ: "oauth_code" }, secret, { expiresIn: "5m" });
            
            if (stateRecord.callbackUri.startsWith("/")) {
                const relativeUrl = new URL(stateRecord.callbackUri, baseUrlOf(req));
                relativeUrl.searchParams.set("code", authCode);
                return NextResponse.redirect(relativeUrl.toString());
            } else {
                const absoluteUrl = new URL(stateRecord.callbackUri);
                absoluteUrl.searchParams.set("code", authCode);
                return NextResponse.redirect(absoluteUrl.toString());
            }
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
        console.error("GitHub OAuth Error:", err);
        return new NextResponse("Authentication failed. Please try signing in again.", { status: 500, headers: { "Content-Type": "text/html" }});
    }
}
