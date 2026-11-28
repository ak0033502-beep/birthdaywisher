import { describe, expect, it } from "vitest";
import { applyAutoBuild, buildStoryMemory, newDraft } from "@/components/wizard2/draft";
import { normalizeCuppyConfig, resolvePauseMessage } from "./cuppyConfig";
import {
    buildCuratedFallback,
    parseAutoBuildOutput,
    parseCuppyOutput,
    resolveEffectiveTone,
    sanitizeText,
} from "./cuppyAi";

describe("cuppyAi", () => {
    it("normalizes Cuppy Admin config and resolves Cozy Pause presets without banned emojis", () => {
        const kitchen = normalizeCuppyConfig({ enabled: false, pausePreset: "kitchen" });
        expect(kitchen.enabled).toBe(false);
        expect(resolvePauseMessage(kitchen)).toContain("baking fresh birthday cupcakes");

        const custom = normalizeCuppyConfig({
            enabled: false,
            allowNoFilter: false,
            rateLimit10m: 15,
            pausePreset: "custom",
            pauseCustomMessage: "Cuppy is resting \u2728❤️ Tap a favourite line below!",
        });
        expect(custom.allowNoFilter).toBe(false);
        expect(custom.rateLimit10m).toBe(15);
        expect(resolvePauseMessage(custom)).toBe("Cuppy is resting ❤️ Tap a favourite line below!");
    });
    it("auto-detects Unfiltered, Flirty, 3 AM Raw, Hinglish, and Hindi from hints & spice", () => {
        expect(resolveEffectiveTone("auto", "Full unfiltered bakchodi roast")).toBe("unfiltered");
        expect(resolveEffectiveTone("auto", "Make it spicy and flirty")).toBe("flirty");
        expect(resolveEffectiveTone("auto", "3 AM real talk")).toBe("raw3am");
        expect(resolveEffectiveTone("auto", "Suggest a cute Hinglish one-liner")).toBe("hinglish");
        expect(resolveEffectiveTone("auto", "Write in Hindi please")).toBe("hindi");
        expect(resolveEffectiveTone("auto", "short wish", "brutal")).toBe("unfiltered");
        expect(resolveEffectiveTone("funny", "Hinglish roast")).toBe("funny");
    });

    it("strips banned star and sparkle emojis while preserving party emojis", () => {
        const cleaned = sanitizeText("Happy Birthday Rahul \u2728\u{1F31F}\u2B50\u{1F4AB}\u{1F496} Party time! 🎂🎉❤️🔥", 200);
        expect(cleaned).toBe("Happy Birthday Rahul Party time! 🎂🎉❤️🔥");
        expect(cleaned).not.toMatch(/[\u2728\u{1F31F}\u2B50\u{1F4AB}\u{1F496}]/u);
    });

    it("parses JSON wrapped in <think> tags and markdown fences", () => {
        const raw = `<think>Let's craft 3 Hinglish birthday wishes.</think>
\`\`\`json
{
  "items": [
    "Happy Birthday Rahul! Momos kab khila raha hai? 🥟🎉",
    "Yaar tu hamesha khush reh \u2728❤️",
    "Ek aur saal bada ho gaya! 🎂"
  ]
}
\`\`\``;
        const items = parseCuppyOutput(raw, "message");
        expect(items).toHaveLength(3);
        expect(items[0].text).toContain("Momos kab khila raha hai");
        expect(items[1].text).toBe("Yaar tu hamesha khush reh ❤️");
    });

    it("parses and normalizes 1-line Magic Auto-Build blueprints cleanly", () => {
        const raw = `<think>Building full surprise for Aman.</think>
\`\`\`json
{
  "name": "Aman \u2728",
  "nickname": "Gym Bro",
  "age": "22",
  "relationship": "Best Friend",
  "vibe": "hardcore-roast",
  "presentationStyle": "messenger",
  "theme": "neon",
  "soundtrack": "hindi_vocal",
  "finaleEffect": "fireworks",
  "roastLevel": 90,
  "message": "Abe Aman, 22 ka ho gaya par Goa plan abhi bhi pending hai! 🔥🎂",
  "memory": "Remember when we planned Goa at 2 AM over momos and nobody booked tickets? 😂",
  "quirks": ["Gym selfie addict", "Momos monster", "Cancels Goa plans"],
  "award": "CEO of Cancelled Goa Plans 🏆",
  "gratitude": "Thanks for always standing by me bhai ❤️",
  "promise": "Momos treat on me if you come on time!",
  "quiz": [{"q": "Which trip has Aman cancelled for 3 years?", "a": "Goa"}],
  "customSlug": "Aman Goa Kab Chalega!!",
  "previewText": "⚠️ Aman, akele mein kholna 😭👇",
  "cuppySummary": "Built Aman's full unfiltered surprise! 🧁"
}
\`\`\``;
        const ab = parseAutoBuildOutput(raw, { task: "autobuild", tone: "unfiltered", wishType: "birthday" });
        expect(ab).not.toBeNull();
        expect(ab!.name).toBe("Aman");
        expect(ab!.customSlug).toBe("aman-goa-kab-chalega");
        expect(ab!.quiz).toEqual([{ q: "Which trip has Aman cancelled for 3 years?", a: "Goa" }]);

        const draft = applyAutoBuild(newDraft("birthday"), ab!);
        expect(draft.step).toBe("review");
        expect(draft.recipient.name).toBe("Aman");
        expect(draft.configs.message?.text).toContain("Goa plan");
        expect(draft.configs.quirks?.items).toHaveLength(3);
    });

    it("builds cross-step story memory strictly from text blocks and never leaks photo/media URLs", () => {
        const d = newDraft("birthday");
        d.configs.photos = { items: [{ url: "https://res.cloudinary.com/demo/image/upload/secret-photo.jpg", type: "photo" }] };
        d.configs.voice = { audioUrl: "https://res.cloudinary.com/demo/video/upload/secret-voice.webm" };
        d.configs.quirks = { items: ["Steals hoodies", "Momos lover"] };
        d.configs.memory = { text: "Manali bus ride at 3 AM" };

        const memForMsg = buildStoryMemory(d, "message");
        expect(memForMsg).toContain("Steals hoodies");
        expect(memForMsg).toContain("Manali bus ride");
        expect(memForMsg).not.toContain("cloudinary");
        expect(memForMsg).not.toContain("secret-photo");
        expect(memForMsg).not.toContain("secret-voice");

        // Excludes current block being edited
        const memForMemory = buildStoryMemory(d, "memory");
        expect(memForMemory).not.toContain("Manali bus ride");
        expect(memForMemory).toContain("Steals hoodies");
    });

    it("provides curated local fallbacks for every task and unfiltered tones without banned emojis", () => {
        for (const task of ["message", "memory", "promise", "gratitude", "award", "quirks", "quiz", "whatsapp", "chat"] as const) {
            for (const tone of ["unfiltered", "flirty", "raw3am", "hinglish"] as const) {
                const items = buildCuratedFallback({ task, name: "Priya", tone });
                expect(items.length).toBeGreaterThan(0);
                for (const item of items) {
                    expect(item.text).not.toMatch(/[\u2728\u{1F31F}\u2B50\u{1F4AB}\u{1F496}]/u);
                }
            }
        }
    });
});
