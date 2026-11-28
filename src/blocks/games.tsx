"use client";

/**
 * Interactive birthday & anniversary mini-games (v2 viewer).
 * Every game works without mic/camera (tap fallback), gates auto-skip after 60 s,
 * and nothing ever blocks the wish. Leaderboard removed so every wish stays personal & private.
 */
import "./games.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockConfigMap } from "@/lib/wish/schema";
import { LockTimer } from "@/components/story/LockTimer";
import { track } from "@/lib/track";
import { playUi } from "@/lib/celebration/uiSound";
import { buzz } from "@/lib/celebration/sfx";
import type { SlideCtx } from "./slides";

export type GameSlideProps<K extends keyof BlockConfigMap> = { config: BlockConfigMap[K]; ctx: SlideCtx; blockId: string };

/* ======================= 🕯️ Blow the Candles (Upgraded) ======================= */
export function CandlesSlide({ config, ctx, blockId }: GameSlideProps<"candles">) {
    const total = Math.max(1, Math.min(12, Math.round(config.candles) || 5));
    const [lit, setLit] = useState<boolean[]>(() => Array(total).fill(true));
    const [mic, setMic] = useState<"off" | "asking" | "on" | "denied">("off");
    const [breath, setBreath] = useState(0);
    const stopRef = useRef<() => void>(() => {});
    const firedRef = useRef(false);
    const autoRef = useRef(false);
    const isActive = ctx.active !== false;

    const left = lit.filter(Boolean).length;
    const done = ctx.unlocked || left === 0;

    useEffect(() => {
        if (!isActive) stopRef.current();
    }, [isActive]);

    useEffect(() => {
        if (left === 0 && !firedRef.current) {
            firedRef.current = true;
            if (ctx.wishId) track("game_candles", { method: autoRef.current ? "auto" : mic === "on" ? "mic" : "tap", mic }, ctx.wishId);
            stopRef.current();
            playUi("chime", { gain: 0.7 });
            buzz([50, 40, 80]);
            ctx.celebrate(190);
            ctx.unlock();
        }
    }, [left, ctx, mic]);
    useEffect(() => () => stopRef.current(), []);

    const blowAt = useCallback((idx?: number) => {
        playUi("whoosh", { gain: 0.45, rate: 1.15 });
        buzz(22);
        setLit((l) => {
            const target = typeof idx === "number" ? idx : l.lastIndexOf(true);
            if (target < 0 || !l[target]) return l;
            const next = [...l];
            next[target] = false;
            return next;
        });
    }, []);

    const startMic = async () => {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setMic("denied");
            return;
        }
        setMic("asking");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
            const W = window as Window & { webkitAudioContext?: typeof AudioContext };
            const Ctor = window.AudioContext || W.webkitAudioContext;
            if (!Ctor) {
                stream.getTracks().forEach((t) => t.stop());
                setMic("denied");
                return;
            }
            const ac = new Ctor();
            if (ac.state === "suspended") await ac.resume().catch(() => {});
            const an = ac.createAnalyser();
            an.fftSize = 512;
            const src = ac.createMediaStreamSource(stream);
            src.connect(an);
            const buf = new Uint8Array(an.fftSize);
            let raf = 0, loud = 0, cooldown = 0, uiTick = 0, stopped = false;
            const stop = () => {
                if (stopped) return;
                stopped = true;
                cancelAnimationFrame(raf);
                try { src.disconnect(); } catch { /* already disconnected */ }
                try { stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
                ac.close().catch(() => {});
                setMic("off");
                setBreath(0);
            };
            const tick = () => {
                if (stopped) return;
                try {
                    an.getByteTimeDomainData(buf);
                    let sum = 0;
                    for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
                    const rms = Math.sqrt(sum / buf.length);
                    if (++uiTick % 3 === 0) setBreath(Math.min(100, Math.round((rms / 0.22) * 100)));
                    loud = rms > 0.16 ? loud + 1 : Math.max(0, loud - 1);
                    if (cooldown > 0) cooldown--;
                    if (loud > 5 && cooldown === 0) { blowAt(); cooldown = 11; loud = 0; }
                    if (!stopped) raf = requestAnimationFrame(tick);
                } catch {
                    stop();
                }
            };
            stopRef.current = stop;
            tick();
            setMic("on");
        } catch {
            setMic("denied");
        }
    };

    const shown = done ? Array(total).fill(false) : lit;
    const age = ctx.wish.recipient.age?.trim();
    return (
        <>
            <span className="gm-badge">{done ? "🎂 Wish Locked In!" : `🕯️ ${left} of ${total} candles glowing`}</span>
            <h2>{done ? "🎉 May every wish come true!" : "Close your eyes & blow the candles"}</h2>
            <svg viewBox="0 0 260 210" width="272" height="218" role="img" aria-label={`${left} candles still lit`} style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}>
                <defs>
                    <radialGradient id="gm-c-glow"><stop offset="0" stopColor="#ffd166" stopOpacity=".85" /><stop offset="1" stopColor="#ffd166" stopOpacity="0" /></radialGradient>
                    <linearGradient id="gm-c-top" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff8fb8" /><stop offset="1" stopColor="#ff5c8a" /></linearGradient>
                    <linearGradient id="gm-c-mid" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff3e6" /><stop offset="1" stopColor="#ffd8be" /></linearGradient>
                    <linearGradient id="gm-c-bot" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#7c5cff" /></linearGradient>
                </defs>
                <ellipse cx="130" cy="198" rx="118" ry="9" fill="rgba(255,255,255,.2)" />
                <rect x="24" y="142" width="212" height="54" rx="14" fill="url(#gm-c-bot)" />
                <path d="M24 155 q 15 13 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 32 0" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".9" />
                <rect x="46" y="96" width="168" height="50" rx="13" fill="url(#gm-c-mid)" />
                <path d="M46 108 q 14 12 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0" fill="none" stroke="#ff5c8a" strokeWidth="6" strokeLinecap="round" />
                <rect x="68" y="62" width="124" height="38" rx="11" fill="url(#gm-c-top)" />
                {age && <text x="130" y="177" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff8e7" fontFamily="system-ui, sans-serif">{age}</text>}
                {shown.map((on, i) => {
                    const x = total === 1 ? 130 : 48 + i * (164 / (total - 1));
                    return (
                        <g key={i} onClick={() => !done && blowAt(i)} style={{ cursor: done ? "default" : "pointer" }}>
                            <rect x={x - 4} y="28" width="8" height="36" rx="3" fill={["#7C5CFF", "#2ED8B6", "#FFD93D", "#FF5C8A", "#38BDF8"][i % 5]} />
                            {on ? (
                                <g className="bv-flame" style={{ transformOrigin: `${x}px 24px` }}>
                                    <circle cx={x} cy="14" r="15" fill="url(#gm-c-glow)" className="gm-cake-halo" />
                                    <path d={`M${x} 1 C ${x - 8} 15, ${x - 6} 23, ${x} 26 C ${x + 6} 23, ${x + 8} 15, ${x} 1 Z`} fill="#FF9F43" />
                                    <path d={`M${x} 10 C ${x - 3.5} 17, ${x - 3} 22, ${x} 24 C ${x + 3} 22, ${x + 3.5} 17, ${x} 10 Z`} fill="#FFF3B0" />
                                </g>
                            ) : (
                                <path d={`M${x} 26 q 6 -10 0 -18 q -6 -8 2 -16`} stroke="#cbd5e1" strokeWidth="2.4" fill="none" opacity=".7" className="bv-smoke" />
                            )}
                        </g>
                    );
                })}
            </svg>
            {done ? (
                <div className="bv-card"><p className="bv-big">{config.message || "Make a wish! 🎂"}</p></div>
            ) : (
                <div style={{ display: "grid", gap: 9, justifyItems: "center" }}>
                    {mic === "on" ? (
                        <>
                            <p className="bv-muted" style={{ fontWeight: 800 }}>🌬️ Blow into your phone mic!</p>
                            <div className="gm-breath" aria-label="Breath strength"><i style={{ width: `${breath}%` }} /></div>
                        </>
                    ) : (
                        <button type="button" className="bv-btn" onClick={startMic} disabled={mic === "asking"}>🎤 Blow with your mic</button>
                    )}
                    <button type="button" className="bv-make" style={{ margin: 0 }} onClick={() => blowAt()}>
                        {mic === "denied" ? "Mic blocked: tap here or tap each candle 👆" : "👆 Or tap a candle (or tap here) to blow"}
                    </button>
                    <LockTimer active={isActive} timerKey={blockId} durationSeconds={60} label="Auto-blow in" onAutoUnlock={() => { autoRef.current = true; setLit(Array(total).fill(false)); }} />
                </div>
            )}
        </>
    );
}

