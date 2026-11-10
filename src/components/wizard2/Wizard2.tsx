"use client";

import "./wizard2.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { languages } from "@/lib/i18n";
import { BLOCKS, isGame, type GameType } from "@/blocks/registry";
import type { BlockConfigMap, BlockType, MediaItem, WishType } from "@/lib/wish/schema";
import { Balloons, GiftCube } from "@/components/party/Decor";
import { PartyThemeToggle } from "@/components/party/PartyThemeToggle";
import { burst, useTier } from "@/components/party/interactions";
import {
    CHAPTERS, INGREDIENTS, REQUIRED, TEMPLATES, applyTemplate, buildWish, getConfig, isOn, newDraft, recommended,
    stepValid, supports, visibleSteps, wishPower, chosenGames, MAX_GAMES, type Draft, type Mode,
} from "./draft";
import { CandlesEditor, COMING_SOON, GAME_LIBRARY, PlacementChips, PrankEditor, TriviaEditor } from "./gameEditors";
import { BLOCK_COPY, EDITORS, type EditorEnv } from "./editors";
import { Cuppy, PowerMeter, RELATIONS, VIBES, popSound, useWizardSettings } from "./ui";
import { FullPreview, PreviewPhone } from "./PreviewPhone";

const DRAFT_KEY = "bw-wizard2-draft";

const BIRTHDAY_SKINS = [
    { id: "party", t: "Party Pop", e: "🎉", bg: "linear-gradient(160deg,#FFE3EC,#FFF1C9)" },
    { id: "neon", t: "Neon Night", e: "🌌", bg: "linear-gradient(160deg,#312e81,#09090b)" },
    { id: "elegant", t: "Golden Elegant", e: "🥂", bg: "linear-gradient(160deg,#292524,#000)" },
    { id: "pastel", t: "Pastel Dream", e: "🌸", bg: "linear-gradient(160deg,#ffe4e6,#ede9fe)" },
    { id: "monochrome", t: "Monochrome", e: "🖤", bg: "linear-gradient(160deg,#27272a,#09090b)" },
    { id: "paper", t: "Old Paper", e: "📜", bg: "#d4c5b0" },
];
const ANNIVERSARY_SKINS = [
    { id: "rosegold-elegance", t: "Rose Gold", e: "🌹", bg: "linear-gradient(160deg,#3b1d2a,#120a10)" },
    { id: "golden-anniversary", t: "Golden", e: "🥇", bg: "linear-gradient(160deg,#3f2d0c,#0c0a05)" },
    { id: "moonlit-romance", t: "Moonlit", e: "🌙", bg: "linear-gradient(160deg,#1e1b4b,#020617)" },
    { id: "vintage-love", t: "Vintage Love", e: "💌", bg: "#e9dcc9" },
    { id: "cherry-blossom", t: "Cherry Blossom", e: "🌸", bg: "linear-gradient(160deg,#fff1f2,#fce7f3)" },
    { id: "royal-navy", t: "Royal Navy", e: "⚓", bg: "linear-gradient(160deg,#1e3a8a,#020617)" },
];
const STYLES = [
    { id: "cinematic", e: "🎬", t: "Cinematic", d: "New engine · uses your colour skin" },
    { id: "terminal", e: "💻", t: "Hacker Terminal", d: "Classic style" },
    { id: "storybook", e: "📖", t: "Storybook", d: "Classic style" },
    { id: "messenger", e: "💬", t: "Secret Chat", d: "Classic style" },
    { id: "galaxy", e: "🪐", t: "Space Odyssey", d: "Classic style" },
    { id: "gallery", e: "🖼️", t: "Art Museum", d: "Classic style" },
];
const FINALES = [{ id: "confetti", t: "🎊 Confetti" }, { id: "hearts", t: "💗 Hugs & hearts" }, { id: "lanterns", t: "🏮 Lanterns" }];

const fill = (s: string, name: string) => s.replace(/\{name\}/g, name || "them");

function loadDraft(): Draft | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw) as Draft;
        return d && d.v === 1 ? { ...newDraft(d.wishType), ...d } : null;
    } catch { return null; }
}

