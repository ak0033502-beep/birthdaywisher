import { NextResponse } from "next/server";
import { saveAnalyticsEvent, getWishAnalytics } from "@/lib/db";
import { checkMemoryRateLimit, getTrustedIp, isSameOriginRequest } from "@/lib/security";

// POST - Track an analytics event (for classic v1 wishes)
export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const ip = getTrustedIp(req);
    if (!checkMemoryRateLimit(`wish_ev:${ip}`, 90, 60 * 1000)) {
        return NextResponse.json({ error: "Too many events" }, { status: 429 });
    }

    try {
        const raw = await req.text();
        if (raw.length > 2048) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413 });
        }
        const { wishId, eventType, sectionName, timeSpentMs } = JSON.parse(raw) as {
            wishId?: unknown;
            eventType?: unknown;
            sectionName?: unknown;
            timeSpentMs?: unknown;
        };

        if (
            typeof wishId !== "string" ||
            !/^[a-f0-9]{6,10}$/.test(wishId) ||
            typeof eventType !== "string" ||
            !/^[a-zA-Z0-9_-]{1,40}$/.test(eventType)
        ) {
            return NextResponse.json({ error: "Invalid wishId or eventType" }, { status: 400 });
        }

        const cleanSection = typeof sectionName === "string" ? sectionName.replace(/[\u0000-\u001f<>]/g, "").slice(0, 80) : undefined;
        const cleanTime = typeof timeSpentMs === "number" && Number.isFinite(timeSpentMs)
            ? Math.max(0, Math.min(600_000, Math.round(timeSpentMs)))
            : 0;

        await saveAnalyticsEvent(wishId, eventType, cleanSection, cleanTime);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics POST error:", error);
        return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
    }
}

// GET - Fetch analytics for a wish (creator only; prefers x-creator-token header over URL query param)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wishId = searchParams.get("wishId") || "";
    const token = (req.headers.get("x-creator-token") || searchParams.get("token") || "").trim();

    if (!/^[a-f0-9]{6,10}$/.test(wishId) || !/^[a-f0-9]{32,128}$/.test(token)) {
        return NextResponse.json({ error: "wishId and valid token required" }, { status: 400 });
    }

    const analytics = await getWishAnalytics(wishId, token);
    if (!analytics) {
        return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(analytics, { headers: { "Cache-Control": "private, no-store" } });
}
