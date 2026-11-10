"use client";

import { useEffect, useRef, useState } from "react";
import type { BlockConfigMap, BlockType, MediaItem, WishType } from "@/lib/wish/schema";
import { LIMITS, uploadFiles } from "./uploads";
import { AWARD_IDEAS, QUIRK_PRESETS, QUIZ_IDEAS, memoryIdeas, messageLines } from "./ui";

export interface EditorEnv {
    name: string;
    relationship: string;
    vibe: string;
    wishType: WishType;
    /** photos already uploaded in this wish (for re-use in the puzzle) */
    photos: MediaItem[];
    react: () => void;
}

type EditorProps<K extends BlockType> = { value: BlockConfigMap[K]; onChange: (v: BlockConfigMap[K]) => void; env: EditorEnv };

/* ---------- shared bits ---------- */
function TextArea({ value, onChange, max, placeholder, label }: { value: string; onChange: (v: string) => void; max: number; placeholder: string; label: string }) {
    return (
        <>
            <textarea className="wz2-field" aria-label={label} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
            <div className="wz2-count">{value.length}/{max}</div>
        </>
    );
}

function Ideas({ label, items, onPick, short = 46 }: { label: string; items: string[]; onPick: (s: string) => void; short?: number }) {
    return (
        <>
            <span className="wz2-label">💡 {label}</span>
            <div className="wz2-chips">
                {items.map((it) => (
                    <button key={it} type="button" className="wz2-chip" onClick={() => onPick(it)} title={it}>
                        {it.length > short ? `${it.slice(0, short)}…` : it}
                    </button>
                ))}
            </div>
        </>
    );
}

function useUpload() {
    const [pct, setPct] = useState<number | null>(null);
    const [error, setError] = useState("");
    const abort = useRef<AbortController | null>(null);
    const run = async <T,>(fn: (signal: AbortSignal, onPct: (n: number) => void) => Promise<T>): Promise<T | null> => {
        setError(""); setPct(0);
        abort.current = new AbortController();
        try { return await fn(abort.current.signal, setPct); }
        catch (e) { const m = (e as Error).message; if (m !== "Upload cancelled") setError(m || "Upload failed"); return null; }
        finally { setPct(null); abort.current = null; }
    };
    return { pct, error, run, cancel: () => abort.current?.abort() };
}

function Progress({ pct, onCancel }: { pct: number | null; onCancel: () => void }) {
    if (pct === null) return null;
    return (
        <div style={{ marginTop: 12 }} aria-live="polite">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13 }}>
                <span>Uploading… {pct}%</span>
                <button type="button" className="wz2-edit" onClick={onCancel}>Cancel</button>
            </div>
            <div className="wz2-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
    );
}

/* ---------- Editors ---------- */

