"use client";

import { useState } from "react";
import type { CuppyAutoBuild, CuppyItem, CuppySpice, CuppyTask, CuppyTone } from "@/lib/cuppyAi";
import type { WishType } from "@/lib/wish/schema";
import { track } from "@/lib/track";
import type { EditorEnv } from "./editors";
import { CUPPY_SVG } from "./ui";

export interface PublicCuppyStatus {
    enabled: boolean;
    allowNoFilter: boolean;
    pauseMessage: string;
}

export const DEFAULT_PUBLIC_CUPPY_STATUS: PublicCuppyStatus = {
    enabled: true,
    allowNoFilter: true,
    pauseMessage:
        "🧁 Cuppy is baking fresh birthday cupcakes right now! Meanwhile, tap one of Cuppy's handpicked favourites below ❤️",
};

interface CuppyAiBoxProps {
    task: Exclude<CuppyTask, "chat" | "autobuild">;
    env: EditorEnv;
    draft?: string;
    placeholder: string;
    mode?: "cards" | "chips" | "quiz";
    pickedValues?: string[];
    onPick: (item: CuppyItem) => void;
}

const SPICE_TABS: Array<{ id: CuppySpice; label: string; title: string }> = [
    { id: "mild", label: "😇 Sweet", title: "Romantic, heartfelt & warm options" },
    { id: "medium", label: "😏 Witty", title: "Playful roast & party hype options" },
    { id: "brutal", label: "💀 No-Filter", title: "Unfiltered dost, spicy flirty & 3 AM raw options" },
];

const CHIPS_BY_TAB: Record<CuppySpice, Array<{ id: CuppyTone; label: string; hot?: boolean }>> = {
    mild: [
        { id: "romantic", label: "❤️ Romantic" },
        { id: "heartfelt", label: "🥹 Heartfelt" },
        { id: "sweet", label: "🥰 Sweet & Warm" },
        { id: "hinglish", label: "🗣️ Hinglish" },
        { id: "hindi", label: "🙏 Hindi" },
    ],
    medium: [
        { id: "funny", label: "😂 Friendly Roast" },
        { id: "hype", label: "🎉 Party Hype" },
        { id: "romantic", label: "❤️ Cute & Romantic" },
        { id: "hinglish", label: "🗣️ Hinglish" },
        { id: "hindi", label: "🙏 Hindi" },
    ],
    brutal: [
        { id: "unfiltered", label: "🔥 Unfiltered Dost", hot: true },
        { id: "flirty", label: "🌶️ Spicy Flirty", hot: true },
        { id: "raw3am", label: "🌙 3 AM Raw" },
        { id: "hinglish", label: "🗣️ Hinglish" },
        { id: "hindi", label: "🙏 Hindi" },
    ],
};

