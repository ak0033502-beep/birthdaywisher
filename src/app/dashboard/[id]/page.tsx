"use client";

import "./dashboard.css";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bunting } from "@/components/party/Decor";
import { PartyFooter } from "@/components/party/PartyFooter";
import { BLOCKS } from "@/blocks/registry";
import { KeepAliveCard } from "@/components/vault/KeepAliveCard";
import { GiveawayCreatorCard } from "@/components/giveaway/GiveawayPromoCard";

interface AnalyticsData {
    wishId: string;
    recipientName?: string;
    wishType?: "birthday" | "anniversary";
    reachedFinale?: boolean;
    viewCount: number;
    createdAt: string;
    openedAt: string | null;
    customSlug: string | null;
    keepUntil?: string | null;
    vaultPlan?: string | null;
    totalTimeSpent: number;
    sectionTimes: Record<string, number>;
    mostLovedSection: string;
}

function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "0s";
    if (ms < 1000) return "< 1s";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainSec = seconds % 60;
    return `${minutes}m ${remainSec}s`;
}

function formatBlockLabel(key: string): { icon: string; label: string } {
    if (!key) return { icon: "🎈", label: "—" };
    const b = (BLOCKS as Record<string, { label?: string; icon?: string } | undefined>)[key];
    if (b?.label) return { icon: b.icon || "🎈", label: b.label };
    const clean = key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { icon: "🎈", label: clean };
}

