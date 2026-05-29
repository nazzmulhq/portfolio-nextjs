import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function proxy(req: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|favicon.ico|images/.*|gifs/.*|videos/.*|doc/.*).*)"],
};
