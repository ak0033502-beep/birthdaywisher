"use client";

/**
 * Signed Cloudinary uploads for Wizard 2.0 (GET /api/cloudinary-sign → POST to Cloudinary with XHR progress).
 * Includes:
 *  1. Client-side pre-validation (catches 0-byte iCloud placeholders, >25 MB files, and unsupported formats upfront)
 *  2. Full-HD photo compression (prevents >10 MB Cloudinary 400 rejections & speeds up mobile uploads ~8x)
 *  3. Activity-based stall watchdog (never cuts off slow 4G video uploads as long as bytes keep moving)
 *  4. Mobile 4G & background-tab recovery (waits for online/visible state + exponential backoff + fresh signatures)
 */
import { track } from "@/lib/track";

export interface UploadProgress { percent: number; loaded: number; total: number }
export interface UploadedFile { url: string; type: "photo" | "video" | "audio" | "file" }
export interface UploadOptions {
    resource?: "auto" | "video" | "image";
    signal?: AbortSignal;
    allowPdf?: boolean;
    /** Internal timing overrides for unit tests */
    _timings?: Partial<typeof UPLOAD_TIMINGS>;
}

type Sign = { signature: string; timestamp: string; cloudName: string; apiKey: string; folder: string };

const MAX_CLOUDINARY_IMAGE_BYTES = 9.5 * 1024 * 1024; // Cloudinary Free Plan hard image limit is 10 MB
const COMPRESS_ABOVE_BYTES = 1.2 * 1024 * 1024;
const MAX_IMAGE_DIM = 1920;

export const LIMITS = { maxBytes: 25 * 1024 * 1024, maxPhotos: 5, maxVideos: 3 };

export const UPLOAD_TIMINGS = {
    stallTimeoutMs: 45_000,      // Abort only if 0 bytes move for 45s straight
    processingTimeoutMs: 75_000, // Wait up to 75s after 100% upload for Cloudinary video response
    retryDelaysMs: [1_500, 3_500, 7_000] as readonly number[],
    networkWaitMs: 8_000,        // Wait up to 8s for 4G / tab visibility to return before retrying
    signMaxAgeMs: 45_000,        // Refresh batch signature if >45s elapsed on previous large files
};

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|svg)$/i;
const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v|3gp|3gpp|ogv|ogg)$/i;
const AUDIO_EXT_RE = /\.(webm|mp4|m4a|mp3|wav|ogg|oga|aac)$/i;
const UNSUPPORTED_VIDEO_EXT_RE = /\.(mkv|avi|wmv|flv|rmvb|vob|ts|m2ts|mts|divx)$/i;
const UNSUPPORTED_RAW_IMAGE_EXT_RE = /\.(cr2|cr3|nef|arw|dng|orf|rw2|psd|tiff?|ico|enc)$/i;

export class UploadValidationError extends Error {
    readonly isUserFileError = true;
    constructor(message: string) {
        super(message);
        this.name = "UploadValidationError";
    }
}

function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
        if (signal?.aborted) { reject(new Error("Upload cancelled")); return; }
        const onAbort = () => {
            clearTimeout(timer);
            reject(new Error("Upload cancelled"));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

/**
 * If the user's phone temporarily lost 4G signal or backgrounded the browser tab,
 * wait briefly for connectivity/visibility to return before burning a retry attempt.
 */
async function waitForReadyNetwork(maxWaitMs: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new Error("Upload cancelled");
    if (typeof window === "undefined" || maxWaitMs <= 0) return;

    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timer);
                document.removeEventListener("visibilitychange", onVis);
                signal?.removeEventListener("abort", onAbort);
            };
            const onAbort = () => { cleanup(); reject(new Error("Upload cancelled")); };
            const onVis = () => {
                if (document.visibilityState === "visible") { cleanup(); resolve(); }
            };
            const timer = setTimeout(() => { cleanup(); resolve(); }, maxWaitMs);
            document.addEventListener("visibilitychange", onVis);
            signal?.addEventListener("abort", onAbort, { once: true });
        });
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timer);
                window.removeEventListener("online", onOnline);
                signal?.removeEventListener("abort", onAbort);
            };
            const onAbort = () => { cleanup(); reject(new Error("Upload cancelled")); };
            const onOnline = () => { cleanup(); resolve(); };
            const timer = setTimeout(() => { cleanup(); resolve(); }, maxWaitMs);
            window.addEventListener("online", onOnline, { once: true });
            signal?.addEventListener("abort", onAbort, { once: true });
        });
    }
}

