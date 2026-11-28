"use client";

import "./giveaway.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bunting } from "@/components/party/Decor";
import { PartyFooter } from "@/components/party/PartyFooter";
import { burst } from "@/components/party/interactions";
import { track } from "@/lib/track";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/site";
import {
    GIVEAWAY_HASHTAG,
    GIVEAWAY_NAME,
    GIVEAWAY_REGION_PACKS,
    getGiveawayRegionPack,
    getPrizeInfo,
    resolveGiveawayRegion,
    type GiveawayConfig,
    type GiveawayPrizeId,
    type GiveawayRegion,
    type PublicGiveawayEntry,
} from "@/lib/giveawayTypes";

const REEL_HOOKS = [
    {
        tag: "🎥 💀 Cuppy AI Roast (+15 In-Person Bonus!)",
        hook: "POV: Asking AI to brutally roast my best friend on their birthday 💀🧁",
        tip: "Open /create → tap Cuppy AI → film your or your bestie's live reaction to the savage lines for +15 In-Person Bonus pts!",
    },
    {
        tag: "🎥 🎯 Couple / Bestie Loyalty Test (+15 Bonus!)",
        hook: "Testing how well my bestie / partner actually knows me 🎯❤️",
        tip: "Add Birthday Quiz + Fake HTTP 410 Expired Link Prank and record their real reaction on camera (15–30 sec)!",
    },
    {
        tag: "🎥 😭 Zero-Budget Emotional Surprise (+15 Bonus!)",
        hook: "POV: Zero budget, so I built a custom interactive birthday surprise instead 🎂🎈",
        tip: "Film Hold-My-Hand Heartbeat Sync + Blowing Candles on phone mic + their real reaction in 15–30s!",
    },
    {
        tag: "🙈 Faceless Aesthetic Edit (Needs High Creativity!)",
        hook: "Found a free website where birthday surprises self-destruct in 10 hours ⏳🎁",
        tip: "Camera shy? Faceless 15–30s Reels are allowed, but they do not get the +15 In-Person bonus — so you will need standout editing & creativity to compete!",
    },
];

function PrizePhoto({ src, alt }: { src: string; alt: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className="gw-prize-img"
            loading="eager"
            decoding="async"
        />
    );
}

