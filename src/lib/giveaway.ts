import "@/lib/netFix";
import crypto from "crypto";
import { sql } from "@vercel/postgres";
import { kvGet, kvSet } from "@/lib/analytics";
import {
    GIVEAWAY_PRIZES,
    GIVEAWAY_PTS,
    VALID_PRIZE_IDS,
    computeGiveawayScore,
    getGiveawayRegionPack,
    getPrizeInfo,
    resolveGiveawayRegion,
    type AdminGiveawayEntry,
    type GiveawayConfig,
    type GiveawayEntryStatus,
    type GiveawayPhase,
    type GiveawayPrizeId,
    type GiveawayPrizeInfo,
    type GiveawayRegion,
    type PublicGiveawayEntry,
} from "./giveawayTypes";

export {
    GIVEAWAY_PRIZES,
    GIVEAWAY_PTS,
    VALID_PRIZE_IDS,
    computeGiveawayScore,
    getGiveawayRegionPack,
    getPrizeInfo,
    resolveGiveawayRegion,
    type AdminGiveawayEntry,
    type GiveawayConfig,
    type GiveawayEntryStatus,
    type GiveawayPhase,
    type GiveawayPrizeId,
    type GiveawayPrizeInfo,
    type GiveawayRegion,
    type PublicGiveawayEntry,
};

// Scheduled start: Tonight 12:00 AM IST (2026-11-29T00:00:00+05:30) -> 14 full days (2026-12-13T00:00:00+05:30)
export const SCHEDULED_START_IST = "2026-11-29T00:00:00+05:30";
export const SCHEDULED_END_IST = "2026-12-13T00:00:00+05:30";

const BANNED_EMOJI_RE = /[\u2728\u{1F31F}\u2B50\u{1F4AB}\u{1F496}\u{1F320}\u2734\u2747]\uFE0F?/gu;

export function normalizeGiveawayConfig(raw?: Partial<GiveawayConfig> | null): GiveawayConfig {
    const phase: GiveawayPhase =
        raw?.phase === "judging" || raw?.phase === "voting" || raw?.phase === "ended" ? raw.phase : "collecting";
    const startsAt =
        typeof raw?.startsAt === "string" && !Number.isNaN(Date.parse(raw.startsAt))
            ? new Date(raw.startsAt).toISOString()
            : new Date(SCHEDULED_START_IST).toISOString();
    const endsAt =
        typeof raw?.endsAt === "string" && !Number.isNaN(Date.parse(raw.endsAt))
            ? new Date(raw.endsAt).toISOString()
            : new Date(SCHEDULED_END_IST).toISOString();
    const winnerPrize: GiveawayPrizeId = VALID_PRIZE_IDS.has(raw?.winnerPrize as GiveawayPrizeId)
        ? (raw?.winnerPrize as GiveawayPrizeId)
        : "amazon_2000";

    return {
        active: raw?.active !== false,
        showPromos: raw?.showPromos !== false,
        phase,
        startsAt,
        endsAt,
        igPostUrl: typeof raw?.igPostUrl === "string" ? raw.igPostUrl.trim().slice(0, 300) : "",
        winnerHandle: typeof raw?.winnerHandle === "string" ? raw.winnerHandle.replace(BANNED_EMOJI_RE, "").trim().slice(0, 64) : "",
        winnerTicket: typeof raw?.winnerTicket === "string" ? raw.winnerTicket.trim().slice(0, 20) : "",
        winnerPrize,
        winnerReelUrl: typeof raw?.winnerReelUrl === "string" ? raw.winnerReelUrl.trim().slice(0, 350) : "",
        updatedAt: typeof raw?.updatedAt === "string" ? raw.updatedAt : undefined,
    };
}

const gGiveaway = globalThis as unknown as {
    __bwGiveawayDbReadyV4?: Promise<void> | null;
    __bwGiveawayCfg?: { value: GiveawayConfig; expiresAt: number };
};