async function getSignature(networkWaitMs = UPLOAD_TIMINGS.networkWaitMs, signal?: AbortSignal): Promise<Sign> {
    const delays = [0, 1_200, 3_000];
    let lastErr: unknown;
    for (let attempt = 0; attempt < delays.length; attempt++) {
        if (signal?.aborted) throw new Error("Upload cancelled");
        if (delays[attempt] > 0) {
            await waitForReadyNetwork(networkWaitMs, signal);
            await abortableSleep(delays[attempt], signal);
        }
        try {
            const res = await fetch("/api/cloudinary-sign", { cache: "no-store", signal });
            if (!res.ok) {
                let msg = "Could not start a secure upload. Please try again.";
                try {
                    const body = await res.json();
                    if (body?.error) msg = String(body.error);
                } catch { /* ignore */ }
                const err = new Error(msg) as Error & { retryable?: boolean };
                err.retryable = res.status >= 500 || res.status === 429;
                if (!err.retryable) throw err;
                lastErr = err;
                continue;
            }
            return await res.json();
        } catch (e) {
            if (signal?.aborted || (e as Error)?.name === "AbortError") throw new Error("Upload cancelled");
            if ((e as { retryable?: boolean })?.retryable === false) throw e;
            lastErr = e;
        }
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("No internet connection. Please check your mobile data or Wi-Fi and try again.");
    }
    const rawMsg = (lastErr as Error)?.message || "";
    if (/failed to fetch|networkerror|load failed/i.test(rawMsg)) {
        throw new Error("Network connection dropped while starting upload. Please try again.");
    }
    throw lastErr instanceof Error ? lastErr : new Error("Could not start a secure upload. Please try again.");
}

function kindOf(file: File | Blob): UploadedFile["type"] {
    const t = (file.type || "").toLowerCase();
    const name = file instanceof File ? file.name : "";
    if (t.startsWith("video/") || (!t && VIDEO_EXT_RE.test(name))) return "video";
    if (t.startsWith("audio/") || (!t && AUDIO_EXT_RE.test(name))) return "audio";
    if (t.startsWith("image/") || (!t && IMAGE_EXT_RE.test(name))) return "photo";
    return "file";
}

/**
 * Validates file size and format client-side BEFORE requesting a signature or uploading bytes.
 */
