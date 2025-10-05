import Database from "@tauri-apps/plugin-sql";


export async function connectToDatabase(): Promise<Database | null> {
    try {
        const db = await Database.load("sqlite:foxtrail.db");

        if (db) {
            return db
        }

        return null
    } catch (error) {
        console.error(error)
        return null
    }
}

export type QueryFunction<T> = (db: Database) => Promise<T>

export async function executeQuery<T>(functionToExecute: QueryFunction<T>): Promise<T> {
    const db = await connectToDatabase();

    if (!db) {
        throw new Error("Failed to connect to database");
    }

    try {
        return await functionToExecute(db) as T;
    } catch (error) {
        throw new Error(`Query failed: ${(error as Error).message}`);
    } finally {
        await disconnectFromDatabase(db)
    }
}


export async function disconnectFromDatabase(db: Database): Promise<void> {
    try {
        await db.close();
    } catch (error) {
        console.error(error)
    }
}