/** Client-safe instant handpicked favourites shown seamlessly during Cozy Pause Mode (zero API calls). */
function getLocalHandpicked(
    task: Exclude<CuppyTask, "chat" | "autobuild">,
    style: "romantic" | "heartfelt" | "hinglish" | "funny",
    nameRaw: string,
    wishType: WishType,
): CuppyItem[] {
    const ann = wishType === "anniversary";
    const n = nameRaw.trim() || (ann ? "my love" : "you");
    if (task === "quirks") {
        return [
            { text: "Always 20 mins late" },
            { text: "Unmatched food radar" },
            { text: "Your contagious laugh" },
            { text: "3 AM life advice" },
            { text: "Stealing all the fries" },
        ];
    }
    if (task === "award") {
        return [
            { text: `Favourite Human of ${new Date().getFullYear()} 🏆` },
            { text: "Chief Happiness Officer ❤️" },
            { text: "Official CEO of Coming Late 😂" },
            { text: "Undefeated 2 AM Best Listener 🥹" },
        ];
    }
    if (task === "quiz") {
        return [
            { text: "Where did we hang out together for the very first time?" },
            { text: "What's our undefeated comfort food?" },
            { text: "Who takes longer to get ready?" },
        ];
    }
    if (task === "promise") {
        return [
            { text: "Your favourite food + dessert is 100% on me this weekend 🍕🧁" },
            { text: "One unplanned late-night drive with your playlist on full volume 🚗🎶" },
            { text: "Zero teasing for 24 full hours (starting right now) 😂🤞" },
        ];
    }
    if (task === "gratitude") {
        return [
            { text: `I'm so thankful for you, ${n}, because you make ordinary days feel lighter just by showing up ❤️` },
            { text: "Thank you for listening to my endless rants and cheering the loudest for me every time 🥹" },
        ];
    }
    if (task === "memory") {
        return [
            { text: `Remember when we completely lost track of time laughing over the smallest things? Still one of my favourite memories with you, ${n} 🥹` },
            { text: "That unplanned food run where everything went sideways—and somehow turned into the best day ever 😂🍕" },
        ];
    }
    if (task === "whatsapp") {
        return [
            { text: `🎁 ${n}, sirf tere liye kuch special banaya hai—headphones laga ke kholna! 🎧` },
            { text: `💌 Made something from the heart for you, ${n}—tap when you have 60 quiet seconds ❤️` },
        ];
    }
    if (style === "romantic") {
        return [
            { text: `Every year with you is my favourite chapter, ${n}. Happy ${ann ? "anniversary" : "birthday"} to the one who holds my whole heart ❤️` },
            { text: `You're my favourite notification, my calmest place, and my best adventure. Happy ${ann ? "anniversary" : "birthday"}, ${n}! 🥂` },
        ];
    }
    if (style === "hinglish") {
        return [
            { text: `Happy ${ann ? "Anniversary" : "Birthday"} ${n}! Tu life mein na hota toh meri aadhi stories boring hoti—aaj ka pura din sirf tera hai! 🎉🎂` },
            { text: `Yaar ${n}, thank you hamesha bina judge kiye saath khade rehne ke liye. Khul ke enjoy kar aur party ready rakh! ❤️🥳` },
        ];
    }
    if (style === "funny") {
        return [
            { text: `Happy ${ann ? "anniversary" : "birthday"} ${n}! Another year older and somehow still zero improvement in arriving on time 😂🎂` },
            { text: `To the only person who laughs at my terrible jokes AND roasts me for them—happy ${ann ? "anniversary" : "birthday"}, ${n}! 🎉` },
        ];
    }
    return [
        { text: `Happy ${ann ? "anniversary" : "birthday"}, ${n}! Life is genuinely brighter, warmer, and ten times happier because you're in it 🎂❤️` },
        { text: `Thank you for being my safe place through every high and low. Wishing you the happiest celebration ever, ${n}! 🎈` },
    ];
}

/* ---------- Non-intrusive Cuppy AI Micro-Review Bar ---------- */
const CUPPY_RV_KEY = "bw_rv_cuppy";
const CUPPY_FACES = [
    { r: 1, e: "😢", t: "Not good" },
    { r: 2, e: "😕", t: "Okay-ish" },
    { r: 3, e: "🙂", t: "Good" },
    { r: 4, e: "😍", t: "Loved it!" },
    { r: 5, e: "🥳", t: "Spot-on!" },
];
const CUPPY_QUICK_NOTES = [
    "Spot-on Hinglish! 🔥",
    "Saved me so much time ❤️",
    "Loved Unfiltered mode 😂",
    "Auto-Build is magic ⚡",
];

export function canAskCuppyReview(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = localStorage.getItem(CUPPY_RV_KEY);
        if (!raw) return true;
        const { at } = JSON.parse(raw) as { at: number };
        return Date.now() - at > 14 * 86_400_000;
    } catch {
        return true;
    }
}

