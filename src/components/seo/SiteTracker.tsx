"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/track";

// Ignore non-site errors injected by in-app WebViews (Instagram/Facebook Android bridges),
// browser extensions, third-party ad iframes, benign W3C ResizeObserver warnings,
// and normal browser media/permission cancellations.
const IGNORED_ERR_MSG = /Java object is gone|ResizeObserver loop|Script error\.?$|webkit\.messageHandlers|FBNav|Non-Error promise rejection|AbortError|NotAllowedError|The play\(\) request was interrupted|The operation was aborted/i;
const IGNORED_ERR_SRC = /navigation_performance_logger|chrome-extension:|moz-extension:|safari-extension:|googlesyndication|doubleclick|adtrafficquality|googletagmanager/i;
const CHUNK_ERR_RE = /ChunkLoadError|Failed to load chunk|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

export function normalizeWindowErrorMessage(rawMessage?: string, err?: unknown): string {
    let msg = (rawMessage || "").trim();
    // Chrome emits bare "Uncaught " when an empty string/object is thrown
    if (/^Uncaught:?$/i.test(msg)) msg = "";
    if (!msg && err != null) {
        if (typeof err === "string") {
            msg = err.trim();
        } else if (typeof err === "object") {
            const e = err as { name?: unknown; message?: unknown };
            const name = typeof e.name === "string" ? e.name.trim() : "";
            const detail = typeof e.message === "string" ? e.message.trim() : "";
            msg = name && detail ? `${name}: ${detail}` : detail || name;
        }
    }
    if (/^Uncaught:?$/i.test(msg) || msg === "[object Object]" || msg === "[object Event]") return "";
    return msg;
}

function tryRecoverChunkError(msg: string, rawSrc = ""): boolean {
    if (typeof window === "undefined") return false;
    const isChunkFail = CHUNK_ERR_RE.test(msg) || (/\/_next\/static\/.*chunks\//i.test(rawSrc) && /load|chunk|script/i.test(msg));
    if (!isChunkFail) return false;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
    try {
        const key = `bw_chunk_reload:${location.pathname}`;
        const lastReload = Number(sessionStorage.getItem(key) || "0");
        if (Date.now() - lastReload < 60_000) return false;
        sessionStorage.setItem(key, String(Date.now()));
        location.reload();
        return true;
    } catch {
        return false;
    }
}

function shouldSampleVitals(): boolean {
    if (typeof window === "undefined") return false;
    try {
        let flag = sessionStorage.getItem("bw-vitals-s");
        if (!flag) {
            flag = Math.random() < 0.2 ? "1" : "0"; // 20% session sample cuts CWV DB writes by 80%
            sessionStorage.setItem("bw-vitals-s", flag);
        }
        return flag === "1";
    } catch {
        return false;
    }
}

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
        if (location.pathname.startsWith("/admin") || !shouldSampleVitals()) return;
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
            const clean = msg.trim();
            if (sent >= 5 || !clean) return;
            if (tryRecoverChunkError(clean, rawSrc)) return;
            if (IGNORED_ERR_MSG.test(clean) || IGNORED_ERR_SRC.test(where) || IGNORED_ERR_SRC.test(rawSrc)) return;
            sent++;
            track("js_error", { msg: clean.slice(0, 240), where: where.slice(0, 120) });
        };
        const onError = (e: ErrorEvent) => {
            const src = e.filename || "";
            // Ignore cross-origin script errors with no filename/line info
            if (!src && !e.lineno && /^Script error\.?$/i.test(e.message || "")) return;
            const msg = normalizeWindowErrorMessage(e.message, e.error);
            if (!msg) return;
            const loc = `${src.split("/").slice(-1)[0]}:${e.lineno || 0}${e.colno ? `:${e.colno}` : ""}`;
            report(msg, loc, src);
        };
        const onRejection = (e: PromiseRejectionEvent) => {
            const r = e.reason as { name?: string; message?: string; stack?: string } | string | undefined;
            if (r == null || r === "") return;
            const msg = typeof r === "string" ? r.trim() : normalizeWindowErrorMessage("", r);
            if (!msg) return;
            const stack = typeof r === "object" && r?.stack ? r.stack : "";
            report(msg, "promise", stack);
        };
        addEventListener("error", onError);
        addEventListener("unhandledrejection", onRejection);
        return () => { removeEventListener("error", onError); removeEventListener("unhandledrejection", onRejection); };
    }, []);

    return null;
}