function PhotosEditor({ value, onChange, env }: EditorProps<"photos">) {
    const up = useUpload();
    const input = useRef<HTMLInputElement>(null);
    const items = value.items;
    const nPhotos = items.filter((m) => m.type === "photo").length;
    const nVideos = items.filter((m) => m.type === "video").length;
    const [warn, setWarn] = useState("");

    const onFiles = async (list: FileList | null) => {
        if (!list?.length) return;
        const ok: File[] = []; let p = nPhotos, v = nVideos; const skipped: string[] = [];
        for (const f of Array.from(list)) {
            const isVideo = f.type.startsWith("video/");
            if (f.size > LIMITS.maxBytes) { skipped.push(`${f.name} (over 25 MB)`); continue; }
            if (isVideo ? v >= LIMITS.maxVideos : p >= LIMITS.maxPhotos) { skipped.push(`${f.name} (limit reached)`); continue; }
            ok.push(f); if (isVideo) v++; else p++;
        }
        setWarn(skipped.length ? `Skipped: ${skipped.join(", ")}` : "");
        if (input.current) input.current.value = "";
        if (!ok.length) return;
        const res = await up.run((signal, onPct) => uploadFiles(ok, (pr) => onPct(pr.percent), { signal }));
        if (res) { onChange({ items: [...items, ...res.map((r) => ({ url: r.url, type: r.type === "video" ? "video" : "photo" } as MediaItem))] }); env.react(); }
    };
    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir; if (j < 0 || j >= items.length) return;
        const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange({ items: n });
    };

    return (
        <>
            <label className="wz2-drop">
                <div className="e" aria-hidden="true">🖼️</div>
                <b>Tap to add photos or videos</b>
                <p style={{ color: "var(--p-muted)", fontWeight: 700, fontSize: 13, marginTop: 4 }}>Up to {LIMITS.maxPhotos} photos + {LIMITS.maxVideos} videos · max 25 MB each</p>
                <input ref={input} type="file" accept="image/*,video/*" multiple hidden disabled={up.pct !== null} onChange={(e) => onFiles(e.target.files)} />
            </label>
            <Progress pct={up.pct} onCancel={up.cancel} />
            {(up.error || warn) && <div className="wz2-error">{up.error || warn}</div>}
            {items.length > 0 && (
                <div className="wz2-thumbs">
                    {items.map((m, i) => (
                        <div key={m.url} className="wz2-thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {m.type === "video" ? <video src={m.url} muted playsInline /> : <img src={m.url} alt={`Photo ${i + 1}`} />}
                            <div className="acts">
                                <button type="button" onClick={() => move(i, -1)} aria-label="Move left" disabled={i === 0}>‹</button>
                                <button type="button" onClick={() => onChange({ items: items.filter((_, k) => k !== i) })} aria-label="Remove">✕</button>
                                <button type="button" onClick={() => move(i, 1)} aria-label="Move right" disabled={i === items.length - 1}>›</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function MemoryEditor({ value, onChange, env }: EditorProps<"memory">) {
    return (
        <>
            <TextArea label="Memory" value={value.text} max={400} placeholder="Remember when…" onChange={(t) => onChange({ text: t })} />
            <Ideas label="Need ideas? Tap one" items={memoryIdeas(env.relationship, env.wishType)} onPick={(t) => { onChange({ text: t }); env.react(); }} />
        </>
    );
}

function QuirksEditor({ value, onChange, env }: EditorProps<"quirks">) {
    const [custom, setCustom] = useState("");
    const items = value.items;
    const toggle = (q: string) => {
        if (items.includes(q)) onChange({ items: items.filter((x) => x !== q) });
        else if (items.length < 6) { onChange({ items: [...items, q] }); env.react(); }
    };
    return (
        <>
            <div className="wz2-chips" aria-label="Selected">
                {items.length === 0 && <span className="wz2-sub" style={{ margin: 0 }}>Nothing picked yet: choose up to 6 below.</span>}
                {items.map((q) => <button key={q} type="button" className="wz2-chip is-on" onClick={() => toggle(q)}>{q} ✕</button>)}
            </div>
            <form style={{ display: "flex", gap: 8, marginTop: 14 }} onSubmit={(e) => { e.preventDefault(); const c = custom.trim(); if (c) { toggle(c); setCustom(""); } }}>
                <input className="wz2-field" style={{ fontSize: 15, padding: "12px 14px" }} value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own…" aria-label="Add your own" disabled={items.length >= 6} />
                <button type="submit" className="bw-btn bw-btn-primary bw-btn-sm" disabled={!custom.trim() || items.length >= 6}>Add</button>
            </form>
            <Ideas label="Suggestions" items={QUIRK_PRESETS[env.wishType].filter((q) => !items.includes(q))} onPick={toggle} />
        </>
    );
}

function QuizEditor({ value, onChange, env }: EditorProps<"quiz">) {
    const qs = value.questions.length ? value.questions : [{ q: "", a: "" }];
    const set = (i: number, k: "q" | "a", v: string) => onChange({ questions: qs.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
    const fillIdea = (idea: string) => {
        const i = qs.findIndex((x) => !x.q.trim());
        if (i >= 0) set(i, "q", idea);
        else if (qs.length < 10) onChange({ questions: [...qs, { q: idea, a: "" }] });
        env.react();
    };
    return (
        <>
            <div style={{ display: "grid", gap: 12 }}>
                {qs.map((x, i) => (
                    <div key={i} className="bw-card" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ fontSize: 13, color: "var(--p-pink)" }}>Question {i + 1}</b>
                            {qs.length > 1 && <button type="button" className="wz2-edit" onClick={() => onChange({ questions: qs.filter((_, j) => j !== i) })}>Remove</button>}
                        </div>
                        <input className="wz2-field" style={{ fontSize: 15, padding: "12px 14px", marginTop: 6 }} value={x.q} maxLength={120} placeholder="e.g. Where did we first meet?" onChange={(e) => set(i, "q", e.target.value)} aria-label={`Question ${i + 1}`} />
                        <input className="wz2-field" style={{ fontSize: 15, padding: "12px 14px", marginTop: 8 }} value={x.a} maxLength={60} placeholder="Answer (not case-sensitive)" onChange={(e) => set(i, "a", e.target.value)} aria-label={`Answer ${i + 1}`} />
                    </div>
                ))}
            </div>
            <div className="wz2-chips"><button type="button" className="wz2-chip" disabled={qs.length >= 10} onClick={() => onChange({ questions: [...qs, { q: "", a: "" }] })}>＋ Add question ({qs.length}/10)</button></div>
            <Ideas label="Question ideas" items={QUIZ_IDEAS[env.wishType]} onPick={fillIdea} />
        </>
    );
}

function RoastEditor({ value, onChange }: EditorProps<"roast">) {
    const em = value.level < 25 ? "🥂" : value.level < 50 ? "😊" : value.level < 75 ? "😏" : "🔥";
    return (
        <div className="bw-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 58 }} aria-hidden="true">{em}</div>
            <input type="range" min={0} max={100} value={value.level} onChange={(e) => onChange({ level: Number(e.target.value) })} aria-label="Roast level" style={{ width: "100%", accentColor: "var(--p-pink)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "var(--p-muted)", fontSize: 13 }}><span>🥂 Sweet toast</span><b style={{ color: "var(--p-text)" }}>{value.level}%</b><span>🔥 Full roast</span></div>
        </div>
    );
}

function AwardEditor({ value, onChange, env }: EditorProps<"award">) {
    return (
        <>
            <input className="wz2-field" value={value.title} maxLength={80} placeholder="e.g. Best Human of 2026" onChange={(e) => onChange({ title: e.target.value })} aria-label="Award title" />
            <Ideas label="Award ideas" items={AWARD_IDEAS} onPick={(t) => { onChange({ title: t }); env.react(); }} />
        </>
    );
}

function PuzzleEditor({ value, onChange, env }: EditorProps<"puzzle">) {
    const up = useUpload();
    const photos = env.photos.filter((m) => m.type === "photo");
    const onFile = async (f?: File) => {
        if (!f) return;
        const res = await up.run((signal, onPct) => uploadFiles([f], (p) => onPct(p.percent), { signal, resource: "image" }));
        if (res?.[0]) { onChange({ imageUrl: res[0].url }); env.react(); }
    };
    return (
        <>
            {photos.length > 0 && (
                <>
                    <span className="wz2-label">Use one of your photos</span>
                    <div className="wz2-thumbs">
                        {photos.map((m) => (
                            <button key={m.url} type="button" className="wz2-thumb" style={{ outline: value.imageUrl === m.url ? "4px solid var(--p-pink)" : "none" }} onClick={() => onChange({ imageUrl: m.url })} aria-label="Use this photo">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={m.url} alt="" />
                            </button>
                        ))}
                    </div>
                </>
            )}
            <span className="wz2-label">…or upload a different one</span>
            <label className="wz2-drop"><div className="e" aria-hidden="true">🧩</div><b>{value.imageUrl ? "Change puzzle photo" : "Upload puzzle photo"}</b>
                <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} disabled={up.pct !== null} />
            </label>
            <Progress pct={up.pct} onCancel={up.cancel} />
            {up.error && <div className="wz2-error">{up.error}</div>}
        </>
    );
}

function SecretDateEditor({ value, onChange }: EditorProps<"secretDate">) {
    return (
        <>
            <input className="wz2-field" type="date" value={value.date} onChange={(e) => onChange({ date: e.target.value })} aria-label="Secret date" />
            <p className="wz2-sub" style={{ marginTop: 10 }}>They must enter this exact date to continue (or it auto-skips after 60 seconds).</p>
        </>
    );
}

function MessageEditor({ value, onChange, env }: EditorProps<"message">) {
    return (
        <>
            <TextArea label="Your message" value={value.text} max={800} placeholder={`Happy ${env.wishType === "anniversary" ? "anniversary" : "birthday"} ${env.name}…`} onChange={(t) => onChange({ text: t })} />
            <Ideas label="Ready-made lines (tap to use, then make it yours)" items={messageLines(env.name, env.relationship, env.vibe, env.wishType)} onPick={(t) => { onChange({ text: t }); env.react(); }} short={52} />
        </>
    );
}

function VoiceEditor({ value, onChange, env }: EditorProps<"voice">) {
    const [state, setState] = useState<"idle" | "recording" | "uploading">("idle");
    const [secs, setSecs] = useState(0);
    const [error, setError] = useState("");
    const rec = useRef<MediaRecorder | null>(null);
    const chunks = useRef<BlobPart[]>([]);
    const timer = useRef<number | null>(null);
    useEffect(() => () => { if (timer.current) clearInterval(timer.current); rec.current?.stream.getTracks().forEach((t) => t.stop()); }, []);

    const start = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            rec.current = mr; chunks.current = [];
            mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
            mr.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                if (timer.current) clearInterval(timer.current);
                const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
                setState("uploading");
                try {
                    const [res] = await uploadFiles([blob], undefined, { resource: "video" }); // Cloudinary stores audio as "video"
                    onChange({ audioUrl: res.url }); env.react();
                } catch (e) { setError((e as Error).message || "Upload failed"); }
                setState("idle");
            };
            mr.start();
            setSecs(0); setState("recording");
            timer.current = window.setInterval(() => setSecs((s) => { if (s + 1 >= 120) mr.stop(); return s + 1; }), 1000);
        } catch {
            setError("Microphone permission was blocked. Allow the mic in your browser settings, or skip this step.");
        }
    };

    return (
        <div className="bw-card" style={{ padding: 26, textAlign: "center" }}>
            {value.audioUrl && state === "idle" ? (
                <>
                    <audio controls src={value.audioUrl} style={{ width: "100%" }} />
                    <div className="wz2-chips" style={{ justifyContent: "center" }}>
                        <button type="button" className="wz2-chip" onClick={start}>↻ Re-record</button>
                        <button type="button" className="wz2-chip" onClick={() => onChange({ audioUrl: "" })}>🗑 Remove</button>
                    </div>
                </>
            ) : (
                <>
                    <button type="button" onClick={state === "recording" ? () => rec.current?.stop() : start} disabled={state === "uploading"}
                        aria-label={state === "recording" ? "Stop recording" : "Start recording"}
                        style={{ width: 110, height: 110, borderRadius: "50%", fontSize: 44, color: "#fff", background: state === "recording" ? "#f43f5e" : "linear-gradient(135deg,var(--p-pink),var(--p-orange))", boxShadow: "0 14px 30px rgba(255,92,138,.4)" }}>
                        {state === "recording" ? "■" : state === "uploading" ? "…" : "🎤"}
                    </button>
                    <p style={{ fontWeight: 800, marginTop: 14 }} aria-live="polite">
                        {state === "recording" ? `● Recording… 0:${String(secs).padStart(2, "0")} (tap to stop)` : state === "uploading" ? "Saving your voice note…" : "Tap the mic to record (max 2 min)"}
                    </p>
                </>
            )}
            {error && <div className="wz2-error">{error}</div>}
        </div>
    );
}

function GratitudeEditor({ value, onChange }: EditorProps<"gratitude">) {
    return <TextArea label="Gratitude" value={value.text} max={300} placeholder="…you always pick up my 2 AM calls" onChange={(t) => onChange({ text: t })} />;
}

function PromiseEditor({ value, onChange }: EditorProps<"promise">) {
    return (
        <>
            <TextArea label="Promise" value={value.text} max={200} placeholder="e.g. Pizza is on me this weekend 🍕" onChange={(t) => onChange({ ...value, text: t })} />
            <div className="bw-card" style={{ padding: "6px 14px", marginTop: 12 }}>
                <label className="wz2-row"><span>🪙 Hide it under a scratch card</span><input type="checkbox" checked={value.scratchOff} onChange={(e) => onChange({ ...value, scratchOff: e.target.checked })} /></label>
                <label className="wz2-row"><span>😊 They must smile at the camera to unlock</span><input type="checkbox" checked={value.smileLock} onChange={(e) => onChange({ ...value, smileLock: e.target.checked })} /></label>
            </div>
        </>
    );
}

const GIFT_KINDS = [{ id: "amazon", e: "📦", t: "Amazon" }, { id: "flipkart", e: "🛒", t: "Flipkart" }, { id: "swiggy", e: "🍔", t: "Swiggy" }, { id: "myntra", e: "👗", t: "Myntra" }, { id: "dineout", e: "🍽️", t: "Dineout" }, { id: "custom", e: "🎁", t: "Other / PDF" }];

function GiftCardEditor({ value, onChange, env }: EditorProps<"giftCard">) {
    const up = useUpload();
    const onFile = async (f?: File) => {
        if (!f) return;
        if (f.size > LIMITS.maxBytes) return;
        const res = await up.run((signal, onPct) => uploadFiles([f], (p) => onPct(p.percent), { signal }));
        if (res?.[0]) { onChange({ ...value, url: res[0].url }); env.react(); }
    };
    return (
        <>
            <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                {GIFT_KINDS.map((k) => (
                    <button key={k.id} type="button" className={`bw-card wz2-choice ${value.kind === k.id ? "is-on" : ""}`} onClick={() => onChange({ ...value, kind: k.id })}>
                        <span className="e" aria-hidden="true">{k.e}</span><h4>{k.t}</h4>
                    </button>
                ))}
            </div>
            <span className="wz2-label">Gift card image or PDF</span>
            {value.url ? (
                <div className="bw-card wz2-item"><span className="e">✅</span><div className="grow"><b>Gift card uploaded</b><small style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.url}</small></div><button type="button" className="wz2-edit" onClick={() => onChange({ ...value, url: "" })}>Remove</button></div>
            ) : (
                <label className="wz2-drop"><div className="e" aria-hidden="true">📤</div><b>Upload gift card</b><input type="file" accept="image/*,.pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} disabled={up.pct !== null} /></label>
            )}
            <Progress pct={up.pct} onCancel={up.cancel} />
            {up.error && <div className="wz2-error">{up.error}</div>}
            <span className="wz2-label">Message on the gift</span>
            <input className="wz2-field" value={value.message ?? ""} maxLength={120} placeholder="I got you a little something…" onChange={(e) => onChange({ ...value, message: e.target.value })} aria-label="Gift message" />
        </>
    );
}

export const EDITORS: Partial<{ [K in BlockType]: (p: EditorProps<K>) => React.ReactNode }> = {
    photos: PhotosEditor, memory: MemoryEditor, quirks: QuirksEditor, quiz: QuizEditor, roast: RoastEditor, award: AwardEditor,
    puzzle: PuzzleEditor, secretDate: SecretDateEditor, message: MessageEditor, voice: VoiceEditor, gratitude: GratitudeEditor,
    promise: PromiseEditor, giftCard: GiftCardEditor,
};

/** Title / subtitle / Cuppy line for each block step ({name} is replaced). */
export const BLOCK_COPY: Partial<Record<BlockType, { title: string; sub: string; tip: string }>> = {
    photos: { title: "Add photos of {name} 📸", sub: "They appear one by one, like a memory lane.", tip: "Photos make people smile instantly. Got some good ones of {name}?" },
    memory: { title: "Which memory with {name} makes you smile?", sub: "Write it like you're telling them face to face.", tip: "Small details hit hardest: the place, the time, the joke." },
    quirks: { title: "Things you love about {name} 💖", sub: "Pick up to 6. They float on screen as little bubbles.", tip: "Inside jokes make people cry happy tears 🥹" },
    quiz: { title: "Quiz: does {name} really know you? 🧠", sub: "They must answer to continue (auto-skips after 60 s). 1–10 questions.", tip: "Keep answers short, like one word, so they can type them." },
    roast: { title: "Toast or roast {name}? 🎚️", sub: "Set the spice level for the roast meter.", tip: "How spicy should it get? 🌶️" },
    award: { title: "Give {name} an award 🏆", sub: "A funny or sweet title they 'officially win'.", tip: "Make it a little ridiculous, it's funnier 😂" },
    puzzle: { title: "Turn a photo into a puzzle 🧩", sub: "They slide tiles to unscramble it (auto-skips after 60 s).", tip: "Faces and bright photos make the best puzzles." },
    secretDate: { title: "A secret date only you two know 🔒", sub: "First meeting, first trip, an inside-joke day…", tip: "If they forget this date… that's a conversation 😅" },
    message: { title: "Your message to {name} 💌", sub: "This is the big moment of the surprise. Short is totally fine.", tip: "The most important part. Say what's in your heart." },
    voice: { title: "Record a voice note for {name} 🎤", sub: "Hearing your voice hits different. Even 10 seconds is enough.", tip: "Find a quiet spot and just talk to them." },
    gratitude: { title: "What are you thankful for? 🙏", sub: "Finish the sentence: \"I'm so thankful… because…\"", tip: "One honest sentence is enough." },
    promise: { title: "Make {name} a promise 🤞", sub: "Hide it under a scratch card for extra fun.", tip: "Promises they can claim later are the best gifts." },
    giftCard: { title: "Add a gift card 🎁 (optional)", sub: "Upload a gift card image or PDF they can open at the end.", tip: "A small treat at the end feels amazing." },
};
