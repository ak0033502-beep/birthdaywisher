"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ADSENSE_CLIENT = "ca-pub-6302942607473891";

// Routes that must stay 100% ad-free (creating a wish, opening a wish, admin, creator dashboard)
export const NO_ADS_PREFIX = /^\/(wish|w|create|admin|dashboard|dev)(\/|$)/;

function purgeAutoAdsFromDom() {
    const selectors = [
        ".google-auto-placed",
        "ins.adsbygoogle",
        'ins[class*="adsbygoogle"]',
        'div[id^="google-anno-"]',
        'iframe[id^="google_esf"]',
    ];
    document.querySelectorAll(selectors.join(",")).forEach((el) => {
        // Only remove Google Auto-Ads containers outside explicit <AdUnit> wrappers, or hide all on ad-free routes
        el.remove();
    });
    // Ensure Google Vignette / modal scroll-lock never traps body scroll on /create or /wish
    if (document.body) {
        document.body.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("overflow");
    }
}

/**
 * Loads Google AdSense on public content pages (/, /blog/*, /games/*, /use-cases/*, /anniversary, etc.)
 * and strictly blocks/purges Auto-Ads on /create, /wish/*, /w/*, /admin, and /dashboard —
 * even across client-side SPA navigations (e.g. clicking "/" → "/create").
 */
export function AdSenseLoader() {
    const pathname = usePathname() || "";

    useEffect(() => {
        if (!pathname) return;
        const isAdFree = NO_ADS_PREFIX.test(pathname);

        if (isAdFree) {
            document.documentElement.setAttribute("data-ad-free", "1");
            purgeAutoAdsFromDom();
            // Watch briefly in case an already-loaded Auto-Ads script attempts a delayed injection after SPA pushState
            const mo = new MutationObserver(() => {
                if (document.querySelector(".google-auto-placed, ins.adsbygoogle")) {
                    purgeAutoAdsFromDom();
                }
            });
            if (document.body) {
                mo.observe(document.body, { childList: true, subtree: false });
            }
            return () => mo.disconnect();
        }

        document.documentElement.removeAttribute("data-ad-free");
        if (document.getElementById("bw-adsense-js")) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const inject = () => {
            if (cancelled || NO_ADS_PREFIX.test(window.location.pathname)) return;
            if (document.getElementById("bw-adsense-js")) return;
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
