"use client";

/**
 * Signed Cloudinary uploads for Wizard 2.0 (GET /api/cloudinary-sign → POST to Cloudinary with XHR progress).
 * Includes:
 *  1. Client-side Full-HD photo compression (prevents >10 MB Cloudinary 400 rejections & speeds up mobile uploads ~8x)
 *  2. Automatic XHR retry on transient mobile network drops / 5xx / 429
 *  3. Clear Cloudinary error message parsing
 */
import { track } from "@/lib/track";

export interface UploadProgress { percent: number; loaded: number; total: number }
export interface UploadedFile { url: string; type: "photo" | "video" | "audio" | "file" }

type Sign = { signature: string; timestamp: string; cloudName: string; apiKey: string; folder: string };

const MAX_CLOUDINARY_IMAGE_BYTES = 9.5 * 1024 * 1024; // Cloudinary Free Plan hard image limit is 10 MB
const COMPRESS_ABOVE_BYTES = 1.2 * 1024 * 1024;
const MAX_IMAGE_DIM = 1920;

async function getSignature(): Promise<Sign> {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetch("/api/cloudinary-sign", { cache: "no-store" });
            if (!res.ok) throw new Error("Could not start a secure upload. Please try again.");
            return await res.json();
        } catch (e) {
            lastErr = e;
            if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Could not start a secure upload. Please try again.");
}

function kindOf(file: File | Blob): UploadedFile["type"] {
    const t = file.type || "";
    if (t.startsWith("video/")) return "video";
    if (t.startsWith("audio/")) return "audio";
    if (t.startsWith("image/")) return "photo";
    return "file";
}

export const LIMITS = { maxBytes: 25 * 1024 * 1024, maxPhotos: 5, maxVideos: 3 };

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
 * Keeps animated GIFs, videos, and audio untouched.
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
        // If browser could not decode (e.g. unsupported raw HEIC on desktop), guard Cloudinary's 10 MB photo cap
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("This photo is over 10 MB. Please pick a smaller JPEG/PNG photo.");
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
    signal?: AbortSignal,
): Promise<string> {
    return (async () => {
        let sign = initialSign;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (signal?.aborted) throw new Error("Upload cancelled");
            if (attempt > 0) {
                await new Promise((r) => setTimeout(r, attempt * 900));
                if (signal?.aborted) throw new Error("Upload cancelled");
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
                    xhr.timeout = 90_000;
                    const onAbort = () => xhr.abort();
                    signal?.addEventListener("abort", onAbort, { once: true });

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) onBytes(e.loaded);
                    };
                    xhr.onload = () => {
                        signal?.removeEventListener("abort", onAbort);
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
                        const retryable = xhr.status >= 500 || xhr.status === 429;
                        const err = new Error(detail ? `Upload failed (${xhr.status}): ${detail}` : `Upload failed (${xhr.status})`) as Error & { retryable?: boolean };
                        err.retryable = retryable;
                        reject(err);
                    };
                    xhr.onerror = () => {
                        signal?.removeEventListener("abort", onAbort);
                        const err = new Error("Network error during upload") as Error & { retryable?: boolean };
                        err.retryable = true;
                        reject(err);
                    };
                    xhr.ontimeout = () => {
                        signal?.removeEventListener("abort", onAbort);
                        const err = new Error("Upload timed out on slow connection") as Error & { retryable?: boolean };
                        err.retryable = true;
                        reject(err);
                    };
                    xhr.onabort = () => {
                        signal?.removeEventListener("abort", onAbort);
                        reject(new Error("Upload cancelled"));
                    };
                    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resource}/upload`, true);
                    xhr.send(form);
                });
                return url;
            } catch (e) {
                const retryable = Boolean((e as { retryable?: boolean })?.retryable);
                if (!retryable || attempt === 2) throw e;
                onBytes(0);
            }
        }
        throw new Error("Network error during upload");
    })();
}

/** Upload files one by one with compression, retry, and combined progress. Returns uploaded URLs in order. */
async function uploadFilesRaw(
    files: Array<File | Blob>,
    onProgress?: (p: UploadProgress) => void,
    opts: { resource?: "auto" | "video" | "image"; signal?: AbortSignal } = {},
): Promise<UploadedFile[]> {
    if (!files.length) return [];
    const prepared: Array<{ raw: File | Blob; send: File | Blob }> = [];
    for (const f of files) {
        prepared.push({ raw: f, send: await prepareUploadFile(f) });
    }

    const sign = await getSignature();
    const total = Math.max(1, prepared.reduce((n, p) => n + p.send.size, 0));
    let done = 0;
    const out: UploadedFile[] = [];

    for (const item of prepared) {
        const url = await sendSingleWithRetry(
            item.send,
            getSignature,
            sign,
            opts.resource || "auto",
            (loaded) => {
                onProgress?.({
                    percent: Math.min(99, Math.round(((done + loaded) / total) * 100)),
                    loaded: done + loaded,
                    total,
                });
            },
            opts.signal,
        );
        done += item.send.size;
        out.push({ url, type: kindOf(item.raw) });
    }
    onProgress?.({ percent: 100, loaded: total, total });
    return out;
}

/** Upload with anonymous failure tracking (shown in the admin dashboard). */
export async function uploadFiles(...args: Parameters<typeof uploadFilesRaw>): Promise<UploadedFile[]> {
    try {
        return await uploadFilesRaw(...args);
    } catch (e) {
        const msg = (e as Error)?.message || "unknown";
        if (msg !== "Upload cancelled") {
            track("upload_fail", {
                reason: msg.slice(0, 100),
                files: args[0].length,
                mb: Math.round(args[0].reduce((n, f) => n + f.size, 0) / 1048576),
            });
        }
        throw e;
    }
}
