"use client";

import { BLOCKS, type GameType } from "@/blocks/registry";
import type { BlockConfigMap, GamePlacement, TriviaQuestion } from "@/lib/wish/schema";

export interface GameMeta {
    type: GameType;
    mood: "heart" | "fun";
    e: string;
    t: string;
    d: string;
    badge?: string;
    bg: string;
    slug: string;
}

/** Complete 12-game library: 5 Emotional & Connected + 7 Party & Fun (zero leaderboard, 100% personal). */
export const GAME_LIBRARY: GameMeta[] = [
    // ❤️ Emotional, Sweet & Connected
    { type: "heartbeat", mood: "heart", e: "🫶", t: "Hold My Hand", d: "They press & hold to sync heartbeats with you across any distance", badge: "❤️ Most emotional", bg: "linear-gradient(135deg,#FFE3EC,#F3E8FF)", slug: "hold-my-hand" },
    { type: "lanterns", mood: "heart", e: "🏮", t: "Sky Lanterns", d: "Light & release glowing sky lanterns carrying your blessings", badge: "🏮 Pure blessings", bg: "linear-gradient(135deg,#FFF1C9,#FFE3EC)", slug: "sky-lanterns" },
    { type: "balloons", mood: "heart", e: "🎈", t: "Love-Note Balloons", d: "Each popped balloon unfolds a sweet reason why they're special", badge: "💌 Sweet notes", bg: "linear-gradient(135deg,#FFE4E6,#DDD6FE)", slug: "balloon-pop" },
    { type: "memoryMatch", mood: "heart", e: "🃏", t: "Memory Match", d: "3D flip cards using your uploaded photos & favourite icons", bg: "linear-gradient(135deg,#E0F2FE,#FCE7F3)", slug: "memory-match" },
    { type: "guessYear", mood: "heart", e: "📅", t: "Guess the Year", d: "Nostalgic timeline slider to guess when your moments happened", bg: "linear-gradient(135deg,#FEF3C7,#FDE68A)", slug: "guess-the-year" },

    // 🎉 Party, Playful & Fun
    { type: "candles", mood: "fun", e: "🕯️", t: "Blow the Candles", d: "Real mic blow meter (or tap) to blow out cake candles", badge: "🔥 Crowd favourite", bg: "linear-gradient(135deg,#FFE3EC,#FFD6A5)", slug: "blow-the-candles" },
    { type: "trivia", mood: "fun", e: "🎯", t: "Birthday Quiz", d: "Personal multiple-choice bond quiz (no public leaderboard)", bg: "linear-gradient(135deg,#E5DEFF,#C9F2FF)", slug: "birthday-quiz" },
    { type: "prank", mood: "fun", e: "😂", t: "Prank Link", d: "Fake expired error, crystal prophecy or 99% stuck gift → Gotcha!", bg: "linear-gradient(135deg,#FFF1C9,#DDF8F1)", slug: "birthday-prank-link" },
    { type: "wheel", mood: "fun", e: "🎡", t: "Spin the Wheel", d: "They spin to win a real birthday treat voucher from you", bg: "linear-gradient(135deg,#FFEDD5,#FCE7F3)", slug: "spin-the-wheel" },
    { type: "catchGifts", mood: "fun", e: "🎁", t: "Catch the Gifts", d: "Slide the basket to catch falling gifts & dodge broccoli", bg: "linear-gradient(135deg,#DCFCE7,#E0F2FE)", slug: "catch-the-gifts" },
    { type: "treasure", mood: "fun", e: "🗺️", t: "Treasure Hunt", d: "Personal riddles that unlock a golden treasure chest", bg: "linear-gradient(135deg,#FEF9C3,#FFEDD5)", slug: "birthday-treasure-hunt" },
    { type: "newspaper", mood: "fun", e: "📰", t: "Birthday Gazette", d: "Vintage front-page breaking news edition starring them", bg: "linear-gradient(135deg,#F5F5F4,#FEF3C7)", slug: "birthday-newspaper" },
];

export { COMING_SOON } from "@/components/games/gamePages";

