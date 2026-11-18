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
        type: "quirks", label: "Things I love", icon: "💗", category: "memories", gate: false, supports: both,
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
        defaultConfig: () => ({ effect: "fireworks" }),
        isFilled: () => true,
        fromV1: (v1) => ({ effect: has(v1.finaleEffect) ? str(v1.finaleEffect) : "confetti" }),
        toV1: (c) => ({ finaleEffect: c.effect }),
        summary: (c) => c.effect,
    }),
    /* ---------- Mini-games (v2 only: no v1 fields, so old wishes never contain them) ---------- */
    heartbeat: def({
        type: "heartbeat", label: "Hold My Hand", icon: "🫶", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ message: "No matter how far apart we are, I'm right here with you ❤️", placement: "finale" }),
        isFilled: (c) => has(c.message),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `Heartbeat sync · ${c.placement}`,
    }),
    lanterns: def({
        type: "lanterns", label: "Sky Lanterns", icon: "🏮", category: "game", gate: true, supports: both,
        defaultConfig: () => ({
            wishes: [
                "May every morning bring you peace & big smiles 🌅",
                "May all your secret dreams come true this year 🏮",
                "Thank you for making life warmer just by being in it ❤️",
            ],
            placement: "finale",
        }),
        isFilled: (c) => Array.isArray(c.wishes) && c.wishes.some(has),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.wishes.filter(has).length} lanterns · ${c.placement}`,
    }),
    balloons: def({
        type: "balloons", label: "Love-Note Balloons", icon: "🎈", category: "game", gate: true, supports: both,
        defaultConfig: () => ({
            notes: [
                "Your laugh makes the hardest days feel light 🥰",
                "Nobody understands me the way you do ❤️",
                "So proud of the person you are becoming 🎉",
                "Here's to 100 more memories together 🎈",
            ],
            placement: "fun",
        }),
        isFilled: (c) => Array.isArray(c.notes) && c.notes.some(has),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.notes.filter(has).length} balloons · ${c.placement}`,
    }),
    memoryMatch: def({
        type: "memoryMatch", label: "Memory Match", icon: "🃏", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ message: "Every moment with you is worth remembering ❤️", usePhotos: true, placement: "fun" }),
        isFilled: () => true,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `6 pairs${c.usePhotos ? " (uses photos)" : ""} · ${c.placement}`,
    }),
    guessYear: def({
        type: "guessYear", label: "Guess the Year", icon: "📅", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ moments: [{ caption: "When our favourite memory began ❤️", year: 2022 }], placement: "fun" }),
        isFilled: (c) => Array.isArray(c.moments) && c.moments.some((m) => has(m.caption) && m.year >= 1950 && m.year <= 2035),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.moments.filter((m) => has(m.caption)).length} moments · ${c.placement}`,
    }),
    candles: def({
        type: "candles", label: "Blow the Candles", icon: "🕯️", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ candles: 5, message: "Make a wish! 🎂", placement: "finale" }),
        isFilled: (c) => c.candles > 0,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.candles} candles · ${c.placement}`,
    }),
    trivia: def({
        type: "trivia", label: "Birthday Quiz", icon: "🎯", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ title: "", questions: [{ q: "", options: ["", "", ""], correct: 0 }], placement: "fun" }),
        isFilled: (c) => c.questions.some((x) => has(x.q) && x.options.filter(has).length >= 2),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.questions.filter((x) => has(x.q)).length} questions · ${c.placement}`,
    }),
    prank: def({
        type: "prank", label: "Prank Link", icon: "😂", category: "game", gate: false, supports: both,
        defaultConfig: () => ({ kind: "error", placement: "opener" }),
        isFilled: () => true,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => ({ error: "Fake error screen", prediction: "Funny prediction", loading: "99% stuck loading" }[c.kind] + ` · ${c.placement}`),
    }),
    wheel: def({
        type: "wheel", label: "Spin the Wheel", icon: "🎡", category: "game", gate: false, supports: both,
        defaultConfig: () => ({
            slices: ["🍕 Pizza treat on me", "☕ Late-night coffee drive", "🎬 Movie of your choice", "🍰 Extra birthday cake", "🤗 Tightest hug ever", "🎁 Mystery treat"],
            placement: "fun",
        }),
        isFilled: (c) => Array.isArray(c.slices) && c.slices.filter(has).length >= 3,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.slices.filter(has).length} wheel slices · ${c.placement}`,
    }),
    catchGifts: def({
        type: "catchGifts", label: "Catch the Gifts", icon: "🎁", category: "game", gate: true, supports: both,
        defaultConfig: () => ({ target: 8, message: "You caught every bit of birthday love! 🎉", placement: "fun" }),
        isFilled: (c) => c.target > 0,
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `Catch ${c.target} gifts · ${c.placement}`,
    }),
    treasure: def({
        type: "treasure", label: "Treasure Hunt", icon: "🗺️", category: "game", gate: true, supports: both,
        defaultConfig: () => ({
            clues: [
                { riddle: "Clue 1: What has candles on top and wishes inside? 🎂", answer: "cake" },
                { riddle: "Clue 2: Who is the star of today's celebration? (Hint: type 'me' 😄)", answer: "me" },
            ],
            reward: "You unlocked the real treasure: endless love & your best year yet ❤️",
            placement: "fun",
        }),
        isFilled: (c) => Array.isArray(c.clues) && c.clues.some((x) => has(x.riddle) && has(x.answer)),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${c.clues.filter((x) => has(x.riddle)).length} clues · ${c.placement}`,
    }),
    newspaper: def({
        type: "newspaper", label: "Birthday Gazette", icon: "📰", category: "game", gate: false, supports: both,
        defaultConfig: () => ({
            headline: "LOCAL LEGEND OFFICIALLY LEVELS UP TODAY!",
            subhead: "Experts confirm smiles and good vibes have reached an all-time high",
            story: "Witnesses report cake supplies are running dangerously low while friends & family gather to celebrate their favourite human.",
            placement: "opener",
        }),
        isFilled: (c) => has(c.headline),
        fromV1: () => null,
        toV1: () => ({}),
        summary: (c) => `${short(c.headline, 28)} · ${c.placement}`,
    }),
} satisfies { [K in BlockType]: BlockDefinition<K> };

export const GAME_TYPES = [
    "heartbeat", "lanterns", "balloons", "memoryMatch", "guessYear",
    "candles", "trivia", "prank", "wheel", "catchGifts", "treasure", "newspaper",
] as const satisfies readonly BlockType[];
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
