import { NextResponse } from "next/server";
import { saveAnalyticsEvent, getWishAnalytics } from "@/lib/db";

// POST - Track an analytics event
export async function POST(req: Request) {
    try {
        const { wishId, eventType, sectionName, timeSpentMs } = await req.json();

        if (!wishId || !eventType) {
            return NextResponse.json({ error: "wishId and eventType required" }, { status: 400 });
        }

        await saveAnalyticsEvent(wishId, eventType, sectionName, timeSpentMs);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics POST error:", error);
        return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
    }
}

// GET - Fetch analytics for a wish (creator only)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wishId = searchParams.get("wishId");
    const token = searchParams.get("token");

    if (!wishId || !token) {
        return NextResponse.json({ error: "wishId and token required" }, { status: 400 });
    }

    const analytics = await getWishAnalytics(wishId, token);
    if (!analytics) {
        return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(analytics);
}
