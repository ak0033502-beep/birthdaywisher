"use client";

import "@/components/giveaway/giveaway.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import {
    getGiveawayRegionPack,
    resolveGiveawayRegion,
    type GiveawayRegion,
} from "@/lib/giveawayTypes";

let cachedPromoInfo: { show: boolean; startsAt?: string; region?: GiveawayRegion } | null = null;

function useGiveawayPromoState() {
    const [info, setInfo] = useState<{ show: boolean; startsAt?: string; region: GiveawayRegion }>(
        () => ({
            show: cachedPromoInfo?.show ?? true,
            startsAt: cachedPromoInfo?.startsAt,
            region: cachedPromoInfo?.region ?? "IN",
        }),
    );
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());
        let tz = "";
        let previewCountry = "";
        try {
            tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            previewCountry = new URLSearchParams(window.location.search).get("previewCountry") || "";
            const localReg = resolveGiveawayRegion(previewCountry, tz).region;
            setInfo((prev) => ({ ...prev, region: cachedPromoInfo?.region ?? localReg }));
        } catch {
            // ignore
        }

        const iv = window.setInterval(() => setNow(Date.now()), 15_000);
        if (!cachedPromoInfo) {
            const qs = new URLSearchParams();
            if (tz) qs.set("tz", tz);
            if (previewCountry) qs.set("previewCountry", previewCountry);
            fetch(`/api/giveaway?${qs.toString()}`, { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : null))
                .then((d: { config?: { showPromos?: boolean; startsAt?: string }; region?: GiveawayRegion } | null) => {
                    if (!d?.config) return;
                    const next = {
                        show: d.config.showPromos !== false,
                        startsAt: d.config.startsAt,
                        region: d.region || resolveGiveawayRegion(previewCountry, tz).region,
                    };
                    cachedPromoInfo = next;
                    setInfo(next);
                })
                .catch(() => {});
        }
        return () => window.clearInterval(iv);
    }, []);

    const isUpcoming = Boolean(info.startsAt && now !== null && now < Date.parse(info.startsAt));
    const pack = getGiveawayRegionPack(info.region);
    return { show: info.show, isUpcoming, pack, region: info.region };
}

export function GiveawayHeroPill() {
    const { show, isUpcoming, pack, region } = useGiveawayPromoState();
    if (!show) return null;
    return (
        <div>
            <Link
                href="/giveaway"
                className="gw-promo-pill"
                onClick={() => track("cta_click", { label: "giveaway_home_pill" })}
            >
                <span aria-hidden="true">🎁</span>
                <span>
                    <b>{isUpcoming ? "REELFEST TONIGHT 12 AM:" : "REELFEST LIVE:"}</b> Drop a 15–30s Reel → Win{" "}
                    {region === "IN" ? "₹2,000 Amazon / OnePlus Buds" : "$25 USD Gift Card"}
                </span>
                <span style={{ color: "var(--p-pink)", fontWeight: 900 }}>{isUpcoming ? "Preview →" : "Join →"}</span>
            </Link>
        </div>
    );
}

export function GiveawayCreatorCard({ surface }: { surface: "finish" | "game_finish" | "dashboard" }) {
    const { show, isUpcoming, pack, region } = useGiveawayPromoState();
    if (!show) return null;
    return (
        <div className="gw-promo-card" role="region" aria-label="BirthdayWisher ReelFest">
            <div style={{ flex: "1 1 250px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--p-pink, #ff5c8a)" }}>
                    🎬 {isUpcoming ? `REELFEST STARTS 12 AM IST · WIN ${pack.amountDisplay}` : `BIRTHDAYWISHER REELFEST · WIN ${pack.amountDisplay}`}
                </div>
                <div style={{ fontFamily: "var(--p-font-display, inherit)", fontSize: 17.5, fontWeight: 800, margin: "3px 0 4px", color: "var(--p-text, #2b2240)" }}>
                    Drop a 15–30s Reel in ReelFest &amp; win {pack.amountDisplay}! 🎁
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "var(--p-muted, #6b6380)", fontWeight: 600 }}>
                    {region === "IN"
                        ? "Pick ₹2,000 Amazon Pay Voucher, OnePlus Buds, Smartwatch, or JBL Speaker — +15 direct bonus pts for In-Person Reels!"
                        : "Win an instant $25 USD Official Digital Gift Card delivered worldwide — +15 direct bonus pts for In-Person Reels!"}
                </p>
            </div>
            <Link
                href={`/giveaway?from=${surface}`}
                className="bw-btn bw-btn-primary bw-btn-sm"
                style={{ textDecoration: "none" }}
                onClick={() => track("cta_click", { label: `giveaway_${surface}` })}
            >
                🎟️ Join ReelFest →
            </Link>
        </div>
    );
}
