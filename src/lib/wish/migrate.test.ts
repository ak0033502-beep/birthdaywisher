import { describe, expect, it } from "vitest";
import { migrateV1toV2, normalizeV1, normalizeWish, v2ToV1 } from "./migrate";
import { V1_DEFAULTS } from "./v1";
import { BLOCKS, GAME_TYPES, V1_STORY_ORDER } from "@/blocks/registry";

/* ---------- Fixtures shaped like real stored wishes ---------- */
const fullBirthday = {
    ...V1_DEFAULTS,
    wishType: "birthday",
    targetName: "Rahul", targetAge: "25", targetGender: "male", relationship: "Best Friend", vibe: "Funny", nickname: "Potato",
    mediaItems: [{ url: "https://res.cloudinary.com/x/a.jpg", type: "photo" }, { url: "https://res.cloudinary.com/x/b.mp4", type: "video" }],
    memoryTale: "Goa at 3AM looking for momos", secretDate: "2019-07-14", quirks: ["Always late", "Steals hoodies"], roastLevel: 80,
    quizQ1: "Where did we meet?", quizA1: "College", quizQ2: "My comfort food?", quizA2: "Maggi",
    awardTitle: "Best Human 2026", audioUrl: "https://res.cloudinary.com/x/v.webm", gratitudeText: "always being there",
    puzzleImageUrl: "https://res.cloudinary.com/x/p.jpg", coreMessage: "Happy birthday bro!", futurePromise: "Pizza on me",
    soundtrack: "lofi", theme: "neon", finaleEffect: "fireworks", presentationStyle: "terminal",
    unlockDate: "2026-11-20T18:30:00.000Z", requireSmileToUnlock: true, showAsScratchOff: true, language: "hi",
    giftCardType: "amazon", giftCardUrl: "https://res.cloudinary.com/x/g.pdf", giftCardMessage: "Treat yourself",
};

const minimalAnniversary = {
    ...V1_DEFAULTS,
    wishType: "anniversary", targetName: "Riya & Aman", coupleName: "Riya & Aman", anniversaryYear: "5",
    coreMessage: "Happy anniversary!", theme: "rosegold-elegance",
};

/** An OLD wish saved before mediaItems/language/gift cards existed: missing fields + legacy single media. */
const legacyOld = {
    wishType: "birthday", targetName: "Sana", targetAge: "30", relationship: "Sister", vibe: "Emotional", nickname: "",
    mediaUrl: "https://res.cloudinary.com/x/old.jpg", mediaType: "photo",
    memoryTale: "", secretDate: "", quirks: [], roastLevel: 20, quizQ1: "", quizA1: "", quizQ2: "", quizA2: "",
    awardTitle: "", audioUrl: "", gratitudeText: "", puzzleImageUrl: "", coreMessage: "Love you didi", futurePromise: "",
    timeCapsule: "", soundtrack: "piano", theme: "pastel", finaleEffect: "confetti", presentationStyle: "cinematic",
};

/** Odd combos the blocks can't express directly must still survive. */
const weird = {
    ...V1_DEFAULTS,
    targetName: "X",
    mediaItems: [{ url: "https://a/1.jpg", type: "photo" }],
    mediaUrl: "https://a/legacy.jpg", mediaType: "photo",     // both new + legacy media
    quizQ2: "Only the second question?", quizA2: "yes",        // Q1 empty
    roastLevel: 0,                                              // birthday with 0%
    customSlug: "rahul-bday", someFutureField: { a: 1 },        // unknown keys
};

const fixtures = { fullBirthday, minimalAnniversary, legacyOld, weird };

describe("migrateV1toV2 → v2ToV1 round-trip", () => {
    for (const [name, fx] of Object.entries(fixtures)) {
        it(`is lossless for ${name}`, () => {
            const v2 = migrateV1toV2(fx);
            expect(v2.schemaVersion).toBe(2);
            expect(v2ToV1(v2)).toEqual(normalizeV1(fx));
        });
        it(`survives JSON storage for ${name}`, () => {
            const v2 = JSON.parse(JSON.stringify(migrateV1toV2(fx)));
            expect(v2ToV1(v2)).toEqual(normalizeV1(fx));
        });
    }
});

