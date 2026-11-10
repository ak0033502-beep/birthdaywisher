import { describe, expect, it } from "vitest";
import { applyTemplate, buildWish, newDraft, recommended, stepValid, TEMPLATES, visibleSteps, wishPower, type Draft } from "./draft";
import { v2ToV1, migrateV1toV2 } from "@/lib/wish/migrate";

const named = (d: Draft, name = "Rahul"): Draft => ({ ...d, recipient: { ...d.recipient, name } });

describe("visibleSteps", () => {
    it("quick mode = name, photos, message, look, link, review, finish", () => {
        const d = { ...newDraft(), mode: "quick" as const };
        expect(visibleSteps(d).map((s) => s.id)).toEqual(["start", "name", "block:photos", "block:message", "look", "link", "review", "finish"]);
    });
    it("custom mode shows only the chosen ingredients, grouped by chapter", () => {
        const d: Draft = { ...newDraft(), mode: "custom", enabled: ["voice", "photos", "quiz"] };
        const ids = visibleSteps(d).map((s) => s.id);
        expect(ids).toEqual(["start", "name", "relation", "vibe", "ingredients", "block:photos", "block:quiz", "block:message", "block:voice", "look", "order", "link", "review", "finish"]);
    });
    it("message is always included (required)", () => {
        const d: Draft = { ...newDraft(), mode: "custom", enabled: [] };
        expect(visibleSteps(d).some((s) => s.id === "block:message")).toBe(true);
    });
    it("anniversary hides birthday-only blocks (roast, award)", () => {
        const d: Draft = { ...newDraft("anniversary"), mode: "custom", enabled: ["roast", "award", "photos"] };
        const ids = visibleSteps(d).map((s) => s.id);
        expect(ids).not.toContain("block:roast");
        expect(ids).not.toContain("block:award");
    });
    it("template mode adds the template picker", () => {
        const d = { ...newDraft(), mode: "template" as const };
        expect(visibleSteps(d)[1].id).toBe("template");
    });
});

describe("validation", () => {
    it("name and message are required", () => {
        const d = newDraft();
        const steps = visibleSteps({ ...d, mode: "quick" });
        const name = steps.find((s) => s.id === "name")!;
        const msg = steps.find((s) => s.id === "block:message")!;
        expect(stepValid(d, name)).toBe(false);
        expect(stepValid(named(d), name)).toBe(true);
        expect(stepValid(d, msg)).toBe(false);
        expect(stepValid({ ...d, configs: { message: { text: "Hi" } } }, msg)).toBe(true);
    });
});

describe("buildWish", () => {
    it("produces a valid v2 wish with intro first and finale last", () => {
        const d: Draft = { ...named(newDraft()), mode: "custom", enabled: ["memory", "quiz"], configs: { message: { text: "Happy birthday!" }, memory: { text: "Goa" }, quiz: { questions: [{ q: "A?", a: "a" }, { q: "B?", a: "b" }, { q: "C?", a: "c" }] } } };
        const w = buildWish(d);
        expect(w.schemaVersion).toBe(2);
        const types = w.blocks.map((b) => b.type);
        expect(types[0]).toBe("intro");
        expect(types[types.length - 1]).toBe("finale");
        expect(types).toEqual(["intro", "memory", "quiz", "message", "finale"]);
        const quiz = w.blocks.find((b) => b.type === "quiz");
        expect(quiz?.type === "quiz" && quiz.config.questions).toHaveLength(3); // v2 keeps all 3
    });
    it("drops empty blocks and disabled ingredients", () => {
        const d: Draft = { ...named(newDraft()), mode: "custom", enabled: ["memory"], configs: { message: { text: "Hi" }, quiz: { questions: [{ q: "x", a: "y" }] } } };
        expect(buildWish(d).blocks.map((b) => b.type)).toEqual(["intro", "roast", "message", "finale"].filter((t) => t !== "roast"));
    });
    it("adds the connection slide only when a relationship was chosen", () => {
        const base: Draft = { ...named(newDraft()), mode: "custom", enabled: [], configs: { message: { text: "Hi" } } };
        expect(buildWish(base).blocks.some((b) => b.type === "connection")).toBe(false);
        const withRel = { ...base, recipient: { ...base.recipient, relationship: "Best Friend" } };
        expect(buildWish(withRel).blocks.find((b) => b.type === "connection")?.config).toEqual({ relationship: "Best Friend" });
    });
    it("respects a custom story order (order editor)", () => {
        const d: Draft = { ...named(newDraft()), mode: "custom", enabled: ["memory", "photos"], configs: { message: { text: "Hi" }, memory: { text: "m" }, photos: { items: [{ url: "u", type: "photo" }] } } };
        d.order = ["finale", "message", "memory", "photos", "intro"]; // weird order on purpose
        expect(buildWish(d).blocks.map((b) => b.type)).toEqual(["intro", "message", "memory", "photos", "finale"]);
    });
    it("unlock date becomes local midnight ISO; 'now' means open", () => {
        const d: Draft = { ...named(newDraft()), unlock: { mode: "date", date: "2026-12-05" }, configs: { message: { text: "Hi" } } };
        expect(new Date(buildWish(d).unlock.date).getTime()).toBe(new Date(2026, 11, 5).getTime());
        expect(buildWish({ ...d, unlock: { mode: "now", date: "2026-12-05" } }).unlock.date).toBe("");
    });
    it("is readable by today's v1 viewers via v2ToV1, and migrate() treats it as v2", () => {
        const d = applyTemplate(named(newDraft()), "bestie");
        const w = buildWish(d);
        const v1 = v2ToV1(w);
        expect(v1.targetName).toBe("Rahul");
        expect(v1.coreMessage).toContain("Happy birthday");
        expect(v1.awardTitle).toBe("Most Annoying (and Most Loved) Human 2026");
        expect(migrateV1toV2(w)).toBe(w);
    });
    it("every template builds a non-trivial wish", () => {
        for (const t of TEMPLATES) {
            const w = buildWish(applyTemplate(named(newDraft(t.wishType)), t.id));
            expect(w.blocks.length).toBeGreaterThanOrEqual(3);
            expect(w.blocks.some((b) => b.type === "message")).toBe(true);
        }
    });
});

