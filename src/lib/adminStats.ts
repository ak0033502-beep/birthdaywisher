/**
 * Admin dashboard queries. Read-only except: ensureAnalytics() (creates tables if missing) and
 * backfillLedger() (adds anonymous metadata rows for wishes that existed before the ledger).
 */
import "@/lib/netFix";
import { sql } from "@vercel/postgres";
import { v2 as cloudinary } from "cloudinary";
import { ensureAnalytics, kvGet, ledgerWishCreated } from "@/lib/analytics";
import { ensureReviewsTable } from "@/lib/reviews";
import { ensureDb } from "@/lib/db";
import { VAULT_FREE_LIMIT } from "@/lib/vaultPricing";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

type Row = Record<string, unknown>;
export type Count = { key: string; n: number };
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v) || 0);
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/* Run at most 6 queries at a time (the serverless driver times out with dozens of parallel requests)
   and retry once on a connection error. */
let active = 0;
const waiting: Array<() => void> = [];
async function limited<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= 6) await new Promise<void>((r) => waiting.push(r));
    active++;
    try { return await fn(); } finally { active--; waiting.shift()?.(); }
}
async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
        try { return await limited(fn); } catch (e) {
            const conn = /fetch failed|connect|timeout/i.test(String((e as Error)?.message || e));
            if (attempt === 0 && conn) continue;
            console.error(`[admin] ${label} failed:`, (e as Error)?.message || e);
            return fallback;
        }
    }
    return fallback;
}
const counts = (rows: Row[], k = "key", n = "n"): Count[] => rows.map((r) => ({ key: str(r[k]) || "(none)", n: num(r[n]) }));

const gBackfill = globalThis as unknown as { __bwBackfillAt?: number };

/** Add ledger rows for wishes created before the ledger existed (max 500 per call, cached 10 min). */
export async function backfillLedger(): Promise<number> {
    if (gBackfill.__bwBackfillAt && Date.now() - gBackfill.__bwBackfillAt < 10 * 60 * 1000) return 0;
    await ensureAnalytics();
    const { rows } = await limited(() => sql`
        SELECT w.id, w.data, w.custom_slug, w.created_at, w.opened_at, w.view_count FROM wishes w
        LEFT JOIN wish_ledger l ON l.wish_id = w.id WHERE l.wish_id IS NULL LIMIT 500`);
    for (const r of rows) {
        await ledgerWishCreated(r.id, r.data, !!r.custom_slug);
        await limited(() => sql`UPDATE wish_ledger SET created_at = ${r.created_at}, opened_at = ${r.opened_at}, views = ${num(r.view_count)} WHERE wish_id = ${r.id}`);
    }
    gBackfill.__bwBackfillAt = Date.now();
    return rows.length;
}

