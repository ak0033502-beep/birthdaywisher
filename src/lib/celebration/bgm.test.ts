import { describe, expect, it } from "vitest";
import { SOUNDTRACK_OPTIONS, normalizeSoundtrack, resolveBgmUrl } from "./bgm";

describe("bgm soundtrack routing", () => {
    it("maps legacy and empty soundtrack values safely to instrumental", () => {
        expect(normalizeSoundtrack(undefined)).toBe("instrumental");
        expect(normalizeSoundtrack("")).toBe("instrumental");
        expect(normalizeSoundtrack("lofi")).toBe("instrumental");
        expect(normalizeSoundtrack("piano")).toBe("instrumental");
        expect(normalizeSoundtrack("instrumental")).toBe("instrumental");
    });

    it("resolves per-style instrumental and vocal URLs plus universal songs and silent mode", () => {
        expect(resolveBgmUrl("cinematic", "lofi")).toBe("/bgm/cinematic.mp3");
        expect(resolveBgmUrl("storybook", "vocal")).toBe("/bgm/storybook-vocal.mp3");
        expect(resolveBgmUrl("messenger", "vocal")).toBe("/bgm/messenger-vocal.mp3");
        expect(resolveBgmUrl("galaxy", "hindi")).toBe("/bgm/hindi-unplugged.mp3");
        expect(resolveBgmUrl("terminal", "midnight-pop")).toBe("/bgm/gold-in-your-eyes.mp3");
        expect(resolveBgmUrl("gallery", "soul-anthem")).toBe("/bgm/love-runs-deep.mp3");
        expect(resolveBgmUrl("cinematic", "none")).toBeNull();
        expect(SOUNDTRACK_OPTIONS).toHaveLength(6);
    });
});
