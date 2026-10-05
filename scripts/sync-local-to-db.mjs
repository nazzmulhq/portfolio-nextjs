import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_URI =
    "mongodb+srv://quickdb_user:QuickDB2026_SecureKey%21@quickui.jk4bdqi.mongodb.net/quickdb?retryWrites=true&w=majority&appName=quickui";

const OPENS_KEY = "how many time open quickdb in a day";

const INVALID_DEVICE_IDS = new Set([
    "somevalue.machineid",
    "somevalue",
    "00000000-0000-0000-0000-000000000000",
    "unknown_device",
    "undefined",
    "null",
    ""
]);

function isInvalidDeviceId(id) {
    if (!id || typeof id !== "string") return true;
    const trimmed = id.trim().toLowerCase();
    if (trimmed.length < 8) return true;
    if (INVALID_DEVICE_IDS.has(trimmed)) return true;
    if (/^[a-z]+\.[a-z]/i.test(trimmed) && trimmed.length < 40) return true;
    return false;
}

function sanitizeDeviceId(id, country, city) {
    if (!id || isInvalidDeviceId(id)) {
        const seed = `sanitized_${(id || "unknown").trim().toLowerCase()}_${(country || "").trim()}_${(city || "").trim()}`;
        return crypto.createHash("sha256").update(seed).digest("hex");
    }
    return id.trim();
}

async function syncLocalToDb() {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;
    const client = new MongoClient(uri);
    await client.connect();

    try {
        const dbName = process.env.MONGODB_DB_NAME || "quickdb";
        const db = client.db(dbName);
        const col = db.collection("activity_devices");

        console.log(`Connected to MongoDB Atlas: ${dbName}.activity_devices`);

        // 1. Migrate any existing placeholder device_id like "someValue.machineId"
        const placeholderDocs = await col.find({
            $or: [
                { device_id: "someValue.machineId" },
                { device_id: "somevalue.machineid" },
                { device_id: "someValue" }
            ]
        }).toArray();

        for (const doc of placeholderDocs) {
            const newId = sanitizeDeviceId(doc.device_id, doc["name of country"] || doc.country, doc["name of city"] || doc.city);
            console.log(`Migrating placeholder ID "${doc.device_id}" -> "${newId}"`);
            await col.updateOne(
                { _id: doc._id },
                { $set: { device_id: newId, updated_at: new Date() } }
            );
        }

        // 2. Read historical local data (from old_data.json if exists or bundled)
        let localData = {};
        const oldDataPath = "/tmp/old_data.json";
        const publicDataPath = path.join(process.cwd(), "public", "data.json");
        const srcDataPath = path.join(process.cwd(), "src", "data", "data.json");

        if (fs.existsSync(oldDataPath)) {
            try {
                localData = JSON.parse(fs.readFileSync(oldDataPath, "utf8"));
            } catch {
                /* ignore */
            }
        } else if (fs.existsSync(publicDataPath)) {
            try {
                localData = JSON.parse(fs.readFileSync(publicDataPath, "utf8"));
            } catch {
                /* ignore */
            }
        }

        // 3. Upsert local devices into MongoDB
        let upsertedCount = 0;
        for (const [rawKey, devData] of Object.entries(localData)) {
            if (!devData || typeof devData !== "object") continue;
            const editor = devData["name of code editor"] || devData.code_editor || "Visual Studio Code";
            const country = devData["name of country"] || devData.country || "";
            const city = devData["name of city"] || devData.city || "";
            const key = sanitizeDeviceId(rawKey, country, city);

            const rawOpens = devData[OPENS_KEY] || devData.opens || [];
            const formattedOpens = (Array.isArray(rawOpens) ? rawOpens : [rawOpens]).filter(Boolean);

            await col.updateOne(
                { device_id: key },
                {
                    $set: {
                        device_id: key,
                        "name of code editor": editor,
                        "name of country": country,
                        "name of city": city,
                        updated_at: new Date()
                    },
                    $addToSet: {
                        [OPENS_KEY]: { $each: formattedOpens }
                    }
                },
                { upsert: true }
            );
            upsertedCount++;
        }
        console.log(`Synced ${upsertedCount} local devices to MongoDB.`);

        // 4. Fetch the entire updated collection from MongoDB and write to local files
        const allDocs = await col.find({}).toArray();
        const mergedStore = {};

        for (const doc of allDocs) {
            let key = (doc.device_id || String(doc._id));
            if (isInvalidDeviceId(key)) {
                key = sanitizeDeviceId(key, doc["name of country"] || doc.country, doc["name of city"] || doc.city);
                await col.updateOne({ _id: doc._id }, { $set: { device_id: key } });
            }

            const rawOpens = Array.isArray(doc[OPENS_KEY]) ? doc[OPENS_KEY] : [];
            const sortedOpens = Array.from(new Set(rawOpens)).sort();

            mergedStore[key] = {
                "name of code editor": doc["name of code editor"] || "Visual Studio Code",
                "name of country": doc["name of country"] || "",
                "name of city": doc["name of city"] || "",
                [OPENS_KEY]: sortedOpens
            };
        }

        const jsonStr = JSON.stringify(mergedStore, null, 2);

        // Ensure public dir exists
        const publicDir = path.join(process.cwd(), "public");
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(publicDataPath, jsonStr, "utf8");

        // Ensure src/data dir exists
        const srcDataDir = path.join(process.cwd(), "src", "data");
        if (!fs.existsSync(srcDataDir)) {
            fs.mkdirSync(srcDataDir, { recursive: true });
        }
        fs.writeFileSync(srcDataPath, jsonStr, "utf8");

        console.log(`Saved ${Object.keys(mergedStore).length} devices to local public/data.json and src/data/data.json`);
        console.log("Device IDs in store:");
        for (const [id, rec] of Object.entries(mergedStore)) {
            console.log(` - ${id}: ${rec["name of code editor"]} (${rec["name of city"]}, ${rec["name of country"]}) - ${rec[OPENS_KEY].length} opens`);
        }
    } finally {
        await client.close();
    }
}

syncLocalToDb().catch(err => {
    console.error("Sync failed:", err);
    process.exit(1);
});
