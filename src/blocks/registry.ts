/**
 * Block registry: the single source of truth for every block type.
 * Used by: the v1→v2 migration, the v2 viewer engine, and (Phase 4) the new wizard.
 *
 * Rules for the v1 mapping (keeps old wishes lossless):
 *  - fromV1() returns null when the v1 fields are at their defaults → the block is absent
 *  - toV1() writes the block back to the exact v1 fields
 *  - isFilled() decides if the viewer shows the block (empty blocks are skipped)
 */
import type { WishData } from "@/lib/WishContext";
import type { BlockConfigMap, BlockType, WishType } from "@/lib/wish/schema";

export type BlockCategory = "about" | "memories" | "fun" | "heart" | "gate" | "finale" | "game";

export interface BlockDefinition<K extends BlockType = BlockType> {
    type: K;
    label: string;
    icon: string;
    category: BlockCategory;
    /** Gate = recipient must solve it (or wait 60 s) before moving on */
    gate: boolean;
    supports: WishType[];
    defaultConfig: () => BlockConfigMap[K];
    isFilled: (c: BlockConfigMap[K]) => boolean;
    fromV1: (v1: WishData) => BlockConfigMap[K] | null;
    toV1: (c: BlockConfigMap[K]) => Partial<WishData>;
    summary: (c: BlockConfigMap[K]) => string;
}

const both: WishType[] = ["birthday", "anniversary"];
const str = (v: unknown) => (typeof v === "string" ? v : "");
const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const short = (s: string, n = 40) => (s.length > n ? `${s.slice(0, n)}…` : s);

function def<K extends BlockType>(d: BlockDefinition<K>): BlockDefinition<K> { return d; }

