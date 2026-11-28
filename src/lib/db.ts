import "@/lib/netFix";
import { sql } from '@vercel/postgres';
import { WishData } from '@/lib/WishContext';
import { normalizeWish } from '@/lib/wish/migrate';
import crypto from 'crypto';
import { v2 as cloudinary } from "cloudinary";
import { ensureAnalytics, ledgerWishCreated, ledgerWishDeleted, ledgerWishViewed } from "@/lib/analytics";
import { safeEqualSecret } from "@/lib/security";
import {
    VAULT_FREE_LIMIT,
    getVaultRegionConfig,
    type VaultPlanId,
    type VaultRegion,
    type VaultSurface,
} from "@/lib/vaultPricing";

const RESERVED_SLUGS = new Set([
    "admin", "login", "logout", "api", "support", "help", "official", "verify", "security",
    "billing", "payment", "privacy", "terms", "dmca", "disclaimer", "contact", "about",
    "create", "anniversary", "blog", "games", "giveaway", "dashboard", "wish", "w", "dev", "null", "undefined",
]);

export class InvalidSlugError extends Error {
    constructor(message = "Custom link must be 3–40 letters/numbers and cannot use reserved words.") {
        super(message);
        this.name = "InvalidSlugError";
    }
}

export function sanitizeCustomSlug(raw: unknown): string | null {
    if (raw === undefined || raw === null) return null;
    const str = String(raw).trim();
    if (!str) return null;
    const clean = str.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
    if (clean.length < 3 || clean.length > 40) {
        throw new InvalidSlugError("Custom link must be between 3 and 40 characters.");
    }
    if (RESERVED_SLUGS.has(clean)) {
        throw new InvalidSlugError("This custom link name is reserved. Please pick another one.");
    }
    return clean;
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize the database table if it doesn't exist.
// Runs the schema statements ONCE per server instance (they used to run on every request:
// 6 extra database round-trips on every wish open / create / slug check).
const gDb = globalThis as unknown as { __bwDbReady?: Promise<void> | null };
export function ensureDb(): Promise<void> {
    if (!gDb.__bwDbReady) {
        gDb.__bwDbReady = setupDb().catch((error) => {
            gDb.__bwDbReady = null; // retry on the next request
            console.error("Error setting up Postgres DB:", error);
        });
    }
    return gDb.__bwDbReady;
}

async function setupDb() {
    {
        // Fast probe avoids running 9 CREATE/ALTER DDL locks on every serverless cold start
        const probe = await sql`
            SELECT to_regclass('public.vault_claims') AS vc,
                   to_regclass('public.wish_analytics') AS wa
        `;
        if (probe.rows[0]?.vc && probe.rows[0]?.wa) return;

        await sql`
            CREATE TABLE IF NOT EXISTS wishes (
                id VARCHAR(10) PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                custom_slug VARCHAR(50) UNIQUE DEFAULT NULL,
                view_count INTEGER DEFAULT 0,
                creator_token VARCHAR(64) DEFAULT NULL
            );
        `;

        // Ensure existing tables are updated
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS custom_slug VARCHAR(50) UNIQUE DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS creator_token VARCHAR(64) DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS keep_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS vault_plan VARCHAR(16) DEFAULT NULL;`;

        // Persistent Memory Vault launch claims (survives wish cleanup so the 200-spot counter & admin stats stay exact)
        await sql`
            CREATE TABLE IF NOT EXISTS vault_claims (
                id SERIAL PRIMARY KEY,
                wish_id VARCHAR(10) UNIQUE NOT NULL,
                plan VARCHAR(16) NOT NULL,
                region VARCHAR(8) NOT NULL,
                country VARCHAR(8) DEFAULT NULL,
                currency VARCHAR(8) NOT NULL,
                listed_price NUMERIC(10, 2) NOT NULL,
                surface VARCHAR(24) NOT NULL,
                who VARCHAR(16) NOT NULL,
                is_free_spot BOOLEAN DEFAULT TRUE,
                spot_number INTEGER UNIQUE CHECK (spot_number IS NULL OR (spot_number >= 1 AND spot_number <= 200)),
                keep_until TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Analytics table
        await sql`
            CREATE TABLE IF NOT EXISTS wish_analytics (
                id SERIAL PRIMARY KEY,
                wish_id VARCHAR(10) REFERENCES wishes(id) ON DELETE CASCADE,
                event_type VARCHAR(50) NOT NULL,
                section_name VARCHAR(100) DEFAULT NULL,
                time_spent_ms INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
    }
}

export async function saveWish(data: WishData & { customSlug?: string }): Promise<{ id: string; creatorToken: string }> {
    await ensureDb();

    // Generate a 10-hex-character (40-bit = 1.1 trillion possibilities) random ID; existing 6-char IDs remain supported
    let id = crypto.randomBytes(5).toString('hex');
    const creatorToken = crypto.randomBytes(32).toString('hex');
    const customSlug = sanitizeCustomSlug(data.customSlug);

    // Remove customSlug from data before storing (it's in a separate column)
    const wishCopy = { ...data };
    delete wishCopy.customSlug;
    const wishData = wishCopy;

    try {
        for (let attempt = 0; ; attempt++) {
            try {
                await sql`
                    INSERT INTO wishes (id, data, custom_slug, creator_token)
                    VALUES (${id}, ${JSON.stringify(wishData)}::jsonb, ${customSlug}, ${creatorToken})
                `;
                break;
            } catch (e) {
                const msg = String((e as { message?: string })?.message || e);
                if (attempt < 4 && /duplicate key/i.test(msg) && /pkey/i.test(msg)) { id = crypto.randomBytes(5).toString('hex'); continue; }
                if (/duplicate key/i.test(msg) && /custom_slug/i.test(msg)) throw new SlugTakenError();
                throw e;
            }
        }
        // anonymous metadata for the admin dashboard (survives the self-destruct)
        await ledgerWishCreated(id, wishData, !!customSlug);
        void maybeAutoSweepExpiredWishes();
        return { id, creatorToken };
    } catch (error) {
        if (error instanceof SlugTakenError || error instanceof InvalidSlugError) throw error;
        console.error("Error saving wish:", error);
        throw new Error("Failed to save wish");
    }
}

/** The chosen custom link was taken between the availability check and saving. */
export class SlugTakenError extends Error {
    constructor() { super("This custom link is already taken"); this.name = "SlugTakenError"; }
}

export function getScheduledUnlockTime(raw: unknown): number | null {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as { unlockDate?: unknown; unlock?: { date?: unknown } };
    const iso = typeof obj.unlock?.date === "string" && obj.unlock.date.trim()
        ? obj.unlock.date.trim()
        : typeof obj.unlockDate === "string" && obj.unlockDate.trim()
            ? obj.unlockDate.trim()
            : "";
    if (!iso) return null;
    const ms = Date.parse(iso);
    return Number.isFinite(ms) ? ms : null;
}

/**
 * Admin read-only fetch: returns the wish without touching opened_at, view_count, or wish_ledger.
 */
export async function getWishReadOnly(id: string): Promise<{ data: WishData; openedAt: string | null; viewCount: number } | null> {
    await ensureDb();
    try {
        const { rows } = await sql`
            SELECT data, opened_at, view_count FROM wishes WHERE id = ${id}
        `;
        if (rows.length > 0) {
            return {
                data: rows[0].data as WishData,
                openedAt: rows[0].opened_at ? String(rows[0].opened_at) : null,
                viewCount: Number(rows[0].view_count || 0),
            };
        }
        return null;
    } catch (error) {
        console.error("Error reading wish (admin read-only):", error);
        return null;
    }
}

export interface ExpiredWishInfo {
    wishType: "birthday" | "anniversary";
    style: string;
    gamesCount: number;
    views: number;
}

/**
 * Looks up anonymous wish_ledger metadata when a wish has already self-destructed
 * so visitors get a helpful FOMO screen instead of a dead 404.
 */
export async function getExpiredWishInfo(id: string): Promise<ExpiredWishInfo | null> {
    if (!/^[a-f0-9]{6,10}$/.test(id)) return null;
    try {
        await ensureAnalytics();
        const { rows } = await sql`
            SELECT wish_type, style, COALESCE(CARDINALITY(games), 0) AS games_count, COALESCE(views, 0) AS views
            FROM wish_ledger WHERE wish_id = ${id}
        `;
        if (rows.length === 0) return null;
        return {
            wishType: rows[0].wish_type === "anniversary" ? "anniversary" : "birthday",
            style: typeof rows[0].style === "string" && rows[0].style ? rows[0].style : "cinematic",
            gamesCount: Number(rows[0].games_count || 0),
            views: Number(rows[0].views || 0),
        };
    } catch {
        return null;
    }
}

export type VisitorWishResult =
    | { status: "missing" }
    | { status: "expired"; wishType: "birthday" | "anniversary"; style: string; gamesCount: number; views: number }
    | { status: "locked"; unlockDate: string; targetName: string; wishType: "birthday" | "anniversary" }
    | { status: "ok"; data: WishData };

/**
 * Safe visitor fetch: validates ID format and NEVER returns private wish content
 * (messages, photos, voice notes, quiz answers) while a scheduled time-capsule lock is active.
 */
export async function getWishForVisitor(id: string): Promise<VisitorWishResult> {
    if (!/^[a-f0-9]{6,10}$/.test(id)) return { status: "missing" };
    await ensureDb();

    try {
        const { rows } = await sql`
            SELECT data, created_at, opened_at, keep_until, COALESCE(view_count, 0) AS view_count FROM wishes WHERE id = ${id}
        `;
        if (rows.length === 0) {
            const exp = await getExpiredWishInfo(id);
            if (exp) return { status: "expired", ...exp };
            return { status: "missing" };
        }

        const wishData = rows[0].data as WishData;
        if (shouldDestroyWishNow({
            data: wishData,
            createdAt: rows[0].created_at,
            openedAt: rows[0].opened_at,
            keepUntil: rows[0].keep_until,
        })) {
            const { v2 } = normalizeWish(wishData);
            void destroySingleWish(id, wishData);
            return {
                status: "expired",
                wishType: v2.wishType === "anniversary" ? "anniversary" : "birthday",
                style: v2.look.presentationStyle || "cinematic",
                gamesCount: v2.blocks.filter((b) => ["candles", "balloons", "heartbeat", "lanterns", "prank", "trivia", "catchGifts", "guessYear", "memoryMatch", "newspaper", "treasure", "wheel"].includes(b.type)).length,
                views: Number(rows[0].view_count || 0),
            };
        }

        const unlockMs = getScheduledUnlockTime(wishData);
        const stillLocked = unlockMs !== null && unlockMs > Date.now();

        if (stillLocked) {
            const { v2 } = normalizeWish(wishData);
            const wishType = v2.wishType === "anniversary" ? "anniversary" : "birthday";
            const rawName = (wishType === "anniversary" ? v2.recipient.coupleName || v2.recipient.name : v2.recipient.name || v2.recipient.nickname) || "Friend";
            const targetName = rawName.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 60) || "Friend";
            const unlockDate = new Date(unlockMs).toISOString();
            return { status: "locked", unlockDate, targetName, wishType };
        }

        const firstOpen = !rows[0].opened_at;
        await sql`
            UPDATE wishes
            SET opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
                view_count = COALESCE(view_count, 0) + 1
            WHERE id = ${id}
        `;
        await ledgerWishViewed(id, firstOpen);

        return { status: "ok", data: wishData };
    } catch (error) {
        console.error("Error getting wish for visitor:", error);
        return { status: "missing" };
    }
}

export async function getWish(id: string): Promise<WishData | null> {
    const res = await getWishForVisitor(id);
    return res.status === "ok" ? res.data : null;
}

// Get wish by custom slug
export async function getWishBySlug(slug: string): Promise<{ id: string; data: WishData } | null> {
    await ensureDb();
    try {
        const { rows } = await sql`
            SELECT id, data FROM wishes WHERE custom_slug = ${slug}
        `;
        if (rows.length > 0) {
            // The /wish/[id] page this redirects to does the open + view_count logic (once).
            return { id: rows[0].id, data: rows[0].data as WishData };
        }
        return null;
    } catch (error) {
        console.error("Error getting wish by slug:", error);
        return null;
    }
}

// Check slug availability
export async function isSlugAvailable(slug: string): Promise<boolean> {
    await ensureDb();
    try {
        const { rows } = await sql`
            SELECT id FROM wishes WHERE custom_slug = ${slug}
        `;
        return rows.length === 0;
    } catch (error) {
        console.error("Error checking slug:", error);
        return false;
    }
}

// Save analytics event (capped at 300 rows per wish to prevent table bloat)
export async function saveAnalyticsEvent(wishId: string, eventType: string, sectionName?: string, timeSpentMs?: number) {
    if (!/^[a-f0-9]{6,10}$/.test(wishId)) return;
    try {
        const { rows } = await sql`SELECT COUNT(*)::int AS n FROM wish_analytics WHERE wish_id = ${wishId}`;
        if ((rows[0]?.n ?? 0) >= 300) return;
        await sql`
            INSERT INTO wish_analytics (wish_id, event_type, section_name, time_spent_ms)
            SELECT ${wishId}, ${eventType.slice(0, 40)}, ${sectionName ? sectionName.slice(0, 80) : null}, ${timeSpentMs || 0}
            WHERE EXISTS (SELECT 1 FROM wishes WHERE id = ${wishId})
        `;
    } catch (error) {
        console.error("Error saving analytics:", error);
    }
}

// Get analytics for a wish (creator dashboard; constant-time token comparison)
export async function getWishAnalytics(wishId: string, creatorToken: string) {
    if (!/^[a-f0-9]{6,10}$/.test(wishId) || !creatorToken) return null;
    await ensureDb();
    try {
        const { rows: wishRows } = await sql`
            SELECT id, data, view_count, created_at, opened_at, custom_slug, creator_token, keep_until, vault_plan
            FROM wishes WHERE id = ${wishId}
        `;
        if (wishRows.length === 0) return null;
        const storedToken = typeof wishRows[0].creator_token === "string" ? wishRows[0].creator_token : "";
        if (!storedToken || !safeEqualSecret(creatorToken, storedToken)) return null;

        let recipientName = "";
        let wishType: "birthday" | "anniversary" = "birthday";
        try {
            const { v2 } = normalizeWish(wishRows[0].data);
            wishType = v2.wishType === "anniversary" ? "anniversary" : "birthday";
            const rawName = (wishType === "anniversary" ? v2.recipient.coupleName || v2.recipient.name : v2.recipient.name || v2.recipient.nickname) || "";
            recipientName = rawName.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
        } catch {
            // ignore malformed wish payload
        }

        // Get both legacy v1 wish_analytics AND v2 site_events slide dwell times
        const [legacyRes, v2Res] = await Promise.all([
            sql`
                SELECT event_type, section_name, time_spent_ms, created_at
                FROM wish_analytics
                WHERE wish_id = ${wishId}
                ORDER BY created_at ASC
            `,
            sql`
                SELECT name, props->>'block' AS block_key, COALESCE((props->>'ms')::numeric, 0) AS ms
                FROM site_events
                WHERE wish_id = ${wishId} AND name IN ('wish_slide', 'wish_finale')
            `.catch(() => ({ rows: [] as Record<string, unknown>[] })),
        ]);

        const events = legacyRes.rows;

        // Aggregate section times (cap single-slide idle tab dwell at 5 minutes so background tabs don't skew)
        const sectionTimes: Record<string, number> = {};
        let totalTimeMs = 0;
        let reachedFinale = false;

        for (const event of events) {
            if (event.section_name && event.time_spent_ms) {
                const ms = Math.min(300_000, Math.max(0, Number(event.time_spent_ms) || 0));
                sectionTimes[event.section_name] = (sectionTimes[event.section_name] || 0) + ms;
                totalTimeMs += ms;
            }
        }
        for (const row of v2Res.rows) {
            if (row.name === "wish_finale") {
                reachedFinale = true;
                continue;
            }
            const key = typeof row.block_key === "string" ? row.block_key : "";
            const rawMs = Math.min(300_000, Math.max(0, Math.round(Number(row.ms) || 0)));
            if (key && rawMs > 0) {
                sectionTimes[key] = (sectionTimes[key] || 0) + rawMs;
                totalTimeMs += rawMs;
            }
        }

        // Find most loved section
        let mostLovedSection = '';
        let maxTime = 0;
        for (const [section, time] of Object.entries(sectionTimes)) {
            if (time > maxTime) {
                maxTime = time;
                mostLovedSection = section;
            }
        }

        return {
            wishId,
            recipientName,
            wishType,
            reachedFinale,
            viewCount: wishRows[0].view_count,
            createdAt: wishRows[0].created_at,
            openedAt: wishRows[0].opened_at,
            customSlug: wishRows[0].custom_slug,
            keepUntil: wishRows[0].keep_until || null,
            vaultPlan: wishRows[0].vault_plan || null,
            totalTimeSpent: totalTimeMs,
            sectionTimes,
            mostLovedSection,
            events
        };
    } catch (error) {
        console.error("Error getting analytics:", error);
        return null;
    }
}

// Extract public_id from Cloudinary URL
function getCloudinaryPublicId(url: string) {
    if (!url || !url.includes("cloudinary.com")) return null;
    try {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const idWithExt = `${folder}/${lastPart}`;
        return idWithExt.substring(0, idWithExt.lastIndexOf('.'));
    } catch (e) {
        return null;
    }
}

/** Delete a wish's photos/videos/voice note from Cloudinary (errors are logged, not thrown). */
async function deleteWishMedia(raw: unknown) {
    // v2 wishes (Wizard 2.0) are converted so the same media fields can be cleaned up
    const wishData = normalizeWish(raw).v1;

    // Delete modern media gallery from Cloudinary
    if (wishData.mediaItems && wishData.mediaItems.length > 0) {
        for (const item of wishData.mediaItems) {
            const publicId = getCloudinaryPublicId(item.url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: item.type === 'video' ? 'video' : 'image'
                }).catch(console.error);
            }
        }
    }

    // Delete legacy media from Cloudinary if exists
    if (wishData.mediaUrl) {
        const publicId = getCloudinaryPublicId(wishData.mediaUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: wishData.mediaType === 'video' ? 'video' : 'image'
            }).catch(console.error);
        }
    }
    // Delete audio from Cloudinary
    if (wishData.audioUrl) {
        const publicId = getCloudinaryPublicId(wishData.audioUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: 'video' // Cloudinary treats audio as video resource type
            }).catch(console.error);
        }
    }
    // Delete a separately uploaded puzzle photo (it was never cleaned up before)
    const puzzleUrl = (wishData as { puzzleImageUrl?: string }).puzzleImageUrl;
    const alreadyGone = new Set([...(wishData.mediaItems || []).map((m) => m.url), wishData.mediaUrl].filter(Boolean));
    if (puzzleUrl && !alreadyGone.has(puzzleUrl)) {
        const publicId = getCloudinaryPublicId(puzzleUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(console.error);
    }
}

const TEN_HOURS_MS = 10 * 3600 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;
const MAX_FREE_SCHEDULE_MS = 60 * 24 * 3600 * 1000; // cap free scheduled locks at 60 days

function shouldDestroyWishNow(input: {
    data: unknown;
    createdAt: unknown;
    openedAt: unknown;
    keepUntil: unknown;
}): boolean {
    const now = Date.now();

    // 1. Active Memory Vault wishes are protected until keep_until
    if (input.keepUntil) {
        const keepMs = new Date(String(input.keepUntil)).getTime();
        if (Number.isFinite(keepMs) && keepMs > now) return false;
    }

    const createdMs = input.createdAt ? new Date(String(input.createdAt)).getTime() : 0;
    const openedMs = input.openedAt ? new Date(String(input.openedAt)).getTime() : 0;
    const rawUnlockMs = getScheduledUnlockTime(input.data);
    const unlockMs = rawUnlockMs !== null && createdMs > 0
        ? Math.min(rawUnlockMs, createdMs + MAX_FREE_SCHEDULE_MS)
        : rawUnlockMs;

    // 2. Opened wishes self-destruct 10 hours after first open
    if (openedMs > 0) {
        if (unlockMs !== null && now < unlockMs + TEN_HOURS_MS) return false;
        return now - openedMs >= TEN_HOURS_MS;
    }

    // 3. Unopened wishes: if 7 days (1 week) old AND no active future unlock timer, destroy automatically
    if (createdMs > 0 && now - createdMs >= SEVEN_DAYS_MS) {
        // If creator scheduled a future birthday lock (e.g. next week), keep it until 24h after that unlock date if still unopened
        if (unlockMs !== null && now < unlockMs + 24 * 3600 * 1000) {
            return false;
        }
        return true;
    }

    return false;
}

async function destroySingleWish(id: string, data: unknown): Promise<void> {
    try {
        await deleteWishMedia(data);
        await sql`DELETE FROM wishes WHERE id = ${id}`;
        await ledgerWishDeleted(id);
    } catch (e) {
        console.error("Failed destroying expired wish:", id, e);
    }
}

const gSweep = globalThis as unknown as { __bwLastAutoSweep?: number };

/** Lightweight hourly auto-sweep triggered opportunistically so expired/unopened wishes don't wait 24h for daily cron. */
async function maybeAutoSweepExpiredWishes(): Promise<void> {
    const now = Date.now();
    if (gSweep.__bwLastAutoSweep && now - gSweep.__bwLastAutoSweep < 60 * 60 * 1000) return;
    gSweep.__bwLastAutoSweep = now;
    try {
        await cleanupExpiredWishes();
    } catch {
        // ignore background sweep errors
    }
}

export async function cleanupExpiredWishes() {
    await ensureDb();
    try {
        // Candidate rows: (a) opened > 10 hours ago, OR (b) unopened > 7 days (1 week) ago, excluding active Memory Vault wishes
        const { rows } = await sql`
            SELECT id, data, created_at, opened_at, keep_until FROM wishes 
            WHERE (keep_until IS NULL OR keep_until < NOW())
              AND (
                (opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '10 hours')
                OR (opened_at IS NULL AND created_at < NOW() - INTERVAL '7 days')
              )
        `;

        let deletedCount = 0;

        for (const row of rows) {
            if (!shouldDestroyWishNow({
                data: row.data,
                createdAt: row.created_at,
                openedAt: row.opened_at,
                keepUntil: row.keep_until,
            })) {
                continue;
            }
            await destroySingleWish(String(row.id), row.data);
            deletedCount++;
        }

        return deletedCount;
    } catch (error) {
        console.error("Error cleaning up wishes:", error);
        throw new Error("Failed to clean up wishes");
    }
}

/**
 * Cloudinary Auto-Saver: cleans up orphan files in `birthday_wishes/` that were uploaded
 * >36 hours ago by visitors who closed the wizard without ever creating a wish.
 *
 * Triple safety guard:
 *  1. Only inspects resources strictly inside `birthday_wishes/`
 *  2. Never touches anything uploaded in the last 36 hours (protects saved wizard drafts)
 *  3. Aborts immediately if reading active `wishes` fails, and skips any asset whose public_id
 *     or basename appears anywhere inside any active wish's JSON payload.
 */
export async function cleanupOrphanCloudinaryMedia(maxPerType = 400): Promise<{ deletedOrphans: number; freedMb: number }> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return { deletedOrphans: 0, freedMb: 0 };
    }
    await ensureDb();
    // Read ALL active wishes first; if this query fails for any reason, do NOT delete anything
    const { rows } = await sql`SELECT data FROM wishes`;
    const allActiveJson = rows.map((r) => JSON.stringify(r.data ?? "")).join("\n");
    const activeIds = new Set<string>();
    const matches = allActiveJson.match(/birthday_wishes\/[^"'\s\\.?#]+/g) || [];
    for (const m of matches) activeIds.add(m);

    const cutoffMs = Date.now() - 36 * 3600 * 1000; // 36-hour grace period for unfinished drafts
    let deletedOrphans = 0;
    let freedBytes = 0;

    for (const resourceType of ["image", "video"] as const) {
        let nextCursor: string | undefined;
        const toDelete: string[] = [];
        let scannedPages = 0;

        while (scannedPages < 3 && toDelete.length < maxPerType) {
            scannedPages++;
            const page = await cloudinary.api.resources({
                type: "upload",
                prefix: "birthday_wishes/",
                resource_type: resourceType,
                max_results: 500,
                ...(nextCursor ? { next_cursor: nextCursor } : {}),
            }) as { resources?: Array<{ public_id?: string; created_at?: string; bytes?: number }>; next_cursor?: string };

            for (const item of page.resources || []) {
                const pid = item.public_id || "";
                if (!pid.startsWith("birthday_wishes/")) continue;
                const createdMs = item.created_at ? Date.parse(item.created_at) : NaN;
                if (!Number.isFinite(createdMs) || createdMs >= cutoffMs) continue;
                const base = pid.slice("birthday_wishes/".length);
                if (activeIds.has(pid) || (base.length >= 6 && allActiveJson.includes(base))) continue;

                toDelete.push(pid);
                freedBytes += Number(item.bytes) || 0;
                if (toDelete.length >= maxPerType) break;
            }
            nextCursor = page.next_cursor;
            if (!nextCursor) break;
        }

        // Bulk delete in chunks of 100 (1 Admin API call per 100 files)
        for (let i = 0; i < toDelete.length; i += 100) {
            const chunk = toDelete.slice(i, i + 100);
            await cloudinary.api.delete_resources(chunk, { resource_type: resourceType });
            deletedOrphans += chunk.length;
        }
    }

    return {
        deletedOrphans,
        freedMb: Math.round((freedBytes / 1048576) * 10) / 10,
    };
}

/** Admin: delete one wish right now (privacy / DMCA request), by id or custom slug. */
export async function deleteWishNow(idOrSlug: string): Promise<{ ok: boolean; id?: string }> {
    await ensureDb();
    const key = idOrSlug.trim().toLowerCase().replace(/^.*\/(wish|w)\//, "").replace(/[^a-z0-9-]/g, "").slice(0, 50);
    if (!key) return { ok: false };
    const { rows } = await sql`SELECT id, data FROM wishes WHERE id = ${key} OR custom_slug = ${key} LIMIT 1`;
    if (!rows.length) return { ok: false };
    await deleteWishMedia(rows[0].data);
    await sql`DELETE FROM wishes WHERE id = ${rows[0].id}`;
    await ledgerWishDeleted(rows[0].id);
    return { ok: true, id: rows[0].id };
}

/* =========================================================
   Mini-game leaderboard (Phase 5)
   Rows are deleted automatically with their wish (ON DELETE CASCADE).
   ========================================================= */
async function ensureGameScores() {
    await sql`
        CREATE TABLE IF NOT EXISTS game_scores (
            id SERIAL PRIMARY KEY,
            wish_id VARCHAR(10) REFERENCES wishes(id) ON DELETE CASCADE,
            block_id VARCHAR(40) NOT NULL,
            player VARCHAR(40) NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await sql`CREATE INDEX IF NOT EXISTS game_scores_wish_block ON game_scores (wish_id, block_id);`;
}

const MAX_SCORES_PER_WISH = 200;

/** Returns the trivia block's question count if this wish has a leaderboard quiz with that id, else null. */
async function leaderboardQuestionCount(wishId: string, blockId: string): Promise<number | null> {
    const { rows } = await sql`SELECT data FROM wishes WHERE id = ${wishId}`;
    if (!rows.length) return null;
    const data = rows[0].data as { schemaVersion?: number; blocks?: Array<{ id: string; type: string; config: { leaderboard?: boolean; questions?: Array<{ q: string; options: string[] }> } }> };
    if (data?.schemaVersion !== 2 || !Array.isArray(data.blocks)) return null;
    const block = data.blocks.find((b) => b.id === blockId && b.type === "trivia");
    if (!block || !block.config?.leaderboard) return null;
    const qs = (block.config.questions || []).filter((q) => q.q?.trim() && (q.options || []).filter((o) => o?.trim()).length >= 2);
    return qs.length || null;
}

export async function saveGameScore(input: { wishId: string; blockId: string; player: string; score: number }): Promise<{ ok: boolean; error?: string }> {
    await ensureDb();
    await ensureGameScores();
    const total = await leaderboardQuestionCount(input.wishId, input.blockId);
    if (total === null) return { ok: false, error: "Leaderboard not found" };
    const score = Math.round(Number(input.score));
    if (!Number.isFinite(score) || score < 0 || score > total) return { ok: false, error: "Invalid score" };
    // strip control characters / angle brackets, collapse spaces, max 30 chars
    const player = String(input.player || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 30) || "Anonymous";
    const { rows } = await sql`SELECT COUNT(*)::int AS n FROM game_scores WHERE wish_id = ${input.wishId}`;
    if ((rows[0]?.n ?? 0) >= MAX_SCORES_PER_WISH) return { ok: false, error: "Leaderboard is full" };
    await sql`
        INSERT INTO game_scores (wish_id, block_id, player, score, total)
        VALUES (${input.wishId}, ${input.blockId}, ${player}, ${score}, ${total})
    `;
    return { ok: true };
}

export async function getLeaderboard(wishId: string, blockId: string): Promise<Array<{ player: string; score: number; total: number }>> {
    await ensureDb();
    await ensureGameScores();
    const { rows } = await sql`
        SELECT player, score, total FROM game_scores
        WHERE wish_id = ${wishId} AND block_id = ${blockId}
        ORDER BY score DESC, created_at ASC
        LIMIT 10
    `;
    return rows.map((r) => ({ player: String(r.player), score: Number(r.score), total: Number(r.total) }));
}


/**
 * Read-only peek used for link previews (WhatsApp/OG crawlers).
 * Unlike getWish() this does NOT mark the wish as opened or bump view_count,
 * so a chat app fetching the preview never starts the self-destruct timer.
 */
export async function peekWishPreview(id: string): Promise<{ name: string; kind: "birthday" | "anniversary" } | null> {
    if (!/^[a-f0-9]{6,10}$/.test(id)) return null;
    try {
        await ensureDb();
        const { rows } = await sql`SELECT data FROM wishes WHERE id = ${id}`;
        if (rows.length === 0) return null;
        const { v2 } = normalizeWish(rows[0].data);
        const kind = v2.wishType === "anniversary" ? "anniversary" : "birthday";
        const raw = (kind === "anniversary" ? v2.recipient.coupleName || v2.recipient.name : v2.recipient.name || v2.recipient.nickname) || "";
        const name = raw.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
        return { name, kind };
    } catch (error) {
        console.error("Error peeking wish:", error);
        return null;
    }
}

export interface VaultStatusResult {
    totalSpots: number;
    claimedSpots: number;
    spotsLeft: number;
    wishSaved: boolean;
    savedPlan: VaultPlanId | null;
    keepUntil: string | null;
    spotNumber: number | null;
}

export async function getVaultStatus(wishId?: string): Promise<VaultStatusResult> {
    await ensureDb();
    const validWishId = wishId && /^[a-f0-9]{6,10}$/.test(wishId) ? wishId : null;

    const [countRes, wishRes] = await Promise.all([
        sql`SELECT COUNT(*)::int AS c FROM vault_claims WHERE is_free_spot = TRUE`,
        validWishId
            ? sql`
                SELECT vc.plan, vc.keep_until, vc.spot_number, w.keep_until AS w_keep, w.vault_plan AS w_plan
                FROM wishes w
                LEFT JOIN vault_claims vc ON vc.wish_id = w.id
                WHERE w.id = ${validWishId}
                LIMIT 1
              `
            : Promise.resolve({ rows: [] as Record<string, unknown>[] }),
    ]);

    const claimedSpots = Math.min(VAULT_FREE_LIMIT, Number(countRes.rows[0]?.c ?? 0));
    const spotsLeft = Math.max(0, VAULT_FREE_LIMIT - claimedSpots);
    const row = wishRes.rows[0];
    const keepRaw = row?.keep_until || row?.w_keep || null;
    const planRaw = (row?.plan || row?.w_plan || null) as VaultPlanId | null;
    const spotNumber = row?.spot_number ? Number(row.spot_number) : null;
    const keepIso = keepRaw ? new Date(String(keepRaw)).toISOString() : null;
    const wishSaved = !!(keepIso && new Date(keepIso).getTime() > Date.now());

    return {
        totalSpots: VAULT_FREE_LIMIT,
        claimedSpots,
        spotsLeft,
        wishSaved,
        savedPlan: wishSaved ? planRaw : null,
        keepUntil: wishSaved ? keepIso : null,
        spotNumber: wishSaved ? spotNumber : null,
    };
}

export async function claimVaultSpot(input: {
    wishId: string;
    plan: VaultPlanId;
    region: VaultRegion;
    country: string;
    surface: VaultSurface;
}): Promise<
    | ({ status: "claimed" | "already_saved" } & VaultStatusResult)
    | { status: "sold_out" | "not_found"; totalSpots: number; claimedSpots: number; spotsLeft: number }
> {
    await ensureDb();
    const cfg = getVaultRegionConfig(input.region);
    const planOffer = cfg.plans.find((p) => p.id === input.plan) ?? cfg.plans[1];
    const who = input.surface === "finale" ? "recipient" : "creator";

    // Ensure wish exists
    const wishCheck = await sql`SELECT id FROM wishes WHERE id = ${input.wishId} LIMIT 1`;
    if (wishCheck.rows.length === 0) {
        const cur = await getVaultStatus();
        return { status: "not_found", totalSpots: cur.totalSpots, claimedSpots: cur.claimedSpots, spotsLeft: cur.spotsLeft };
    }

    for (let attempt = 0; attempt < 5; attempt++) {
        // 1. Check if this wish already claimed a spot
        const existing = await sql`
            SELECT plan, spot_number, keep_until FROM vault_claims WHERE wish_id = ${input.wishId} LIMIT 1
        `;
        if (existing.rows.length > 0) {
            const st = await getVaultStatus(input.wishId);
            return { status: "already_saved", ...st, wishSaved: true };
        }

        // 2. Check remaining spots out of 200
        const cntRes = await sql`SELECT COUNT(*)::int AS c FROM vault_claims WHERE is_free_spot = TRUE`;
        const currentClaimed = Number(cntRes.rows[0]?.c ?? 0);
        if (currentClaimed >= VAULT_FREE_LIMIT) {
            return { status: "sold_out", totalSpots: VAULT_FREE_LIMIT, claimedSpots: VAULT_FREE_LIMIT, spotsLeft: 0 };
        }

        const nextSpot = currentClaimed + 1;
        const ins = await sql`
            INSERT INTO vault_claims (
                wish_id, plan, region, country, currency, listed_price, surface, who, is_free_spot, spot_number, keep_until
            )
            VALUES (
                ${input.wishId},
                ${planOffer.id},
                ${cfg.region},
                ${input.country.slice(0, 8)},
                ${planOffer.currency},
                ${planOffer.price},
                ${input.surface},
                ${who},
                TRUE,
                ${nextSpot},
                NOW() + (${planOffer.days}::int * INTERVAL '1 day')
            )
            ON CONFLICT DO NOTHING
            RETURNING plan, spot_number, keep_until
        `;

        if (ins.rows.length > 0) {
            const claimedRow = ins.rows[0];
            await sql`
                UPDATE wishes
                SET keep_until = ${claimedRow.keep_until},
                    vault_plan = ${claimedRow.plan}
                WHERE id = ${input.wishId}
            `;
            const freshCnt = await sql`SELECT COUNT(*)::int AS c FROM vault_claims WHERE is_free_spot = TRUE`;
            const claimedSpots = Math.min(VAULT_FREE_LIMIT, Number(freshCnt.rows[0]?.c ?? nextSpot));
            return {
                status: "claimed",
                totalSpots: VAULT_FREE_LIMIT,
                claimedSpots,
                spotsLeft: Math.max(0, VAULT_FREE_LIMIT - claimedSpots),
                wishSaved: true,
                savedPlan: claimedRow.plan as VaultPlanId,
                keepUntil: new Date(String(claimedRow.keep_until)).toISOString(),
                spotNumber: Number(claimedRow.spot_number),
            };
        }
    }

    const fallback = await getVaultStatus(input.wishId);
    if (fallback.wishSaved) return { status: "already_saved", ...fallback };
    return { status: "sold_out", totalSpots: fallback.totalSpots, claimedSpots: fallback.claimedSpots, spotsLeft: fallback.spotsLeft };
}
