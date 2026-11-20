import { NextResponse } from "next/server";
import { InvalidSlugError, saveWish, SlugTakenError } from "@/lib/db";
import { checkPersistentRateLimit, getTrustedIp, isAllowedMediaUrl, isSameOriginRequest } from "@/lib/security";
import { appendCreatorWishCookieValue, creatorCookieOptions } from "@/lib/creatorPreview";

const MAX_WISH_JSON_BYTES = 200_000;

function hasOnlySafeMediaUrls(body: Record<string, unknown>): boolean {
    // Check v1 media fields
    if (!isAllowedMediaUrl(body.mediaUrl)) return false;
    if (!isAllowedMediaUrl(body.audioUrl)) return false;
    if (!isAllowedMediaUrl(body.puzzleImageUrl)) return false;
    if (Array.isArray(body.mediaItems)) {
        if (body.mediaItems.length > 20) return false;
        for (const item of body.mediaItems) {
            if (!item || typeof item !== "object") return false;
            if (!isAllowedMediaUrl((item as { url?: unknown }).url)) return false;
        }
    }

    // Check v2 block media fields
    if (Array.isArray(body.blocks)) {
        for (const block of body.blocks) {
            if (!block || typeof block !== "object") return false;
            const b = block as { type?: unknown; config?: Record<string, unknown> };
            const cfg = b.config || {};
            if (b.type === "photos" && Array.isArray(cfg.items)) {
                if (cfg.items.length > 20) return false;
                for (const m of cfg.items) {
                    if (!m || typeof m !== "object" || !isAllowedMediaUrl((m as { url?: unknown }).url)) return false;
                }
            } else if (b.type === "voice" && !isAllowedMediaUrl(cfg.audioUrl)) {
                return false;
            } else if (b.type === "puzzle" && !isAllowedMediaUrl(cfg.imageUrl)) {
                return false;
            }
        }
    }
    return true;
}

export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const ip = getTrustedIp(req);
    const rl = await checkPersistentRateLimit("wish_create", ip, 12, 10 * 60 * 1000);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "You've created several wishes very quickly. Please wait a minute and try again." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
    }

    try {
        const rawText = await req.text();
        if (!rawText || rawText.length > MAX_WISH_JSON_BYTES) {
            return NextResponse.json({ error: "Wish data is too large or empty" }, { status: 413 });
        }

        const body = JSON.parse(rawText) as Record<string, unknown>;
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid wish data" }, { status: 400 });
        }

        if (body.schemaVersion === 2) {
            const recipient = body.recipient as { name?: unknown } | undefined;
            const okShape =
                Array.isArray(body.blocks) &&
                body.blocks.length <= 40 &&
                !!recipient &&
                typeof recipient.name === "string" &&
                recipient.name.trim().length > 0 &&
                recipient.name.trim().length <= 120;
            if (!okShape) {
                return NextResponse.json({ error: "Invalid wish data" }, { status: 400 });
            }
        } else {
            // Legacy v1 basic validation
            const targetName = typeof body.targetName === "string" ? body.targetName.trim() : "";
            if (!targetName || targetName.length > 120) {
                return NextResponse.json({ error: "Recipient name is required" }, { status: 400 });
            }
        }

        if (!hasOnlySafeMediaUrls(body)) {
            return NextResponse.json({ error: "Invalid media URL detected" }, { status: 400 });
        }

        const result = await saveWish(body as unknown as Parameters<typeof saveWish>[0]);
        const cookieVal = appendCreatorWishCookieValue(req.headers.get("cookie"), result.id);
        const res = NextResponse.json({ id: result.id, creatorToken: result.creatorToken });
        res.cookies.set({ ...creatorCookieOptions(), value: cookieVal });
        return res;
    } catch (error) {
        if (error instanceof SlugTakenError) {
            return NextResponse.json({ error: "This custom link was just taken. Please choose another one." }, { status: 409 });
        }
        if (error instanceof InvalidSlugError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error creating wish:", error);
        return NextResponse.json({ error: "Failed to create wish" }, { status: 500 });
    }
}
