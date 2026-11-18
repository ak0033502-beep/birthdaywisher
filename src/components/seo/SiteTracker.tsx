"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/track";

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
        // each metric instance is reported once (Next may call this again for the same id)
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
        const report = (msg: string, where: string) => {
            if (sent >= 5 || !msg) return;
            sent++;
            track("js_error", { msg: msg.slice(0, 240), where: where.slice(0, 120) });
        };
        const onError = (e: ErrorEvent) => report(e.message || String(e.error), `${(e.filename || "").split("/").slice(-1)[0]}:${e.lineno || 0}`);
        const onRejection = (e: PromiseRejectionEvent) => {
            const r = e.reason as { message?: string } | string | undefined;
            report(typeof r === "string" ? r : r?.message || "Unhandled promise rejection", "promise");
        };
        addEventListener("error", onError);
        addEventListener("unhandledrejection", onRejection);
        return () => { removeEventListener("error", onError); removeEventListener("unhandledrejection", onRejection); };
    }, []);

    return null;
}
