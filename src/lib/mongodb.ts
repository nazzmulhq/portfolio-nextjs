import { Db, MongoClient } from "mongodb";

const DEFAULT_URI =
    "mongodb+srv://quickdb_user:QuickDB2026_SecureKey%21@quickui.jk4bdqi.mongodb.net/quickdb?retryWrites=true&w=majority&appName=quickui";

const uri = DEFAULT_URI;

declare global {

    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getMongoDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db("quickdb");
}

export default clientPromise;
