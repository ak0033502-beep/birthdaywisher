"use client";

/**
 * 🎆 Grand Birthday Finale
 * Act 1 lights out + 3-2-1 · Act 2 rockets & fireworks · Act 3 the name written in the sky ·
 * Act 4 cake + full Happy Birthday tune while the candles are lit, then blow the candles ·
 * Act 5 grand barrage (anaar, chakri, confetti cannons, applause) · Afterglow (replay, thank-you, memory card, review).
 *
 * - Sound is generated in the browser (no files) and only starts after the recipient taps.
 * - Respects device tiers and prefers-reduced-motion (calm version, no rockets).
 * - No full-screen strobe: bursts light up small areas only.
 * - Rendered into the viewer root (.bv) via a portal, so style frames (book page, museum frame) never clip it.
 */
import "./finale.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { WishDataV2 } from "@/lib/wish/schema";
import type { getTranslations } from "@/lib/i18n";
import { Fireworks, type BurstKind, type Tier } from "./fireworks";
import { buzz, createSfx, isMutedPref, prefetchFinaleSamples, setMutedPref, type Sfx } from "@/lib/celebration/sfx";
import { detectTier } from "@/components/party/interactions";
import { track } from "@/lib/track";
import { ReviewPrompt, shouldAskReview } from "@/components/review/ReviewPrompt";
import { KeepAliveCard } from "@/components/vault/KeepAliveCard";

type Tr = ReturnType<typeof getTranslations>;
type Phase = "ready" | "countdown" | "show" | "cake" | "barrage" | "after";
export type FinaleVariant = "fireworks" | "hearts" | "lanterns";

const HEX = /^#[0-9a-f]{6}$/i;
const LATIN = /^[\p{Script=Latin}\p{N}\s.'’&-]+$/u;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function finaleVariant(effect: string | undefined): FinaleVariant {
    return effect === "hearts" ? "hearts" : effect === "lanterns" ? "lanterns" : "fireworks";
}

function paletteFor(theme: string, style: string, variant: FinaleVariant, accent: string, accent2: string): string[] {
    if (variant === "hearts") return ["#ff4d8d", "#ff8fb8", "#ffd1e1", "#ff3366", "#ffffff", "#ffb3c7"];
    if (variant === "lanterns") return ["#ffcf6b", "#ff9f43", "#ffe7a3", "#ff7a59", "#fff1c1"];
    if (style === "terminal") return ["#3dff7e", "#16d9ff", "#b6ffcf", "#ffffff", "#7cf6ff"];
    switch (theme) {
        case "elegant": case "golden-anniversary": case "royal-navy": return ["#ffd166", "#ffcf6b", "#fff1c1", "#f59e0b", "#ffffff"];
        case "monochrome": return ["#ffffff", "#e4e4e7", "#c0c0c8", "#ffe7a3"];
        case "pastel": case "cherry-blossom": return ["#ffb3c7", "#c3b5ff", "#a8f0e0", "#ffe3a3", "#ffffff"];
        case "paper": case "vintage-love": return ["#ffcf6b", "#f4a261", "#e9c46a", "#fff1c1", "#e76f51"];
        default: {
            const base = ["#ff5c8a", "#ffd166", "#7cf6ff", "#a78bfa", "#7cff9b", "#ff9f43", "#ffffff"];
            return [accent, accent2].filter((c) => HEX.test(c) && c.toLowerCase() !== "#ffffff").concat(base);
        }
    }
}

const KINDS: Record<FinaleVariant, BurstKind[]> = {
    fireworks: ["peony", "peony", "willow", "ring", "crackle", "heart"],
    hearts: ["heart", "heart", "peony", "ring", "willow"],
    lanterns: ["willow", "willow", "peony", "ring", "crackle"],
};

