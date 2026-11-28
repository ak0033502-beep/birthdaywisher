import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSameOriginAdmin } from "@/lib/adminAuth";
import {
    cleanEmail,
    deleteAdminGiveawayEntry,
    getEmailableParticipants,
    saveGiveawayConfig,
    updateAdminGiveawayEntry,
    type GiveawayConfig,
    type GiveawayEntryStatus,
} from "@/lib/giveaway";
import { buildBroadcastEmailHtml, buildEntryTicketEmail, sendResendEmail } from "@/lib/giveawayEmail";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    if (!(await isSameOriginAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as Record<string, unknown>;
        const action = typeof body.action === "string" ? body.action : "";

        if (action === "save_config") {
            const patch = (body.config ?? {}) as Partial<GiveawayConfig>;
            const saved = await saveGiveawayConfig(patch);
            revalidatePath("/giveaway");
            revalidatePath("/admin");
            return NextResponse.json({ ok: true, config: saved });
        }

        if (action === "update_entry") {
            const id = Number(body.id);
            if (!Number.isInteger(id) || id <= 0) {
                return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });
            }
            await updateAdminGiveawayEntry({
                id,
                status: typeof body.status === "string" ? (body.status as GiveawayEntryStatus) : undefined,
                reelVerified: typeof body.reelVerified === "boolean" ? body.reelVerified : undefined,
                inPersonVerified: typeof body.inPersonVerified === "boolean" ? body.inPersonVerified : undefined,
                collabVerified: typeof body.collabVerified === "boolean" ? body.collabVerified : undefined,
                storyVerified: typeof body.storyVerified === "boolean" ? body.storyVerified : undefined,
                creativityScore: body.creativityScore !== undefined ? Number(body.creativityScore) : undefined,
                engagementScore: body.engagementScore !== undefined ? Number(body.engagementScore) : undefined,
                bonusScore: body.bonusScore !== undefined ? Number(body.bonusScore) : undefined,
            });
            revalidatePath("/giveaway");
            revalidatePath("/admin");
            return NextResponse.json({ ok: true });
        }

        if (action === "delete_entry") {
            const id = Number(body.id);
            if (!Number.isInteger(id) || id <= 0) {
                return NextResponse.json({ error: "Invalid entry id" }, { status: 400 });
            }
            await deleteAdminGiveawayEntry(id);
            revalidatePath("/giveaway");
            revalidatePath("/admin");
            return NextResponse.json({ ok: true });
        }

        if (action === "preview_email") {
            const kind = body.kind === "broadcast" ? "broadcast" : "ticket";
            if (kind === "ticket") {
                const built = buildEntryTicketEmail({
                    igHandle: "@akshay_creator",
                    ticketCode: "BW-007",
                    reelUrl: "https://www.instagram.com/reel/DC9xYz12_Ab/",
                    prizeChoice: "oneplus_buds",
                    isInPerson: true,
                    sentCollab: true,
                    sharedStory: true,
                    totalScore: 0,
                    unsubToken: "preview_only_token",
                });
                return NextResponse.json({ ok: true, subject: built.subject, html: built.html });
            }
            const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject.trim() : "⚖️ ReelFest 100-Point Final Scoring Is Underway!";
            const heading = typeof body.heading === "string" && body.heading.trim() ? body.heading.trim() : subject;
            const message = typeof body.message === "string" && body.message.trim()
                ? body.message.trim()
                : "Your Reel made this challenge unforgettable! Our team is verifying all Reels, Collabs & Story tags on the Open 100-Point Scoreboard.";
            const ctaLabel = typeof body.ctaLabel === "string" && body.ctaLabel.trim() ? body.ctaLabel.trim() : "Check Open 100-Point Scoreboard →";
            const built = buildBroadcastEmailHtml({
                heading,
                bodyText: message,
                ctaLabel,
                ctaUrl: `${SITE_URL}/giveaway`,
                igHandle: "@akshay_creator",
                ticketCode: "BW-007",
                prizeChoice: "oneplus_buds",
                unsubToken: "preview_only_token",
            });
            return NextResponse.json({ ok: true, subject, html: built.html });
        }

        if (action === "test_email") {
            const to = cleanEmail(body.to) || "hello@birthdaywisher.fun";
            const kind = body.kind === "broadcast" ? "broadcast" : "ticket";
            if (kind === "ticket") {
                const built = buildEntryTicketEmail({
                    igHandle: "@akshay_creator",
                    ticketCode: "BW-007",
                    reelUrl: "https://www.instagram.com/reel/DC9xYz12_Ab/",
                    prizeChoice: "oneplus_buds",
                    isInPerson: true,
                    sentCollab: true,
                    sharedStory: true,
                    totalScore: 0,
                    unsubToken: "test_token_preview",
                });
                const res = await sendResendEmail({
                    to,
                    subject: `[TEST] ${built.subject}`,
                    html: built.html,
                    text: built.text,
                });
                return NextResponse.json(res, { status: res.ok ? 200 : 400 });
            }

            const subject = typeof body.subject === "string" && body.subject.trim()
                ? `[TEST] ${body.subject.trim().slice(0, 130)}`
                : "✅ [TEST] BirthdayWisher Creator Update (hello@birthdaywisher.fun)";
            const heading = typeof body.heading === "string" && body.heading.trim()
                ? body.heading.trim().slice(0, 140)
                : "Top 5 Finalists Voting Is LIVE for 24 Hours! 🗳️";
            const message = typeof body.message === "string" && body.message.trim()
                ? body.message.trim().slice(0, 2500)
                : "Your Resend API key and hello@birthdaywisher.fun sender address are verified and ready!";
            const ctaLabel = typeof body.ctaLabel === "string" && body.ctaLabel.trim()
                ? body.ctaLabel.trim().slice(0, 60)
                : "Open Giveaway Page →";
            const { html, text } = buildBroadcastEmailHtml({
                heading,
                bodyText: message,
                ctaLabel,
                ctaUrl: `${SITE_URL}/giveaway`,
                igHandle: "@akshay_creator",
                ticketCode: "BW-007",
                prizeChoice: "oneplus_buds",
            });
            const res = await sendResendEmail({
                to,
                subject,
                html,
                text,
            });
            return NextResponse.json(res, { status: res.ok ? 200 : 400 });
        }

        if (action === "broadcast_email") {
            const audience = body.audience === "finalists" ? "finalists" : "all";
            const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 140) : "";
            const heading = typeof body.heading === "string" ? body.heading.trim().slice(0, 140) : subject;
            const message = typeof body.message === "string" ? body.message.trim().slice(0, 2500) : "";
            const ctaLabel = typeof body.ctaLabel === "string" && body.ctaLabel.trim()
                ? body.ctaLabel.trim().slice(0, 60)
                : "View Live Giveaway Page →";
            const ctaUrl = typeof body.ctaUrl === "string" && body.ctaUrl.trim()
                ? body.ctaUrl.trim().slice(0, 300)
                : `${SITE_URL}/giveaway`;

            if (!subject || !message) {
                return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
            }

            const recipients = await getEmailableParticipants(audience === "finalists");
            if (!recipients.length) {
                return NextResponse.json({ error: "No opted-in participants found for this audience yet." }, { status: 400 });
            }

            let sent = 0;
            let failed = 0;
            let firstError = "";

            // Pace cleanly within Resend's 2 req/sec rate limit & 100/day free quota
            for (const r of recipients.slice(0, 95)) {
                const { html, text } = buildBroadcastEmailHtml({
                    heading,
                    bodyText: message,
                    ctaLabel,
                    ctaUrl,
                    igHandle: r.igHandle,
                    ticketCode: r.ticketCode,
                    prizeChoice: r.prizeChoice,
                    region: r.region,
                    unsubToken: r.unsubToken,
                });
                const res = await sendResendEmail({
                    to: r.email,
                    subject,
                    html,
                    text,
                    unsubUrl: `${SITE_URL}/api/giveaway/unsubscribe?token=${encodeURIComponent(r.unsubToken)}`,
                });
                if (res.ok) sent++;
                else {
                    failed++;
                    if (!firstError && res.error) firstError = res.error;
                }
                await new Promise((resolve) => setTimeout(resolve, 520));
            }

            return NextResponse.json({
                ok: sent > 0,
                sent,
                failed,
                totalTargeted: recipients.length,
                firstError: firstError || undefined,
            });
        }

        return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
    } catch (err) {
        console.error("[admin/giveaway POST] error:", err);
        return NextResponse.json({ error: "Admin giveaway request failed" }, { status: 500 });
    }
}
