import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
    if (req.nextUrl.pathname === "/data.json") {
        return NextResponse.rewrite(new URL("/api/v1/activity/store", req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|favicon.ico|images/.*|gifs/.*|videos/.*|doc/.*).*)"],
};