/* ======================= 1. Overview ======================= */
export async function getOverview(days: number) {
    const [cur, prev, visitors, prevVisitors, series, allTime, types] = await Promise.all([
        safe(() => sql`SELECT COUNT(*) n, COUNT(opened_at) opened, COALESCE(AVG(views),0) views,
                 PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (opened_at - created_at))) FILTER (WHERE opened_at IS NOT NULL) open_secs
                 FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "overview.cur"),
        safe(() => sql`SELECT COUNT(*) n, COUNT(opened_at) opened FROM wish_ledger
                 WHERE created_at <= NOW() - (${days}::int * INTERVAL '1 day') AND created_at > NOW() - (${days * 2}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "overview.prev"),
        safe(() => sql`SELECT COUNT(DISTINCT sid) v, COUNT(*) pv FROM site_events WHERE name = 'page_view' AND ts > NOW() - (${days}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "overview.visitors"),
        safe(() => sql`SELECT COUNT(DISTINCT sid) v FROM site_events WHERE name = 'page_view'
                 AND ts <= NOW() - (${days}::int * INTERVAL '1 day') AND ts > NOW() - (${days * 2}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "overview.prevVisitors"),
        safe(() => sql`WITH d AS (
                   SELECT generate_series(
                     ((NOW() AT TIME ZONE 'Asia/Kolkata')::date - (${days - 1}::int * INTERVAL '1 day'))::date,
                     (NOW() AT TIME ZONE 'Asia/Kolkata')::date,
                     '1 day'
                   )::date AS day
                 )
                 SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
                   (SELECT COUNT(*) FROM wish_ledger l WHERE (l.created_at AT TIME ZONE 'Asia/Kolkata')::date = d.day) created,
                   (SELECT COUNT(*) FROM wish_ledger l WHERE (l.opened_at AT TIME ZONE 'Asia/Kolkata')::date = d.day) opened,
                   (SELECT COUNT(DISTINCT sid) FROM site_events e WHERE e.name = 'page_view' AND (e.ts AT TIME ZONE 'Asia/Kolkata')::date = d.day) visitors
                 FROM d ORDER BY d.day`, { rows: [] as Row[] } as never, "overview.series"),
        safe(() => sql`SELECT COUNT(*) n, COUNT(opened_at) opened, MIN(created_at) since FROM wish_ledger`, { rows: [] as Row[] } as never, "overview.allTime"),
        safe(() => sql`SELECT COALESCE(wish_type,'birthday') key, COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "overview.types"),
    ]);
    const c = cur.rows[0] || {}, p = prev.rows[0] || {}, v = visitors.rows[0] || {}, pv = prevVisitors.rows[0] || {}, a = allTime.rows[0] || {};
    return {
        created: num(c.n), createdPrev: num(p.n),
        opened: num(c.opened), openRate: num(c.n) ? num(c.opened) / num(c.n) : 0,
        openRatePrev: num(p.n) ? num(p.opened) / num(p.n) : 0,
        avgViews: num(c.views), medianOpenSecs: num(c.open_secs),
        visitors: num(v.v), visitorsPrev: num(pv.v), pageviews: num(v.pv),
        allTimeCreated: num(a.n), allTimeOpened: num(a.opened), trackingSince: a.since ? str(a.since) : "",
        types: counts(types.rows),
        series: series.rows.map((r) => ({ day: str(r.day).slice(0, 10), created: num(r.created), opened: num(r.opened), visitors: num(r.visitors) })),
    };
}

/* ======================= 2. Funnel ======================= */
export async function getFunnel(days: number) {
    const r = await safe(() => sql`
        WITH e AS (SELECT name, sid, src, props FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') AND sid IS NOT NULL)
        SELECT
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name = 'page_view') visitors,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name = 'cta_click') cta,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name = 'wizard_open') wizard_open,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name = 'wizard_step' AND props->>'step' = 'name') named,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name = 'wizard_step' AND props->>'step' = 'review') review,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name IN ('wizard_create_ok','game_maker_create')) created,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE name IN ('share_copy','share_whatsapp')) shared,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE src = 'wish' AND name = 'page_view') viral_visitors,
          (SELECT COUNT(DISTINCT sid) FROM e WHERE src = 'wish' AND name IN ('wizard_create_ok','game_maker_create')) viral_created
    `, { rows: [] as Row[] } as never, "funnel");
    const rec = await safe(() => sql`
        WITH e AS (SELECT name, sid, wish_id FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') AND wish_id IS NOT NULL)
        SELECT COUNT(DISTINCT wish_id) FILTER (WHERE name = 'wish_open') wishes_opened,
               COUNT(DISTINCT (sid, wish_id)) FILTER (WHERE name = 'wish_open') opens,
               COUNT(DISTINCT (sid, wish_id)) FILTER (WHERE name = 'wish_finale') finales,
               COUNT(*) FILTER (WHERE name = 'wish_make_own') make_own
        FROM e`, { rows: [] as Row[] } as never, "funnel.recipient");
    const created = await safe(() => sql`SELECT COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "funnel.created");
    const x = r.rows[0] || {}, y = rec.rows[0] || {};
    return {
        steps: [
            { key: "Visited the site", n: num(x.visitors) },
            { key: "Clicked a Create button", n: num(x.cta) },
            { key: "Opened the wizard", n: num(x.wizard_open) },
            { key: "Typed a name", n: num(x.named) },
            { key: "Reached Review", n: num(x.review) },
            { key: "Created a wish", n: num(x.created) },
            { key: "Shared (copy / WhatsApp)", n: num(x.shared) },
        ],
        recipient: {
            wishesCreated: num(created.rows[0]?.n), wishesOpened: num(y.wishes_opened), opens: num(y.opens),
            finales: num(y.finales), makeOwn: num(y.make_own),
        },
        viral: { visitors: num(x.viral_visitors), created: num(x.viral_created) },
    };
}

