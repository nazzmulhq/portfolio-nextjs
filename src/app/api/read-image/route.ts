import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file") || "";
    const filePath = path.resolve("./public/images", fileName);
    const fileBuffer = fs.readFileSync(filePath as string);

    return new Response(fileBuffer, {
        headers: {
            "Content-Type": "image/jpeg",
        },
    });
}
