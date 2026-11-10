"use client";

import "./viewer.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { WishDataV2 } from "@/lib/wish/schema";
import { getBlock } from "@/blocks/registry";
import { BlockSlide, type SlideCtx } from "@/blocks/slides";
import { getSkin, skinVars } from "./skins";

/**
 * v2 viewer engine (Phase 3): renders ANY wish as an ordered list of blocks.
 * - one engine for all blocks; colours/typography come from skins
 * - gate blocks (secret date, puzzle, quiz) must be solved or auto-skip after 60 s
 * - visible Back/Next buttons + keyboard + swipe (no invisible tap zones)
 */
export function BlockViewer({ wish, wishId }: { wish: WishDataV2; wishId?: string }) {
    const i = getTranslations((wish.look.language as Locale) || "en");
    const skin = getSkin(wish.look.theme);

    // Only blocks that actually have content are shown
    const slides = useMemo(
        () => wish.blocks.filter((b) => (getBlock(b.type).isFilled as (c: unknown) => boolean)(b.config)),
        [wish.blocks],
    );

    const [opened, setOpened] = useState(false);
    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState<"next" | "prev">("next");
    const [solved, setSolved] = useState<Set<string>>(() => new Set());
    const [nudge, setNudge] = useState(false);

    const current = slides[idx];
    const isGate = current ? getBlock(current.type).gate : false;
    const locked = isGate && !solved.has(current.id);

    const celebrate = useCallback(async (n = 80) => {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: n, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true, zIndex: 200 });
    }, []);

    const go = useCallback((delta: 1 | -1) => {
        if (delta === 1 && locked) { setNudge(true); setTimeout(() => setNudge(false), 500); return; }
        setIdx((v) => {
            const nv = Math.max(0, Math.min(slides.length - 1, v + delta));
            if (nv !== v) setDir(delta === 1 ? "next" : "prev");
            return nv;
        });
    }, [locked, slides.length]);

    // Keyboard (ignored while typing in an input)
    useEffect(() => {
        if (!opened) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement)?.tagName === "INPUT") return;
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [opened, go]);

    // Horizontal swipe (vertical scrolling inside a slide still works)
    const touch = useRef<{ x: number; y: number } | null>(null);
    const onPointerDown = (e: React.PointerEvent) => {
        const tag = (e.target as HTMLElement).tagName;
        if (["INPUT", "BUTTON", "A", "AUDIO", "VIDEO", "CANVAS"].includes(tag)) return;
        touch.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: React.PointerEvent) => {
        const t = touch.current; touch.current = null;
        if (!t) return;
        const dx = e.clientX - t.x, dy = e.clientY - t.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    };

    const style = skinVars(skin) as React.CSSProperties;

    if (!opened) {
        return (
            <button type="button" className="bv-envelope" style={style} onClick={() => { setOpened(true); celebrate(120); }} aria-label={i.tapToOpen}>
                <span className="bv-muted" style={{ fontWeight: 800 }}>{i.fromLabel}: {wish.recipient.name}</span>
                <span className="bv-env" aria-hidden="true">💌</span>
                <span className="bv-tap">{i.tapToOpen}</span>
            </button>
        );
    }

    const ctx: SlideCtx = {
        wish, i, wishId,
        unlocked: !locked,
        unlock: () => current && setSolved((s) => new Set(s).add(current.id)),
        celebrate,
    };

    return (
        <div className="bv" style={style} data-skin={wish.look.theme}>
            <div className="bv-progress" aria-hidden="true">
                {slides.map((s, n) => <span key={s.id} className={`${n < idx ? "is-done" : ""} ${n === idx ? "is-now" : ""} ${n === idx && locked ? "is-locked" : ""}`}><i /></span>)}
            </div>
            <div className="bv-to"><span>{i.fromLabel}: {wish.recipient.name}</span><span>{idx + 1}/{slides.length}</span></div>

            <div className="bv-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                {current && (
                    <section key={current.id} className={`bv-slide enter-${dir} ${nudge ? "bv-shake" : ""}`} data-section={current.type} aria-roledescription="slide" aria-label={`${idx + 1} / ${slides.length}`}>
                        <BlockSlide block={current} ctx={ctx} />
                    </section>
                )}
            </div>

            <nav className="bv-nav" aria-label="Story navigation">
                <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous">‹</button>
                {locked && <span className="bv-lock-badge">🔒 Solve to continue</span>}
                <button type="button" onClick={() => go(1)} disabled={idx === slides.length - 1} className={locked ? "is-locked" : ""} aria-label="Next">›</button>
            </nav>
        </div>
    );
}
