import { describe, expect, it } from "vitest";
import {
    cleanEmail,
    cleanInstagramHandle,
    cleanInstagramReelUrl,
    computeGiveawayScore,
    getGiveawayRegionPack,
    getPrizeInfo,
    normalizeGiveawayConfig,
    resolveGiveawayRegion,
} from "./giveaway";

describe("giveaway helpers", () => {
    it("normalizes Instagram handles from @handle or profile URLs", () => {
        expect(cleanInstagramHandle("Rahul_Creates")).toBe("@rahul_creates");
        expect(cleanInstagramHandle("@@priya.vibes")).toBe("@priya.vibes");
        expect(cleanInstagramHandle("https://www.instagram.com/akshay_dev/")).toBe("@akshay_dev");
        expect(cleanInstagramHandle("bad handle!")).toBeNull();
    });

    it("validates and canonicalizes Instagram Reel URLs", () => {
        expect(cleanInstagramReelUrl("https://www.instagram.com/reel/DC9xYz12_Ab/?igsh=123")).toBe(
            "https://www.instagram.com/reel/DC9xYz12_Ab/",
        );
        expect(cleanInstagramReelUrl("https://instagram.com/priya/reels/C8abc1234/")).toBe(
            "https://www.instagram.com/reel/C8abc1234/",
        );
        expect(cleanInstagramReelUrl("https://youtube.com/shorts/abc123")).toBeNull();
    });

    it("validates participant emails", () => {
        expect(cleanEmail("  Test@Example.com ")).toBe("test@example.com");
        expect(cleanEmail("not-an-email")).toBeNull();
    });

    it("computes the exact 100-point admin-verified score including +15 in-person bonus", () => {
        expect(computeGiveawayScore({})).toBe(0);
        // Full In-Person creator max = 10 + 15 + 5 + 5 + 35 + 30 = 100
        expect(
            computeGiveawayScore({
                reelVerified: true,
                inPersonVerified: true,
                collabVerified: true,
                storyVerified: true,
                creativityScore: 35,
                engagementScore: 30,
            }),
        ).toBe(100);
        // Faceless creator max (no +15 in-person bonus) = 85; clamps above-max inputs safely to 35 + 30
        expect(
            computeGiveawayScore({
                reelVerified: true,
                inPersonVerified: false,
                collabVerified: true,
                storyVerified: true,
                creativityScore: 99,
                engagementScore: 99,
            }),
        ).toBe(85);
    });

    it("falls back safely in normalizeGiveawayConfig and getPrizeInfo", () => {
        const cfg = normalizeGiveawayConfig({ phase: "judging", active: true });
        expect(cfg.phase).toBe("judging");
        expect(cfg.active).toBe(true);
        expect(getPrizeInfo("oneplus_buds").id).toBe("oneplus_buds");
        expect(getPrizeInfo("unknown").id).toBe("amazon_2000");
        expect(resolveGiveawayRegion("US", "").region).toBe("GLOBAL");
        expect(resolveGiveawayRegion("GB", "").region).toBe("GLOBAL");
        expect(resolveGiveawayRegion("IN", "").region).toBe("IN");
        expect(getGiveawayRegionPack("GLOBAL").amountDisplay).toBe("$25");
        expect(getGiveawayRegionPack("GLOBAL").prizes).toHaveLength(1);
        expect(getGiveawayRegionPack("IN").amountDisplay).toBe("₹2,000");
        expect(getGiveawayRegionPack("IN").prizes).toHaveLength(4);
    });
});
