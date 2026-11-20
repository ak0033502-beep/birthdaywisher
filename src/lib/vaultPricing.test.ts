import { describe, expect, it } from "vitest";
import { VAULT_FREE_LIMIT, getVaultRegionConfig, resolveVaultRegion } from "./vaultPricing";

describe("vaultPricing", () => {
    it("enforces 200 free launch spots", () => {
        expect(VAULT_FREE_LIMIT).toBe(200);
    });

    it("resolves India (IN), UK (GB), and Global (USD) accurately", () => {
        expect(resolveVaultRegion("IN")).toEqual({ region: "IN", country: "IN" });
        expect(resolveVaultRegion("gb")).toEqual({ region: "GB", country: "GB" });
        expect(resolveVaultRegion("US")).toEqual({ region: "GLOBAL", country: "US" });
        expect(resolveVaultRegion("CA")).toEqual({ region: "GLOBAL", country: "CA" });
        expect(resolveVaultRegion(null, "Asia/Kolkata")).toEqual({ region: "IN", country: "IN" });
        expect(resolveVaultRegion(null, "Europe/London")).toEqual({ region: "GB", country: "GB" });
        expect(resolveVaultRegion(null, "America/New_York")).toEqual({ region: "GLOBAL", country: "US" });
    });

    it("returns ₹9 / ₹19 for India, £1.49 / £2.99 for UK, and $1.99 / $3.99 for Global", () => {
        const inCfg = getVaultRegionConfig("IN");
        expect(inCfg.plans[0]).toMatchObject({ id: "30d", price: 9, displayPrice: "₹9", days: 30 });
        expect(inCfg.plans[1]).toMatchObject({ id: "1y", price: 19, displayPrice: "₹19", days: 365 });

        const gbCfg = getVaultRegionConfig("GB");
        expect(gbCfg.plans[0]).toMatchObject({ id: "30d", price: 1.49, displayPrice: "£1.49", days: 30 });
        expect(gbCfg.plans[1]).toMatchObject({ id: "1y", price: 2.99, displayPrice: "£2.99", days: 365 });

        const usCfg = getVaultRegionConfig("GLOBAL");
        expect(usCfg.plans[0]).toMatchObject({ id: "30d", price: 1.99, displayPrice: "$1.99", days: 30 });
        expect(usCfg.plans[1]).toMatchObject({ id: "1y", price: 3.99, displayPrice: "$3.99", days: 365 });
    });
});
