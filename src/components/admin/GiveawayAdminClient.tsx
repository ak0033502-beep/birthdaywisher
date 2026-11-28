"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    GIVEAWAY_PRIZES,
    GIVEAWAY_PTS,
    computeGiveawayScore,
    getPrizeInfo,
    type AdminGiveawayEntry,
    type GiveawayConfig,
    type GiveawayEntryStatus,
    type GiveawayPhase,
} from "@/lib/giveawayTypes";

const EMAIL_TEMPLATES = [
    {
        id: "reminder",
        label: "⏰ Final 48 Hours Reminder",
        subject: "⏰ 48 Hours Left — BirthdayWisher ReelFest (₹2,000 / $25)!",
        heading: "Final 48 Hours of ReelFest Season 1! 🔥",
        message:
            "Thank you for locking in your VIP Pass for BirthdayWisher ReelFest!\n\nMake sure your 15–30s Instagram Reel is public and tags @birthdaywisher.fun (#BWReelFest) so our team can verify your Reel (+10), In-Person Bonus (+15), Collab (+5), Story Tag (+5), Creativity (0–35) & Real Views (0–30).\n\nWant a second shot at #1? You can still submit 1 more distinct creative Reel before entries close!",
        ctaLabel: "Check Open 100-Point Scoreboard →",
    },
    {
        id: "judging",
        label: "⚖️ Final 100-Pt Scoring Live!",
        subject: "⚖️ Final 100-Point Scoring Underway — BirthdayWisher ReelFest!",
        heading: "Our Team Is Finalizing the 100-Point Scoreboard! ⚖️🔥",
        message:
            "Huge thank you to everyone who dropped amazing 15–30s Reels in BirthdayWisher ReelFest!\n\nEntries are now closed and our team is verifying every public Reel (+10), In-Person Bonus (+15), @birthdaywisher.fun Collab (+5), Story Tag (+5), Creativity (0–35), and Organic Views (0–30). Check your verified points live on our Open Scoreboard!",
        ctaLabel: "View Live 100-Point Scoreboard →",
    },
    {
        id: "winner",
        label: "🏆 Winner Announced + Thank You!",
        subject: "🏆 BirthdayWisher ReelFest Champion Announced!",
        heading: "We Have Our ReelFest Champion! 🏆🎉",
        message:
            "All 100-point scores are locked and our official BirthdayWisher ReelFest champion is now live on BirthdayWisher.fun and @birthdaywisher.fun!\n\nThank you from the bottom of our hearts for celebrating with us — stay tuned for ReelFest Season 2 soon ❤️",
        ctaLabel: "See Official Champion & Scores →",
    },
];

