"use client";

import "@/components/viewer/viewer.css";
import "@/components/viewer/styles.css";
import { useEffect, useRef } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { BlockType, WishDataV2 } from "@/lib/wish/schema";
import { BlockSlide, type SlideCtx } from "@/blocks/slides";
import { getSkin, skinVars } from "@/components/viewer/skins";
import { BlockViewer } from "@/components/viewer/BlockViewer";
import { normalizeStyle, styleSkin } from "@/components/viewer/styles";
import { SlideFrame, StyleDecor, StyleHeader } from "@/components/viewer/StyleChrome";

/** Live preview: renders the REAL viewer slide for the block being edited, inside a phone frame. */
export function PreviewPhone({ wish, focus, tilt = true }: { wish: WishDataV2; focus: BlockType | null; tilt?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const block = (focus && wish.blocks.find((b) => b.type === focus)) || wish.blocks.find((b) => b.type === "intro") || wish.blocks[0];
    const i = getTranslations((wish.look.language as Locale) || "en");
    const ctx: SlideCtx = { wish, i, unlocked: true, unlock: () => {}, celebrate: () => {} };

    // little jiggle whenever the previewed content changes
    const sig = JSON.stringify(block?.config ?? null) + wish.look.theme + wish.look.presentationStyle + wish.recipient.name;
    const styleId = normalizeStyle(wish.look.presentationStyle);
    const idx = Math.max(0, block ? wish.blocks.indexOf(block) : 0);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        el.classList.remove("jiggle"); void el.offsetWidth; el.classList.add("jiggle");
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

    return (
        <div className="wz2-phone" ref={ref} aria-label="Live preview">
            <div className="wz2-screen">
                <div className="bv bv-embed" data-style={styleId} style={skinVars(styleSkin(styleId, getSkin(wish.look.theme))) as React.CSSProperties}>
                    <StyleDecor style={styleId} />
                    <StyleHeader style={styleId} wish={wish} idx={idx} total={wish.blocks.length} type={block?.type} i={i} />
                    <div className="bv-stage">
                        {block && (
                            <section className="bv-slide" key={block.id + styleId}>
                                <SlideFrame style={styleId} idx={idx} type={block.type} embed>
                                    <BlockSlide block={block} ctx={ctx} />
                                </SlideFrame>
                            </section>
                        )}
                    </div>
                </div>
            </div>
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