function formatRemainingWindow(openedAt: string | null, keepUntil?: string | null): string {
    if (keepUntil) {
        const dt = new Date(keepUntil);
        if (dt.getTime() > Date.now()) {
            return `🛡️ Saved in Memory Vault until ${dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
        }
    }
    if (!openedAt) {
        return "🎁 Waiting to be opened · 10-hour privacy timer starts on first open";
    }
    const expiresMs = new Date(openedAt).getTime() + 10 * 3600 * 1000;
    const leftMs = expiresMs - Date.now();
    if (leftMs <= 0) {
        return "⏳ 10-hour window finished · Scheduled for cleanup";
    }
    const hrs = Math.floor(leftMs / 3600_000);
    const mins = Math.floor((leftMs % 3600_000) / 60_000);
    return `⏳ Opened · ${hrs}h ${mins}m left before auto-delete`;
}

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [wishId, setWishId] = useState("");

    const loadStats = useCallback(async (id: string, isRefresh = false) => {
        const token = localStorage.getItem(`creator_token_${id}`);
        if (!token) {
            setError("Creator access key not found on this device. You can view stats from the browser where you created the wish.");
            setLoading(false);
            return;
        }
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch(`/api/analytics?wishId=${encodeURIComponent(id)}`, {
                headers: { "x-creator-token": token },
                cache: "no-store",
            });
            if (!res.ok) throw new Error("Unauthorized");
            const data = (await res.json()) as AnalyticsData;
            setAnalytics(data);
            setError("");
        } catch {
            setError("Could not load stats. This wish may have expired or the creator key did not match.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        params.then((resolved) => {
            setWishId(resolved.id);
            void loadStats(resolved.id);
        });
    }, [params, loadStats]);

    if (loading) {
        return (
            <div className="party bw-page">
                <header className="bw-hero bw-page-hero is-center">
                    <Bunting />
                    <div className="bw-container bw-page-hero-in">
                        <div className="bw-card db-state-box">
                            <div style={{ fontSize: 42, marginBottom: 10 }} aria-hidden="true">🎂</div>
                            <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Loading your surprise stats…</h1>
                            <p style={{ color: "var(--p-muted)", fontWeight: 600, margin: 0 }}>Checking live views &amp; reactions</p>
                        </div>
                    </div>
                </header>
                <PartyFooter />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="party bw-page">
                <header className="bw-hero bw-page-hero is-center">
                    <Bunting />
                    <div className="bw-container bw-page-hero-in">
                        <div className="bw-card db-state-box">
                            <div style={{ fontSize: 44, marginBottom: 10 }} aria-hidden="true">🔒</div>
                            <h1 style={{ fontSize: 28, margin: "0 0 10px" }}>Dashboard Locked</h1>
                            <p style={{ color: "var(--p-muted)", fontWeight: 600, margin: "0 0 22px", lineHeight: 1.55 }}>
                                {error || "Wish not found."}
                            </p>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                                <Link href="/create" className="bw-btn bw-btn-primary bw-btn-sm">🎁 Create a New Surprise</Link>
                                <Link href="/" className="bw-btn bw-btn-ghost bw-btn-sm">← Back to Home</Link>
                            </div>
                        </div>
                    </div>
                </header>
                <PartyFooter />
            </div>
        );
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.birthdaywisher.fun";
    const shareLink = analytics.customSlug ? `${origin}/w/${analytics.customSlug}` : `${origin}/wish/${wishId}`;
    const whoTitle = analytics.recipientName
        ? `${analytics.recipientName}'s ${analytics.wishType === "anniversary" ? "Anniversary" : "Birthday"} Surprise`
        : "Your Surprise Analytics";
    const whatsappMsg = `🎁 ${analytics.recipientName || "Hey"}, I made a surprise for you! Tap to open 👉 ${shareLink}`;

    const mostLoved = formatBlockLabel(analytics.mostLovedSection);
    const sortedSections = Object.entries(analytics.sectionTimes).sort(([, a], [, b]) => b - a);
    const isSavedInVault = !!(analytics.keepUntil && new Date(analytics.keepUntil).getTime() > Date.now());

    const kpis = [
        {
            icon: "👀",
            bg: "rgba(255, 92, 138, 0.14)",
            label: "Total Opens",
            value: String(analytics.viewCount),
            sub: analytics.viewCount >= 3
                ? "Opened again & again!"
                : analytics.viewCount >= 1
                    ? "Surprise opened!"
                    : "Waiting for first tap",
        },
        {
            icon: "⏱️",
            bg: "rgba(46, 216, 182, 0.16)",
            label: "Time Spent",
            value: formatDuration(analytics.totalTimeSpent),
            sub: analytics.reachedFinale ? "Reached the Grand Finale 🎆" : "Reading & playing",
        },
        {
            icon: mostLoved.icon,
            bg: "rgba(124, 92, 255, 0.14)",
            label: "Most Loved Part",
            value: analytics.mostLovedSection ? mostLoved.label : "—",
            sub: analytics.mostLovedSection ? "Longest attention" : "Appears after opening",
        },
        {
            icon: isSavedInVault ? "🛡️" : analytics.openedAt ? "🎉" : "🎁",
            bg: "rgba(255, 159, 67, 0.16)",
            label: "Wish Status",
            value: isSavedInVault ? "Saved in Vault" : analytics.openedAt ? "Opened!" : "Ready to Open",
            sub: analytics.openedAt
                ? `First opened ${new Date(analytics.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Share your link below",
        },
    ];

    return (
        <div className="party bw-page">
            <header className="bw-hero bw-page-hero">
                <Bunting />
                <div className="bw-container bw-page-hero-in">
                    <nav aria-label="Breadcrumb" className="bw-crumbs">
                        <Link href="/">Home</Link>
                        <span aria-hidden="true"> › </span>
                        <span aria-current="page">Wish Analytics</span>
                    </nav>

                    <span className="bw-eyebrow">📊 Live Creator Dashboard</span>
                    <h1>{whoTitle} 🎂</h1>
                    <p className="bw-sub">{formatRemainingWindow(analytics.openedAt, analytics.keepUntil)}</p>

                    <div className="bw-card db-share-bar">
                        <span className="db-link-pill">
                            <span aria-hidden="true">🔗</span>
                            <span>{shareLink.replace(/^https?:\/\//, "")}</span>
                        </span>
                        <div className="db-share-actions">
                            <button
                                type="button"
                                className="bw-btn bw-btn-primary bw-btn-sm"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(shareLink);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1800);
                                    } catch {
                                        // clipboard unavailable
                                    }
                                }}
                            >
                                {copied ? "✅ Copied!" : "📋 Copy Link"}
                            </button>
                            <a
                                className="bw-btn bw-btn-primary bw-btn-sm"
                                style={{ background: "#25D366", boxShadow: "none" }}
                                href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                💬 WhatsApp
                            </a>
                            <a
                                className="bw-btn bw-btn-ghost bw-btn-sm"
                                href={shareLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                👀 Open Wish
                            </a>
                            <button
                                type="button"
                                className="bw-btn bw-btn-ghost bw-btn-sm"
                                onClick={() => void loadStats(wishId, true)}
                                disabled={refreshing}
                            >
                                {refreshing ? "Refreshing…" : "🔄 Refresh"}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="db-main">
                <div className="bw-container">
                    {/* 4 Joyful Party Stat Cards */}
                    <section className="db-kpis" aria-label="Wish summary metrics">
                        {kpis.map((k) => (
                            <div key={k.label} className="bw-card db-kpi">
                                <div className="db-kpi-ic" style={{ background: k.bg }} aria-hidden="true">
                                    {k.icon}
                                </div>
                                <div className="db-kpi-val">{k.value}</div>
                                <div className="db-kpi-lbl">{k.label}</div>
                                <div className="db-kpi-sub">{k.sub}</div>
                            </div>
                        ))}
                    </section>

                    {/* Memory Vault — Region-Wise Keep-Alive Card */}
                    <div className="db-vault-wrap">
                        <KeepAliveCard
                            wishId={wishId}
                            surface="dashboard"
                            variant="party"
                            onSaved={(keepUntil, plan) =>
                                setAnalytics((prev) => (prev ? { ...prev, keepUntil, vaultPlan: plan } : prev))
                            }
                        />
                        <GiveawayCreatorCard surface="dashboard" />
                    </div>

                    {/* Slide-by-Slide Attention Breakdown */}
                    <section className="bw-card db-panel" aria-label="Slide attention breakdown">
                        <div className="db-panel-head">
                            <h2>🎈 Slide &amp; Game Reactions</h2>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--p-muted)" }}>
                                Wish ID: <code>{wishId}</code>
                            </span>
                        </div>

                        {sortedSections.length > 0 ? (
                            <div className="db-rows">
                                {sortedSections.map(([section, timeMs], idx) => {
                                    const maxTime = sortedSections[0][1] || 1;
                                    const percent = Math.max(6, Math.round((timeMs / maxTime) * 100));
                                    const info = formatBlockLabel(section);
                                    const isTop = idx === 0;
                                    return (
                                        <div key={section}>
                                            <div className="db-row-top">
                                                <span className={isTop ? "is-top" : ""}>
                                                    {info.icon} {info.label} {isTop ? "· Most Loved ❤️" : ""}
                                                </span>
                                                <span className="db-row-time">{formatDuration(timeMs)}</span>
                                            </div>
                                            <div className="db-track">
                                                <div
                                                    className={`db-fill ${isTop ? "is-top" : ""}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="db-empty">
                                <div className="em" aria-hidden="true">🎁</div>
                                <h3>No slide activity recorded yet</h3>
                                <p>
                                    Send your surprise link on WhatsApp! As soon as {analytics.recipientName || "they"} open it and play your games, live view counts &amp; favourite slides will show up here.
                                </p>
                                <button
                                    type="button"
                                    className="bw-btn bw-btn-ghost bw-btn-sm"
                                    onClick={() => void loadStats(wishId, true)}
                                    disabled={refreshing}
                                >
                                    {refreshing ? "Checking…" : "🔄 Check Again"}
                                </button>
                            </div>
                        )}
                    </section>

                    <p className="db-foot-meta">
                        Created {new Date(analytics.createdAt).toLocaleString()}
                        {analytics.openedAt ? ` · First opened ${new Date(analytics.openedAt).toLocaleString()}` : ""}
                    </p>

                    <div className="bw-card bw-cta-card">
                        <div className="e" aria-hidden="true">🎂</div>
                        <h2>Want to surprise someone else too?</h2>
                        <p>Create another free birthday or anniversary surprise in under 60 seconds.</p>
                        <Link href="/create" className="bw-btn bw-btn-primary">🎁 Create Another Surprise</Link>
                    </div>
                </div>
            </main>

            <PartyFooter />
        </div>
    );
}