/* ======================= 😂 Prank Link (Upgraded) ======================= */
const PREDICTIONS = [
    "This year you will finally reply to messages on time. (Update: 0.2% chance 😂)",
    "You will eat cake for breakfast at least 4 times and regret zero of them 🍰",
    "Someone very cute made this surprise for you — and expects a party treat!",
    "You will become 10% wiser, 90% funnier, and 200% more dramatic 🎭",
    "Your phone battery will survive a whole day. Exactly once.",
];
const LOADING = ["Wrapping your gift…", "Bribing the delivery guy…", "Eating a test slice of your cake…", "Adding extra ribbon…", "Stuck at 99%… tap to push!"];

export function PrankSlide({ config, ctx, blockId }: GameSlideProps<"prank">) {
    const name = ctx.wish.recipient.nickname || ctx.wish.recipient.name || "you";
    const [phase, setPhase] = useState<"prank" | "reveal">("prank");
    const [pct, setPct] = useState(12);
    const [line, setLine] = useState(0);
    const pickIdx = [...(blockId || name)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % PREDICTIONS.length;
    const prediction = PREDICTIONS[pickIdx];

    const reveal = useCallback(() => {
        setPhase((p) => {
            if (p === "reveal") return p;
            playUi("rip", { gain: 0.55 });
            buzz([40, 50, 70]);
            ctx.celebrate(140);
            return "reveal";
        });
    }, [ctx]);

    const isActive = ctx.active !== false;

    useEffect(() => {
        if (!isActive || phase !== "prank" || config.kind === "error") return;
        const iv = setInterval(() => {
            setPct((p) => Math.min(config.kind === "loading" ? 99 : 100, p + (config.kind === "loading" ? 11 : 9)));
            setLine((l) => l + 1);
        }, 460);
        return () => clearInterval(iv);
    }, [isActive, phase, config.kind]);

    useEffect(() => {
        if (!isActive || phase !== "prank") return;
        const t = setTimeout(reveal, config.kind === "error" ? 5600 : 6200);
        return () => clearTimeout(t);
    }, [isActive, phase, config.kind, reveal]);

    if (phase === "reveal") {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">😂</div>
                <h1>Gotcha, <span className="bv-grad">{name}!</span></h1>
                {config.kind === "prediction"
                    ? <div className="bv-card"><p className="bv-quote">🔮 {prediction}</p></div>
                    : <div className="bv-card"><p className="bv-big">Did you really think your surprise broke?! Never ❤️</p></div>}
                <p className="bv-muted" style={{ fontSize: 17 }}>Your real celebration continues — tap › 🎁</p>
            </>
        );
    }

    if (config.kind === "error") {
        return (
            <div style={{ background: "#fff", color: "#202124", borderRadius: 20, padding: "24px 20px", maxWidth: 360, width: "100%", textAlign: "left", fontFamily: "system-ui, sans-serif", boxShadow: "0 20px 50px rgba(0,0,0,.32)", borderTop: "5px solid #ef4444" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 36 }} aria-hidden="true">⚠️</span>
                    <code style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>HTTP 410 · GONE</code>
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, margin: "12px 0 6px" }}>This surprise link has expired</p>
                <p style={{ color: "#5f6368", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                    ERR_TOO_MUCH_CAKE. Either {name} opened it too late, or the sender ate the gift themselves.
                </p>
                <button type="button" onClick={reveal} style={{ marginTop: 18, width: "100%", background: "#1a73e8", color: "#fff", border: 0, borderRadius: 10, padding: "11px 18px", fontWeight: 700, cursor: "pointer" }}>
                    🔄 Try Emergency Recovery
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="bv-emoji" aria-hidden="true">{config.kind === "prediction" ? "🔮" : "🎁"}</div>
            <h2>{config.kind === "prediction" ? `Reading ${name}'s future…` : "Unwrapping your mega gift…"}</h2>
            <div className="bv-meter" style={{ maxWidth: 320 }}><i style={{ width: `${pct}%`, transition: "width .4s" }} /></div>
            <p className="bv-muted" style={{ fontWeight: 800 }}>
                {config.kind === "prediction"
                    ? ["Scanning late-night cravings…", "Counting dramatic moments…", "Checking bestie loyalty level…", "Locking prophecy…"][Math.min(3, Math.floor(line / 3))]
                    : LOADING[Math.min(LOADING.length - 1, Math.floor(line / 2))]} ({pct}%)
            </p>
            <button type="button" className="bv-make" onClick={reveal}>👆 Tap to hurry up</button>
        </>
    );
}

/* ======================= 🎯 Birthday Quiz (Personal, Leaderboard Removed) ======================= */
export function TriviaSlide({ config, ctx, blockId }: GameSlideProps<"trivia">) {
    const questions = config.questions.filter((q) => q.q.trim() && q.options.filter((o) => o.trim()).length >= 2);
    const [stage, setStage] = useState<"play" | "done">(ctx.unlocked ? "done" : "play");
    const [n, setN] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const q = questions[Math.min(n, Math.max(0, questions.length - 1))];

    const finish = (final: number) => {
        setStage("done");
        playUi("chime", { gain: 0.65 });
        ctx.celebrate(final === questions.length ? 220 : 100);
        ctx.unlock();
    };

    const answer = (i: number) => {
        if (picked !== null || !q) return;
        setPicked(i);
        const right = i === q.correct;
        const newScore = score + (right ? 1 : 0);
        if (right) {
            setScore(newScore);
            playUi("chime", { gain: 0.5, rate: 1.15 });
            buzz(25);
            ctx.celebrate(45);
        } else {
            playUi("ping", { gain: 0.35, rate: 0.8 });
            buzz([30, 40, 30]);
        }
        setTimeout(() => {
            setPicked(null);
            if (n + 1 < questions.length) setN(n + 1);
            else finish(newScore);
        }, 1050);
    };

    if (!questions.length) return <p className="bv-muted">No questions added.</p>;

    if (stage === "done") {
        const pct = score / questions.length;
        const badge = ctx.unlocked && score === 0
            ? "Quiz unlocked ❤️"
            : pct === 1
                ? "100% Bond · Know Each Other By Heart ❤️"
                : pct >= 0.6
                    ? "Super Close · Certified Favourite Human 🥰"
                    : "Still My Favourite Human 😂❤️";
        return (
            <>
                <div className="bv-trophy" aria-hidden="true">🎯</div>
                {ctx.unlocked && score === 0
                    ? <h2>{config.title || "Birthday Quiz"}</h2>
                    : <h2>Score: {score} / {questions.length}</h2>}
                <span className="gm-badge">{badge}</span>
                <button type="button" className="bv-make" onClick={() => { setScore(0); setN(0); setPicked(null); setStage("play"); }}>↻ Play quiz again</button>
            </>
        );
    }

    return (
        <>
            <div className="gm-pill-row" aria-hidden="true">
                {questions.map((_, idx) => <span key={idx} className={`gm-dot ${idx < n ? "is-done" : idx === n ? "is-now" : ""}`} />)}
            </div>
            <p className="bv-muted" style={{ fontWeight: 800, fontSize: 13 }}>{config.title || "Birthday Quiz"} · {n + 1} of {questions.length}</p>
            <h2>{q.q}</h2>
            <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 380 }}>
                {q.options.map((o, i) => {
                    if (!o.trim()) return null;
                    const cls = picked === null ? "" : i === q.correct ? "is-right" : i === picked ? "is-wrong" : "";
                    return (
                        <button key={i} type="button" className={`gm-opt ${cls}`} disabled={picked !== null} onClick={() => answer(i)}>
                            <span className="gm-opt-key">{picked !== null && i === q.correct ? "✓" : String.fromCharCode(65 + i)}</span>
                            <span>{o}</span>
                        </button>
                    );
                })}
            </div>
            <LockTimer key={n} active={ctx.active !== false} timerKey={ctx.unlocked ? undefined : `${blockId}:${n}`} durationSeconds={60} label="Auto-next in" onAutoUnlock={() => answer(q.correct)} />
        </>
    );
}

