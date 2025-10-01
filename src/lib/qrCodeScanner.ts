import { cancel, scan, Format, requestPermissions, checkPermissions, Scanned } from "@tauri-apps/plugin-barcode-scanner"

/**
 * Indicates whether a scanning session is currently active.
 *
 * - `true` → A scan is in progress.
 * - `false` → No scan is running.
 *
 * This flag is managed internally by {@link startScan} and {@link cancelScan}.
 */
export let isScanning = false;

/**
 * Ensures the application has permission to use the device camera for scanning.
 *
 * - Checks existing permissions.
 * - If the status is `"prompt"` or `"denied"`, it will request permission.
 *
 * @returns {Promise<boolean>}
 * Resolves with:
 * - `true` if permission is already granted or granted after request.
 * - `false` if permission remains denied.
 *
 * @example
 * ```ts
 * const allowed = await getScanPerm();
 * if (!allowed) {
 *   alert("Camera access denied.");
 * }
 * ```
 */
export async function getScanPerm(): Promise<boolean> {
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

/**
 * Represents the result of a barcode/QR scan.
 *
 * @template T - The parsed type of the scanned content.
 */
export interface ScanResult<T> {
    /** The raw string value from the scanned code. */
    raw: string;
    /** Parsed JSON payload (if content is valid JSON), otherwise `null`. */
    payload: T | null;
}

/**
 * Starts a scanning session using the device camera.
 *
 * - Requests camera input and begins scanning.
 * - Supports multiple formats (default is **QR codes**).
 * - Prevents concurrent scans via {@link isScanning}.
 * - Embeds the camera view into the DOM inside a given element.
 *
 * @template T - The expected type of the parsed scan payload.
 *
 * @param {Format[]} [formats=[Format.QRCode]]
 * The barcode formats to scan for.
 * @param {'front' | 'back'} [cameraDirection='back']
 * Which camera to use if the device has multiple.
 * @param {string} [videoElementId='scanner-video']
 * The DOM element ID where the camera video should render.
 *
 * @returns {Promise<ScanResult<T> | null>}
 * Resolves with the scan result or `null` if a scan is already running.
 *
 * @example
 * ```ts
 * interface MyQrPayload {
 *   id: string;
 *   name: string;
 * }
 *
 * const result = await startScan<MyQrPayload>();
 * if (result) {
 *   console.log(result.raw); // raw string
 *   console.log(result.payload?.id, result.payload?.name);
 * }
 * ```
 */
export async function startScan<T>(
    formats: Format[] = [Format.QRCode],
    cameraDirection: 'front' | 'back' = 'back',
    videoElementId: string = 'scanner-video'
): Promise<ScanResult<T> | null> {

    if (isScanning) {
        console.warn('Scan in progress, please wait...')
        return null
    }

    isScanning = true;

    const scanData = await scan({
        windowed: false, // embed the camera in DOM
        formats,
        cameraDirection,
        videoElementId,
    });

    isScanning = false;

    let payload: T | null = null;
    try {
        payload = JSON.parse(scanData.content) as T;
    } catch {
        // If parsing fails, keep payload as null
    }

    return {
        raw: scanData.content,
        payload
    }
}

/**
 * Cancels an ongoing scanning session.
 *
 * - Stops the active camera feed.
 * - Resets {@link isScanning} to `false`.
 *
 * @returns {Promise<void>} Resolves once the scan is cancelled.
 *
 * @example
 * ```ts
 * await cancelScan();
 * console.log(isScanning); // false
 * ```
 */
export async function cancelScan(): Promise<void> {
    await cancel();
    isScanning = false;
}