export function CuppyFeedbackBar({ contextLabel }: { contextLabel: string }) {
    const [visible, setVisible] = useState(() => canAskCuppyReview());
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);

    if (!visible) return null;

    const dismiss = () => {
        try { localStorage.setItem(CUPPY_RV_KEY, JSON.stringify({ s: "skip", at: Date.now() })); } catch { /* ignore */ }
        setVisible(false);
    };

    const send = async (rVal = rating, msgVal = note) => {
        if (!rVal || busy) return;
        setBusy(true);
        try {
            await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: "cuppy",
                    rating: rVal,
                    message: msgVal.trim(),
                    relationship: contextLabel.slice(0, 48),
                }),
            });
            try { localStorage.setItem(CUPPY_RV_KEY, JSON.stringify({ s: "done", at: Date.now() })); } catch { /* ignore */ }
            track("cuppy_review_submit", { rating: rVal, ctx: contextLabel.slice(0, 30) });
            setSent(true);
            setTimeout(() => setVisible(false), 2200);
        } catch {
            setBusy(false);
        }
    };

    if (sent) {
        return (
            <div className="wz2-cuppy-rv is-thanks" aria-live="polite">
                🧁 Yay! Thank you for rating Cuppy AI ❤️
            </div>
        );
    }

    return (
        <div className="wz2-cuppy-rv" role="region" aria-label="Rate Cuppy AI">
            <div className="wz2-cuppy-rv-row">
                <span>🧁 How did Cuppy AI do?</span>
                <div className="wz2-cuppy-rv-faces">
                    {CUPPY_FACES.map((f) => (
                        <button
                            key={f.r}
                            type="button"
                            title={f.t}
                            aria-label={`${f.r} of 5: ${f.t}`}
                            className={`wz2-cuppy-rv-f ${rating === f.r ? "is-on" : ""}`}
                            onClick={() => setRating(f.r)}
                        >
                            {f.e}
                        </button>
                    ))}
                </div>
                <button type="button" className="wz2-edit" style={{ fontSize: 12 }} onClick={dismiss} aria-label="Dismiss">✕</button>
            </div>
            {rating > 0 && (
                <div className="wz2-cuppy-rv-more">
                    {rating >= 4 && (
                        <div className="wz2-chips" style={{ marginTop: 6, gap: 5 }}>
                            {CUPPY_QUICK_NOTES.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    className={`wz2-chip wz2-autobuild-pill ${note === q ? "is-on" : ""}`}
                                    onClick={() => setNote((prev) => (prev === q ? "" : q))}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="wz2-ai-bar" style={{ marginTop: 7 }}>
                        <input
                            className="wz2-ai-input wz2-autobuild-in"
                            type="text"
                            maxLength={220}
                            value={note}
                            placeholder={rating >= 4 ? "What did you like about Cuppy? (optional)" : "How can Cuppy write better? (optional)"}
                            aria-label="Cuppy AI feedback note"
                            onChange={(e) => setNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    void send();
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="bw-btn bw-btn-primary bw-btn-sm wz2-ai-btn"
                            style={{ padding: "8px 14px", fontSize: 12.5 }}
                            disabled={busy}
                            onClick={() => void send()}
                        >
                            {busy ? "…" : "Send ❤️"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CuppyAiBox({
    task,
    env,
    draft = "",
    placeholder,
    mode = "cards",
    pickedValues = [],
    onPick,
}: CuppyAiBoxProps) {
    const status = env.cuppyStatus ?? DEFAULT_PUBLIC_CUPPY_STATUS;
    const [cozyPaused, setCozyPaused] = useState(!status.enabled);
    const [cozyMsg, setCozyMsg] = useState(status.pauseMessage);
    const [cozyStyle, setCozyStyle] = useState<"romantic" | "heartfelt" | "hinglish" | "funny">("romantic");

    const [hint, setHint] = useState("");
    const [spice, setSpice] = useState<CuppySpice>("mild");
    const [activeTone, setActiveTone] = useState<CuppyTone>("auto");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState<CuppyItem[]>([]);
    const [justPicked, setJustPicked] = useState("");

    const isPaused = !status.enabled || cozyPaused;
    const effectiveSpice: CuppySpice = !status.allowNoFilter && spice === "brutal" ? "medium" : spice;
    const visibleTabs = status.allowNoFilter ? SPICE_TABS : SPICE_TABS.filter((t) => t.id !== "brutal");

    const canPolish =
        draft.trim().length >= 10 &&
        (task === "message" || task === "memory" || task === "gratitude" || task === "promise" || task === "whatsapp");

    const toneChips = CHIPS_BY_TAB[effectiveSpice];

    // Seamless Cozy Pause Card — warm pyara note + instant handpicked favourites (zero broken feel!)
    if (isPaused) {
        const cozyItems = items.length > 0 ? items : getLocalHandpicked(task, cozyStyle, env.name, env.wishType);
        return (
            <div className="wz2-ai wz2-ai-cozy" aria-label="Cuppy's handpicked favourites">
                <div className="wz2-ai-head" style={{ marginBottom: 6 }}>
                    <div className="wz2-ai-title">
                        <span className="wz2-ai-avatar" aria-hidden="true">{CUPPY_SVG}</span>
                        <div>
                            <b>🧁 Cuppy&apos;s Handpicked Favourites</b>
                            <small style={{ color: "var(--p-text)", opacity: 0.85 }}>{cozyMsg || status.pauseMessage}</small>
                        </div>
                    </div>
                </div>
                <div className="wz2-ai-tones" style={{ marginTop: 8 }}>
                    {([
                        ["romantic", "❤️ Romantic"],
                        ["heartfelt", "🥹 Heartfelt"],
                        ["hinglish", "🗣️ Hinglish"],
                        ["funny", "😂 Playful"],
                    ] as const).map(([id, lbl]) => (
                        <button
                            key={id}
                            type="button"
                            className={`wz2-chip wz2-ai-tone ${cozyStyle === id ? "is-on" : ""}`}
                            onClick={() => {
                                setCozyStyle(id);
                                setItems([]);
                            }}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>
                {mode === "chips" ? (
                    <div className="wz2-chips" style={{ marginTop: 10 }}>
                        {cozyItems.map((it) => {
                            const used = pickedValues.includes(it.text) || justPicked === it.text;
                            return (
                                <button
                                    key={it.text}
                                    type="button"
                                    className={`wz2-chip ${used ? "is-on" : ""}`}
                                    onClick={() => { onPick(it); setJustPicked(it.text); env.react(); }}
                                >
                                    {used ? "✓ " : "＋ "}{it.text}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="wz2-ai-cards">
                        {cozyItems.map((it) => {
                            const active = draft === it.text || justPicked === it.text;
                            return (
                                <button
                                    key={it.text}
                                    type="button"
                                    className={`wz2-ai-card ${active ? "is-picked" : ""}`}
                                    onClick={() => { onPick(it); setJustPicked(it.text); env.react(); }}
                                >
                                    <span className="wz2-ai-card-txt">{it.text}</span>
                                    <span className="wz2-ai-use">{active ? "✓ Applied" : mode === "quiz" ? "＋ Add question" : "Tap to use →"}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const askCuppy = async (toneOverride?: CuppyTone, spiceOverride?: CuppySpice, fresh = false) => {
        const chosenTone = toneOverride ?? activeTone;
        const chosenSpice = spiceOverride ?? effectiveSpice;
        setActiveTone(chosenTone);
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/cuppy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task,
                    tone: chosenTone,
                    spice: chosenSpice,
                    wishType: env.wishType,
                    name: env.name,
                    nickname: env.nickname,
                    age: env.age,
                    relationship: env.relationship,
                    vibe: env.vibe,
                    hint: hint.trim(),
                    draft: chosenTone === "polish" ? draft : draft.slice(0, 260),
                    storyContext: env.storyMemory || "",
                    fresh,
                }),
            });
            if (res.status === 429) {
                track("cuppy_ai_429", { task });
            }
            const data = (await res.json()) as {
                items?: CuppyItem[];
                engine?: string;
                cached?: boolean;
                failover?: boolean;
                ms?: number;
                paused?: boolean;
                pauseMessage?: string;
                error?: string;
            };
            if (!res.ok || !data.items?.length) {
                throw new Error(data.error || "Cuppy couldn't think of lines right now—try once more!");
            }
            if (data.paused) {
                setCozyPaused(true);
                if (data.pauseMessage) setCozyMsg(data.pauseMessage);
                setItems(data.items);
                env.react();
                return;
            }
            track("cuppy_ai_gen", {
                task,
                tone: chosenTone,
                spice: chosenSpice,
                engine: data.engine || "unknown",
                cached: Boolean(data.cached),
                failover: Boolean(data.failover),
                ms: data.ms ?? 0,
                hasHint: Boolean(hint.trim()),
                hasMemory: Boolean(env.storyMemory),
            });
            setItems(data.items);
            env.onAiUsed?.("assist");
            env.react();
        } catch (err) {
            setError((err as Error).message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePick = (it: CuppyItem) => {
        onPick(it);
        setJustPicked(it.text);
        env.onAiUsed?.("assist");
        env.react();
        track("cuppy_ai_pick", { task, tone: activeTone, spice: effectiveSpice });
    };

    return (
        <div className="wz2-ai" aria-label="Cuppy AI writing assistant">
            <div className="wz2-ai-head">
                <div className="wz2-ai-title">
                    <span className={`wz2-ai-avatar ${loading ? "is-thinking" : ""}`} aria-hidden="true">
                        {CUPPY_SVG}
                    </span>
                    <div>
                        <b>🧁 Write with Cuppy AI</b>
                        <small>
                            For {env.name || (env.wishType === "anniversary" ? "them" : "your person")}
                            {env.storyMemory ? " · 🧠 Remembers your earlier steps" : " · Free AI"}
                        </small>
                    </div>
                </div>
                <div className="wz2-ai-spices" role="tablist" aria-label="Mood filter tabs">
                    {visibleTabs.map((sp) => (
                        <button
                            key={sp.id}
                            type="button"
                            role="tab"
                            aria-selected={effectiveSpice === sp.id}
                            title={sp.title}
                            className={`wz2-ai-spice ${effectiveSpice === sp.id ? "is-on" : ""}`}
                            disabled={loading}
                            onClick={() => setSpice(sp.id)}
                        >
                            {sp.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="wz2-ai-bar">
                <input
                    className="wz2-ai-input"
                    type="text"
                    value={hint}
                    maxLength={240}
                    placeholder={placeholder}
                    aria-label="Personal details for Cuppy AI"
                    onChange={(e) => setHint(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (!loading) void askCuppy(activeTone, effectiveSpice, true);
                        }
                    }}
                />
                <button
                    type="button"
                    className="bw-btn bw-btn-primary bw-btn-sm wz2-ai-btn"
                    disabled={loading}
                    onClick={() => void askCuppy(activeTone, effectiveSpice, true)}
                >
                    {loading ? "Baking…" : "🪄 Write"}
                </button>
            </div>

            <div className="wz2-ai-tones" role="group" aria-label="AI tone options">
                {canPolish && (
                    <button
                        type="button"
                        className={`wz2-chip wz2-ai-tone ${activeTone === "polish" && items.length ? "is-on" : ""}`}
                        disabled={loading}
                        onClick={() => void askCuppy("polish", effectiveSpice, true)}
                    >
                        🪄 Polish draft
                    </button>
                )}
                {toneChips.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        className={`wz2-chip wz2-ai-tone ${t.hot ? "is-hot" : ""} ${activeTone === t.id && items.length ? "is-on" : ""}`}
                        disabled={loading}
                        onClick={() => void askCuppy(t.id, effectiveSpice, false)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {error && <div className="wz2-error" style={{ marginTop: 10 }}>{error}</div>}

            {items.length > 0 && (
                <div className="wz2-ai-results" aria-live="polite">
                    {mode === "chips" ? (
                        <div className="wz2-chips" style={{ marginTop: 10 }}>
                            {items.map((it) => {
                                const used = pickedValues.includes(it.text) || justPicked === it.text;
                                return (
                                    <button
                                        key={it.text}
                                        type="button"
                                        className={`wz2-chip ${used ? "is-on" : ""}`}
                                        onClick={() => handlePick(it)}
                                    >
                                        {used ? "✓ " : "＋ "}
                                        {it.text}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="wz2-ai-cards">
                            {items.map((it) => {
                                const active = draft === it.text || justPicked === it.text;
                                return (
                                    <button
                                        key={it.text}
                                        type="button"
                                        className={`wz2-ai-card ${active ? "is-picked" : ""}`}
                                        onClick={() => handlePick(it)}
                                    >
                                        <span className="wz2-ai-card-txt">{it.text}</span>
                                        {mode === "quiz" && it.answer && (
                                            <span className="wz2-ai-ans">Suggested answer: {it.answer}</span>
                                        )}
                                        <span className="wz2-ai-use">{active ? "✓ Applied" : mode === "quiz" ? "＋ Add question" : "Tap to use →"}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="wz2-ai-foot">
                        <button
                            type="button"
                            className="wz2-edit"
                            disabled={loading}
                            onClick={() => void askCuppy(activeTone, effectiveSpice, true)}
                        >
                            {loading ? "Thinking…" : "↻ More ideas"}
                        </button>
                        <button type="button" className="wz2-edit" onClick={() => setItems([])}>
                            Hide
                        </button>
                    </div>
                    {justPicked && <CuppyFeedbackBar contextLabel={`${task} · ${activeTone}`} />}
                </div>
            )}
        </div>
    );
}

/* ---------- Compact Cuppy AI Builder Strip (matches Quick / Template / Full Custom) ---------- */
const AUTOBUILD_TONES: Array<{ id: CuppyTone; spice: CuppySpice; label: string; hot?: boolean }> = [
    { id: "romantic", spice: "mild", label: "❤️ Romantic" },
    { id: "heartfelt", spice: "mild", label: "🥹 Heartfelt" },
    { id: "hinglish", spice: "medium", label: "🗣️ Hinglish" },
    { id: "unfiltered", spice: "brutal", label: "🔥 Unfiltered", hot: true },
    { id: "flirty", spice: "brutal", label: "🌶️ Spicy", hot: true },
    { id: "hindi", spice: "mild", label: "🙏 Hindi" },
];

export function CuppyMagicAutoBuild({
    wishType,
    status = DEFAULT_PUBLIC_CUPPY_STATUS,
    onBuilt,
}: {
    wishType: WishType;
    status?: PublicCuppyStatus;
    onBuilt: (ab: CuppyAutoBuild, buttonEl: HTMLElement | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [brief, setBrief] = useState("");
    const [presetIdx, setPresetIdx] = useState(2);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    // Cozy Pause Layer 1: cleanly hide the Auto-Build strip when Cuppy AI is paused so nobody hits a dead button!
    if (!status.enabled) return null;

    const visibleTones = status.allowNoFilter ? AUTOBUILD_TONES : AUTOBUILD_TONES.filter((t) => !t.hot);
    const preset = visibleTones[presetIdx] || visibleTones[0];

    const runAutoBuild = async (btnEl: HTMLElement | null) => {
        if (!brief.trim() || busy) {
            setErr("Write 1 short line about them first 👆");
            return;
        }
        setBusy(true);
        setErr("");
        try {
            const res = await fetch("/api/cuppy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "autobuild",
                    tone: preset.id,
                    spice: preset.spice,
                    wishType,
                    hint: brief.trim(),
                    fresh: true,
                }),
            });
            if (res.status === 429) track("cuppy_ai_429", { task: "autobuild" });
            const data = (await res.json()) as {
                autoBuild?: CuppyAutoBuild;
                engine?: string;
                cached?: boolean;
                failover?: boolean;
                ms?: number;
                error?: string;
            };
            if (!res.ok || !data.autoBuild) {
                throw new Error(data.error || "Cuppy couldn't auto-build right now—try once more!");
            }
            track("cuppy_ai_gen", {
                task: "autobuild",
                tone: preset.id,
                spice: preset.spice,
                engine: data.engine || "unknown",
                cached: Boolean(data.cached),
                failover: Boolean(data.failover),
                ms: data.ms ?? 0,
                hasHint: true,
                hasMemory: false,
            });
            track("cuppy_ai_pick", { task: "autobuild", tone: preset.id, spice: preset.spice });
            onBuilt(data.autoBuild, btnEl);
        } catch (e) {
            setErr((e as Error).message || "Something went wrong—please try again.");
        } finally {
            setBusy(false);
        }
    };

    const examplePrompt =
        wishType === "anniversary"
            ? "e.g. Riya & Aman 3rd anniversary, coffee drives, steals blanket…"
            : "e.g. Best friend Aman 22, gym + momos lover, cancels Goa plans…";

    if (!open) {
        return (
            <button
                type="button"
                className="bw-card wz2-autobuild-mini"
                onClick={() => setOpen(true)}
                aria-expanded={false}
            >
                <span className="wz2-autobuild-mini-ic" aria-hidden="true">🧁</span>
                <span className="wz2-autobuild-mini-txt">
                    <b>Cuppy AI Builder</b>
                    <small>Write 1 line, auto-fill the whole surprise</small>
                </span>
                <span className="wz2-autobuild-mini-cta">⚡ ~10s</span>
            </button>
        );
    }

    return (
        <div className="bw-card wz2-autobuild-card" aria-label="Cuppy AI Auto-Builder">
            <div className="wz2-autobuild-head">
                <span style={{ fontSize: 18 }} aria-hidden="true">🧁</span>
                <b>Cuppy AI Builder</b>
                <span className="wz2-ai-badge">Free · ~10s</span>
                <button
                    type="button"
                    className="wz2-autobuild-close"
                    onClick={() => setOpen(false)}
                    aria-label="Collapse Cuppy AI Builder"
                >
                    ✕
                </button>
            </div>

            <div className="wz2-ai-bar" style={{ marginTop: 8 }}>
                <input
                    className="wz2-ai-input wz2-autobuild-in"
                    type="text"
                    autoFocus
                    maxLength={340}
                    value={brief}
                    placeholder={examplePrompt}
                    aria-label="Describe them in one line for Cuppy AI"
                    onChange={(e) => {
                        setBrief(e.target.value);
                        if (err) setErr("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            void runAutoBuild(e.currentTarget);
                        }
                    }}
                />
                <button
                    type="button"
                    className="bw-btn bw-btn-primary bw-btn-sm wz2-ai-btn"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                    disabled={busy}
                    onClick={(e) => void runAutoBuild(e.currentTarget)}
                >
                    {busy ? "Building…" : "⚡ Build"}
                </button>
            </div>

            <div className="wz2-ai-tones" style={{ marginTop: 7, gap: 5 }}>
                {visibleTones.map((v, i) => (
                    <button
                        key={v.id}
                        type="button"
                        className={`wz2-chip wz2-autobuild-pill ${presetIdx === i ? "is-on" : ""}`}
                        disabled={busy}
                        onClick={() => setPresetIdx(i)}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
            {err && <div className="wz2-error" style={{ marginTop: 8, padding: "7px 11px", fontSize: 12.5 }}>{err}</div>}
        </div>
    );
}
