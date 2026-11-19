"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ADSENSE_CLIENT = "ca-pub-6302942607473891";
const NO_ADS_PREFIX = /^\/(wish|w|create|admin|dashboard|dev)(\/|$)/;

/**
 * Loads Google AdSense after initial paint / idle on public content pages only.
 * Keeping AdSense off /wish/* and /create protects private wishes and eliminates
 * FCP/LCP contention, Auto-Ads CLS layout shifts, and INP main-thread stalls.
 */
export function AdSenseLoader() {
    const pathname = usePathname() || "";

    useEffect(() => {
        if (!pathname || NO_ADS_PREFIX.test(pathname)) return;
        if (document.getElementById("bw-adsense-js")) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const inject = () => {
            if (cancelled || document.getElementById("bw-adsense-js")) return;
            const s = document.createElement("script");
            s.id = "bw-adsense-js";
            s.async = true;
            s.crossOrigin = "anonymous";
            s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
            document.head.appendChild(s);
        };

        const schedule = () => {
            const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
            if (typeof ric === "function") {
                ric(() => {
                    timer = setTimeout(inject, 600);
                }, { timeout: 2500 });
            } else {
                timer = setTimeout(inject, 2200);
            }
        };

        if (document.readyState === "complete") {
            schedule();
        } else {
            window.addEventListener("load", schedule, { once: true });
        }

        return () => {
            cancelled = true;
            window.removeEventListener("load", schedule);
            if (timer) clearTimeout(timer);
        };
    }, [pathname]);

    return null;
}