function useGiveawayClock(startsAtIso: string, endsAtIso: string) {
    const [state, setState] = useState<{
        mode: "upcoming" | "live" | "ended";
        d: number;
        h: number;
        m: number;
        s: number;
    } | null>(null);

    useEffect(() => {
        const calc = () => {
            const now = Date.now();
            const startMs = Date.parse(startsAtIso);
            const endMs = Date.parse(endsAtIso);
            if (Number.isFinite(startMs) && now < startMs) {
                const diff = Math.max(0, startMs - now);
                return {
                    mode: "upcoming" as const,
                    d: Math.floor(diff / 86_400_000),
                    h: Math.floor((diff % 86_400_000) / 3_600_000),
                    m: Math.floor((diff % 3_600_000) / 60_000),
                    s: Math.floor((diff % 60_000) / 1000),
                };
            }
            const diff = Math.max(0, endMs - now);
            return {
                mode: diff <= 0 ? ("ended" as const) : ("live" as const),
                d: Math.floor(diff / 86_400_000),
                h: Math.floor((diff % 86_400_000) / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            };
        };
        setState(calc());
        const iv = window.setInterval(() => setState(calc()), 1000);
        return () => window.clearInterval(iv);
    }, [startsAtIso, endsAtIso]);

    return state ?? { mode: "live" as const, d: 14, h: 0, m: 0, s: 0 };
}

export function GiveawayClient({
    initialConfig,
    initialEntries,
    initialFinalists,
    initialRegion = "IN",
    serverResolvedGeo = false,
}: {
    initialConfig: GiveawayConfig;
    initialEntries: PublicGiveawayEntry[];
    initialFinalists: PublicGiveawayEntry[];
    initialRegion?: GiveawayRegion;
    serverResolvedGeo?: boolean;
}) {
    const [config] = useState(initialConfig);
    const [region, setRegion] = useState<GiveawayRegion>(initialRegion);
    const [entries, setEntries] = useState<PublicGiveawayEntry[]>(initialEntries);
    const [finalists, setFinalists] = useState<PublicGiveawayEntry[]>(initialFinalists);

    const [igHandle, setIgHandle] = useState("");
    const [reelUrl, setReelUrl] = useState("");
    const [email, setEmail] = useState("");
    const [prizeChoice, setPrizeChoice] = useState<GiveawayPrizeId>("amazon_2000");
    const [isInPerson, setIsInPerson] = useState(true);
    const [sentCollab, setSentCollab] = useState(false);
    const [sharedStory, setSharedStory] = useState(false);
    const [wishLink, setWishLink] = useState("");
    const [note, setNote] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [lockedEntry, setLockedEntry] = useState<PublicGiveawayEntry | null>(null);
    const [emailSentOk, setEmailSentOk] = useState(false);
    const [copiedHook, setCopiedHook] = useState<number | null>(null);
    const [copiedFlex, setCopiedFlex] = useState(false);
    const [votedId, setVotedId] = useState<number | null>(null);
    const [voteErr, setVoteErr] = useState("");

    const formRef = useRef<HTMLDivElement>(null);
    const cd = useGiveawayClock(config.startsAt, config.endsAt);
    const isUpcoming = cd.mode === "upcoming";

    useEffect(() => {
        track("giveaway_view", { phase: config.phase });
        try {
            const savedVote = window.localStorage.getItem("bw_gw_voted");
            if (savedVote) setVotedId(Number(savedVote));
            if (!serverResolvedGeo) {
                const previewCountry = new URLSearchParams(window.location.search).get("previewCountry");
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
                const detected = resolveGiveawayRegion(previewCountry, tz).region;
                setRegion(detected);
            }
        } catch {
            // ignore storage errors
        }
    }, [config.phase, serverResolvedGeo]);

    const pack = useMemo(() => getGiveawayRegionPack(region), [region]);
    const selectedPrize = useMemo(() => getPrizeInfo(prizeChoice, region), [prizeChoice, region]);
    const claimedActionPts = 10 + (isInPerson ? 15 : 0) + (sentCollab ? 5 : 0) + (sharedStory ? 5 : 0);

    const pickPrizeAndScroll = (id: GiveawayPrizeId) => {
        setPrizeChoice(id);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const copyHook = async (idx: number, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedHook(idx);
            window.setTimeout(() => setCopiedHook(null), 1800);
        } catch {
            // ignore
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setErrorMsg("");
        setSubmitting(true);

        try {
            let tz = "";
            try {
                tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            } catch {
                // ignore
            }
            const res = await fetch("/api/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "enter",
                    igHandle,
                    reelUrl,
                    email,
                    prizeChoice,
                    region,
                    tz,
                    isInPerson,
                    sentCollab,
                    sharedStory,
                    wishLink,
                    note,
                    emailOptIn: true,
                }),
            });
            const json = (await res.json()) as {
                ok?: boolean;
                entry?: PublicGiveawayEntry;
                emailSent?: boolean;
                error?: string;
            };

            if (!res.ok || !json.ok || !json.entry) {
                setErrorMsg(json.error || "Could not submit your Reel right now. Please check the link & try again.");
                return;
            }

            setLockedEntry(json.entry);
            setEmailSentOk(Boolean(json.emailSent));
            setEntries((prev) => [json.entry!, ...prev]);
            track("giveaway_submit", { prize: prizeChoice, collab: sentCollab, story: sharedStory });
            burst(window.innerWidth / 2, window.innerHeight * 0.45, 190);
        } catch {
            setErrorMsg("Network hiccup — please tap Submit once more.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (entryId: number) => {
        if (votedId) return;
        setVoteErr("");
        let voterId = "";
        try {
            voterId = window.localStorage.getItem("bw_gw_vid") || "";
            if (!voterId) {
                voterId = Math.random().toString(36).slice(2, 12);
                window.localStorage.setItem("bw_gw_vid", voterId);
            }
        } catch {
            // ignore
        }

        try {
            const res = await fetch("/api/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "vote", entryId, voterId }),
            });
            const json = (await res.json()) as { ok?: boolean; publicVotes?: number; error?: string };
            if (!res.ok || !json.ok) {
                setVoteErr(json.error || "Could not record vote.");
                return;
            }
            setVotedId(entryId);
            try {
                window.localStorage.setItem("bw_gw_voted", String(entryId));
            } catch {
                // ignore
            }
            setFinalists((prev) =>
                prev.map((f) => (f.id === entryId ? { ...f, publicVotes: json.publicVotes ?? f.publicVotes + 1 } : f)),
            );
            setEntries((prev) =>
                prev.map((f) => (f.id === entryId ? { ...f, publicVotes: json.publicVotes ?? f.publicVotes + 1 } : f)),
            );
            track("giveaway_vote", { entryId });
            burst(window.innerWidth / 2, window.innerHeight * 0.5, 90);
        } catch {
            setVoteErr("Network error while voting. Please try again.");
        }
    };

    const copyStoryFlex = async () => {
        if (!lockedEntry) return;
        const txt = `Just locked my VIP Pass #${lockedEntry.ticketCode} in ${GIVEAWAY_NAME}! 🎟️ Win ${pack.amountDisplay} gear or Amazon Cash — join at ${SITE_URL}/giveaway ${INSTAGRAM_HANDLE} ${GIVEAWAY_HASHTAG}`;
        try {
            await navigator.clipboard.writeText(txt);
            setCopiedFlex(true);
            window.setTimeout(() => setCopiedFlex(false), 2200);
        } catch {
            // ignore
        }
    };

    return (
        <div className="party gw-page">
            {/* ① FESTIVAL HERO STAGE */}
            <header className="gw-hero">
                <Bunting />
                <div className="gw-hero-confetti" aria-hidden="true" />
                <div className="bw-container gw-hero-in">
                    <div className="gw-live-pill">
                        <span className="gw-live-dot" aria-hidden="true" />
                        <span>
                            {config.phase === "judging" || config.phase === "voting"
                                ? "⚖️ REELFEST FINAL 100-POINT SCORING IN PROGRESS!"
                                : config.phase === "ended"
                                  ? `🏆 REELFEST CHAMPION: ${config.winnerHandle || "CONGRATS!"}`
                                  : isUpcoming
                                    ? "⏳ BIRTHDAYWISHER REELFEST · STARTS TONIGHT 12:00 AM IST"
                                    : "🎉 BIRTHDAYWISHER REELFEST · SEASON 1 LIVE"}
                        </span>
                    </div>

                    <h1>
                        BirthdayWisher ReelFest:<br />
                        <span className="gw-hero-grad">Drop a 15–30s Reel, Win {pack.amountDisplay}!</span> 🎁
                    </h1>

                    <p className="gw-hero-sub">
                        Create a free surprise on <b>birthdaywisher.fun</b>, post an original <b>15–30 sec Reel</b> with <b>{GIVEAWAY_HASHTAG}</b> — film <b>In-Person / Real Reaction for +15 Direct Bonus Pts</b> (faceless Reels may score lower unless creativity is exceptional!) — and pick your {pack.amountDisplay} reward!
                    </p>

                    {config.phase !== "ended" && (
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#ffd93d", marginBottom: 8 }}>
                                {isUpcoming ? "⏳ ReelFest Opens Tonight at 12:00 AM IST In:" : "⏰ ReelFest Season 1 Closes In:"}
                            </div>
                            <div className="gw-clock" role="timer" aria-label={isUpcoming ? "Time until giveaway starts" : "Time left to enter"}>
                                <div className="gw-clock-box">
                                    <span className="gw-clock-num">{String(cd.d).padStart(2, "0")}</span>
                                    <span className="gw-clock-lbl">Days</span>
                                </div>
                                <div className="gw-clock-box">
                                    <span className="gw-clock-num">{String(cd.h).padStart(2, "0")}</span>
                                    <span className="gw-clock-lbl">Hours</span>
                                </div>
                                <div className="gw-clock-box">
                                    <span className="gw-clock-num">{String(cd.m).padStart(2, "0")}</span>
                                    <span className="gw-clock-lbl">Mins</span>
                                </div>
                                <div className="gw-clock-box">
                                    <span className="gw-clock-num">{String(cd.s).padStart(2, "0")}</span>
                                    <span className="gw-clock-lbl">Secs</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="gw-hero-ctas">
                        <a
                            href="#submit-reel"
                            className="bw-btn gw-btn-gold"
                            onClick={() => track("cta_click", { label: "giveaway_hero_submit" })}
                        >
                            🎟️ Submit Your Reel Link ↓
                        </a>
                        <Link
                            href="/create?via=giveaway"
                            className="bw-btn gw-btn-dark-ghost"
                            onClick={() => track("cta_click", { label: "giveaway_hero_create" })}
                        >
                            🎂 Make a Free Surprise First (60s) →
                        </Link>
                    </div>

                    <div className="gw-hero-pills">
                        <span>{pack.flag} {region === "IN" ? "India: ₹2,000 Amazon.in Delivery" : `Worldwide: Instant ${pack.amountDisplay} Digital Card`}</span>
                        <span>🎬 15–30 Sec Original Reel</span>
                        <span>🎥 +15 Pts Direct In-Person Bonus</span>
                        <span>⚖️ Open 100-Point Scoreboard</span>
                        {entries.length > 0 && <span>🔥 {entries.length} Reels Entered</span>}
                    </div>
                </div>
            </header>

            {/* WINNER BANNER IF ENDED */}
            {config.phase === "ended" && config.winnerHandle && (
                <section className="bw-section" style={{ paddingBottom: 20 }}>
                    <div className="bw-container">
                        <div className="gw-fair-box" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 46 }}>🏆</div>
                            <h2 style={{ fontSize: 32, margin: "8px 0 6px" }}>
                                Official Winner: <span className="bw-hl">{config.winnerHandle}</span> ({config.winnerTicket})
                            </h2>
                            <p style={{ color: "var(--p-muted)", fontWeight: 700, marginBottom: 16 }}>
                                Prize Won: {getPrizeInfo(config.winnerPrize).emoji} {getPrizeInfo(config.winnerPrize).title}
                            </p>
                            {config.winnerReelUrl && (
                                <a href={config.winnerReelUrl} target="_blank" rel="noopener noreferrer" className="bw-btn bw-btn-primary bw-btn-sm">
                                    🎬 Watch Winning Reel ↗
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ② WINNER PICKS PRIZE (4 IN INDIA · SINGLE $25 CARD OUTSIDE INDIA) */}
            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <span className="bw-eyebrow">
                            {region === "IN" ? "🎁 WINNER PICKS ANY 1 OF 4" : "🌍 INTERNATIONAL CREATOR REWARD"}
                        </span>
                        <h2 style={{ marginTop: 12 }}>
                            {region === "IN" ? "Choose Your ₹2,000 Reward" : "$25 USD Official Gift Card"}
                        </h2>
                        <p>{pack.deliverySubtext}</p>

                        <div className="gw-region-switch" role="tablist" aria-label="Prize region">
                            {(["IN", "GLOBAL"] as GiveawayRegion[]).map((r) => {
                                const rp = GIVEAWAY_REGION_PACKS[r];
                                const on = region === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        role="tab"
                                        aria-selected={on}
                                        className={`gw-region-btn ${on ? "is-on" : ""}`}
                                        onClick={() => {
                                            setRegion(r);
                                            if (r === "GLOBAL") setPrizeChoice("amazon_2000");
                                        }}
                                    >
                                        {rp.flag} {rp.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`gw-prizes-grid ${pack.prizes.length === 1 ? "is-single" : ""}`}>
                        {pack.prizes.map((p) => {
                            const isPicked = region === "GLOBAL" || prizeChoice === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`gw-prize-card ${isPicked ? "is-picked" : ""}`}
                                    style={{ ["--accent" as string]: p.accent }}
                                    onClick={() => pickPrizeAndScroll(p.id)}
                                >
                                    <div className="gw-prize-top">
                                        <span className="gw-prize-badge">{p.badge}</span>
                                        <span className="gw-prize-val">{p.valueLabel}</span>
                                    </div>
                                    <div className="gw-prize-art">
                                        <PrizePhoto src={p.imageSrc} alt={p.title} />
                                    </div>
                                    <h3>{p.emoji} {p.title}</h3>
                                    <p>{p.subtitle}</p>
                                    <span className="gw-prize-pick-btn">
                                        {region === "GLOBAL"
                                            ? "✓ $25 Gift Card Included — Enter Below ↓"
                                            : isPicked
                                              ? "✓ Selected on Your Ticket"
                                              : "Select This Prize →"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ③ NO BIRTHDAY TODAY? 4 INSTANT REEL HOOKS */}
            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <span className="bw-eyebrow">🎬 15–30 SEC REEL IDEAS · +15 IN-PERSON BONUS</span>
                        <h2 style={{ marginTop: 12 }}>No Friend&apos;s Birthday Today? Film One of These!</h2>
                        <p>Show real face / friend reaction on camera for a <b>direct +15 pt bonus</b> — faceless screen-records get fewer base points, so faceless creators need standout creativity!</p>
                    </div>

                    <div className="gw-hooks-grid">
                        {REEL_HOOKS.map((item, idx) => (
                            <div key={idx} className="gw-hook-card">
                                <span className="gw-hook-tag">{item.tag}</span>
                                <p className="gw-hook-quote">&ldquo;{item.hook}&rdquo;</p>
                                <p className="gw-hook-tip">{item.tip}</p>
                                <div className="gw-hook-actions">
                                    <button
                                        type="button"
                                        className="gw-copy-btn"
                                        onClick={() => copyHook(idx, item.hook)}
                                    >
                                        {copiedHook === idx ? "Copied Hook ✓" : "📋 Copy Reel Hook"}
                                    </button>
                                    <Link href="/create?via=giveaway_hook" className="bw-btn bw-btn-ghost bw-btn-sm" style={{ padding: "7px 14px", fontSize: 12.5 }}>
                                        Try on Site →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ④ 100% FAIR NO-WHEEL 100-POINT WINNER FORMULA */}
            <section className="bw-section">
                <div className="bw-container">
                    <div className="gw-fair-box">
                        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
                            <span className="bw-eyebrow" style={{ borderColor: "var(--p-grape)", color: "var(--p-grape)" }}>
                                ⚖️ ZERO FAKE SPIN WHEEL · 100-POINT FAIR SCOREBOARD
                            </span>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", margin: "12px 0 8px" }}>
                                How the Winner Is Chosen (Out of 100 Points)
                            </h2>
                            <p style={{ color: "var(--p-muted)", fontWeight: 600, margin: 0 }}>
                                Real effort &amp; creativity beat rigged luck. Every entry is manually verified by our team on Instagram and scored openly out of 100 — highest score wins {pack.amountDisplay} directly!
                            </p>
                        </div>

                        <div className="gw-fair-steps">
                            <div className="gw-fair-step">
                                <span className="gw-fair-num">35</span>
                                <h3>Reel + In-Person Bonus (35 Pts)</h3>
                                <p>
                                    <b>+10 pts</b> Valid 15–30s Reel ({GIVEAWAY_HASHTAG}) · <b>+15 pts Direct Bonus</b> for In-Person / Face Reaction · <b>+5 pts</b>{" "}
                                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--p-pink)", fontWeight: 800 }}>
                                        {INSTAGRAM_HANDLE}
                                    </a>{" "}
                                    Collab · <b>+5 pts</b> Story Tag. <i>(Faceless = no +15 bonus, so scores may be lower without standout creativity!)</i>
                                </p>
                            </div>
                            <div className="gw-fair-step">
                                <span className="gw-fair-num">35</span>
                                <h3>Creativity &amp; Editing (0–35 Pts)</h3>
                                <p>
                                    Judged on hook, humour, emotion, editing &amp; how creatively you showcased <b>birthdaywisher.fun</b>. Faceless Reels <b>must</b> bring killer creativity here to compete!
                                </p>
                            </div>
                            <div className="gw-fair-step">
                                <span className="gw-fair-num">30</span>
                                <h3>Real Views &amp; Champion (0–30 Pts)</h3>
                                <p>
                                    Scored on genuine organic views, shares &amp; comments (bought/bot views = instant disqualification). <b>Highest score out of 100 wins {pack.amountDisplay} directly! 🏆</b>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⑤ TOP 5 FINALIST PUBLIC VOTING ARENA (Active in "voting" phase) */}
            {config.phase === "voting" && finalists.length > 0 && (
                <section className="bw-section bw-alt" id="vote-finalists">
                    <div className="bw-container">
                        <div className="bw-section-title">
                            <span className="bw-eyebrow">🗳️ 24-HOUR PUBLIC FINALE POLL</span>
                            <h2 style={{ marginTop: 12 }}>Vote for Your Favourite Finalist Reel!</h2>
                            <p>Watch each shortlisted Reel and cast 1 verified vote — the community picks the ₹2,000 winner!</p>
                        </div>

                        {voteErr && (
                            <p role="alert" style={{ textAlign: "center", color: "#e11d48", fontWeight: 800, marginBottom: 16 }}>
                                {voteErr}
                            </p>
                        )}

                        <div className="gw-entries-grid">
                            {finalists.map((f) => {
                                const p = getPrizeInfo(f.prizeChoice);
                                const isMyVote = votedId === f.id;
                                return (
                                    <div key={f.id} className="gw-entry-card is-finalist">
                                        <div className="gw-entry-head">
                                            <span className="gw-entry-ticket">🏆 Finalist #{f.ticketCode}</span>
                                            <span className="gw-entry-pts">🗳️ {f.publicVotes} Votes</span>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: 20 }}>{f.igHandle}</h3>
                                        {f.note && <p style={{ margin: 0, fontSize: 13.5, color: "var(--p-muted)", fontWeight: 600 }}>&ldquo;{f.note}&rdquo;</p>}
                                        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: "var(--p-muted)" }}>
                                            Playing for: {p.emoji} {p.shortTitle}
                                        </p>
                                        <div className="gw-entry-foot">
                                            <a href={f.reelUrl} target="_blank" rel="noopener noreferrer" className="gw-copy-btn" style={{ textDecoration: "none" }}>
                                                🎬 Watch Reel ↗
                                            </a>
                                            <button
                                                type="button"
                                                className="bw-btn bw-btn-primary bw-btn-sm"
                                                disabled={votedId !== null}
                                                onClick={() => handleVote(f.id)}
                                            >
                                                {isMyVote ? "Voted ✓" : votedId !== null ? "Vote Locked" : "Vote ❤️"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ⑥ SUBMIT REEL FORM + LIVE GOLDEN VIP TICKET */}
            <section className="bw-section bw-alt" id="submit-reel" ref={formRef}>
                <div className="bw-container">
                    <div className="bw-section-title">
                        <span className="bw-eyebrow">🎟️ LOCK YOUR OFFICIAL ENTRY</span>
                        <h2 style={{ marginTop: 12 }}>Submit Your Instagram Reel</h2>
                        <p>Get your instant <b>#BW</b> entry ticket on screen + official confirmation email from <b>hello@birthdaywisher.fun</b>!</p>
                    </div>

                    <div className="gw-submit-grid">
                        <div className="gw-form-card">
                            {lockedEntry ? (
                                <div style={{ textAlign: "center", padding: "12px 6px" }}>
                                    <div style={{ fontSize: 54 }}>🎉</div>
                                    <h3 style={{ fontSize: 28, margin: "8px 0 6px" }}>
                                        Ticket #{lockedEntry.ticketCode} Locked In!
                                    </h3>
                                    <p style={{ color: "var(--p-muted)", fontWeight: 600, fontSize: 15, marginBottom: 18 }}>
                                        {emailSentOk
                                            ? `We just emailed your official ticket receipt to ${email} from hello@birthdaywisher.fun!`
                                            : "Your Reel is live on the Official Scoreboard below! Keep your Reel public until winner day."}
                                    </p>

                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 18 }}>
                                        <button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={copyStoryFlex}>
                                            {copiedFlex ? "Copied Story Caption ✓" : "📲 Copy Story Shoutout Text"}
                                        </button>
                                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="bw-btn bw-btn-ghost bw-btn-sm">
                                            Follow {INSTAGRAM_HANDLE} ↗
                                        </a>
                                    </div>

                                    <button
                                        type="button"
                                        className="gw-copy-btn"
                                        onClick={() => {
                                            setLockedEntry(null);
                                            setReelUrl("");
                                            setNote("");
                                        }}
                                    >
                                        ＋ Submit 2nd Creative Reel (Max 2 per creator)
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="gw-field-group">
                                        <label className="gw-label" htmlFor="gw-ig">
                                            1. Your Instagram Username <small>(Public account)</small>
                                        </label>
                                        <input
                                            id="gw-ig"
                                            className="gw-input"
                                            placeholder="@your_handle"
                                            value={igHandle}
                                            maxLength={60}
                                            required
                                            onChange={(e) => setIgHandle(e.target.value)}
                                        />
                                    </div>

                                    <div className="gw-field-group">
                                        <label className="gw-label" htmlFor="gw-reel">
                                            2. Instagram Reel Link <small>(15–30 sec Reel · Tag {INSTAGRAM_HANDLE})</small>
                                        </label>
                                        <input
                                            id="gw-reel"
                                            className="gw-input"
                                            type="url"
                                            placeholder="https://www.instagram.com/reel/..."
                                            value={reelUrl}
                                            required
                                            onChange={(e) => setReelUrl(e.target.value)}
                                        />
                                    </div>

                                    <div className="gw-field-group">
                                        <label className="gw-label" htmlFor="gw-email">
                                            3. Your Email Address <small>(For Ticket # &amp; Finale Alert)</small>
                                        </label>
                                        <input
                                            id="gw-email"
                                            className="gw-input"
                                            type="email"
                                            placeholder="you@gmail.com"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="gw-field-group">
                                        <span className="gw-label">
                                            4. Your Country / Region <small>(Auto-sets available rewards)</small>
                                        </span>
                                        <div className="gw-prize-pills" role="radiogroup" aria-label="Your country or region">
                                            <button
                                                type="button"
                                                role="radio"
                                                aria-checked={region === "IN"}
                                                className={`gw-prize-pill ${region === "IN" ? "is-on" : ""}`}
                                                onClick={() => setRegion("IN")}
                                            >
                                                <span style={{ fontSize: 18 }}>🇮🇳</span>
                                                <span>India (₹2,000 Gadgets / Voucher)</span>
                                            </button>
                                            <button
                                                type="button"
                                                role="radio"
                                                aria-checked={region === "GLOBAL"}
                                                className={`gw-prize-pill ${region === "GLOBAL" ? "is-on" : ""}`}
                                                onClick={() => {
                                                    setRegion("GLOBAL");
                                                    setPrizeChoice("amazon_2000");
                                                }}
                                            >
                                                <span style={{ fontSize: 18 }}>🌍</span>
                                                <span>Outside India ($25 Gift Card)</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="gw-field-group">
                                        <span className="gw-label">
                                            5. {region === "IN" ? "Choose Your ₹2,000 Reward (India)" : "Your International Reward (Outside India)"}
                                        </span>
                                        {region === "IN" ? (
                                            <div className="gw-prize-pills" role="radiogroup" aria-label="Prize choice">
                                                {pack.prizes.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={prizeChoice === p.id}
                                                        className={`gw-prize-pill ${prizeChoice === p.id ? "is-on" : ""}`}
                                                        onClick={() => setPrizeChoice(p.id)}
                                                    >
                                                        <span style={{ fontSize: 18 }}>{p.emoji}</span>
                                                        <span>{p.shortTitle}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="gw-prize-pill is-on" style={{ cursor: "default" }}>
                                                <span style={{ fontSize: 20 }}>💳</span>
                                                <span><b>$25 USD Official Gift Card</b> — Instant Worldwide Email Delivery (Only Option Outside India)</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="gw-bonus-checks">
                                        <span className="gw-label" style={{ marginBottom: 2 }}>
                                            Action &amp; Format Points (35 Pts — Verified on Instagram by Admin)
                                        </span>

                                        <div className="gw-check-row" style={{ cursor: "default", opacity: 0.96 }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <span aria-hidden="true">🎬</span>
                                                <span>Valid 15–30s Public Reel ({GIVEAWAY_HASHTAG})</span>
                                            </span>
                                            <span className="gw-pts-pill">+10 PTS</span>
                                        </div>

                                        <label className="gw-check-row">
                                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isInPerson}
                                                    onChange={(e) => setIsInPerson(e.target.checked)}
                                                />
                                                <span>🎥 In-Person / Real Face or Friend Reaction Reel</span>
                                            </span>
                                            <span className="gw-pts-pill">+15 BONUS</span>
                                        </label>
                                        {!isInPerson && (
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--p-muted)", padding: "2px 6px 4px" }}>
                                                🙈 Faceless screen-recording selected — allowed, but it skips the +15 In-Person bonus, so your score may be lower unless your Creativity &amp; Editing are standout!
                                            </div>
                                        )}

                                        <label className="gw-check-row">
                                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sentCollab}
                                                    onChange={(e) => setSentCollab(e.target.checked)}
                                                />
                                                <span>🤝 I sent a Collab invite to {INSTAGRAM_HANDLE}</span>
                                            </span>
                                            <span className="gw-pts-pill">+5 PTS · IG Check</span>
                                        </label>

                                        <label className="gw-check-row">
                                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sharedStory}
                                                    onChange={(e) => setSharedStory(e.target.checked)}
                                                />
                                                <span>📲 I shared on Story &amp; tagged {INSTAGRAM_HANDLE}</span>
                                            </span>
                                            <span className="gw-pts-pill">+5 PTS · DM Check</span>
                                        </label>
                                    </div>

                                    <div className="gw-field-group">
                                        <label className="gw-label" htmlFor="gw-note">
                                            6. One-Line Reel Caption / Vibe <small>(Optional — shown on wall)</small>
                                        </label>
                                        <input
                                            id="gw-note"
                                            className="gw-input"
                                            placeholder="e.g. Roasted my childhood bestie with Cuppy AI 😂"
                                            value={note}
                                            maxLength={120}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>

                                    <div className="gw-field-group" style={{ marginBottom: 18 }}>
                                        <label className="gw-label" htmlFor="gw-wish">
                                            BirthdayWisher Link Shown in Reel <small>(Optional)</small>
                                        </label>
                                        <input
                                            id="gw-wish"
                                            className="gw-input"
                                            placeholder="birthdaywisher.fun/wish/..."
                                            value={wishLink}
                                            maxLength={180}
                                            onChange={(e) => setWishLink(e.target.value)}
                                        />
                                    </div>

                                    {errorMsg && (
                                        <p role="alert" style={{ color: "#e11d48", fontWeight: 800, fontSize: 13.5, marginBottom: 12 }}>
                                            ⚠️ {errorMsg}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="bw-btn bw-btn-primary"
                                        style={{ width: "100%", justifyContent: "center" }}
                                        disabled={submitting || !config.active || isUpcoming}
                                    >
                                        {submitting
                                            ? "Locking Your Ticket…"
                                            : isUpcoming
                                              ? "⏳ Entries Open Automatically at 12:00 AM IST Tonight!"
                                              : "🎟️ Lock Official Entry & Get Ticket →"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Live Golden Ticket Preview */}
                        <aside className={`gw-ticket ${lockedEntry ? "is-locked" : ""}`} aria-label="Official Entry Ticket Preview">
                            <div className="gw-ticket-kicker">
                                <span>🎂 REELFEST VIP PASS · S1</span>
                                <span>{lockedEntry ? "✅ VERIFIED" : "LIVE PREVIEW"}</span>
                            </div>

                            <div className="gw-ticket-code">
                                #{lockedEntry ? lockedEntry.ticketCode : `BW-${String(entries.length + 1).padStart(3, "0")}`}
                            </div>
                            <div className="gw-ticket-handle">
                                {lockedEntry
                                    ? lockedEntry.igHandle
                                    : igHandle.trim()
                                      ? `@${igHandle.trim().replace(/^@+/, "")}`
                                      : "@your_handle"}
                            </div>

                            <div className="gw-ticket-perf" />

                            <div className="gw-ticket-rows">
                                <div>
                                    <span>Selected Reward</span>
                                    <b>{selectedPrize.emoji} {selectedPrize.shortTitle}</b>
                                </div>
                                <div>
                                    <span>Reel Style</span>
                                    <b>
                                        {(lockedEntry ? lockedEntry.isInPerson : isInPerson)
                                            ? "🎥 In-Person (+15 Bonus)"
                                            : "🙈 Faceless (Creativity Mode)"}
                                    </b>
                                </div>
                                <div>
                                    <span>Action &amp; Format Pts</span>
                                    <b style={{ color: "#2ED8B6" }}>
                                        {lockedEntry
                                            ? lockedEntry.reelVerified || lockedEntry.totalScore > 0
                                                ? `${lockedEntry.totalScore} / 100 pts`
                                                : `⏳ Pending Check (${10 + (lockedEntry.isInPerson ? 15 : 0) + (lockedEntry.sentCollab ? 5 : 0) + (lockedEntry.sharedStory ? 5 : 0)}/35)`
                                            : `${claimedActionPts} / 35 pts (Admin Verified)`}
                                    </b>
                                </div>
                                <div>
                                    <span>Creativity + Views</span>
                                    <b>0–35 + 0–30 (= 65 pts)</b>
                                </div>
                                <div>
                                    <span>Winner Rule</span>
                                    <b style={{ color: "#FFD93D" }}>Highest / 100 Wins 🏆</b>
                                </div>
                            </div>

                            <div className="gw-ticket-perf" />

                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
                                💡 Screenshot this ticket &amp; tag <b>{INSTAGRAM_HANDLE}</b> on your Story — we repost entries daily to boost your Reel&apos;s views!
                            </p>
                        </aside>
                    </div>
                </div>
            </section>

            {/* ⑦ LIVE OPEN ENTRIES WALL */}
            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <span className="bw-eyebrow">🔥 OPEN COMMUNITY WALL</span>
                        <h2 style={{ marginTop: 12 }}>
                            Submitted Creator Reels {entries.length > 0 ? `(${entries.length})` : ""}
                        </h2>
                        <p>100% transparent — watch what fellow creators are making right now!</p>
                    </div>

                    {entries.length === 0 ? (
                        <div className="bw-card" style={{ padding: "36px 24px", textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
                            <div style={{ fontSize: 46 }}>🎬</div>
                            <h3 style={{ fontSize: 24, margin: "10px 0 6px" }}>Be Entry #BW-001 Today!</h3>
                            <p style={{ color: "var(--p-muted)", fontWeight: 600, marginBottom: 18 }}>
                                Early Reels get featured first in our Instagram Stories Highlight on {INSTAGRAM_HANDLE} — claim the #BW-001 spot!
                            </p>
                            <Link href="/create?via=giveaway_wall" className="bw-btn bw-btn-primary bw-btn-sm">
                                🎂 Create Your Free Surprise Now →
                            </Link>
                        </div>
                    ) : (
                        <div className="gw-entries-grid">
                            {entries.map((entry) => {
                                const p = getPrizeInfo(entry.prizeChoice, entry.region || region);
                                return (
                                    <div
                                        key={entry.id}
                                        className={`gw-entry-card ${entry.status === "winner" ? "is-winner" : entry.status === "finalist" ? "is-finalist" : ""}`}
                                    >
                                        <div className="gw-entry-head">
                                            <span className="gw-entry-ticket">
                                                {entry.status === "winner" ? "🏆 Winner " : entry.status === "finalist" ? "🏅 Top Pick " : "🎟️ "}
                                                #{entry.ticketCode}
                                            </span>
                                            <span className="gw-entry-pts">
                                                {entry.reelVerified || entry.totalScore > 0
                                                    ? `${entry.totalScore} / 100 pts`
                                                    : "⏳ Pending Check"}
                                            </span>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: 19 }}>{entry.igHandle}</h3>
                                        {(entry.reelVerified || entry.inPersonVerified || entry.collabVerified || entry.storyVerified) && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 11.5, fontWeight: 800, color: "var(--p-grape)" }}>
                                                {entry.reelVerified && <span>🎬 Reel +10</span>}
                                                {entry.inPersonVerified && <span>🎥 In-Person +15</span>}
                                                {entry.collabVerified && <span>🤝 Collab +5</span>}
                                                {entry.storyVerified && <span>📲 Story +5</span>}
                                            </div>
                                        )}
                                        {entry.note && (
                                            <p style={{ margin: 0, fontSize: 13.5, color: "var(--p-muted)", fontWeight: 600 }}>
                                                &ldquo;{entry.note}&rdquo;
                                            </p>
                                        )}
                                        <div className="gw-entry-foot">
                                            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--p-muted)" }}>
                                                {p.emoji} {p.shortTitle}
                                            </span>
                                            <a
                                                href={entry.reelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gw-copy-btn"
                                                style={{ textDecoration: "none" }}
                                            >
                                                Watch Reel ↗
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ⑧ QUICK RULES & FAIRNESS PROMISE */}
            <section className="bw-section bw-alt">
                <div className="bw-container" style={{ maxWidth: 820 }}>
                    <div className="bw-card" style={{ padding: "28px 26px" }}>
                        <h2 style={{ fontSize: 24, margin: "0 0 14px" }}>📋 Official {GIVEAWAY_NAME} Rules (Short &amp; Fair)</h2>
                        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 9, fontSize: 14.5, lineHeight: 1.55, color: "var(--p-muted)", fontWeight: 600 }}>
                            <li><b>15 to 30 Sec Original Reel:</b> Create any surprise or game on <b>birthdaywisher.fun</b> and feature it for at least 2–3 seconds inside an original <b>15–30 second</b> Instagram Reel.</li>
                            <li><b>🎥 +15 Pts Direct In-Person Bonus vs 🙈 Faceless:</b> Showing yourself or a real friend/partner reaction on camera earns a <b>direct +15 pt bonus</b>! Faceless screen-recordings are allowed, but they do not receive the +15 bonus — meaning faceless entries may score lower unless their <b>Creativity &amp; Editing (0–35 pts)</b> is truly exceptional.</li>
                            <li><b>Tag &amp; Public Account:</b> Tag and follow <b>{INSTAGRAM_HANDLE}</b> with <b>{GIVEAWAY_HASHTAG}</b> from a genuine public Instagram account (fake/0-follower spam accounts or bought bot views are disqualified).</li>
                            <li><b>100-Point Fair Scoreboard:</b> Valid 15–30s Reel (<b>+10</b>), In-Person Camera Bonus (<b>+15</b>), {INSTAGRAM_HANDLE} Collab Invite (<b>+5</b>), Story Share + Tag (<b>+5</b>), Creativity (<b>0–35</b>), and Real Organic Views/Reach (<b>0–30</b>) = <b>100 Points</b>. Highest total score wins directly!</li>
                            <li><b>Max 2 Reels Per Creator:</b> You may submit up to 2 distinct creative Reels — your higher-scoring Reel counts toward the championship.</li>
                            <li><b>Worldwide Prize Delivery ({pack.flag} {pack.amountDisplay}):</b> {pack.ruleDeliveryNote}</li>
                            <li><i>Platform note: This creator contest is organized independently by BirthdayWisher.fun and is not sponsored or endorsed by Instagram or Amazon.</i></li>
                        </ul>
                    </div>
                </div>
            </section>

            <PartyFooter />
        </div>
    );
}