const PLACEMENTS: Array<{ id: GamePlacement; t: string }> = [
    { id: "opener", t: "🚪 At the start" },
    { id: "fun", t: "🎯 In the middle" },
    { id: "finale", t: "🎆 Before the finale" },
];

export function PlacementChips({ value, onChange }: { value: GamePlacement; onChange: (p: GamePlacement) => void }) {
    return (
        <div className="wz2-chips" role="radiogroup" aria-label="Where should this game play?">
            {PLACEMENTS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={value === p.id} className={`wz2-chip ${value === p.id ? "is-on" : ""}`} onClick={() => onChange(p.id)}>{p.t}</button>
            ))}
        </div>
    );
}

/* ---------- Individual Editors ---------- */

const HEARTBEAT_PRESETS = [
    "Chahe kitni bhi doori ho, main hamesha tere saath hoon ❤️",
    "No matter how far apart we are, I'm holding your hand right now ❤️",
    "Every beat of this day belongs to you — Happy Birthday! 🥰",
    "Close your eyes… consider this the tightest hug from me 🤗",
];

export function HeartbeatEditor({ value, onChange }: { value: BlockConfigMap["heartbeat"]; onChange: (v: BlockConfigMap["heartbeat"]) => void }) {
    return (
        <>
            <span className="wz2-label">Secret message revealed when your heartbeats sync</span>
            <textarea className="wz2-field" rows={2} style={{ fontSize: 15 }} value={value.message} maxLength={200}
                placeholder="No matter how far apart we are, I'm right here with you ❤️"
                onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Heartbeat message" />
            <div className="wz2-chips">
                {HEARTBEAT_PRESETS.map((p) => (
                    <button key={p} type="button" className="wz2-chip" onClick={() => onChange({ ...value, message: p })}>＋ {p.slice(0, 34)}…</button>
                ))}
            </div>
        </>
    );
}

const LANTERN_PRESETS = [
    "Teri har subah sukoon aur badi si smile le kar aaye 🌅",
    "Is saal tera har chhupa hua sapna poora ho 🏮",
    "May good health, peace & endless laughter follow you everywhere ❤️",
    "Thank you for always being my safe place 🥰",
];

function ListItemsEditor({ items, max, label, placeholder, presets, onChange }: {
    items: string[]; max: number; label: string; placeholder: string; presets: string[]; onChange: (next: string[]) => void;
}) {
    const list = items.length ? items : [""];
    const setAt = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
    return (
        <>
            <span className="wz2-label">{label}</span>
            <div style={{ display: "grid", gap: 8 }}>
                {list.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: 13, opacity: 0.65, width: 22 }}>#{i + 1}</span>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "10px 12px" }} value={item} maxLength={120}
                            placeholder={placeholder} onChange={(e) => setAt(i, e.target.value)} aria-label={`${label} ${i + 1}`} />
                        {list.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>}
                    </div>
                ))}
            </div>
            <div className="wz2-chips" style={{ marginTop: 8 }}>
                {list.length < max && <button type="button" className="wz2-chip" onClick={() => onChange([...list, ""])}>＋ Add ({list.length}/{max})</button>}
                {presets.map((p) => !list.includes(p) && list.length < max && (
                    <button key={p} type="button" className="wz2-chip" onClick={() => onChange([...list.filter(Boolean), p].slice(0, max))}>💡 {p.slice(0, 28)}…</button>
                ))}
            </div>
        </>
    );
}

export function LanternsEditor({ value, onChange }: { value: BlockConfigMap["lanterns"]; onChange: (v: BlockConfigMap["lanterns"]) => void }) {
    return (
        <ListItemsEditor
            items={value.wishes}
            max={5}
            label="Blessings inside each sky lantern (1–5)"
            placeholder="e.g. May all your secret dreams come true 🏮"
            presets={LANTERN_PRESETS}
            onChange={(wishes) => onChange({ ...value, wishes })}
        />
    );
}

const BALLOON_PRESETS = [
    "Tu bina bole sab samajh jaata hai ❤️",
    "Teri hasi poora din theek kar deti hai 🥰",
    "Thank you for never giving up on us 🎈",
    "Official favourite human — today & every day 🎂",
];