/* ======================= 🫶 Hold My Hand — Heartbeat Sync (Emotional) ======================= */
export function HeartbeatSlide({ config, ctx, blockId }: GameSlideProps<"heartbeat">) {
    const name = ctx.wish.recipient.nickname || ctx.wish.recipient.name || "you";
    const [pct, setPct] = useState(ctx.unlocked ? 100 : 0);
    const [holding, setHolding] = useState(false);
    const [synced, setSynced] = useState(ctx.unlocked);
    const syncedRef = useRef(ctx.unlocked);
    const beatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const rafRef = useRef<number>(0);
    const isActive = ctx.active !== false;
    const activeHolding = isActive && holding;

    const complete = useCallback(() => {
        if (syncedRef.current) return;
        syncedRef.current = true;
        setSynced(true);
        setHolding(false);
        playUi("chime", { gain: 0.7 });
        buzz([60, 80, 110]);
        ctx.celebrate(180);
        ctx.unlock();
    }, [ctx]);

    useEffect(() => {
        if (!activeHolding || synced) return;
        const pulse = () => {
            playUi("ping", { gain: 0.35, rate: 0.52 });
            setTimeout(() => playUi("ping", { gain: 0.25, rate: 0.64 }), 170);
            buzz([38, 110, 26]);
        };
        pulse();
        beatTimer.current = setInterval(pulse, 820);

        let last = performance.now();
        const step = (now: number) => {
            const dt = now - last;
            last = now;
            setPct((p) => {
                const next = Math.min(100, p + dt / 28); // ~2.8s of holding together
                if (next >= 100) setTimeout(complete, 40);
                return next;
            });
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (beatTimer.current) clearInterval(beatTimer.current);
            cancelAnimationFrame(rafRef.current);
        };
    }, [activeHolding, synced, complete]);

    const done = synced || ctx.unlocked;
    const progress = done ? 100 : Math.round(pct);

    if (done) {
        return (
            <div className="gm-hb-wrap">
                <div className="bv-emoji" aria-hidden="true">🫶</div>
                <span className="gm-badge">❤️ 2 Hearts Synced · 0 km apart right now</span>
                <h2>Right here with you, {name}</h2>
                <div className="bv-card"><p className="bv-quote">&ldquo;{config.message}&rdquo;</p></div>
            </div>
        );
    }

    return (
        <div className="gm-hb-wrap">
            <span className="gm-badge">🫶 Touch Across Distance</span>
            <h2>Place your thumb &amp; hold my hand</h2>
            <p className="bv-muted" style={{ fontSize: 14, maxWidth: 300 }}>Hold the heart below for 3 seconds so our heartbeats sync together ❤️</p>

            <div className="gm-thread" aria-hidden="true">
                <div className="gm-thread-line"><i style={{ width: `${progress}%` }} /></div>
                <span className="gm-thread-h" style={{ left: `${8 + progress * 0.42}%` }}>💗</span>
                <span className="gm-thread-h" style={{ left: `${92 - progress * 0.42}%` }}>❤️</span>
            </div>

            <button
                type="button"
                className={`gm-pad ${holding ? "is-holding" : ""}`}
                onPointerDown={() => setHolding(true)}
                onPointerUp={() => setHolding(false)}
                onPointerLeave={() => setHolding(false)}
                onPointerCancel={() => setHolding(false)}
                aria-label="Hold to sync heartbeats"
            >
                <svg width="152" height="152" viewBox="0 0 152 152" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden="true">
                    <circle cx="76" cy="76" r="68" fill="none" stroke="rgba(255,92,138,.2)" strokeWidth="5" />
                    <circle cx="76" cy="76" r="68" fill="none" stroke="#ff5c8a" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 68} strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)} />
                </svg>
                <span className="gm-pad-core" aria-hidden="true">{holding ? "💓" : "🫶"}</span>
            </button>

            <p className="bv-muted" style={{ fontWeight: 800, fontSize: 13 }}>
                {holding ? `Syncing heartbeats… ${progress}%` : "Press & hold with your thumb"}
            </p>
            <button type="button" className="bv-make" style={{ margin: 0 }} onClick={() => { setPct(100); complete(); }}>👆 Or tap once to connect</button>
            <LockTimer active={isActive} timerKey={blockId} durationSeconds={60} label="Auto-sync in" onAutoUnlock={() => { setPct(100); complete(); }} />
        </div>
    );
}

