import { describe, expect, it } from "vitest";
import {
    CREATOR_COOKIE,
    appendCreatorWishCookieValue,
    signCreatorWishId,
    verifyCreatorWishToken,
} from "./creatorPreview";

describe("creatorPreview", () => {
    it("signs and verifies valid wish IDs and rejects tampered tokens", () => {
        const tok = signCreatorWishId("1b94d92bb6");
        expect(verifyCreatorWishToken(tok, "1b94d92bb6")).toBe("1b94d92bb6");
        expect(verifyCreatorWishToken(tok, "aaaaaaaaaa")).toBeNull();
        expect(verifyCreatorWishToken("1b94d92bb6.0000000000000000", "1b94d92bb6")).toBeNull();
    });

    it("appends up to 12 recent creator tokens cleanly", () => {
        let cookieHeader: string | null = null;
        for (let i = 0; i < 14; i++) {
            const id = i.toString(16).padStart(10, "0");
            const val = appendCreatorWishCookieValue(cookieHeader, id);
            cookieHeader = `${CREATOR_COOKIE}=${encodeURIComponent(val)}`;
        }
        const finalVal = decodeURIComponent(cookieHeader!.split("=")[1]);
        const parts = finalVal.split(",");
        expect(parts).toHaveLength(12);
        expect(verifyCreatorWishToken(parts[11], "000000000d")).toBe("000000000d");
    });
});
