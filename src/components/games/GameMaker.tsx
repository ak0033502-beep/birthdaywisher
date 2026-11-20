"use client";

import "@/components/viewer/viewer.css";
import "@/components/wizard2/wizard2.css";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTranslations } from "@/lib/i18n";
import { BLOCKS, type GameType } from "@/blocks/registry";
import type { BlockConfigMap, BlockInstance, WishDataV2 } from "@/lib/wish/schema";
import { BlockSlide, type SlideCtx } from "@/blocks/slides";
import { getSkin, skinVars } from "@/components/viewer/skins";
import { GiftCube } from "@/components/party/Decor";
import { burst } from "@/components/party/interactions";
import { newDraft, defaultOrder } from "@/components/wizard2/draft";
import { GameConfigEditor, GAME_LIBRARY } from "@/components/wizard2/gameEditors";
import { ReviewPrompt, shouldAskReview } from "@/components/review/ReviewPrompt";
import { KeepAliveCard } from "@/components/vault/KeepAliveCard";
import { track } from "@/lib/track";

const DEMO: { [K in GameType]: BlockConfigMap[K] } = {
    heartbeat: { message: "Chahe kitni bhi doori ho, main hamesha tere saath hoon ❤️", placement: "finale" },
    lanterns: {
        wishes: [
            "May every morning bring you peace & big smiles 🌅",
            "May all your secret dreams come true this year 🏮",
            "Thank you for making life warmer just by being in it ❤️",
        ],
        placement: "finale",
    },
    balloons: {
        notes: [
            "Your laugh makes the hardest days feel light 🥰",
            "Nobody understands me the way you do ❤️",
            "Here's to 100 more memories together 🎈",
        ],
        placement: "fun",
    },
    memoryMatch: { message: "Every moment with you is worth remembering ❤️", usePhotos: false, placement: "fun" },
    guessYear: {
        moments: [
            { caption: "When our friendship officially began ❤️", year: 2021 },
            { caption: "Our most unforgettable trip together 🎉", year: 2023 },
        ],
        placement: "fun",
    },
    candles: { candles: 5, message: "Make a wish! 🎂", placement: "finale" },
    trivia: {
        title: "How well do we know each other?",
        questions: [
            { q: "What's Rahul's 2 AM comfort food?", options: ["Pizza", "Maggi", "Biryani"], correct: 1 },
            { q: "Rahul always arrives…", options: ["10 mins early", "Right on time", "Fashionably 25 mins late 😂"], correct: 2 },
        ],
        placement: "fun",
    },
    prank: { kind: "error", placement: "opener" },
    wheel: {
        slices: ["🍕 Pizza treat on me", "☕ Late-night coffee", "🎬 Movie choice", "🍰 Extra cake", "🤗 Tightest hug"],
        placement: "fun",
    },
    catchGifts: { target: 6, message: "You caught every bit of birthday love! 🎉", placement: "fun" },
    treasure: {
        clues: [
            { riddle: "Clue 1: What has candles on top and wishes inside? 🎂", answer: "cake" },
            { riddle: "Clue 2: Who is the star of today's celebration? (Type 'me' 😄)", answer: "me" },
        ],
        reward: "You unlocked the real treasure: endless love & your best year yet ❤️",
        placement: "fun",
    },
    newspaper: {
        headline: "BREAKING: RAHUL OFFICIALLY LEVELS UP TODAY!",
        subhead: "Experts confirm smiles and good vibes have hit an all-time record high",
        story: "Sources close to Rahul report cake supplies are critically low while celebration levels across town have risen by 200%.",
        placement: "opener",
    },
};

function demoWish(name: string, blocks: BlockInstance[]): WishDataV2 {
    return {
        schemaVersion: 2, wishType: "birthday",
        recipient: { name, age: "", gender: "", nickname: "", relationship: "", vibe: "grand-celebration", coupleName: "", anniversaryYear: "" },
        blocks, look: { theme: "neon", presentationStyle: "cinematic", soundtrack: "lofi", language: "en" },
        unlock: { date: "" }, meta: { timeCapsule: "", extra: {} },
    };
}

