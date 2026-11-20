"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

const ADSENSE_CLIENT = "ca-pub-6302942607473891";

/**
 * Optional CLS-safe responsive AdSense display / in-article unit.
 * Renders cleanly ONLY when a numeric AdSense slot ID is provided (either via prop
 * or `NEXT_PUBLIC_ADSENSE_BLOG_SLOT`), preventing `Missing slotId` console errors
 * when running pure Auto Ads.
 */
export function AdUnit({
    slot = process.env.NEXT_PUBLIC_ADSENSE_BLOG_SLOT,
    format = "auto",
    layout,
    minHeight = 120,
}: {
    slot?: string;
    format?: "auto" | "fluid";
    layout?: "in-article";
    minHeight?: number;
}) {
    const pushed = useRef(false);
    const validSlot = typeof slot === "string" && /^\d{6,20}$/.test(slot.trim()) ? slot.trim() : "";

    useEffect(() => {
        if (!validSlot || pushed.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch {
            /* Adblocker or script still loading */
        }
    }, [validSlot]);

    if (!validSlot) return null;

    return (
        <aside
            aria-label="Sponsored"
            style={{
                width: "100%",
                maxWidth: 880,
                minHeight,
                margin: "28px auto",
                textAlign: "center",
                overflow: "hidden",
            }}
        >
            <ins
                className="adsbygoogle"
                style={{ display: "block", textAlign: layout === "in-article" ? "center" : undefined }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={validSlot}
                data-ad-format={format}
                data-ad-layout={layout}
                data-full-width-responsive="true"
            />
        </aside>
    );
}