export const BLOCKS = {
    intro: def({
        type: "intro", label: "Cover", icon: "🎂", category: "about", gate: false, supports: both,
        defaultConfig: () => ({}),
        isFilled: () => true,
        fromV1: () => ({}),
        toV1: () => ({}),
        summary: () => "Opening screen",
    }),
    connection: def({
        type: "connection", label: "Your connection", icon: "💞", category: "about", gate: false, supports: both,
        defaultConfig: () => ({ relationship: "" }),
        isFilled: (c) => has(c.relationship),
        // relationship also lives on recipient; the block only marks that the slide is shown
        fromV1: (v1) => (has(v1.relationship) ? { relationship: str(v1.relationship) } : null),
        toV1: () => ({}),
        summary: (c) => c.relationship || "—",
    }),
    roast: def({
        type: "roast", label: "Roast meter", icon: "🎚️", category: "fun", gate: false, supports: ["birthday"],
        defaultConfig: () => ({ level: 50 }),
        isFilled: (c) => typeof c.level === "number",
        // v1 viewers always showed the roast slide for birthdays (even at 0% = "pure toast");
        // the anniversary wizard never asks, so there it only exists if a level was set
        fromV1: (v1) => (typeof v1.roastLevel === "number" && (v1.wishType !== "anniversary" || v1.roastLevel !== 0) ? { level: v1.roastLevel } : null),
        toV1: (c) => ({ roastLevel: c.level }),
        summary: (c) => `${c.level}% ${c.level > 50 ? "roast" : "toast"}`,
    }),
    quirks: def({
        type: "quirks", label: "Things I love", icon: "💖", category: "memories", gate: false, supports: both,
        defaultConfig: () => ({ items: [] }),
        isFilled: (c) => c.items.some(has),
        fromV1: (v1) => (Array.isArray(v1.quirks) && v1.quirks.length > 0 ? { items: [...v1.quirks] } : null),
        toV1: (c) => ({ quirks: [...c.items] }),
        summary: (c) => `${c.items.filter(has).length} items`,
    }),
    memory: def({
        type: "memory", label: "Memory", icon: "📖", category: "memories", gate: false, supports: both,
        defaultConfig: () => ({ text: "" }),
        isFilled: (c) => has(c.text),
        fromV1: (v1) => (has(v1.memoryTale) ? { text: str(v1.memoryTale) } : null),
        toV1: (c) => ({ memoryTale: c.text }),
        summary: (c) => short(c.text) || "—",
    }),
    photos: def({
        type: "photos", label: "Photos", icon: "📸", category: "memories", gate: false, supports: both,
        defaultConfig: () => ({ items: [] }),
        isFilled: (c) => c.items.some((m) => has(m.url)),
        fromV1: (v1) => {
            if (Array.isArray(v1.mediaItems) && v1.mediaItems.length > 0) return { items: v1.mediaItems.map((m) => ({ url: m.url, type: m.type })) };
            if (has(v1.mediaUrl)) return { items: [{ url: str(v1.mediaUrl), type: v1.mediaType === "video" ? "video" : "photo" }], legacySingle: true };
            return null;
        },
        toV1: (c) => (c.legacySingle && c.items[0]
            ? { mediaUrl: c.items[0].url, mediaType: c.items[0].type, mediaItems: [] }
            : { mediaItems: c.items.map((m) => ({ url: m.url, type: m.type })) }),
        summary: (c) => `${c.items.length} ${c.items.length === 1 ? "photo" : "photos"}`,
    }),
    secretDate: def({
        type: "secretDate", label: "Secret date", icon: "🔒", category: "gate", gate: true, supports: both,
        defaultConfig: () => ({ date: "" }),
        isFilled: (c) => has(c.date),
        fromV1: (v1) => (has(v1.secretDate) ? { date: str(v1.secretDate) } : null),
        toV1: (c) => ({ secretDate: c.date }),
        summary: (c) => c.date || "—",
    }),
    puzzle: def({
        type: "puzzle", label: "Photo puzzle", icon: "🧩", category: "gate", gate: true, supports: both,
        defaultConfig: () => ({ imageUrl: "" }),
        isFilled: (c) => has(c.imageUrl),
        fromV1: (v1) => (has(v1.puzzleImageUrl) ? { imageUrl: str(v1.puzzleImageUrl) } : null),
        toV1: (c) => ({ puzzleImageUrl: c.imageUrl }),
        summary: () => "3×3 sliding puzzle",
    }),
    quiz: def({
        type: "quiz", label: "Quiz", icon: "🧠", category: "gate", gate: true, supports: both,
        defaultConfig: () => ({ questions: [{ q: "", a: "" }] }),
        isFilled: (c) => c.questions.some((x) => has(x.q)),
        fromV1: (v1) => {
            const qs = [{ q: str(v1.quizQ1), a: str(v1.quizA1) }, { q: str(v1.quizQ2), a: str(v1.quizA2) }];
            while (qs.length && !qs[qs.length - 1].q && !qs[qs.length - 1].a) qs.pop(); // keep positions, drop trailing empties
            return qs.length ? { questions: qs } : null;
        },
        // v1 only has room for 2 questions; v2 can hold up to 10
        toV1: (c) => ({
            quizQ1: c.questions[0]?.q ?? "", quizA1: c.questions[0]?.a ?? "",
            quizQ2: c.questions[1]?.q ?? "", quizA2: c.questions[1]?.a ?? "",
        }),
        summary: (c) => `${c.questions.filter((x) => has(x.q)).length} questions`,
    }),
    award: def({
        type: "award", label: "Award", icon: "🏆", category: "fun", gate: false, supports: ["birthday"],
        defaultConfig: () => ({ title: "" }),
        isFilled: (c) => has(c.title),
        fromV1: (v1) => (has(v1.awardTitle) ? { title: str(v1.awardTitle) } : null),
        toV1: (c) => ({ awardTitle: c.title }),
        summary: (c) => short(c.title) || "—",
    }),
    voice: def({
        type: "voice", label: "Voice note", icon: "🎤", category: "heart", gate: false, supports: both,
        defaultConfig: () => ({ audioUrl: "" }),
        isFilled: (c) => has(c.audioUrl),
        fromV1: (v1) => (has(v1.audioUrl) ? { audioUrl: str(v1.audioUrl) } : null),
        toV1: (c) => ({ audioUrl: c.audioUrl }),
        summary: () => "Voice message",
    }),
    gratitude: def({
        type: "gratitude", label: "Gratitude", icon: "🙏", category: "heart", gate: false, supports: both,
        defaultConfig: () => ({ text: "" }),
        isFilled: (c) => has(c.text),
        fromV1: (v1) => (has(v1.gratitudeText) ? { text: str(v1.gratitudeText) } : null),
        toV1: (c) => ({ gratitudeText: c.text }),
        summary: (c) => short(c.text) || "—",
    }),
    message: def({
        type: "message", label: "Main message", icon: "💌", category: "heart", gate: false, supports: both,
        defaultConfig: () => ({ text: "" }),
        isFilled: (c) => has(c.text),
        fromV1: (v1) => (has(v1.coreMessage) ? { text: str(v1.coreMessage) } : null),
        toV1: (c) => ({ coreMessage: c.text }),
        summary: (c) => short(c.text) || "—",
    }),
    promise: def({
        type: "promise", label: "Promise", icon: "🤞", category: "heart", gate: false, supports: both,
        defaultConfig: () => ({ text: "", scratchOff: true, smileLock: false }),
        isFilled: (c) => has(c.text),
        // also kept when only the lock flags differ from defaults, so round-trips stay exact
        fromV1: (v1) => (has(v1.futurePromise) || v1.showAsScratchOff === false || v1.requireSmileToUnlock === true
            ? { text: str(v1.futurePromise), scratchOff: v1.showAsScratchOff !== false, smileLock: v1.requireSmileToUnlock === true }
            : null),
        toV1: (c) => ({ futurePromise: c.text, showAsScratchOff: c.scratchOff, requireSmileToUnlock: c.smileLock }),
        summary: (c) => `${short(c.text, 30) || "—"}${c.scratchOff ? " · scratch-off" : ""}${c.smileLock ? " · smile lock" : ""}`,
    }),
    giftCard: def({
        type: "giftCard", label: "Gift card", icon: "🎁", category: "finale", gate: false, supports: both,
        defaultConfig: () => ({ kind: "custom", url: "", message: "" }),
        isFilled: (c) => has(c.kind) && has(c.url),
        fromV1: (v1) => (has(v1.giftCardType) || has(v1.giftCardUrl) || has(v1.giftCardMessage)
            ? { kind: str(v1.giftCardType), url: str(v1.giftCardUrl), ...(v1.giftCardMessage !== undefined ? { message: str(v1.giftCardMessage) } : {}) }
            : null),
        toV1: (c) => ({ giftCardType: c.kind, giftCardUrl: c.url, ...(c.message !== undefined ? { giftCardMessage: c.message } : {}) }),
        summary: (c) => (c.kind === "custom" ? "Custom gift" : `${c.kind} gift card`),
    }),
    finale: def({
        type: "finale", label: "Finale", icon: "🎆", category: "finale", gate: false, supports: both,
        defaultConfig: () => ({ effect: "confetti" }),
        isFilled: () => true,
        fromV1: (v1) => ({ effect: has(v1.finaleEffect) ? str(v1.finaleEffect) : "confetti" }),
        toV1: (c) => ({ finaleEffect: c.effect }),
        summary: (c) => c.effect,
    }),
    /* ---------- Mini-games (v2 only: no v1 fields, so old wishes never contain them) ---------- */
    candles: def({
        type: "candles", label: "Blow the Candles", icon: "🕯️", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ candles: 5, message: "Make a wish! 🎂", placement: "finale" }),
        isFilled: (c) => c.candles > 0,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.candles} candles · ${c.placement}`,
    }),
    prank: def({
        type: "prank", label: "Prank Link", icon: "😂", category: "game", gate: false, supports: both,
        defaultConfig: () => ({ kind: "error", placement: "opener" }),
        isFilled: () => true,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => ({ error: "Fake error screen", prediction: "Fake birthday prediction", loading: "Never-ending loading" }[c.kind] + ` · ${c.placement}`),
    }),
    trivia: def({
        type: "trivia", label: "Quiz + Leaderboard", icon: "🏅", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ title: "", questions: [{ q: "", options: ["", "", ""], correct: 0 }], leaderboard: true, placement: "fun" }),
        isFilled: (c) => c.questions.some((x) => has(x.q) && x.options.filter(has).length >= 2),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.questions.filter((x) => has(x.q)).length} questions${c.leaderboard ? " · leaderboard" : ""}`,
    }),
} satisfies { [K in BlockType]: BlockDefinition<K> };

export const GAME_TYPES = ["candles", "prank", "trivia"] as const satisfies readonly BlockType[];
export type GameType = (typeof GAME_TYPES)[number];
export const isGame = (t: BlockType): t is GameType => (GAME_TYPES as readonly BlockType[]).includes(t);

/** Story order used by today's (v1) viewers. Migration emits blocks in exactly this order. */
export const V1_STORY_ORDER: BlockType[] = [
    "intro", "connection", "roast", "quirks", "memory", "photos", "secretDate", "puzzle",
    "quiz", "award", "voice", "gratitude", "message", "promise", "giftCard", "finale",
];

export function getBlock<K extends BlockType>(type: K): BlockDefinition<K> {
    return BLOCKS[type] as unknown as BlockDefinition<K>;
}
