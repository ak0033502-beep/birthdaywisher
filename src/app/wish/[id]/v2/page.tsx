import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getWishForVisitor, getWishReadOnly } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { isCreatorOfWish } from "@/lib/creatorPreview";
import { migrateV1toV2 } from "@/lib/wish/migrate";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import { LockedWishScreen } from "@/components/story/LockedWishScreen";

export const dynamic = "force-dynamic";

const PREVIEW_BOT = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterestbot|redditbot|Applebot|Googlebot|bingbot|vkShare|Embedly|Iframely/i;

export const metadata: Metadata = {
    title: "Wish preview (v2) | BirthdayWisher.fun",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function WishV2PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const ua = (await headers()).get("user-agent") || "";
    if (PREVIEW_BOT.test(ua)) {
        return <div className="min-h-screen flex items-center justify-center text-center px-4"><h1 className="text-3xl font-bold">You&apos;ve got a surprise! 🎁</h1></div>;
    }

    const admin = await isAdmin();
    const creator = !admin && (await isCreatorOfWish(id));
    if (admin || creator) {
        const ro = await getWishReadOnly(id);
        if (!ro) notFound();
        return (
            <V2WishShell
                wish={migrateV1toV2(ro.data)}
                adminBypass={admin}
                previewRole={admin ? "admin" : "creator"}
                adminMeta={{ openedAt: ro.openedAt, viewCount: ro.viewCount }}
            />
        );
    }

    const res = await getWishForVisitor(id);
    if (res.status === "locked") {
        return (
            <LockedWishScreen
                unlockDate={res.unlockDate}
                targetName={res.targetName}
                wishType={res.wishType}
            />
        );
    }
    if (res.status === "missing") {
        notFound();
    }

    return <V2WishShell wish={migrateV1toV2(res.data)} wishId={id} />;
}