/** Playable demo of one game inside a phone frame (real viewer slide, interactive). */
function GameDemo({ game }: { game: GameType }) {
    const [round, setRound] = useState(0);
    const [solved, setSolved] = useState(false);
    const [played, setPlayed] = useState(false);
    const block = { id: `${game}-${round}`, type: game, config: DEMO[game] } as BlockInstance;
    const wish = demoWish("Rahul", [block]);
    const ctx: SlideCtx = {
        wish, i: getTranslations("en"), unlocked: solved,
        unlock: () => setSolved(true),
        celebrate: (n = 80) => burst(window.innerWidth / 2, window.innerHeight / 2, Math.min(n, 120)),
    };
    return (
        <div style={{ display: "grid", justifyItems: "center", gap: 10 }} onPointerDown={() => { if (!played) { setPlayed(true); track("game_demo_play", { game }); } }}>
            <div className="wz2-phone" style={{ transform: "none" }}>
                <div className="wz2-screen">
                    <div className="bv bv-embed" style={skinVars(getSkin("neon")) as React.CSSProperties}>
                        <div className="bv-stage">
                            <section className="bv-slide" key={round}><BlockSlide block={block} ctx={ctx} /></section>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" className="bw-btn bw-btn-ghost bw-btn-sm" onClick={() => { setSolved(false); setRound((r) => r + 1); }}>↻ Play again</button>
        </div>
    );
}