describe("block extraction", () => {
    it("emits blocks in the v1 viewer story order", () => {
        const types = migrateV1toV2(fullBirthday).blocks.map((b) => b.type);
        const expected = V1_STORY_ORDER.filter((t) => types.includes(t));
        expect(types).toEqual(expected);
        expect(types[0]).toBe("intro");
        expect(types[types.length - 1]).toBe("finale");
    });

    it("maps a full birthday wish to all 16 block types", () => {
        expect(migrateV1toV2(fullBirthday).blocks).toHaveLength(16);
    });

    it("turns the 2 fixed quiz fields into a questions list", () => {
        const quiz = migrateV1toV2(fullBirthday).blocks.find((b) => b.type === "quiz");
        expect(quiz?.config).toEqual({ questions: [{ q: "Where did we meet?", a: "College" }, { q: "My comfort food?", a: "Maggi" }] });
    });

    it("keeps legacy single media as a photos block", () => {
        const photos = migrateV1toV2(legacyOld).blocks.find((b) => b.type === "photos");
        expect(photos?.config).toEqual({ items: [{ url: "https://res.cloudinary.com/x/old.jpg", type: "photo" }], legacySingle: true });
    });

    it("skips empty optional content (minimal anniversary)", () => {
        const types = migrateV1toV2(minimalAnniversary).blocks.map((b) => b.type);
        expect(types).toEqual(["intro", "message", "finale"]);
    });

    it("keeps the roast slide for birthdays even at 0% (v1 parity)", () => {
        expect(migrateV1toV2(weird).blocks.some((b) => b.type === "roast")).toBe(true);
    });

    it("moves recipient / look / unlock into their own sections", () => {
        const v2 = migrateV1toV2(fullBirthday);
        expect(v2.recipient.name).toBe("Rahul");
        expect(v2.look).toEqual({ theme: "neon", presentationStyle: "terminal", soundtrack: "lofi", language: "hi" });
        expect(v2.unlock.date).toBe("2026-11-20T18:30:00.000Z");
    });

    it("preserves unknown keys in meta.extra", () => {
        expect(migrateV1toV2(weird).meta.extra).toEqual({ customSlug: "rahul-bday", someFutureField: { a: 1 } });
    });

    it("uses stable block ids", () => {
        expect(migrateV1toV2(fullBirthday).blocks.map((b) => b.id)).toEqual(migrateV1toV2(fullBirthday).blocks.map((b) => b.id));
    });
});

describe("robustness", () => {
    it("is idempotent for v2 input", () => {
        const v2 = migrateV1toV2(fullBirthday);
        expect(migrateV1toV2(v2)).toBe(v2);
    });

    it("handles null / empty / garbage input without throwing", () => {
        for (const bad of [null, undefined, {}, "x", 42, []]) {
            const { v1, v2 } = normalizeWish(bad);
            expect(v2.schemaVersion).toBe(2);
            expect(v1.wishType).toBe("birthday");
            expect(v2.blocks.map((b) => b.type)).toEqual(["intro", "roast", "finale"]);
        }
    });

    it("v2 editing: a 3rd quiz question is v2-only, v1 keeps the first two", () => {
        const v2 = migrateV1toV2(fullBirthday);
        const quiz = v2.blocks.find((b) => b.type === "quiz")!;
        if (quiz.type === "quiz") quiz.config.questions.push({ q: "Third?", a: "3" });
        const v1 = v2ToV1(v2);
        expect([v1.quizQ1, v1.quizQ2]).toEqual(["Where did we meet?", "My comfort food?"]);
    });
});

describe("registry", () => {
    it("defines every block type in the story order exactly once", () => {
        expect(new Set(V1_STORY_ORDER).size).toBe(V1_STORY_ORDER.length);
        expect(Object.keys(BLOCKS).sort()).toEqual([...V1_STORY_ORDER, ...GAME_TYPES].sort());
    });
    it("default configs are fresh objects", () => {
        for (const t of [...V1_STORY_ORDER, ...GAME_TYPES]) expect(BLOCKS[t].defaultConfig()).not.toBe(BLOCKS[t].defaultConfig());
    });
});