export function validateUploadFile(
    file: File | Blob,
    opts: Pick<UploadOptions, "resource" | "allowPdf"> = {},
): void {
    const isNamedFile = file instanceof File;
    const name = isNamedFile ? file.name : "";
    const label = name ? `"${name}"` : "This file";
    const mime = (file.type || "").toLowerCase().split(";")[0].trim();

    if (!file || file.size === 0) {
        if (!isNamedFile) {
            throw new UploadValidationError("Voice recording was empty — please record for at least 1 second.");
        }
        throw new UploadValidationError(
            `${label} is empty (0 bytes). If it is stored in iCloud or Google Photos, download it to your phone first and try again.`,
        );
    }

    if (file.size > LIMITS.maxBytes) {
        throw new UploadValidationError(`${label} is over 25 MB. Please trim the video or pick a smaller file.`);
    }

    const isPdf = mime === "application/pdf" || /\.pdf$/i.test(name);
    if (isPdf) {
        if (opts.allowPdf) return;
        throw new UploadValidationError("PDF files are not supported here. Please choose a photo or video.");
    }

    if (UNSUPPORTED_RAW_IMAGE_EXT_RE.test(name)) {
        throw new UploadValidationError(`${label} is a raw/unsupported image format. Please choose a JPG, PNG, or WebP photo.`);
    }

    if (UNSUPPORTED_VIDEO_EXT_RE.test(name) || /^video\/(x-matroska|x-msvideo|x-ms-wmv|x-flv|mp2t|avi)$/i.test(mime)) {
        throw new UploadValidationError(`${label} uses an unsupported video format. Please upload an MP4, MOV, or WebM video.`);
    }

    const isImage = mime.startsWith("image/") || IMAGE_EXT_RE.test(name);
    const isVideo = mime.startsWith("video/") || VIDEO_EXT_RE.test(name);
    const isAudio = mime.startsWith("audio/") || AUDIO_EXT_RE.test(name) || (!isNamedFile && (mime === "" || mime.startsWith("video/")));

    if (opts.resource === "image" && !isImage) {
        throw new UploadValidationError("Please choose a photo (JPG, PNG, WebP, or HEIC).");
    }

    if (!isImage && !isVideo && !isAudio) {
        throw new UploadValidationError(
            `${label} is not a supported photo or video. Please choose a JPG, PNG, WebP, MP4, or MOV file.`,
        );
    }
}

function friendlyCloudinary400(detail: string): { msg: string; userFileError: boolean } {
    if (/empty file/i.test(detail)) {
        return {
            msg: "This file is empty (0 bytes). If it is in iCloud or Google Photos, save it to your phone first.",
            userFileError: true,
        };
    }
    if (/unsupported video|video format|codec/i.test(detail)) {
        return {
            msg: "Unsupported video format. Please upload a standard MP4 or MOV video.",
            userFileError: true,
        };
    }
    if (/invalid image/i.test(detail)) {
        return {
            msg: "This photo could not be read. Please try another JPG or PNG photo.",
            userFileError: true,
        };
    }
    if (/file size too large|too large/i.test(detail)) {
        return {
            msg: "This file is too large (max 25 MB, or 10 MB for photos). Please pick a smaller file.",
            userFileError: true,
        };
    }
    return {
        msg: detail ? `Upload failed (400): ${detail}` : "Upload failed (400)",
        userFileError: false,
    };
}

function loadImageElement(file: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image decode failed")); };
        img.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

/**
 * Downscales & compresses large static photos (>1.2 MB or >1920px) in the browser before upload.
 * Keeps animated GIFs, videos, PDFs, and audio untouched.
 */
export async function prepareUploadFile(file: File | Blob): Promise<File | Blob> {
    const mime = (file.type || "").toLowerCase();
    const isStaticImage = mime.startsWith("image/") && mime !== "image/gif" && mime !== "image/svg+xml";
    if (!isStaticImage || typeof document === "undefined") return file;
    if (file.size <= COMPRESS_ABOVE_BYTES) return file;

    try {
        let width = 0;
        let height = 0;
        let drawSource: CanvasImageSource;
        let bitmap: ImageBitmap | null = null;

        if (typeof createImageBitmap === "function") {
            bitmap = await createImageBitmap(file);
            width = bitmap.width;
            height = bitmap.height;
            drawSource = bitmap;
        } else {
            const img = await loadImageElement(file);
            width = img.naturalWidth || img.width;
            height = img.naturalHeight || img.height;
            drawSource = img;
        }

        if (!width || !height) {
            bitmap?.close();
            return file;
        }

        const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(width, height));
        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            bitmap?.close();
            return file;
        }
        ctx.drawImage(drawSource, 0, 0, targetW, targetH);
        bitmap?.close();

        let blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
        if (blob && blob.size > MAX_CLOUDINARY_IMAGE_BYTES) {
            blob = await canvasToBlob(canvas, "image/jpeg", 0.72);
        }
        if (!blob || (blob.size >= file.size && file.size <= MAX_CLOUDINARY_IMAGE_BYTES)) {
            return file;
        }

        const baseName = file instanceof File ? file.name.replace(/\.[^.]+$/, "") : "photo";
        return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
    } catch {
        // Every browser natively decodes valid JPEG/PNG/WebP; failure here means a corrupted image file
        if (/^image\/(jpe?g|png|webp)$/i.test(mime)) {
            throw new UploadValidationError("This photo appears corrupted or unreadable. Please choose another photo.");
        }
        // For HEIC/HEIF on browsers without native HEIC decode, guard Cloudinary's 10 MB photo cap
        if (file.size > 10 * 1024 * 1024) {
            throw new UploadValidationError("This photo is over 10 MB. Please pick a smaller JPEG or PNG photo.");
        }
        return file;
    }
}

