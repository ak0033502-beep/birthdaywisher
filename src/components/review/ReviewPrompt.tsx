"use client";

/**
 * Quick, friendly review prompt used in two moments:
 *  - who="creator"   → popup right after a wish is created (Wizard finish screen)
 *  - who="recipient" → inline card at the very end of a wish (Grand Finale afterglow)
 *
 * One tap on a face is enough; message + name are optional. Asks politely and remembers
 * the answer on this device, so nobody is asked again and again.
 */
import "./review.css";
import { useEffect, useState } from "react";
import { track } from "@/lib/track";

export type ReviewWho = "creator" | "recipient";

const FACES = [
    { r: 1, e: "😢", t: "Not good" },
    { r: 2, e: "😕", t: "Meh" },
    { r: 3, e: "🙂", t: "Okay" },
    { r: 4, e: "😍", t: "Loved it" },
    { r: 5, e: "🥳", t: "Amazing!" },
];

const DAY = 86_400_000;
const keyFor = (who: ReviewWho, wishId?: string) => (who === "recipient" ? `bw_rv_r_${wishId || "demo"}` : "bw_rv_creator");

/** Should we ask this person for a review right now? (device-local, no tracking) */
export function shouldAskReview(who: ReviewWho, wishId?: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = localStorage.getItem(keyFor(who, wishId));
        if (!raw) return true;
        const { s, at } = JSON.parse(raw) as { s: "done" | "skip"; at: number };
        if (who === "recipient") return false; // once per wish
        const wait = s === "done" ? 60 * DAY : 3 * DAY; // creators: re-ask after 60 days (done) / 3 days (later)
        return Date.now() - at > wait;
    } catch {
        return true;
    }
}

function remember(who: ReviewWho, wishId: string | undefined, s: "done" | "skip") {
    try { localStorage.setItem(keyFor(who, wishId), JSON.stringify({ s, at: Date.now() })); } catch { /* private mode */ }
}

const COPY = {
    creator: {
        kicker: "Your surprise is ready 🎉",
        title: "How was making it?",
        good: "What did you love the most? (optional)",
        bad: "What should we make better? (optional)",
        rel: "Made it for my…",
    },
    recipient: {
        kicker: "Before you go…",
        title: "How did this surprise make you feel?",
        good: "Tell us how it felt (optional)",
        bad: "What could be better? (optional)",
        rel: "",
    },
};
const RELS = ["Friend", "Partner", "Sibling", "Parent", "Colleague", "Other"];

export function ReviewPrompt({ who, wishId, mode, onClose }: { who: ReviewWho; wishId?: string; mode: "modal" | "inline"; onClose?: () => void }) {
    const c = COPY[who];
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [rel, setRel] = useState("Friend");
    const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
    const [err, setErr] = useState("");

    // Esc closes the popup
    useEffect(() => {
        if (mode !== "modal") return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { remember(who, wishId, "skip"); onClose?.(); } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mode, who, wishId, onClose]);

    // Auto-close the popup shortly after a successful review
    useEffect(() => {
        if (state !== "done" || mode !== "modal") return;
        const t = setTimeout(() => onClose?.(), 2600);
        return () => clearTimeout(t);
    }, [state, mode, onClose]);

    const later = () => { remember(who, wishId, "skip"); onClose?.(); };

    const submit = async () => {
        if (!rating) return;
        setState("sending");
        setErr("");
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: who, rating, wishId,
                    message: message.trim(), name: name.trim(),
                    relationship: who === "creator" ? rel : "Recipient",
                }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                setErr(j.error || "Couldn't send. Please try again.");
                setState("error");
                return;
            }
            remember(who, wishId, "done");
            track("review_submit", { who, rating }, wishId);
            setState("done");
        } catch {
            setErr("No internet? Please try again.");
            setState("error");
        }
    };

    const picked = FACES.find((f) => f.r === rating);

    const card = (
        <div className={`rv-card rv-${mode}`} role={mode === "modal" ? "dialog" : "region"} aria-modal={mode === "modal" || undefined} aria-label={c.title}>
            {mode === "modal" && state !== "done" && (
                <button type="button" className="rv-x" onClick={later} aria-label="Close">✕</button>
            )}

            {state === "done" ? (
                <div className="rv-thanks" aria-live="polite">
                    <div className="rv-thanks-e" aria-hidden="true">{rating >= 4 ? "🥰" : "🙏"}</div>
                    <h3>Thank you! ❤️</h3>
                    <p>{rating >= 4 ? "You just made our day." : "Thanks for telling us. We'll make it better."}</p>
                    {mode === "modal" && <button type="button" className="rv-btn" onClick={onClose}>Close</button>}
                </div>
            ) : (
                <>
                    <p className="rv-kicker">{c.kicker}</p>
                    <h3 className="rv-title">{c.title}</h3>
                    <div className="rv-faces" role="radiogroup" aria-label="Your rating">
                        {FACES.map((f) => (
                            <button
                                key={f.r}
                                type="button"
                                role="radio"
                                aria-checked={rating === f.r}
                                aria-label={`${f.r} of 5: ${f.t}`}
                                className={`rv-face ${rating === f.r ? "is-on" : ""} ${rating && rating !== f.r ? "is-dim" : ""}`}
                                onClick={() => setRating(f.r)}
                            >
                                <span aria-hidden="true">{f.e}</span>
                            </button>
                        ))}
                    </div>
                    <p className="rv-pick" aria-live="polite">{picked ? picked.t : "Tap a face"}</p>

                    {rating > 0 && (
                        <div className="rv-more">
                            <textarea
                                className="rv-field"
                                rows={2}
                                maxLength={500}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={rating >= 4 ? c.good : c.bad}
                                aria-label={rating >= 4 ? c.good : c.bad}
                            />
                            <input
                                className="rv-field"
                                maxLength={60}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name (optional)"
                                aria-label="Your name (optional)"
                            />
                            {who === "creator" && (
                                <div className="rv-rels" aria-label={c.rel}>
                                    <span>{c.rel}</span>
                                    {RELS.map((r) => (
                                        <button key={r} type="button" className={`rv-chip ${rel === r ? "is-on" : ""}`} onClick={() => setRel(r)}>{r}</button>
                                    ))}
                                </div>
                            )}
                            {err && <p className="rv-err" role="alert">{err}</p>}
                            <button type="button" className="rv-btn" onClick={submit} disabled={state === "sending"}>
                                {state === "sending" ? "Sending…" : "Send review ❤️"}
                            </button>
                        </div>
                    )}
                    <button type="button" className="rv-later" onClick={later}>{mode === "modal" ? "Maybe later" : "No thanks"}</button>
                </>
            )}
        </div>
    );

    if (mode === "inline") return card;
    return (
        <div className="rv-overlay" onClick={(e) => { if (e.target === e.currentTarget) later(); }}>
            {card}
        </div>
    );
}
