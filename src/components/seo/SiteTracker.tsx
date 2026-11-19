"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/track";

// Ignore non-site errors injected by in-app WebViews (Instagram/Facebook Android bridges),
// browser extensions, third-party ad iframes, and benign W3C ResizeObserver warnings.
const IGNORED_ERR_MSG = /Java object is gone|ResizeObserver loop|Script error\.?$|webkit\.messageHandlers|FBNav|Non-Error promise rejection/i;
const IGNORED_ERR_SRC = /navigation_performance_logger|chrome-extension:|moz-extension:|safari-extension:|googlesyndication|doubleclick|adtrafficquality|googletagmanager/i;

/** Page views, Core Web Vitals and JS errors for the admin dashboard (first-party, anonymous). */
export function SiteTracker() {
    const pathname = usePathname();
    const last = useRef("");
    const seenVitals = useRef(new Set<string>());

    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin") || pathname === last.current) return;
        last.current = pathname;
        track("page_view");
    }, [pathname]);

    useReportWebVitals((m) => {
        if (location.pathname.startsWith("/admin")) return;
        if (!["LCP", "CLS", "INP", "FCP", "TTFB"].includes(m.name)) return;
        if (seenVitals.current.has(m.id)) return;
        seenVitals.current.add(m.id);
        track("vitals", { metric: m.name, value: m.name === "CLS" ? Math.round(m.value * 1000) / 1000 : Math.round(m.value), rating: (m as { rating?: string }).rating });
    });

    // Clicks on any "create" call-to-action (which page and which button sends people to the wizard)
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!a) return;
            const href = a.getAttribute("href") || "";
            if (!/^\/(create|anniversary|birthday-wishes-game|games\/)/.test(href) || location.pathname.startsWith("/admin")) return;
            track("cta_click", { to: href.split("?")[0].slice(0, 60), label: (a.textContent || "").trim().slice(0, 50) });
        };
        document.addEventListener("click", onClick, { capture: true });
        return () => document.removeEventListener("click", onClick, { capture: true });
    }, []);

    useEffect(() => {
        let sent = 0;
        const report = (msg: string, where: string, rawSrc = "") => {
            if (sent >= 5 || !msg) return;
            if (IGNORED_ERR_MSG.test(msg) || IGNORED_ERR_SRC.test(where) || IGNORED_ERR_SRC.test(rawSrc)) return;
            sent++;
            track("js_error", { msg: msg.slice(0, 240), where: where.slice(0, 120) });
        };
        const onError = (e: ErrorEvent) => {
            const src = e.filename || "";
            // Ignore cross-origin script errors with no filename/line info
            if (!src && !e.lineno && /^Script error\.?$/i.test(e.message || "")) return;
            report(e.message || String(e.error || ""), `${src.split("/").slice(-1)[0]}:${e.lineno || 0}`, src);
        };
        const onRejection = (e: PromiseRejectionEvent) => {
            const r = e.reason as { message?: string; stack?: string } | string | undefined;
            const msg = typeof r === "string" ? r : r?.message || "Unhandled promise rejection";
            const stack = typeof r === "object" && r?.stack ? r.stack : "";
            report(msg, "promise", stack);
        };
        addEventListener("error", onError);
        addEventListener("unhandledrejection", onRejection);
        return () => { removeEventListener("error", onError); removeEventListener("unhandledrejection", onRejection); };
    }, []);

    return null;
}