/* ======================= 3. Wizard ======================= */
export async function getWizard(days: number) {
    const [steps, modes, secs, fails, uploads, style, theme, lang, blocks, games, src, flags] = await Promise.all([
        safe(() => sql`SELECT props->>'step' key, COUNT(DISTINCT sid) n, AVG((props->>'idx')::int) pos FROM site_events
                 WHERE name = 'wizard_step' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY pos, n DESC`, { rows: [] as Row[] } as never, "wizard.steps"),
        safe(() => sql`SELECT props->>'mode' key, COUNT(DISTINCT sid) n FROM site_events WHERE name = 'wizard_mode' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "wizard.modes"),
        safe(() => sql`SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (props->>'secs')::float) med, COUNT(*) n FROM site_events
                 WHERE name = 'wizard_create_ok' AND ts > NOW() - (${days}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "wizard.secs"),
        safe(() => sql`SELECT props->>'reason' key, COUNT(*) n FROM site_events WHERE name = 'wizard_create_fail' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, { rows: [] as Row[] } as never, "wizard.fails"),
        safe(() => sql`SELECT props->>'reason' key, COUNT(*) n FROM site_events WHERE name = 'upload_fail' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, { rows: [] as Row[] } as never, "wizard.uploads"),
        safe(() => sql`SELECT style key, COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "wizard.style"),
        safe(() => sql`SELECT theme key, COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 12`, { rows: [] as Row[] } as never, "wizard.theme"),
        safe(() => sql`SELECT language key, COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 12`, { rows: [] as Row[] } as never, "wizard.lang"),
        safe(() => sql`SELECT b key, COUNT(*) n FROM wish_ledger, UNNEST(blocks) b WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "wizard.blocks"),
        safe(() => sql`SELECT g key, COUNT(*) n FROM wish_ledger, UNNEST(games) g WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "wizard.games"),
        safe(() => sql`SELECT source key, COUNT(*) n FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "wizard.source"),
        safe(() => sql`SELECT COUNT(*) n, COUNT(*) FILTER (WHERE has_slug) slug, COUNT(*) FILTER (WHERE unlock_scheduled) unlock,
                 COUNT(*) FILTER (WHERE media_count > 0) media, COUNT(*) FILTER (WHERE has_voice) voice, COALESCE(AVG(CARDINALITY(blocks)),0) avg_blocks
                 FROM wish_ledger WHERE created_at > NOW() - (${days}::int * INTERVAL '1 day')`, { rows: [] as Row[] } as never, "wizard.flags"),
    ]);
    const f = flags.rows[0] || {};
    const total = num(f.n) || 1;
    return {
        steps: steps.rows.map((r) => ({ key: str(r.key), n: num(r.n) })),
        modes: counts(modes.rows), medianSecs: num(secs.rows[0]?.med), creates: num(secs.rows[0]?.n),
        fails: counts(fails.rows), uploads: counts(uploads.rows),
        style: counts(style.rows), theme: counts(theme.rows), lang: counts(lang.rows),
        blocks: counts(blocks.rows), games: counts(games.rows), source: counts(src.rows),
        pct: { slug: num(f.slug) / total, unlock: num(f.unlock) / total, media: num(f.media) / total, voice: num(f.voice) / total },
        avgBlocks: num(f.avg_blocks), wishes: num(f.n),
    };
}