export function GrandFinale({ wish, i, wishId, effect, embed = false }: { wish: WishDataV2; i: Tr; wishId?: string; effect?: string; embed?: boolean }) {
    const [host, setHost] = useState<HTMLElement | null>(null);
    const anchor = useCallback((a: HTMLSpanElement | null) => {
        if (a) setHost((a.closest(".bv") as HTMLElement | null) || a.parentElement || null);
    }, []);
    return (
        <>
            <span ref={anchor} aria-hidden="true" style={{ display: "block", width: 1, height: 1 }} />
            {host && createPortal(<Stage wish={wish} i={i} wishId={wishId} variant={finaleVariant(effect)} embed={embed || host.classList.contains("bv-embed")} host={host} />, host)}
        </>
    );
}

function Stage({ wish, i, wishId, variant, embed, host }: { wish: WishDataV2; i: Tr; wishId?: string; variant: FinaleVariant; embed: boolean; host: HTMLElement }) {
    const anniversary = wish.wishType === "anniversary";
    const rawName = (anniversary ? wish.recipient.coupleName || wish.recipient.name : wish.recipient.name || wish.recipient.nickname) || "";
    const name = rawName.trim();
    const latin = LATIN.test(name);
    const skyName = latin && name.length <= 14 ? name.toUpperCase() : name;
    const skyLine = (anniversary ? i.happyAnniversary : i.happyBirthday).replace(/[!,]/g, "").trim();
    const skyLineUpper = LATIN.test(skyLine) ? skyLine.toUpperCase() : skyLine;
    const age = (() => { const n = parseInt(String(wish.recipient.age || ""), 10); return Number.isFinite(n) && n > 0 && n < 120 ? n : 0; })();
    const photos = useMemo(() => {
        const out: string[] = [];
        for (const b of wish.blocks) if (b.type === "photos") for (const m of b.config.items || []) if (m.type === "photo" && m.url) out.push(m.url);
        return out.slice(0, 6);
    }, [wish.blocks]);

    const [phase, setPhase] = useState<Phase>("ready");
    const [count, setCount] = useState<number | null>(null);
    const [blown, setBlown] = useState(false);
    const [mic, setMic] = useState<"off" | "asking" | "on" | "denied">("off");
    const [muted, setMuted] = useState(() => isMutedPref());
    const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const [balloons, setBalloons] = useState(false);
    const [cardMsg, setCardMsg] = useState("");
    const [popKey, setPopKey] = useState({ left: 0, right: 0 });
    // Ask the recipient for a quick review at the very end (real links only; also visible in local dev demos)
    const [showReview, setShowReview] = useState(() => (!!wishId || process.env.NODE_ENV !== "production") && shouldAskReview("recipient", wishId));

    const skyRef = useRef<HTMLCanvasElement>(null);
    const frontRef = useRef<HTMLCanvasElement>(null);
    const fwRef = useRef<Fireworks | null>(null);
    const sfxRef = useRef<Sfx | null>(null);
    const timers = useRef<number[]>([]);
    const loop = useRef<number | null>(null);
    const micStop = useRef<() => void>(() => {});
    const lastBoom = useRef(0);
    const lastWhistle = useRef(0);
    const lastBuzz = useRef(0);
    const tierRef = useRef<Tier>("mid");
    const blownRef = useRef(false);
    const tuneRef = useRef<ReturnType<Sfx["birthdayTune"]> | null>(null);
    const [singing, setSinging] = useState(false);

    const later = useCallback((ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
    const clearTimers = useCallback(() => {
        timers.current.forEach((t) => clearTimeout(t)); timers.current = [];
        if (loop.current) { clearInterval(loop.current); loop.current = null; }
        tuneRef.current?.stop(0.4); tuneRef.current = null;
    }, []);

    const fontFamily = useMemo(() => {
        if (typeof window === "undefined") return "sans-serif";
        const v = getComputedStyle(host).getPropertyValue("--v-display").trim();
        return v || "system-ui, sans-serif";
    }, [host]);

    // engine
    useEffect(() => {
        let tier: Tier = detectTier();
        if (embed && tier === "high") tier = "mid";
        tierRef.current = tier;
        if (reduced || !skyRef.current || !frontRef.current) return;
        const cs = getComputedStyle(host);
        const palette = paletteFor(wish.look.theme, wish.look.presentationStyle, variant, cs.getPropertyValue("--v-accent").trim(), cs.getPropertyValue("--v-accent2").trim());
        const fw = new Fireworks(skyRef.current, frontRef.current, {
            palette, tier, accent: cs.getPropertyValue("--v-accent").trim(),
            onLaunch: (x) => {
                const now = performance.now();
                if (now - lastWhistle.current < 220) return;
                lastWhistle.current = now;
                sfxRef.current?.whistle(x * 2 - 1, 0.95);
            },
            onBurst: (x, _y, size, kind) => {
                const now = performance.now();
                if (now - lastBoom.current > 90) {
                    lastBoom.current = now;
                    const s = sfxRef.current;
                    if (s) {
                        s.boom(x * 2 - 1, size);
                        if (kind === "crackle" || kind === "willow") s.crackle(x * 2 - 1, kind === "willow" ? 1.8 : 1.2);
                    }
                }
                if (!embed && now - lastBuzz.current > 140) { lastBuzz.current = now; buzz(size > 1.1 ? 40 : 22); }
            },
        });
        fwRef.current = fw;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __gf?: Fireworks }).__gf = fw; // local perf testing only
        fw.start();
        if (embed) {
            // silent mini show for the wizard preview
            const kick = () => fw.launch(rand(0.2, 0.8), rand(0.16, 0.34), KINDS[variant][Math.floor(Math.random() * KINDS[variant].length)], 0.8);
            kick();
            loop.current = window.setInterval(kick, 1300);
        }
        return () => { fw.destroy(); fwRef.current = null; };
    }, [embed, host, reduced, variant, wish.look.theme, wish.look.presentationStyle]);

    // full cleanup on unmount (timers, audio, mic)
    useEffect(() => () => {
        clearTimers();
        micStop.current();
        sfxRef.current?.close();
        sfxRef.current = null;
    }, [clearTimers]);

    // download the real firework / popper / cheer recordings while the "ready" screen is showing
    useEffect(() => { if (!embed) void prefetchFinaleSamples(); }, [embed]);

    /** Fire a party popper from a bottom corner (visual + sound). */
    const pop = useCallback((side: "left" | "right", horn = false) => {
        fwRef.current?.popper(side);
        sfxRef.current?.popper(side === "left" ? -0.8 : 0.8, horn);
        setPopKey((k) => ({ ...k, [side]: k[side] + 1 }));
        buzz(30);
    }, []);

    /* ---------------- acts ---------------- */
    const runAfter = useCallback(() => {
        setPhase("after");
        const fw = fwRef.current;
        if (!fw) return;
        fw.setWarm(true);
        let n = 0;
        loop.current = window.setInterval(() => {
            if (++n > 24) { if (loop.current) clearInterval(loop.current); loop.current = null; return; }
            // gentle bursts at the sides only, so the text in the middle stays readable
            const x = n % 2 ? rand(0.06, 0.24) : rand(0.76, 0.94);
            fw.launch(x, rand(0.08, 0.2), KINDS[variant][n % KINDS[variant].length], 0.6);
        }, 2600);
    }, [variant]);

    const runBarrage = useCallback(() => {
        setPhase("barrage");
        setBalloons(true);
        const fw = fwRef.current, s = sfxRef.current;
        if (fw) {
            fw.fountain(0.07, 7600); fw.fountain(0.93, 7600); fw.chakri(0.5, 6600);
            s?.fountain(true); later(7600, () => s?.fountain(false));
            fw.cannons(190); later(2600, () => fw.cannons(150));
            const kinds = KINDS[variant];
            const many = tierRef.current === "low" ? 1 : tierRef.current === "mid" ? 2 : 3;
            for (let t = 0; t < 7000; t += 330) {
                later(t, () => {
                    const k = 1 + Math.floor(Math.random() * many);
                    for (let j = 0; j < k; j++) fw.launch(rand(0.1, 0.9), rand(0.1, 0.38), kinds[Math.floor(Math.random() * kinds.length)], rand(0.9, 1.35));
                });
            }
            later(3600, () => fw.burst(0.5, 0.3, "heart", 1.35));
        }
        // party poppers firing from both corners while the anaar shower goes up
        ([[0, "left", false], [160, "right", true], [1600, "left", false], [2900, "right", false], [4300, "left", false], [4450, "right", false], [5900, "left", true]] as const)
            .forEach(([ms, side, horn]) => later(ms, () => pop(side, horn)));
        buzz([80, 60, 80, 60, 120]);
        later(500, () => s?.applause(6));
        later(9000, runAfter);
    }, [later, pop, runAfter, variant]);

    const blow = useCallback((method: "mic" | "tap" | "auto") => {
        if (blownRef.current) return;
        blownRef.current = true;
        setBlown(true);
        setSinging(false);
        micStop.current(); micStop.current = () => {};
        fwRef.current?.stopEmitters();
        // if they blew before the song ended, let it fade out gently
        tuneRef.current?.stop(1.4); tuneRef.current = null;
        buzz([60, 40, 60]);
        if (wishId) track("finale_action", { action: `blow_${method}` }, wishId);
        later(1200, runBarrage); // one second of silence before the big moment
    }, [later, runBarrage, wishId]);

    const runCake = useCallback(() => {
        setPhase("cake");
        blownRef.current = false;
        setBlown(false);
        // The full Happy Birthday tune plays as the only background while the candles are lit
        tuneRef.current?.stop(0.3);
        const tune = sfxRef.current?.birthdayTune() ?? null;
        tuneRef.current = tune;
        const songMs = tune ? Math.round(tune.duration * 1000) : 12000;
        setSinging(!!tune);
        if (tune) later(songMs - 1200, () => setSinging(false));
        const fw = fwRef.current;
        if (fw) { fw.fadeText(); fw.fountain(0.06, songMs + 2500); fw.fountain(0.94, songMs + 2500); } // anaar visuals only (no hiss over the song)
        later(300, () => pop("left"));
        later(650, () => pop("right", true));
        later(songMs + 2500, () => blow("auto"));
    }, [blow, later, pop]);

    const runShow = useCallback(() => {
        setPhase("show");
        const fw = fwRef.current;
        if (!fw) { later(4200, runCake); return; } // reduced motion: name shows as text
        const kinds = KINDS[variant];
        later(0, () => { fw.launch(0.3, 0.3, "peony"); fw.launch(0.72, 0.26, "peony"); });
        later(1000, () => { fw.launch(0.2, 0.22, "ring"); fw.launch(0.5, 0.18, "crackle", 1.2); fw.launch(0.8, 0.3, kinds[0]); });
        later(2200, () => { fw.launch(0.35, 0.2, "willow", 1.2); fw.launch(0.65, 0.24, variant === "fireworks" ? "ring" : kinds[0]); });
        later(3300, () => { fw.launch(0.5, 0.22, "heart", 1.15); fw.launch(0.15, 0.32, "crackle"); fw.launch(0.85, 0.3, "crackle"); });
        later(4700, () => fw.writeText([skyLineUpper, skyName], { font: `800 10px ${fontFamily}`, colors: variant === "hearts" ? ["#ffd1e1", "#ff8fb8", "#ff6fa5"] : ["#ffe7a3", "#ffd166", "#ffb347", "#fff1c1"], holdMs: 4300, top: 0.13, bottom: 0.52 }));
        [6900, 8100, 9200].forEach((ms, k) => later(ms, () => fw.launch(k % 2 ? 0.9 : 0.1, rand(0.08, 0.16), kinds[k % kinds.length], 0.75)));
        later(10200, () => fw.burst(0.5, 0.66, "heart", 1.05));
        later(11400, runCake);
    }, [fontFamily, later, runCake, skyLineUpper, skyName, variant]);

    const runCountdown = useCallback(() => {
        clearTimers();
        fwRef.current?.setWarm(false);
        fwRef.current?.clear();
        setBalloons(false);
        setPhase("countdown");
        setCount(null);
        const s = sfxRef.current;
        [0, 650, 1200].forEach((ms) => later(ms, () => { s?.heartbeat(); buzz([35, 110, 25]); }));
        [3, 2, 1].forEach((n, k) => later(1800 + k * 900, () => { setCount(n); s?.hit(false); buzz(45); }));
        later(1800 + 2700, () => { setCount(null); s?.hit(true); runShow(); });
    }, [clearTimers, later, runShow]);

    const begin = () => {
        if (!sfxRef.current) {
            sfxRef.current = createSfx();
        }
        sfxRef.current?.setMuted(muted);
        if (wishId) track("finale_action", { action: "start" }, wishId);
        runCountdown();
    };

    const replay = () => {
        if (wishId) track("finale_action", { action: "replay" }, wishId);
        runCountdown();
    };

    const toggleMute = () => {
        const m = !muted;
        setMuted(m); setMutedPref(m);
        sfxRef.current?.setMuted(m);
    };

    const startMic = async () => {
        setMic("asking");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
            const W = window as Window & { webkitAudioContext?: typeof AudioContext };
            const own = !sfxRef.current;
            const ac = sfxRef.current?.ctx || new (window.AudioContext || W.webkitAudioContext!)();
            const an = ac.createAnalyser(); an.fftSize = 512;
            const src = ac.createMediaStreamSource(stream); src.connect(an);
            const buf = new Uint8Array(an.fftSize);
            let raf = 0, loud = 0;
            const tick = () => {
                an.getByteTimeDomainData(buf);
                let sum = 0;
                for (let k = 0; k < buf.length; k++) { const v = (buf[k] - 128) / 128; sum += v * v; }
                loud = Math.sqrt(sum / buf.length) > 0.18 ? loud + 1 : Math.max(0, loud - 1);
                if (loud > 6) { blow("mic"); return; }
                raf = requestAnimationFrame(tick);
            };
            tick();
            micStop.current = () => { cancelAnimationFrame(raf); src.disconnect(); stream.getTracks().forEach((t) => t.stop()); if (own) ac.close().catch(() => {}); };
            setMic("on");
        } catch {
            setMic("denied");
        }
    };

    const thanks = () => {
        if (wishId) track("finale_action", { action: "thanks" }, wishId);
        const text = anniversary
            ? "🥹❤️ Thank you so much for our anniversary surprise! We loved every bit of it."
            : "🥹❤️ Thank you so much for my birthday surprise! I loved every bit of it.";
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    };

    const saveCard = async () => {
        if (wishId) track("finale_action", { action: "card" }, wishId);
        const W = 1080, H = 1350;
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const g = c.getContext("2d")!;
        const bg = g.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#120a2a"); bg.addColorStop(0.6, "#0a0618"); bg.addColorStop(1, "#1d0f24");
        g.fillStyle = bg; g.fillRect(0, 0, W, H);
        const fw = fwRef.current;
        if (fw) {
            const snap = fw.snapshot();
            const sc = Math.max(W / snap.width, H / snap.height);
            g.drawImage(snap, (W - snap.width * sc) / 2, (H - snap.height * sc) / 2, snap.width * sc, snap.height * sc);
        }
        g.textAlign = "center"; g.textBaseline = "middle";
        g.shadowColor = "rgba(255,190,90,.8)"; g.shadowBlur = 40;
        g.fillStyle = "#ffe7a3"; g.font = `800 76px ${fontFamily}`;
        g.fillText(skyLineUpper, W / 2, H * 0.4, W * 0.9);
        let fs = 190; g.font = `800 ${fs}px ${fontFamily}`;
        while (g.measureText(skyName).width > W * 0.88 && fs > 60) { fs -= 8; g.font = `800 ${fs}px ${fontFamily}`; }
        g.fillStyle = "#ffffff"; g.fillText(skyName, W / 2, H * 0.52);
        g.shadowBlur = 0;
        g.fillStyle = "rgba(255,255,255,.85)"; g.font = `700 44px ${fontFamily}`;
        g.fillText(`${i.withAllMyLove.replace(/[\s,.;:!]+$/, "")} ❤️`, W / 2, H * 0.64, W * 0.9);
        g.fillStyle = "rgba(255,255,255,.55)"; g.font = `700 30px ${fontFamily}`;
        g.fillText("🎂 birthdaywisher.fun", W / 2, H - 70);
        const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
        if (!blob) return;
        const fileName = `${anniversary ? "happy-anniversary" : "happy-birthday"}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "memory"}.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
        if (nav.canShare?.({ files: [file] })) {
            try { await nav.share({ files: [file], title: skyLine }); setCardMsg("Saved ❤️"); return; } catch { /* cancelled: fall back to download */ }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setCardMsg("Saved to your downloads ❤️");
    };

    const rise = variant === "hearts" ? ["💗", "❤️", "💕", "🎈"] : variant === "lanterns" ? ["🏮", "🏮", "🪔", "🎈"] : ["🎈", "🎈", "🎁", "🎉"];
    const love = i.withAllMyLove.replace(/[\s,.;:!]+$/, "");

    return (
        <div className={`gf ${embed ? "gf-embed" : ""} gf-p-${phase}`} role="region" aria-label={`${skyLine} ${name}`}>
            <div className="gf-sky" aria-hidden="true" />
            <canvas ref={skyRef} className="gf-canvas" aria-hidden="true" />
            <Skyline />
            <canvas ref={frontRef} className="gf-canvas gf-front" aria-hidden="true" />
            <p className="gf-sr" aria-live="polite">{count ? String(count) : phase === "show" || phase === "after" ? `${skyLine}, ${name}!` : ""}</p>

            {!embed && phase !== "ready" && (
                <button type="button" className="gf-mute" onClick={toggleMute} aria-label={muted ? "Turn sound on" : "Mute"}>{muted ? "🔇" : "🔊"}</button>
            )}

            {(embed || (reduced && phase === "show")) && (
                <div className="gf-static is-on" aria-hidden="true">
                    <span>{skyLine}</span>
                    <b>{name}</b>
                </div>
            )}

            {!embed && phase === "ready" && (
                <div className="gf-ready">
                    <p className="gf-kicker">One last surprise…</p>
                    <h2 className="gf-title">Your celebration is ready</h2>
                    <button type="button" className="gf-go" onClick={begin}>
                        <span className="gf-pulse" aria-hidden="true" />🎆 Light up the sky
                    </button>
                    <p className="gf-hint">🔊 Turn your sound on for the full celebration</p>
                </div>
            )}

            {!embed && phase === "countdown" && (
                <div className="gf-count" aria-hidden="true">{count !== null && <span key={count}>{count}</span>}</div>
            )}

            {!embed && phase === "cake" && (
                <div className="gf-cake-wrap">
                    <p className="gf-kicker">{anniversary ? "Hold hands… make a wish together 💞" : "Close your eyes… make a wish 🎂"}</p>
                    {singing && !blown && <p className="gf-hint gf-strong gf-sing" aria-live="polite">🎶 Happy birthday to you… sing along!</p>}
                    <Cake age={age} blown={blown} onBlow={() => blow("tap")} />
                    {!blown ? (
                        <div className="gf-cake-actions">
                            {mic === "on"
                                ? <p className="gf-hint gf-strong">🎤 Listening… blow into your phone!</p>
                                : <button type="button" className="gf-btn" onClick={startMic} disabled={mic === "asking"}>🎤 Blow into the mic</button>}
                            <button type="button" className="gf-link" onClick={() => blow("tap")}>{mic === "denied" ? "Mic blocked: tap here to blow 👆" : "👆 Or tap here to blow"}</button>
                        </div>
                    ) : (
                        <p className="gf-hint gf-strong">🤫 …</p>
                    )}
                </div>
            )}

            {!embed && (phase === "cake" || phase === "barrage") && (
                <div className="gf-poppers" aria-hidden="true">
                    <span key={`l${popKey.left}`} className={`gf-popper is-left ${popKey.left ? "is-fire" : ""}`}>🎉</span>
                    <span key={`r${popKey.right}`} className={`gf-popper is-right ${popKey.right ? "is-fire" : ""}`}>🎉</span>
                </div>
            )}

            {balloons && !embed && (
                <div className="gf-rise" aria-hidden="true">
                    {Array.from({ length: 14 }, (_, n) => (
                        <span key={n} style={{ left: `${(n * 37 + 7) % 96}%`, animationDelay: `${(n % 7) * 0.45}s`, animationDuration: `${7 + (n % 4)}s`, fontSize: 26 + ((n * 9) % 22) }}>{rise[n % rise.length]}</span>
                    ))}
                </div>
            )}

            {!embed && phase === "after" && (
                <div className="gf-after">
                    <div className={`gf-ring ${photos.length ? "" : "is-empty"}`}>
                        {photos.map((src, n) => {
                            const a = (n / photos.length) * Math.PI * 2 - Math.PI / 2;
                            return (
                                <span key={src + n} className="gf-polaroid" style={{ left: `${50 + Math.cos(a) * 40}%`, top: `${50 + Math.sin(a) * 40}%`, animationDelay: `${0.15 * n}s`, ["--r" as string]: `${(n % 2 ? 1 : -1) * (4 + (n % 3) * 3)}deg` }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" loading="lazy" />
                                </span>
                            );
                        })}
                        <div className="gf-ring-name">
                            <small>{skyLine}</small>
                            <b>{name}</b>
                        </div>
                    </div>
                    <p className="gf-love">{love} ❤️</p>
                    <div className="gf-actions">
                        <button type="button" className="gf-glass" onClick={replay}>🔁 Watch the celebration again</button>
                        <button type="button" className="gf-glass" onClick={thanks}>💌 Send a thank-you</button>
                        <button type="button" className="gf-glass" onClick={saveCard}>📸 Save memory card</button>
                        {cardMsg && <p className="gf-hint">{cardMsg}</p>}
                    </div>
                    {wishId && <KeepAliveCard wishId={wishId} surface="finale" variant="dark" />}
                    <Link className="gf-make" href="/?ref=wish" onClick={() => track("wish_make_own", undefined, wishId)}>🎁 Make a surprise like this for someone</Link>
                    {showReview && <ReviewPrompt who="recipient" wishId={wishId} mode="inline" onClose={() => setShowReview(false)} />}
                </div>
            )}
        </div>
    );
}

function Skyline() {
    // simple city silhouette with a few warm windows
    const b: Array<[number, number, number]> = [[0, 70, 46], [44, 110, 40], [82, 60, 34], [114, 140, 30], [142, 90, 44], [184, 160, 26], [208, 100, 40], [246, 72, 36], [280, 130, 34], [312, 84, 48], [358, 150, 28], [384, 96, 44], [426, 64, 40], [464, 120, 36]];
    return (
        <svg className="gf-skyline" viewBox="0 0 500 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            {b.map(([x, h, w], k) => (
                <g key={k}>
                    <rect x={x} y={170 - h} width={w} height={h} fill="#06040f" />
                    {Array.from({ length: Math.floor(h / 22) }, (_, r) => (k + r) % 3 === 0 && <rect key={r} x={x + 8} y={170 - h + 10 + r * 22} width="6" height="8" fill="#ffcf6b" opacity=".55" />)}
                </g>
            ))}
        </svg>
    );
}

function Cake({ age, blown, onBlow }: { age: number; blown: boolean; onBlow: () => void }) {
    const digits = age ? String(age).split("") : [];
    const candles = digits.length ? digits.length : 5;
    const span = digits.length ? 54 : 26;
    const startX = 160 - ((candles - 1) * span) / 2;
    return (
        <button type="button" className="gf-cake" onClick={onBlow} aria-label={blown ? "Candles blown out" : "Tap the cake to blow out the candles"} disabled={blown}>
            <svg viewBox="0 0 320 300" width="300" height="281">
                <defs>
                    <linearGradient id="gf-t1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff8fb8" /><stop offset="1" stopColor="#ff5c8a" /></linearGradient>
                    <linearGradient id="gf-t2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff1e6" /><stop offset="1" stopColor="#ffd9c2" /></linearGradient>
                    <linearGradient id="gf-t3" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b48cff" /><stop offset="1" stopColor="#7c5cff" /></linearGradient>
                    <radialGradient id="gf-glow"><stop offset="0" stopColor="#ffd166" stopOpacity=".9" /><stop offset="1" stopColor="#ffd166" stopOpacity="0" /></radialGradient>
                </defs>
                {/* plate */}
                <ellipse cx="160" cy="284" rx="150" ry="12" fill="rgba(255,255,255,.18)" />
                {/* bottom tier */}
                <rect x="30" y="206" width="260" height="76" rx="16" fill="url(#gf-t3)" />
                <path d="M30 222 q 16 16 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".9" />
                {/* middle tier */}
                <rect x="62" y="148" width="196" height="62" rx="14" fill="url(#gf-t2)" />
                <path d="M62 162 q 14 14 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0" fill="none" stroke="#ff8fb8" strokeWidth="7" strokeLinecap="round" />
                {/* top tier */}
                <rect x="92" y="98" width="136" height="54" rx="12" fill="url(#gf-t1)" />
                <path d="M92 110 q 11.3 12 22.6 0 t 22.6 0 t 22.6 0 t 22.6 0 t 22.6 0 t 22.6 0" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                {[56, 112, 168, 224, 264].map((x, k) => <circle key={k} cx={x} cy={256 - (k % 2) * 8} r="5" fill={["#ffd166", "#2ed8b6", "#fff", "#ffd166", "#ff5c8a"][k]} />)}
                {/* candles */}
                {Array.from({ length: candles }, (_, k) => {
                    const x = startX + k * span;
                    return (
                        <g key={k}>
                            {digits.length ? (
                                <text x={x} y="96" textAnchor="middle" fontSize="64" fontWeight="900" fill="#ffd166" stroke="#ff5c8a" strokeWidth="3" fontFamily="system-ui, sans-serif">{digits[k]}</text>
                            ) : (
                                <rect x={x - 4} y="56" width="8" height="42" rx="3" fill={["#7c5cff", "#2ed8b6", "#ffd166", "#ff5c8a", "#7cf6ff"][k % 5]} />
                            )}
                            {!blown ? (
                                <g className="gf-flame" style={{ transformOrigin: `${x}px ${digits.length ? 44 : 52}px` }}>
                                    <circle cx={x} cy={digits.length ? 32 : 40} r="16" fill="url(#gf-glow)" />
                                    <path d={`M${x} ${digits.length ? 14 : 22} C ${x - 9} ${digits.length ? 29 : 37}, ${x - 7} ${digits.length ? 38 : 46}, ${x} ${digits.length ? 41 : 49} C ${x + 7} ${digits.length ? 38 : 46}, ${x + 9} ${digits.length ? 29 : 37}, ${x} ${digits.length ? 14 : 22} Z`} fill="#ff9f43" />
                                    <path d={`M${x} ${digits.length ? 24 : 32} C ${x - 4} ${digits.length ? 32 : 40}, ${x - 3} ${digits.length ? 37 : 45}, ${x} ${digits.length ? 39 : 47} C ${x + 3} ${digits.length ? 37 : 45}, ${x + 4} ${digits.length ? 32 : 40}, ${x} ${digits.length ? 24 : 32} Z`} fill="#fff3b0" />
                                </g>
                            ) : (
                                <path d={`M${x} ${digits.length ? 40 : 50} q 7 -12 0 -22 q -7 -10 2 -20`} stroke="#d1d5db" strokeWidth="3" fill="none" className="gf-smoke" />
                            )}
                        </g>
                    );
                })}
            </svg>
        </button>
    );
}
