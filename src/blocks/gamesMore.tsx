"use client";

/**
 * Additional connected & party birthday games (v2 viewer):
 * Memory Match · Guess the Year · Spin the Wheel · Catch the Gifts · Treasure Hunt · Birthday Gazette
 */
import "./games.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LockTimer } from "@/components/story/LockTimer";
import { playUi } from "@/lib/celebration/uiSound";
import { buzz } from "@/lib/celebration/sfx";
import type { GameSlideProps } from "./games";

function seededShuffle<T>(arr: T[], seedText: string): T[] {
    const out = [...arr];
    let h = 2166136261;
    for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
    for (let i = out.length - 1; i > 0; i--) {
        h = Math.imul(h ^ (h >>> 15), 2246822507);
        const j = Math.abs(h) % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/* ======================= 🃏 Memory Match (Uses Wish Photos + Icons) ======================= */
const FALLBACK_ICONS = ["🎂", "🎁", "🎈", "💌", "🧁", "❤️"];

export function MemoryMatchSlide({ config, ctx, blockId }: GameSlideProps<"memoryMatch">) {
    const wishPhotos = useMemo(() => {
        if (!config.usePhotos) return [];
        const urls: string[] = [];
        for (const b of ctx.wish.blocks) {
            if (b.type === "photos") {
                for (const m of b.config.items || []) if (m.type === "photo" && m.url) urls.push(m.url);
            }
        }
        return urls.slice(0, 6);
    }, [config.usePhotos, ctx.wish.blocks]);

    const deck = useMemo(() => {
        const pairs: Array<{ key: string; img?: string; icon?: string }> = wishPhotos.map((url, i) => ({ key: `p${i}`, img: url }));
        for (let i = 0; pairs.length < 6; i++) pairs.push({ key: `e${i}`, icon: FALLBACK_ICONS[i % FALLBACK_ICONS.length] });
        const doubled = pairs.flatMap((p, idx) => [{ ...p, uid: idx * 2 }, { ...p, uid: idx * 2 + 1 }]);
        return seededShuffle(doubled, blockId || ctx.wish.recipient.name || "match");
    }, [wishPhotos, blockId, ctx.wish.recipient.name]);

    const [matched, setMatched] = useState<string[]>(() => (ctx.unlocked ? ["p0", "p1", "p2", "p3", "p4", "p5", "e0", "e1", "e2", "e3", "e4", "e5"] : []));
    const [flipped, setFlipped] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const lockRef = useRef(false);

    const uniqueKeys = useMemo(() => [...new Set(deck.map((d) => d.key))], [deck]);
    const won = ctx.unlocked || uniqueKeys.every((k) => matched.includes(k));

    const tapCard = (idx: number) => {
        if (lockRef.current || won || flipped.includes(idx) || matched.includes(deck[idx].key)) return;
        playUi("page", { gain: 0.5, rate: 1.2 });
        const next = [...flipped, idx];
        setFlipped(next);
        if (next.length === 2) {
            setMoves((m) => m + 1);
            const [a, b] = next;
            if (deck[a].key === deck[b].key) {
                const nextMatched = [...matched, deck[a].key];
                setMatched(nextMatched);
                setFlipped([]);
                playUi("chime", { gain: 0.5, rate: 1.15 });
                buzz(25);
                if (uniqueKeys.every((k) => nextMatched.includes(k))) {
                    setTimeout(() => { ctx.celebrate(180); ctx.unlock(); }, 320);
                }
            } else {
                lockRef.current = true;
                setTimeout(() => { setFlipped([]); lockRef.current = false; }, 720);
            }
        }
    };

    return (
        <>
            <span className="gm-badge">🃏 {won ? `Matched all 6 pairs${moves ? ` in ${moves} moves` : ""}!` : `Moves: ${moves} · Pairs: ${matched.filter((k) => uniqueKeys.includes(k)).length}/6`}</span>
            <h2>{won ? "Every memory fits together ❤️" : "Match the pairs"}</h2>
            <div className="gm-grid">
                {deck.map((card, idx) => {
                    const isMatch = won || matched.includes(card.key);
                    const isUp = isMatch || flipped.includes(idx);
                    return (
                        <button key={card.uid} type="button" className={`gm-card3d ${isUp ? "is-up" : ""} ${isMatch ? "is-match" : ""}`} onClick={() => tapCard(idx)} aria-label={`Card ${idx + 1}`}>
                            <div className="gm-card3d-in">
                                <div className="gm-face gm-back" aria-hidden="true">🎁</div>
                                <div className="gm-face gm-front" aria-hidden="true">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {card.img ? <img src={card.img} alt="" /> : card.icon}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            {won ? (
                <div className="bv-card"><p className="bv-big">{config.message || "Every moment with you is worth remembering ❤️"}</p></div>
            ) : (
                <LockTimer active={ctx.active !== false} timerKey={blockId} durationSeconds={60} label="Reveal all in" onAutoUnlock={() => { setMatched(uniqueKeys); ctx.celebrate(140); ctx.unlock(); }} />
            )}
        </>
    );
}

/* ======================= 📅 Guess the Year (Memory Timeline) ======================= */
export function GuessYearSlide({ config, ctx, blockId }: GameSlideProps<"guessYear">) {
    const moments = config.moments.filter((m) => m.caption.trim() && m.year >= 1950 && m.year <= 2035);
    const list = moments.length ? moments : [{ caption: "When our favourite memory began ❤️", year: 2022 }];
    const [idx, setIdx] = useState(0);
    const [year, setYear] = useState(2021);
    const [tries, setTries] = useState(0);
    const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
    const [finished, setFinished] = useState(ctx.unlocked);

    const cur = list[Math.min(idx, list.length - 1)];
    const done = finished || ctx.unlocked;

    const advance = () => {
        if (idx + 1 < list.length) {
            setIdx(idx + 1);
            setTries(0);
            setFeedback(null);
        } else {
            setFinished(true);
            playUi("chime", { gain: 0.7 });
            ctx.celebrate(180);
            ctx.unlock();
        }
    };

    const check = () => {
        const diff = Math.abs(year - cur.year);
        if (diff === 0) {
            playUi("chime", { gain: 0.6, rate: 1.15 });
            buzz(30);
            setFeedback({ text: `🎯 Spot on! It was ${cur.year} ❤️`, ok: true });
            ctx.celebrate(70);
            setTimeout(advance, 950);
        } else if (diff <= 1 || tries >= 1) {
            playUi("chime", { gain: 0.5 });
            setFeedback({ text: diff <= 1 ? `🥰 So close! Only 1 year off — it was ${cur.year} ❤️` : `It was ${cur.year}! Sweet memory unlocked ❤️`, ok: true });
            setTimeout(advance, 1200);
        } else {
            setTries(tries + 1);
            playUi("ping", { gain: 0.35, rate: 0.85 });
            buzz([25, 40, 25]);
            setFeedback({ text: year < cur.year ? "Hint: a little later than that ↑" : "Hint: a little earlier than that ↓", ok: false });
        }
    };

    if (done) {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">📅</div>
                <h2>Our Timeline Together ❤️</h2>
                <div className="bv-card" style={{ display: "grid", gap: 8, textAlign: "left" }}>
                    {list.map((m, i) => <p key={i} style={{ margin: 0 }}><b>{m.year}</b> — {m.caption}</p>)}
                </div>
            </>
        );
    }

    return (
        <>
            <span className="gm-badge">📅 Moment {idx + 1} of {list.length}</span>
            <h2>&ldquo;{cur.caption}&rdquo;</h2>
            <p className="bv-muted" style={{ fontSize: 14 }}>Slide or tap to pick the year this happened:</p>

            <div className="bv-card" style={{ display: "grid", gap: 12, justifyItems: "center", width: "100%", maxWidth: 340 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button type="button" className="gm-opt-key" style={{ width: 38, height: 38, fontSize: 20, cursor: "pointer", border: 0 }} onClick={() => setYear((y) => Math.max(1980, y - 1))} aria-label="Previous year">−</button>
                    <b style={{ fontSize: 38, fontFamily: "var(--v-display)", letterSpacing: 1 }}>{year}</b>
                    <button type="button" className="gm-opt-key" style={{ width: 38, height: 38, fontSize: 20, cursor: "pointer", border: 0 }} onClick={() => setYear((y) => Math.min(2026, y + 1))} aria-label="Next year">＋</button>
                </div>
                <input type="range" min={1990} max={2026} value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--v-accent)" }} aria-label="Select year" />
                <button type="button" className="bv-btn" onClick={check}>Lock in {year} ✓</button>
            </div>

            {feedback && <p className={`bv-feedback ${feedback.ok ? "ok" : "bad"}`} aria-live="polite">{feedback.text}</p>}
            <LockTimer key={idx} active={ctx.active !== false} timerKey={`${blockId}:${idx}`} durationSeconds={60} label="Auto-reveal in" onAutoUnlock={() => { setFinished(true); ctx.unlock(); }} />
        </>
    );
}

/* ======================= 🎡 Spin the Treat Wheel ======================= */
const WHEEL_PALETTE = ["#FF5C8A", "#7C5CFF", "#2ED8B6", "#FF9F43", "#38BDF8", "#F43F5E"];

export function WheelSlide({ config, ctx }: GameSlideProps<"wheel">) {
    const slices = config.slices.map((s) => s.trim()).filter(Boolean);
    const items = slices.length >= 3 ? slices.slice(0, 6) : ["🍕 Pizza treat", "☕ Coffee drive", "🍰 Extra cake", "🤗 Big hug"];
    const [deg, setDeg] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [wonIdx, setWonIdx] = useState<number | null>(null);

    const spin = () => {
        if (spinning) return;
        setSpinning(true);
        setWonIdx(null);
        const pick = Math.floor(Math.random() * items.length);
        const seg = 360 / items.length;
        // Pointer sits at top (0 deg); align center of picked slice under top pointer
        const targetAngle = 360 - (pick * seg + seg / 2);
        const nextDeg = deg + 360 * 5 + ((targetAngle - (deg % 360) + 360) % 360);
        setDeg(nextDeg);

        [180, 420, 720, 1080, 1500, 1980, 2520, 3100].forEach((ms) => {
            setTimeout(() => { playUi("ping", { gain: 0.28, rate: 1.35 }); buzz(12); }, ms);
        });
        setTimeout(() => {
            setSpinning(false);
            setWonIdx(pick);
            playUi("chime", { gain: 0.7 });
            buzz([40, 40, 80]);
            ctx.celebrate(160);
        }, 3650);
    };

    const seg = 360 / items.length;

    return (
        <>
            <span className="gm-badge">🎡 Birthday Treat Wheel</span>
            <h2>{wonIdx !== null ? "🎉 Your Birthday Voucher!" : "Spin to win your birthday treat!"}</h2>

            <div className="gm-wheel-box">
                <span className="gm-wheel-pin" aria-hidden="true">🔻</span>
                <svg viewBox="0 0 240 240" width="100%" height="100%" style={{ transform: `rotate(${deg}deg)`, transition: spinning ? "transform 3.6s cubic-bezier(.15,.86,.18,1)" : "none", borderRadius: "50%", boxShadow: "0 14px 34px rgba(0,0,0,.3)" }}>
                    <circle cx="120" cy="120" r="118" fill="#fff8e7" />
                    {items.map((label, i) => {
                        const a0 = ((i * seg - 90) * Math.PI) / 180;
                        const a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
                        const x0 = 120 + 112 * Math.cos(a0), y0 = 120 + 112 * Math.sin(a0);
                        const x1 = 120 + 112 * Math.cos(a1), y1 = 120 + 112 * Math.sin(a1);
                        const mid = i * seg + seg / 2;
                        const shortLbl = label.length > 14 ? `${label.slice(0, 13)}…` : label;
                        return (
                            <g key={i}>
                                <path d={`M120,120 L${x0},${y0} A112,112 0 0,1 ${x1},${y1} Z`} fill={WHEEL_PALETTE[i % WHEEL_PALETTE.length]} stroke="#fff8e7" strokeWidth="2" />
                                <text x="120" y="48" transform={`rotate(${mid} 120 120)`} textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800" fontFamily="system-ui, sans-serif">
                                    {shortLbl}
                                </text>
                            </g>
                        );
                    })}
                    <circle cx="120" cy="120" r="20" fill="#fff8e7" stroke="#2b2240" strokeWidth="3" />
                    <text x="120" y="126" textAnchor="middle" fontSize="16">🎁</text>
                </svg>
            </div>

            {wonIdx !== null ? (
                <div className="gm-ticket">
                    <small style={{ fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#db2777" }}>🎟️ Official Treat Voucher</small>
                    <p style={{ margin: "6px 0 4px", fontSize: 19, fontWeight: 900 }}>{items[wonIdx]}</p>
                    <small style={{ opacity: 0.75, fontWeight: 700 }}>Screenshot this &amp; send it back to claim! ❤️</small>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" className="bv-make" style={{ margin: 0, color: "#db2777" }} onClick={spin}>↻ Spin one more time</button>
                    </div>
                </div>
            ) : (
                <button type="button" className="bv-btn" onClick={spin} disabled={spinning}>{spinning ? "Spinning…" : "🎡 Spin the Wheel!"}</button>
            )}
        </>
    );
}

/* ======================= 🎁 Catch the Gifts ======================= */
type DropItem = { id: number; x: number; y: number; e: string; good: boolean };
const GOOD_GIFTS = ["🎁", "🎂", "🧁", "🎈", "💌"];
const SILLY_ITEMS = ["🥦", "⏰"];

export function CatchGiftsSlide({ config, ctx, blockId }: GameSlideProps<"catchGifts">) {
    const target = Math.max(3, Math.min(15, Math.round(config.target) || 8));
    const [caught, setCaught] = useState(ctx.unlocked ? target : 0);
    const [basketX, setBasketX] = useState(50);
    const [drops, setDrops] = useState<DropItem[]>([]);
    const [quip, setQuip] = useState("");
    const basketRef = useRef(50);
    const nextId = useRef(1);
    const finishedRef = useRef(ctx.unlocked);
    const isActive = ctx.active !== false;

    const done = ctx.unlocked || caught >= target;

    const finish = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        playUi("chime", { gain: 0.7 });
        buzz([40, 50, 90]);
        ctx.celebrate(180);
        ctx.unlock();
    }, [ctx]);

    useEffect(() => {
        if (done || !isActive) return;
        const spawn = setInterval(() => {
            setDrops((prev) => {
                if (prev.length >= 6) return prev;
                const id = nextId.current++;
                const good = id % 5 !== 0;
                const pool = good ? GOOD_GIFTS : SILLY_ITEMS;
                return [...prev, { id, x: 12 + ((id * 29) % 76), y: -6, e: pool[id % pool.length], good }];
            });
        }, 680);

        const step = setInterval(() => {
            setDrops((prev) => {
                const kept: DropItem[] = [];
                let gained = 0;
                for (const d of prev) {
                    const ny = d.y + 4.4;
                    if (ny >= 78 && ny <= 94 && Math.abs(d.x - basketRef.current) < 15) {
                        if (d.good) {
                            gained++;
                            playUi("ping", { gain: 0.4, rate: 1.25 });
                            buzz(18);
                        } else {
                            playUi("ping", { gain: 0.3, rate: 0.7 });
                            setQuip(d.e === "🥦" ? "😂 Ew, birthday broccoli!" : "😂 No alarms today!");
                        }
                        continue;
                    }
                    if (ny < 104) kept.push({ ...d, y: ny });
                }
                if (gained > 0) {
                    setCaught((c) => {
                        const nc = Math.min(target, c + gained);
                        if (nc >= target) setTimeout(finish, 80);
                        return nc;
                    });
                }
                return kept;
            });
        }, 55);

        return () => { clearInterval(spawn); clearInterval(step); };
    }, [done, isActive, target, finish]);

    const tapDrop = (item: DropItem) => {
        setDrops((prev) => prev.filter((d) => d.id !== item.id));
        if (item.good) {
            playUi("ping", { gain: 0.45, rate: 1.3 });
            buzz(20);
            setCaught((c) => {
                const nc = Math.min(target, c + 1);
                if (nc >= target) setTimeout(finish, 80);
                return nc;
            });
        } else {
            setQuip("😂 Dodged the broccoli!");
        }
    };

    const moveBasket = (clientX: number, rect: DOMRect) => {
        const pct = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
        basketRef.current = pct;
        setBasketX(pct);
    };

    if (done) {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">🎁</div>
                <h2>All {target} Gifts Caught! 🎉</h2>
                <div className="bv-card"><p className="bv-big">{config.message || "You caught every bit of birthday love! ❤️"}</p></div>
            </>
        );
    }

    return (
        <>
            <span className="gm-badge">🎁 Caught {caught} / {target}</span>
            <h2>Slide the basket (or tap falling gifts!)</h2>
            <div
                className="gm-catch"
                onPointerMove={(e) => moveBasket(e.clientX, e.currentTarget.getBoundingClientRect())}
                onPointerDown={(e) => moveBasket(e.clientX, e.currentTarget.getBoundingClientRect())}
            >
                {drops.map((d) => (
                    <button key={d.id} type="button" className="gm-drop" style={{ left: `${d.x}%`, top: `${d.y}%` }} onClick={() => tapDrop(d)} aria-label="Catch item">
                        {d.e}
                    </button>
                ))}
                <div className="gm-basket" style={{ left: `${basketX}%` }} aria-hidden="true">🧺</div>
            </div>
            {quip && <p className="bv-muted" style={{ fontSize: 13, fontWeight: 800 }}>{quip}</p>}
            <LockTimer active={isActive} timerKey={blockId} durationSeconds={60} label="Auto-catch in" onAutoUnlock={() => { setCaught(target); finish(); }} />
        </>
    );
}

/* ======================= 🗺️ 3-Clue Treasure Hunt ======================= */
export function TreasureSlide({ config, ctx, blockId }: GameSlideProps<"treasure">) {
    const clues = config.clues.filter((c) => c.riddle.trim() && c.answer.trim());
    const list = clues.length ? clues : [{ riddle: "What has candles on top and wishes inside? 🎂", answer: "cake" }];
    const [step, setStep] = useState(0);
    const [guess, setGuess] = useState("");
    const [tries, setTries] = useState(0);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [opened, setOpened] = useState(ctx.unlocked);

    const done = opened || ctx.unlocked;
    const cur = list[Math.min(step, list.length - 1)];

    const nextStep = () => {
        if (step + 1 < list.length) {
            setStep(step + 1);
            setGuess("");
            setTries(0);
            setMsg(null);
        } else {
            setOpened(true);
            playUi("chime", { gain: 0.72 });
            buzz([50, 50, 90]);
            ctx.celebrate(190);
            ctx.unlock();
        }
    };

    const submit = () => {
        const g = guess.trim().toLowerCase();
        const a = cur.answer.trim().toLowerCase();
        if (g && (g === a || g.includes(a) || a.includes(g))) {
            playUi("chime", { gain: 0.55, rate: 1.15 });
            setMsg({ text: "🔓 Lock opened!", ok: true });
            ctx.celebrate(55);
            setTimeout(nextStep, 750);
        } else {
            setTries(tries + 1);
            playUi("ping", { gain: 0.35, rate: 0.8 });
            buzz([30, 40, 30]);
            setMsg({ text: `Not quite! Hint: starts with "${cur.answer.trim().slice(0, 1).toUpperCase()}…"`, ok: false });
        }
    };

    if (done) {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">🧰</div>
                <h2>Treasure Chest Unlocked! 🎉</h2>
                <div className="bv-card"><p className="bv-big">{config.reward || "You found the real treasure: endless love ❤️"}</p></div>
            </>
        );
    }

    return (
        <>
            <div className="gm-pill-row" aria-hidden="true">
                {list.map((_, i) => <span key={i} className={`gm-dot ${i < step ? "is-done" : i === step ? "is-now" : ""}`} />)}
            </div>
            <span className="gm-badge">🗺️ Clue {step + 1} of {list.length}</span>
            <h2>{cur.riddle}</h2>
            <div style={{ display: "grid", gap: 10, justifyItems: "center", width: "100%", maxWidth: 340 }}>
                <input className="bv-input" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Type your answer…" aria-label={cur.riddle} />
                <button type="button" className="bv-btn" onClick={submit}>🔓 Unlock clue</button>
                {tries >= 1 && (
                    <button type="button" className="bv-make" style={{ margin: 0 }} onClick={() => { setMsg({ text: `Answer: "${cur.answer}" ❤️`, ok: true }); setTimeout(nextStep, 800); }}>
                        💡 Reveal answer &amp; continue
                    </button>
                )}
            </div>
            {msg && <p className={`bv-feedback ${msg.ok ? "ok" : "bad"}`} aria-live="polite">{msg.text}</p>}
            <LockTimer key={step} active={ctx.active !== false} timerKey={`${blockId}:${step}`} durationSeconds={60} label="Auto-unlock in" onAutoUnlock={() => { setOpened(true); ctx.unlock(); }} />
        </>
    );
}

/* ======================= 📰 The Birthday Gazette (Fake Newspaper) ======================= */
export function NewspaperSlide({ config, ctx }: GameSlideProps<"newspaper">) {
    const name = ctx.wish.recipient.name || ctx.wish.recipient.nickname || "The Birthday Icon";
    const [stamped, setStamped] = useState(false);

    const firstPhoto = useMemo(() => {
        for (const b of ctx.wish.blocks) {
            if (b.type === "photos") {
                const hit = (b.config.items || []).find((m) => m.type === "photo" && m.url);
                if (hit) return hit.url;
            }
        }
        return "";
    }, [ctx.wish.blocks]);

    const fillName = (s: string) => s.replace(/\{name\}/gi, name);

    return (
        <>
            <div className="gm-paper">
                <div className="gm-paper-mast">
                    <small>Special Celebration Edition · Price: 1 Slice of Cake</small>
                    <b>📰 The Daily Celebration</b>
                </div>
                <h3>{fillName(config.headline || `${name.toUpperCase()} OFFICIALLY LEVELS UP!`)}</h3>
                {config.subhead && <p className="gm-paper-sub">{fillName(config.subhead)}</p>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {firstPhoto && <img className="gm-paper-photo" src={firstPhoto} alt={name} />}
                <p className="gm-paper-body">
                    <b>BREAKING NEWS — </b>
                    {fillName(config.story || `Friends and loved ones confirm ${name} continues to be an absolute legend. Celebration levels across the city have surged by 200%.`)}
                </p>
                {stamped && <span className="gm-stamp">❤️ CERTIFIED ICON</span>}
            </div>
            {!stamped ? (
                <button
                    type="button"
                    className="bv-btn"
                    onClick={() => { setStamped(true); playUi("rip", { gain: 0.45, rate: 1.2 }); buzz(35); ctx.celebrate(110); }}
                >
                    💮 Stamp: Certified Favourite Human
                </button>
            ) : (
                <p className="bv-muted" style={{ fontWeight: 800 }}>Front page approved! Tap › to continue 🎉</p>
            )}
        </>
    );
}
