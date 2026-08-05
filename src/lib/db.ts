import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENTITIES } from "../entities";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false, // In accordance with the QuickDB backend logic
    logging: false,
    entities: ENTITIES,
    subscribers: [],
    migrations: [],
});

let isInitialized = false;

export async function getDb(): Promise<DataSource> {
    if (!isInitialized) {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        isInitialized = true;
    }
    return AppDataSource;
}
