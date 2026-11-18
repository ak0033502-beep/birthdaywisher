import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import "@/lib/netFix";
import { ensureAnalytics } from "@/lib/analytics";

export const revalidate = 0; // No cache — always fresh

/**
 * Public "wishes created" counter. It must only ever go UP.
 *
 * Wishes self-destruct (10 h after opening / 8 days unopened), so counting rows in `wishes`
 * made the number drop every day. Instead we take the highest of:
 *  - wish_ledger: permanent, content-free row per wish (survives deletion)
 *  - wishes: live rows (covers very old wishes created before the ledger existed)
 *  - the stored high-water mark in admin_kv (never lowered)
 * and save the result back as the new high-water mark.
 */
type Counts = { birthday: number; anniversary: number; total: number };
const KEY = "public_wish_counter";
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? Math.floor(x) : 0; };

export async function GET() {
    try {
        await ensureAnalytics();
        const [ledger, live, stored] = await Promise.all([
            sql`SELECT COUNT(*) FILTER (WHERE wish_type IS DISTINCT FROM 'anniversary') b,
                       COUNT(*) FILTER (WHERE wish_type = 'anniversary') a, COUNT(*) t FROM wish_ledger`,
            sql`SELECT COUNT(*) FILTER (WHERE data->>'wishType' IS DISTINCT FROM 'anniversary') b,
                       COUNT(*) FILTER (WHERE data->>'wishType' = 'anniversary') a, COUNT(*) t FROM wishes`,
            sql`SELECT v FROM admin_kv WHERE k = ${KEY}`,
        ]);
        const l = ledger.rows[0] || {}, w = live.rows[0] || {};
        const s = (stored.rows[0]?.v || {}) as Partial<Counts>;
        const birthday = Math.max(n(l.b), n(w.b), n(s.birthday));
        const anniversary = Math.max(n(l.a), n(w.a), n(s.anniversary));
        const total = Math.max(n(l.t), n(w.t), n(s.total), birthday + anniversary);
        const next: Counts = { birthday, anniversary, total };

        if (birthday !== n(s.birthday) || anniversary !== n(s.anniversary) || total !== n(s.total)) {
            // GREATEST() in SQL too, so two parallel requests can never lower the stored value
            await sql`
                INSERT INTO admin_kv (k, v, updated_at) VALUES (${KEY}, ${JSON.stringify(next)}::jsonb, NOW())
                ON CONFLICT (k) DO UPDATE SET v = jsonb_build_object(
                    'birthday', GREATEST(COALESCE((admin_kv.v->>'birthday')::int, 0), ${birthday}::int),
                    'anniversary', GREATEST(COALESCE((admin_kv.v->>'anniversary')::int, 0), ${anniversary}::int),
                    'total', GREATEST(COALESCE((admin_kv.v->>'total')::int, 0), ${total}::int)
                ), updated_at = NOW()
            `;
        }
        return NextResponse.json(next, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
    } catch (error) {
        console.error("Error fetching wish stats:", error);
        return NextResponse.json({ birthday: 0, anniversary: 0, total: 0 }, { headers: { "Cache-Control": "no-store" } });
    }
}