/* ======================= 4. Recipient engagement ======================= */
export async function getRecipient(days: number) {
    const [slides, exits, gates, byStyle, candles, legacy] = await Promise.all([
        safe(() => sql`SELECT props->>'block' key, COUNT(*) n, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (props->>'ms')::float) med
                 FROM site_events WHERE name = 'wish_slide' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "rec.slides"),
        safe(() => sql`WITH s AS (
                   SELECT sid, wish_id, MAX(ts) FILTER (WHERE name = 'wish_slide') last_ts, BOOL_OR(name = 'wish_finale') fin
                   FROM site_events WHERE wish_id IS NOT NULL AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1, 2)
                 SELECT e.props->>'block' key, COUNT(*) n FROM s JOIN site_events e ON e.sid = s.sid AND e.wish_id = s.wish_id AND e.ts = s.last_ts AND e.name = 'wish_slide'
                 WHERE NOT s.fin GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, { rows: [] as Row[] } as never, "rec.exits"),
        safe(() => sql`SELECT props->>'block' block, props->>'how' how, COUNT(*) n FROM site_events WHERE name = 'wish_gate' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1, 2`, { rows: [] as Row[] } as never, "rec.gates"),
        safe(() => sql`SELECT props->>'style' key, COUNT(*) FILTER (WHERE name = 'wish_open') opens, COUNT(*) FILTER (WHERE name = 'wish_finale') fins
                 FROM site_events WHERE name IN ('wish_open','wish_finale') AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "rec.style"),
        safe(() => sql`SELECT props->>'method' key, COUNT(*) n FROM site_events WHERE name = 'game_candles' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "rec.candles"),
        safe(() => sql`SELECT section_name key, COUNT(*) n, AVG(time_spent_ms) ms FROM wish_analytics WHERE event_type = 'section_view' AND created_at > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 15`, { rows: [] as Row[] } as never, "rec.legacy"),
    ]);
    const gateMap = new Map<string, { solved: number; auto: number }>();
    for (const r of gates.rows) {
        const g = gateMap.get(str(r.block)) || { solved: 0, auto: 0 };
        if (str(r.how) === "auto") g.auto += num(r.n); else g.solved += num(r.n);
        gateMap.set(str(r.block), g);
    }
    return {
        slides: slides.rows.map((r) => ({ key: str(r.key), n: num(r.n), medMs: num(r.med) })),
        exits: counts(exits.rows),
        gates: [...gateMap.entries()].map(([key, v]) => ({ key, ...v })),
        byStyle: byStyle.rows.map((r) => ({ key: str(r.key) || "cinematic", opens: num(r.opens), finales: num(r.fins) })),
        candles: counts(candles.rows),
        legacy: legacy.rows.map((r) => ({ key: str(r.key), n: num(r.n), ms: num(r.ms) })),
    };
}

/* ======================= 5. Traffic & content ======================= */
export async function getTraffic(days: number) {
    const [pages, sources, landing, ctas, gamesRows, blog] = await Promise.all([
        safe(() => sql`SELECT path key, COUNT(*) n, COUNT(DISTINCT sid) u FROM site_events WHERE name = 'page_view' AND ts > NOW() - (${days}::int * INTERVAL '1 day')
                 AND path NOT LIKE '/wish/%' AND path NOT LIKE '/w/%' GROUP BY 1 ORDER BY 2 DESC LIMIT 20`, { rows: [] as Row[] } as never, "traffic.pages"),
        safe(() => sql`SELECT src key, COUNT(DISTINCT sid) n FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') AND src <> 'internal' GROUP BY 1 ORDER BY 2 DESC LIMIT 15`, { rows: [] as Row[] } as never, "traffic.sources"),
        safe(() => sql`WITH f AS (SELECT DISTINCT ON (sid) sid, path FROM site_events WHERE name = 'page_view' AND ts > NOW() - (${days}::int * INTERVAL '1 day') ORDER BY sid, ts),
                 c AS (SELECT DISTINCT sid FROM site_events WHERE name IN ('wizard_create_ok','game_maker_create') AND ts > NOW() - (${days}::int * INTERVAL '1 day'))
                 SELECT CASE WHEN f.path LIKE '/wish/%' OR f.path LIKE '/w/%' THEN '(a wish link)' ELSE f.path END key, COUNT(*) n, COUNT(c.sid) conv
                 FROM f LEFT JOIN c ON c.sid = f.sid GROUP BY 1 ORDER BY 2 DESC LIMIT 15`, { rows: [] as Row[] } as never, "traffic.landing"),
        safe(() => sql`SELECT path || '  →  ' || COALESCE(props->>'label', props->>'to', '') key, COUNT(*) n FROM site_events WHERE name = 'cta_click' AND ts > NOW() - (${days}::int * INTERVAL '1 day')
                 GROUP BY 1 ORDER BY 2 DESC LIMIT 15`, { rows: [] as Row[] } as never, "traffic.cta"),
        safe(() => sql`SELECT props->>'game' game, COUNT(*) FILTER (WHERE name = 'game_demo_play') plays, COUNT(*) FILTER (WHERE name = 'game_maker_create') makes
                 FROM site_events WHERE name IN ('game_demo_play','game_maker_create') AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1`, { rows: [] as Row[] } as never, "traffic.games"),
        safe(() => sql`WITH v AS (SELECT path, COUNT(*) n, COUNT(DISTINCT sid) u FROM site_events WHERE name = 'page_view' AND path LIKE '/blog%' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1),
                 k AS (SELECT path, COUNT(*) n FROM site_events WHERE name = 'cta_click' AND path LIKE '/blog%' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1)
                 SELECT v.path key, v.n, v.u, COALESCE(k.n, 0) clicks FROM v LEFT JOIN k ON k.path = v.path ORDER BY v.n DESC LIMIT 20`, { rows: [] as Row[] } as never, "traffic.blog"),
    ]);
    return {
        pages: pages.rows.map((r) => ({ key: str(r.key), n: num(r.n), u: num(r.u) })),
        sources: counts(sources.rows),
        landing: landing.rows.map((r) => ({ key: str(r.key), n: num(r.n), conv: num(r.conv) })),
        ctas: counts(ctas.rows),
        games: gamesRows.rows.map((r) => ({ key: str(r.game), plays: num(r.plays), makes: num(r.makes) })),
        blog: blog.rows.map((r) => ({ key: str(r.key), n: num(r.n), u: num(r.u), clicks: num(r.clicks) })),
    };
}

