/**
 * v1 ⇄ v2 conversion.
 *
 *  migrateV1toV2(raw)  any stored wish (v1 flat, or already v2) → v2 blocks
 *  v2ToV1(v2)          v2 → v1 flat, so today's 6 viewers keep working during the transition
 *  normalizeWish(raw)  convenience: { v1, v2 } for a stored wish
 *
 * Guarantee (unit-tested): v2ToV1(migrateV1toV2(x)) deep-equals { ...V1_DEFAULTS, ...x }
 * for ANY stored v1 wish: unknown keys go to meta.extra, and odd legacy combinations
 * the blocks can't express go to meta.v1Overrides.
 */
import type { WishData } from "@/lib/WishContext";
import { BLOCKS, V1_STORY_ORDER, getBlock } from "@/blocks/registry";
import type { BlockInstance, BlockType, WishDataV2 } from "./schema";
import { V1_DEFAULTS } from "./v1";

type AnyRecord = Record<string, unknown>;
type V2WithOverrides = WishDataV2 & { meta: WishDataV2["meta"] & { v1Overrides?: AnyRecord } };

/** v1 keys represented by recipient/look/unlock/meta or by a block. Everything else is "extra". */
const OWNED_KEYS = new Set<string>([
    "wishType", "targetName", "targetAge", "targetGender", "nickname", "relationship", "vibe", "coupleName", "anniversaryYear",
    "theme", "presentationStyle", "soundtrack", "language", "unlockDate", "timeCapsule",
    "roastLevel", "quirks", "memoryTale", "mediaItems", "mediaUrl", "mediaType", "secretDate", "puzzleImageUrl",
    "quizQ1", "quizA1", "quizQ2", "quizA2", "awardTitle", "audioUrl", "gratitudeText", "coreMessage",
    "futurePromise", "showAsScratchOff", "requireSmileToUnlock", "giftCardType", "giftCardUrl", "giftCardMessage", "finaleEffect",
]);

const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);

export function isV2(raw: unknown): raw is WishDataV2 {
    return !!raw && typeof raw === "object" && (raw as AnyRecord).schemaVersion === 2 && Array.isArray((raw as AnyRecord).blocks);
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a as AnyRecord), kb = Object.keys(b as AnyRecord);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual((a as AnyRecord)[k], (b as AnyRecord)[k]));
}

/** Fill missing fields with defaults (old wishes predate some fields). */
export function normalizeV1(raw: unknown): WishData {
    const obj = raw && typeof raw === "object" ? (raw as AnyRecord) : {};
    return { ...V1_DEFAULTS, ...obj } as WishData;
}

export function migrateV1toV2(raw: unknown): WishDataV2 {
    if (isV2(raw)) return raw;
    const v1 = normalizeV1(raw);
    const v1r = v1 as unknown as AnyRecord;

    const blocks: BlockInstance[] = [];
    for (const type of V1_STORY_ORDER) {
        const config = (BLOCKS[type].fromV1 as (w: WishData) => unknown)(v1);
        if (config !== null) blocks.push({ id: `${type}-1`, type, config } as BlockInstance);
    }

    const extra: AnyRecord = {};
    for (const [k, v] of Object.entries(v1r)) if (!OWNED_KEYS.has(k)) extra[k] = v;

    const v2: V2WithOverrides = {
        schemaVersion: 2,
        wishType: v1.wishType === "anniversary" ? "anniversary" : "birthday",
        recipient: {
            name: s(v1.targetName), age: s(v1.targetAge), gender: s(v1.targetGender), nickname: s(v1.nickname),
            relationship: s(v1.relationship), vibe: s(v1.vibe), coupleName: s(v1.coupleName), anniversaryYear: s(v1.anniversaryYear),
        },
        blocks,
        look: { theme: s(v1.theme), presentationStyle: s(v1.presentationStyle), soundtrack: s(v1.soundtrack), language: s(v1.language) },
        unlock: { date: s(v1.unlockDate) },
        meta: { timeCapsule: s(v1.timeCapsule), extra },
    };

    // Anything the blocks can't express exactly (odd legacy combos, non-string values) is kept as an override.
    const rebuilt = v2ToV1(v2) as unknown as AnyRecord;
    const overrides: AnyRecord = {};
    for (const k of OWNED_KEYS) {
        if (k in v1r && !deepEqual(rebuilt[k], v1r[k])) overrides[k] = v1r[k];
    }
    if (Object.keys(overrides).length) v2.meta.v1Overrides = overrides;
    return v2;
}

export function v2ToV1(v2: WishDataV2): WishData {
    const out: AnyRecord = {
        ...V1_DEFAULTS,
        wishType: v2.wishType,
        targetName: v2.recipient.name,
        targetAge: v2.recipient.age,
        targetGender: v2.recipient.gender,
        nickname: v2.recipient.nickname,
        relationship: v2.recipient.relationship,
        vibe: v2.recipient.vibe,
        coupleName: v2.recipient.coupleName,
        anniversaryYear: v2.recipient.anniversaryYear,
        theme: v2.look.theme,
        presentationStyle: v2.look.presentationStyle,
        soundtrack: v2.look.soundtrack,
        language: v2.look.language,
        unlockDate: v2.unlock.date,
        timeCapsule: v2.meta.timeCapsule,
    };
    // v1 can hold one block per type: the first one wins (v2-only extras, e.g. a 2nd quiz, are not representable in v1)
    const seen = new Set<BlockType>();
    for (const b of v2.blocks) {
        if (seen.has(b.type)) continue;
        seen.add(b.type);
        Object.assign(out, (getBlock(b.type).toV1 as (c: unknown) => AnyRecord)(b.config));
    }
    Object.assign(out, v2.meta.extra);
    const ov = (v2 as V2WithOverrides).meta.v1Overrides;
    if (ov) Object.assign(out, ov);
    return out as unknown as WishData;
}

/** For a stored wish (either version) get both shapes. */
export function normalizeWish(raw: unknown): { v1: WishData; v2: WishDataV2 } {
    const v2 = migrateV1toV2(raw);
    return { v2, v1: isV2(raw) ? v2ToV1(v2) : normalizeV1(raw) };
}
