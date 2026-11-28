"use client";

import { useState } from "react";
import type { EnginePingRow } from "@/app/api/admin/cuppy/route";
import type { CuppyAutoBuild, CuppyItem } from "@/lib/cuppyAi";
import type { CuppyAdminConfig, PausePresetId, PrimaryEngineMode } from "@/lib/cuppyConfig";

const PRESET_OPTIONS: Array<{ id: PausePresetId; label: string; preview: string }> = [
    {
        id: "kitchen",
        label: "🧁 Kitchen Baking Vibe (Default)",
        preview: "🧁 Cuppy is baking fresh birthday cupcakes right now! Meanwhile, tap one of Cuppy's handpicked favourites below ❤️",
    },
    {
        id: "heart",
        label: "💌 Dil Ki Baat Vibe",
        preview: "💌 Little secret from Cuppy: Your own words always hit 10× deeper! Need a quick spark? Tap a handpicked line below 🎈",
    },
    {
        id: "party",
        label: "🎉 Party Prep Vibe",
        preview: "🎉 Cuppy is busy blowing balloons for tonight's surprises! Here are Cuppy's favourite starter lines for you 🎂",
    },
    {
        id: "custom",
        label: "✏️ Custom Pyara Message",
        preview: "",
    },
];

export function CuppySwitchboard({ initial }: { initial: CuppyAdminConfig }) {
    const [cfg, setCfg] = useState<CuppyAdminConfig>(initial);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const activePreview =
        cfg.pausePreset === "custom"
            ? cfg.pauseCustomMessage.trim() || PRESET_OPTIONS[0].preview
            : PRESET_OPTIONS.find((p) => p.id === cfg.pausePreset)?.preview || PRESET_OPTIONS[0].preview;

    const save = async (patch?: Partial<CuppyAdminConfig>) => {
        const next = patch ? { ...cfg, ...patch } : cfg;
        if (patch) setCfg(next);
        setBusy(true);
        setMsg(null);
        try {
            const res = await fetch("/api/admin/cuppy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save_config", config: next }),
            });
            const data = (await res.json()) as { ok?: boolean; config?: CuppyAdminConfig; error?: string };
            if (!res.ok || !data.ok || !data.config) throw new Error(data.error || "Save failed");
            setCfg(data.config);
            setMsg({
                ok: true,
                text: data.config.enabled
                    ? "✅ Saved! Cuppy AI is LIVE across /create."
                    : "🧁 Saved! Cozy Pause Mode is active—users see your sweet message + handpicked lines (zero broken feel).",
            });
        } catch (e) {
            setMsg({ ok: false, text: (e as Error).message || "Could not save settings" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="adm-ai-ctrl">
            <div className="adm-ai-switches">
                <div className="adm-ai-sw-card">
                    <div>
                        <b>{cfg.enabled ? "🟢 Cuppy AI Status: LIVE" : "🧁 Cuppy AI Status: Cozy Pause Mode"}</b>
                        <small>
                            {cfg.enabled
                                ? "Users get live AI writing, Ask AI & 1-Line Auto-Build."
                                : "Auto-Build strip hides cleanly; steps show your sweet Cuppy note + instant handpicked lines."}
                        </small>
                    </div>
                    <button
                        type="button"
                        className={`adm-btn ${cfg.enabled ? "ghost" : ""}`}
                        disabled={busy}
                        onClick={() => void save({ enabled: !cfg.enabled })}
                    >
                        {cfg.enabled ? "🧁 Switch to Cozy Pause" : "🟢 Turn Cuppy AI Live"}
                    </button>
                </div>

                <div className="adm-ai-sw-card">
                    <div>
                        <b>🛡️ AdSense Safety Shield (💀 No-Filter Tab): {cfg.allowNoFilter ? "Shown" : "Hidden"}</b>
                        <small>Hide 💀 No-Filter, 🔥 Unfiltered &amp; 🌶️ Spicy modes instantly during AdSense reviews without redeploying.</small>
                    </div>
                    <button
                        type="button"
                        className="adm-btn ghost"
                        disabled={busy}
                        onClick={() => void save({ allowNoFilter: !cfg.allowNoFilter })}
                    >
                        {cfg.allowNoFilter ? "Hide 💀 No-Filter" : "Show 💀 No-Filter"}
                    </button>
                </div>
            </div>

            <div className="adm-ai-fields">
                <label className="adm-ai-lbl">
                    <span>Primary Cloud Engine</span>
                    <select
                        value={cfg.primaryEngine}
                        onChange={(e) => setCfg({ ...cfg, primaryEngine: e.target.value as PrimaryEngineMode })}
                    >
                        <option value="auto">Auto (Gemini 3.5 Flash Lite → Groq Qwen Failover)</option>
                        <option value="gemini">Google Gemini First (Best Hinglish / Hindi)</option>
                        <option value="groq">Groq Open-Source First (Qwen 3.8 27B / GPT-OSS 120B)</option>
                    </select>
                </label>

                <label className="adm-ai-lbl">
                    <span>Per-User Rate Limit (per 10 min)</span>
                    <select
                        value={cfg.rateLimit10m}
                        onChange={(e) => setCfg({ ...cfg, rateLimit10m: Number(e.target.value) as 15 | 35 | 60 })}
                    >
                        <option value={15}>Strict — 15 generations / 10 min</option>
                        <option value={35}>Balanced — 35 generations / 10 min (Recommended)</option>
                        <option value={60}>Generous — 60 generations / 10 min</option>
                    </select>
                </label>

                <label className="adm-ai-lbl wide">
                    <span>🎯 Custom &quot;Cuppy Director Note&quot; (1-Line Live Prompt Tweak — optional)</span>
                    <input
                        type="text"
                        maxLength={220}
                        value={cfg.directorNote}
                        placeholder="e.g. Keep Hinglish punchy under 3 sentences, or add subtle New Year warmth…"
                        onChange={(e) => setCfg({ ...cfg, directorNote: e.target.value })}
                    />
                </label>

                <div className="adm-ai-lbl wide adm-cozy-box">
                    <span>🧁 Cozy Pause Sweet Message (shown to users whenever Cuppy AI is paused—zero error/offline vibe)</span>
                    <div className="adm-ai-Radios">
                        {PRESET_OPTIONS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className={`adm-btn sm ${cfg.pausePreset === p.id ? "" : "ghost"}`}
                                onClick={() => setCfg({ ...cfg, pausePreset: p.id })}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {cfg.pausePreset === "custom" && (
                        <input
                            type="text"
                            maxLength={220}
                            value={cfg.pauseCustomMessage}
                            placeholder="Write your own sweet Cuppy message for users…"
                            onChange={(e) => setCfg({ ...cfg, pauseCustomMessage: e.target.value })}
                            style={{ marginTop: 8 }}
                        />
                    )}
                    <div className="adm-cozy-preview">
                        <small>Live User Preview when Paused:</small>
                        <p>{activePreview}</p>
                    </div>
                </div>
            </div>

            <div className="adm-form" style={{ marginTop: 12 }}>
                <button type="button" className="adm-btn" disabled={busy} onClick={() => void save()}>
                    {busy ? "Saving…" : "💾 Save All Cuppy Settings"}
                </button>
                {msg && <p className={msg.ok ? "adm-ok" : "adm-err"}>{msg.text}</p>}
            </div>
        </div>
    );
}

export function CuppyEngineMonitor({ geminiReady, groqReady }: { geminiReady: boolean; groqReady: boolean }) {
    const [rows, setRows] = useState<EnginePingRow[] | null>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    const pingAll = async () => {
        setBusy(true);
        setErr("");
        try {
            const res = await fetch("/api/admin/cuppy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "ping_engines" }),
            });
            const data = (await res.json()) as { results?: EnginePingRow[]; error?: string };
            if (!res.ok || !data.results) throw new Error(data.error || "Ping failed");
            setRows(data.results);
        } catch (e) {
            setErr((e as Error).message || "Failed to ping engines");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <ul className="adm-facts" style={{ marginBottom: 12 }}>
                <li>
                    <span>Google AI Studio Key (<code>GEMINI_API_KEY</code>)</span>
                    <b><span className={`adm-tag ${geminiReady ? "good" : "bad"}`}>{geminiReady ? "✅ Ready (Hidden)" : "❌ Missing in Env"}</span></b>
                </li>
                <li>
                    <span>Groq Open-Source Key (<code>GROQ_API_KEY</code>)</span>
                    <b><span className={`adm-tag ${groqReady ? "good" : "bad"}`}>{groqReady ? "✅ Ready (Hidden)" : "❌ Missing in Env"}</span></b>
                </li>
            </ul>
            <button type="button" className="adm-btn" disabled={busy} onClick={() => void pingAll()}>
                {busy ? "Pinging all 5 models live…" : rows ? "↻ Ping All 5 AI Engines Again" : "🩺 Test All 5 AI Engines Live"}
            </button>
            {err && <p className="adm-err">{err}</p>}
            {rows && (
                <div className="adm-table-wrap" style={{ marginTop: 12 }}>
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Engine</th>
                                <th>Provider</th>
                                <th>Status</th>
                                <th>Speed</th>
                                <th>Remaining Free Quota</th>
                                <th>Sample Reply</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => {
                                const badgeCls = r.ok ? "good" : r.status === 429 ? "warn" : "bad";
                                const badgeTxt = r.ok ? `🟢 ${r.status} OK` : r.status === 429 ? "🟡 429 Quota" : `🔴 ${r.status || "ERR"}`;
                                return (
                                    <tr key={r.id}>
                                        <td><code>{r.id}</code></td>
                                        <td>{r.provider}</td>
                                        <td><span className={`adm-tag ${badgeCls}`}>{badgeTxt}</span></td>
                                        <td><b>{r.ms} ms</b></td>
                                        <td>{[r.remainingRequests, r.remainingTokens].filter(Boolean).join(" · ") || "—"}</td>
                                        <td><small>{r.sample || "—"}</small></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export function CuppyPlayground() {
    const [task, setTask] = useState("message");
    const [spice, setSpice] = useState("brutal");
    const [tone, setTone] = useState("unfiltered");
    const [forcedEngine, setForcedEngine] = useState("auto");
    const [name, setName] = useState("Aman");
    const [hint, setHint] = useState("gym freak par roz momos khata hai, 3 saal se Goa cancel kar raha hai");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [out, setOut] = useState<{ items: CuppyItem[]; autoBuild?: CuppyAutoBuild; engine: string; ms: number } | null>(null);

    const runTest = async () => {
        setBusy(true);
        setErr("");
        try {
            const res = await fetch("/api/admin/cuppy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "playground", task, spice, tone, forcedEngine, name, hint }),
            });
            const data = (await res.json()) as {
                ok?: boolean;
                items?: CuppyItem[];
                autoBuild?: CuppyAutoBuild;
                engine?: string;
                ms?: number;
                error?: string;
            };
            if (!res.ok || !data.items) throw new Error(data.error || "Test failed");
            setOut({ items: data.items, autoBuild: data.autoBuild, engine: data.engine || "unknown", ms: data.ms ?? 0 });
        } catch (e) {
            setErr((e as Error).message || "Playground request failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="adm-ai-fields">
                <label className="adm-ai-lbl">
                    <span>Task</span>
                    <select value={task} onChange={(e) => setTask(e.target.value)}>
                        <option value="message">💌 Main Message</option>
                        <option value="autobuild">⚡ 1-Line Full Auto-Build</option>
                        <option value="memory">📖 Memory</option>
                        <option value="quirks">💗 Quirks Bubbles</option>
                        <option value="quiz">🧠 Quiz Q&amp;A</option>
                        <option value="award">🏆 Trophy Award</option>
                        <option value="promise">🤞 Scratch Promise</option>
                        <option value="whatsapp">💬 WhatsApp Bait</option>
                    </select>
                </label>

                <label className="adm-ai-lbl">
                    <span>Mood Tab</span>
                    <select value={spice} onChange={(e) => setSpice(e.target.value)}>
                        <option value="mild">😇 Sweet</option>
                        <option value="medium">😏 Witty</option>
                        <option value="brutal">💀 No-Filter</option>
                    </select>
                </label>

                <label className="adm-ai-lbl">
                    <span>Tone</span>
                    <select value={tone} onChange={(e) => setTone(e.target.value)}>
                        <option value="unfiltered">🔥 Unfiltered Dost</option>
                        <option value="romantic">❤️ Romantic</option>
                        <option value="heartfelt">🥹 Heartfelt</option>
                        <option value="flirty">🌶️ Spicy Flirty</option>
                        <option value="raw3am">🌙 3 AM Raw</option>
                        <option value="funny">😂 Friendly Roast</option>
                        <option value="hinglish">🗣️ Hinglish</option>
                        <option value="hindi">🙏 Pure Hindi</option>
                    </select>
                </label>

                <label className="adm-ai-lbl">
                    <span>Model to Test</span>
                    <select value={forcedEngine} onChange={(e) => setForcedEngine(e.target.value)}>
                        <option value="auto">⚡ Auto Chain (Live Behavior)</option>
                        <option value="gemini-3.5-flash-lite">Google: gemini-3.5-flash-lite</option>
                        <option value="groq-qwen3.8-27b">Groq OSS: qwen/qwen3.8-27b</option>
                        <option value="groq-gpt-oss-120b">Groq OSS: openai/gpt-oss-120b</option>
                        <option value="gemini-flash-lite-latest">Google: gemini-flash-lite-latest</option>
                        <option value="groq-gpt-oss-20b">Groq OSS: openai/gpt-oss-20b</option>
                    </select>
                </label>

                <label className="adm-ai-lbl">
                    <span>Test Name</span>
                    <input type="text" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
                </label>

                <label className="adm-ai-lbl">
                    <span>Personal Details / Hint</span>
                    <input type="text" value={hint} maxLength={240} onChange={(e) => setHint(e.target.value)} />
                </label>
            </div>

            <div className="adm-form" style={{ marginTop: 10 }}>
                <button type="button" className="adm-btn" disabled={busy} onClick={() => void runTest()}>
                    {busy ? "Generating…" : "🧪 Run Live Test"}
                </button>
                {out && (
                    <span className="adm-tag good" style={{ fontSize: 13, padding: "5px 11px" }}>
                        Engine: {out.engine} · {out.ms} ms
                    </span>
                )}
            </div>
            {err && <p className="adm-err">{err}</p>}

            {out && (
                <div className="adm-play-out">
                    {out.autoBuild ? (
                        <ul className="adm-facts" style={{ margin: 0 }}>
                            <li><span>Name · Vibe · Style</span><b>{out.autoBuild.name} · {out.autoBuild.vibe} · {out.autoBuild.presentationStyle} ({out.autoBuild.theme})</b></li>
                            <li><span>Main Message</span><b style={{ maxWidth: 640, textAlign: "right" }}>{out.autoBuild.message}</b></li>
                            <li><span>Memory</span><b style={{ maxWidth: 640, textAlign: "right" }}>{out.autoBuild.memory}</b></li>
                            <li><span>Quirks</span><b>{out.autoBuild.quirks.join(" · ")}</b></li>
                            <li><span>Award · Promise</span><b>{out.autoBuild.award} | {out.autoBuild.promise}</b></li>
                            <li><span>Slug · WhatsApp</span><b>/w/{out.autoBuild.customSlug} — {out.autoBuild.previewText}</b></li>
                        </ul>
                    ) : (
                        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                            {out.items.map((it, i) => (
                                <li key={i} style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.5 }}>
                                    {it.text}
                                    {it.answer ? <span className="adm-tag warn" style={{ marginLeft: 8 }}>Ans: {it.answer}</span> : null}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            )}
        </div>
    );
}
