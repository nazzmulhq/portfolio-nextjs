import path from "path";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file") || "";
    const filePath = path.resolve("./public/images", fileName);

    return new Response(filePath, {
        headers: {
            "Content-Type": "image/png",
        },
    });
}
