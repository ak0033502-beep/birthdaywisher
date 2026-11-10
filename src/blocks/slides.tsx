"use client";

/**
 * Slides for the v2 block viewer: one component per block type.
 * Content mirrors today's v1 StoryViewer (same texts via i18n, same gates,
 * same 60-second auto-skip), rendered by one engine with skins.
 */
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import type { getTranslations } from "@/lib/i18n";
import type { BlockConfigMap, BlockInstance, BlockType, WishDataV2 } from "@/lib/wish/schema";
import { LockTimer } from "@/components/story/LockTimer";
import { SlidingPuzzle } from "@/components/story/SlidingPuzzle";
import { CandlesSlide, PrankSlide, TriviaSlide } from "./games";

// Heavy/optional interactions load only when a wish actually uses them (SmileLock pulls in face detection)
const ScratchCard = dynamic(() => import("@/components/story/ScratchCard").then((m) => m.ScratchCard), { ssr: false });
const SmileLock = dynamic(() => import("@/components/story/SmileLock").then((m) => m.SmileLock), { ssr: false });

export type Tr = ReturnType<typeof getTranslations>;

export interface SlideCtx {
    wish: WishDataV2;
    i: Tr;
    unlocked: boolean;
    /** Mark this gate as solved (or auto-skipped) */
    unlock: () => void;
    celebrate: (n?: number) => void;
    /** Real wish id (needed for the live leaderboard); undefined in previews/demos */
    wishId?: string;
}

type SlideProps<K extends BlockType> = { config: BlockConfigMap[K]; ctx: SlideCtx; blockId: string };

const ERR = ["Oops, that's not it! Try again 🧐", "Haha, nope! Think harder! 🤭", "Are you sure? 🥺", "Not quite! Memory failing you? 😅"];
const OK = ["Aww, you got it! ❤️", "Look at you go! 🎉", "Perfect memory! 🥰", "Yesss! You're the best! 🏆"];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
const norm = (s: string) => s.toLowerCase().trim();

/* ---------- Content slides ---------- */

function Intro({ ctx }: SlideProps<"intro">) {
    const { wish, i } = ctx;
    const r = wish.recipient;
    const anniversary = wish.wishType === "anniversary";
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">{anniversary ? "💍" : "🎂"}</div>
            <h1>
                {anniversary ? i.happyAnniversary : i.happyBirthday},<br />
                <span className="bv-grad">{anniversary ? r.coupleName || r.name : r.nickname || r.name}!</span>
            </h1>
            {anniversary
                ? r.anniversaryYear && <p className="bv-muted" style={{ fontSize: 20 }}>{r.anniversaryYear} {i.yearsOfLove}</p>
                : r.age && <p className="bv-muted" style={{ fontSize: 20 }}>{i.turning} {r.age} {i.looksGoodOnYou}</p>}
        </>
    );
}

function Connection({ config, ctx }: SlideProps<"connection">) {
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">💞</div>
            <h2>{ctx.i.toMyFavorite} <span style={{ textTransform: "capitalize" }}>{config.relationship}</span></h2>
            <p className="bv-muted" style={{ fontSize: 18, maxWidth: 420 }}>{ctx.i.getReady}</p>
        </>
    );
}

