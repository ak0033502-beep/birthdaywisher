import { WishTimeCapsuleWrapper } from "@/components/story/WishTimeCapsuleWrapper";
import { AnalyticsTracker } from "@/components/story/AnalyticsTracker";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import type { Metadata } from "next";
import { getWish, getWishReadOnly, peekWishPreview } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isV2 } from "@/lib/wish/migrate";

export const dynamic = "force-dynamic";

// Private, personal wish page: keep it out of search results
const ROBOTS: Metadata["robots"] = { index: false, follow: false, googleBot: { index: false, follow: false } };

// Chat apps fetch the link to build a preview. They must not count as "opening" the wish
// (getWish starts the self-destruct timer and bumps view_count).
const PREVIEW_BOT = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterestbot|redditbot|Applebot|Googlebot|bingbot|vkShare|Embedly|Iframely/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const peek = await peekWishPreview(id);
    if (!peek) return { title: { absolute: "Wish not found | BirthdayWisher.fun" }, robots: ROBOTS };
    const anniversary = peek?.kind === "anniversary";
    const title = peek?.name
        ? `🎁 ${peek.name}, you've got ${anniversary ? "an anniversary" : "a birthday"} surprise!`
        : "You've got a surprise! 🎁";
    const description = "Someone made you a surprise on BirthdayWisher.fun. Tap to open your gift 🎈";
    return {
        title: { absolute: title },
        description,
        robots: ROBOTS,
        openGraph: { title, description, type: "website", siteName: "BirthdayWisher.fun" },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default async function WishPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const ua = (await headers()).get("user-agent") || "";
    if (PREVIEW_BOT.test(ua)) {
        // Link-preview crawler: show a neutral page (OG tags come from generateMetadata) without opening the wish.
        return <div className="min-h-screen flex items-center justify-center text-center px-4"><h1 className="text-3xl font-bold">You&apos;ve got a surprise! 🎁</h1></div>;
    }
    const admin = await isAdmin();
    let raw: unknown = null;
    let adminMeta: { openedAt: string | null; viewCount: number } | undefined;

    if (admin) {
        const ro = await getWishReadOnly(resolvedParams.id);
        raw = ro?.data ?? null;
        if (ro) adminMeta = { openedAt: ro.openedAt, viewCount: ro.viewCount };
    } else {
        raw = await getWish(resolvedParams.id);
    }

    if (!raw) {
        // Missing / expired wish: real 404 status + the themed "balloon floated away" page with a way back home
        notFound();
    }

    // Wishes made with Wizard 2.0 (v2 blocks): every presentation style (cinematic, terminal,
    // storybook, chat, galaxy, gallery) renders in the v2 engine, so no block is ever dropped.
    if (isV2(raw)) {
        return (
            <>
                {!admin && <AnalyticsTracker />}
                <V2WishShell
                    wish={raw}
                    wishId={admin ? undefined : resolvedParams.id}
                    adminBypass={admin}
                    adminMeta={adminMeta}
                />
            </>
        );
    }

    // All existing (v1) wishes: unchanged for visitors; read-only + lock bypass for admin
    return (
        <>
            {!admin && <AnalyticsTracker />}
            <WishTimeCapsuleWrapper
                wishData={raw as Parameters<typeof WishTimeCapsuleWrapper>[0]["wishData"]}
                adminBypass={admin}
                adminMeta={adminMeta}
            />
        </>
    );
}
