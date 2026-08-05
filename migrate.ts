import { AppDataSource } from "./src/lib/db";

async function main() {
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    
    console.log("Synchronizing schema...");
    await AppDataSource.synchronize();
    
    console.log("Migration completed successfully.");
    process.exit(0);
}

main().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
