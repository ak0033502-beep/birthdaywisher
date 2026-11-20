export type VaultRegion = "IN" | "GB" | "GLOBAL";
export type VaultPlanId = "30d" | "1y";
export type VaultSurface = "finish" | "game_finish" | "finale" | "dashboard";

export const VAULT_FREE_LIMIT = 200;

export interface VaultPlanOffer {
    id: VaultPlanId;
    label: string;
    days: number;
    currency: "INR" | "GBP" | "USD";
    price: number;
    displayPrice: string;
    badge?: string;
}

export interface VaultRegionConfig {
    region: VaultRegion;
    currency: "INR" | "GBP" | "USD";
    title: string;
    subtext: string;
    freeGiftTitle: string;
    freeGiftNote: string;
    plans: [VaultPlanOffer, VaultPlanOffer];
}

export function resolveVaultRegion(countryHeader?: string | null, tzHint?: string | null): {
    region: VaultRegion;
    country: string;
} {
    const rawCountry = (countryHeader || "").trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(rawCountry) && rawCountry !== "XX") {
        if (rawCountry === "IN") return { region: "IN", country: "IN" };
        if (rawCountry === "GB" || rawCountry === "UK") return { region: "GB", country: "GB" };
        return { region: "GLOBAL", country: rawCountry };
    }

    // Fallback when running locally without Vercel geo headers
    const tz = (tzHint || "").trim();
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
        return { region: "IN", country: "IN" };
    }
    if (tz === "Europe/London") {
        return { region: "GB", country: "GB" };
    }
    return { region: "GLOBAL", country: "US" };
}

export function getVaultRegionConfig(region: VaultRegion): VaultRegionConfig {
    if (region === "IN") {
        return {
            region: "IN",
            currency: "INR",
            title: "Keep This Wish Alive",
            subtext: "Save your photos, voice note & link so they stay safe. Costs less than a cup of chai ☕",
            freeGiftTitle: "Surprise! Unlocked 100% FREE for You!",
            freeGiftNote: "You didn't have to pay ₹1 — our first 200 early users get Memory Vault free!",
            plans: [
                {
                    id: "30d",
                    label: "30 Days",
                    days: 30,
                    currency: "INR",
                    price: 9,
                    displayPrice: "₹9",
                },
                {
                    id: "1y",
                    label: "1 Full Year",
                    days: 365,
                    currency: "INR",
                    price: 19,
                    displayPrice: "₹19",
                    badge: "Best Value",
                },
            ],
        };
    }

    if (region === "GB") {
        return {
            region: "GB",
            currency: "GBP",
            title: "Keep This Wish Alive",
            subtext: "Save your photos, voice note & link so you can revisit anytime. Less than a paper card!",
            freeGiftTitle: "Surprise! Unlocked 100% FREE for You!",
            freeGiftNote: "You paid £0 today — our first 200 early supporters get Memory Vault free!",
            plans: [
                {
                    id: "30d",
                    label: "30 Days",
                    days: 30,
                    currency: "GBP",
                    price: 1.49,
                    displayPrice: "£1.49",
                },
                {
                    id: "1y",
                    label: "1 Full Year",
                    days: 365,
                    currency: "GBP",
                    price: 2.99,
                    displayPrice: "£2.99",
                    badge: "Most Popular",
                },
            ],
        };
    }

    return {
        region: "GLOBAL",
        currency: "USD",
        title: "Keep This Wish Alive",
        subtext: "Save your photos, voice note & link so you can revisit anytime. Less than a paper card!",
        freeGiftTitle: "Surprise! Unlocked 100% FREE for You!",
        freeGiftNote: "You paid $0 today — our first 200 early supporters get Memory Vault free!",
        plans: [
            {
                id: "30d",
                label: "30 Days",
                days: 30,
                currency: "USD",
                price: 1.99,
                displayPrice: "$1.99",
            },
            {
                id: "1y",
                label: "1 Full Year",
                days: 365,
                currency: "USD",
                price: 3.99,
                displayPrice: "$3.99",
                badge: "Most Popular",
            },
        ],
    };
}
