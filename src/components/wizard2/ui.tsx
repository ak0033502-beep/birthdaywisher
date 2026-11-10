"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { WishType } from "@/lib/wish/schema";

/* ---------- Wizard settings: Cuppy mascot / sounds / celebrations (saved) ---------- */
export interface WizardSettings { mascot: boolean; sound: boolean; celebrate: boolean }
const SETTINGS_KEY = "bw-wizard2-settings";

export function useWizardSettings() {
    const [s, setS] = useState<WizardSettings>({ mascot: true, sound: false, celebrate: true });
    useEffect(() => {
        try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) setS((p) => ({ ...p, ...JSON.parse(raw) })); } catch { /* ignore */ }
    }, []);
    const toggle = useCallback((k: keyof WizardSettings) => {
        setS((p) => {
            const n = { ...p, [k]: !p[k] };
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(n)); } catch { /* ignore */ }
            return n;
        });
    }, []);
    return { settings: s, toggle };
}

/* ---------- Small sound (off by default) ---------- */
let actx: AudioContext | null = null;
export function popSound(enabled: boolean, freq = 520) {
    if (!enabled || typeof window === "undefined") return;
    try {
        const W = window as Window & { webkitAudioContext?: typeof AudioContext };
        actx = actx || new (window.AudioContext || W.webkitAudioContext!)();
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, actx.currentTime);
        o.frequency.exponentialRampToValueAtTime(freq * 2.2, actx.currentTime + 0.12);
        g.gain.setValueAtTime(0.16, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.25);
        o.connect(g).connect(actx.destination);
        o.start(); o.stop(actx.currentTime + 0.26);
    } catch { /* audio unavailable */ }
}

/* ---------- Cuppy the cupcake ---------- */
const CUPPY = (
    <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 34 L50 34 L45 58 Q44 61 41 61 L23 61 Q20 61 19 58 Z" fill="#FF9F43" />
        <path d="M22 36 L24 59 M32 36 L32 60 M42 36 L40 59" stroke="#E07F22" strokeWidth="2" />
        <path d="M10 34 Q8 22 20 20 Q22 10 32 11 Q42 10 44 20 Q56 22 54 34 Z" fill="#FF5C8A" />
        <circle cx="20" cy="26" r="1.8" fill="#FFD93D" /><circle cx="40" cy="22" r="1.8" fill="#2ED8B6" /><circle cx="30" cy="17" r="1.8" fill="#7C5CFF" /><circle cx="46" cy="29" r="1.8" fill="#FFD93D" />
        <circle cx="32" cy="8" r="5" fill="#E8344F" /><path d="M32 3 Q35 0 37 1" stroke="#2ED8B6" strokeWidth="2" fill="none" />
        <circle cx="26" cy="45" r="2.6" fill="#2B2240" /><circle cx="38" cy="45" r="2.6" fill="#2B2240" />
        <circle cx="27" cy="44" r=".9" fill="#fff" /><circle cx="39" cy="44" r=".9" fill="#fff" />
        <path d="M28 50 Q32 54 36 50" stroke="#2B2240" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="50" r="2.4" fill="#FF5C8A" opacity=".5" /><circle cx="42" cy="50" r="2.4" fill="#FF5C8A" opacity=".5" />
    </svg>
);

export function Cuppy({ text, mascot, happyKey, onHide }: { text: ReactNode; mascot: boolean; happyKey: number; onHide: () => void }) {
    const [happy, setHappy] = useState(false);
    useEffect(() => {
        if (!happyKey) return;
        setHappy(true);
        const t = setTimeout(() => setHappy(false), 1300);
        return () => clearTimeout(t);
    }, [happyKey]);
    if (!text) return null;
    if (!mascot) return <div className="wz2-tip"><span aria-hidden="true">💡</span><span>{text}</span></div>;
    return (
        <div className={`wz2-cuppy ${happy ? "is-happy" : ""}`}>
            {CUPPY}
            <div className="wz2-bubble" role="note">{text} <button type="button" onClick={onHide} aria-label="Hide tips">✕</button></div>
        </div>
    );
}

export function PowerMeter({ pct, label, tip }: { pct: number; label: string; tip: string }) {
    return (
        <div className="bw-card wz2-power" aria-label={`Wish power ${pct}%`}>
            <span aria-hidden="true" style={{ fontSize: 26 }}>🎈</span>
            <div className="txt">Wish Power: {label}<small>{tip ? `Tip: ${tip}` : "Everything's in. Amazing!"}</small></div>
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
            <b>{pct}%</b>
        </div>
    );
}

