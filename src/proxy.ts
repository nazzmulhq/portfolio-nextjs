import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function proxy(req: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|favicon.ico|images/.*|videos/.*|doc/.*).*)"],
};
