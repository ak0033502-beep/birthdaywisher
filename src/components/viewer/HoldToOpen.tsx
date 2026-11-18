"use client";

/**
 * "Hold to open" ritual for the wish cover: press and hold ~1 s while a ring fills, the gift
 * shakes, wrapping paper rustles and the phone ticks. Releasing early just rewinds.
 * Accessible fallbacks: Enter/Space opens immediately, and a quick double-tap also opens.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/celebration/sfx";
import { playUi, prefetchUi, unlockUi, type Playing } from "@/lib/celebration/uiSound";

export function HoldToOpen({ label, icon, onOpen, onProgress, duration = 1050 }: {
    label: string;
    icon?: string;
    onOpen: () => void;
    onProgress?: (p: number, holding: boolean) => void;
    duration?: number;
}) {
    const [p, setP] = useState(0);
    const [holding, setHolding] = useState(false);
    const [hint, setHint] = useState(false);
    const raf = useRef(0);
    const start = useRef(0);
    const done = useRef(false);
    const rustle = useRef<Playing | null>(null);
    const lastTap = useRef(0);
    const tick = useRef(0);

    useEffect(() => { prefetchUi(["rustle", "rip", "chime", "whoosh"]); }, []);
    useEffect(() => () => { cancelAnimationFrame(raf.current); rustle.current?.stop(60); }, []);
    useEffect(() => { onProgress?.(p, holding); }, [p, holding, onProgress]);

    const finish = useCallback(() => {
        if (done.current) return;
        done.current = true;
        cancelAnimationFrame(raf.current);
        rustle.current?.stop(60);
        playUi("rip", { gain: 0.9 });
        playUi("chime", { gain: 1.4, delay: 120 });
        buzz([30, 40, 70]);
        setP(1);
        setHolding(false);
        onOpen();
    }, [onOpen]);

    const down = (e: React.PointerEvent) => {
        if (done.current) return;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        unlockUi();
        setHolding(true); setHint(false);
        rustle.current = playUi("rustle", { gain: 0.55, loop: true });
        start.current = performance.now() - p * duration;
        tick.current = 0;
        const loop = (now: number) => {
            const v = Math.min(1, (now - start.current) / duration);
            setP(v);
            const step = Math.floor(v * 6);
            if (step > tick.current) { tick.current = step; buzz(8 + step * 3); }
            if (v >= 1) { finish(); return; }
            raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);
    };

    const up = () => {
        if (done.current || !holding) return;
        cancelAnimationFrame(raf.current);
        rustle.current?.stop(150);
        setHolding(false);
        const now = performance.now();
        // a quick double-tap also opens (for people who can't hold)
        if (now - lastTap.current < 450) { finish(); return; }
        lastTap.current = now;
        setHint(true);
        // rewind the ring
        const from = p, t0 = now;
        const back = (t: number) => {
            const k = Math.min(1, (t - t0) / 280);
            setP(from * (1 - k));
            if (k < 1 && !done.current) raf.current = requestAnimationFrame(back);
        };
        raf.current = requestAnimationFrame(back);
    };

    const R = 46, C = 2 * Math.PI * R;
    return (
        <div className="bv-hold">
            <button
                type="button"
                className={`bv-hold-btn ${holding ? "is-holding" : ""}`}
                onPointerDown={down}
                onPointerUp={up}
                onPointerCancel={up}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlockUi(); finish(); } }}
                aria-label={label}
            >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r={R} className="bg" />
                    <circle cx="50" cy="50" r={R} className="fg" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p) }} />
                </svg>
                <span className="ic" aria-hidden="true">{icon || "👆"}</span>
            </button>
            <span className="bv-hold-label">{hint ? "Keep holding… 🎁" : label}</span>
        </div>
    );
}
