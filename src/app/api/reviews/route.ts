import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureReviewsTable } from "@/lib/reviews";

/**
 * Reviews come from 3 places:
 *  - "site"      : the "Leave a review" button on the homepage
 *  - "creator"   : popup right after someone creates a wish
 *  - "recipient" : asked at the very end of a wish (after the Grand Finale)
 * Only good reviews with a real message are shown on the homepage automatically;
 * everything else is kept for the admin (rating stats + feedback to improve).
 */

const SOURCES = new Set(["site", "creator", "recipient"]);
const DEFAULT_NAME: Record<string, string> = { site: "Happy user", creator: "A happy creator", recipient: "A birthday star" };

// GET - Fetch approved reviews (homepage)
export async function GET() {
    try {
        await ensureReviewsTable();
        const { rows } = await sql`
            SELECT id, name, rating, message, relationship, source, created_at
            FROM reviews
            WHERE approved = true AND message <> ''
            ORDER BY created_at DESC
            LIMIT 20
        `;
        return NextResponse.json({ reviews: rows });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ reviews: [] });
    }
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
        const relationship = (typeof body.relationship === "string" ? body.relationship : "").trim().slice(0, 50) || (source === "recipient" ? "Recipient" : "Friend");
        const wishId = typeof body.wishId === "string" && /^[a-f0-9]{6,10}$/.test(body.wishId) ? body.wishId : null;

        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Please pick a rating" }, { status: 400 });
        }
        // The homepage form still requires a name + message
        if (source === "site" && (!body.name || !message)) {
            return NextResponse.json({ error: "Name, rating, and message are required" }, { status: 400 });
        }
        if (message.length > 500) {
            return NextResponse.json({ error: "Message too long" }, { status: 400 });
        }
        if (/https?:\/\/|www\./i.test(message + " " + name)) {
            return NextResponse.json({ error: "Links are not allowed in reviews" }, { status: 400 });
        }

        // Auto-show on homepage only when it is a positive review with a real message (admin can change it)
        const approved = rating >= 4 && message.length >= 8;

        await sql`
            INSERT INTO reviews (name, rating, message, relationship, approved, source, wish_id)
            VALUES (${name}, ${rating}, ${message}, ${relationship}, ${approved}, ${source}, ${wishId})
            ON CONFLICT DO NOTHING
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving review:", error);
        return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }
}