describe("wishPower & recommended", () => {
    it("goes up as content is added", () => {
        const d = named(newDraft());
        const p0 = wishPower({ ...d, mode: "custom" }).pct;
        const p1 = wishPower({ ...d, mode: "custom", configs: { message: { text: "Hi" } } }).pct;
        expect(p1).toBeGreaterThan(p0);
    });
    it("recommended always contains the message", () => {
        for (const v of ["hardcore-roast", "tear-jerker", "pure-romance", "grand-celebration"]) expect(recommended(v, "birthday")).toContain("message");
    });
});

describe("mini-games (Phase 5)", () => {
    const base = (): Draft => ({ ...named(newDraft()), mode: "custom", enabled: ["quiz"], configs: { message: { text: "Hi" }, quiz: { questions: [{ q: "Q?", a: "a" }] } } });

    it("are off by default and don't add a step", () => {
        const d = base();
        expect(visibleSteps(d).some((s) => s.id === "games")).toBe(false);
        expect(buildWish({ ...d, enabled: [...d.enabled, "candles"] }).blocks.some((b) => b.type === "candles")).toBe(false); // switch off → ignored
    });

    it("the Mini-games switch adds the games step in the Fun & Games chapter", () => {
        const steps = visibleSteps({ ...base(), wantGames: true });
        const i = steps.findIndex((s) => s.id === "games");
        expect(i).toBeGreaterThan(-1);
        expect(steps[i].chapter).toBe(3);
        expect(steps[i - 1].id).toBe("ingredients"); // first thing in chapter 4 (no memory blocks chosen)
    });

    it("placement: opener after the cover, finale right before the finale, fun after the quiz", () => {
        const d: Draft = {
            ...base(), wantGames: true, enabled: ["quiz", "candles", "prank", "trivia"],
            configs: {
                ...base().configs,
                candles: { candles: 5, message: "Wish!", placement: "finale" },
                prank: { kind: "error", placement: "opener" },
                trivia: { title: "", questions: [{ q: "Fav colour?", options: ["Red", "Blue"], correct: 1 }], leaderboard: true, placement: "fun" },
            },
        };
        expect(buildWish(d).blocks.map((b) => b.type)).toEqual(["intro", "prank", "quiz", "trivia", "message", "candles", "finale"]);
    });

    it("an unfinished trivia game (no options) is left out", () => {
        const d: Draft = { ...base(), wantGames: true, enabled: ["trivia"], configs: { message: { text: "Hi" }, trivia: { title: "", questions: [{ q: "Q?", options: ["only one", ""], correct: 0 }], leaderboard: false, placement: "fun" } } };
        expect(buildWish(d).blocks.some((b) => b.type === "trivia")).toBe(false);
    });

    it("games are v2-only: v1 viewers simply don't see them", () => {
        const d: Draft = { ...base(), wantGames: true, enabled: ["candles"], configs: { message: { text: "Hi" }, candles: { candles: 3, message: "x", placement: "finale" } } };
        const v1 = v2ToV1(buildWish(d));
        expect(v1.coreMessage).toBe("Hi");
        expect(Object.keys(v1)).not.toContain("candles");
    });

    it("the games step blocks Next until every picked game is playable", () => {
        const gs = { id: "games", chapter: 3 } as Parameters<typeof stepValid>[1];
        const blank: Draft = { ...base(), wantGames: true, enabled: ["candles", "trivia"], configs: { message: { text: "Hi" }, candles: { candles: 5, message: "x", placement: "finale" }, trivia: { title: "", questions: [{ q: "", options: ["", "", ""], correct: 0 }], leaderboard: true, placement: "fun" } } };
        expect(stepValid(blank, gs)).toBe(false);
        const filled: Draft = { ...blank, configs: { ...blank.configs, trivia: { title: "", questions: [{ q: "Fav colour?", options: ["Red", "Blue", ""], correct: 1 }], leaderboard: true, placement: "fun" } } };
        expect(stepValid(filled, gs)).toBe(true);
        expect(stepValid({ ...blank, enabled: ["candles"] }, gs)).toBe(true);
    });
});
