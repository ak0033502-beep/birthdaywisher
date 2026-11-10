"use client";

/**
 * Mini-game slides (Phase 5) for the v2 viewer.
 * Every game follows the same safety rules: works without mic/camera (tap fallback),
 * gates auto-skip after 60 s, nothing can block the wish.
 */
import { useEffect, useRef, useState } from "react";
import type { BlockConfigMap } from "@/lib/wish/schema";
import { LockTimer } from "@/components/story/LockTimer";
import type { SlideCtx } from "./slides";

type P<K extends "candles" | "prank" | "trivia"> = { config: BlockConfigMap[K]; ctx: SlideCtx; blockId: string };

/* ======================= 🕯️ Blow the Candles ======================= */
export function CandlesSlide({ config, ctx }: P<"candles">) {
    const total = Math.max(1, Math.min(12, Math.round(config.candles) || 1));
    const [lit, setLit] = useState<boolean[]>(() => Array(total).fill(true));
    const [mic, setMic] = useState<"off" | "asking" | "on" | "denied">("off");
    const [done, setDone] = useState(ctx.unlocked);
    const stopRef = useRef<() => void>(() => {});

    const left = lit.filter(Boolean).length;
    useEffect(() => {
        if (!done && left === 0) {
            setDone(true);
            stopRef.current();
            ctx.celebrate(180);
            ctx.unlock();
        }
    }, [left, done, ctx]);
    useEffect(() => () => stopRef.current(), []);

    const blowOne = () => setLit((l) => { const i = l.lastIndexOf(true); if (i < 0) return l; const n = [...l]; n[i] = false; return n; });

    const startMic = async () => {
        setMic("asking");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
            const W = window as Window & { webkitAudioContext?: typeof AudioContext };
            const ac = new (window.AudioContext || W.webkitAudioContext!)();
            const an = ac.createAnalyser();
            an.fftSize = 512;
            ac.createMediaStreamSource(stream).connect(an);
            const buf = new Uint8Array(an.fftSize);
            let raf = 0, loud = 0, cooldown = 0;
            const tick = () => {
                an.getByteTimeDomainData(buf);
                let sum = 0;
                for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
                const rms = Math.sqrt(sum / buf.length);
                // a blow is loud, broadband and sustained for a few frames
                loud = rms > 0.18 ? loud + 1 : Math.max(0, loud - 1);
                if (cooldown > 0) cooldown--;
                if (loud > 6 && cooldown === 0) { blowOne(); cooldown = 12; loud = 0; }
                raf = requestAnimationFrame(tick);
            };
            tick();
            stopRef.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); ac.close().catch(() => {}); };
            setMic("on");
        } catch {
            setMic("denied");
        }
    };

    const shown = done ? Array(total).fill(false) : lit;
    return (
        <>
            <h2>{done ? "🎉 Wish made!" : "Blow out the candles! 🕯️"}</h2>
            <svg viewBox="0 0 240 190" width="260" height="206" role="img" aria-label={`${left} candles still lit`} style={{ overflow: "visible", maxWidth: "80vw" }}>
                {shown.map((on, i) => {
                    const x = total === 1 ? 120 : 40 + i * (160 / (total - 1));
                    return (
                        <g key={i} onClick={() => !done && setLit((l) => { const n = [...l]; n[i] = false; return n; })} style={{ cursor: done ? "default" : "pointer" }}>
                            <rect x={x - 4} y="46" width="8" height="38" rx="3" fill={["#7C5CFF", "#2ED8B6", "#FFD93D", "#FF5C8A"][i % 4]} />
                            {on ? (
                                <g className="bv-flame" style={{ transformOrigin: `${x}px 40px` }}>
                                    <path d={`M${x} 18 C ${x - 9} 33, ${x - 7} 42, ${x} 45 C ${x + 7} 42, ${x + 9} 33, ${x} 18 Z`} fill="#FF9F43" />
                                    <path d={`M${x} 28 C ${x - 4} 36, ${x - 3} 41, ${x} 43 C ${x + 3} 41, ${x + 4} 36, ${x} 28 Z`} fill="#FFD93D" />
                                </g>
                            ) : (
                                <path d={`M${x} 44 q 6 -10 0 -18 q -6 -8 2 -16`} stroke="#9ca3af" strokeWidth="2" fill="none" opacity=".6" className="bv-smoke" />
                            )}
                        </g>
                    );
                })}
                <rect x="20" y="84" width="200" height="46" rx="12" fill="#FF5C8A" />
                <path d="M20 98 q 16.6 14 33.3 0 t 33.3 0 t 33.3 0 t 33.3 0 t 33.3 0 t 33.3 0" fill="none" stroke="#FFF8F0" strokeWidth="7" strokeLinecap="round" />
                <rect x="8" y="128" width="224" height="50" rx="14" fill="#FF9F43" />
                <circle cx="50" cy="152" r="5" fill="#FFD93D" /><circle cx="100" cy="158" r="5" fill="#2ED8B6" /><circle cx="150" cy="150" r="5" fill="#7C5CFF" /><circle cx="196" cy="157" r="5" fill="#FFD93D" />
            </svg>
            {done ? (
                <div className="bv-card"><p className="bv-big">{config.message || "Make a wish! 🎂"}</p></div>
            ) : (
                <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
                    {mic === "on"
                        ? <p className="bv-muted" style={{ fontWeight: 800 }}>🎤 Listening… blow into your phone!</p>
                        : <button type="button" className="bv-btn" onClick={startMic} disabled={mic === "asking"}>🎤 Blow with your mic</button>}
                    <button type="button" className="bv-make" style={{ margin: 0 }} onClick={blowOne}>{mic === "denied" ? "Mic blocked: tap here (or the candles) to blow 👆" : "No mic? Tap here or tap the candles 👆"}</button>
                    <p className="bv-muted" style={{ fontSize: 13 }}>{left} of {total} still lit</p>
                    <LockTimer durationSeconds={60} label="Auto-blow in" onAutoUnlock={() => setLit(Array(total).fill(false))} />
                </div>
            )}
        </>
    );
}