/** 30-second creator: name + game settings (+ optional message) → shareable link. */
export function GameMaker({ game, slug }: { game: GameType; slug: string }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [message, setMessage] = useState("");
    const [cfg, setCfg] = useState<BlockConfigMap[GameType]>(() => BLOCKS[game].defaultConfig() as BlockConfigMap[GameType]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [createdId, setCreatedId] = useState("");
    const [link, setLink] = useState("");
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [askReview, setAskReview] = useState(false);

    const gameBlock = useMemo(() => ({ id: `${game}-1`, type: game, config: cfg } as BlockInstance), [game, cfg]);
    const valid = name.trim().length > 0 && (BLOCKS[game].isFilled as (c: unknown) => boolean)(cfg);

    const create = async () => {
        if (!valid) { setError(name.trim() ? "Please finish the game settings first." : "Add their name first 👆"); return; }
        setBusy(true); setError("");
        const blocks: BlockInstance[] = [{ id: "intro-1", type: "intro", config: {} }, gameBlock];
        if (message.trim()) blocks.push({ id: "message-1", type: "message", config: { text: message.trim() } });
        blocks.push({ id: "finale-1", type: "finale", config: { effect: "fireworks" } });
        const wish = demoWish(name.trim(), blocks);
        wish.recipient.age = age;
        wish.meta.extra = { source: `game:${slug}` };
        try {
            const res = await fetch("/api/wish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(wish) });
            const data = await res.json();
            if (!res.ok || !data.id) throw new Error(data.error || "Could not create the link");
            try { if (data.creatorToken) localStorage.setItem(`creator_token_${data.id}`, data.creatorToken); } catch { /* ignore */ }
            setCreatedId(data.id);
            setLink(`${window.location.origin}/wish/${data.id}`);
            track("game_maker_create", { game, message: !!message.trim() });
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const openInWizard = () => {
        track("cta_click", { label: "game-to-wizard", game });
        const d = newDraft("birthday");
        const draft = {
            ...d, mode: "custom" as const, wantGames: true, order: defaultOrder(),
            recipient: { ...d.recipient, name: name.trim(), age },
            enabled: [...d.enabled, game],
            configs: { ...d.configs, [game]: cfg, ...(message.trim() ? { message: { text: message.trim() } } : {}) },
            step: "ingredients",
        };
        try { localStorage.setItem("bw-wizard2-draft", JSON.stringify(draft)); } catch { /* ignore */ }
        router.push("/create");
    };

    if (link) {
        const share = `🎁 ${name.trim()}, I made you a surprise game! Tap to open 👉 ${link}`;
        const triggerReview = (ms: number) => { if (shouldAskReview("creator")) setTimeout(() => setAskReview(true), ms); };
        return (
            <div className="bw-card" style={{ padding: 24, textAlign: "center" }}>
                <h3 style={{ fontFamily: "var(--p-font-display)", fontSize: 26, fontWeight: 800 }}>Your surprise is ready! 🎉</h3>
                <div style={{ display: "flex", justifyContent: "center", margin: "70px 0 30px" }}>
                    <GiftCube open={open} pop="🔗" label="Open the gift" onClick={(e) => { if (!open) { setOpen(true); burst(e.clientX, e.clientY, 150); triggerReview(7500); } }} />
                </div>
                {open && (
                    <>
                        <div className="wz2-linkbox">
                            <code>{link.replace(/^https?:\/\//, "")}</code>
                            <button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); triggerReview(2000); }}>{copied ? "Copied ✓" : "Copy"}</button>
                        </div>
                        <div className="wz2-share">
                            <a className="bw-btn bw-btn-primary bw-btn-sm" style={{ background: "#25D366", boxShadow: "none" }} href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" onClick={() => triggerReview(4500)}>💬 Send on WhatsApp</a>
                            <a className="bw-btn bw-btn-ghost bw-btn-sm" href={link} target="_blank" rel="noopener noreferrer">👀 Try it</a>
                        </div>
                        <KeepAliveCard wishId={createdId} surface="game_finish" variant="party" />
                    </>
                )}
                {!open && <p className="wz2-sub">Tap the gift to get your link</p>}
                {askReview && <ReviewPrompt who="creator" wishId={createdId} mode="modal" onClose={() => setAskReview(false)} />}
            </div>
        );
    }

    return (
        <div className="bw-card" style={{ padding: 22 }}>
            <span className="wz2-label" style={{ marginTop: 0 }}>Who is it for?</span>
            <input className="wz2-field" value={name} maxLength={50} placeholder="e.g. Priya" onChange={(e) => { setName(e.target.value); setError(""); }} aria-label="Their name" />
            {game === "candles" && <>
                <span className="wz2-label">Age (optional)</span>
                <input className="wz2-field" style={{ fontSize: 16 }} inputMode="numeric" value={age} maxLength={3} placeholder="21" onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} aria-label="Age" />
            </>}
            <div style={{ marginTop: 6 }}>
                <GameConfigEditor game={game} value={cfg} onChange={(v) => setCfg(v)} name={name} age={age} />
            </div>
            <span className="wz2-label">Extra birthday message after the game (optional)</span>
            <textarea className="wz2-field" style={{ minHeight: 84 }} value={message} maxLength={400} placeholder={`Happy birthday ${name || "Priya"}! ❤️🎂`} onChange={(e) => setMessage(e.target.value)} aria-label="Message" />
            {error && <div className="wz2-error" role="alert">{error}</div>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button type="button" className="bw-btn bw-btn-primary" onClick={create} disabled={busy}>{busy ? "Creating…" : "🎁 Create my game link"}</button>
                <button type="button" className="bw-btn bw-btn-ghost" onClick={openInWizard}>➕ Add photos, voice &amp; more</button>
            </div>
        </div>
    );
}

export function GameDemoBox({ game }: { game: GameType }) {
    return <GameDemo game={game} />;
}

export function OtherGames({ current }: { current: GameType }) {
    const others = GAME_LIBRARY.filter((g) => g.type !== current).slice(0, 5);
    return (
        <div className="bw-guide-grid">
            {others.map((g) => <Link key={g.slug} href={`/games/${g.slug}`} className="bw-card bw-guide"><span className="e" aria-hidden="true">{g.e}</span>{g.t}</Link>)}
            <Link href="/birthday-wishes-game" className="bw-card bw-guide"><span className="e" aria-hidden="true">🎮</span>All 12 birthday games</Link>
        </div>
    );
}
