import type { Metadata } from "next";
import { headers } from "next/headers";
import { GiveawayClient } from "@/components/giveaway/GiveawayClient";
import { getPublicGiveawayData, resolveGiveawayRegion } from "@/lib/giveaway";
import { GIVEAWAY_NAME } from "@/lib/giveawayTypes";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: `${GIVEAWAY_NAME} — Win ₹2,000 / $25 Gear or Amazon Voucher | BirthdayWisher.fun`,
    description:
        "Join BirthdayWisher ReelFest! Drop a 15–30 second Instagram Reel (#BWReelFest), earn +15 direct bonus points for In-Person Reels on our Open 100-Point Scoreboard, and win ₹2,000 in India or a $25 USD Gift Card worldwide!",
    alternates: { canonical: `${SITE_URL}/giveaway` },
    openGraph: {
        title: `🎁 ${GIVEAWAY_NAME} — Win ₹2,000 / $25 Gear or Amazon Voucher`,
        description:
            "Drop a 15–30s Reel (#BWReelFest) — get +15 direct bonus points for In-Person / reaction Reels & claim your official #BW ReelFest VIP Pass!",
        url: `${SITE_URL}/giveaway`,
        type: "website",
    },
};

export default async function GiveawayPage({
    searchParams,
}: {
    searchParams: Promise<{ previewCountry?: string }>;
}) {
    const [hdrs, sp, data] = await Promise.all([
        headers(),
        searchParams,
        getPublicGiveawayData(),
    ]);
    const rawCountry = sp.previewCountry || hdrs.get("x-vercel-ip-country");
    const hasGeoHeader = Boolean(rawCountry && rawCountry.trim());
    const { region } = resolveGiveawayRegion(rawCountry, null);

    return (
        <GiveawayClient
            initialConfig={data.config}
            initialEntries={data.entries}
            initialFinalists={data.finalists}
            initialRegion={region}
            serverResolvedGeo={hasGeoHeader}
        />
    );
}