/* ======================= 6. Devices & speed ======================= */
export async function getDevices(days: number) {
    const [device, browser, country, vitals, slowPages] = await Promise.all([
        safe(() => sql`SELECT device key, COUNT(DISTINCT sid) n FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC`, { rows: [] as Row[] } as never, "dev.device"),
        safe(() => sql`SELECT browser key, COUNT(DISTINCT sid) n FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, { rows: [] as Row[] } as never, "dev.browser"),
        safe(() => sql`SELECT country key, COUNT(DISTINCT sid) n FROM site_events WHERE ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1 ORDER BY 2 DESC LIMIT 12`, { rows: [] as Row[] } as never, "dev.country"),
        safe(() => sql`SELECT props->>'metric' metric, device, PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (props->>'value')::float) p75, COUNT(*) n
                 FROM site_events WHERE name = 'vitals' AND ts > NOW() - (${days}::int * INTERVAL '1 day') GROUP BY 1, 2`, { rows: [] as Row[] } as never, "dev.vitals"),
        safe(() => sql`SELECT CASE WHEN path LIKE '/wish/%' OR path LIKE '/w/%' THEN '/wish/*' WHEN path LIKE '/blog/%' THEN path WHEN path LIKE '/dashboard/%' THEN '/dashboard/*' ELSE path END key,
                 PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (props->>'value')::float) p75, COUNT(*) n
                 FROM site_events WHERE name = 'vitals' AND props->>'metric' = 'LCP' AND ts > NOW() - (${days}::int * INTERVAL '1 day')
                 GROUP BY 1 HAVING COUNT(*) >= 3 ORDER BY p75 DESC LIMIT 12`, { rows: [] as Row[] } as never, "dev.slow"),
    ]);
    return {
        device: counts(device.rows), browser: counts(browser.rows), country: counts(country.rows),
        vitals: vitals.rows.map((r) => ({ metric: str(r.metric), device: str(r.device), p75: num(r.p75), n: num(r.n) })),
        slowPages: slowPages.rows.map((r) => ({ key: str(r.key), p75: num(r.p75), n: num(r.n) })),
    };
}

/* ======================= 7. Errors ======================= */
export async function getErrors(days: number) {
    const [js, api] = await Promise.all([
        safe(() => sql`SELECT props->>'msg' msg, props->>'where' loc, COUNT(*) n, COUNT(DISTINCT sid) users, MAX(ts) last, MIN(path) path, MIN(browser) browser
                 FROM site_events
                 WHERE name = 'js_error'
                   AND ts > NOW() - (${days}::int * INTERVAL '1 day')
                   AND COALESCE(props->>'where', '') NOT LIKE 'navigation_performance_logger%'
                   AND COALESCE(props->>'msg', '') NOT LIKE '%Java object is gone%'
                 GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 25`, { rows: [] as Row[] } as never, "err.js"),
        safe(() => sql`SELECT name, COALESCE(props->>'route', props->>'reason', '') detail, COALESCE(props->>'status', '') status, COUNT(*) n, MAX(ts) last
                 FROM site_events WHERE name IN ('api_error','upload_fail','wizard_create_fail') AND ts > NOW() - (${days}::int * INTERVAL '1 day')
                 GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 25`, { rows: [] as Row[] } as never, "err.api"),
    ]);
    return {
        js: js.rows.map((r) => ({ msg: str(r.msg), loc: str(r.loc), n: num(r.n), users: num(r.users), last: str(r.last), path: str(r.path), browser: str(r.browser) })),
        api: api.rows.map((r) => ({ name: str(r.name), detail: str(r.detail), status: str(r.status), n: num(r.n), last: str(r.last) })),
    };
}

/* ======================= 8. Reviews ======================= */
export async function getReviews() {
    await ensureReviewsTable().catch(() => {});
    const [list, agg] = await Promise.all([
        safe(() => sql`SELECT id, name, rating, message, relationship, approved, created_at, COALESCE(source, 'site') source FROM reviews ORDER BY created_at DESC LIMIT 100`, { rows: [] as Row[] } as never, "reviews.list"),
        safe(() => sql`SELECT COUNT(*) n, COALESCE(AVG(rating),0) avg, COUNT(*) FILTER (WHERE approved) shown,
                 COUNT(*) FILTER (WHERE rating = 5) r5, COUNT(*) FILTER (WHERE rating = 4) r4, COUNT(*) FILTER (WHERE rating = 3) r3,
                 COUNT(*) FILTER (WHERE rating = 2) r2, COUNT(*) FILTER (WHERE rating = 1) r1 FROM reviews`, { rows: [] as Row[] } as never, "reviews.agg"),
    ]);
    const a = agg.rows[0] || {};
    return {
        list: list.rows.map((r) => ({ id: num(r.id), name: str(r.name), rating: num(r.rating), message: str(r.message), relationship: str(r.relationship), source: str(r.source) || "site", approved: !!r.approved, created: str(r.created_at) })),
        total: num(a.n), avg: num(a.avg), shown: num(a.shown),
        dist: [5, 4, 3, 2, 1].map((s) => ({ key: `${s} / 5`, n: num(a[`r${s}`]) })),
    };
}

/* ======================= 9. Wish management ======================= */
export async function getWishOps(includeUsage = true) {
    const [active, ledger, lastCleanup, recentRows] = await Promise.all([
        safe(() => sql`SELECT COUNT(*) n, COUNT(*) FILTER (WHERE opened_at IS NULL) unopened, COUNT(*) FILTER (WHERE opened_at IS NOT NULL) opened,
                 COUNT(*) FILTER (WHERE (keep_until IS NULL OR keep_until < NOW()) AND opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '8 hours') expiring2h,
                 COUNT(*) FILTER (WHERE (keep_until IS NULL OR keep_until < NOW()) AND opened_at IS NULL AND created_at < NOW() - INTERVAL '6 days') expiring_unopened,
                 COUNT(*) FILTER (WHERE (keep_until IS NULL OR keep_until < NOW()) AND ((opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '34 hours') OR (opened_at IS NULL AND created_at < NOW() - INTERVAL '8 days'))) overdue,
                 COUNT(*) FILTER (WHERE (keep_until IS NULL OR keep_until < NOW()) AND opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '10 hours') waiting_cleanup,
                 MIN(created_at) FILTER (WHERE opened_at IS NULL) oldest_unopened,
                 COUNT(*) FILTER (WHERE custom_slug IS NOT NULL) slugs FROM wishes`, { rows: [] as Row[] } as never, "ops.active"),
        safe(() => sql`SELECT COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) deleted, COALESCE(SUM(media_count) FILTER (WHERE deleted_at IS NULL), 0) media FROM wish_ledger`, { rows: [] as Row[] } as never, "ops.ledger"),
        safe(() => kvGet<{ deleted?: number; orphanMedia?: number; freedMb?: number; prunedEvents?: number; at?: string; error?: string }>("last_cleanup"), null, "ops.kv"),
        includeUsage
            ? safe(() => sql`SELECT id, custom_slug, created_at, opened_at, view_count,
                     COALESCE(data->'look'->>'presentationStyle', data->>'theme', 'classic') AS style,
                     COALESCE(data->'unlock'->>'date', data->>'unlockDate', '') AS unlock_date
                     FROM wishes ORDER BY created_at DESC LIMIT 50`, { rows: [] as Row[] } as never, "ops.recent")
            : Promise.resolve({ rows: [] as Row[] }),
    ]);
    let usage: { storageMb: number; bandwidthMb: number; creditsUsedPct: number; plan: string } | null = null;
    try {
        if (includeUsage && process.env.CLOUDINARY_API_SECRET) {
            const u = await cloudinary.api.usage();
            usage = {
                storageMb: Math.round(num(u.storage?.usage) / 1048576),
                bandwidthMb: Math.round(num(u.bandwidth?.usage) / 1048576),
                creditsUsedPct: num(u.credits?.used_percent),
                plan: str(u.plan),
            };
        }
    } catch (e) { console.error("[admin] cloudinary usage failed", e); }
    const a = active.rows[0] || {}, l = ledger.rows[0] || {};
    const now = Date.now();
    const recent = recentRows.rows.map((r) => {
        const unlockStr = str(r.unlock_date);
        const unlockMs = unlockStr ? Date.parse(unlockStr) : NaN;
        return {
            id: str(r.id),
            slug: str(r.custom_slug),
            created: str(r.created_at),
            opened: r.opened_at ? str(r.opened_at) : "",
            views: num(r.view_count),
            style: str(r.style) || "cinematic",
            lockedUntil: Number.isFinite(unlockMs) && unlockMs > now ? unlockStr : "",
        };
    });
    return {
        active: num(a.n), unopened: num(a.unopened), opened: num(a.opened), expiringSoon: num(a.expiring2h) + num(a.expiring_unopened),
        overdue: num(a.overdue), waitingCleanup: num(a.waiting_cleanup), oldestUnopened: str(a.oldest_unopened), slugs: num(a.slugs),
        deletedTotal: num(l.deleted), activeMedia: num(l.media), lastCleanup, usage, recent,
    };
}

/* ======================= 10. Memory Vault Launch Test (200 Free) ======================= */
export async function getVaultAdminStats(days: number) {
    await ensureDb().catch(() => {});
    await ensureAnalytics().catch(() => {});

    const [totals, plans, regions, whoRows, evRows] = await Promise.all([
        safe(
            () => sql`
                SELECT
                    COUNT(*)::int AS claimed,
                    COALESCE(SUM(listed_price) FILTER (WHERE currency = 'INR'), 0) AS inr_val,
                    COALESCE(SUM(listed_price) FILTER (WHERE currency = 'USD'), 0) AS usd_val,
                    COALESCE(SUM(listed_price) FILTER (WHERE currency = 'GBP'), 0) AS gbp_val
                FROM vault_claims
                WHERE is_free_spot = TRUE
            `,
            { rows: [] as Row[] } as never,
            "vault.totals",
        ),
        safe(
            () => sql`SELECT plan AS key, COUNT(*)::int AS n FROM vault_claims GROUP BY 1 ORDER BY 2 DESC`,
            { rows: [] as Row[] } as never,
            "vault.plans",
        ),
        safe(
            () => sql`SELECT region || ' (' || currency || ')' AS key, COUNT(*)::int AS n FROM vault_claims GROUP BY 1 ORDER BY 2 DESC`,
            { rows: [] as Row[] } as never,
            "vault.regions",
        ),
        safe(
            () => sql`SELECT who || ' (' || surface || ')' AS key, COUNT(*)::int AS n FROM vault_claims GROUP BY 1 ORDER BY 2 DESC`,
            { rows: [] as Row[] } as never,
            "vault.who",
        ),
        safe(
            () => sql`
                SELECT
                    COUNT(DISTINCT sid) FILTER (WHERE name = 'vault_view')::int AS views,
                    COUNT(*) FILTER (WHERE name = 'vault_post200_click')::int AS post200
                FROM site_events
                WHERE ts > NOW() - (${days}::int * INTERVAL '1 day')
                  AND name IN ('vault_view', 'vault_post200_click')
            `,
            { rows: [] as Row[] } as never,
            "vault.events",
        ),
    ]);

    const t = totals.rows[0] || {};
    const e = evRows.rows[0] || {};
    const claimed = Math.min(VAULT_FREE_LIMIT, num(t.claimed));
    return {
        totalSpots: VAULT_FREE_LIMIT,
        claimed,
        spotsLeft: Math.max(0, VAULT_FREE_LIMIT - claimed),
        cardViews: num(e.views),
        post200Clicks: num(e.post200),
        inrValue: Number(t.inr_val || 0),
        usdValue: Number(t.usd_val || 0),
        gbpValue: Number(t.gbp_val || 0),
        plans: counts(plans.rows),
        regions: counts(regions.rows),
        who: counts(whoRows.rows),
    };
}
