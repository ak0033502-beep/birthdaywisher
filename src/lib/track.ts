"use client";

/**
 * Tiny first-party tracker (no cookies, no third parties).
 * - `sid`: random id in sessionStorage (one tab session), never linked to a person
 * - events are batched and sent with navigator.sendBeacon to /api/t
 * - disabled on localhost (so local testing never pollutes the real stats) unless
 *   localStorage "bw-track-dev" = "1", and for the site owner after admin login ("bw-no-track")
 */
type Props = Record<string, string | number | boolean | undefined>;
type Ev = { name: string; path: string; wishId?: string; props?: Props };

let queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let bound = false;

function enabled(): boolean {
    if (typeof window === "undefined") return false;
    try {
        if (localStorage.getItem("bw-no-track") === "1") return false;
        const local = /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
        if (local && localStorage.getItem("bw-track-dev") !== "1") return false;
    } catch { /* storage blocked: still track anonymously */ }
    return true;
}

function session(): { sid: string; ref: string; utm: string } {
    try {
        let sid = sessionStorage.getItem("bw-sid");
        if (!sid) {
            sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
            sessionStorage.setItem("bw-sid", sid);
            // first referrer + campaign of this session
            const q = new URLSearchParams(location.search);
            sessionStorage.setItem("bw-ref", document.referrer || "");
            sessionStorage.setItem("bw-utm", (q.get("utm_source") || q.get("ref") || "").slice(0, 30));
        }
        return { sid, ref: sessionStorage.getItem("bw-ref") || "", utm: sessionStorage.getItem("bw-utm") || "" };
    } catch {
        return { sid: "nostorage00", ref: document.referrer || "", utm: "" };
    }
}

function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!queue.length) return;
    const batch = queue.splice(0, 25);
    const body = JSON.stringify({ ...session(), events: batch });
    try {
        const ok = navigator.sendBeacon?.("/api/t", new Blob([body], { type: "application/json" }));
        if (!ok) void fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    } catch { /* ignore */ }
    if (queue.length) flush();
}

export function track(name: string, props?: Props, wishId?: string) {
    if (!enabled()) return;
    if (!bound) {
        bound = true;
        addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    }
    const clean: Props | undefined = props ? Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) : undefined;
    queue.push({ name, path: location.pathname, wishId, props: clean });
    if (queue.length >= 10) flush();
    else if (!timer) timer = setTimeout(flush, 2500);
}

/** Opt this browser out (used after admin login so the owner's visits aren't counted). */
export function optOutOfTracking() {
    try { localStorage.setItem("bw-no-track", "1"); } catch { /* ignore */ }
}
