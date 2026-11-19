"use client";

import "@/components/viewer/viewer.css";
import "@/components/viewer/styles.css";
import "@/components/viewer/intro.css";
import "@/components/viewer/moods.css";
import { useEffect, useRef, useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { BlockType, WishDataV2 } from "@/lib/wish/schema";
import { BlockSlide, type SlideCtx } from "@/blocks/slides";
import { getSkin, skinVars } from "@/components/viewer/skins";
import { BlockViewer } from "@/components/viewer/BlockViewer";
import { normalizeStyle, styleSkin } from "@/components/viewer/styles";
import { SlideFrame, StyleCover, StyleDecor, StyleHeader } from "@/components/viewer/StyleChrome";

export type PreviewScene = "cover" | "slide" | "finale";

/** Live preview: renders the REAL viewer cover / slide / finale inside a 3D phone frame. */
export function PreviewPhone({
    wish,
    focus,
    tilt = true,
    showScenes = false,
    sceneOverride,
    onSceneChange,
}: {
    wish: WishDataV2;
    focus: BlockType | null;
    tilt?: boolean;
    showScenes?: boolean;
    sceneOverride?: PreviewScene;
    onSceneChange?: (s: PreviewScene) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [localScene, setLocalScene] = useState<PreviewScene>("slide");
    const scene = showScenes ? (sceneOverride ?? localScene) : "slide";
    const setScene = (s: PreviewScene) => {
        setLocalScene(s);
        onSceneChange?.(s);
    };

    const effectiveFocus: BlockType | null = scene === "finale" ? "finale" : focus;
    const block = (effectiveFocus && wish.blocks.find((b) => b.type === effectiveFocus))
        || wish.blocks.find((b) => b.type === "intro")
        || wish.blocks[0];
    const i = getTranslations((wish.look.language as Locale) || "en");
    const ctx: SlideCtx = { wish, i, unlocked: true, unlock: () => {}, celebrate: () => {}, embed: true };

    // Subtle jiggle only when switching scene, slide, style, or theme (never force layout reflow on every keystroke)
    const styleId = normalizeStyle(wish.look.presentationStyle);
    const sig = `${scene}|${effectiveFocus || ""}|${styleId}|${wish.look.theme}`;
    const idx = Math.max(0, block ? wish.blocks.indexOf(block) : 0);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        el.classList.add("jiggle");
        const t = setTimeout(() => el.classList.remove("jiggle"), 420);
        return () => clearTimeout(t);
    }, [sig]);

    // 3D tilt toward the pointer (desktop)
    useEffect(() => {
        if (!tilt || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        let raf = 0;
        const onMove = (e: PointerEvent) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const el = ref.current; if (!el) return;
                const r = el.getBoundingClientRect();
                const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 600));
                const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 600));
                el.style.setProperty("--pry", `${(dx * 16).toFixed(2)}deg`);
                el.style.setProperty("--prx", `${(-dy * 10).toFixed(2)}deg`);
            });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [tilt]);

    const vars = skinVars(styleSkin(styleId, getSkin(wish.look.theme), wish.look.theme)) as React.CSSProperties;

    return (
        <div className="wz2-preview-wrap">
            <div className="wz2-phone" ref={ref} aria-label="Live preview">
                <div className="wz2-screen">
                    {scene === "cover" ? (
                        <StyleCover style={styleId} wish={wish} i={i} vars={vars} onOpen={() => setScene("slide")} embed />
                    ) : (
                        <div className="bv bv-embed" data-style={styleId} data-skin={wish.look.theme} style={vars}>
                            <StyleDecor style={styleId} theme={wish.look.theme} />
                            <StyleHeader style={styleId} wish={wish} idx={idx} total={wish.blocks.length} type={block?.type} i={i} />
                            <div className="bv-stage">
                                {block && (
                                    <section className="bv-slide" key={block.id + styleId + wish.look.theme}>
                                        <SlideFrame style={styleId} idx={idx} type={block.type} embed>
                                            <BlockSlide block={block} ctx={ctx} />
                                        </SlideFrame>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showScenes && (
                <div className="wz2-scenes" role="tablist" aria-label="Preview moment">
                    <button type="button" role="tab" aria-selected={scene === "cover"} className={scene === "cover" ? "is-on" : ""} onClick={() => setScene("cover")}>🎁 Cover</button>
                    <button type="button" role="tab" aria-selected={scene === "slide"} className={scene === "slide" ? "is-on" : ""} onClick={() => setScene("slide")}>🎬 Story</button>
                    <button type="button" role="tab" aria-selected={scene === "finale"} className={scene === "finale" ? "is-on" : ""} onClick={() => setScene("finale")}>🎆 Finale</button>
                </div>
            )}
        </div>
    );
}

/** Full-screen test run of the whole wish exactly as the recipient will see it. */
export function FullPreview({ wish, onClose }: { wish: WishDataV2; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="bv-full" role="dialog" aria-modal="true" aria-label="Full preview">
            <BlockViewer wish={wish} />
            <button type="button" className="bv-full-close" onClick={onClose} aria-label="Close preview">✕</button>
        </div>
    );
}
