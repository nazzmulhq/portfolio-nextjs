import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file") || "nest.mp4";
    const filePath = path.resolve("./public/images/doc", fileName);
    const fileBuffer = fs.readFileSync(filePath as string);

    return new Response(fileBuffer, {
        headers: {
            "Content-Type": "video/mp4",
        },
    });
}
