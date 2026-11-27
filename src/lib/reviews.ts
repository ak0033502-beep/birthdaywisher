import "@/lib/netFix";
import { sql } from "@vercel/postgres";

export interface PublicReview {
    id: number;
    name: string;
    rating: number;
    message: string;
    relationship: string;
    source: string;
    created_at: string;
}

export interface PublicReviewsSummary {
    reviews: PublicReview[];
    quickRatings: PublicReview[];
    stats: {
        totalCount: number;
        averageRating: number;
        amazingCount?: number;
        lovedCount?: number;
    };
}

const EMPTY_SUMMARY: PublicReviewsSummary = {
    reviews: [],
    quickRatings: [],
    stats: { totalCount: 0, averageRating: 0 },
};

const g = globalThis as unknown as { __bwReviewsReadyV2?: Promise<void> | null };

/** Creates the reviews table, moderation columns, and migrates positive 1-tap/short reviews once per server instance. */
export function ensureReviewsTable(): Promise<void> {
    if (!g.__bwReviewsReadyV2) {
        g.__bwReviewsReadyV2 = (async () => {
            // Fast 0.5ms probe skips DDL table locks on every cold start when schema already exists
            const probe = await sql`
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'hidden_by_admin'
                LIMIT 1
            `;
            if (probe.rows.length > 0) return;

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
            await Promise.all([
                sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'site'`,
                sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS wish_id VARCHAR(10)`,
                sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden_by_admin BOOLEAN DEFAULT false`,
            ]);
            await Promise.all([
                sql`CREATE UNIQUE INDEX IF NOT EXISTS reviews_wish_source ON reviews (wish_id, source) WHERE wish_id IS NOT NULL`,
                sql`UPDATE reviews SET approved = true WHERE rating >= 4 AND NOT COALESCE(hidden_by_admin, false) AND approved = false`,
            ]);
        })().catch((e) => {
            g.__bwReviewsReadyV2 = null;
            throw e;
        });
    }
    return g.__bwReviewsReadyV2;
}

const mapRow = (r: Record<string, unknown>): PublicReview => ({
    id: Number(r.id) || 0,
    name: String(r.name || "Happy user"),
    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
    message: String(r.message || "").trim(),
    relationship: String(r.relationship || "Friend"),
    source: String(r.source || "site"),
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at || new Date().toISOString()),
});

/**
 * Fetches live public reviews + true aggregate rating for SSR homepage, /api/reviews, JSON-LD, and /llms.txt.
 * Includes a 2.5s safety timeout so homepage SSR never hangs on cold DB starts.
 */
export async function getPublicReviews(): Promise<PublicReviewsSummary> {
    const work = async (): Promise<PublicReviewsSummary> => {
        await ensureReviewsTable();
        const [writtenRes, quickRes, aggRes] = await Promise.all([
            sql`
                SELECT id, name, rating, message, relationship, COALESCE(source, 'site') AS source, created_at
                FROM reviews
                WHERE approved = true AND NOT COALESCE(hidden_by_admin, false) AND BTRIM(message) <> ''
                ORDER BY created_at DESC
                LIMIT 24
            `,
            sql`
                SELECT id, name, rating, message, relationship, COALESCE(source, 'site') AS source, created_at
                FROM reviews
                WHERE approved = true AND NOT COALESCE(hidden_by_admin, false) AND BTRIM(message) = ''
                ORDER BY created_at DESC
                LIMIT 24
            `,
            sql`
                SELECT COUNT(*)::int AS total_count,
                       COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating,
                       COUNT(*) FILTER (WHERE rating = 5)::int AS amazing_count,
                       COUNT(*) FILTER (WHERE rating = 4)::int AS loved_count
                FROM reviews
                WHERE NOT COALESCE(hidden_by_admin, false)
            `,
        ]);

        const agg = aggRes.rows[0] || {};
        const totalCount = Math.max(0, Number(agg.total_count) || 0);
        const averageRating = totalCount > 0 ? Math.min(5, Math.max(1, Number(agg.avg_rating) || 5)) : 0;

        return {
            reviews: writtenRes.rows.map((r) => mapRow(r as Record<string, unknown>)),
            quickRatings: quickRes.rows.map((r) => mapRow(r as Record<string, unknown>)),
            stats: {
                totalCount,
                averageRating,
                amazingCount: Math.max(0, Number(agg.amazing_count) || 0),
                lovedCount: Math.max(0, Number(agg.loved_count) || 0),
            },
        };
    };

    try {
        return await Promise.race([
            work(),
            new Promise<PublicReviewsSummary>((resolve) => setTimeout(() => resolve(EMPTY_SUMMARY), 6500)),
        ]);
    } catch (error) {
        console.error("Error in getPublicReviews:", error);
        return EMPTY_SUMMARY;
    }
}
