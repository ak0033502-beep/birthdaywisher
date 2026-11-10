"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Device tiers for 3D/motion:
 *  high = WebGL hero scene + CSS 3D
 *  mid  = CSS 3D only (no WebGL download)
 *  low  = static (reduce-motion, Data Saver, 2G, very weak devices)
 */
export type Tier = "high" | "mid" | "low";

export function detectTier(): Tier {
    if (typeof window === "undefined") return "mid";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    const conn = nav.connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || "")) return "low";
    let hasGL = false;
    try {
        const c = document.createElement("canvas");
        const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
        hasGL = !!gl;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { /* no WebGL */ }
    const cores = nav.hardwareConcurrency || 4;
    const mem = nav.deviceMemory || 4; // only Chromium reports this; others assume 4
    if (!hasGL) return cores >= 4 ? "mid" : "low";
    if (cores >= 4 && mem >= 4) return "high";
    if (cores >= 2 && mem >= 2) return "mid";
    return "low";
}

/** Detects the tier once on the client and mirrors it on <html data-tier>. */
export function useTier(): Tier | null {
    const [tier, setTier] = useState<Tier | null>(null);
    useEffect(() => {
        const t = detectTier();
        document.documentElement.setAttribute("data-tier", t);
        setTier(t);
    }, []);
    return tier;
}

export function lowerTier(t: Tier) {
    document.documentElement.setAttribute("data-tier", t);
}

const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Fade/rise elements marked [data-reveal] as they enter the viewport. */
export function useReveal(root: RefObject<HTMLElement | null>, tier: Tier | null) {
    useEffect(() => {
        const el = root.current;
        if (!el || !tier) return;
        const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (tier === "low" || !("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-in")); return; }
        const io = new IntersectionObserver((entries) => entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        }), { threshold: 0.12 });
        items.forEach((i, idx) => { i.style.setProperty("--d", `${(idx % 4) * 0.08}s`); io.observe(i); });
        return () => io.disconnect();
    }, [root, tier]);
}

/** 3D tilt + glare on [.bw-tilt] cards and magnetic [.bw-magnetic] buttons (desktop pointer only). */
export function useTiltAndMagnet(root: RefObject<HTMLElement | null>, tier: Tier | null) {
    useEffect(() => {
        const el = root.current;
        if (!el || !tier || tier === "low" || !finePointer()) return;
        const cleanups: Array<() => void> = [];

        el.querySelectorAll<HTMLElement>(".bw-tilt").forEach((card) => {
            let raf = 0;
            const move = (e: PointerEvent) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    const r = card.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                    card.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
                    card.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
                    card.style.setProperty("--gx", `${px * 100}%`);
                    card.style.setProperty("--gy", `${py * 100}%`);
                    card.classList.add("is-tilting");
                });
            };
            const leave = () => card.classList.remove("is-tilting");
            card.addEventListener("pointermove", move);
            card.addEventListener("pointerleave", leave);
            cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); });
        });

        el.querySelectorAll<HTMLElement>(".bw-magnetic").forEach((b) => {
            const move = (e: PointerEvent) => {
                const r = b.getBoundingClientRect();
                b.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
                b.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.25}px`);
            };
            const leave = () => { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); };
            b.addEventListener("pointermove", move);
            b.addEventListener("pointerleave", leave);
            cleanups.push(() => { b.removeEventListener("pointermove", move); b.removeEventListener("pointerleave", leave); });
        });

        // Balloon layers drift with the pointer (parallax depth)
        let pr = 0;
        const onMove = (e: PointerEvent) => {
            if (pr) return;
            pr = requestAnimationFrame(() => {
                pr = 0;
                el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
                el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
            });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onMove));

        return () => cleanups.forEach((c) => c());
    }, [root, tier]);
}

/** Lightweight confetti burst (canvas-confetti is loaded only when first needed). */
export async function burst(x: number, y: number, particleCount = 80) {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
        particleCount,
        spread: 75,
        startVelocity: 38,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ["#FF5C8A", "#FF9F43", "#FFD93D", "#2ED8B6", "#7C5CFF"],
        disableForReducedMotion: true,
        zIndex: 200,
    });
}
