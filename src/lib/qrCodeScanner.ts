import { cancel, scan, Format, requestPermissions, checkPermissions, Scanned } from "@tauri-apps/plugin-barcode-scanner"

/**
 * Indicates whether a QR code scanning session is currently active.
 *
 * - `true` → A scan is in progress.
 * - `false` → No scan is running.
 *
 * This flag is managed internally by {@link scanQrCode} and {@link cancelScan}.
 */
export let isScanning = false;

/**
 * Starts a QR code scanning session using the device camera.
 *
 * - Requests permissions if not already granted.
 * - Only scans **QR codes** (via `Format.QRCode`).
 * - Sets `isScanning` to `true` while active.
 *
 * @template T - The expected type of scan result (useful if you want strong typing).
 * @returns {Promise<T | undefined>} Resolves with scan data typed as `T`,
 * or `undefined` if permissions are denied.
 *
 * @example
 * ```ts
 * interface MyQrPayload {
 *   id: string;
 *   name: string;
 * }
 *
 * const result = await scanQrCode<MyQrPayload>();
 * if (result) {
 *   console.log(result.id, result.name);
 * }
 * ```
 */
export async function getScanPerm() {
    const checkPerm = await checkPermissions();

    console.log('checkPerm: ', checkPerm)

    if (checkPerm === "prompt") {
        await requestPermissions();
    }

    if (checkPerm === "denied") {
        await requestPermissions();
        return false;
    }


    return true;
}

export interface ScanResult<T> {
    raw: string;
    payload: T | null;
}

export async function startScan<T>(formats: Format[] = [Format.QRCode], cameraDirection: 'front' | 'back' = 'back', videoElementId: string = 'scanner-video'): Promise<ScanResult<T> | null> {

    if (isScanning) {
        console.warn('Scan in progress, please wait...')
        return null
    }

    isScanning = true;

    const scanData = await scan({
        windowed: false, // <- embed the camera in DOM
        formats,
        cameraDirection,
        videoElementId, // <- ID of container where video will render
    });

    isScanning = false;

    const payload: T | null = JSON.parse(scanData.content) as T | null;

    return {
        raw: scanData.content,
        payload
    }
}

/**
 * Cancels an ongoing QR code scanning session.
 *
 * - Stops the active camera scan.
 * - Resets `isScanning` to `false`.
 *
 * @returns {Promise<void>} Resolves once the scan has been cancelled.
 *
 * @example
 * ```ts
 * await cancelScan();
 * console.log(isScanning); // false
 * ```
 */
export async function cancelScan() {
    await cancel();
    isScanning = false;
}
