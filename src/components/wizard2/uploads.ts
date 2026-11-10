"use client";

/**
 * Signed Cloudinary uploads for Wizard 2.0 (same flow as the classic wizard's Step5Media:
 * GET /api/cloudinary-sign → POST to Cloudinary with XHR for real progress).
 */
export interface UploadProgress { percent: number; loaded: number; total: number }
export interface UploadedFile { url: string; type: "photo" | "video" | "audio" | "file" }

type Sign = { signature: string; timestamp: string; cloudName: string; apiKey: string; folder: string };

async function getSignature(): Promise<Sign> {
    const res = await fetch("/api/cloudinary-sign");
    if (!res.ok) throw new Error("Could not start a secure upload. Please try again.");
    return res.json();
}

function kindOf(file: File | Blob): UploadedFile["type"] {
    const t = file.type || "";
    if (t.startsWith("video/")) return "video";
    if (t.startsWith("audio/")) return "audio";
    if (t.startsWith("image/")) return "photo";
    return "file";
}

export const LIMITS = { maxBytes: 25 * 1024 * 1024, maxPhotos: 5, maxVideos: 3 };

/** Upload files one by one with combined progress. Returns uploaded URLs in order. */
export async function uploadFiles(
    files: Array<File | Blob>,
    onProgress?: (p: UploadProgress) => void,
    opts: { resource?: "auto" | "video" | "image"; signal?: AbortSignal } = {},
): Promise<UploadedFile[]> {
    if (!files.length) return [];
    const sign = await getSignature();
    const total = files.reduce((n, f) => n + f.size, 0);
    let done = 0;
    const out: UploadedFile[] = [];

    for (const file of files) {
        const form = new FormData();
        form.append("api_key", String(sign.apiKey));
        form.append("timestamp", String(sign.timestamp));
        form.append("signature", String(sign.signature));
        form.append("folder", String(sign.folder));
        form.append("file", file, file instanceof File ? file.name : "recording.webm");

        const url = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            opts.signal?.addEventListener("abort", () => xhr.abort(), { once: true });
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress?.({ percent: Math.min(99, Math.round(((done + e.loaded) / total) * 100)), loaded: done + e.loaded, total });
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText).secure_url); } catch { reject(new Error("Unexpected upload response")); }
                } else reject(new Error(`Upload failed (${xhr.status})`));
            };
            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.onabort = () => reject(new Error("Upload cancelled"));
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${opts.resource || "auto"}/upload`, true);
            xhr.send(form);
        });
        done += file.size;
        out.push({ url, type: kindOf(file) });
    }
    onProgress?.({ percent: 100, loaded: total, total });
    return out;
}
