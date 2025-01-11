import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file") || "";
    const filePath = path.resolve("./public/images", fileName);

    try {
        const image = await fs.readFile(filePath);
        return new Response(image, {
            headers: {
                "Content-Type": "image/jpeg",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response("Image not found", { status: 404 });
    }
}