export function BalloonsEditor({ value, onChange }: { value: BlockConfigMap["balloons"]; onChange: (v: BlockConfigMap["balloons"]) => void }) {
    return (
        <ListItemsEditor
            items={value.notes}
            max={6}
            label="Sweet notes hidden inside the balloons (2–6)"
            placeholder="e.g. Your laugh makes the hardest days feel light 🥰"
            presets={BALLOON_PRESETS}
            onChange={(notes) => onChange({ ...value, notes })}
        />
    );
}

export function MemoryMatchEditor({ value, onChange }: { value: BlockConfigMap["memoryMatch"]; onChange: (v: BlockConfigMap["memoryMatch"]) => void }) {
    return (
        <>
            <label className="wz2-row" style={{ marginTop: 6 }}>
                <span>📸 Use my uploaded wish photos on the cards (fills remaining pairs with cute icons)</span>
                <input type="checkbox" checked={value.usePhotos} onChange={(e) => onChange({ ...value, usePhotos: e.target.checked })} />
            </label>
            <span className="wz2-label">Message revealed when all pairs are matched</span>
            <input className="wz2-field" style={{ fontSize: 15 }} value={value.message} maxLength={140}
                placeholder="Every moment with you is worth remembering ❤️"
                onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Match message" />
        </>
    );
}

