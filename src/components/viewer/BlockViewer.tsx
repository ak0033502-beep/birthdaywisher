"use client";

import "./viewer.css";
import "./styles.css";
import "./intro.css";
import "./moods.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { WishDataV2 } from "@/lib/wish/schema";
import { getBlock } from "@/blocks/registry";
import { BlockSlide, type SlideCtx } from "@/blocks/slides";
import { getSkin, skinVars } from "./skins";
import { normalizeStyle, styleSkin } from "./styles";
import { SlideFrame, StyleCover, StyleDecor, StyleHeader } from "./StyleChrome";
import { StyleIntro } from "./StyleIntro";
import { track } from "@/lib/track";
import { isMutedPref, setMutedPref } from "@/lib/celebration/sfx";
import { playUi, prefetchUi } from "@/lib/celebration/uiSound";
import { prefetchStyleBgm, startBgm, type BgmController } from "@/lib/celebration/bgm";

/**
 * v2 viewer engine: renders ANY wish as an ordered emotional journey.
 * - Hold-to-open cover ritual -> style-specific opening intro -> living slides -> Grand Finale
 * - Ambient mood music bed (auto-ducks on voice/video, pauses on Finale) + per-style slide SFX
 * - Preloads photos while on cover so slides never flash blank images
 * - Story edge-tap + swipe + keyboard + visible bottom nav buttons
 */
