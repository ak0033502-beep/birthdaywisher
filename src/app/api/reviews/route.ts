import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { ensureReviewsTable, getPublicReviews } from "@/lib/reviews";

/**
 * Reviews come from 3 places:
 *  - "site"      : the "Leave a review" button on the homepage
 *  - "creator"   : popup right after someone creates a wish
 *  - "recipient" : asked at the very end of a wish (after the Grand Finale)
 *
 * Positive reviews (4–5) show automatically on the homepage:
 *  - Written reviews render as full quote cards (and Review JSON-LD)
 *  - Quick 1-tap emoji ratings render in the live Recent Ratings strip
 *  - All non-spam reviews count honestly in AggregateRating & total count.
 */

const SOURCES = new Set(["site", "creator", "recipient"]);
const DEFAULT_NAME: Record<string, string> = {
    site: "Happy user",
    creator: "A happy creator",
    recipient: "A birthday star",
};

// GET - Fetch approved reviews + quick ratings + aggregate stats (homepage)
export async function GET() {
    const summary = await getPublicReviews();
    return NextResponse.json(summary, {
        headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" },
    });
}

// POST - Submit a new review
export async function POST(req: Request) {
    try {
        await ensureReviewsTable();
        const body = await req.json().catch(() => ({}));
        const source = typeof body.source === "string" && SOURCES.has(body.source) ? body.source : "site";
        const rating = Math.round(Number(body.rating));
        const name = (typeof body.name === "string" ? body.name : "").trim().slice(0, 100) || DEFAULT_NAME[source];
        const message = (typeof body.message === "string" ? body.message : "").trim();
        const relationship =
            (typeof body.relationship === "string" ? body.relationship : "").trim().slice(0, 50) ||
            (source === "recipient" ? "Recipient" : "Friend");
        const wishId = typeof body.wishId === "string" && /^[a-f0-9]{6,10}$/.test(body.wishId) ? body.wishId : null;

        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Please pick a rating" }, { status: 400 });
        }
        // The homepage form requires a name + message
        if (source === "site" && (!body.name || !message)) {
            return NextResponse.json({ error: "Name, rating, and message are required" }, { status: 400 });
        }
        if (message.length > 500) {
            return NextResponse.json({ error: "Message too long" }, { status: 400 });
        }
        if (/https?:\/\/|www\./i.test(message + " " + name)) {
            return NextResponse.json({ error: "Links are not allowed in reviews" }, { status: 400 });
        }

        // Auto-show all genuine 4–5 ratings (both written cards and 1-tap ratings); admin can hide spam anytime
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
