"use client";

import "./vault.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import {
    VAULT_FREE_LIMIT,
    type VaultPlanId,
    type VaultRegionConfig,
    type VaultSurface,
} from "@/lib/vaultPricing";

interface VaultApiResponse {
    status?: "claimed" | "already_saved" | "sold_out" | "not_found";
    isTestMode?: boolean;
    totalSpots: number;
    claimedSpots: number;
    spotsLeft: number;
    wishSaved: boolean;
    savedPlan: VaultPlanId | null;
    keepUntil: string | null;
    spotNumber: number | null;
    region: "IN" | "GB" | "GLOBAL";
    country: string;
    config: VaultRegionConfig;
    error?: string;
}

export function KeepAliveCard({
    wishId,
    surface,
    variant = "party",
    previewOnly = false,
    onSaved,
}: {
    wishId?: string;
    surface: VaultSurface;
    variant?: "party" | "dark";
    previewOnly?: boolean;
    onSaved?: (keepUntil: string, plan: VaultPlanId) => void;
}) {
    const [data, setData] = useState<VaultApiResponse | null>(null);
    const [claiming, setClaiming] = useState<VaultPlanId | null>(null);
    const [justClaimed, setJustClaimed] = useState(false);
    const [soldOutMsg, setSoldOutMsg] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [tick, setTick] = useState(false);

    const prevSpotsRef = useRef<number | null>(null);
    const trackedViewRef = useRef(false);
    const simClaimRef = useRef<{ keepUntil: string; savedPlan: VaultPlanId } | null>(null);

    const getClientHints = useCallback(() => {
        let tz = "";
        let previewCountry = "";
        let isOwnerBrowser = false;
        try {
            tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            if (typeof window !== "undefined") {
                previewCountry = new URLSearchParams(window.location.search).get("previewCountry") || "";
                isOwnerBrowser = window.localStorage.getItem("bw_exclude") === "1";
            }
        } catch {
            // ignore
        }
        return { tz, previewCountry, isOwnerBrowser };
    }, []);

    const fetchStatus = useCallback(async () => {
        if (!wishId) return;
        const { tz, previewCountry, isOwnerBrowser } = getClientHints();
        const qs = new URLSearchParams({ wishId });
        if (tz) qs.set("tz", tz);
        if (previewCountry) qs.set("previewCountry", previewCountry);

        try {
            const res = await fetch(`/api/wish/keep?${qs.toString()}`, {
                cache: "no-store",
                headers: isOwnerBrowser ? { "x-bw-owner": "1" } : undefined,
            });
            if (!res.ok) return;
            const json = (await res.json()) as VaultApiResponse;
            if (prevSpotsRef.current !== null && prevSpotsRef.current !== json.spotsLeft) {
                setTick(true);
                window.setTimeout(() => setTick(false), 650);
            }
            prevSpotsRef.current = json.spotsLeft;

            if (simClaimRef.current) {
                setData({
                    ...json,
                    wishSaved: true,
                    keepUntil: simClaimRef.current.keepUntil,
                    savedPlan: simClaimRef.current.savedPlan,
                });
            } else {
                setData(json);
            }

            if (!trackedViewRef.current && !json.wishSaved && !json.isTestMode && !previewOnly) {
                trackedViewRef.current = true;
                track("vault_view", { region: json.region, surface, spotsLeft: json.spotsLeft }, wishId);
            }
        } catch {
            // silent network retry on next tick
        }
    }, [wishId, surface, previewOnly, getClientHints]);

    // Initial load + live 12s polling while tab is visible so the 200 counter updates live
    useEffect(() => {
        if (!wishId) return;
        void fetchStatus();

        const id = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void fetchStatus();
            }
        }, 12_000);

        const onVis = () => {
            if (document.visibilityState === "visible") {
                void fetchStatus();
            }
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [wishId, fetchStatus]);

    const handleClaim = async (plan: VaultPlanId) => {
        if (!wishId || !data || claiming) return;
        setErrorMsg("");

        if (data.spotsLeft <= 0 && !data.isTestMode) {
            track("vault_post200_click", { plan, region: data.region, surface }, wishId);
            setSoldOutMsg(true);
            return;
        }

        setClaiming(plan);
        const { tz, previewCountry, isOwnerBrowser } = getClientHints();
        try {
            const res = await fetch("/api/wish/keep", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(isOwnerBrowser ? { "x-bw-owner": "1" } : {}),
                },
                body: JSON.stringify({
                    wishId,
                    plan,
                    surface,
                    tz,
                    ...(previewCountry ? { previewCountry } : {}),
                }),
            });
            const json = (await res.json()) as VaultApiResponse;
            if (!res.ok) {
                setErrorMsg(json.error || "Could not save right now. Please try again.");
                return;
            }

            if (prevSpotsRef.current !== json.spotsLeft) {
                setTick(true);
                window.setTimeout(() => setTick(false), 650);
            }
            prevSpotsRef.current = json.spotsLeft;

            if (json.isTestMode && json.keepUntil) {
                simClaimRef.current = {
                    keepUntil: json.keepUntil,
                    savedPlan: json.savedPlan || plan,
                };
            }
            setData(json);

            if (json.status === "sold_out") {
                if (!json.isTestMode) {
                    track("vault_post200_click", { plan, region: json.region, surface }, wishId);
                }
                setSoldOutMsg(true);
                return;
            }

            if (json.wishSaved && json.keepUntil) {
                setJustClaimed(true);
                if (!json.isTestMode) {
                    track(
                        "vault_claim",
                        {
                            plan: json.savedPlan || plan,
                            region: json.region,
                            currency: json.config.currency,
                            spot: json.spotNumber ?? undefined,
                            surface,
                        },
                        wishId,
                    );
                }
                onSaved?.(json.keepUntil, json.savedPlan || plan);
                void import("canvas-confetti").then(({ default: confetti }) => {
                    confetti({
                        particleCount: 70,
                        spread: 70,
                        origin: { y: 0.7 },
                        disableForReducedMotion: true,
                        zIndex: 400,
                    });
                }).catch(() => {});
            }
        } catch {
            setErrorMsg("Network error. Please tap once more.");
        } finally {
            setClaiming(null);
        }
    };

    if (!wishId || !data) return null;

    const { config, spotsLeft, claimedSpots, totalSpots, wishSaved, keepUntil, spotNumber, savedPlan, isTestMode } = data;
    const progressPct = Math.min(100, Math.max(4, Math.round((claimedSpots / (totalSpots || VAULT_FREE_LIMIT)) * 100)));

    if (wishSaved && keepUntil) {
        const formattedDate = new Date(keepUntil).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const planLabel = savedPlan === "1y" ? "1 Full Year" : "30 Days";
        return (
            <div className={`mv-card mv-${variant}`} role="status" aria-live="polite">
                <div className="mv-saved">
                    <div className="mv-saved-head">
                        <span aria-hidden="true">✅</span>
                        <span>Wish Saved Until {formattedDate} ({planLabel})</span>
                    </div>
                    <p className="mv-saved-gift">
                        🎁 {justClaimed ? `${config.freeGiftTitle} ${config.freeGiftNote}` : config.freeGiftNote}
                    </p>
                    <div className="mv-bar" aria-hidden="true" style={{ marginBottom: 4, marginTop: 4 }}>
                        <i style={{ width: `${progressPct}%` }} />
                    </div>
                    {isTestMode ? (
                        <p className="mv-saved-meta">
                            🧪 <b>Localhost / Admin Preview:</b> Real 200-spot counter was NOT used ({spotsLeft} of {totalSpots} still left for real users)
                        </p>
                    ) : (
                        <p className="mv-saved-meta">
                            <span className="mv-dot" aria-hidden="true" style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />
                            {spotNumber ? `Early Supporter #${spotNumber} of ${totalSpots} · ` : ""}
                            Live:<b className={`mv-spots-num ${tick ? "is-tick" : ""}`}>{spotsLeft}</b>of {totalSpots} free early spots left
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <section className={`mv-card mv-${variant}`} aria-label="Keep this wish alive">
            <div className="mv-top">
                <span className="mv-live-pill">
                    <span aria-hidden="true">⏳</span>
                    <span>Auto-deletes 10 hours after opening</span>
                </span>
            </div>

            <h3 className="mv-title">🔒 {config.title}</h3>
            <p className="mv-sub">{config.subtext}</p>

            {soldOutMsg ? (
                <p className="mv-saved-gift" role="status">
                    Online payment checkout ({config.plans[0].displayPrice} / {config.plans[1].displayPrice}) is activating very soon — thank you!
                </p>
            ) : (
                <div className="mv-plans">
                    {config.plans.map((p, idx) => {
                        const isPrimary = idx === 1;
                        const isBusy = claiming === p.id;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                className={`mv-plan-btn ${isPrimary ? "is-primary" : "is-secondary"}`}
                                onClick={() => handleClaim(p.id)}
                                disabled={claiming !== null}
                            >
                                {p.badge && <span className="mv-plan-badge">{p.badge}</span>}
                                <span className="mv-plan-dur">{p.label}</span>
                                <span className="mv-plan-price">
                                    <span>{p.displayPrice}</span>
                                </span>
                                <span className="mv-plan-cta">
                                    {isBusy
                                        ? "Processing…"
                                        : isPrimary
                                            ? "Save for 1 Year →"
                                            : "Save for 30 Days"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {errorMsg && <p className="mv-err" role="alert">{errorMsg}</p>}
        </section>
    );
}
