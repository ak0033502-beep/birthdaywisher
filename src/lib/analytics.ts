/**
 * First-party, privacy-safe analytics (server side).
 *
 * - site_events: anonymous events (no cookies, no IP, no names). `sid` is a random id kept in the
 *   visitor's sessionStorage, so it only links events of one browser tab session.
 * - wish_ledger: permanent metadata about each wish (type, style, blocks...) WITHOUT personal
 *   content, so stats survive the 10-hour self-destruct of the wish itself.
 * - daily_stats: rolled-up totals of events older than 12 months (raw events are then deleted).
 * - admin_kv: small key/value store (e.g. last cleanup run).
 */
import "@/lib/netFix";
import { sql } from "@vercel/postgres";
import { normalizeWish } from "@/lib/wish/migrate";
import { isGame } from "@/blocks/registry";

const g = globalThis as unknown as { __bwAnalyticsReady?: Promise<void> | null };

export function ensureAnalytics(): Promise<void> {
    if (!g.__bwAnalyticsReady) {
        g.__bwAnalyticsReady = (async () => {
            // Fast probe avoids firing 7 CREATE TABLE / CREATE INDEX DDL statements on every cold lambda
            const probe = await sql`
                SELECT to_regclass('public.site_events') AS se,
                       to_regclass('public.wish_ledger') AS wl,
                       to_regclass('public.admin_kv') AS kv
            `;
            if (probe.rows[0]?.se && probe.rows[0]?.wl && probe.rows[0]?.kv) return;

            await Promise.all([
                sql`
                    CREATE TABLE IF NOT EXISTS site_events (
                        id BIGSERIAL PRIMARY KEY,
                        ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        name VARCHAR(40) NOT NULL,
                        path VARCHAR(200),
                        src VARCHAR(30),
                        device VARCHAR(10),
                        browser VARCHAR(20),
                        country VARCHAR(4),
                        sid VARCHAR(20),
                        wish_id VARCHAR(10),
                        props JSONB
                    );
                `,
                sql`
                    CREATE TABLE IF NOT EXISTS wish_ledger (
                        wish_id VARCHAR(10) PRIMARY KEY,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        opened_at TIMESTAMPTZ,
                        deleted_at TIMESTAMPTZ,
                        views INTEGER NOT NULL DEFAULT 0,
                        schema SMALLINT,
                        wish_type VARCHAR(20),
                        style VARCHAR(20),
                        theme VARCHAR(30),
                        language VARCHAR(10),
                        source VARCHAR(40),
                        has_slug BOOLEAN DEFAULT false,
                        blocks TEXT[],
                        games TEXT[],
                        media_count SMALLINT DEFAULT 0,
                        has_voice BOOLEAN DEFAULT false,
                        unlock_scheduled BOOLEAN DEFAULT false
                    );
                `,
                sql`
                    CREATE TABLE IF NOT EXISTS daily_stats (
                        day DATE NOT NULL,
                        name VARCHAR(40) NOT NULL,
                        key VARCHAR(200) NOT NULL DEFAULT '',
                        count INTEGER NOT NULL DEFAULT 0,
                        PRIMARY KEY (day, name, key)
                    );
                `,
                sql`CREATE TABLE IF NOT EXISTS admin_kv (k VARCHAR(60) PRIMARY KEY, v JSONB, updated_at TIMESTAMPTZ DEFAULT NOW());`,
            ]);
            await Promise.all([
                sql`CREATE INDEX IF NOT EXISTS site_events_ts ON site_events (ts);`,
                sql`CREATE INDEX IF NOT EXISTS site_events_name_ts ON site_events (name, ts);`,
                sql`CREATE INDEX IF NOT EXISTS wish_ledger_created ON wish_ledger (created_at);`,
            ]);
        })().catch((e) => { g.__bwAnalyticsReady = null; throw e; });
    }
    return g.__bwAnalyticsReady;
}

/* ---------------- events ---------------- */

/** Allowed event names (anything else is dropped). */
export const EVENT_NAMES = new Set([
    "page_view", "cta_click",
    "wizard_open", "wizard_mode", "wizard_step", "wizard_create_ok", "wizard_create_fail", "upload_fail",
    "share_copy", "share_whatsapp", "share_preview",
    "wish_open", "wish_slide", "wish_gate", "wish_finale", "wish_make_own", "finale_action",
    "game_demo_play", "game_maker_create", "game_candles",
    "review_submit",
    "vault_view", "vault_claim", "vault_post200_click",
    "vitals", "js_error", "api_error",
]);

