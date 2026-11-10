"use client";

import { useEffect, useRef, useState } from "react";
import { Balloons, GiftCube } from "@/components/party/Decor";
import { burst, lowerTier, type Tier } from "@/components/party/interactions";

type SceneApi = { dispose: () => void };

/**
 * Hero visual:
 *  - high tier → real WebGL scene (three.js chunk loaded after first paint, when the browser is idle)
 *  - mid/low   → CSS 3D gift + CSS balloons (no WebGL download at all)
 * The hero TEXT is rendered by the parent and never waits for this.
 */
export function Hero3D({ tier, onHint, labels }: {
    tier: Tier | null;
    onHint: (msg: string | null, withCta?: boolean) => void;
    labels: { popMsgs: string[]; giftMsg: string; giftLabel: string };
}) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [has3d, setHas3d] = useState(false);
    const [cssOpen, setCssOpen] = useState(false);
    const pops = useRef(0);
    const labelsRef = useRef(labels);
    labelsRef.current = labels;

    useEffect(() => {
        if (tier !== "high" || !sceneRef.current) return;
        let api: SceneApi | null = null;
        let cancelled = false;

        const load = () => {
            import("./scene3d")
                .then(({ initScene }) => {
                    if (cancelled || !sceneRef.current) return;
                    api = initScene(sceneRef.current, {
                        onPop: (x, y) => {
                            burst(x, y, 60);
                            pops.current++;
                            const m = labelsRef.current.popMsgs;
                            onHint(m[Math.min(pops.current - 1, m.length - 1)]);
                        },
                        onGift: (x, y) => { burst(x, y, 160); onHint(labelsRef.current.giftMsg, true); },
                        onTooSlow: () => { // adaptive fallback to CSS 3D
                            api?.dispose(); api = null; setHas3d(false); lowerTier("mid");
                        },
                    });
                    setHas3d(true);
                })
                .catch(() => { /* WebGL/chunk failed: CSS 3D stays visible */ });
        };

        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
        const start = () => (w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 1500 }) : window.setTimeout(load, 300));
        if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });

        return () => { cancelled = true; window.removeEventListener("load", start); api?.dispose(); };
    }, [tier, onHint]);

    // Tell the parent <header> whether WebGL is active (hides CSS balloons/gift)
    useEffect(() => {
        sceneRef.current?.closest(".bw-hero")?.classList.toggle("has-3d", has3d);
    }, [has3d]);

    return (
        <>
            <Balloons count={7} />
            <div className="bw-scene" ref={sceneRef} aria-hidden="true" />
            <div className="bw-css-gift">
                <GiftCube
                    big
                    pop="🎂"
                    open={cssOpen}
                    label={labels.giftLabel}
                    onClick={(e) => {
                        const next = !cssOpen;
                        setCssOpen(next);
                        if (next) { burst(e.clientX, e.clientY, 140); onHint(labels.giftMsg, true); }
                    }}
                />
            </div>
        </>
    );
}