function sendSingleWithRetry(
    file: File | Blob,
    getSign: () => Promise<Sign>,
    initialSign: Sign,
    resource: "auto" | "video" | "image",
    onBytes: (loaded: number) => void,
    timings: typeof UPLOAD_TIMINGS,
    signal?: AbortSignal,
): Promise<string> {
    return (async () => {
        let sign = initialSign;
        const maxAttempts = timings.retryDelaysMs.length + 1;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (signal?.aborted) throw new Error("Upload cancelled");
            if (attempt > 0) {
                await waitForReadyNetwork(timings.networkWaitMs, signal);
                await abortableSleep(timings.retryDelaysMs[attempt - 1], signal);
                sign = await getSign();
            }

            try {
                const url = await new Promise<string>((resolve, reject) => {
                    const form = new FormData();
                    form.append("api_key", String(sign.apiKey));
                    form.append("timestamp", String(sign.timestamp));
                    form.append("signature", String(sign.signature));
                    form.append("folder", String(sign.folder));
                    form.append("file", file, file instanceof File ? file.name : "recording.webm");

                    const xhr = new XMLHttpRequest();
                    // No fixed wall-clock timeout: slow 4G video uploads stay alive as long as bytes keep advancing.
                    xhr.timeout = 0;
                    let lastBytes = 0;
                    let stalledOut = false;
                    let stallTimer: ReturnType<typeof setTimeout> | null = null;

                    const clearStall = () => {
                        if (stallTimer) {
                            clearTimeout(stallTimer);
                            stallTimer = null;
                        }
                    };
                    const armStall = (ms: number) => {
                        clearStall();
                        stallTimer = setTimeout(() => {
                            stalledOut = true;
                            xhr.abort();
                        }, ms);
                    };
                    const cleanup = () => {
                        clearStall();
                        signal?.removeEventListener("abort", onAbort);
                    };
                    const onAbort = () => xhr.abort();
                    signal?.addEventListener("abort", onAbort, { once: true });

                    xhr.upload.onprogress = (e) => {
                        if (e.loaded > lastBytes) {
                            lastBytes = e.loaded;
                            const allSent = e.lengthComputable && e.loaded >= e.total;
                            armStall(allSent ? timings.processingTimeoutMs : timings.stallTimeoutMs);
                        }
                        if (e.lengthComputable) onBytes(e.loaded);
                    };
                    xhr.onload = () => {
                        cleanup();
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                resolve(JSON.parse(xhr.responseText).secure_url);
                            } catch {
                                reject(new Error("Unexpected upload response"));
                            }
                            return;
                        }
                        let detail = "";
                        try {
                            const parsed = JSON.parse(xhr.responseText);
                            detail = parsed?.error?.message ? String(parsed.error.message) : "";
                        } catch { /* ignore */ }

                        if (xhr.status === 400) {
                            const mapped = friendlyCloudinary400(detail);
                            if (mapped.userFileError) {
                                reject(new UploadValidationError(mapped.msg));
                                return;
                            }
                        }

                        const retryable = xhr.status >= 500 || xhr.status === 429 || xhr.status === 408;
                        const err = new Error(detail ? `Upload failed (${xhr.status}): ${detail}` : `Upload failed (${xhr.status})`) as Error & { retryable?: boolean };
                        err.retryable = retryable;
                        reject(err);
                    };
                    xhr.onerror = () => {
                        cleanup();
                        const err = new Error("Network error during upload") as Error & { retryable?: boolean };
                        err.retryable = true;
                        reject(err);
                    };
                    xhr.ontimeout = () => {
                        cleanup();
                        const err = new Error("Upload timed out on slow connection") as Error & { retryable?: boolean };
                        err.retryable = true;
                        reject(err);
                    };
                    xhr.onabort = () => {
                        cleanup();
                        if (stalledOut && !signal?.aborted) {
                            const err = new Error("Upload timed out on slow connection") as Error & { retryable?: boolean };
                            err.retryable = true;
                            reject(err);
                            return;
                        }
                        reject(new Error("Upload cancelled"));
                    };

                    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resource}/upload`, true);
                    armStall(timings.stallTimeoutMs);
                    xhr.send(form);
                });
                return url;
            } catch (e) {
                const retryable = Boolean((e as { retryable?: boolean })?.retryable);
                if (!retryable || attempt === maxAttempts - 1) throw e;
                onBytes(0);
            }
        }
        throw new Error("Network error during upload");
    })();
}

/** Upload files one by one with validation, compression, stall-safe retry, and combined progress. */
async function uploadFilesRaw(
    files: Array<File | Blob>,
    onProgress?: (p: UploadProgress) => void,
    opts: UploadOptions = {},
): Promise<UploadedFile[]> {
    if (!files.length) return [];
    const timings = { ...UPLOAD_TIMINGS, ...opts._timings };

    for (const f of files) {
        validateUploadFile(f, { resource: opts.resource, allowPdf: opts.allowPdf });
    }

    const prepared: Array<{ raw: File | Blob; send: File | Blob }> = [];
    for (const f of files) {
        prepared.push({ raw: f, send: await prepareUploadFile(f) });
    }

    const fetchSign = () => getSignature(timings.networkWaitMs, opts.signal);
    let sign = await fetchSign();
    let signFetchedAt = Date.now();

    const total = Math.max(1, prepared.reduce((n, p) => n + p.send.size, 0));
    let done = 0;
    const out: UploadedFile[] = [];

    for (let i = 0; i < prepared.length; i++) {
        const item = prepared[i];
        if (i > 0 && Date.now() - signFetchedAt > timings.signMaxAgeMs) {
            sign = await fetchSign();
            signFetchedAt = Date.now();
        }
        const url = await sendSingleWithRetry(
            item.send,
            async () => {
                const fresh = await fetchSign();
                sign = fresh;
                signFetchedAt = Date.now();
                return fresh;
            },
            sign,
            opts.resource || "auto",
            (loaded) => {
                onProgress?.({
                    percent: Math.min(99, Math.round(((done + loaded) / total) * 100)),
                    loaded: done + loaded,
                    total,
                });
            },
            timings,
            opts.signal,
        );
        done += item.send.size;
        out.push({ url, type: kindOf(item.raw) });
    }
    onProgress?.({ percent: 100, loaded: total, total });
    return out;
}

/** Upload with anonymous failure tracking (only genuine network/server failures are logged to Admin). */
export async function uploadFiles(...args: Parameters<typeof uploadFilesRaw>): Promise<UploadedFile[]> {
    try {
        return await uploadFilesRaw(...args);
    } catch (e) {
        const msg = (e as Error)?.message || "unknown";
        const isUserErr = e instanceof UploadValidationError || Boolean((e as { isUserFileError?: boolean })?.isUserFileError);
        if (msg !== "Upload cancelled" && !isUserErr) {
            track("upload_fail", {
                reason: msg.slice(0, 100),
                files: args[0].length,
                mb: Math.round(args[0].reduce((n, f) => n + f.size, 0) / 1048576),
            });
        }
        throw e;
    }
}