export interface IncomingEvent {
    name: string;
    path?: string;
    sid?: string;
    wishId?: string;
    props?: Record<string, unknown>;
}

export interface RequestMeta { src: string; device: string; browser: string; country: string }

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);

function cleanProps(p: unknown): Record<string, string | number | boolean> | null {
    if (!p || typeof p !== "object") return null;
    const out: Record<string, string | number | boolean> = {};
    let n = 0;
    for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
        if (n++ >= 12 || !/^[a-zA-Z_]{1,24}$/.test(k)) continue;
        if (typeof v === "string") out[k] = v.slice(0, 300);
        else if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v * 1000) / 1000;
        else if (typeof v === "boolean") out[k] = v;
    }
    return n ? out : null;
}

export async function recordEvents(events: IncomingEvent[], meta: RequestMeta): Promise<number> {
    await ensureAnalytics();
    const rows: Array<{
        name: string;
        path: string | null;
        sid: string | null;
        wish_id: string | null;
        props: Record<string, string | number | boolean> | null;
    }> = [];

    for (const e of events.slice(0, 25)) {
        if (!e || !EVENT_NAMES.has(e.name)) continue;
        const path = clip(e.path, 200)?.split("?")[0] ?? null;
        if (path && (path.startsWith("/admin") || path.startsWith("/api"))) continue;
        const wish_id = typeof e.wishId === "string" && /^[a-f0-9]{6,10}$/.test(e.wishId) ? e.wishId : null;
        const sid = typeof e.sid === "string" && /^[a-z0-9]{6,20}$/i.test(e.sid) ? e.sid : null;
        const props = cleanProps(e.props);
        rows.push({ name: e.name, path, sid, wish_id, props });
    }
    if (!rows.length) return 0;

    // Single atomic multi-row INSERT instead of N sequential round-trips per beacon batch
    await sql`
        INSERT INTO site_events (name, path, src, device, browser, country, sid, wish_id, props)
        SELECT r.name, r.path, ${meta.src}, ${meta.device}, ${meta.browser}, ${meta.country}, r.sid, r.wish_id, r.props
        FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
             AS r(name VARCHAR(40), path VARCHAR(200), sid VARCHAR(20), wish_id VARCHAR(10), props JSONB)
    `;
    return rows.length;
}

/* ---------------- request metadata (no IP stored) ---------------- */

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export function deviceOf(ua: string): string {
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
    if (/mobi|iphone|android/i.test(ua)) return "mobile";
    return "desktop";
}

export function browserOf(ua: string): string {
    if (/edg\//i.test(ua)) return "Edge";
    if (/opr\/|opera/i.test(ua)) return "Opera";
    if (/samsungbrowser/i.test(ua)) return "Samsung";
    if (/instagram/i.test(ua)) return "Instagram";
    if (/fban|fbav/i.test(ua)) return "Facebook";
    if (/chrome|crios/i.test(ua)) return "Chrome";
    if (/firefox|fxios/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua)) return "Safari";
    return "Other";
}

/** Where the visit came from: utm/ref param first, then the referrer host. */
export function sourceOf(referrer: string, utm: string, ownHost: string): string {
    const u = (utm || "").toLowerCase().slice(0, 30);
    if (u) return u;
    if (!referrer) return "direct";
    let host = "";
    try { host = new URL(referrer).hostname.replace(/^www\./, ""); } catch { return "direct"; }
    if (!host || host === ownHost.replace(/^www\./, "")) return "internal";
    if (/chatgpt\.com|openai\.com/.test(host)) return "chatgpt";
    if (/perplexity\.ai/.test(host)) return "perplexity";
    if (/gemini\.google\.com|bard\.google\.com/.test(host)) return "gemini";
    if (/claude\.ai/.test(host)) return "claude";
    if (/copilot\.microsoft\.com/.test(host)) return "copilot";
    if (/google\./.test(host)) return "google";
    if (/bing\.|duckduckgo|yahoo|yandex|ecosia/.test(host)) return "search-other";
    if (/whatsapp|wa\.me/.test(host)) return "whatsapp";
    if (/instagram/.test(host)) return "instagram";
    if (/facebook|fb\.com|m\.facebook/.test(host)) return "facebook";
    if (/t\.co|twitter|x\.com/.test(host)) return "x";
    if (/youtube/.test(host)) return "youtube";
    if (/reddit/.test(host)) return "reddit";
    if (/pinterest/.test(host)) return "pinterest";
    if (/telegram|t\.me/.test(host)) return "telegram";
    return host.slice(0, 30);
}

