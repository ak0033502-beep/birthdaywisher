import { NextResponse } from "next/server";
import {
    castFinalistVote,
    cleanEmail,
    cleanInstagramHandle,
    cleanInstagramReelUrl,
    createGiveawayEntry,
    getGiveawayConfig,
    getPublicGiveawayData,
    resolveGiveawayRegion,
    VALID_PRIZE_IDS,
    type GiveawayPrizeId,
    type GiveawayRegion,
} from "@/lib/giveaway";
import { sendGiveawayEntryConfirmation } from "@/lib/giveawayEmail";
import {
    checkMemoryRateLimit,
    checkPersistentRateLimit,
    getTrustedIp,
    isSameOriginRequest,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tz = (searchParams.get("tz") || "").trim();
        const previewCountry = (searchParams.get("previewCountry") || "").trim();
        const countryHeader = previewCountry || req.headers.get("x-vercel-ip-country");
        const { region, country } = resolveGiveawayRegion(countryHeader, tz);
        const data = await getPublicGiveawayData();
        return NextResponse.json({ ...data, region, country }, { headers: NO_STORE });
    } catch (err) {
        console.error("[giveaway GET] error:", err);
        return NextResponse.json({ error: "Could not load giveaway right now." }, { status: 500, headers: NO_STORE });
    }
}

export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403, headers: NO_STORE });
    }

    const ip = getTrustedIp(req);
    if (!checkMemoryRateLimit(`giveaway_post:${ip}`, 16, 60_000)) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE });
    }

    try {
        const raw = await req.text();
        if (raw.length > 2500) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: NO_STORE });
        }
        const body = JSON.parse(raw) as Record<string, unknown>;
        const action = typeof body.action === "string" ? body.action : "enter";

        if (action === "vote") {
            const rl = await checkPersistentRateLimit("giveaway_vote", ip, 5, 60 * 60 * 1000);
            if (!rl.allowed) {
                return NextResponse.json({ error: "Vote limit reached from this network." }, { status: 429, headers: NO_STORE });
            }
            const entryId = Number(body.entryId);
            if (!Number.isInteger(entryId) || entryId <= 0) {
                return NextResponse.json({ error: "Invalid finalist selected." }, { status: 400, headers: NO_STORE });
            }
            const ua = (req.headers.get("user-agent") || "").slice(0, 120);
            const clientVoterId = typeof body.voterId === "string" ? body.voterId.slice(0, 40) : "";
            // Bind primarily to IP + UA so clearing localStorage cannot cast unlimited votes
            const result = await castFinalistVote(entryId, `${ip}::${ua}::${clientVoterId.slice(0, 8)}`);
            if (!result.ok) {
                return NextResponse.json({ error: result.error }, { status: 400, headers: NO_STORE });
            }
            return NextResponse.json(result, { headers: NO_STORE });
        }

        // Default action: "enter"
        const rl = await checkPersistentRateLimit("giveaway_enter", ip, 6, 30 * 60 * 1000);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "Too many submissions right now. Please try again in a few minutes." },
                { status: 429, headers: NO_STORE },
            );
        }

        const cfg = await getGiveawayConfig();
        if (!cfg.active || cfg.phase === "ended") {
            return NextResponse.json(
                { error: "Entries for this round are now closed! Follow @birthdaywisher.fun for the winner announcement." },
                { status: 400, headers: NO_STORE },
            );
        }
        if (cfg.startsAt && Date.now() < Date.parse(cfg.startsAt)) {
            return NextResponse.json(
                { error: "Entries open automatically tonight at 12:00 AM IST! Get your Reel ready & submit right after midnight." },
                { status: 400, headers: NO_STORE },
            );
        }

        const igHandle = cleanInstagramHandle(body.igHandle);
        if (!igHandle) {
            return NextResponse.json(
                { error: "Please enter a valid Instagram username (e.g. @rahul_creates)." },
                { status: 400, headers: NO_STORE },
            );
        }

        const reelUrl = cleanInstagramReelUrl(body.reelUrl);
        if (!reelUrl) {
            return NextResponse.json(
                { error: "Please paste a valid Instagram Reel link (e.g. https://www.instagram.com/reel/...)." },
                { status: 400, headers: NO_STORE },
            );
        }

        const email = cleanEmail(body.email);
        if (!email) {
            return NextResponse.json(
                { error: "Please enter a valid email address so we can send your official entry ticket." },
                { status: 400, headers: NO_STORE },
            );
        }

        const prizeChoice: GiveawayPrizeId = VALID_PRIZE_IDS.has(body.prizeChoice as GiveawayPrizeId)
            ? (body.prizeChoice as GiveawayPrizeId)
            : "amazon_2000";

        const tz = typeof body.tz === "string" ? body.tz.trim().slice(0, 64) : "";
        const resolved = resolveGiveawayRegion(req.headers.get("x-vercel-ip-country"), tz);
        const chosenRegion: GiveawayRegion =
            body.region === "IN" || body.region === "GLOBAL"
                ? (body.region as GiveawayRegion)
                : resolved.region;

        const created = await createGiveawayEntry({
            igHandle,
            reelUrl,
            email,
            prizeChoice,
            region: chosenRegion,
            country: resolved.country,
            isInPerson: Boolean(body.isInPerson),
            sentCollab: Boolean(body.sentCollab),
            sharedStory: Boolean(body.sharedStory),
            wishLink: typeof body.wishLink === "string" ? body.wishLink : null,
            note: typeof body.note === "string" ? body.note : null,
            emailOptIn: body.emailOptIn !== false,
        });

        if (!created.ok) {
            return NextResponse.json(
                { error: created.error, existingTicket: created.existingTicket },
                { status: 400, headers: NO_STORE },
            );
        }

        // Send ticket confirmation email from hello@birthdaywisher.fun (non-fatal if DNS still propagating)
        let emailSent = false;
        if (body.emailOptIn !== false) {
            const mailRes = await sendGiveawayEntryConfirmation({
                to: email,
                igHandle: created.entry.igHandle,
                ticketCode: created.entry.ticketCode,
                reelUrl: created.entry.reelUrl,
                prizeChoice: created.entry.prizeChoice,
                region: chosenRegion,
                isInPerson: created.entry.isInPerson,
                sentCollab: created.entry.sentCollab,
                sharedStory: created.entry.sharedStory,
                totalScore: created.entry.totalScore,
                unsubToken: created.unsubToken,
            }).catch(() => ({ ok: false, status: 0 }));
            emailSent = mailRes.ok;
        }

        return NextResponse.json(
            {
                ok: true,
                entry: created.entry,
                isSecondReel: created.isSecondReel,
                emailSent,
            },
            { headers: NO_STORE },
        );
    } catch (err) {
        console.error("[giveaway POST] error:", err);
        return NextResponse.json(
            { error: "Something went wrong saving your entry. Please try once more." },
            { status: 500, headers: NO_STORE },
        );
    }
}
