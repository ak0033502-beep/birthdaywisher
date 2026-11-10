/**
 * Wizard 2.0 core logic (React-free, unit-tested):
 *  - Draft shape + defaults
 *  - Ingredients (which blocks the user chose) → visible steps & chapters
 *  - Templates, Wish Power meter
 *  - buildWish(): Draft → WishDataV2 (what gets saved)
 */
import { BLOCKS, GAME_TYPES, V1_STORY_ORDER, isGame, type GameType } from "@/blocks/registry";
import type { BlockConfigMap, BlockInstance, BlockType, GamePlacement, WishDataV2, WishType } from "@/lib/wish/schema";

export type Mode = "quick" | "template" | "custom";

/** Blocks the user can switch on/off in "Pick ingredients". intro/connection/finale are automatic. */
export const INGREDIENTS: BlockType[] = ["photos", "memory", "quirks", "quiz", "roast", "award", "puzzle", "secretDate", "voice", "gratitude", "promise", "giftCard", "message"];
export const REQUIRED: BlockType[] = ["message"];
const AUTOMATIC: BlockType[] = ["intro", "connection", "finale"];

export type Configs = { [K in BlockType]?: BlockConfigMap[K] };

export interface Draft {
    v: 1;
    mode: Mode | null;
    template: string | null;
    wishType: WishType;
    recipient: WishDataV2["recipient"];
    enabled: BlockType[];
    /** "Mini-games" ingredient switched on → shows the games library step */
    wantGames: boolean;
    configs: Configs;
    order: BlockType[];                 // story order of all block types
    look: WishDataV2["look"];
    unlock: { mode: "now" | "date"; date: string }; // date = YYYY-MM-DD; locks until local midnight
    customSlug: string;
    previewText: string;
    step: string;                       // current step id
}

export function newDraft(wishType: WishType = "birthday"): Draft {
    return {
        v: 1,
        mode: null,
        template: null,
        wishType,
        recipient: { name: "", age: "", gender: "", nickname: "", relationship: "", vibe: "", coupleName: "", anniversaryYear: "" },
        enabled: wishType === "anniversary" ? ["photos", "memory", "quiz", "voice", "promise", "message"] : ["photos", "memory", "quiz", "roast", "message"],
        wantGames: false,
        configs: {},
        order: defaultOrder(),
        look: { theme: wishType === "anniversary" ? "rosegold-elegance" : "neon", presentationStyle: "cinematic", soundtrack: "lofi", language: "en" },
        unlock: { mode: "now", date: "" },
        customSlug: "",
        previewText: "",
        step: "start",
    };
}

/** Story order incl. games (after the quiz). */
export function defaultOrder(): BlockType[] {
    const o: BlockType[] = [...V1_STORY_ORDER];
    o.splice(o.indexOf("quiz") + 1, 0, ...GAME_TYPES);
    return o;
}

export const MAX_GAMES = 3;

export function getConfig<K extends BlockType>(d: Draft, type: K): BlockConfigMap[K] {
    return (d.configs[type] as BlockConfigMap[K] | undefined) ?? (BLOCKS[type].defaultConfig() as BlockConfigMap[K]);
}

export function isOn(d: Draft, type: BlockType): boolean {
    if (d.mode === "quick") return type === "photos" || type === "message";
    if (isGame(type)) return !!d.wantGames && d.enabled.includes(type);
    return REQUIRED.includes(type) || d.enabled.includes(type);
}

/* ---------- Steps & chapters ---------- */
export const CHAPTERS = ["About", "Pick", "Memories", "Fun & Games", "From the Heart", "Look", "Deliver"] as const;

export interface StepDef { id: string; chapter: number; block?: BlockType; required?: boolean }

const BLOCK_CHAPTER: Partial<Record<BlockType, number>> = {
    photos: 2, memory: 2, quirks: 2,
    quiz: 3, roast: 3, award: 3, puzzle: 3, secretDate: 3,
    message: 4, voice: 4, gratitude: 4, promise: 4,
    giftCard: 6,
};

