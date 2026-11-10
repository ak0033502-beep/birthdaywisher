/**
 * Wish data format v2 (Phase 3).
 *
 * v1 (current production) is one flat object with a fixed field per wizard step
 * (quizQ1/quizQ2, awardTitle, futurePromise...). v2 stores the wish as an ORDERED
 * list of blocks, so the story order and the number of items are flexible.
 *
 * Storage: still the same `wishes.data` JSONB column. No DB migration needed.
 * Old wishes are converted on read by migrateV1toV2() in ./migrate.ts.
 */

export type WishType = "birthday" | "anniversary";

export interface MediaItem { url: string; type: "photo" | "video" }

/* ---------- Block configs (one per block type) ---------- */
export interface IntroConfig { title?: string }                         // cover: "Happy Birthday, <name>!"
export interface ConnectionConfig { relationship: string }
export interface RoastConfig { level: number }                          // 0–100
export interface QuirksConfig { items: string[] }
export interface MemoryConfig { text: string }
export interface PhotosConfig { items: MediaItem[]; legacySingle?: boolean }
export interface SecretDateConfig { date: string }                      // YYYY-MM-DD, gate
export interface PuzzleConfig { imageUrl: string }                      // gate
export interface QuizConfig { questions: Array<{ q: string; a: string }> } // gate, 1–10 questions
export interface AwardConfig { title: string }
export interface VoiceConfig { audioUrl: string }
export interface GratitudeConfig { text: string }
export interface MessageConfig { text: string }
export interface PromiseConfig { text: string; scratchOff: boolean; smileLock: boolean }
export interface GiftCardConfig { kind: string; url: string; message?: string }
export interface FinaleConfig { effect: string }

/* ---------- Mini-games (Phase 5). Placement decides where the game sits in the story. ---------- */
export type GamePlacement = "opener" | "fun" | "finale";
export interface CandlesConfig { candles: number; message: string; placement: GamePlacement }
export interface PrankConfig { kind: "error" | "prediction" | "loading"; placement: GamePlacement }
export interface TriviaQuestion { q: string; options: string[]; correct: number }
export interface TriviaConfig { title: string; questions: TriviaQuestion[]; leaderboard: boolean; placement: GamePlacement }

export interface BlockConfigMap {
    intro: IntroConfig;
    connection: ConnectionConfig;
    roast: RoastConfig;
    quirks: QuirksConfig;
    memory: MemoryConfig;
    photos: PhotosConfig;
    secretDate: SecretDateConfig;
    puzzle: PuzzleConfig;
    quiz: QuizConfig;
    award: AwardConfig;
    voice: VoiceConfig;
    gratitude: GratitudeConfig;
    message: MessageConfig;
    promise: PromiseConfig;
    giftCard: GiftCardConfig;
    finale: FinaleConfig;
    candles: CandlesConfig;
    prank: PrankConfig;
    trivia: TriviaConfig;
}

export type BlockType = keyof BlockConfigMap;

/** One block in the story. `id` is stable so the wizard can reorder/edit it. */
export type BlockInstance = {
    [K in BlockType]: { id: string; type: K; config: BlockConfigMap[K] };
}[BlockType];

export interface WishDataV2 {
    schemaVersion: 2;
    wishType: WishType;
    recipient: {
        name: string;
        age: string;
        gender: string;
        nickname: string;
        relationship: string;
        vibe: string;
        coupleName: string;
        anniversaryYear: string;
    };
    blocks: BlockInstance[];               // array order = story order
    look: {
        theme: string;                     // colour theme (neon, elegant, pastel, ...)
        presentationStyle: string;         // cinematic, terminal, storybook, ...
        soundtrack: string;
        language: string;
    };
    unlock: {
        date: string;                      // ISO; wish stays locked until then ("" = open)
    };
    meta: {
        timeCapsule: string;               // v1 field kept for compatibility
        /** Unknown v1 keys preserved verbatim so round-tripping never loses data. */
        extra: Record<string, unknown>;
    };
}
