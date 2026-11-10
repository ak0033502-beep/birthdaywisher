import { WishTimeCapsuleWrapper } from "@/components/story/WishTimeCapsuleWrapper";
import { AnalyticsTracker } from "@/components/story/AnalyticsTracker";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import type { Metadata } from "next";
import { getWish, peekWishPreview } from "@/lib/db";
import { headers } from "next/headers";
import { isV2, v2ToV1 } from "@/lib/wish/migrate";

// Private, personal wish page: keep it out of search results
const ROBOTS: Metadata["robots"] = { index: false, follow: false, googleBot: { index: false, follow: false } };

// Chat apps fetch the link to build a preview. They must not count as "opening" the wish
// (getWish starts the self-destruct timer and bumps view_count).
const PREVIEW_BOT = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterestbot|redditbot|Applebot|Googlebot|bingbot|vkShare|Embedly|Iframely/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const peek = await peekWishPreview(id);
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
        return <div className="min-h-screen flex items-center justify-center text-center px-4"><h1 className="text-3xl font-bold">You've got a surprise! 🎁</h1></div>;
    }
    const raw: unknown = await getWish(resolvedParams.id);

    if (!raw) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Wish Not Found</h1>
                    <p className="text-foreground/60 max-w-md">
                        This wish link is either invalid or has self-destructed for privacy reasons.
                    </p>
                </div>
            </div>
        );
    }

    // Wishes made with Wizard 2.0 (v2 blocks)
    if (isV2(raw)) {
        const style = raw.look.presentationStyle || "cinematic";
        return (
            <>
                <AnalyticsTracker />
                {style === "cinematic"
                    ? <V2WishShell wish={raw} wishId={resolvedParams.id} />
                    // the special classic styles (terminal, storybook, chat, galaxy, gallery) still render via their v1 viewers
                    : <WishTimeCapsuleWrapper wishData={v2ToV1(raw)} />}
            </>
        );
    }

    // All existing (v1) wishes: unchanged
    return (
        <>
            <AnalyticsTracker />
            <WishTimeCapsuleWrapper wishData={raw as Parameters<typeof WishTimeCapsuleWrapper>[0]["wishData"]} />
        </>
    );
}
