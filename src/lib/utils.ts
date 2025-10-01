import { platform } from "@tauri-apps/plugin-os";

export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | "web";

export function getPlatform(): Platform {
    try {
        const platformName = platform();

        return platformName as Platform | "web";
    } catch (error) {
        return 'web'
    }
}
