import { platform } from "@tauri-apps/plugin-os";
import bcrypt from "bcryptjs";


export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | "web";

export function getPlatform(): Platform {
    try {
        const platformName = platform();

        return platformName as Platform | "web";
    } catch (error) {
        return 'web'
    }
}


export async function hashString(input: string, salt: number = 8): Promise<string> {
    return await bcrypt.hash(input, salt);
}

export async function verifyHash(input: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(input, hash);
}
