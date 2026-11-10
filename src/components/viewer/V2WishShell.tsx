"use client";

import { useEffect, useState } from "react";
import type { WishDataV2 } from "@/lib/wish/schema";
import { CountdownOverlay } from "@/components/story/CountdownOverlay";
import { BlockViewer } from "./BlockViewer";

/** v2 equivalent of WishTimeCapsuleWrapper: keeps the wish locked until unlock.date, then shows the block viewer. */
export function V2WishShell({ wish, wishId }: { wish: WishDataV2; wishId?: string }) {
    const [locked, setLocked] = useState(false);
    useEffect(() => {
        if (wish.unlock.date && new Date(wish.unlock.date).getTime() > Date.now()) setLocked(true);
    }, [wish.unlock.date]);

    return (
        <main style={{ height: "100svh", width: "100vw", overflow: "hidden", background: "#000", position: "relative" }}>
            {locked && (
                <CountdownOverlay unlockDate={wish.unlock.date} onUnlock={() => setLocked(false)} targetName={wish.recipient.name} wishType={wish.wishType} />
            )}
            <div style={{ width: "100%", height: "100%", transition: "opacity 1s", opacity: locked ? 0 : 1, pointerEvents: locked ? "none" : "auto" }}>
                <BlockViewer wish={wish} wishId={wishId} />
            </div>
        </main>
    );
}
