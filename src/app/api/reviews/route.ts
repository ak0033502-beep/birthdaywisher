import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { ensureReviewsTable, getPublicReviews } from "@/lib/reviews";
import { checkPersistentRateLimit, getTrustedIp, isSameOriginRequest } from "@/lib/security";

const SOURCES = new Set(["site", "creator", "recipient", "cuppy"]);
const DEFAULT_NAME: Record<string, string> = {
    site: "Happy user",
    creator: "A happy creator",
    recipient: "A birthday star",
    cuppy: "Cuppy AI user",
};

// Strip angle brackets & non-printable control characters to prevent script/HTML injection
const cleanText = (v: unknown, maxLen: number): string =>
    (typeof v === "string" ? v : "")
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, "")
        .trim()
        .slice(0, maxLen);

// GET - Fetch approved reviews + quick ratings + aggregate stats (homepage)
export async function GET() {
    const summary = await getPublicReviews();
    return NextResponse.json(summary, {
        headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=7200" },
    });
}

// POST - Submit a new review
export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const ip = getTrustedIp(req);
    const rl = await checkPersistentRateLimit("review_post", ip, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Too many reviews submitted recently. Please try again later." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
    }

    try {
        await ensureReviewsTable();
        const raw = await req.text();
        if (raw.length > 4096) {
            return NextResponse.json({ error: "Review payload too large" }, { status: 413 });
        }
        const body = JSON.parse(raw) as Record<string, unknown>;
        const source = typeof body.source === "string" && SOURCES.has(body.source) ? body.source : "site";
        const rating = Math.round(Number(body.rating));
        const rawName = cleanText(body.name, 100);
        const name = rawName || DEFAULT_NAME[source];
        const message = cleanText(body.message, 500);
        const relationship = cleanText(body.relationship, 50) || (source === "recipient" ? "Recipient" : "Friend");
        const wishId = typeof body.wishId === "string" && /^[a-f0-9]{6,10}$/.test(body.wishId) ? body.wishId : null;

        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Please pick a rating" }, { status: 400 });
        }
        if (source === "site" && (!rawName || !message)) {
            return NextResponse.json({ error: "Name, rating, and message are required" }, { status: 400 });
        }
        if (/https?:\/\/|www\./i.test(message + " " + name)) {
            return NextResponse.json({ error: "Links are not allowed in reviews" }, { status: 400 });
        }

        const approved = rating >= 4;

        await sql`
            INSERT INTO reviews (name, rating, message, relationship, approved, hidden_by_admin, source, wish_id)
            VALUES (${name}, ${rating}, ${message}, ${relationship}, ${approved}, false, ${source}, ${wishId})
            ON CONFLICT DO NOTHING
        `;

        try {
            revalidatePath("/");
            revalidatePath("/llms.txt");
            revalidatePath("/admin");
        } catch {
            /* ignore outside request revalidation edge cases */
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving review:", error);
        return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }
}
