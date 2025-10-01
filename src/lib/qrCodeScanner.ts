import { cancel, scan, Format, requestPermissions, checkPermissions } from "@tauri-apps/plugin-barcode-scanner"

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
export async function scanQrCode<T>() {
    const checkPerm = await checkPermissions();

    //
    // if (checkPerm === "prompt") {
    //     await requestPermissions();
    // }
    //
    // if (checkPerm === "denied") {
    //     await requestPermissions();
    //     return;
    // }
    //
    // isScanning = true;
    // const scanData = await scan({
    //     windowed: true,
    //     formats: [Format.QRCode],
    //     cameraDirection: "back",
    // });
    //
    // return scanData as T;
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
