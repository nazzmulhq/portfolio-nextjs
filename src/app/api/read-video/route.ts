import fs from "fs";
import path from "path";
import { promisify } from "util";

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file") || "nest.mp4";
    const filePath = path.resolve("./public/images/doc", fileName);

    try {
        const fileStat = await stat(filePath);
        const fileContent = await readFile(filePath);

        return new Response(fileContent, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Length": fileStat.size.toString(),
            },
        });
    } catch (error) {
        console.log(error);
        return new Response("File not found", { status: 404 });
    }
}