/* ======================= 😂 Prank Link ======================= */
const PREDICTIONS = [
    "This year you will finally reply to messages on time. (Just kidding. Never.)",
    "You will eat cake for breakfast at least 3 times. Doctors hate this.",
    "A mysterious stranger will steal your fries. It will be me.",
    "You will become 10% wiser and 100% more dramatic.",
    "Your phone battery will survive a whole day. Once.",
];
const LOADING = ["Wrapping your gift…", "Still wrapping…", "It's a big gift, okay?", "Adding extra bubble wrap…", "Almost there… 99%"];

export function PrankSlide({ config, ctx }: P<"prank">) {
    const name = ctx.wish.recipient.nickname || ctx.wish.recipient.name || "you";
    const [phase, setPhase] = useState<"prank" | "reveal">("prank");
    const [pct, setPct] = useState(0);
    const [line, setLine] = useState(0);
    const prediction = useRef(PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)]);

    useEffect(() => {
        if (phase !== "prank") return;
        if (config.kind === "error") return; // waits for the "Retry" tap (or 6 s)
        const iv = setInterval(() => {
            setPct((p) => Math.min(config.kind === "loading" ? 99 : 100, p + (config.kind === "loading" ? 9 : 7)));
            setLine((l) => l + 1);
        }, 450);
        return () => clearInterval(iv);
    }, [phase, config.kind]);

    useEffect(() => {
        if (phase !== "prank") return;
        const t = setTimeout(() => { setPhase("reveal"); ctx.celebrate(120); }, config.kind === "error" ? 6000 : 6500);
        return () => clearTimeout(t);
    }, [phase, config.kind, ctx]);

    const reveal = () => { setPhase("reveal"); ctx.celebrate(120); };

    if (phase === "reveal") {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">😂</div>
                <h1>Gotcha, <span className="bv-grad">{name}!</span></h1>
                {config.kind === "prediction" && <div className="bv-card"><p className="bv-quote">🔮 {prediction.current}</p></div>}
                <p className="bv-muted" style={{ fontSize: 18 }}>Relax, your real surprise is right here. Tap › to continue 🎁</p>
            </>
        );
    }

    if (config.kind === "error") {
        return (
            <div style={{ background: "#fff", color: "#202124", borderRadius: 18, padding: "26px 20px", maxWidth: 360, width: "100%", textAlign: "left", fontFamily: "system-ui, sans-serif", boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
                <div style={{ fontSize: 42 }} aria-hidden="true">⚠️</div>
                <p style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 6px" }}>This wish has expired</p>
                <p style={{ color: "#5f6368", fontSize: 14, lineHeight: 1.5 }}>ERR_BIRTHDAY_NOT_FOUND. The sender may have forgotten your birthday. Please try again later.</p>
                <button type="button" onClick={reveal} style={{ marginTop: 18, background: "#1a73e8", color: "#fff", border: 0, borderRadius: 6, padding: "10px 18px", fontWeight: 600 }}>Retry</button>
            </div>
        );
    }

    return (
        <>
            <div className="bv-emoji" aria-hidden="true">{config.kind === "prediction" ? "🔮" : "🎁"}</div>
            <h2>{config.kind === "prediction" ? `Calculating ${name}'s birthday prediction…` : "Loading your gift…"}</h2>
            <div className="bv-meter" style={{ maxWidth: 320 }}><i style={{ width: `${pct}%`, transition: "width .4s" }} /></div>
            <p className="bv-muted" style={{ fontWeight: 800 }}>
                {config.kind === "prediction" ? ["Scanning bad decisions…", "Counting grey hairs…", "Consulting the stars… just kidding, the cake…", "Almost done…"][Math.min(3, Math.floor(line / 4))] : LOADING[Math.min(LOADING.length - 1, Math.floor(line / 3))]} {pct}%
            </p>
        </>
    );
}

/* ======================= 🏅 Quiz + Leaderboard ======================= */
type Row = { player: string; score: number; total: number };

export function TriviaSlide({ config, ctx, blockId }: P<"trivia">) {
    const questions = config.questions.filter((q) => q.q.trim() && q.options.filter((o) => o.trim()).length >= 2);
    const canBoard = config.leaderboard && !!ctx.wishId;
    const [player, setPlayer] = useState("");
    const [stage, setStage] = useState<"name" | "play" | "done">(ctx.unlocked ? "done" : canBoard ? "name" : "play");
    const [n, setN] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [board, setBoard] = useState<Row[] | null>(null);
    const [boardErr, setBoardErr] = useState("");
    const q = questions[Math.min(n, questions.length - 1)];

    const finish = async (final: number) => {
        setStage("done");
        ctx.celebrate(final === questions.length ? 220 : 90);
        ctx.unlock();
        if (!canBoard) return;
        try {
            await fetch("/api/game-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wishId: ctx.wishId, blockId, player: player.trim() || "Anonymous", score: final, total: questions.length }) });
            const r = await fetch(`/api/game-score?wishId=${encodeURIComponent(ctx.wishId!)}&blockId=${encodeURIComponent(blockId)}`);
            const j = await r.json();
            setBoard(Array.isArray(j.leaderboard) ? j.leaderboard : []);
        } catch { setBoardErr("Couldn't load the leaderboard right now."); }
    };

    const answer = (i: number) => {
        if (picked !== null || !q) return;
        setPicked(i);
        const right = i === q.correct;
        const newScore = score + (right ? 1 : 0);
        if (right) { setScore(newScore); ctx.celebrate(40); }
        setTimeout(() => {
            setPicked(null);
            if (n + 1 < questions.length) setN(n + 1);
            else finish(newScore);
        }, 1100);
    };

    if (!questions.length) return <p className="bv-muted">No questions yet.</p>;

    if (stage === "name") {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">🏅</div>
                <h2>{config.title || `How well do you know ${ctx.wish.recipient.name}?`}</h2>
                <p className="bv-muted">{questions.length} questions · your score goes on the leaderboard</p>
                <input className="bv-input" value={player} maxLength={30} placeholder="Your name" aria-label="Your name" onChange={(e) => setPlayer(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && player.trim()) setStage("play"); }} />
                <button type="button" className="bv-btn" disabled={!player.trim()} onClick={() => setStage("play")}>Start ▶</button>
            </>
        );
    }

    if (stage === "done") {
        const pct = score / questions.length;
        const label = ctx.unlocked && score === 0 ? "" : pct === 1 ? "Certified Bestie 🏆" : pct >= 0.6 ? "Pretty close! 😎" : "Hmm… do you even know them? 😂";
        return (
            <>
                <div className="bv-trophy" aria-hidden="true">🏅</div>
                {ctx.unlocked && score === 0 && !board
                    ? <h2>{config.title || "Quiz + Leaderboard"}</h2>
                    : <><h2>You scored {score}/{questions.length}</h2><p className="bv-muted" style={{ fontSize: 18 }}>{label}</p></>}
                {canBoard && (
                    <div className="bv-card" style={{ textAlign: "left" }}>
                        <b>🏆 Leaderboard</b>
                        {boardErr && <p className="bv-muted">{boardErr}</p>}
                        {!board && !boardErr && <p className="bv-muted">Loading…</p>}
                        {board && (
                            <ol style={{ margin: "8px 0 0", paddingLeft: 22, display: "grid", gap: 4 }}>
                                {board.map((r, i) => <li key={i} style={{ fontWeight: r.player === player.trim() ? 800 : 600 }}>{r.player} · {r.score}/{r.total}</li>)}
                            </ol>
                        )}
                    </div>
                )}
                {config.leaderboard && !ctx.wishId && <p className="bv-muted" style={{ fontSize: 13 }}>The live leaderboard appears on the real link.</p>}
            </>
        );
    }

    return (
        <>
            <p className="bv-muted" style={{ fontWeight: 800 }}>Question {n + 1}/{questions.length} · Score {score}</p>
            <h2>{q.q}</h2>
            <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 380 }}>
                {q.options.map((o, i) => o.trim() && (
                    <button key={i} type="button" className="bv-input" onClick={() => answer(i)}
                        style={{ cursor: "pointer", textAlign: "left", borderColor: picked === null ? undefined : i === q.correct ? "#22c55e" : i === picked ? "#f43f5e" : undefined, background: picked !== null && i === q.correct ? "rgba(34,197,94,.18)" : undefined }}>
                        {String.fromCharCode(65 + i)}. {o}
                    </button>
                ))}
            </div>
            <LockTimer key={n} durationSeconds={60} label="Next question in" onAutoUnlock={() => answer(-1)} />
        </>
    );
}
