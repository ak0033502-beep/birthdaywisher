import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import "@/lib/netFix";
import { ensureAnalytics } from "@/lib/analytics";

/**
 * Public "wishes created" counter. It must only ever go UP.
 * Cached at Vercel CDN edge (30m) + in-memory (5m) so public page visits never keep Neon awake 24/7.
 */
type Counts = { birthday: number; anniversary: number; total: number };
const KEY = "public_wish_counter";
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? Math.floor(x) : 0; };

const gStats = globalThis as unknown as { __bwStatsCache?: { at: number; data: Counts } };

export async function GET() {
    if (gStats.__bwStatsCache && Date.now() - gStats.__bwStatsCache.at < 5 * 60 * 1000) {
        return NextResponse.json(gStats.__bwStatsCache.data, {
            headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=7200" },
        });
    }

    try {
        await ensureAnalytics();
        const { rows } = await sql`
            SELECT
                (SELECT COUNT(*) FILTER (WHERE wish_type IS DISTINCT FROM 'anniversary') FROM wish_ledger) AS lb,
                (SELECT COUNT(*) FILTER (WHERE wish_type = 'anniversary') FROM wish_ledger) AS la,
                (SELECT COUNT(*) FROM wish_ledger) AS lt,
                (SELECT v FROM admin_kv WHERE k = ${KEY}) AS kv
        `;
        const r = rows[0] || {};
        const s = (r.kv || {}) as Partial<Counts>;
        const birthday = Math.max(n(r.lb), n(s.birthday));
        const anniversary = Math.max(n(r.la), n(s.anniversary));
        const total = Math.max(n(r.lt), n(s.total), birthday + anniversary);
        const next: Counts = { birthday, anniversary, total };

        if (birthday !== n(s.birthday) || anniversary !== n(s.anniversary) || total !== n(s.total)) {
            await sql`
                INSERT INTO admin_kv (k, v, updated_at) VALUES (${KEY}, ${JSON.stringify(next)}::jsonb, NOW())
                ON CONFLICT (k) DO UPDATE SET v = jsonb_build_object(
                    'birthday', GREATEST(COALESCE((admin_kv.v->>'birthday')::int, 0), ${birthday}::int),
                    'anniversary', GREATEST(COALESCE((admin_kv.v->>'anniversary')::int, 0), ${anniversary}::int),
                    'total', GREATEST(COALESCE((admin_kv.v->>'total')::int, 0), ${total}::int)
                ), updated_at = NOW()
            `;
        }
        gStats.__bwStatsCache = { at: Date.now(), data: next };
        return NextResponse.json(next, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=7200" } });
    } catch (error) {
        console.error("Error fetching wish stats:", error);
        if (gStats.__bwStatsCache) {
            return NextResponse.json(gStats.__bwStatsCache.data, { headers: { "Cache-Control": "public, s-maxage=300" } });
        }
        return NextResponse.json({ birthday: 0, anniversary: 0, total: 0 }, { headers: { "Cache-Control": "no-store" } });
    }
}