export function ensureGiveawayDb(): Promise<void> {
    if (!gGiveaway.__bwGiveawayDbReadyV4) {
        gGiveaway.__bwGiveawayDbReadyV4 = (async () => {
            const probe = await sql`
                SELECT to_regclass('public.giveaway_votes') AS gv,
                       EXISTS (
                           SELECT 1 FROM information_schema.columns
                           WHERE table_schema = 'public'
                             AND table_name = 'giveaway_entries'
                             AND column_name = 'in_person_verified'
                       ) AS has_v4
            `;
            if (probe.rows[0]?.gv && probe.rows[0]?.has_v4) return;

            await sql`
                CREATE TABLE IF NOT EXISTS giveaway_entries (
                    id SERIAL PRIMARY KEY,
                    ticket_code VARCHAR(20) UNIQUE NOT NULL,
                    ig_handle VARCHAR(64) NOT NULL,
                    reel_url VARCHAR(400) UNIQUE NOT NULL,
                    email VARCHAR(160) NOT NULL,
                    prize_choice VARCHAR(32) NOT NULL DEFAULT 'amazon_2000',
                    region VARCHAR(8) NOT NULL DEFAULT 'IN',
                    country VARCHAR(8) NOT NULL DEFAULT 'IN',
                    is_in_person BOOLEAN NOT NULL DEFAULT FALSE,
                    sent_collab BOOLEAN NOT NULL DEFAULT FALSE,
                    shared_story BOOLEAN NOT NULL DEFAULT FALSE,
                    reel_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    in_person_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    collab_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    story_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    wish_link VARCHAR(220) DEFAULT NULL,
                    note VARCHAR(240) DEFAULT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'approved',
                    creativity_score SMALLINT NOT NULL DEFAULT 0,
                    engagement_score SMALLINT NOT NULL DEFAULT 0,
                    bonus_score SMALLINT NOT NULL DEFAULT 0,
                    public_votes INTEGER NOT NULL DEFAULT 0,
                    email_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
                    unsub_token VARCHAR(48) UNIQUE NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS region VARCHAR(8) NOT NULL DEFAULT 'IN';`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS country VARCHAR(8) NOT NULL DEFAULT 'IN';`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS is_in_person BOOLEAN NOT NULL DEFAULT FALSE;`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS reel_verified BOOLEAN NOT NULL DEFAULT FALSE;`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS in_person_verified BOOLEAN NOT NULL DEFAULT FALSE;`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS collab_verified BOOLEAN NOT NULL DEFAULT FALSE;`;
            await sql`ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS story_verified BOOLEAN NOT NULL DEFAULT FALSE;`;
            await sql`
                CREATE TABLE IF NOT EXISTS giveaway_votes (
                    id SERIAL PRIMARY KEY,
                    entry_id INTEGER NOT NULL REFERENCES giveaway_entries(id) ON DELETE CASCADE,
                    voter_hash VARCHAR(64) UNIQUE NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `;
            await Promise.all([
                sql`CREATE INDEX IF NOT EXISTS giveaway_entries_status_idx ON giveaway_entries (status, created_at DESC);`,
                sql`CREATE INDEX IF NOT EXISTS giveaway_entries_handle_idx ON giveaway_entries (LOWER(ig_handle));`,
            ]);
        })().catch((err) => {
            gGiveaway.__bwGiveawayDbReadyV4 = null;
            throw err;
        });
    }
    return gGiveaway.__bwGiveawayDbReadyV4;
}

const CFG_TTL_MS = 2 * 60 * 1000;

export async function getGiveawayConfig(forceFresh = false): Promise<GiveawayConfig> {
    const now = Date.now();
    if (!forceFresh && gGiveaway.__bwGiveawayCfg && gGiveaway.__bwGiveawayCfg.expiresAt > now) {
        return gGiveaway.__bwGiveawayCfg.value;
    }
    try {
        const row = await Promise.race([
            kvGet<Partial<GiveawayConfig>>("giveaway_config"),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
        ]);
        if (!row?.v) {
            // Persist initial 14-day window on first read so countdown stays anchored across restarts
            const initial = normalizeGiveawayConfig(null);
            await kvSet("giveaway_config", initial).catch(() => {});
            gGiveaway.__bwGiveawayCfg = { value: initial, expiresAt: now + CFG_TTL_MS };
            return initial;
        }
        const cfg = normalizeGiveawayConfig(row.v);
        gGiveaway.__bwGiveawayCfg = { value: cfg, expiresAt: now + CFG_TTL_MS };
        return cfg;
    } catch {
        const fallback = gGiveaway.__bwGiveawayCfg?.value ?? normalizeGiveawayConfig(null);
        gGiveaway.__bwGiveawayCfg = { value: fallback, expiresAt: now + 30_000 };
        return fallback;
    }
}

export async function saveGiveawayConfig(patch: Partial<GiveawayConfig>): Promise<GiveawayConfig> {
    const current = await getGiveawayConfig(true);
    const merged = normalizeGiveawayConfig({
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
    });
    await kvSet("giveaway_config", merged);
    gGiveaway.__bwGiveawayCfg = { value: merged, expiresAt: Date.now() + CFG_TTL_MS };
    return merged;
}

/* ---------- Sanitizers & Validators ---------- */

export function cleanInstagramHandle(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    let s = raw.trim();
    // Extract handle if user pasted full profile URL
    const urlMatch = s.match(/instagram\.com\/([a-zA-Z0-9._]{1,30})/i);
    if (urlMatch && !["reel", "reels", "p", "stories", "explore"].includes(urlMatch[1].toLowerCase())) {
        s = urlMatch[1];
    }
    s = s.replace(/^@+/, "").trim();
    if (!/^[a-zA-Z0-9._]{2,30}$/.test(s)) return null;
    return `@${s.toLowerCase()}`;
}

export function cleanInstagramReelUrl(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    try {
        const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
        const host = u.hostname.toLowerCase().replace(/^www\./, "");
        if (host !== "instagram.com" && host !== "instagr.am") return null;
        const m = u.pathname.match(/^\/(?:[a-zA-Z0-9._]+\/)?(reel|reels|p)\/([a-zA-Z0-9_-]{5,32})/i);
        if (!m) return null;
        return `https://www.instagram.com/reel/${m[2]}/`;
    } catch {
        return null;
    }
}

export function cleanEmail(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const s = raw.trim().toLowerCase();
    if (s.length < 5 || s.length > 150) return null;
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return null;
    return s;
}

/* ---------- Public & Admin Queries ---------- */

function formatTicketCode(id: number): string {
    return `BW-${String(id).padStart(3, "0")}`;
}

export async function createGiveawayEntry(input: {
    igHandle: string;
    reelUrl: string;
    email: string;
    prizeChoice: GiveawayPrizeId;
    region?: GiveawayRegion;
    country?: string;
    isInPerson: boolean;
    sentCollab: boolean;
    sharedStory: boolean;
    wishLink?: string | null;
    note?: string | null;
    emailOptIn?: boolean;
}): Promise<
    | { ok: true; entry: PublicGiveawayEntry; unsubToken: string; isSecondReel: boolean }
    | { ok: false; error: string; existingTicket?: string }
> {
    await ensureGiveawayDb();
    const region: GiveawayRegion = input.region === "GLOBAL" ? "GLOBAL" : "IN";
    const country = (input.country || region).slice(0, 8);
    const effectivePrize: GiveawayPrizeId = region === "GLOBAL" ? "amazon_2000" : input.prizeChoice;

    // 1. Check duplicate Reel URL
    const dupReel = await sql`
        SELECT ticket_code FROM giveaway_entries WHERE reel_url = ${input.reelUrl} LIMIT 1
    `;
    if (dupReel.rows.length > 0) {
        return {
            ok: false,
            error: `This Reel link is already registered under Ticket ${String(dupReel.rows[0].ticket_code)}!`,
            existingTicket: String(dupReel.rows[0].ticket_code),
        };
    }

    // 2. Fair cap: max 2 genuine Reels per Instagram handle
    const handleCountRes = await sql`
        SELECT COUNT(*)::int AS c
        FROM giveaway_entries
        WHERE LOWER(ig_handle) = LOWER(${input.igHandle}) AND status != 'rejected'
    `;
    const prevCount = Number(handleCountRes.rows[0]?.c ?? 0);
    if (prevCount >= 2) {
        return {
            ok: false,
            error: "Maximum 2 creative Reel entries per Instagram account reached — best of luck!",
        };
    }

    const tempTicket = `TMP-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const unsubToken = crypto.randomBytes(18).toString("hex");
    const cleanNote = input.note ? input.note.replace(BANNED_EMOJI_RE, "").trim().slice(0, 220) : null;
    const cleanWish = input.wishLink ? input.wishLink.trim().slice(0, 200) : null;

    // Zero blind self-awarded points: Reel (+10), In-Person (+15), Collab (+5), and Story (+5) are unlocked via 1-click Admin verification
    const ins = await sql`
        INSERT INTO giveaway_entries (
            ticket_code, ig_handle, reel_url, email, prize_choice, region, country,
            is_in_person, sent_collab, shared_story,
            reel_verified, in_person_verified, collab_verified, story_verified,
            wish_link, note, bonus_score, email_opt_in, unsub_token
        )
        VALUES (
            ${tempTicket}, ${input.igHandle}, ${input.reelUrl}, ${input.email}, ${effectivePrize}, ${region}, ${country},
            ${input.isInPerson}, ${input.sentCollab}, ${input.sharedStory},
            FALSE, FALSE, FALSE, FALSE,
            ${cleanWish}, ${cleanNote}, 0, ${input.emailOptIn !== false}, ${unsubToken}
        )
        RETURNING id, created_at
    `;

    const id = Number(ins.rows[0].id);
    const ticketCode = formatTicketCode(id);
    await sql`UPDATE giveaway_entries SET ticket_code = ${ticketCode} WHERE id = ${id}`;

    return {
        ok: true,
        unsubToken,
        isSecondReel: prevCount === 1,
        entry: {
            id,
            ticketCode,
            igHandle: input.igHandle,
            reelUrl: input.reelUrl,
            prizeChoice: effectivePrize,
            region,
            isInPerson: input.isInPerson,
            sentCollab: input.sentCollab,
            sharedStory: input.sharedStory,
            reelVerified: false,
            inPersonVerified: false,
            collabVerified: false,
            storyVerified: false,
            note: cleanNote,
            status: "approved",
            totalScore: 0,
            publicVotes: 0,
            createdAt: new Date(String(ins.rows[0].created_at)).toISOString(),
        },
    };
}

function mapPublicRow(r: Record<string, unknown>): PublicGiveawayEntry {
    const reelVerified = Boolean(r.reel_verified);
    const inPersonVerified = Boolean(r.in_person_verified);
    const collabVerified = Boolean(r.collab_verified);
    const storyVerified = Boolean(r.story_verified);
    const creativity = Number(r.creativity_score ?? 0);
    const engagement = Number(r.engagement_score ?? 0);
    const region: GiveawayRegion = r.region === "GLOBAL" ? "GLOBAL" : "IN";
    return {
        id: Number(r.id),
        ticketCode: String(r.ticket_code),
        igHandle: String(r.ig_handle),
        reelUrl: String(r.reel_url),
        prizeChoice: (VALID_PRIZE_IDS.has(r.prize_choice as GiveawayPrizeId) ? r.prize_choice : "amazon_2000") as GiveawayPrizeId,
        region,
        isInPerson: Boolean(r.is_in_person),
        sentCollab: Boolean(r.sent_collab),
        sharedStory: Boolean(r.shared_story),
        reelVerified,
        inPersonVerified,
        collabVerified,
        storyVerified,
        note: r.note ? String(r.note) : null,
        status: (r.status as GiveawayEntryStatus) || "approved",
        totalScore: computeGiveawayScore({
            reelVerified,
            inPersonVerified,
            collabVerified,
            storyVerified,
            creativityScore: creativity,
            engagementScore: engagement,
        }),
        publicVotes: Number(r.public_votes ?? 0),
        createdAt: new Date(String(r.created_at)).toISOString(),
    };
}

export async function getPublicGiveawayData() {
    await ensureGiveawayDb();
    const [config, rowsRes] = await Promise.all([
        getGiveawayConfig(),
        sql`
            SELECT id, ticket_code, ig_handle, reel_url, prize_choice, region,
                   is_in_person, sent_collab, shared_story,
                   reel_verified, in_person_verified, collab_verified, story_verified,
                   note, status, creativity_score, engagement_score, bonus_score, public_votes, created_at
            FROM giveaway_entries
            WHERE status != 'rejected'
            ORDER BY
                CASE WHEN status = 'winner' THEN 0 WHEN status = 'finalist' THEN 1 ELSE 2 END,
                ((CASE WHEN reel_verified THEN 10 ELSE 0 END)
                 + (CASE WHEN in_person_verified THEN 15 ELSE 0 END)
                 + (CASE WHEN collab_verified THEN 5 ELSE 0 END)
                 + (CASE WHEN story_verified THEN 5 ELSE 0 END)
                 + creativity_score + engagement_score) DESC,
                reel_verified DESC,
                created_at DESC
            LIMIT 100
        `,
    ]);

    const entries = rowsRes.rows.map(mapPublicRow);
    const finalists = entries
        .filter((e) => e.status === "finalist" || e.status === "winner")
        .sort((a, b) => b.totalScore - a.totalScore || b.publicVotes - a.publicVotes);

    return {
        config,
        totalEntries: entries.length,
        entries,
        finalists,
    };
}

export async function castFinalistVote(entryId: number, voterRawKey: string): Promise<
    | { ok: true; publicVotes: number }
    | { ok: false; error: string }
> {
    await ensureGiveawayDb();
    const config = await getGiveawayConfig();
    if (config.phase !== "voting") {
        return { ok: false, error: "Public finalist voting is not active right now." };
    }

    const check = await sql`
        SELECT id, status FROM giveaway_entries WHERE id = ${entryId} LIMIT 1
    `;
    if (!check.rows.length || check.rows[0].status !== "finalist") {
        return { ok: false, error: "Only shortlisted Top 5 Finalists can receive votes." };
    }

    const voterHash = crypto
        .createHash("sha256")
        .update(`bw_vote_v1::${voterRawKey}`)
        .digest("hex");

    const ins = await sql`
        INSERT INTO giveaway_votes (entry_id, voter_hash)
        VALUES (${entryId}, ${voterHash})
        ON CONFLICT (voter_hash) DO NOTHING
        RETURNING id
    `;
    if (ins.rows.length === 0) {
        return { ok: false, error: "You have already cast your vote in this finale poll!" };
    }

    const upd = await sql`
        UPDATE giveaway_entries
        SET public_votes = public_votes + 1
        WHERE id = ${entryId}
        RETURNING public_votes
    `;
    return { ok: true, publicVotes: Number(upd.rows[0]?.public_votes ?? 1) };
}

export async function unsubscribeGiveawayEmail(token: string): Promise<boolean> {
    if (!token || token.length < 16) return false;
    await ensureGiveawayDb();
    const res = await sql`
        UPDATE giveaway_entries
        SET email_opt_in = FALSE
        WHERE unsub_token = ${token}
        RETURNING id
    `;
    return res.rows.length > 0;
}

export async function getAdminGiveawayDashboard() {
    await ensureGiveawayDb();
    const [config, entriesRes] = await Promise.all([
        getGiveawayConfig(true),
        sql`
            SELECT id, ticket_code, ig_handle, reel_url, email, email_opt_in, prize_choice, region, country,
                   is_in_person, sent_collab, shared_story,
                   reel_verified, in_person_verified, collab_verified, story_verified,
                   wish_link, note, status, creativity_score, engagement_score, bonus_score, public_votes, created_at
            FROM giveaway_entries
            ORDER BY
                CASE WHEN status = 'winner' THEN 0 WHEN status = 'finalist' THEN 1 ELSE 2 END,
                ((CASE WHEN reel_verified THEN 10 ELSE 0 END)
                 + (CASE WHEN in_person_verified THEN 15 ELSE 0 END)
                 + (CASE WHEN collab_verified THEN 5 ELSE 0 END)
                 + (CASE WHEN story_verified THEN 5 ELSE 0 END)
                 + creativity_score + engagement_score) DESC,
                created_at DESC
            LIMIT 300
        `,
    ]);

    const entries: AdminGiveawayEntry[] = entriesRes.rows.map((r) => ({
        ...mapPublicRow(r),
        email: String(r.email),
        emailOptIn: Boolean(r.email_opt_in),
        country: r.country ? String(r.country) : "IN",
        wishLink: r.wish_link ? String(r.wish_link) : null,
        creativityScore: Number(r.creativity_score ?? 0),
        engagementScore: Number(r.engagement_score ?? 0),
        bonusScore: Number(r.bonus_score ?? 0),
    }));

    const activeEntries = entries.filter((e) => e.status !== "rejected");
    const prizeBreakdown = GIVEAWAY_PRIZES.map((p) => ({
        key: `${p.emoji} ${p.shortTitle}`,
        n: activeEntries.filter((e) => e.region !== "GLOBAL" && e.prizeChoice === p.id).length,
    }));
    const globalCount = activeEntries.filter((e) => e.region === "GLOBAL").length;
    if (globalCount > 0) {
        prizeBreakdown.push({ key: "🌍 $25 USD Global Gift Card", n: globalCount });
    }

    const uniqueEmails = new Set(
        activeEntries.filter((e) => e.emailOptIn).map((e) => e.email.toLowerCase()),
    ).size;

    const topScore = activeEntries.reduce((m, e) => Math.max(m, e.totalScore), 0);

    return {
        config,
        resendReady: Boolean((process.env.RESEND_API_KEY || "").trim()),
        fromAddress: (process.env.GIVEAWAY_FROM_EMAIL || "BirthdayWisher.fun <hello@birthdaywisher.fun>").trim(),
        kpis: {
            total: activeEntries.length,
            verifiedReels: activeEntries.filter((e) => e.reelVerified).length,
            inPerson: activeEntries.filter((e) => e.isInPerson).length,
            verifiedInPerson: activeEntries.filter((e) => e.inPersonVerified).length,
            finalists: entries.filter((e) => e.status === "finalist").length,
            collabs: activeEntries.filter((e) => e.sentCollab).length,
            verifiedCollabs: activeEntries.filter((e) => e.collabVerified).length,
            stories: activeEntries.filter((e) => e.sharedStory).length,
            verifiedStories: activeEntries.filter((e) => e.storyVerified).length,
            emailable: uniqueEmails,
            topScore,
            totalVotes: activeEntries.reduce((s, e) => s + e.publicVotes, 0),
        },
        prizeBreakdown,
        entries,
    };
}

export async function updateAdminGiveawayEntry(input: {
    id: number;
    status?: GiveawayEntryStatus;
    reelVerified?: boolean;
    inPersonVerified?: boolean;
    collabVerified?: boolean;
    storyVerified?: boolean;
    creativityScore?: number;
    engagementScore?: number;
    bonusScore?: number;
}) {
    await ensureGiveawayDb();
    const curRes = await sql`SELECT * FROM giveaway_entries WHERE id = ${input.id} LIMIT 1`;
    if (!curRes.rows.length) return null;
    const cur = curRes.rows[0];

    const status: GiveawayEntryStatus =
        input.status && ["approved", "finalist", "winner", "rejected"].includes(input.status)
            ? input.status
            : (cur.status as GiveawayEntryStatus);
    const reelVerified =
        input.reelVerified !== undefined ? Boolean(input.reelVerified) : Boolean(cur.reel_verified);
    const inPersonVerified =
        input.inPersonVerified !== undefined ? Boolean(input.inPersonVerified) : Boolean(cur.in_person_verified);
    const collabVerified =
        input.collabVerified !== undefined ? Boolean(input.collabVerified) : Boolean(cur.collab_verified);
    const storyVerified =
        input.storyVerified !== undefined ? Boolean(input.storyVerified) : Boolean(cur.story_verified);
    const creativity =
        input.creativityScore !== undefined
            ? Math.max(0, Math.min(GIVEAWAY_PTS.CREATIVITY_MAX, Math.round(input.creativityScore)))
            : Math.min(GIVEAWAY_PTS.CREATIVITY_MAX, Number(cur.creativity_score ?? 0));
    const engagement =
        input.engagementScore !== undefined
            ? Math.max(0, Math.min(GIVEAWAY_PTS.ENGAGEMENT_MAX, Math.round(input.engagementScore)))
            : Math.min(GIVEAWAY_PTS.ENGAGEMENT_MAX, Number(cur.engagement_score ?? 0));
    const bonus =
        (reelVerified ? GIVEAWAY_PTS.REEL : 0) +
        (inPersonVerified ? GIVEAWAY_PTS.IN_PERSON : 0) +
        (collabVerified ? GIVEAWAY_PTS.COLLAB : 0) +
        (storyVerified ? GIVEAWAY_PTS.STORY : 0);

    await sql`
        UPDATE giveaway_entries
        SET status = ${status},
            reel_verified = ${reelVerified},
            in_person_verified = ${inPersonVerified},
            collab_verified = ${collabVerified},
            story_verified = ${storyVerified},
            creativity_score = ${creativity},
            engagement_score = ${engagement},
            bonus_score = ${bonus}
        WHERE id = ${input.id}
    `;

    if (status === "winner") {
        await saveGiveawayConfig({
            phase: "ended",
            winnerHandle: String(cur.ig_handle),
            winnerTicket: String(cur.ticket_code),
            winnerPrize: cur.prize_choice as GiveawayPrizeId,
            winnerReelUrl: String(cur.reel_url),
        });
    }
    return true;
}

export async function deleteAdminGiveawayEntry(id: number) {
    await ensureGiveawayDb();
    await sql`DELETE FROM giveaway_entries WHERE id = ${id}`;
}

export async function getEmailableParticipants(onlyFinalists = false): Promise<
    Array<{ email: string; igHandle: string; ticketCode: string; unsubToken: string; prizeChoice: GiveawayPrizeId; region: GiveawayRegion }>
> {
    await ensureGiveawayDb();
    const res = onlyFinalists
        ? await sql`
              SELECT DISTINCT ON (LOWER(email)) email, ig_handle, ticket_code, unsub_token, prize_choice, region
              FROM giveaway_entries
              WHERE email_opt_in = TRUE AND status IN ('finalist', 'winner')
              ORDER BY LOWER(email), created_at DESC
          `
        : await sql`
              SELECT DISTINCT ON (LOWER(email)) email, ig_handle, ticket_code, unsub_token, prize_choice, region
              FROM giveaway_entries
              WHERE email_opt_in = TRUE AND status != 'rejected'
              ORDER BY LOWER(email), created_at DESC
          `;
    return res.rows.map((r) => ({
        email: String(r.email),
        igHandle: String(r.ig_handle),
        ticketCode: String(r.ticket_code),
        unsubToken: String(r.unsub_token),
        prizeChoice: r.prize_choice as GiveawayPrizeId,
        region: r.region === "GLOBAL" ? "GLOBAL" : "IN",
    }));
}