/* ---------- Suggestion data ---------- */
export const RELATIONS: Record<WishType, Array<{ id: string; e: string }>> = {
    birthday: [
        { id: "Best Friend", e: "👯" }, { id: "Partner", e: "❤️" }, { id: "Boyfriend", e: "💙" }, { id: "Girlfriend", e: "💕" },
        { id: "Husband", e: "🤵" }, { id: "Wife", e: "👰" }, { id: "Mom", e: "👩" }, { id: "Dad", e: "👨" },
        { id: "Sibling", e: "🧑‍🤝‍🧑" }, { id: "Colleague", e: "💼" }, { id: "Crush", e: "🙈" }, { id: "Friend", e: "🙂" },
    ],
    anniversary: [
        { id: "Couple", e: "💍" }, { id: "My Partner", e: "❤️" }, { id: "Parents", e: "👨‍👩‍👧" }, { id: "Friends", e: "👯" },
    ],
};

// ids match what the classic wizard saved, so old and new wishes behave the same
export const VIBES = [
    { id: "grand-celebration", e: "🎉", t: "Grand Celebration", d: "Hype, confetti, party mode", theme: "neon" },
    { id: "tear-jerker", e: "🥹", t: "Tear-Jerker", d: "Happy tears guaranteed", theme: "pastel" },
    { id: "pure-romance", e: "❤️", t: "Pure Romance", d: "Butterflies only", theme: "elegant" },
    { id: "hardcore-roast", e: "🔥", t: "Hardcore Roast", d: "Love, but brutal", theme: "monochrome" },
];

const group = (rel: string) => {
    const r = rel.toLowerCase();
    if (/partner|boyfriend|girlfriend|husband|wife|couple|crush/.test(r)) return "love";
    if (/mom|dad|parent/.test(r)) return "family";
    if (/colleague/.test(r)) return "work";
    return "friend";
};

export function messageLines(name: string, rel: string, vibe: string, wishType: WishType): string[] {
    const n = name.trim() || "you";
    if (wishType === "anniversary") return [
        `Here's to another year of choosing each other, ${n} 💍`,
        `Every year with you is my favourite chapter. Happy anniversary! ❤️`,
        `Saalgirah mubarak ho ${n}! Aise hi hamesha saath rehna 💕`,
    ];
    const g = group(rel);
    const byVibe: Record<string, string[]> = {
        "hardcore-roast": [`Happy birthday ${n}! Still waiting for you to grow up 😂🔥`, `Another year older, still zero cooking skills. Happy birthday! 😂`],
        "tear-jerker": [`${n}, life is better because you're in it. Happy birthday 💛`, `Thank you for being my safe place. Happy birthday, ${n} 🥹`],
        "pure-romance": [`Every year with you is my favourite year, ${n} ❤️`, `Happy birthday to the one who has my whole heart 💕`],
        "grand-celebration": [`HAPPY BIRTHDAY ${n.toUpperCase()}! 🎉 Let's make this year legendary!`, `Cake, confetti and you. Best combo ever. Happy birthday! 🎂`],
    };
    const byGroup: Record<string, string> = {
        love: `You're my favourite notification. Happy birthday, my love 💕`,
        family: `Thank you for every sacrifice you never talked about. Happy birthday 💛`,
        work: `Happy birthday to the person who makes Mondays bearable! 🎉`,
        friend: `Happy birthday to the only person who laughs at my jokes AND roasts me for them 😂`,
    };
    return [...(byVibe[vibe] || byVibe["grand-celebration"]), byGroup[g], `Janamdin mubarak ho ${n}! Party kab de raha hai? 🎉`];
}

export function memoryIdeas(rel: string, wishType: WishType): string[] {
    if (wishType === "anniversary") return ["Our first date when you spilled coffee everywhere", "The rainy day we danced in the parking lot", "Our wedding day, when you couldn't stop smiling"];
    const g = group(rel);
    if (g === "love") return ["Our first date, when you were so nervous", "That 3 AM call that lasted 4 hours", "Our unplanned road trip to the beach"];
    if (g === "family") return ["The way you stayed up with me before every exam", "That time you secretly paid for my school trip", "Sunday breakfasts that you never missed"];
    return ["Getting lost in Goa at 3 AM looking for momos", "When you fell asleep during my birthday video call", "That time we accidentally wore matching outfits"];
}

export const QUIRK_PRESETS: Record<WishType, string[]> = {
    birthday: ["Always 30 mins late", "Your weird laugh", "Making the best maggi", "Overthinking text messages", "Stealing my hoodies", "Never letting me pay"],
    anniversary: ["Finishing each other's sentences", "Stealing the blanket at night", "Dancing in the kitchen", "Your forehead kisses", "Arguing about whose turn it is to cook"],
};

export const QUIZ_IDEAS: Record<WishType, string[]> = {
    birthday: ["Where did we first meet?", "What's my comfort food?", "What's my biggest fear?", "Who usually pays for the food?", "My most-used emoji?"],
    anniversary: ["Where was our first date?", "What song did we dance to at our wedding?", "Where did we go on our honeymoon?", "What's my love language?"],
};

export const AWARD_IDEAS = ["Best Human of 2026", "Most Likely to Be Late to Their Own Party", "Chief Happiness Officer", "World's Best Hugger", "Professional Overthinker"];
