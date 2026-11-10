"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_MODE_KEY } from "./themeScript";

/**
 * Day Party / Night Party theme.
 * mode "auto" follows the visitor's local time: 06:00–18:59 = day, otherwise night.
 * The resolved value lives on <html data-party="day|night"> so CSS can react
 * before React hydrates (see THEME_INIT_SCRIPT in the root layout).
 */
export type PartyMode = "auto" | "day" | "night";
export type PartyResolved = "day" | "night";

export { THEME_MODE_KEY };
const CHANGE_EVENT = "bw-theme-change";

export function resolveParty(mode: PartyMode, now = new Date()): PartyResolved {
    if (mode === "day" || mode === "night") return mode;
    const h = now.getHours();
    return h >= 6 && h < 19 ? "day" : "night";
}

/** `?party=day|night` for design review: local/LAN hosts only, ignored on the live domain. */
function localReviewOverride(): PartyResolved | null {
    if (!/^(localhost|127\.0\.0\.1|192\.168\.)/.test(window.location.hostname)) return null;
    const q = new URLSearchParams(window.location.search).get("party");
    return q === "day" || q === "night" ? q : null;
}

function readMode(): PartyMode {
    try {
        const m = localStorage.getItem(THEME_MODE_KEY);
        return m === "day" || m === "night" ? m : "auto";
    } catch {
        return "auto";
    }
}

export function usePartyTheme() {
    const [mode, setModeState] = useState<PartyMode>("auto");
    const [resolved, setResolved] = useState<PartyResolved>("day");

    const apply = useCallback((m: PartyMode) => {
        const r = localReviewOverride() ?? resolveParty(m);
        document.documentElement.setAttribute("data-party", r);
        setResolved(r);
    }, []);

    useEffect(() => {
        const m = readMode();
        setModeState(m);
        apply(m);

        // Other toggles on the page (or other tabs) changed the mode
        const onChange = () => { const nm = readMode(); setModeState(nm); apply(nm); };
        window.addEventListener(CHANGE_EVENT, onChange);
        window.addEventListener("storage", onChange);

        // Live switch at 6:00 / 19:00 while the page is open (CSS fades the colours)
        const iv = window.setInterval(() => { if (readMode() === "auto") apply("auto"); }, 60_000);
        return () => {
            window.removeEventListener(CHANGE_EVENT, onChange);
            window.removeEventListener("storage", onChange);
            window.clearInterval(iv);
        };
    }, [apply]);

    const setMode = useCallback((m: PartyMode) => {
        try { localStorage.setItem(THEME_MODE_KEY, m); } catch { /* storage unavailable */ }
        setModeState(m);
        apply(m);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, [apply]);

    return { mode, resolved, setMode };
}
