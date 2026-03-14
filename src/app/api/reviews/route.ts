import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Ensure reviews table exists
async function ensureReviewsTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            message TEXT NOT NULL,
            relationship VARCHAR(50) DEFAULT 'Friend',
            approved BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
}

// GET - Fetch approved reviews
export async function GET() {
    try {
        await ensureReviewsTable();
        const { rows } = await sql`
            SELECT id, name, rating, message, relationship, created_at
            FROM reviews
            WHERE approved = true
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
        const body = await req.json();
        const { name, rating, message, relationship } = body;

        // Validate
        if (!name || !message || !rating) {
            return NextResponse.json(
                { error: "Name, rating, and message are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        if (name.length > 100 || message.length > 500) {
            return NextResponse.json(
                { error: "Name or message too long" },
                { status: 400 }
            );
        }

        await sql`
            INSERT INTO reviews (name, rating, message, relationship)
            VALUES (${name.trim()}, ${rating}, ${message.trim()}, ${(relationship || 'Friend').trim()})
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving review:", error);
        return NextResponse.json(
            { error: "Failed to save review" },
            { status: 500 }
        );
    }
}
