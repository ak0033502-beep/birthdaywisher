import { WishTimeCapsuleWrapper } from "@/components/story/WishTimeCapsuleWrapper";
import { LockedWishScreen } from "@/components/story/LockedWishScreen";
import { ExpiredWishScreen } from "@/components/story/ExpiredWishScreen";
import { AnalyticsTracker } from "@/components/story/AnalyticsTracker";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import type { Metadata } from "next";
import { getExpiredWishInfo, getWishForVisitor, getWishReadOnly, peekWishPreview } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { isCreatorOfWish } from "@/lib/creatorPreview";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isV2 } from "@/lib/wish/migrate";

export const dynamic = "force-dynamic";

const ROBOTS: Metadata["robots"] = { index: false, follow: false, googleBot: { index: false, follow: false } };

const PREVIEW_BOT = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterestbot|redditbot|Applebot|Googlebot|bingbot|vkShare|Embedly|Iframely/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const peek = await peekWishPreview(id);
    if (!peek) {
        const exp = await getExpiredWishInfo(id);
        if (exp) {
            const expTitle = "⏳ This 10-Hour Secret Surprise Self-Destructed! | BirthdayWisher.fun";
            const expDesc = "Every surprise on BirthdayWisher.fun vanishes 10 hours after opening. Make your own free birthday or anniversary surprise in 60 seconds!";
            return {
                title: { absolute: expTitle },
                description: expDesc,
                robots: ROBOTS,
                openGraph: { title: expTitle, description: expDesc, type: "website", siteName: "BirthdayWisher.fun" },
                twitter: { card: "summary_large_image", title: expTitle, description: expDesc },
            };
        }
        return { title: { absolute: "Wish not found | BirthdayWisher.fun" }, robots: ROBOTS };
    }
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
    const creator = !admin && (await isCreatorOfWish(resolvedParams.id));
    const readOnlyMode = admin || creator;
    const previewRole = admin ? "admin" : creator ? "creator" : undefined;
    let raw: unknown = null;
    let adminMeta: { openedAt: string | null; viewCount: number } | undefined;

    if (readOnlyMode) {
        const ro = await getWishReadOnly(resolvedParams.id);
        raw = ro?.data ?? null;
        if (ro) adminMeta = { openedAt: ro.openedAt, viewCount: ro.viewCount };
        if (!raw) {
            const exp = await getExpiredWishInfo(resolvedParams.id);
            if (exp) {
                return (
                    <ExpiredWishScreen
                        wishId={resolvedParams.id}
                        wishType={exp.wishType}
                        style={exp.style}
                        gamesCount={exp.gamesCount}
                        views={exp.views}
                    />
                );
            }
        }
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
        if (res.status === "expired") {
            return (
                <ExpiredWishScreen
                    wishId={resolvedParams.id}
                    wishType={res.wishType}
                    style={res.style}
                    gamesCount={res.gamesCount}
                    views={res.views}
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
                {!readOnlyMode && <AnalyticsTracker />}
                <V2WishShell
                    wish={raw}
                    wishId={readOnlyMode ? undefined : resolvedParams.id}
                    adminBypass={admin}
                    previewRole={previewRole}
                    adminMeta={adminMeta}
                />
            </>
        );
    }

    return (
        <>
            {!readOnlyMode && <AnalyticsTracker />}
            <WishTimeCapsuleWrapper
                wishData={raw as Parameters<typeof WishTimeCapsuleWrapper>[0]["wishData"]}
                adminBypass={admin}
                previewRole={previewRole}
                adminMeta={adminMeta}
            />
        </>
    );
}