export function GuessYearEditor({ value, onChange }: { value: BlockConfigMap["guessYear"]; onChange: (v: BlockConfigMap["guessYear"]) => void }) {
    const list = value.moments.length ? value.moments : [{ caption: "", year: 2022 }];
    const setAt = (i: number, patch: Partial<{ caption: string; year: number }>) =>
        onChange({ ...value, moments: list.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
    return (
        <>
            <span className="wz2-label">Memories &amp; the year they happened (1–4)</span>
            <div style={{ display: "grid", gap: 10 }}>
                {list.map((m, i) => (
                    <div key={i} className="bw-card" style={{ padding: 12, display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <b style={{ fontSize: 13, color: "var(--p-pink)" }}>Moment #{i + 1}</b>
                            {list.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange({ ...value, moments: list.filter((_, j) => j !== i) })}>Remove</button>}
                        </div>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "10px 12px" }} value={m.caption} maxLength={120}
                            placeholder="e.g. When we first met / Our crazy Goa trip"
                            onChange={(e) => setAt(i, { caption: e.target.value })} aria-label={`Moment ${i + 1} clue`} />
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>Year:</span>
                            <input className="wz2-field" style={{ width: 110, fontSize: 15, padding: "8px 12px" }} type="number" min={1980} max={2026}
                                value={m.year} onChange={(e) => setAt(i, { year: Math.max(1980, Math.min(2026, Number(e.target.value) || 2022)) })} aria-label={`Moment ${i + 1} year`} />
                        </div>
                    </div>
                ))}
            </div>
            {list.length < 4 && (
                <div className="wz2-chips" style={{ marginTop: 8 }}>
                    <button type="button" className="wz2-chip" onClick={() => onChange({ ...value, moments: [...list, { caption: "", year: 2023 }] })}>＋ Add moment ({list.length}/4)</button>
                </div>
            )}
        </>
    );
}

export function CandlesEditor({ value, onChange, age }: { value: BlockConfigMap["candles"]; onChange: (v: BlockConfigMap["candles"]) => void; age?: string }) {
    return (
        <>
            <span className="wz2-label">Number of candles (max 12 on screen)</span>
            <div className="wz2-chips">
                {[1, 3, 5, 7, 10, 12].map((n) => <button key={n} type="button" className={`wz2-chip ${value.candles === n ? "is-on" : ""}`} onClick={() => onChange({ ...value, candles: n })}>{n}</button>)}
                {age && Number(age) > 0 && <button type="button" className="wz2-chip" onClick={() => onChange({ ...value, candles: Math.min(12, Number(age)) })}>Match age ({age})</button>}
            </div>
            <span className="wz2-label">Message after the candles go out</span>
            <input className="wz2-field" style={{ fontSize: 16 }} value={value.message} maxLength={120} placeholder="Make a wish! 🎂" onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Message after the candles" />
        </>
    );
}

export function PrankEditor({ value, onChange }: { value: BlockConfigMap["prank"]; onChange: (v: BlockConfigMap["prank"]) => void }) {
    const kinds: Array<{ id: BlockConfigMap["prank"]["kind"]; e: string; t: string; d: string }> = [
        { id: "error", e: "⚠️", t: "Fake expired error", d: "\"HTTP 410 · Link expired\"" },
        { id: "prediction", e: "🔮", t: "Funny prediction", d: "\"Reading your future…\"" },
        { id: "loading", e: "⏳", t: "99% stuck loading", d: "\"Eating a slice of your cake…\"" },
    ];
    return (
        <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
            {kinds.map((k) => (
                <button key={k.id} type="button" className={`bw-card wz2-choice ${value.kind === k.id ? "is-on" : ""}`} onClick={() => onChange({ ...value, kind: k.id })}>
                    <span className="e" aria-hidden="true">{k.e}</span><h4>{k.t}</h4><p>{k.d}</p>
                </button>
            ))}
        </div>
    );
}

const QUIZ_STARTERS: TriviaQuestion[] = [
    { q: "What is our ultimate comfort food?", options: ["Maggi at 2 AM", "Biryani", "Loaded Pizza"], correct: 0 },
    { q: "Who always takes longer to get ready?", options: ["Definitely me", "Definitely you", "Both always late 😂"], correct: 2 },
    { q: "What's the best plan for our next hangout?", options: ["Long drive + music", "Food + endless gossip", "Movie marathon"], correct: 0 },
];

export function TriviaEditor({ value, onChange, name }: { value: BlockConfigMap["trivia"]; onChange: (v: BlockConfigMap["trivia"]) => void; name: string }) {
    const qs = value.questions.length ? value.questions : [{ q: "", options: ["", "", ""], correct: 0 }];
    const setQ = (i: number, q: TriviaQuestion) => onChange({ ...value, questions: qs.map((x, j) => (j === i ? q : x)) });
    return (
        <>
            <span className="wz2-label">Quiz title (personal, no public leaderboard)</span>
            <input className="wz2-field" style={{ fontSize: 16 }} value={value.title} maxLength={80} placeholder={`How well do we know each other, ${name || "bestie"}?`} onChange={(e) => onChange({ ...value, title: e.target.value })} aria-label="Quiz title" />
            <div className="wz2-chips" style={{ marginTop: 8 }}>
                {QUIZ_STARTERS.map((st, idx) => (
                    <button key={idx} type="button" className="wz2-chip" onClick={() => {
                        const emptyIdx = qs.findIndex((x) => !x.q.trim());
                        if (emptyIdx >= 0) setQ(emptyIdx, { ...st, options: [...st.options] });
                        else if (qs.length < 10) onChange({ ...value, questions: [...qs, { ...st, options: [...st.options] }] });
                    }}>💡 {st.q.slice(0, 28)}…</button>
                ))}
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {qs.map((x, i) => (
                    <div key={i} className="bw-card" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ fontSize: 13, color: "var(--p-pink)" }}>Question {i + 1}</b>
                            {qs.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange({ ...value, questions: qs.filter((_, j) => j !== i) })}>Remove</button>}
                        </div>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "11px 13px", marginTop: 6 }} value={x.q} maxLength={120} placeholder="e.g. What's my favourite midnight snack?" aria-label={`Quiz question ${i + 1}`} onChange={(e) => setQ(i, { ...x, q: e.target.value })} />
                        {x.options.map((o, k) => (
                            <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                                <button type="button" onClick={() => setQ(i, { ...x, correct: k })} aria-label={`Mark option ${k + 1} as correct`} title="Mark as correct"
                                    style={{ width: 30, height: 30, borderRadius: "50%", flex: "0 0 auto", border: "2px solid var(--p-line)", background: x.correct === k ? "var(--p-mint)" : "var(--p-surface)", color: "#fff", fontWeight: 900 }}>
                                    {x.correct === k ? "✓" : ""}
                                </button>
                                <input className="wz2-field" style={{ fontSize: 14, padding: "9px 12px" }} value={o} maxLength={60} placeholder={`Option ${String.fromCharCode(65 + k)}`} aria-label={`Question ${i + 1} option ${k + 1}`}
                                    onChange={(e) => setQ(i, { ...x, options: x.options.map((y, m) => (m === k ? e.target.value : y)) })} />
                            </div>
                        ))}
                        <div className="wz2-chips">
                            {x.options.length < 4 && <button type="button" className="wz2-chip" onClick={() => setQ(i, { ...x, options: [...x.options, ""] })}>＋ Option</button>}
                            {x.options.length > 2 && <button type="button" className="wz2-chip" onClick={() => setQ(i, { ...x, options: x.options.slice(0, -1), correct: Math.min(x.correct, x.options.length - 2) })}>－ Option</button>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="wz2-chips"><button type="button" className="wz2-chip" disabled={qs.length >= 10} onClick={() => onChange({ ...value, questions: [...qs, { q: "", options: ["", "", ""], correct: 0 }] })}>＋ Add question ({qs.length}/10)</button></div>
            <p className="wz2-sub" style={{ fontSize: 13, marginTop: 4 }}>Tap the circle next to the right option to mark ✓ correct.</p>
        </>
    );
}

