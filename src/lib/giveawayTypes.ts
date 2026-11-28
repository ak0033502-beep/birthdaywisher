export const GIVEAWAY_NAME = "BirthdayWisher ReelFest";
export const GIVEAWAY_SHORT_NAME = "ReelFest";
export const GIVEAWAY_HASHTAG = "#BWReelFest";

export type GiveawayRegion = "IN" | "GLOBAL";
export type GiveawayPrizeId = "amazon_2000" | "oneplus_buds" | "smartwatch" | "jbl_speaker";
export type GiveawayPhase = "collecting" | "judging" | "voting" | "ended";
export type GiveawayEntryStatus = "approved" | "finalist" | "winner" | "rejected";

export const GIVEAWAY_PTS = {
    REEL: 10,
    IN_PERSON: 15,
    COLLAB: 5,
    STORY: 5,
    CREATIVITY_MAX: 35,
    ENGAGEMENT_MAX: 30,
    TOTAL_MAX: 100,
} as const;

export function computeGiveawayScore(parts: {
    reelVerified?: boolean;
    inPersonVerified?: boolean;
    collabVerified?: boolean;
    storyVerified?: boolean;
    creativityScore?: number;
    engagementScore?: number;
}): number {
    const actionPts =
        (parts.reelVerified ? GIVEAWAY_PTS.REEL : 0) +
        (parts.inPersonVerified ? GIVEAWAY_PTS.IN_PERSON : 0) +
        (parts.collabVerified ? GIVEAWAY_PTS.COLLAB : 0) +
        (parts.storyVerified ? GIVEAWAY_PTS.STORY : 0);
    const creativity = Math.max(0, Math.min(GIVEAWAY_PTS.CREATIVITY_MAX, Math.round(Number(parts.creativityScore) || 0)));
    const engagement = Math.max(0, Math.min(GIVEAWAY_PTS.ENGAGEMENT_MAX, Math.round(Number(parts.engagementScore) || 0)));
    return actionPts + creativity + engagement;
}

export function resolveGiveawayRegion(
    countryHeader?: string | null,
    tzHint?: string | null,
): { region: GiveawayRegion; country: string } {
    const rawCountry = (countryHeader || "").trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(rawCountry) && rawCountry !== "XX") {
        return {
            region: rawCountry === "IN" ? "IN" : "GLOBAL",
            country: rawCountry,
        };
    }
    const tz = (tzHint || "").trim();
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
        return { region: "IN", country: "IN" };
    }
    return { region: "GLOBAL", country: "US" };
}

export interface GiveawayPrizeInfo {
    id: GiveawayPrizeId;
    title: string;
    shortTitle: string;
    subtitle: string;
    valueLabel: string;
    badge: string;
    emoji: string;
    accent: string;
    imageSrc: string;
}

export interface GiveawayRegionPack {
    region: GiveawayRegion;
    flag: string;
    label: string;
    amountDisplay: string;
    deliverySubtext: string;
    ruleDeliveryNote: string;
    prizes: GiveawayPrizeInfo[];
}