export function visibleSteps(d: Draft): StepDef[] {
    const steps: StepDef[] = [{ id: "start", chapter: -1 }];
    if (d.mode === "template") steps.push({ id: "template", chapter: -1 });
    steps.push({ id: "name", chapter: 0, required: true });
    if (d.mode !== "quick") steps.push({ id: "relation", chapter: 0 }, { id: "vibe", chapter: 0 }, { id: "ingredients", chapter: 1 });

    const blockSteps: StepDef[] = INGREDIENTS
        .filter((t) => isOn(d, t) && supports(d, t))
        .map((t) => ({ id: `block:${t}`, chapter: BLOCK_CHAPTER[t] ?? 4, block: t, required: REQUIRED.includes(t) }))
        // by chapter; inside a chapter the required step (main message) comes first, then the extras
        .sort((a, b) => a.chapter - b.chapter || Number(!!b.required) - Number(!!a.required) || INGREDIENTS.indexOf(a.block!) - INGREDIENTS.indexOf(b.block!));
    if (d.mode !== "quick" && d.wantGames) {
        const at = blockSteps.findIndex((b) => b.chapter >= 3);
        const gameStep: StepDef = { id: "games", chapter: 3 };
        if (at < 0) blockSteps.push(gameStep); else blockSteps.splice(at, 0, gameStep);
    }
    steps.push(...blockSteps);

    steps.push({ id: "look", chapter: 5 });
    if (d.mode !== "quick") steps.push({ id: "order", chapter: 5 });
    steps.push({ id: "link", chapter: 6 }, { id: "review", chapter: 6 }, { id: "finish", chapter: 6 });
    return steps;
}

export function supports(d: Draft, t: BlockType): boolean {
    return (BLOCKS[t].supports as WishType[]).includes(d.wishType);
}

/** A step is valid when the user may continue past it. */
export function stepValid(d: Draft, s: StepDef): boolean {
    if (s.id === "name") return d.recipient.name.trim().length > 0;
    if (s.id === "template") return !!d.template;
    if (s.block === "message") return getConfig(d, "message").text.trim().length > 0;
    // a game the user picked must be playable (e.g. a quiz needs at least one complete question)
    if (s.id === "games") return chosenGames(d).every((g) => (BLOCKS[g].isFilled as (c: unknown) => boolean)(getConfig(d, g)));
    return true;
}

/* ---------- Build the saved wish ---------- */
function unlockIso(u: Draft["unlock"]): string {
    if (u.mode !== "date" || !/^\d{4}-\d{2}-\d{2}$/.test(u.date)) return "";
    const [y, m, day] = u.date.split("-").map(Number);
    return new Date(y, m - 1, day, 0, 0, 0, 0).toISOString(); // local midnight of the chosen day
}

export function buildWish(d: Draft): WishDataV2 {
    const chosen = new Set<BlockType>([...AUTOMATIC, ...INGREDIENTS.filter((t) => isOn(d, t) && supports(d, t)), ...GAME_TYPES.filter((t) => isOn(d, t))]);
    // older drafts may not have the game types in their order yet
    const order = [...d.order];
    for (const g of GAME_TYPES) if (!order.includes(g)) order.splice(Math.max(0, order.indexOf("finale")), 0, g);
    const blocks: BlockInstance[] = [];
    for (const type of order) {
        if (!chosen.has(type)) continue;
        let config: unknown = getConfig(d, type);
        if (type === "connection") {
            if (!d.recipient.relationship.trim()) continue;
            config = { relationship: d.recipient.relationship };
        }
        if (!(BLOCKS[type].isFilled as (c: unknown) => boolean)(config)) continue;
        blocks.push({ id: `${type}-1`, type, config } as BlockInstance);
    }
    // safety: intro first, finale last, whatever the order editor did
    blocks.sort((a, b) => (a.type === "intro" ? -1 : b.type === "intro" ? 1 : a.type === "finale" ? 1 : b.type === "finale" ? -1 : 0));
    placeGames(blocks);
    return {
        schemaVersion: 2,
        wishType: d.wishType,
        recipient: { ...d.recipient, name: d.recipient.name.trim(), coupleName: d.wishType === "anniversary" ? d.recipient.coupleName || d.recipient.name.trim() : d.recipient.coupleName },
        blocks,
        look: { ...d.look },
        unlock: { date: unlockIso(d.unlock) },
        meta: { timeCapsule: "", extra: d.previewText ? { previewText: d.previewText } : {} },
    };
}