function fastCloudinaryUrl(url: string): string {
    if (!url || !url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
    if (url.includes("/image/upload/f_") || url.includes("/image/upload/q_") || url.includes("/image/upload/w_")) return url;
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1280/");
}

export function BlockViewer({
    wish,
    wishId,
    vaultWishId,
    previewOnly = false,
    adminBypass = false,
}: {
    wish: WishDataV2;
    wishId?: string;
    vaultWishId?: string;
    previewOnly?: boolean;
    adminBypass?: boolean;
}) {
    const i = getTranslations((wish.look.language as Locale) || "en");
    const styleId = normalizeStyle(wish.look.presentationStyle);
    const skin = styleSkin(styleId, getSkin(wish.look.theme), wish.look.theme);

    // Only blocks that actually have content are shown
    const slides = useMemo(
        () => wish.blocks.filter((b) => (getBlock(b.type).isFilled as (c: unknown) => boolean)(b.config)),
        [wish.blocks],
    );

    const [opened, setOpened] = useState(false);
    const [intro, setIntro] = useState(false);
    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState<"next" | "prev">("next");
    const [solved, setSolved] = useState<Set<string>>(() => new Set());
    const [visitedIds, setVisitedIds] = useState<Set<string>>(() => new Set());
    const [finaleCompleted, setFinaleCompleted] = useState(false);
    const [nudge, setNudge] = useState(false);
    const [muted, setMuted] = useState(() => isMutedPref());
    const bgmRef = useRef<BgmController | null>(null);

    const current = slides[idx];
    const isGate = current ? getBlock(current.type).gate : false;
    const locked = !adminBypass && isGate && !solved.has(current.id);

    const markVisited = useCallback((slideId?: string) => {
        if (!slideId) return;
        setVisitedIds((prev) => {
            if (prev.has(slideId)) return prev;
            const next = new Set(prev);
            next.add(slideId);
            return next;
        });
    }, []);

    // Defer background audio & photo preloading until AFTER the cover screen paints LCP
    useEffect(() => {
        let cancelled = false;
        const runPreload = () => {
            if (cancelled) return;
            void prefetchStyleBgm(styleId, wish.look.soundtrack);
            prefetchUi(["page", "msg", "swoosh", "ping"]);
            for (const b of wish.blocks) {
                if (b.type === "photos") {
                    for (const m of b.config.items || []) {
                        if (m.type === "photo" && m.url) {
                            const img = new Image();
                            img.decoding = "async";
                            img.src = fastCloudinaryUrl(m.url);
                        }
                    }
                } else if (b.type === "puzzle" && b.config.imageUrl) {
                    const img = new Image();
                    img.decoding = "async";
                    img.src = fastCloudinaryUrl(b.config.imageUrl);
                }
            }
        };
        const timer = setTimeout(() => {
            const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
            if (typeof ric === "function") ric(runPreload, { timeout: 1500 });
            else runPreload();
        }, 700);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [styleId, wish.blocks, wish.look.soundtrack]);

    // Cleanup BGM on unmount
    useEffect(() => () => { bgmRef.current?.stop(); bgmRef.current = null; }, []);

    // Adjust style soundtrack across slides: soften warmly on heartfelt text slides, fade out on Grand Finale
    useEffect(() => {
        const bgm = bgmRef.current;
        if (!bgm || !current) return;
        bgm.setTrack(styleId, wish.look.soundtrack);
        if (current.type === "finale") bgm.setIntensity(0);
        else if (current.type === "message" || current.type === "memory" || current.type === "gratitude" || current.type === "promise") bgm.setIntensity(0.76);
        else bgm.setIntensity(0.95);
    }, [current, styleId, wish.look.soundtrack]);

    // Anonymous recipient analytics (only for real links, never in previews)
    const slideStart = useRef(Date.now());
    const prevSlide = useRef<{ type: string; idx: number } | null>(null);
    useEffect(() => {
        if (!opened || intro || !wishId || !current) return;
        const prev = prevSlide.current;
        if (prev) track("wish_slide", { block: prev.type, idx: prev.idx, ms: Date.now() - slideStart.current, total: slides.length }, wishId);
        prevSlide.current = { type: current.type, idx };
        slideStart.current = Date.now();
        if (current.type === "finale") track("wish_finale", { style: styleId, total: slides.length }, wishId);
    }, [opened, intro, idx, current, wishId, slides.length, styleId]);

    const celebrate = useCallback(async (n = 80) => {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: n, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true, zIndex: 200 });
    }, []);

    const playSlideSound = useCallback(() => {
        if (styleId === "storybook") playUi("page", { gain: 0.75 });
        else if (styleId === "messenger") playUi("msg", { gain: 0.5 });
        else if (styleId === "terminal") playUi("ping", { gain: 0.3, rate: 1.35 });
        else playUi("swoosh", { gain: 0.45 });
    }, [styleId]);

    const go = useCallback((delta: 1 | -1) => {
        if (delta === 1 && locked) { setNudge(true); setTimeout(() => setNudge(false), 500); return; }
        setIdx((v) => {
            const nv = Math.max(0, Math.min(slides.length - 1, v + delta));
            if (nv !== v) {
                setDir(delta === 1 ? "next" : "prev");
                markVisited(slides[nv]?.id);
                playSlideSound();
            }
            return nv;
        });
    }, [locked, markVisited, playSlideSound, slides]);

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        setMutedPref(next);
        bgmRef.current?.setMuted(next);
    };

    // Keyboard (ignored while typing in an input)
    useEffect(() => {
        if (!opened || intro) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement)?.tagName === "INPUT") return;
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [opened, intro, go]);

    // Horizontal swipe + story left/right edge tap on empty stage area
    const touch = useRef<{ x: number; y: number; interactive: boolean } | null>(null);
    const onPointerDown = (e: React.PointerEvent) => {
        const el = e.target as HTMLElement;
        const tag = el.tagName;
        if (["INPUT", "BUTTON", "A", "AUDIO", "VIDEO", "CANVAS"].includes(tag)) return;
        const interactive = !!el.closest(".bv-card, .bv-photo, .bv-puzzle, .gf, .bvs-react-bar");
        touch.current = { x: e.clientX, y: e.clientY, interactive };
    };
    const onPointerUp = (e: React.PointerEvent) => {
        const t = touch.current; touch.current = null;
        if (!t) return;
        const dx = e.clientX - t.x, dy = e.clientY - t.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            go(dx < 0 ? 1 : -1);
            return;
        }
        // Quick tap on left/right outer 24% of empty stage advances like Instagram Stories
        if (!t.interactive && Math.abs(dx) < 12 && Math.abs(dy) < 12 && current?.type !== "finale") {
            const w = window.innerWidth || 1;
            if (e.clientX < w * 0.24 && idx > 0) go(-1);
            else if (e.clientX > w * 0.76 && idx < slides.length - 1) go(1);
        }
    };

    const style = skinVars(skin) as React.CSSProperties;

    if (!opened) {
        return (
            <StyleCover
                style={styleId}
                wish={wish}
                i={i}
                vars={style}
                wishId={wishId}
                onOpen={() => {
                    setOpened(true);
                    setIntro(true);
                    if (!bgmRef.current) bgmRef.current = startBgm(styleId, false, wish.look.soundtrack);
                    if (wishId) track("wish_open", { style: styleId, theme: wish.look.theme, slides: slides.length, type: wish.wishType }, wishId);
                }}
            />
        );
    }

    const makeSlideCtx = (slide: (typeof slides)[number], isActive: boolean): SlideCtx => {
        const slideIsGate = getBlock(slide.type).gate;
        const slideLocked = !adminBypass && slideIsGate && !solved.has(slide.id);
        return {
            wish,
            i,
            wishId,
            vaultWishId: vaultWishId ?? wishId,
            previewOnly,
            active: isActive,
            finaleCompleted,
            onFinaleComplete: () => setFinaleCompleted(true),
            unlocked: !slideLocked,
            unlock: () => {
                setSolved((prev) => {
                    if (prev.has(slide.id)) return prev;
                    if (wishId) {
                        track(
                            "wish_gate",
                            { block: slide.type, how: Date.now() - slideStart.current > 57000 ? "auto" : "solved" },
                            wishId,
                        );
                    }
                    const next = new Set(prev);
                    next.add(slide.id);
                    return next;
                });
            },
            celebrate,
        };
    };

    const isLast = idx === slides.length - 1;

    return (
        <>
            {intro && (
                <StyleIntro
                    style={styleId}
                    wish={wish}
                    vars={style}
                    onDone={() => {
                        setIntro(false);
                        markVisited(slides[0]?.id);
                        celebrate(120);
                    }}
                />
            )}
            <div className="bv" style={style} data-skin={wish.look.theme} data-style={styleId}>
                <StyleDecor style={styleId} theme={wish.look.theme} />
                <div className="bv-progress" aria-hidden="true">
                    {slides.map((s, n) => <span key={s.id} className={`${n < idx ? "is-done" : ""} ${n === idx ? "is-now" : ""} ${n === idx && locked ? "is-locked" : ""}`}><i /></span>)}
                </div>
                <StyleHeader style={styleId} wish={wish} idx={idx} total={slides.length} type={current?.type} i={i} />

                {current?.type !== "finale" && (
                    <button type="button" className="bv-sound-btn" onClick={toggleMute} aria-label={muted ? "Turn sound on" : "Mute sound"} title={muted ? "Unmute" : "Mute"}>
                        {muted ? "🔇" : "🔊"}
                    </button>
                )}

                <div className="bv-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                    {slides.map((s, n) => {
                        const isActive = n === idx;
                        // Finale portals a full-screen overlay into .bv, so mount it only when active (its completed state is remembered via finaleCompleted)
                        if (s.type === "finale") {
                            if (!isActive) return null;
                            return (
                                <section
                                    key={s.id}
                                    className={`bv-slide enter-${dir}`}
                                    data-section={s.type}
                                    aria-roledescription="slide"
                                    aria-label={`${n + 1} / ${slides.length}`}
                                >
                                    <SlideFrame style={styleId} idx={n} type={s.type}>
                                        <BlockSlide block={s} ctx={makeSlideCtx(s, true)} />
                                    </SlideFrame>
                                </section>
                            );
                        }

                        const shouldMount = isActive || visitedIds.has(s.id);
                        if (!shouldMount) return null;

                        return (
                            <section
                                key={n === 0 && intro ? `${s.id}-pre` : s.id}
                                className={`bv-slide ${isActive ? `enter-${dir}` : ""} ${isActive && nudge ? "bv-shake" : ""}`}
                                style={isActive ? undefined : { display: "none" }}
                                aria-hidden={!isActive}
                                data-section={s.type}
                                aria-roledescription="slide"
                                aria-label={`${n + 1} / ${slides.length}`}
                            >
                                <SlideFrame style={styleId} idx={n} type={s.type}>
                                    <BlockSlide block={s} ctx={makeSlideCtx(s, isActive && !intro)} />
                                </SlideFrame>
                            </section>
                        );
                    })}
                </div>

                <nav className="bv-nav" aria-label="Story navigation">
                    <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous">‹</button>
                    {locked
                        ? <span className="bv-lock-badge">🔒 Solve to continue</span>
                        : styleId === "messenger" && !isLast
                            ? <span className="bvs-chat-hint">Tap ➤ for the next message</span>
                            : idx === 0 && !isLast && <span className="bv-tap-hint">Swipe or tap edges ›</span>}
                    <button type="button" onClick={() => go(1)} disabled={isLast} className={locked ? "is-locked" : ""} aria-label="Next">{styleId === "messenger" ? "➤" : "›"}</button>
                </nav>
            </div>
        </>
    );
}