export function WheelEditor({ value, onChange }: { value: BlockConfigMap["wheel"]; onChange: (v: BlockConfigMap["wheel"]) => void }) {
    return (
        <ListItemsEditor
            items={value.slices}
            max={6}
            label="Treat / dare slices on the wheel (3–6)"
            placeholder="e.g. 🍕 Pizza treat on me"
            presets={["🍨 Ice cream date", "🛍️ Mini shopping spree", "🎮 Gaming night", "🍫 Box of chocolates"]}
            onChange={(slices) => onChange({ ...value, slices })}
        />
    );
}

export function CatchGiftsEditor({ value, onChange }: { value: BlockConfigMap["catchGifts"]; onChange: (v: BlockConfigMap["catchGifts"]) => void }) {
    return (
        <>
            <span className="wz2-label">How many gifts to catch?</span>
            <div className="wz2-chips">
                {[5, 8, 10, 12].map((n) => <button key={n} type="button" className={`wz2-chip ${value.target === n ? "is-on" : ""}`} onClick={() => onChange({ ...value, target: n })}>{n} gifts</button>)}
            </div>
            <span className="wz2-label">Message after catching them all</span>
            <input className="wz2-field" style={{ fontSize: 15 }} value={value.message} maxLength={120}
                placeholder="You caught every bit of birthday love! 🎉"
                onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Catch message" />
        </>
    );
}

export function TreasureEditor({ value, onChange }: { value: BlockConfigMap["treasure"]; onChange: (v: BlockConfigMap["treasure"]) => void }) {
    const list = value.clues.length ? value.clues : [{ riddle: "", answer: "" }];
    const setAt = (i: number, patch: Partial<{ riddle: string; answer: string }>) =>
        onChange({ ...value, clues: list.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
    return (
        <>
            <span className="wz2-label">Treasure hunt clues (1–4)</span>
            <div style={{ display: "grid", gap: 10 }}>
                {list.map((c, i) => (
                    <div key={i} className="bw-card" style={{ padding: 12, display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ fontSize: 13, color: "var(--p-pink)" }}>Clue #{i + 1}</b>
                            {list.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange({ ...value, clues: list.filter((_, j) => j !== i) })}>Remove</button>}
                        </div>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "10px 12px" }} value={c.riddle} maxLength={130}
                            placeholder="e.g. Where did we hang out the most?" onChange={(e) => setAt(i, { riddle: e.target.value })} aria-label={`Clue ${i + 1} riddle`} />
                        <input className="wz2-field" style={{ fontSize: 14, padding: "9px 12px" }} value={c.answer} maxLength={50}
                            placeholder="Short answer (e.g. canteen)" onChange={(e) => setAt(i, { answer: e.target.value })} aria-label={`Clue ${i + 1} answer`} />
                    </div>
                ))}
            </div>
            {list.length < 4 && (
                <div className="wz2-chips" style={{ marginTop: 8 }}>
                    <button type="button" className="wz2-chip" onClick={() => onChange({ ...value, clues: [...list, { riddle: "", answer: "" }] })}>＋ Add clue ({list.length}/4)</button>
                </div>
            )}
            <span className="wz2-label">Treasure chest message</span>
            <input className="wz2-field" style={{ fontSize: 15 }} value={value.reward} maxLength={140}
                placeholder="You unlocked the real treasure: endless love ❤️"
                onChange={(e) => onChange({ ...value, reward: e.target.value })} aria-label="Treasure reward" />
        </>
    );
}