/* ---------- Wish Power ---------- */
export function wishPower(d: Draft): { pct: number; label: string; tip: string } {
    const has = (t: BlockType) => isOn(d, t) && (BLOCKS[t].isFilled as (c: unknown) => boolean)(getConfig(d, t));
    const checks: Array<[boolean, number, string]> = [
        [d.recipient.name.trim().length > 0, 15, "Add their name"],
        [has("message"), 25, "Write your message for +25%"],
        [has("photos"), 15, "Add a photo for +15%"],
        [has("memory"), 10, "Share a memory for +10%"],
        [has("voice"), 15, "Add a voice note for +15% 🔥"],
        [has("quiz") || has("puzzle") || has("secretDate") || GAME_TYPES.some((g) => has(g)), 10, "Add a quiz, puzzle or mini-game for +10% 🎮"],
        [has("quirks") || has("award") || has("promise"), 10, "Add 'Things I love' or a promise for +10%"],
    ];
    let score = 0, max = 0, tip = "";
    for (const [ok, pts, t] of checks) { max += pts; if (ok) score += pts; else if (!tip) tip = t; }
    const pct = Math.round((score / max) * 100);
    const label = pct >= 90 ? "LEGENDARY 🏆" : pct >= 70 ? "epic! 🔥" : pct >= 45 ? "looking good 😊" : "just getting started";
    return { pct, label, tip };
}

/* ---------- Templates ---------- */
export interface Template { id: string; e: string; t: string; bg: string; wishType: WishType; vibe: string; relationship: string; enabled: BlockType[]; theme: string; message: string; quirks?: string[]; award?: string; promise?: string }

export const TEMPLATES: Template[] = [
    { id: "bestie", e: "😂", t: "Bestie Roast", bg: "linear-gradient(160deg,#FF9F43,#FF5C8A)", wishType: "birthday", vibe: "hardcore-roast", relationship: "Best Friend", enabled: ["photos", "memory", "quirks", "quiz", "roast", "award", "message"], theme: "neon", message: "Happy birthday to the only person who laughs at my jokes AND roasts me for them. Love you, idiot 🎂😂", quirks: ["Always 30 mins late", "Steals my hoodies", "That laugh"], award: "Most Annoying (and Most Loved) Human 2026" },
    { id: "romantic", e: "❤️", t: "Romantic", bg: "linear-gradient(160deg,#FF5C8A,#7C5CFF)", wishType: "birthday", vibe: "pure-romance", relationship: "Partner", enabled: ["photos", "memory", "voice", "quirks", "promise", "message"], theme: "elegant", message: "Every year with you is my favourite year. Happy birthday, my love ❤️", promise: "Dinner date this weekend, my treat 🍝" },
    { id: "parents", e: "👩", t: "For Mom & Dad", bg: "linear-gradient(160deg,#2ED8B6,#7C5CFF)", wishType: "birthday", vibe: "tear-jerker", relationship: "Parent", enabled: ["photos", "memory", "voice", "gratitude", "message"], theme: "pastel", message: "Thank you for every sacrifice you never talked about. Happy birthday, I love you 💛" },
    { id: "sibling", e: "🧑‍🤝‍🧑", t: "Sibling", bg: "linear-gradient(160deg,#FFD93D,#FF9F43)", wishType: "birthday", vibe: "grand-celebration", relationship: "Sibling", enabled: ["photos", "memory", "quiz", "roast", "message"], theme: "neon", message: "Happy birthday! Thanks for being my first best friend (and my first enemy) 😂" },
    { id: "colleague", e: "💼", t: "Colleague", bg: "linear-gradient(160deg,#7C5CFF,#2ED8B6)", wishType: "birthday", vibe: "grand-celebration", relationship: "Colleague", enabled: ["photos", "award", "message"], theme: "monochrome", message: "Happy birthday to the person who makes Monday meetings bearable! 🎉", award: "Team MVP 2026" },
    { id: "simple", e: "🤍", t: "Simple & Sweet", bg: "linear-gradient(160deg,#FFE3EC,#FFF1C9)", wishType: "birthday", vibe: "pure-romance", relationship: "", enabled: ["photos", "message"], theme: "pastel", message: "Wishing you a year as lovely as you are 🤍" },
    { id: "anniversary", e: "💍", t: "Anniversary", bg: "linear-gradient(160deg,#FFD93D,#FF9F43)", wishType: "anniversary", vibe: "pure-romance", relationship: "Couple", enabled: ["photos", "memory", "quiz", "voice", "promise", "message"], theme: "rosegold-elegance", message: "Here's to another year of choosing each other, every single day 💍", promise: "A trip, just the two of us" },
];

