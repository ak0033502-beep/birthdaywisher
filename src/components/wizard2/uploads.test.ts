import { afterEach, describe, expect, it, vi } from "vitest";
import { UploadValidationError, uploadFiles, validateUploadFile } from "./uploads";
import { normalizeWindowErrorMessage } from "@/components/seo/SiteTracker";

describe("normalizeWindowErrorMessage", () => {
    it("ignores bare 'Uncaught ' when thrown value is empty", () => {
        expect(normalizeWindowErrorMessage("Uncaught ", "")).toBe("");
        expect(normalizeWindowErrorMessage("Uncaught", null)).toBe("");
        expect(normalizeWindowErrorMessage("Uncaught ", {})).toBe("");
    });

    it("extracts error name and message when message is bare 'Uncaught '", () => {
        expect(normalizeWindowErrorMessage("Uncaught ", { name: "InvalidStateError", message: "AudioContext closed" }))
            .toBe("InvalidStateError: AudioContext closed");
        expect(normalizeWindowErrorMessage("Uncaught ", { name: "NotReadableError", message: "" }))
            .toBe("NotReadableError");
    });

    it("preserves real ChunkLoadError and TypeError messages", () => {
        expect(normalizeWindowErrorMessage("Uncaught ChunkLoadError: Failed to load chunk /_next/static/chunks/abc.js"))
            .toContain("ChunkLoadError");
    });
});

describe("validateUploadFile", () => {
    it("rejects 0-byte iCloud placeholder files and empty voice blobs", () => {
        const emptyFile = new File([], "IMG_1024.HEIC", { type: "image/heic" });
        expect(() => validateUploadFile(emptyFile)).toThrow(UploadValidationError);
        expect(() => validateUploadFile(emptyFile)).toThrow(/0 bytes/i);

        const emptyBlob = new Blob([], { type: "audio/webm" });
        expect(() => validateUploadFile(emptyBlob)).toThrow(UploadValidationError);
    });

    it("rejects oversized (>25 MB) and unsupported formats", () => {
        const huge = new File([new Uint8Array(26 * 1024 * 1024)], "party.mp4", { type: "video/mp4" });
        expect(() => validateUploadFile(huge)).toThrow(/over 25 MB/i);

        const mkv = new File([new Uint8Array(128)], "movie.mkv", { type: "video/x-matroska" });
        expect(() => validateUploadFile(mkv)).toThrow(/unsupported video format/i);

        const raw = new File([new Uint8Array(128)], "DSC_0001.CR2", { type: "image/x-canon-cr2" });
        expect(() => validateUploadFile(raw)).toThrow(/unsupported image format/i);

        const zip = new File([new Uint8Array(128)], "archive.zip", { type: "application/zip" });
        expect(() => validateUploadFile(zip)).toThrow(UploadValidationError);
    });

    it("enforces allowPdf and image-only puzzle constraints while allowing standard media", () => {
        const pdf = new File([new Uint8Array(256)], "voucher.pdf", { type: "application/pdf" });
        expect(() => validateUploadFile(pdf)).toThrow(/PDF files are not supported/i);
        expect(() => validateUploadFile(pdf, { allowPdf: true })).not.toThrow();

        const mp4 = new File([new Uint8Array(256)], "clip.mp4", { type: "video/mp4" });
        expect(() => validateUploadFile(mp4, { resource: "image" })).toThrow(/choose a photo/i);
        expect(() => validateUploadFile(mp4)).not.toThrow();

        const jpg = new File([new Uint8Array(256)], "smile.jpg", { type: "image/jpeg" });
        expect(() => validateUploadFile(jpg, { resource: "image" })).not.toThrow();

        const voice = new Blob([new Uint8Array(256)], { type: "audio/webm;codecs=opus" });
        expect(() => validateUploadFile(voice, { resource: "video" })).not.toThrow();
    });
});

describe("uploadFiles stall watchdog and retry", () => {
    const origFetch = globalThis.fetch;
    const origXHR = (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest;

    afterEach(() => {
        globalThis.fetch = origFetch;
        (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = origXHR;
        vi.restoreAllMocks();
    });

    it("keeps slow uploads alive past stallTimeoutMs as long as bytes keep advancing", async () => {
        globalThis.fetch = vi.fn(async () =>
            new Response(JSON.stringify({ signature: "s", timestamp: "1", cloudName: "demo", apiKey: "k", folder: "f" }), { status: 200 }),
        ) as typeof fetch;

        class SlowActiveXHR {
            timeout = 0;
            status = 200;
            responseText = JSON.stringify({ secure_url: "https://res.cloudinary.com/demo/video/upload/slow.mp4" });
            upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            ontimeout: (() => void) | null = null;
            onabort: (() => void) | null = null;
            private timers: Array<ReturnType<typeof setTimeout>> = [];

            open() {}
            send() {
                // stallTimeoutMs is 40ms, but progress ticks every 20ms for 100ms total -> must NOT abort!
                [20, 40, 60, 80].forEach((ms, idx) => {
                    this.timers.push(setTimeout(() => {
                        this.upload.onprogress?.({ lengthComputable: true, loaded: (idx + 1) * 250, total: 1000 });
                    }, ms));
                });
                this.timers.push(setTimeout(() => this.onload?.(), 95));
            }
            abort() {
                this.timers.forEach(clearTimeout);
                this.onabort?.();
            }
        }
        (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = SlowActiveXHR;

        const video = new File([new Uint8Array(1000)], "birthday.mp4", { type: "video/mp4" });
        const progress: number[] = [];
        const res = await uploadFiles(
            [video],
            (p) => progress.push(p.percent),
            { _timings: { stallTimeoutMs: 45, processingTimeoutMs: 80, retryDelaysMs: [10], networkWaitMs: 0 } },
        );

        expect(res).toEqual([{ url: "https://res.cloudinary.com/demo/video/upload/slow.mp4", type: "video" }]);
        expect(progress.at(-1)).toBe(100);
    });

    it("aborts truly stalled uploads (0 byte progress) and succeeds on retry", async () => {
        let signCalls = 0;
        globalThis.fetch = vi.fn(async () => {
            signCalls++;
            return new Response(JSON.stringify({ signature: `s${signCalls}`, timestamp: "1", cloudName: "demo", apiKey: "k", folder: "f" }), { status: 200 });
        }) as typeof fetch;

        let attempts = 0;
        class StallThenSucceedXHR {
            timeout = 0;
            status = 200;
            responseText = JSON.stringify({ secure_url: "https://res.cloudinary.com/demo/video/upload/recovered.mp4" });
            upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            ontimeout: (() => void) | null = null;
            onabort: (() => void) | null = null;

            open() {}
            send() {
                attempts++;
                if (attempts === 1) {
                    // Attempt 1 hangs forever with 0 bytes sent -> stall watchdog should abort & retry
                    return;
                }
                setTimeout(() => {
                    this.upload.onprogress?.({ lengthComputable: true, loaded: 512, total: 512 });
                    this.onload?.();
                }, 10);
            }
            abort() {
                this.onabort?.();
            }
        }
        (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = StallThenSucceedXHR;

        const video = new File([new Uint8Array(512)], "clip.mp4", { type: "video/mp4" });
        const res = await uploadFiles(
            [video],
            undefined,
            { _timings: { stallTimeoutMs: 35, processingTimeoutMs: 80, retryDelaysMs: [15, 25], networkWaitMs: 0 } },
        );

        expect(attempts).toBe(2);
        expect(signCalls).toBe(2); // Fetched fresh signature on retry
        expect(res[0].url).toBe("https://res.cloudinary.com/demo/video/upload/recovered.mp4");
    });
});