export function GiveawayAdminPanel({
    initialConfig,
    resendReady,
    fromAddress,
    entries: initialEntries,
}: {
    initialConfig: GiveawayConfig;
    resendReady: boolean;
    fromAddress: string;
    entries: AdminGiveawayEntry[];
}) {
    const router = useRouter();
    const [cfg, setCfg] = useState<GiveawayConfig>(initialConfig);
    const [savingCfg, setSavingCfg] = useState(false);
    const [cfgMsg, setCfgMsg] = useState("");

    const [testTo, setTestTo] = useState("hello@birthdaywisher.fun");
    const [testKind, setTestKind] = useState<"ticket" | "broadcast">("ticket");
    const [testBusy, setTestBusy] = useState(false);
    const [testStatus, setTestStatus] = useState("");
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewSubject, setPreviewSubject] = useState("");

    const [audience, setAudience] = useState<"all" | "finalists">("all");
    const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
    const [heading, setHeading] = useState(EMAIL_TEMPLATES[0].heading);
    const [message, setMessage] = useState(EMAIL_TEMPLATES[0].message);
    const [ctaLabel, setCtaLabel] = useState(EMAIL_TEMPLATES[0].ctaLabel);
    const [sendingBulk, setSendingBulk] = useState(false);
    const [bulkStatus, setBulkStatus] = useState("");

    const [entries, setEntries] = useState<AdminGiveawayEntry[]>(initialEntries);
    const [rowBusy, setRowBusy] = useState<number | null>(null);

    const saveConfig = async () => {
        setSavingCfg(true);
        setCfgMsg("");
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save_config", config: cfg }),
            });
            const j = (await res.json()) as { ok?: boolean; config?: GiveawayConfig; error?: string };
            if (res.ok && j.ok && j.config) {
                setCfg(j.config);
                setCfgMsg("✅ Saved live!");
                router.refresh();
            } else {
                setCfgMsg(`⚠️ ${j.error || "Save failed"}`);
            }
        } catch {
            setCfgMsg("⚠️ Network error");
        } finally {
            setSavingCfg(false);
        }
    };

    const loadPreview = async (kind: "ticket" | "broadcast") => {
        setTestKind(kind);
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "preview_email", kind, subject, heading, message, ctaLabel }),
            });
            const j = (await res.json()) as { ok?: boolean; subject?: string; html?: string };
            if (res.ok && j.html) {
                setPreviewSubject(j.subject || "");
                setPreviewHtml(j.html);
            }
        } catch {
            // ignore
        }
    };

    const sendTest = async () => {
        setTestBusy(true);
        setTestStatus("");
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "test_email",
                    to: testTo,
                    kind: testKind,
                    subject,
                    heading,
                    message,
                    ctaLabel,
                }),
            });
            const j = (await res.json()) as { ok?: boolean; id?: string; error?: string };
            if (res.ok && j.ok) {
                setTestStatus(`✅ Delivered via Resend! (ID: ${j.id || "ok"}) — check ${testTo}`);
            } else {
                setTestStatus(`⚠️ Resend error: ${j.error || "Check domain verification in Resend dashboard"}`);
            }
        } catch {
            setTestStatus("⚠️ Network error");
        } finally {
            setTestBusy(false);
        }
    };

    const sendBroadcast = async () => {
        if (!window.confirm(`Send this email from ${fromAddress} to ${audience === "finalists" ? "Top 5 Finalists" : "all opted-in participants"}?`)) {
            return;
        }
        setSendingBulk(true);
        setBulkStatus("");
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "broadcast_email",
                    audience,
                    subject,
                    heading,
                    message,
                    ctaLabel,
                }),
            });
            const j = (await res.json()) as { ok?: boolean; sent?: number; failed?: number; firstError?: string; error?: string };
            if (res.ok && j.ok) {
                setBulkStatus(`✅ Sent to ${j.sent} participant(s)${j.failed ? ` (${j.failed} failed: ${j.firstError})` : ""}!`);
            } else {
                setBulkStatus(`⚠️ ${j.error || j.firstError || "Broadcast failed"}`);
            }
        } catch {
            setBulkStatus("⚠️ Network error");
        } finally {
            setSendingBulk(false);
        }
    };

    const updateEntry = async (
        id: number,
        patch: {
            status?: GiveawayEntryStatus;
            reelVerified?: boolean;
            inPersonVerified?: boolean;
            collabVerified?: boolean;
            storyVerified?: boolean;
            creativityScore?: number;
            engagementScore?: number;
        },
    ) => {
        setRowBusy(id);
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update_entry", id, ...patch }),
            });
            if (res.ok) {
                setEntries((prev) =>
                    prev.map((e) => {
                        if (e.id !== id) return e;
                        const next = {
                            ...e,
                            ...patch,
                            creativityScore:
                                patch.creativityScore !== undefined
                                    ? Math.max(0, Math.min(GIVEAWAY_PTS.CREATIVITY_MAX, Math.round(patch.creativityScore)))
                                    : e.creativityScore,
                            engagementScore:
                                patch.engagementScore !== undefined
                                    ? Math.max(0, Math.min(GIVEAWAY_PTS.ENGAGEMENT_MAX, Math.round(patch.engagementScore)))
                                    : e.engagementScore,
                        };
                        next.totalScore = computeGiveawayScore(next);
                        return next;
                    }),
                );
                router.refresh();
            }
        } finally {
            setRowBusy(null);
        }
    };

    const removeEntry = async (id: number, code: string) => {
        if (!window.confirm(`Permanently delete entry #${code}?`)) return;
        setRowBusy(id);
        try {
            const res = await fetch("/api/admin/giveaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete_entry", id }),
            });
            if (res.ok) {
                setEntries((prev) => prev.filter((e) => e.id !== id));
                router.refresh();
            }
        } finally {
            setRowBusy(null);
        }
    };

    // Format ISO timestamp as Asia/Kolkata local YYYY-MM-DDTHH:mm for datetime-local input
    const toIstInput = (iso?: string) => {
        if (!iso) return "";
        const ms = Date.parse(iso);
        if (Number.isNaN(ms)) return "";
        return new Date(ms + 5.5 * 3_600_000).toISOString().slice(0, 16);
    };
    const fromIstInput = (val: string) => new Date(`${val}:00+05:30`).toISOString();

    const startsDateInput = toIstInput(cfg.startsAt);
    const endsDateInput = toIstInput(cfg.endsAt);

    return (
        <div style={{ display: "grid", gap: 18 }}>
            {/* 1. Campaign Switchboard */}
            <div className="adm-card">
                <h3 style={{ margin: "0 0 4px" }}>🎛️ 14-Day Campaign Control Switchboard</h3>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, opacity: 0.72 }}>
                    Switch between Collecting Reels (14 days), Final 100-Point Scoring, and Official Winner Announced in 1 click.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}>
                        <input
                            type="checkbox"
                            checked={cfg.active}
                            onChange={(e) => setCfg({ ...cfg, active: e.target.checked })}
                        />
                        <span>Accepting Entries (Live)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}>
                        <input
                            type="checkbox"
                            checked={cfg.showPromos}
                            onChange={(e) => setCfg({ ...cfg, showPromos: e.target.checked })}
                        />
                        <span>Show Promo Cards on Site</span>
                    </label>

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, marginBottom: 4 }}>Current Stage</div>
                        <select
                            value={cfg.phase}
                            onChange={(e) => setCfg({ ...cfg, phase: e.target.value as GiveawayPhase })}
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                        >
                            <option value="collecting">1. Collecting Reels (14 Days)</option>
                            <option value="judging">2. Final 100-Point Judging &amp; Verification</option>
                            <option value="ended">3. Official Winner Announced 🏆</option>
                        </select>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, marginBottom: 4 }}>Starts At (IST)</div>
                        <input
                            type="datetime-local"
                            value={startsDateInput}
                            onChange={(e) => {
                                if (e.target.value) setCfg({ ...cfg, startsAt: fromIstInput(e.target.value) });
                            }}
                            style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, marginBottom: 4 }}>Ends At (IST — 14 Days)</div>
                        <input
                            type="datetime-local"
                            value={endsDateInput}
                            onChange={(e) => {
                                if (e.target.value) setCfg({ ...cfg, endsAt: fromIstInput(e.target.value) });
                            }}
                            style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                    <button type="button" className="adm-btn" onClick={saveConfig} disabled={savingCfg}>
                        {savingCfg ? "Saving…" : "💾 Save Giveaway Settings"}
                    </button>
                    <a href="/giveaway" target="_blank" rel="noopener noreferrer" className="adm-btn ghost">
                        👀 Open /giveaway Live ↗
                    </a>
                    {cfgMsg && <span style={{ fontSize: 13, fontWeight: 700 }}>{cfgMsg}</span>}
                </div>
            </div>

            {/* 2. Resend Domain Email Broadcaster (hello@birthdaywisher.fun) */}
            <div className="adm-card">
                <h3 style={{ margin: "0 0 4px" }}>
                    📧 Participant Email Center ({fromAddress}) — {resendReady ? "🟢 Resend Key Configured" : "🔴 RESEND_API_KEY Missing"}
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, opacity: 0.75 }}>
                    Every participant automatically gets a Ticket <code>#BW-XXX</code> confirmation email on submit, and you can email updates to everyone below! (Make sure <code>birthdaywisher.fun</code> domain DNS is verified in your Resend dashboard.)
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <input
                        value={testTo}
                        onChange={(e) => setTestTo(e.target.value)}
                        placeholder="Test email recipient..."
                        style={{ padding: "8px 12px", borderRadius: 8, minWidth: 230, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                    />
                    <select
                        value={testKind}
                        onChange={(e) => setTestKind(e.target.value as "ticket" | "broadcast")}
                        style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                    >
                        <option value="ticket">🎟️ VIP Ticket Confirmation Template</option>
                        <option value="broadcast">📨 Active Broadcast Template Below</option>
                    </select>
                    <button type="button" className="adm-btn ghost" onClick={() => loadPreview("ticket")}>
                        👁️ Preview Ticket Mail
                    </button>
                    <button type="button" className="adm-btn ghost" onClick={() => loadPreview("broadcast")}>
                        👁️ Preview Broadcast Mail
                    </button>
                    <button type="button" className="adm-btn" onClick={sendTest} disabled={testBusy || !resendReady}>
                        {testBusy ? "Sending Test…" : "🧪 Send Real Test Email"}
                    </button>
                    {testStatus && <span style={{ fontSize: 12.5, fontWeight: 700, width: "100%" }}>{testStatus}</span>}
                </div>

                {previewHtml && (
                    <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.18)", background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#1e1638", color: "#fff", fontSize: 12.5, fontWeight: 700 }}>
                            <span>📧 Subject: {previewSubject}</span>
                            <button type="button" className="adm-btn sm ghost" onClick={() => setPreviewHtml(null)}>
                                Close Preview ×
                            </button>
                        </div>
                        <iframe
                            title="Email template preview"
                            srcDoc={previewHtml}
                            style={{ width: "100%", height: 560, border: 0, display: "block", background: "#FFF6EC" }}
                        />
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {EMAIL_TEMPLATES.map((tpl) => (
                        <button
                            key={tpl.id}
                            type="button"
                            className="adm-btn sm ghost"
                            onClick={() => {
                                setSubject(tpl.subject);
                                setHeading(tpl.heading);
                                setMessage(tpl.message);
                                setCtaLabel(tpl.ctaLabel);
                            }}
                        >
                            Load: {tpl.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10 }}>
                        <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value as "all" | "finalists")}
                            style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                        >
                            <option value="all">All Participants</option>
                            <option value="finalists">Shortlisted Top Picks Only</option>
                        </select>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject..."
                            style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                        />
                    </div>
                    <input
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        placeholder="Banner Heading..."
                        style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)" }}
                    />
                    <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Email message..."
                        style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.16)", fontFamily: "inherit" }}
                    />
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <button type="button" className="adm-btn" onClick={sendBroadcast} disabled={sendingBulk || !resendReady}>
                            {sendingBulk ? "Sending Emails…" : "📨 Broadcast Email to Participants"}
                        </button>
                        {bulkStatus && <span style={{ fontSize: 13, fontWeight: 700 }}>{bulkStatus}</span>}
                    </div>
                </div>
            </div>

            {/* 3. Entries Moderation, 1-Click Verification & 100-Point Fair Scoreboard */}
            <div className="adm-card">
                <h3 style={{ margin: "0 0 4px" }}>🎬 100-Point Fair Scoreboard &amp; 1-Click IG Verification ({entries.length})</h3>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, opacity: 0.78 }}>
                    <b>100-Pt Formula:</b> Click <b>[🎬 15–30s Reel +10]</b>, <b>[🎥 In-Person +15]</b>, <b>[🤝 Collab +5]</b>, <b>[📲 Story +5]</b> after checking the Reel &amp; IG notifications (amber <code>Claimed</code> shows what the creator ticked) + enter <b>🎨 Creativity (0–35)</b> &amp; <b>🔥 Real Views (0–30)</b> = <b>Total / 100</b>!
                </p>

                {entries.length === 0 ? (
                    <p className="adm-empty">No Reels submitted yet — entries open automatically tonight at 12:00 AM IST!</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="adm-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr>
                                    <th>Ticket · Creator</th>
                                    <th>Reel &amp; Email</th>
                                    <th>Reward</th>
                                    <th>1-Click Verify (35 Pts: Reel +10 · In-Person +15 · Collab +5 · Story +5)</th>
                                    <th>Creativity (35) + Views (30) = /100</th>
                                    <th>Status &amp; Crown</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((e) => {
                                    const p = getPrizeInfo(e.prizeChoice, e.region || "IN");
                                    const regFlag = e.region === "GLOBAL" ? "🌍" : "🇮🇳";
                                    const busy = rowBusy === e.id;
                                    const pillBase: React.CSSProperties = {
                                        padding: "4px 9px",
                                        borderRadius: 999,
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        cursor: busy ? "wait" : "pointer",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        fontFamily: "inherit",
                                    };
                                    return (
                                        <tr key={e.id}>
                                            <td>
                                                <b>#{e.ticketCode}</b> <small>{regFlag} {e.country || e.region}</small>
                                                <br />
                                                <span style={{ fontWeight: 700 }}>{e.igHandle}</span>{" "}
                                                <small style={{ opacity: 0.72 }}>{e.isInPerson ? "🎥" : "🙈"}</small>
                                                {e.note && (
                                                    <div style={{ fontSize: 11.5, opacity: 0.72, maxWidth: 190 }}>
                                                        &ldquo;{e.note}&rdquo;
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <a href={e.reelUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontWeight: 700 }}>
                                                    🎬 Watch Reel ↗
                                                </a>
                                                <br />
                                                <small style={{ opacity: 0.72 }}>{e.email} {e.emailOptIn ? "" : "(unsub)"}</small>
                                            </td>
                                            <td>
                                                {p.emoji} {p.shortTitle}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        title="Verify valid 15–30s public Reel (+10 pts)"
                                                        style={{
                                                            ...pillBase,
                                                            background: e.reelVerified ? "rgba(46,216,182,0.25)" : "rgba(255,255,255,0.06)",
                                                            borderColor: e.reelVerified ? "#2ed8b6" : "rgba(255,255,255,0.2)",
                                                            color: e.reelVerified ? "#5eead4" : "inherit",
                                                        }}
                                                        onClick={() => updateEntry(e.id, { reelVerified: !e.reelVerified })}
                                                    >
                                                        {e.reelVerified ? "✅ Reel +10" : "🎬 Reel +10"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        title={e.isInPerson ? "Creator selected In-Person — click to verify +15 bonus pts" : "Creator selected Faceless — click only if Reel actually shows real person (+15 pts)"}
                                                        style={{
                                                            ...pillBase,
                                                            background: e.inPersonVerified
                                                                ? "rgba(46,216,182,0.25)"
                                                                : e.isInPerson
                                                                  ? "rgba(255,217,61,0.16)"
                                                                  : "rgba(255,255,255,0.06)",
                                                            borderColor: e.inPersonVerified
                                                                ? "#2ed8b6"
                                                                : e.isInPerson
                                                                  ? "rgba(255,217,61,0.55)"
                                                                  : "rgba(255,255,255,0.2)",
                                                            color: e.inPersonVerified ? "#5eead4" : e.isInPerson ? "#fde047" : "inherit",
                                                        }}
                                                        onClick={() => updateEntry(e.id, { inPersonVerified: !e.inPersonVerified })}
                                                    >
                                                        {e.inPersonVerified ? "✅ In-Person +15" : `🎥 In-Person +15${e.isInPerson ? " (Claimed)" : ""}`}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        title={e.sentCollab ? "Creator claimed Collab invite — click to verify +5 pts" : "Click if Collab invite received (+5 pts)"}
                                                        style={{
                                                            ...pillBase,
                                                            background: e.collabVerified
                                                                ? "rgba(46,216,182,0.25)"
                                                                : e.sentCollab
                                                                  ? "rgba(255,217,61,0.16)"
                                                                  : "rgba(255,255,255,0.06)",
                                                            borderColor: e.collabVerified
                                                                ? "#2ed8b6"
                                                                : e.sentCollab
                                                                  ? "rgba(255,217,61,0.55)"
                                                                  : "rgba(255,255,255,0.2)",
                                                            color: e.collabVerified ? "#5eead4" : e.sentCollab ? "#fde047" : "inherit",
                                                        }}
                                                        onClick={() => updateEntry(e.id, { collabVerified: !e.collabVerified })}
                                                    >
                                                        {e.collabVerified ? "✅ Collab +5" : `🤝 Collab +5${e.sentCollab ? " (Claimed)" : ""}`}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        title={e.sharedStory ? "Creator claimed Story share — check IG DM & click to verify +5 pts" : "Click if Story mention received (+5 pts)"}
                                                        style={{
                                                            ...pillBase,
                                                            background: e.storyVerified
                                                                ? "rgba(46,216,182,0.25)"
                                                                : e.sharedStory
                                                                  ? "rgba(255,217,61,0.16)"
                                                                  : "rgba(255,255,255,0.06)",
                                                            borderColor: e.storyVerified
                                                                ? "#2ed8b6"
                                                                : e.sharedStory
                                                                  ? "rgba(255,217,61,0.55)"
                                                                  : "rgba(255,255,255,0.2)",
                                                            color: e.storyVerified ? "#5eead4" : e.sharedStory ? "#fde047" : "inherit",
                                                        }}
                                                        onClick={() => updateEntry(e.id, { storyVerified: !e.storyVerified })}
                                                    >
                                                        {e.storyVerified ? "✅ Story +5" : `📲 Story +5${e.sharedStory ? " (Claimed)" : ""}`}
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11.5 }}>
                                                        <span title="Creativity (0-35)">🎨</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={35}
                                                            defaultValue={e.creativityScore}
                                                            title="Creativity Score (0-35)"
                                                            style={{ width: 50, padding: "4px 5px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.18)" }}
                                                            onBlur={(ev) => updateEntry(e.id, { creativityScore: Number(ev.target.value) })}
                                                        />
                                                    </label>
                                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11.5 }}>
                                                        <span title="Real Organic Views & Reach (0-30)">🔥</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={30}
                                                            defaultValue={e.engagementScore}
                                                            title="Views / Engagement Score (0-30)"
                                                            style={{ width: 50, padding: "4px 5px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "inherit", border: "1px solid rgba(255,255,255,0.18)" }}
                                                            onBlur={(ev) => updateEntry(e.id, { engagementScore: Number(ev.target.value) })}
                                                        />
                                                    </label>
                                                    <b style={{ marginLeft: 4, color: "#ffd93d", whiteSpace: "nowrap" }}>
                                                        = {e.totalScore} / 100
                                                    </b>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        className={`adm-btn sm ${e.status === "finalist" ? "" : "ghost"}`}
                                                        onClick={() => updateEntry(e.id, { status: e.status === "finalist" ? "approved" : "finalist" })}
                                                    >
                                                        {e.status === "finalist" ? "🏅 Top Pick" : "Shortlist"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        className={`adm-btn sm ${e.status === "winner" ? "" : "ghost"}`}
                                                        onClick={() => {
                                                            if (window.confirm(`Crown ${e.igHandle} (#${e.ticketCode} · ${e.totalScore}/100 pts) as the Official ReelFest Winner?`)) {
                                                                updateEntry(e.id, { status: "winner" });
                                                            }
                                                        }}
                                                    >
                                                        👑 Winner
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        className="adm-btn sm ghost"
                                                        onClick={() => updateEntry(e.id, { status: e.status === "rejected" ? "approved" : "rejected" })}
                                                    >
                                                        {e.status === "rejected" ? "Restore" : "Hide"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        className="adm-btn sm ghost"
                                                        onClick={() => removeEntry(e.id, e.ticketCode)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export { GIVEAWAY_PRIZES };
