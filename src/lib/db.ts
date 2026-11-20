import "@/lib/netFix";
import { sql } from '@vercel/postgres';
import { WishData } from '@/lib/WishContext';
import { normalizeWish } from '@/lib/wish/migrate';
import crypto from 'crypto';
import { v2 as cloudinary } from "cloudinary";
import { ledgerWishCreated, ledgerWishDeleted, ledgerWishViewed } from "@/lib/analytics";
import { safeEqualSecret } from "@/lib/security";

const RESERVED_SLUGS = new Set([
    "admin", "login", "logout", "api", "support", "help", "official", "verify", "security",
    "billing", "payment", "privacy", "terms", "dmca", "disclaimer", "contact", "about",
    "create", "anniversary", "blog", "games", "dashboard", "wish", "w", "dev", "null", "undefined",
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

export type VisitorWishResult =
    | { status: "missing" }
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
            SELECT data, opened_at FROM wishes WHERE id = ${id}
        `;
        if (rows.length === 0) return { status: "missing" };

        const wishData = rows[0].data as WishData;
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
            SELECT id, view_count, created_at, opened_at, custom_slug, creator_token
            FROM wishes WHERE id = ${wishId}
        `;
        if (wishRows.length === 0) return null;
        const storedToken = typeof wishRows[0].creator_token === "string" ? wishRows[0].creator_token : "";
        if (!storedToken || !safeEqualSecret(creatorToken, storedToken)) return null;

        // Get section analytics
        const { rows: events } = await sql`
            SELECT event_type, section_name, time_spent_ms, created_at
            FROM wish_analytics
            WHERE wish_id = ${wishId}
            ORDER BY created_at ASC
        `;

        // Aggregate section times
        const sectionTimes: Record<string, number> = {};
        let totalTimeMs = 0;
        for (const event of events) {
            if (event.section_name && event.time_spent_ms) {
                sectionTimes[event.section_name] = (sectionTimes[event.section_name] || 0) + event.time_spent_ms;
                totalTimeMs += event.time_spent_ms;
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
            viewCount: wishRows[0].view_count,
            createdAt: wishRows[0].created_at,
            openedAt: wishRows[0].opened_at,
            customSlug: wishRows[0].custom_slug,
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

export async function cleanupExpiredWishes() {
    await ensureDb();
    try {
        // Find wishes opened > 10 hours ago OR created > 7 days ago (never opened)
        const { rows } = await sql`
            SELECT id, data FROM wishes 
            WHERE (opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '10 hours')
               OR (created_at < NOW() - INTERVAL '7 days')
        `;

        let deletedCount = 0;

        for (const row of rows) {
            const unlockMs = getScheduledUnlockTime(row.data);
            // Never delete a scheduled time-capsule wish before (unlock time + 10 hours)
            if (unlockMs !== null && Date.now() < unlockMs + 10 * 3600 * 1000) {
                continue;
            }
            await deleteWishMedia(row.data);

            // Delete row from postgres
            await sql`
                DELETE FROM wishes WHERE id = ${row.id}
            `;
            await ledgerWishDeleted(row.id);
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
