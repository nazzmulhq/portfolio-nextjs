import { Db, MongoClient, MongoClientOptions } from "mongodb";

const DEFAULT_URI =
    "mongodb+srv://quickdb_user:QuickDB2026_SecureKey%21@quickui.jk4bdqi.mongodb.net/quickdb?retryWrites=true&w=majority&appName=quickui";

const mongoOptions: MongoClientOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 0,
};

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClientPromise(): Promise<MongoClient> {
    if (!global._mongoClientPromise) {
        const uri = (process.env.MONGODB_URI || DEFAULT_URI).trim();
        const client = new MongoClient(uri, mongoOptions);
        global._mongoClientPromise = client.connect().catch((err) => {
            global._mongoClientPromise = undefined;
            console.error("MongoDB Atlas connection error:", err?.message || err);
            throw err;
        });
    }
    return global._mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
    const client = await getMongoClientPromise();
    const dbName = (process.env.MONGODB_DB_NAME || "quickdb").trim();
    return client.db(dbName);
}

export default getMongoClientPromise;