function Roast({ config, ctx }: SlideProps<"roast">) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(config.level), 50); return () => clearTimeout(t); }, [config.level]);
    return (
        <>
            <h2>{ctx.i.roastMeterTitle}</h2>
            <p className="bv-muted">{ctx.i.iSetTheVibe}</p>
            <div className="bv-meter" role="meter" aria-valuenow={config.level} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${w}%` }} /></div>
            <div className="bv-meter-labels"><span>{ctx.i.pureToast}</span><span>{ctx.i.savage}</span></div>
            <p style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--v-display)" }}>{config.level}% {config.level > 50 ? ctx.i.roast : ctx.i.toast}</p>
        </>
    );
}

function Quirks({ config, ctx }: SlideProps<"quirks">) {
    return (
        <>
            <h2>{ctx.i.thingsILove}</h2>
            <div className="bv-chips">
                {config.items.filter(Boolean).map((q, idx) => <span key={idx} className="bv-chip" style={{ animationDelay: `${idx * 0.15}s` }}>{q}</span>)}
            </div>
        </>
    );
}

function Memory({ config, ctx }: SlideProps<"memory">) {
    return (
        <>
            <h2>{ctx.i.rememberThat}</h2>
            <div className="bv-card"><p className="bv-quote">&ldquo;{config.text}&rdquo;</p></div>
        </>
    );
}

function Photos({ config, ctx }: SlideProps<"photos">) {
    const items = config.items.filter((m) => m.url);
    const [n, setN] = useState(0);
    const item = items[Math.min(n, items.length - 1)];
    return (
        <>
            <h2>{n === 0 ? ctx.i.aLittleMemory : ctx.i.andAnother}</h2>
            {item && (
                <div className="bv-photo" key={item.url}>
                    {item.type === "video"
                        ? <video src={item.url} autoPlay loop muted playsInline controls />
                        // eslint-disable-next-line @next/next/no-img-element
                        : <img src={item.url} alt={ctx.i.memoryVault} />}
                </div>
            )}
            {items.length > 1 && (
                <div className="bv-dots" role="tablist" aria-label={ctx.i.memoryVault}>
                    {items.map((_, idx) => <button key={idx} type="button" aria-label={`Photo ${idx + 1}`} className={idx === n ? "is-on" : ""} onClick={() => setN(idx)} />)}
                </div>
            )}
        </>
    );
}

function Award({ config, ctx }: SlideProps<"award">) {
    return (
        <>
            <div className="bv-trophy" aria-hidden="true">🏆</div>
            <p className="bv-muted" style={{ fontSize: 18 }}>{ctx.i.youOfficiallyWin}</p>
            <h2>&ldquo;{config.title}&rdquo;</h2>
        </>
    );
}

function Voice({ config, ctx }: SlideProps<"voice">) {
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">🎤</div>
            <h2>{ctx.i.listenClosely}</h2>
            <p className="bv-muted">{ctx.i.tapPlayVoice}</p>
            <audio className="bv-audio" controls src={config.audioUrl} preload="metadata" />
        </>
    );
}

function Gratitude({ config, ctx }: SlideProps<"gratitude">) {
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">🙏</div>
            <h2>{ctx.i.imSoThankful}</h2>
            <div className="bv-card"><p className="bv-quote">&ldquo;{ctx.i.because} {config.text}&rdquo;</p></div>
        </>
    );
}

function Message({ config, ctx }: SlideProps<"message">) {
    return (
        <>
            <h2>💌 {ctx.i.heartToHeart}</h2>
            <div className="bv-card"><p className="bv-big">{config.text}</p></div>
        </>
    );
}

function PromiseSlide({ config, ctx }: SlideProps<"promise">) {
    const card = (
        <div className="bv-card" style={{ minHeight: 180, display: "grid", placeItems: "center" }}>
            <p className="bv-quote">&ldquo;{config.text}&rdquo;</p>
        </div>
    );
    let body: ReactNode = config.scratchOff
        ? <div style={{ width: "100%", maxWidth: 420, aspectRatio: "4 / 3" }}><ScratchCard onUnlock={() => ctx.celebrate(100)}>{card}</ScratchCard></div>
        : card;
    if (config.smileLock) body = <div style={{ width: "100%", maxWidth: 420 }}><SmileLock onUnlock={() => ctx.celebrate(150)}>{body}</SmileLock></div>;
    return (
        <>
            <h2>🤞 {ctx.i.myPromise}</h2>
            {body}
        </>
    );
}

function GiftCard({ config }: SlideProps<"giftCard">) {
    const name = config.kind === "custom" ? "Custom Gift" : `${config.kind.charAt(0).toUpperCase()}${config.kind.slice(1)} Gift Card`;
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">🎁</div>
            <h2>{config.message || "I got you a little something..."}</h2>
            <div className="bv-card">
                <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 14 }}>{name}</p>
                <a className="bv-btn" href={config.url} target="_blank" rel="noopener noreferrer">Open your gift →</a>
            </div>
        </>
    );
}

function Finale({ config, ctx }: SlideProps<"finale">) {
    const { wish, i } = ctx;
    const effect = config?.effect || "confetti";
    useEffect(() => { ctx.celebrate(effect === "confetti" ? 220 : 90); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const name = wish.wishType === "anniversary" ? wish.recipient.coupleName || wish.recipient.name : wish.recipient.name;
    const rise = effect === "hearts" ? ["💗", "💖", "🤗", "💕"] : effect === "lanterns" ? ["🏮", "🏮", "🪔"] : null;
    return (
        <>
            {rise && (
                <div className="bv-rise" aria-hidden="true">
                    {Array.from({ length: 16 }, (_, n) => (
                        <span key={n} style={{ left: `${(n * 61) % 100}%`, animationDelay: `${(n % 8) * 0.55}s`, animationDuration: `${6 + (n % 5)}s`, fontSize: 22 + ((n * 7) % 22) }}>{rise[n % rise.length]}</span>
                    ))}
                </div>
            )}
            <p className="bv-muted" style={{ fontSize: 18 }}>{wish.wishType === "anniversary" ? i.happyAnniversary : i.happyBirthdayFinale}</p>
            <h1 className="bv-finale-name bv-grad">{name}</h1>
            <p className="bv-muted" style={{ fontSize: 18 }}>{i.withAllMyLove} 💖</p>
            <a className="bv-make" href="/">🎁 Make a surprise like this for someone</a>
        </>
    );
}

/* ---------- Gate slides (must solve, or wait 60 s) ---------- */

function useGateFeedback() {
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [shake, setShake] = useState(false);
    const fail = () => { setMsg({ text: pick(ERR), ok: false }); setShake(true); setTimeout(() => setShake(false), 460); };
    const pass = () => setMsg({ text: pick(OK), ok: true });
    return { msg, shake, fail, pass, setMsg };
}

function SecretDate({ config, ctx }: SlideProps<"secretDate">) {
    const [guess, setGuess] = useState("");
    const fb = useGateFeedback();
    const submit = () => {
        if (guess === config.date) { fb.pass(); ctx.unlock(); ctx.celebrate(50); } else fb.fail();
    };
    return (
        <>
            <div className="bv-emoji" aria-hidden="true">{ctx.unlocked ? "🔓" : "🔒"}</div>
            <h2>{ctx.unlocked ? config.date : ctx.i.enterSecretDate}</h2>
            {!ctx.unlocked && (
                <div className={fb.shake ? "bv-shake" : ""} style={{ display: "grid", gap: 12, justifyItems: "center", width: "100%" }}>
                    <input className="bv-input" type="date" value={guess} onChange={(e) => setGuess(e.target.value)} aria-label={ctx.i.enterSecretDate} />
                    <button type="button" className="bv-btn" onClick={submit}>{ctx.i.unlock}</button>
                    <LockTimer durationSeconds={60} onAutoUnlock={() => { fb.setMsg({ text: "Time's up! Here it is...", ok: true }); ctx.unlock(); ctx.celebrate(50); }} />
                </div>
            )}
            <p className={`bv-feedback ${fb.msg?.ok ? "ok" : "bad"}`} aria-live="polite">{fb.msg?.text}</p>
        </>
    );
}

function Puzzle({ config, ctx }: SlideProps<"puzzle">) {
    return (
        <>
            <h2>{ctx.unlocked ? ctx.i.puzzleSolved : ctx.i.picturePuzzle}</h2>
            {!ctx.unlocked && <p className="bv-muted">{ctx.i.tapToSlide}</p>}
            {ctx.unlocked ? (
                // eslint-disable-next-line @next/next/no-img-element
                <div className="bv-photo"><img src={config.imageUrl} alt={ctx.i.puzzleSolved} /></div>
            ) : (
                <>
                    <div className="bv-puzzle"><SlidingPuzzle imageUrl={config.imageUrl} onSolve={() => { ctx.unlock(); ctx.celebrate(100); }} t={{ card: "" }} /></div>
                    <LockTimer durationSeconds={60} label="Skipping in" onAutoUnlock={() => { ctx.unlock(); ctx.celebrate(100); }} />
                </>
            )}
        </>
    );
}

function Quiz({ config, ctx }: SlideProps<"quiz">) {
    const questions = config.questions.filter((q) => q.q.trim());
    const [n, setN] = useState(0);
    const [guess, setGuess] = useState("");
    const fb = useGateFeedback();
    const q = questions[Math.min(n, questions.length - 1)];

    const next = () => {
        if (n + 1 < questions.length) { setN(n + 1); setGuess(""); }
        else ctx.unlock();
    };
    const submit = () => {
        if (!q.a || norm(guess) === norm(q.a)) { fb.pass(); ctx.celebrate(50); setTimeout(next, 700); } else fb.fail();
    };

    if (ctx.unlocked) {
        return (
            <>
                <div className="bv-emoji" aria-hidden="true">🎉</div>
                <h2>{ctx.i.youGotIt}</h2>
                <div className="bv-card" style={{ display: "grid", gap: 10, textAlign: "left" }}>
                    {questions.map((x, idx) => <p key={idx}><b>{x.q}</b><br /><span className="bv-muted">&ldquo;{x.a}&rdquo;</span></p>)}
                </div>
            </>
        );
    }
    return (
        <>
            <p className="bv-muted" style={{ fontWeight: 800 }}>{n === 0 ? ctx.i.quizTime : ctx.i.oneMoreQuestion} {questions.length > 1 ? `(${n + 1}/${questions.length})` : ""}</p>
            <h2>&ldquo;{q.q}&rdquo;</h2>
            <div className={fb.shake ? "bv-shake" : ""} style={{ display: "grid", gap: 12, justifyItems: "center", width: "100%" }}>
                <input className="bv-input" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Type your answer…" aria-label={q.q} />
                <button type="button" className="bv-btn" onClick={submit}>{ctx.i.submit}</button>
                <LockTimer key={n} durationSeconds={60} onAutoUnlock={() => { fb.setMsg({ text: `Time's up! It was "${q.a}"`, ok: true }); setTimeout(next, 900); }} />
            </div>
            <p className={`bv-feedback ${fb.msg?.ok ? "ok" : "bad"}`} aria-live="polite">{fb.msg?.text}</p>
        </>
    );
}

/* ---------- Registry of slide components ---------- */

const SLIDES: { [K in BlockType]: (p: SlideProps<K>) => ReactNode } = {
    intro: Intro, connection: Connection, roast: Roast, quirks: Quirks, memory: Memory, photos: Photos,
    secretDate: SecretDate, puzzle: Puzzle, quiz: Quiz, award: Award, voice: Voice, gratitude: Gratitude,
    message: Message, promise: PromiseSlide, giftCard: GiftCard, finale: Finale,
    candles: CandlesSlide, prank: PrankSlide, trivia: TriviaSlide,
};

export function BlockSlide({ block, ctx }: { block: BlockInstance; ctx: SlideCtx }) {
    const C = SLIDES[block.type] as (p: { config: unknown; ctx: SlideCtx; blockId: string }) => ReactNode;
    return <C config={block.config} ctx={ctx} blockId={block.id} />;
}
