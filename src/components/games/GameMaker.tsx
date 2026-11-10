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
import { CandlesEditor, PrankEditor, TriviaEditor } from "@/components/wizard2/gameEditors";

const DEMO: { [K in GameType]: BlockConfigMap[K] } = {
    candles: { candles: 5, message: "Make a wish! 🎂", placement: "finale" },
    prank: { kind: "error", placement: "opener" },
    trivia: { title: "How well do you know Rahul?", questions: [{ q: "What's Rahul's comfort food?", options: ["Pizza", "Maggi", "Biryani"], correct: 1 }, { q: "Rahul is always…", options: ["Early", "On time", "30 mins late"], correct: 2 }], leaderboard: true, placement: "fun" },
};

function demoWish(name: string, blocks: BlockInstance[]): WishDataV2 {
    return {
        schemaVersion: 2, wishType: "birthday",
        recipient: { name, age: "", gender: "", nickname: "", relationship: "", vibe: "grand-celebration", coupleName: "", anniversaryYear: "" },
        blocks, look: { theme: "party", presentationStyle: "cinematic", soundtrack: "lofi", language: "en" },
        unlock: { date: "" }, meta: { timeCapsule: "", extra: {} },
    };
}

/** Playable demo of one game inside a phone frame (real viewer slide, interactive). */
function GameDemo({ game }: { game: GameType }) {
    const [round, setRound] = useState(0);
    const [solved, setSolved] = useState(false);
    const block = { id: `${game}-1`, type: game, config: DEMO[game] } as BlockInstance;
    const wish = demoWish("Rahul", [block]);
    const ctx: SlideCtx = {
        wish, i: getTranslations("en"), unlocked: solved,
        unlock: () => setSolved(true),
        celebrate: (n = 80) => burst(window.innerWidth / 2, window.innerHeight / 2, Math.min(n, 120)),
    };
    return (
        <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
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
    const [cfg, setCfg] = useState<BlockConfigMap[GameType]>(() => ({ ...BLOCKS[game].defaultConfig(), ...(game === "trivia" ? { questions: [{ q: "", options: ["", "", ""], correct: 0 }] } : {}) }) as BlockConfigMap[GameType]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [link, setLink] = useState("");
    const [open, setOpen] = useState(false);

    const gameBlock = useMemo(() => ({ id: `${game}-1`, type: game, config: cfg } as BlockInstance), [game, cfg]);
    const valid = name.trim().length > 0 && (BLOCKS[game].isFilled as (c: unknown) => boolean)(cfg);

    const create = async () => {
        if (!valid) { setError(name.trim() ? "Please finish the game settings first." : "Add their name first 👆"); return; }
        setBusy(true); setError("");
        const blocks: BlockInstance[] = [{ id: "intro-1", type: "intro", config: {} }, gameBlock];
        if (message.trim()) blocks.push({ id: "message-1", type: "message", config: { text: message.trim() } });
        blocks.push({ id: "finale-1", type: "finale", config: { effect: "confetti" } });
        const wish = demoWish(name.trim(), blocks);
        wish.recipient.age = age;
        wish.meta.extra = { source: `game:${slug}` };
        try {
            const res = await fetch("/api/wish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(wish) });
            const data = await res.json();
            if (!res.ok || !data.id) throw new Error(data.error || "Could not create the link");
            try { if (data.creatorToken) localStorage.setItem(`creator_token_${data.id}`, data.creatorToken); } catch { /* ignore */ }
            setLink(`${window.location.origin}/wish/${data.id}`);
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    // "Add photos, voice note and more": seed a Wizard 2.0 draft with this game and open it
    const openInWizard = () => {
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
        const share = `🎁 ${name.trim()}, I made you a birthday game! Tap to play 👉 ${link}`;
        return (
            <div className="bw-card" style={{ padding: 24, textAlign: "center" }}>
                <h3 style={{ fontFamily: "var(--p-font-display)", fontSize: 26, fontWeight: 800 }}>Your game is ready! 🎉</h3>
                <div style={{ display: "flex", justifyContent: "center", margin: "70px 0 30px" }}>
                    <GiftCube open={open} pop="🔗" label="Open the gift" onClick={(e) => { if (!open) { setOpen(true); burst(e.clientX, e.clientY, 150); } }} />
                </div>
                {open && (
                    <>
                        <div className="wz2-linkbox"><code>{link.replace(/^https?:\/\//, "")}</code><button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={() => navigator.clipboard?.writeText(link)}>Copy</button></div>
                        <div className="wz2-share">
                            <a className="bw-btn bw-btn-primary bw-btn-sm" style={{ background: "#25D366", boxShadow: "none" }} href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer">💬 Send on WhatsApp</a>
                            <a className="bw-btn bw-btn-ghost bw-btn-sm" href={link} target="_blank" rel="noopener noreferrer">👀 Try it</a>
                        </div>
                    </>
                )}
                {!open && <p className="wz2-sub">Tap the gift to get your link</p>}
            </div>
        );
    }

    return (
        <div className="bw-card" style={{ padding: 22 }}>
            <span className="wz2-label" style={{ marginTop: 0 }}>Who is it for?</span>
            <input className="wz2-field" value={name} maxLength={50} placeholder="e.g. Rahul" onChange={(e) => { setName(e.target.value); setError(""); }} aria-label="Their name" />
            {game === "candles" && <>
                <span className="wz2-label">Age (optional)</span>
                <input className="wz2-field" style={{ fontSize: 16 }} inputMode="numeric" value={age} maxLength={3} placeholder="25" onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} aria-label="Age" />
            </>}
            <div style={{ marginTop: 6 }}>
                {game === "candles" && <CandlesEditor value={cfg as BlockConfigMap["candles"]} onChange={(v) => setCfg(v)} age={age} />}
                {game === "prank" && <><span className="wz2-label">Which prank?</span><PrankEditor value={cfg as BlockConfigMap["prank"]} onChange={(v) => setCfg(v)} /></>}
                {game === "trivia" && <TriviaEditor value={cfg as BlockConfigMap["trivia"]} onChange={(v) => setCfg(v)} name={name} />}
            </div>
            <span className="wz2-label">A short message after the game (optional)</span>
            <textarea className="wz2-field" style={{ minHeight: 90 }} value={message} maxLength={400} placeholder={`Happy birthday ${name || "Rahul"}! 🎂`} onChange={(e) => setMessage(e.target.value)} aria-label="Message" />
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
    const list = [
        { type: "candles", e: "🕯️", t: "Blow the Candles", slug: "blow-the-candles" },
        { type: "prank", e: "😂", t: "Birthday Prank Link", slug: "birthday-prank-link" },
        { type: "trivia", e: "🏅", t: "Birthday Quiz + Leaderboard", slug: "birthday-quiz" },
    ].filter((g) => g.type !== current);
    return (
        <div className="bw-guide-grid">
            {list.map((g) => <Link key={g.slug} href={`/games/${g.slug}`} className="bw-card bw-guide"><span className="e" aria-hidden="true">{g.e}</span>{g.t}</Link>)}
            <Link href="/birthday-wishes-game" className="bw-card bw-guide"><span className="e" aria-hidden="true">🎮</span>All birthday wishes games</Link>
        </div>
    );
}