/* ---------------- wish ledger (no personal content) ---------------- */

export async function ledgerWishCreated(id: string, raw: unknown, hasSlug: boolean): Promise<void> {
    try {
        await ensureAnalytics();
        const { v1, v2 } = normalizeWish(raw);
        const isV2 = !!raw && typeof raw === "object" && (raw as { schemaVersion?: number }).schemaVersion === 2;
        const blocks = v2.blocks.map((b) => b.type);
        const games = blocks.filter((t) => isGame(t));
        const extra = (v2.meta?.extra ?? {}) as Record<string, unknown>;
        const source = typeof extra.source === "string" ? extra.source.slice(0, 40) : isV2 ? "wizard2" : "classic";
        const mediaCount = Array.isArray(v1.mediaItems) ? v1.mediaItems.length : v1.mediaUrl ? 1 : 0;
        await sql`
            INSERT INTO wish_ledger (wish_id, schema, wish_type, style, theme, language, source, has_slug, blocks, games, media_count, has_voice, unlock_scheduled)
            VALUES (${id}, ${isV2 ? 2 : 1}, ${v2.wishType}, ${(v2.look.presentationStyle || "cinematic").slice(0, 20)}, ${(v2.look.theme || "").slice(0, 30)},
                    ${(v2.look.language || "en").slice(0, 10)}, ${source}, ${hasSlug}, ${blocks as unknown as string}, ${games as unknown as string},
                    ${Math.min(mediaCount, 999)}, ${!!v1.audioUrl}, ${!!v2.unlock.date})
            ON CONFLICT (wish_id) DO NOTHING
        `;
    } catch (e) {
        console.error("ledgerWishCreated failed", e);
    }
}

export async function ledgerWishViewed(id: string, firstOpen: boolean): Promise<void> {
    try {
        await ensureAnalytics();
        if (firstOpen) await sql`UPDATE wish_ledger SET views = views + 1, opened_at = COALESCE(opened_at, NOW()) WHERE wish_id = ${id}`;
        else await sql`UPDATE wish_ledger SET views = views + 1 WHERE wish_id = ${id}`;
    } catch (e) {
        console.error("ledgerWishViewed failed", e);
    }
}

export async function ledgerWishDeleted(id: string): Promise<void> {
    try {
        await ensureAnalytics();
        await sql`UPDATE wish_ledger SET deleted_at = NOW() WHERE wish_id = ${id} AND deleted_at IS NULL`;
    } catch (e) {
        console.error("ledgerWishDeleted failed", e);
    }
}

/* ---------------- retention + kv ---------------- */

/** Roll raw events older than 12 months into daily totals, then delete them. */
export async function rollupAndPrune(): Promise<number> {
    await ensureAnalytics();
    await sql`
        INSERT INTO daily_stats (day, name, key, count)
        SELECT ts::date, name, COALESCE(path, ''), COUNT(*)::int FROM site_events
        WHERE ts < NOW() - INTERVAL '365 days'
        GROUP BY 1, 2, 3
        ON CONFLICT (day, name, key) DO UPDATE SET count = daily_stats.count + EXCLUDED.count
    `;
    const { rowCount } = await sql`DELETE FROM site_events WHERE ts < NOW() - INTERVAL '365 days'`;
    return rowCount ?? 0;
}

export async function kvSet(k: string, v: unknown): Promise<void> {
    await ensureAnalytics();
    await sql`INSERT INTO admin_kv (k, v, updated_at) VALUES (${k}, ${JSON.stringify(v)}::jsonb, NOW()) ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = NOW()`;
}

export async function kvGet<T = unknown>(k: string): Promise<{ v: T; updated_at: string } | null> {
    await ensureAnalytics();
    const { rows } = await sql`SELECT v, updated_at FROM admin_kv WHERE k = ${k}`;
    return rows.length ? { v: rows[0].v as T, updated_at: String(rows[0].updated_at) } : null;
}
