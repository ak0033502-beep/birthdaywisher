"use client";

import { BLOCKS, type GameType } from "@/blocks/registry";
import type { BlockConfigMap, GamePlacement, TriviaQuestion } from "@/lib/wish/schema";

/** The games library shown in the wizard (and on the /birthday-wishes-game hub). */
export const GAME_LIBRARY: Array<{ type: GameType; e: string; t: string; d: string; bg: string; slug: string }> = [
    { type: "candles", e: "🕯️", t: "Blow the Candles", d: "They blow into the mic (or tap) to blow out the candles", bg: "linear-gradient(135deg,#FFE3EC,#FFD6A5)", slug: "blow-the-candles" },
    { type: "prank", e: "😂", t: "Prank Link", d: "A fake error or prediction, then the real surprise", bg: "linear-gradient(135deg,#FFF1C9,#DDF8F1)", slug: "birthday-prank-link" },
    { type: "trivia", e: "🏅", t: "Quiz + Leaderboard", d: "Multiple-choice quiz with a live friends leaderboard", bg: "linear-gradient(135deg,#E5DEFF,#C9F2FF)", slug: "birthday-quiz" },
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

export function CandlesEditor({ value, onChange, age }: { value: BlockConfigMap["candles"]; onChange: (v: BlockConfigMap["candles"]) => void; age?: string }) {
    return (
        <>
            <span className="wz2-label">Number of candles (max 12 on screen)</span>
            <div className="wz2-chips">
                {[1, 3, 5, 8, 10, 12].map((n) => <button key={n} type="button" className={`wz2-chip ${value.candles === n ? "is-on" : ""}`} onClick={() => onChange({ ...value, candles: n })}>{n}</button>)}
                {age && Number(age) > 0 && <button type="button" className="wz2-chip" onClick={() => onChange({ ...value, candles: Math.min(12, Number(age)) })}>Match age ({age})</button>}
            </div>
            <span className="wz2-label">Message after the candles are out</span>
            <input className="wz2-field" style={{ fontSize: 16 }} value={value.message} maxLength={120} placeholder="Make a wish! 🎂" onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Message after the candles" />
        </>
    );
}

export function PrankEditor({ value, onChange }: { value: BlockConfigMap["prank"]; onChange: (v: BlockConfigMap["prank"]) => void }) {
    const kinds: Array<{ id: BlockConfigMap["prank"]["kind"]; e: string; t: string; d: string }> = [
        { id: "error", e: "⚠️", t: "Fake error", d: "\"This wish has expired\"" },
        { id: "prediction", e: "🔮", t: "Funny prediction", d: "\"Calculating your future…\"" },
        { id: "loading", e: "⏳", t: "Endless loading", d: "\"Wrapping your gift… 99%\"" },
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

export function TriviaEditor({ value, onChange, name }: { value: BlockConfigMap["trivia"]; onChange: (v: BlockConfigMap["trivia"]) => void; name: string }) {
    const qs = value.questions.length ? value.questions : [{ q: "", options: ["", "", ""], correct: 0 }];
    const setQ = (i: number, q: TriviaQuestion) => onChange({ ...value, questions: qs.map((x, j) => (j === i ? q : x)) });
    return (
        <>
            <span className="wz2-label">Title</span>
            <input className="wz2-field" style={{ fontSize: 16 }} value={value.title} maxLength={80} placeholder={`How well do you know ${name || "them"}?`} onChange={(e) => onChange({ ...value, title: e.target.value })} aria-label="Quiz title" />
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {qs.map((x, i) => (
                    <div key={i} className="bw-card" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ fontSize: 13, color: "var(--p-pink)" }}>Question {i + 1}</b>
                            {qs.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange({ ...value, questions: qs.filter((_, j) => j !== i) })}>Remove</button>}
                        </div>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "11px 13px", marginTop: 6 }} value={x.q} maxLength={120} placeholder="e.g. What's my favourite food?" aria-label={`Trivia question ${i + 1}`} onChange={(e) => setQ(i, { ...x, q: e.target.value })} />
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
            <label className="wz2-row" style={{ marginTop: 10 }}>
                <span>🏆 Show a live leaderboard (friends can play the same link and compare scores)</span>
                <input type="checkbox" checked={value.leaderboard} onChange={(e) => onChange({ ...value, leaderboard: e.target.checked })} />
            </label>
            <p className="wz2-sub" style={{ fontSize: 13, marginTop: 4 }}>Tap the circle to mark the correct answer. Only first names are shown on the leaderboard.</p>
        </>
    );
}

export const gameLabel = (t: GameType) => BLOCKS[t].label;
