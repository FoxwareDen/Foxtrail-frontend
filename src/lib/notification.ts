import { isPermissionGranted, requestPermission } from "@tauri-apps/plugin-notification";
import { start_worker } from "tauri-plugin-foxtrail-worker-api";
import { getPlatform } from "./utils";

import { executeQuery } from "./database";

async function create_notification_table() {
    try {
        await executeQuery(async (db) => {
            return await db.execute(
                "CREATE TABLE IF NOT EXISTS notification (id INTEGER PRIMARY KEY AUTOINCREMENT, state TEXT);"
            );
        });


        return true;
    } catch (error) {
        console.error(error)
        return false;
    }
}

export async function get_notification_state(): Promise<"granted" | "denied" | null> {
    try {
        const tableSet = await create_notification_table();

        if (!tableSet) {
            return null;
        }

        const res: { state: "granted" | "denied" }[] | null = await executeQuery(async (db) => {
            return await db.select("SELECT state FROM notification LIMIT 1");
        });

        if (res && res.length > 0) {
            return res[0].state;
        }

        return null;
    } catch (error) {
        console.error("DB error:", error);
        return null;
    }
}

async function save_notification(state: "granted" | "denied") {
    try {
        const tableSet = await create_notification_table();

        if (!tableSet) {
            return;
        }

        // Check if a record exists
        const existing: { id: number }[] | null = await executeQuery(async (db) => {
            return await db.select("SELECT id FROM notification LIMIT 1");
        });

        if (existing && existing.length > 0) {
            // Update existing record
            const res = await executeQuery(async (db) => {
                return await db.execute("UPDATE notification SET state = $1 WHERE id = $2", [state, existing[0].id]);
            });
            return res;
        } else {
            // Insert new record
            const res = await executeQuery(async (db) => {
                return await db.execute("INSERT INTO notification (state) VALUES ($1)", [state]);
            });
            return res;
        }
    } catch (error) {
        console.error("DB error:", error);
    }
}


export async function start_service_notification(publicUrl: string, publicKey: string, userId: string): Promise<boolean> {

    try {
        const deviceType = getPlatform();


        const supportedPlatforms = ["android", "ios"];
        const isPlatformSupported = supportedPlatforms.includes(deviceType);


        if (!isPlatformSupported) {
            console.warn("❌ PLATFORM NOT SUPPORTED: Current device platform is not supported for service notifications");
            return false;
        }

        let permission = await isPermissionGranted();

        if (!permission) {
            console.warn("⚠️ PERMISSION NOT GRANTED: Notification permission is not currently granted");

            if (await get_notification_state() == "denied") {
                console.error("❌ PERMISSION DENIED: User has not granted notification permissions");
                return false;
            }

            const res = await requestPermission();

            permission = res == "granted";
            await save_notification(res == "granted" ? "granted" : "denied");
        }

        if (permission == false) {
            console.error("❌ PERMISSION DENIED: User has not granted notification permissions");
            return false;
        }


        console.log("Calling start_worker function...");
        const res = await start_worker({
            publicKey,
            publicUrl,
            userId,
            value: null
        });

        console.log("Worker started:", res);


        return true;

    } catch (error) {
        console.error("   - Error message:", error || "No message");

        return false;
    }
}