export const GIVEAWAY_REGION_PACKS: Record<GiveawayRegion, GiveawayRegionPack> = {
    IN: {
        region: "IN",
        flag: "🇮🇳",
        label: "India (₹2,000 Gadgets / Voucher)",
        amountDisplay: "₹2,000",
        deliverySubtext:
            "100% branded Amazon India doorstep delivery or instant ₹2,000 Amazon Pay digital code — tap your favourite!",
        ruleDeliveryNote:
            "India Winner: Choose ₹2,000 Amazon Pay e-Gift Card, OnePlus/Realme Buds, Noise/Fastrack Smartwatch, or JBL Speaker shipped free via Amazon.in within 48h.",
        prizes: [
            {
                id: "amazon_2000",
                title: "₹2,000 Amazon Pay Gift Card",
                shortTitle: "₹2,000 Amazon Voucher",
                subtitle: "Instant digital voucher — works on Shopping, Gaming Codes, Swiggy, Zomato, Uber & Recharges.",
                valueLabel: "₹2,000 Instant",
                badge: "GAMERS & ALL-ROUNDER",
                emoji: "💳",
                accent: "#FF9F43",
                imageSrc: "/giveaway/amazon-pay-card.jpg",
            },
            {
                id: "oneplus_buds",
                title: "OnePlus Nord Buds 2r / Realme T310",
                shortTitle: "OnePlus / Realme ANC Buds",
                subtitle: "12.4mm deep-bass drivers, up to 40h battery life, ANC & ultra-low latency gaming mode.",
                valueLabel: "Worth ₹1,999",
                badge: "MOST WANTED",
                emoji: "🎧",
                accent: "#FF5C8A",
                imageSrc: "/giveaway/oneplus-buds-2r.jpg",
            },
            {
                id: "smartwatch",
                title: "Noise Twist Go / Fastrack Smartwatch",
                shortTitle: "Noise / Fastrack Watch",
                subtitle: "Sleek metallic dial or curved HD display with Bluetooth calling, health suite & 100+ watch faces.",
                valueLabel: "Worth ₹1,899",
                badge: "STYLE FLEX",
                emoji: "⌚",
                accent: "#7C5CFF",
                imageSrc: "/giveaway/noise-twist-go.jpg",
            },
            {
                id: "jbl_speaker",
                title: "JBL Go Essential Bluetooth Speaker",
                shortTitle: "JBL Bluetooth Speaker",
                subtitle: "Original JBL Pro Sound, punchy bass, IPX7 waterproof body & pocket-ready party design.",
                valueLabel: "Worth ₹1,799",
                badge: "PARTY VIBE",
                emoji: "🔊",
                accent: "#2ED8B6",
                imageSrc: "/giveaway/jbl-go-essential.jpg",
            },
        ],
    },
    GLOBAL: {
        region: "GLOBAL",
        flag: "🌍",
        label: "Outside India ($25 Gift Card)",
        amountDisplay: "$25",
        deliverySubtext:
            "Outside India? Win a $25 USD Official Digital Gift Card delivered instantly to your email worldwide — zero shipping wait!",
        ruleDeliveryNote:
            "Outside India Winner: Receive an instant $25 USD Official Digital Gift Card (Amazon / Global Steam / Apple / Google Play) via email within 48h — zero shipping or customs!",
        prizes: [
            {
                id: "amazon_2000",
                title: "$25 USD Official Gift Card",
                shortTitle: "$25 USD Gift Card",
                subtitle:
                    "Instant worldwide digital gift card delivered straight to your email — redeem on Amazon, Global Steam, Apple, or Google Play!",
                valueLabel: "$25 Instant",
                badge: "WORLDWIDE INSTANT DELIVERY",
                emoji: "💳",
                accent: "#FF9F43",
                imageSrc: "/giveaway/amazon-pay-card.jpg",
            },
        ],
    },
};

export const GIVEAWAY_PRIZES: GiveawayPrizeInfo[] = GIVEAWAY_REGION_PACKS.IN.prizes;
export const VALID_PRIZE_IDS = new Set<GiveawayPrizeId>(GIVEAWAY_PRIZES.map((p) => p.id));

export function getGiveawayRegionPack(region?: string | null): GiveawayRegionPack {
    return region === "GLOBAL" ? GIVEAWAY_REGION_PACKS.GLOBAL : GIVEAWAY_REGION_PACKS.IN;
}

export function getPrizeInfo(id: string, region: GiveawayRegion = "IN"): GiveawayPrizeInfo {
    if (region === "GLOBAL") return GIVEAWAY_REGION_PACKS.GLOBAL.prizes[0];
    const list = GIVEAWAY_REGION_PACKS.IN.prizes;
    return list.find((p) => p.id === id) ?? list[0];
}

export interface GiveawayConfig {
    active: boolean;
    showPromos: boolean;
    phase: GiveawayPhase;
    startsAt: string;
    endsAt: string;
    igPostUrl: string;
    winnerHandle: string;
    winnerTicket: string;
    winnerPrize: GiveawayPrizeId;
    winnerReelUrl: string;
    updatedAt?: string;
}

export interface PublicGiveawayEntry {
    id: number;
    ticketCode: string;
    igHandle: string;
    reelUrl: string;
    prizeChoice: GiveawayPrizeId;
    region: GiveawayRegion;
    isInPerson: boolean;
    sentCollab: boolean;
    sharedStory: boolean;
    reelVerified: boolean;
    inPersonVerified: boolean;
    collabVerified: boolean;
    storyVerified: boolean;
    note: string | null;
    status: GiveawayEntryStatus;
    totalScore: number;
    publicVotes: number;
    createdAt: string;
}

export interface AdminGiveawayEntry extends PublicGiveawayEntry {
    email: string;
    emailOptIn: boolean;
    country: string;
    wishLink: string | null;
    creativityScore: number;
    engagementScore: number;
    bonusScore: number;
}