export function applyTemplate(d: Draft, id: string): Draft {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return d;
    const configs: Configs = { ...d.configs, message: { text: t.message } };
    if (t.quirks) configs.quirks = { items: [...t.quirks] };
    if (t.award) configs.award = { title: t.award };
    if (t.promise) configs.promise = { text: t.promise, scratchOff: true, smileLock: false };
    return {
        ...d,
        mode: "template",
        template: id,
        wishType: t.wishType,
        recipient: { ...d.recipient, vibe: t.vibe, relationship: d.recipient.relationship || t.relationship },
        enabled: [...t.enabled],
        configs,
        look: { ...d.look, theme: t.theme },
    };
}

/** Recommended ingredient set for the chosen vibe (used by the "⚡ Use recommended" button). */
export function recommended(vibe: string, wishType: WishType): BlockType[] {
    if (wishType === "anniversary") return ["photos", "memory", "quiz", "voice", "promise", "message"];
    switch (vibe) {
        case "hardcore-roast": return ["photos", "quirks", "roast", "quiz", "award", "message"];
        case "tear-jerker": return ["photos", "memory", "voice", "gratitude", "message"];
        case "pure-romance": return ["photos", "memory", "voice", "quirks", "promise", "message"];
        default: return ["photos", "memory", "quiz", "roast", "message"];
    }
}

/* ---------- Mini-games ---------- */
function placementOf(b: BlockInstance): GamePlacement | null {
    return isGame(b.type) ? (b.config as { placement: GamePlacement }).placement : null;
}

/** opener → right after the cover; finale → right before the finale; fun → stays where the order put it. */
export function placeGames(blocks: BlockInstance[]): void {
    const openers = blocks.filter((b) => placementOf(b) === "opener");
    const finales = blocks.filter((b) => placementOf(b) === "finale");
    const rest = blocks.filter((b) => !openers.includes(b) && !finales.includes(b));
    const introAt = rest.findIndex((b) => b.type === "intro");
    rest.splice(introAt + 1, 0, ...openers);
    const finaleAt = rest.findIndex((b) => b.type === "finale");
    rest.splice(finaleAt < 0 ? rest.length : finaleAt, 0, ...finales);
    blocks.splice(0, blocks.length, ...rest);
}

export function chosenGames(d: Draft): GameType[] {
    return GAME_TYPES.filter((g) => d.enabled.includes(g));
}
