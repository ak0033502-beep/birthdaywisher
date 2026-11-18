import "@/lib/netFix";
import { sql } from "@vercel/postgres";

const g = globalThis as unknown as { __bwReviewsReady?: Promise<void> | null };

/** Creates the reviews table (and the newer source / wish_id columns) once per server instance. */
export function ensureReviewsTable(): Promise<void> {
    if (!g.__bwReviewsReady) {
        g.__bwReviewsReady = (async () => {
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
            await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'site'`;
            await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS wish_id VARCHAR(10)`;
            await sql`CREATE UNIQUE INDEX IF NOT EXISTS reviews_wish_source ON reviews (wish_id, source) WHERE wish_id IS NOT NULL`;
        })().catch((e) => { g.__bwReviewsReady = null; throw e; });
    }
    return g.__bwReviewsReady;
}
