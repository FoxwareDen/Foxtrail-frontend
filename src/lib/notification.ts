import { requestPermissions } from "@tauri-apps/plugin-barcode-scanner";
import { isPermissionGranted, } from "@tauri-apps/plugin-notification";

import { start_worker } from "tauri-plugin-foxtrail-worker-api";

import { getPlatform } from "./utils";

// export async function save_notification(state: "granted" | "denied") {
//     try {
//         await executeQuery(async (db) => {
//             await db.execute(
//                 `INSERT INTO notification (id, state) VALUES (1, $1)
//          ON CONFLICT(id) DO UPDATE SET state = $1`,
//                 [state]
//             );
//         });
//     } catch (error) {
//         console.error("DB error:", error);
//     }
// }
//
// export async function get_notification_state(): Promise<"granted" | "denied" | null> {
//     try {
//         return await executeQuery(async (db) => {
//             const res = await db.select<{ state: "granted" | "denied" }[]>(
//                 "SELECT state FROM notification LIMIT 1"
//             );
//
//             if (res.length > 0) {
//                 return res[0].state;
//             }
//
//             return null;
//         });
//     } catch (error) {
//         console.error("DB error:", error);
//         return null;
//     }
// }

export async function start_service_notification(publicUrl: string, publicKey: string, userId: string): Promise<boolean> {

    try {
        const deviceType = getPlatform();


        const supportedPlatforms = ["android", "ios"];
        const isPlatformSupported = supportedPlatforms.includes(deviceType);


        if (!isPlatformSupported) {
            console.warn("❌ PLATFORM NOT SUPPORTED: Current device platform is not supported for service notifications");
            console.log("   Device type:", deviceType, "is not in supported list:", supportedPlatforms);
            console.log("🚫 EXITING: Returning false due to unsupported platform");
            return false;
        }

        let permission = await isPermissionGranted();

        if (!permission) {
            console.warn("⚠️ PERMISSION NOT GRANTED: Notification permission is not currently granted");
            console.log("⏳ Requesting notification permissions from user...");

            const res = await requestPermissions();

            permission = res == "granted";
        }

        if (permission == false) {
            console.error("❌ PERMISSION DENIED: User has not granted notification permissions");
            console.log("🚫 EXITING: Cannot proceed without notification permissions");
            return false;
        }


        console.log("📡 Calling start_worker function...");
        const res = await start_worker({
            publicKey,
            publicUrl,
            userId,
            value: null
        });

        console.log("✅ SERVICE WORKER STARTED SUCCESSFULLY");
        console.log("📋 WORKER START RESPONSE:", res);
        console.log("🎉 SUCCESS: Service notification setup completed successfully");

        return true;

    } catch (error) {
        console.error("   - Error message:", error || "No message");

        return false;
    }
}