export function Wizard2() {
    const params = useSearchParams();
    const typeParam: WishType = params.get("type") === "anniversary" ? "anniversary" : "birthday";
    const tier = useTier();
    const { settings, toggle } = useWizardSettings();

    const [d, setD] = useState<Draft>(() => newDraft(typeParam));
    const [loaded, setLoaded] = useState(false);
    const [resume, setResume] = useState<Draft | null>(null);
    const [dir, setDir] = useState<"next" | "prev">("next");
    const [savedAt, setSavedAt] = useState(0);
    const [menu, setMenu] = useState(false);
    const [cuppyHidden, setCuppyHidden] = useState(false);
    const [happy, setHappy] = useState(0);
    const [sheet, setSheet] = useState(false);
    const [full, setFull] = useState(false);
    const [nudge, setNudge] = useState("");
    const [result, setResult] = useState<{ id: string; slug?: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState("");

    /* ---------- load / autosave ---------- */
    useEffect(() => {
        const saved = loadDraft();
        if (saved && saved.recipient.name && saved.step !== "finish" && saved.wishType === typeParam) setResume(saved);
        setLoaded(true);
    }, [typeParam]);

    useEffect(() => {
        if (!loaded || d.step === "start") return;
        const t = setTimeout(() => {
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); setSavedAt(Date.now()); } catch { /* storage full */ }
        }, 350);
        return () => clearTimeout(t);
    }, [d, loaded]);

    /* ---------- derived ---------- */
    const steps = useMemo(() => visibleSteps(d), [d]);
    const idx = Math.max(0, steps.findIndex((s) => s.id === d.step));
    const step = steps[idx];
    const wish = useMemo(() => buildWish(d), [d]);
    const power = wishPower(d);
    const name = d.recipient.name.trim();
    const Name = name || (d.wishType === "anniversary" ? "the couple" : "them");

    const patch = useCallback((p: Partial<Draft>) => { setNudge(""); setD((x) => ({ ...x, ...p })); }, []);
    const setConfig = useCallback(<K extends BlockType>(type: K, v: BlockConfigMap[K]) => { setNudge(""); setD((x) => ({ ...x, configs: { ...x.configs, [type]: v } })); }, []);
    const react = useCallback(() => { setHappy((n) => n + 1); popSound(settings.sound, 620); }, [settings.sound]);
    const celebrate = useCallback((el?: Element | null, n = 50) => {
        if (!settings.celebrate) return popSound(settings.sound);
        const r = el?.getBoundingClientRect();
        burst(r ? r.left + r.width / 2 : window.innerWidth / 2, r ? r.top + r.height / 2 : 140, n);
        popSound(settings.sound, 700);
    }, [settings.celebrate, settings.sound]);

    const goTo = useCallback((id: string, direction: "next" | "prev" = "next") => {
        setDir(direction); setCuppyHidden(false); setNudge("");
        setD((x) => ({ ...x, step: id }));
        window.scrollTo({ top: 0 });
    }, []);

    const next = useCallback(() => {
        if (!stepValid(d, step)) {
            setNudge(step.id === "name" ? "Add their name to continue 👆" : step.block === "message" ? "Write a short message, or tap a ready-made line 👇" : step.id === "games" ? "Finish the quiz questions (question, 2+ options, tap the right one) or remove the game 🎮" : "Please complete this step");
            return;
        }
        const nxt = steps[idx + 1];
        if (!nxt) return;
        if (nxt.chapter !== step.chapter && step.chapter >= 0) celebrate(null, 60);
        goTo(nxt.id, "next");
    }, [d, step, steps, idx, goTo, celebrate]);

    const back = useCallback(() => { const p = steps[idx - 1]; if (p) goTo(p.id, "prev"); }, [steps, idx, goTo]);

    const canReach = (target: number) => steps.slice(0, target).every((s) => stepValid(d, s));

    /* ---------- save to server ---------- */
    const create = async () => {
        setBusy(true); setSaveError("");
        try {
            const body = { ...wish, ...(d.customSlug ? { customSlug: d.customSlug } : {}) };
            const res = await fetch("/api/wish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok || !data.id) throw new Error(data.error || "Could not create the link");
            try { if (data.creatorToken) localStorage.setItem(`creator_token_${data.id}`, data.creatorToken); } catch { /* ignore */ }
            try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
            setResult({ id: data.id, slug: d.customSlug || undefined });
            goTo("finish");
        } catch (e) {
            setSaveError((e as Error).message || "Something went wrong. Your draft is saved; please try again.");
        } finally { setBusy(false); }
    };

    /* ---------- editor env ---------- */
    const photos: MediaItem[] = isOn(d, "photos") ? getConfig(d, "photos").items : [];
    const env: EditorEnv = { name, relationship: d.recipient.relationship, vibe: d.recipient.vibe, wishType: d.wishType, photos, react };

    /* ---------- chapters bar ---------- */
    const usedChapters = [...new Set(steps.filter((s) => s.chapter >= 0).map((s) => s.chapter))];

    if (!loaded) return <div className="party wz2" />;

    const cuppyLine = cuppyFor(step.id, step.block, d, Name);

    return (
        <div className="party wz2">
            <Balloons count={tier === "low" ? 0 : 6} />

            {/* Top bar */}
            {step.id !== "finish" && (
                <div className="wz2-top">
                    <div className="wz2-top-in">
                        <Link href="/" className="wz2-x" aria-label="Exit to homepage">✕</Link>
                        <nav className="wz2-chapters" aria-label="Chapters">
                            {usedChapters.map((c, n) => {
                                const first = steps.findIndex((s) => s.chapter === c);
                                const state = step.chapter === c ? "is-now" : step.chapter > c ? "is-done" : "";
                                return (
                                    <button key={c} type="button" className={`wz2-ch ${state}`} onClick={() => (first <= idx || canReach(first) ? goTo(steps[first].id, first < idx ? "prev" : "next") : setNudge("Finish the required steps first 🙂"))}>
                                        <span className="n">{state === "is-done" ? "✓" : n + 1}</span><span className="t">{CHAPTERS[c]}</span>
                                    </button>
                                );
                            })}
                        </nav>
                        {d.step !== "start" && <span className="wz2-saved" aria-live="polite">{savedAt ? "Saved ✓" : ""}</span>}
                        <div className="wz2-gear">
                            <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Wizard settings">⚙️</button>
                            {menu && (
                                <div className="bw-card wz2-menu" role="menu">
                                    <h5>Wizard settings</h5>
                                    {([["mascot", "🧁 Cuppy (guide)"], ["sound", "🔊 Sounds"], ["celebrate", "🎉 Celebrations"]] as const).map(([k, l]) => (
                                        <div key={k} className="wz2-row">{l}<button type="button" role="switch" aria-checked={settings[k]} className={`wz2-switch ${settings[k] ? "is-on" : ""}`} onClick={() => { toggle(k); if (k === "mascot") setCuppyHidden(false); }} aria-label={l} /></div>
                                    ))}
                                    <div className="wz2-row" style={{ borderTop: "1px solid var(--p-line)", marginTop: 6, paddingTop: 12 }}>Theme <PartyThemeToggle /></div>
                                    <div className="wz2-row"><Link href="/create/classic" className="wz2-edit">Use the classic wizard</Link></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="wz2-progress"><i style={{ width: `${Math.round((idx / (steps.length - 1)) * 100)}%` }} /></div>
                </div>
            )}

            <div className="wz2-body" style={step.id === "start" || step.id === "finish" ? { gridTemplateColumns: "1fr" } : undefined}>
                <main className="wz2-main">
                    <div key={step.id} className={`wz2-step enter-${dir}`}>
                        {!cuppyHidden && <Cuppy text={cuppyLine} mascot={settings.mascot} happyKey={happy} onHide={() => setCuppyHidden(true)} />}
                        {renderStep()}
                        {nudge && <div className="wz2-error" role="alert">{nudge}</div>}
                        {step.chapter >= 0 && step.id !== "finish" && <PowerMeter {...power} />}
                    </div>
                </main>
                {step.id !== "finish" && step.id !== "start" && (
                    <aside className="wz2-side">
                        <span className="lbl">📱 LIVE PREVIEW</span>
                        <PreviewPhone wish={wish} focus={step.block ?? (step.id === "games" ? chosenGames(d)[0] ?? null : step.id === "look" ? "intro" : null)} />
                        <button type="button" className="bw-btn bw-btn-ghost bw-btn-sm" onClick={() => setFull(true)}>▶ Play full wish</button>
                    </aside>
                )}
            </div>

            {/* Bottom bar */}
            {step.id !== "finish" && step.id !== "start" && (
                <div className="wz2-bottom">
                    <div className="wz2-bottom-in">
                        <button type="button" className="bw-btn bw-btn-ghost" onClick={back} disabled={idx === 0}>◀ Back</button>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {!step.required && step.id !== "review" && step.id !== "template" && step.id !== "name" && <button type="button" className="wz2-skip" onClick={() => { const n = steps[idx + 1]; if (n) goTo(n.id); }}>Skip</button>}
                            <button type="button" className="bw-btn bw-btn-ghost bw-btn-sm wz2-prev-fab" onClick={() => setSheet(true)}>👁 Preview</button>
                        </div>
                        {step.id === "review"
                            ? <button type="button" className="bw-btn bw-btn-primary" onClick={create} disabled={busy}>{busy ? "Creating…" : "🎁 Create my surprise"}</button>
                            : <button type="button" className="bw-btn bw-btn-primary" onClick={next} style={{ opacity: stepValid(d, step) ? 1 : 0.6 }}>Next ▶</button>}
                    </div>
                </div>
            )}

            {sheet && (
                <div className="wz2-sheet" onClick={(e) => { if (e.target === e.currentTarget) setSheet(false); }}>
                    <div className="wz2-sheet-in">
                        <b>📱 Live preview</b>
                        <PreviewPhone wish={wish} focus={step.block ?? null} tilt={false} />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" className="bw-btn bw-btn-ghost bw-btn-sm" onClick={() => { setSheet(false); setFull(true); }}>▶ Play full wish</button>
                            <button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={() => setSheet(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {full && <FullPreview wish={wish} onClose={() => setFull(false)} />}
        </div>
    );

    /* ================= step renderers ================= */
    function renderStep() {
        const flip = (e: React.MouseEvent<HTMLElement>) => { if (tier === "low") return; const el = e.currentTarget; el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); };

        if (step.id === "start") {
            const pick = (m: Mode, e: React.MouseEvent<HTMLElement>) => {
                flip(e); celebrate(e.currentTarget, 40);
                const base = newDraft(typeParam);
                const nd: Draft = m === "quick" ? { ...base, mode: m } : { ...base, mode: m };
                setD({ ...nd, step: m === "template" ? "template" : "name" });
                setDir("next");
            };
            return (
                <>
                    {resume && (
                        <div className="bw-card" style={{ padding: 16, marginBottom: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 28 }} aria-hidden="true">💾</span>
                            <div style={{ flex: 1, minWidth: 180 }}><b>Continue your surprise for {resume.recipient.name}?</b><div className="wz2-sub" style={{ margin: 0 }}>Your draft was saved on this device.</div></div>
                            <button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={() => { setD(resume); setResume(null); }}>Continue</button>
                            <button type="button" className="wz2-edit" onClick={() => { setResume(null); try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }}>Start fresh</button>
                        </div>
                    )}
                    <div className="wz2-meta">Let&apos;s begin</div>
                    <h1 className="wz2-title">{d.wishType === "anniversary" ? "Create an anniversary surprise 💍" : "How do you want to create it?"}</h1>
                    <p className="wz2-sub">You can change anything later. Nothing is lost.</p>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                        <button type="button" className="bw-card wz2-mode" onClick={(e) => pick("quick", e)}><div className="e" aria-hidden="true">⚡</div><h3>Quick</h3><p>Name, a few photos and a message. Done.</p><span className="time">⏱ ~1 min</span></button>
                        <button type="button" className="bw-card wz2-mode is-rec" onClick={(e) => pick("template", e)}><div className="e" aria-hidden="true">🎨</div><h3>Template</h3><p>Pick a ready design; everything is pre-filled.</p><span className="time">⏱ ~2 min</span></button>
                        <button type="button" className="bw-card wz2-mode" onClick={(e) => pick("custom", e)}><div className="e" aria-hidden="true">🛠️</div><h3>Full Custom</h3><p>Choose every ingredient: quiz, voice, puzzle…</p><span className="time">⏱ 3–5 min</span></button>
                    </div>
                </>
            );
        }

        if (step.id === "template") {
            const list = TEMPLATES.filter((t) => t.wishType === d.wishType || d.wishType === "birthday");
            return (
                <>
                    <div className="wz2-meta">Templates</div>
                    <h1 className="wz2-title">Choose a template</h1>
                    <p className="wz2-sub">Everything is pre-filled. You only change what you want.</p>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                        {list.map((t) => (
                            <button key={t.id} type="button" className={`bw-card wz2-choice ${d.template === t.id ? "is-on" : ""}`} style={{ background: t.bg, color: "#fff" }}
                                onClick={(e) => { flip(e); setD((x) => ({ ...applyTemplate(x, t.id), step: x.step })); react(); setTimeout(() => goTo("name"), 420); }}>
                                <span className="e" aria-hidden="true">{t.e}</span><h4 style={{ color: "#fff" }}>{t.t}</h4>
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        if (step.id === "name") {
            const ann = d.wishType === "anniversary";
            return (
                <>
                    <div className="wz2-meta">Chapter 1 · About them</div>
                    <h1 className="wz2-title">{ann ? "Who's the lovely couple? 💍" : "Who's the birthday star? 🎂"}</h1>
                    <p className="wz2-sub">Their name appears all through the surprise.</p>
                    <input className="wz2-field" autoFocus value={d.recipient.name} maxLength={50} placeholder={ann ? "e.g. Riya & Aman" : "e.g. Rahul"} aria-label="Name"
                        onChange={(e) => patch({ recipient: { ...d.recipient, name: e.target.value, ...(ann ? { coupleName: e.target.value } : {}) } })}
                        onKeyDown={(e) => { if (e.key === "Enter") next(); }} />
                    {!ann && (
                        <>
                            <span className="wz2-label">Nickname (optional, shown on the cover)</span>
                            <input className="wz2-field" style={{ fontSize: 16 }} value={d.recipient.nickname} maxLength={30} placeholder="e.g. Potato, Pookie, Boss" aria-label="Nickname" onChange={(e) => patch({ recipient: { ...d.recipient, nickname: e.target.value } })} />
                        </>
                    )}
                    <span className="wz2-label">{ann ? "Which anniversary?" : "Turning (optional)"}</span>
                    <div className="wz2-chips">
                        {(ann ? ["1", "5", "10", "15", "25", "50"] : ["18", "21", "25", "30", "40", "50", "60"]).map((a) => {
                            const key = ann ? "anniversaryYear" : "age";
                            const on = d.recipient[key] === a;
                            return <button key={a} type="button" className={`wz2-chip ${on ? "is-on" : ""}`} onClick={() => patch({ recipient: { ...d.recipient, [key]: on ? "" : a } })}>{a}{ann ? (a === "1" ? "st" : "th") : ""}</button>;
                        })}
                        <input className="wz2-chip" style={{ width: 90 }} inputMode="numeric" maxLength={3} placeholder="Other" aria-label="Other number"
                            value={![...(ann ? ["1", "5", "10", "15", "25", "50"] : ["18", "21", "25", "30", "40", "50", "60"])].includes(ann ? d.recipient.anniversaryYear : d.recipient.age) ? (ann ? d.recipient.anniversaryYear : d.recipient.age) : ""}
                            onChange={(e) => patch({ recipient: { ...d.recipient, [ann ? "anniversaryYear" : "age"]: e.target.value.replace(/\D/g, "") } })} />
                    </div>
                </>
            );
        }

        if (step.id === "relation") {
            return (
                <>
                    <div className="wz2-meta">Chapter 1 · About them</div>
                    <h1 className="wz2-title">Who {d.wishType === "anniversary" ? "are they" : "is " + Name} to you?</h1>
                    <p className="wz2-sub">This changes the suggestions you&apos;ll see.</p>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 4 }}>
                        {RELATIONS[d.wishType].map((r) => (
                            <button key={r.id} type="button" className={`bw-card wz2-choice ${d.recipient.relationship === r.id ? "is-on" : ""}`}
                                onClick={(e) => { flip(e); patch({ recipient: { ...d.recipient, relationship: r.id } }); react(); setTimeout(next, 430); }}>
                                <span className="e" aria-hidden="true">{r.e}</span><h4>{r.id}</h4>
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        if (step.id === "vibe") {
            return (
                <>
                    <div className="wz2-meta">Chapter 1 · About them</div>
                    <h1 className="wz2-title">Pick the vibe</h1>
                    <p className="wz2-sub">We&apos;ll suggest a matching look and lines.</p>
                    <div className="wz2-grid">
                        {VIBES.map((v) => (
                            <button key={v.id} type="button" className={`bw-card wz2-choice ${d.recipient.vibe === v.id ? "is-on" : ""}`}
                                onClick={(e) => {
                                    flip(e);
                                    setD((x) => ({ ...x, recipient: { ...x.recipient, vibe: v.id }, look: x.template || x.wishType === "anniversary" ? x.look : { ...x.look, theme: v.theme } }));
                                    react(); setTimeout(next, 430);
                                }}>
                                <span className="e" aria-hidden="true">{v.e}</span><h4>{v.t}</h4><p>{v.d}</p>
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        if (step.id === "ingredients") {
            const list = INGREDIENTS.filter((t) => supports(d, t));
            const n = list.filter((t) => isOn(d, t)).length;
            return (
                <>
                    <div className="wz2-meta">Chapter 2 · Pick ingredients</div>
                    <h1 className="wz2-title">What goes in {Name}&apos;s surprise? 🎁</h1>
                    <p className="wz2-sub">Only the steps for what you pick will appear.</p>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                        {list.map((t) => {
                            const on = isOn(d, t), req = REQUIRED.includes(t);
                            return (
                                <button key={t} type="button" className={`bw-card wz2-choice ${on ? "is-on" : ""} ${req ? "is-locked" : ""}`}
                                    onClick={(e) => { if (req) return setNudge("💌 The main message is always included"); flip(e); setD((x) => ({ ...x, enabled: on ? x.enabled.filter((y) => y !== t) : [...x.enabled, t] })); if (!on) react(); }}>
                                    <span className="e" aria-hidden="true">{BLOCKS[t].icon}</span><h4>{BLOCKS[t].label}</h4>
                                </button>
                            );
                        })}
                        <button type="button" className={`bw-card wz2-choice ${d.wantGames ? "is-on" : ""}`} onClick={(e) => { flip(e); setD((x) => ({ ...x, wantGames: !x.wantGames, enabled: !x.wantGames && chosenGames(x).length === 0 ? [...x.enabled, "candles"] : x.enabled })); if (!d.wantGames) react(); }}>
                            <span className="e" aria-hidden="true">🎮</span><h4>Mini-games</h4><p>Candles, prank, quiz…</p>
                        </button>
                    </div>
                    <p className="wz2-sub" style={{ margin: "14px 0 0" }}><b>{n} ingredients</b> · about {Math.max(1, Math.round(n * 0.5))} min</p>
                    <div className="wz2-chips"><button type="button" className="wz2-chip" onClick={() => { setD((x) => ({ ...x, enabled: recommended(x.recipient.vibe, x.wishType) })); react(); }}>⚡ Use recommended for this vibe</button></div>
                </>
            );
        }

        if (step.id === "games") {
            const chosen = chosenGames(d);
            const toggleGame = (g: GameType, e: React.MouseEvent<HTMLElement>) => {
                if (chosen.includes(g)) { setD((x) => ({ ...x, enabled: x.enabled.filter((y) => y !== g) })); return; }
                if (chosen.length >= MAX_GAMES) return setNudge(`Max ${MAX_GAMES} games per wish 🎮`);
                flip(e); celebrate(e.currentTarget, 30);
                setD((x) => ({ ...x, enabled: [...x.enabled, g] }));
            };
            return (
                <>
                    <div className="wz2-meta">Chapter 4 · Fun &amp; Games</div>
                    <h1 className="wz2-title">Add games to {Name}&apos;s surprise 🎮</h1>
                    <p className="wz2-sub">Up to {MAX_GAMES} · {chosen.length}/{MAX_GAMES} added · every game has a no-mic tap option and auto-skips after 60 s.</p>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                        {GAME_LIBRARY.map((g) => (
                            <button key={g.type} type="button" className={`bw-card wz2-choice ${chosen.includes(g.type) ? "is-on" : ""}`} onClick={(e) => toggleGame(g.type, e)}>
                                <span className="e" aria-hidden="true">{g.e}</span><h4>{g.t}</h4><p>{g.d}</p>
                            </button>
                        ))}
                    </div>
                    {chosen.map((g) => {
                        const meta = GAME_LIBRARY.find((x) => x.type === g)!;
                        const cfg = getConfig(d, g);
                        return (
                            <div key={g} className="bw-card" style={{ padding: 18, marginTop: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <b style={{ fontFamily: "var(--p-font-display)", fontSize: 19 }}>{meta.e} {meta.t}</b>
                                    <button type="button" className="wz2-edit" onClick={() => setD((x) => ({ ...x, enabled: x.enabled.filter((y) => y !== g) }))}>Remove</button>
                                </div>
                                <span className="wz2-label">Where should it play?</span>
                                <PlacementChips value={cfg.placement} onChange={(p) => setConfig(g, { ...cfg, placement: p } as never)} />
                                {g === "candles" && <CandlesEditor value={getConfig(d, "candles")} onChange={(v) => setConfig("candles", v)} age={d.recipient.age} />}
                                {g === "prank" && <><span className="wz2-label">Which prank?</span><PrankEditor value={getConfig(d, "prank")} onChange={(v) => setConfig("prank", v)} /></>}
                                {g === "trivia" && <TriviaEditor value={getConfig(d, "trivia")} onChange={(v) => setConfig("trivia", v)} name={name} />}
                            </div>
                        );
                    })}
                    <span className="wz2-label">Coming soon</span>
                    <div className="wz2-chips">{COMING_SOON.map((c) => <span key={c.t} className="wz2-chip" style={{ opacity: 0.55 }}>{c.e} {c.t}</span>)}</div>
                </>
            );
        }

        if (step.block) {
            const t = step.block;
            const copy = BLOCK_COPY[t]!;
            const Editor = EDITORS[t] as unknown as (p: { value: unknown; onChange: (v: unknown) => void; env: EditorEnv }) => React.ReactNode;
            return (
                <>
                    <div className="wz2-meta">Chapter {step.chapter + 1} · {CHAPTERS[step.chapter]}</div>
                    <h1 className="wz2-title">{fill(copy.title, Name)}</h1>
                    <p className="wz2-sub">{fill(copy.sub, Name)}</p>
                    <Editor value={getConfig(d, t)} onChange={(v) => setConfig(t, v as never)} env={env} />
                </>
            );
        }

        if (step.id === "look") {
            const skins = d.wishType === "anniversary" ? ANNIVERSARY_SKINS : BIRTHDAY_SKINS;
            return (
                <>
                    <div className="wz2-meta">Chapter 6 · Look &amp; unlock</div>
                    <h1 className="wz2-title">Choose the look 🎨</h1>
                    <p className="wz2-sub">Watch the preview change.</p>
                    <span className="wz2-label">Colour skin</span>
                    <div className="wz2-themes">
                        {skins.map((s) => (
                            <button key={s.id} type="button" className={`wz2-theme ${d.look.theme === s.id ? "is-on" : ""}`} onClick={() => patch({ look: { ...d.look, theme: s.id } })}>
                                <div className="sw" style={{ background: s.bg }} aria-hidden="true">{s.e}</div><div className="nm">{s.t}</div>
                            </button>
                        ))}
                    </div>
                    <span className="wz2-label">Presentation style</span>
                    <div className="wz2-grid" style={{ ["--cols" as string]: 3 }}>
                        {STYLES.map((s) => (
                            <button key={s.id} type="button" className={`bw-card wz2-choice ${d.look.presentationStyle === s.id ? "is-on" : ""}`} onClick={() => patch({ look: { ...d.look, presentationStyle: s.id } })}>
                                <span className="e" aria-hidden="true">{s.e}</span><h4>{s.t}</h4><p>{s.d}</p>
                            </button>
                        ))}
                    </div>
                    <span className="wz2-label">Finale</span>
                    <div className="wz2-chips">
                        {FINALES.map((f) => {
                            const cur = getConfig(d, "finale").effect;
                            return <button key={f.id} type="button" className={`wz2-chip ${cur === f.id ? "is-on" : ""}`} onClick={(e) => { setConfig("finale", { effect: f.id }); celebrate(e.currentTarget, 30); }}>{f.t}</button>;
                        })}
                    </div>
                    <span className="wz2-label">Language of the wish</span>
                    <select className="wz2-field" style={{ fontSize: 16 }} value={d.look.language} onChange={(e) => patch({ look: { ...d.look, language: e.target.value } })} aria-label="Language of the wish">
                        {languages.map((l) => <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>)}
                    </select>
                    <span className="wz2-label">When can they open it?</span>
                    <div className="wz2-chips">
                        <button type="button" className={`wz2-chip ${d.unlock.mode === "now" ? "is-on" : ""}`} onClick={() => patch({ unlock: { ...d.unlock, mode: "now" } })}>🔓 Right away</button>
                        <button type="button" className={`wz2-chip ${d.unlock.mode === "date" ? "is-on" : ""}`} onClick={() => patch({ unlock: { ...d.unlock, mode: "date" } })}>🕛 At midnight on…</button>
                        {d.unlock.mode === "date" && <input className="wz2-chip" type="date" value={d.unlock.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => patch({ unlock: { ...d.unlock, date: e.target.value } })} aria-label="Unlock date" />}
                    </div>
                </>
            );
        }

        if (step.id === "order") {
            const types: BlockType[] = wish.blocks.map((b) => b.type).filter((t) => t !== "intro" && t !== "finale");
            const move = (t: BlockType, delta: -1 | 1) => {
                const i = types.indexOf(t), j = i + delta;
                if (j < 0 || j >= types.length) return;
                const swapped = [...types]; [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
                // rebuild the full order: intro, the new sequence, then everything else (unused types), finale
                const rest = d.order.filter((x) => !swapped.includes(x) && x !== "intro" && x !== "finale");
                patch({ order: ["intro", ...swapped, ...rest, "finale"] });
            };
            return (
                <>
                    <div className="wz2-meta">Chapter 6 · Story order</div>
                    <h1 className="wz2-title">In what order should {Name} see it?</h1>
                    <p className="wz2-sub">The cover always comes first and the finale last.</p>
                    <div className="wz2-list">
                        <div className="bw-card wz2-item"><span className="e">🎂</span><div className="grow"><b>Cover</b><small>Always first</small></div></div>
                        {types.map((t, i) => (
                            <div key={t} className="bw-card wz2-item">
                                <span className="e" aria-hidden="true">{BLOCKS[t].icon}</span>
                                <div className="grow"><b>{BLOCKS[t].label}</b><small>{(BLOCKS[t].summary as (c: unknown) => string)(wish.blocks.find((b) => b.type === t)!.config)}</small></div>
                                <div className="mv">
                                    <button type="button" onClick={() => move(t, -1)} disabled={i === 0} aria-label={`Move ${BLOCKS[t].label} up`}>↑</button>
                                    <button type="button" onClick={() => move(t, 1)} disabled={i === types.length - 1} aria-label={`Move ${BLOCKS[t].label} down`}>↓</button>
                                </div>
                            </div>
                        ))}
                        <div className="bw-card wz2-item"><span className="e">🎆</span><div className="grow"><b>Finale</b><small>Always last</small></div></div>
                    </div>
                </>
            );
        }

        if (step.id === "link") return <LinkStep d={d} patch={patch} Name={Name} />;

        if (step.id === "review") {
            const rows = wish.blocks.filter((b) => b.type !== "intro" && b.type !== "finale");
            return (
                <>
                    <div className="wz2-meta">Chapter 7 · Deliver</div>
                    <h1 className="wz2-title">Ready to surprise {Name}? 🎁</h1>
                    <p className="wz2-sub">Tap &quot;Edit&quot; to change anything, or play the full wish first.</p>
                    <div className="wz2-list">
                        <div className="bw-card wz2-item"><span className="e">👤</span><div className="grow"><b>{name}</b><small>{[d.recipient.relationship, VIBES.find((v) => v.id === d.recipient.vibe)?.t].filter(Boolean).join(" · ") || "—"}</small></div><button type="button" className="wz2-edit" onClick={() => goTo("name", "prev")}>Edit</button></div>
                        {rows.map((b) => {
                            const target = isGame(b.type) ? steps.find((s) => s.id === "games") : steps.find((s) => s.block === b.type);
                            return (
                                <div key={b.id} className="bw-card wz2-item">
                                    <span className="e" aria-hidden="true">{BLOCKS[b.type].icon}</span>
                                    <div className="grow"><b>{BLOCKS[b.type].label}</b><small>{(BLOCKS[b.type].summary as (c: unknown) => string)(b.config)}</small></div>
                                    {target && <button type="button" className="wz2-edit" onClick={() => goTo(target.id, "prev")}>Edit</button>}
                                </div>
                            );
                        })}
                        <div className="bw-card wz2-item"><span className="e">🎨</span><div className="grow"><b>Look</b><small>{[...BIRTHDAY_SKINS, ...ANNIVERSARY_SKINS].find((s) => s.id === d.look.theme)?.t} · {STYLES.find((s) => s.id === d.look.presentationStyle)?.t}{d.unlock.mode === "date" && d.unlock.date ? ` · opens ${d.unlock.date}` : ""}</small></div><button type="button" className="wz2-edit" onClick={() => goTo("look", "prev")}>Edit</button></div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                        <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setFull(true)}>▶ Play the full wish</button>
                    </div>
                    {saveError && <div className="wz2-error" role="alert">{saveError}</div>}
                </>
            );
        }

        if (step.id === "finish" && result) return <Finish result={result} d={d} Name={Name} onAgain={() => { setResult(null); setD(newDraft(typeParam)); }} celebrate={celebrate} />;
        return null;
    }
}

/* ================= Link step ================= */
function LinkStep({ d, patch, Name }: { d: Draft; patch: (p: Partial<Draft>) => void; Name: string }) {
    const [status, setStatus] = useState<"" | "checking" | "ok" | "taken" | "invalid">("");
    useEffect(() => {
        const slug = d.customSlug;
        if (!slug) { setStatus(""); return; }
        if (slug.length < 3) { setStatus("invalid"); return; }
        setStatus("checking");
        const t = setTimeout(async () => {
            try {
                const r = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
                const j = await r.json();
                setStatus(j.available ? "ok" : j.error ? "invalid" : "taken");
            } catch { setStatus(""); }
        }, 450);
        return () => clearTimeout(t);
    }, [d.customSlug]);
    const msg = { "": "", checking: "Checking…", ok: "✅ Available!", taken: "❌ Already taken. Try another.", invalid: "3–40 letters, numbers or dashes" }[status];
    return (
        <>
            <div className="wz2-meta">Chapter 7 · Deliver</div>
            <h1 className="wz2-title">Make the link yours 🔗 (optional)</h1>
            <p className="wz2-sub">A custom link is easier to remember. Leave empty for a random one.</p>
            <div className="wz2-linkbox" style={{ margin: 0, maxWidth: "none" }}>
                <code style={{ flex: "0 0 auto", paddingRight: 0, opacity: 0.7 }}>birthdaywisher.fun/w/</code>
                <input className="wz2-field" style={{ border: 0, boxShadow: "none", padding: "8px 4px", fontSize: 16, background: "transparent" }} value={d.customSlug} maxLength={40} placeholder={`${(Name || "rahul").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-bday`}
                    onChange={(e) => patch({ customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} aria-label="Custom link" />
            </div>
            <p className="wz2-sub" style={{ marginTop: 8 }} aria-live="polite">{msg}</p>
            <span className="wz2-label">💬 Message to send with the link (WhatsApp)</span>
            <input className="wz2-field" style={{ fontSize: 16 }} value={d.previewText} maxLength={120} placeholder={`🎁 ${Name}, you've got a surprise! Tap to open`} onChange={(e) => patch({ previewText: e.target.value })} aria-label="Share message" />
        </>
    );
}

/* ================= Finish ================= */
function Finish({ result, d, Name, onAgain, celebrate }: { result: { id: string; slug?: string }; d: Draft; Name: string; onAgain: () => void; celebrate: (el?: Element | null, n?: number) => void }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const giftRef = useRef<HTMLDivElement>(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.birthdaywisher.fun";
    const link = result.slug ? `${origin}/w/${result.slug}` : `${origin}/wish/${result.id}`;
    const shareText = `${d.previewText || `🎁 ${Name}, you've got a surprise! Tap to open`}\n${link}`;
    const badges = ["🎉 First Surprise", ...(isOn(d, "photos") && getConfig(d, "photos").items.length >= 3 ? ["📸 Memory Master"] : []), ...(isOn(d, "voice") && getConfig(d, "voice").audioUrl ? ["🎤 Voice of Love"] : []), ...(d.recipient.vibe === "hardcore-roast" ? ["🔥 Roast King"] : []), ...(isOn(d, "quiz") ? ["🧠 Quiz Master"] : []), ...(chosenGames(d).length && d.wantGames ? ["🎮 Game Maker"] : [])];

    return (
        <div className="wz2-finish">
            <h1 className="wz2-title">Your surprise is ready! 🎉</h1>
            <p className="wz2-sub">{open ? "Here's your magic link 👇" : "Tap the gift to get your link"}</p>
            <div ref={giftRef} style={{ display: "flex", justifyContent: "center", margin: "150px 0 40px" }}>
                <GiftCube big open={open} pop="🔗" label="Open the gift" onClick={() => { if (!open) { setOpen(true); celebrate(giftRef.current, 200); } }} />
            </div>
            {open && (
                <>
                    <div className="wz2-linkbox">
                        <code>{link.replace(/^https?:\/\//, "")}</code>
                        <button type="button" className="bw-btn bw-btn-primary bw-btn-sm" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ } }}>{copied ? "Copied ✓" : "Copy"}</button>
                    </div>
                    <div className="wz2-share">
                        <a className="bw-btn bw-btn-primary bw-btn-sm" style={{ background: "#25D366", boxShadow: "none" }} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">💬 Send on WhatsApp</a>
                        <a className="bw-btn bw-btn-ghost bw-btn-sm" href={link} target="_blank" rel="noopener noreferrer">👀 Preview it first</a>
                        <Link className="bw-btn bw-btn-ghost bw-btn-sm" href={`/dashboard/${result.id}`}>📊 Views dashboard</Link>
                    </div>
                    <div className="wz2-badges">{badges.map((b) => <span key={b} className="wz2-badge">{b}</span>)}</div>
                    <div style={{ marginTop: 24 }}><button type="button" className="wz2-chip" onClick={onAgain}>＋ Make another surprise</button></div>
                </>
            )}
        </div>
    );
}

/* ================= Cuppy lines ================= */
function cuppyFor(id: string, block: BlockType | undefined, d: Draft, Name: string): string {
    if (block) return fill(BLOCK_COPY[block]?.tip || "", Name);
    switch (id) {
        case "start": return `Hi! I'm Cuppy 🧁 Let's make someone's ${d.wishType === "anniversary" ? "anniversary" : "birthday"} unforgettable!`;
        case "template": return "Pick a vibe. I'll fill in everything and you can change anything later 🎨";
        case "name": return d.template ? `Nice pick! I filled everything in. First, who's it for?` : "First things first: who's the lucky one? 🎈";
        case "relation": return `Ooh, ${Name}! How do you know ${Name}?`;
        case "vibe": return `What's the mood for ${Name}'s surprise?`;
        case "ingredients": return `This is the fun part! Pick what goes into ${Name}'s surprise 🎁`;
        case "games": return "Games time! 🎮 Blow the Candles is a crowd favourite right before the finale.";
        case "look": return "Make it pretty! Watch the preview phone change 🎨";
        case "order": return "Pro tip: end with your message for the biggest impact 💌";
        case "link": return "A cute custom link makes it feel extra special 🔗";
        case "review": return "Looking amazing! Quick check, then we wrap it up 🎁";
        default: return "";
    }
}