/* ======================= 🏮 Sky Lanterns of Wishes (Emotional) ======================= */
export function LanternsSlide({ config, ctx, blockId }: GameSlideProps<"lanterns">) {
    const wishes = config.wishes.map((w) => w.trim()).filter(Boolean);
    const list = wishes.length ? wishes : ["May all your heartfelt wishes come true this year ❤️"];
    const [released, setReleased] = useState(ctx.unlocked ? list.length : 0);
    const [flying, setFlying] = useState(false);
    const [ownWish, setOwnWish] = useState("");
    const [allDone, setAllDone] = useState(ctx.unlocked);

    const releaseNext = () => {
        if (flying) return;
        setFlying(true);
        playUi("chime", { gain: 0.55, rate: 0.92 + released * 0.08 });
        buzz(28);
        setTimeout(() => {
            setFlying(false);
            setReleased((r) => r + 1);
        }, 460);
    };

    const finishOwn = () => {
        playUi("chime", { gain: 0.72, rate: 1.12 });
        buzz([40, 50, 80]);
        setAllDone(true);
        ctx.celebrate(160);
        ctx.unlock();
    };

    const done = allDone || ctx.unlocked;

    return (
        <>
            <span className="gm-badge">🏮 {done ? "All Lanterns Glowing in the Sky" : `Lantern ${Math.min(released + 1, list.length + 1)} of ${list.length + 1}`}</span>
            <h2>{done ? "May the sky carry every blessing ❤️" : released < list.length ? "Tap the lantern to light & release it" : "Now release one secret wish of your own"}</h2>

            <div className="gm-sky">
                <div className="gm-sky-floats" aria-hidden="true">
                    {Array.from({ length: done ? list.length + 2 : released }, (_, k) => (
                        <span key={k} className="gm-sky-mini" style={{ left: `${14 + ((k * 27) % 72)}%`, top: `${10 + ((k * 19) % 34)}%`, animationDelay: `${k * 0.6}s` }}>🏮</span>
                    ))}
                </div>

                {!done && released > 0 && (
                    <div className="gm-scroll-note" key={released}>
                        💌 &ldquo;{list[Math.min(released - 1, list.length - 1)]}&rdquo;
                    </div>
                )}

                {!done && released < list.length && (
                    <button type="button" className={`gm-lantern-btn ${flying ? "is-flying" : ""}`} onClick={releaseNext}>
                        <svg className="gm-lantern-svg" width="84" height="104" viewBox="0 0 84 104" aria-hidden="true">
                            <defs>
                                <linearGradient id="gm-lan" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0" stopColor="#ffb347" /><stop offset=".6" stopColor="#ff7b54" /><stop offset="1" stopColor="#ffd166" />
                                </linearGradient>
                            </defs>
                            <path d="M22 18 Q42 4 62 18 L68 70 Q42 82 16 70 Z" fill="url(#gm-lan)" />
                            <ellipse cx="42" cy="70" rx="22" ry="6" fill="#5c2c16" />
                            <circle cx="42" cy="58" r="11" fill="#fff6cc" opacity=".9" />
                            <path d="M42 47 C38 55 39 61 42 63 C45 61 46 55 42 47 Z" fill="#ffedd5" />
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>👆 Tap to release blessing #{released + 1}</span>
                    </button>
                )}

                {!done && released >= list.length && (
                    <div style={{ position: "relative", zIndex: 2, display: "grid", gap: 8, width: "100%", maxWidth: 290 }}>
                        <input
                            className="bv-input"
                            style={{ background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,231,163,.4)", fontSize: 14 }}
                            value={ownWish}
                            maxLength={100}
                            onChange={(e) => setOwnWish(e.target.value)}
                            placeholder="Type or think your wish (private 🤫)"
                            aria-label="Your private wish"
                        />
                        <button type="button" className="bv-btn" onClick={finishOwn}>🏮 Send my wish to the sky</button>
                    </div>
                )}

                {done && (
                    <div style={{ position: "relative", zIndex: 2, display: "grid", gap: 6, marginTop: 8 }}>
                        {list.map((w, idx) => <p key={idx} style={{ margin: 0, fontSize: 13.5, color: "#ffe7a3", fontWeight: 700 }}>🏮 {w}</p>)}
                    </div>
                )}
            </div>

            {!done && <LockTimer active={ctx.active !== false} timerKey={blockId} durationSeconds={60} label="Auto-release in" onAutoUnlock={finishOwn} />}
        </>
    );
}

/* ======================= 🎈 Love-Note Balloons (Balloon Pop) ======================= */
const BALLOON_COLORS = [
    "linear-gradient(145deg,#ff7aa2,#ff4d79)",
    "linear-gradient(145deg,#b497ff,#7c5cff)",
    "linear-gradient(145deg,#5eead4,#14b8a6)",
    "linear-gradient(145deg,#ffd166,#f59e0b)",
    "linear-gradient(145deg,#7dd3fc,#0284c7)",
    "linear-gradient(145deg,#fda4af,#e11d48)",
];

export function BalloonsSlide({ config, ctx, blockId }: GameSlideProps<"balloons">) {
    const notes = config.notes.map((s) => s.trim()).filter(Boolean);
    const items = notes.length ? notes : ["You make life brighter every single day ❤️", "Happy Birthday, favourite human! 🎂"];
    const [popped, setPopped] = useState<number[]>(() => (ctx.unlocked ? items.map((_, i) => i) : []));
    const done = ctx.unlocked || popped.length >= items.length;

    const popBalloon = (idx: number) => {
        if (popped.includes(idx)) return;
        const next = [...popped, idx];
        setPopped(next);
        playUi("ping", { gain: 0.55, rate: 1.18 + (idx % 4) * 0.08 });
        buzz(24);
        if (next.length >= items.length) {
            setTimeout(() => { playUi("chime", { gain: 0.7 }); ctx.celebrate(180); ctx.unlock(); }, 260);
        } else {
            ctx.celebrate(35);
        }
    };

    const lastNote = popped.length ? items[popped[popped.length - 1]] : null;

    return (
        <>
            <span className="gm-badge">🎈 {done ? `All ${items.length} Notes Opened!` : `${popped.length} / ${items.length} popped`}</span>
            <h2>{done ? "Every balloon held a piece of love ❤️" : "Pop each balloon to read what's inside"}</h2>

            {!done && (
                <div className="gm-balloons">
                    {items.map((_, idx) => {
                        if (popped.includes(idx)) return null;
                        const isLast = items.length - popped.length === 1;
                        return (
                            <button
                                key={idx}
                                type="button"
                                className="gm-balloon"
                                style={{ animationDelay: `${idx * 0.35}s` }}
                                onClick={() => popBalloon(idx)}
                                aria-label={`Pop balloon ${idx + 1}`}
                            >
                                <div className="gm-balloon-body" style={{ background: isLast ? "linear-gradient(145deg,#fde047,#f59e0b)" : BALLOON_COLORS[idx % BALLOON_COLORS.length] }}>
                                    {isLast ? "❤️" : idx + 1}
                                </div>
                                <div className="gm-balloon-str" />
                            </button>
                        );
                    })}
                </div>
            )}

            {!done && lastNote && (
                <div className="gm-note-slip" key={popped.length} style={{ maxWidth: 340, width: "100%" }}>
                    💌 {lastNote}
                </div>
            )}

            {done && (
                <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 360 }}>
                    {items.map((note, idx) => (
                        <div key={idx} className="gm-note-slip"><b>#{idx + 1}</b> · {note}</div>
                    ))}
                </div>
            )}

            {!done && (
                <LockTimer active={ctx.active !== false} timerKey={blockId} durationSeconds={60} label="Pop all in" onAutoUnlock={() => { setPopped(items.map((_, i) => i)); ctx.celebrate(140); ctx.unlock(); }} />
            )}
        </>
    );
}