export function NewspaperEditor({ value, onChange, name }: { value: BlockConfigMap["newspaper"]; onChange: (v: BlockConfigMap["newspaper"]) => void; name: string }) {
    const who = (name || "Priya").toUpperCase();
    return (
        <>
            <span className="wz2-label">Front-page headline (you can use {"{name}"})</span>
            <input className="wz2-field" style={{ fontSize: 15 }} value={value.headline} maxLength={90}
                placeholder={`BREAKING: ${who} OFFICIALLY LEVELS UP!`}
                onChange={(e) => onChange({ ...value, headline: e.target.value })} aria-label="Newspaper headline" />
            <span className="wz2-label">Sub-headline</span>
            <input className="wz2-field" style={{ fontSize: 14 }} value={value.subhead} maxLength={120}
                placeholder="Experts confirm good vibes have hit a record high"
                onChange={(e) => onChange({ ...value, subhead: e.target.value })} aria-label="Newspaper subhead" />
            <span className="wz2-label">Short front-page story</span>
            <textarea className="wz2-field" rows={2} style={{ fontSize: 14 }} value={value.story} maxLength={260}
                placeholder="Witnesses report cake supplies are running dangerously low…"
                onChange={(e) => onChange({ ...value, story: e.target.value })} aria-label="Newspaper story" />
        </>
    );
}

/** Unified dispatcher used by both Wizard 2.0 and the standalone 30-second GameMaker. */
export function GameConfigEditor({ game, value, onChange, name = "", age }: {
    game: GameType;
    value: BlockConfigMap[GameType];
    onChange: (v: BlockConfigMap[GameType]) => void;
    name?: string;
    age?: string;
}) {
    switch (game) {
        case "heartbeat": return <HeartbeatEditor value={value as BlockConfigMap["heartbeat"]} onChange={onChange} />;
        case "lanterns": return <LanternsEditor value={value as BlockConfigMap["lanterns"]} onChange={onChange} />;
        case "balloons": return <BalloonsEditor value={value as BlockConfigMap["balloons"]} onChange={onChange} />;
        case "memoryMatch": return <MemoryMatchEditor value={value as BlockConfigMap["memoryMatch"]} onChange={onChange} />;
        case "guessYear": return <GuessYearEditor value={value as BlockConfigMap["guessYear"]} onChange={onChange} />;
        case "candles": return <CandlesEditor value={value as BlockConfigMap["candles"]} onChange={onChange} age={age} />;
        case "prank": return <><span className="wz2-label">Which prank?</span><PrankEditor value={value as BlockConfigMap["prank"]} onChange={onChange} /></>;
        case "trivia": return <TriviaEditor value={value as BlockConfigMap["trivia"]} onChange={onChange} name={name} />;
        case "wheel": return <WheelEditor value={value as BlockConfigMap["wheel"]} onChange={onChange} />;
        case "catchGifts": return <CatchGiftsEditor value={value as BlockConfigMap["catchGifts"]} onChange={onChange} />;
        case "treasure": return <TreasureEditor value={value as BlockConfigMap["treasure"]} onChange={onChange} />;
        case "newspaper": return <NewspaperEditor value={value as BlockConfigMap["newspaper"]} onChange={onChange} name={name} />;
    }
}

export const gameLabel = (t: GameType) => BLOCKS[t].label;
