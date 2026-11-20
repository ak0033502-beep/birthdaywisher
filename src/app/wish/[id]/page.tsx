import { WishTimeCapsuleWrapper } from "@/components/story/WishTimeCapsuleWrapper";
import { LockedWishScreen } from "@/components/story/LockedWishScreen";
import { AnalyticsTracker } from "@/components/story/AnalyticsTracker";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import type { Metadata } from "next";
import { getWishForVisitor, getWishReadOnly, peekWishPreview } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isV2 } from "@/lib/wish/migrate";

export const dynamic = "force-dynamic";

const ROBOTS: Metadata["robots"] = { index: false, follow: false, googleBot: { index: false, follow: false } };

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
        const res = await getWishForVisitor(resolvedParams.id);
        if (res.status === "locked") {
            return (
                <LockedWishScreen
                    unlockDate={res.unlockDate}
                    targetName={res.targetName}
                    wishType={res.wishType}
                />
            );
        }
        raw = res.status === "ok" ? res.data : null;
    }

    if (!raw) {
        notFound();
    }

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
