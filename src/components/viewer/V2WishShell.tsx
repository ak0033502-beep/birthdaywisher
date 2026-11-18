"use client";

import { useEffect, useState } from "react";
import type { WishDataV2 } from "@/lib/wish/schema";
import { CountdownOverlay } from "@/components/story/CountdownOverlay";
import { BlockViewer } from "./BlockViewer";

export interface AdminPreviewMeta {
    openedAt: string | null;
    viewCount: number;
}

export function AdminPreviewBanner({
    meta,
    visitorLocked,
    unlockDate,
    showingLock,
    onToggleLock,
}: {
    meta?: AdminPreviewMeta;
    visitorLocked: boolean;
    unlockDate?: string;
    showingLock: boolean;
    onToggleLock: () => void;
}) {
    const [hidden, setHidden] = useState(false);
    if (hidden) return null;
    const lockTime = unlockDate ? new Date(unlockDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
    return (
        <div
            style={{
                position: "fixed",
                top: 42,
                right: 14,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                maxWidth: "calc(100vw - 28px)",
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(17, 14, 28, 0.88)",
                border: "1px solid rgba(255, 92, 138, 0.45)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                backdropFilter: "blur(8px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            }}
        >
            <span>🛡️ Admin Read-Only</span>
            <span style={{ opacity: 0.75 }}>
                · {meta?.openedAt ? `Opened (${meta.viewCount} views)` : "Unopened (timer NOT started)"}
            </span>
            {visitorLocked && (
                <>
                    <span style={{ color: "#fbbf24" }}>· ⏳ Locked for visitors until {lockTime}</span>
                    <button
                        type="button"
                        onClick={onToggleLock}
                        style={{
                            padding: "3px 9px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.12)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        {showingLock ? "Bypass Lock" : "Preview Lock"}
                    </button>
                </>
            )}
            <button
                type="button"
                onClick={() => setHidden(true)}
                aria-label="Hide admin badge"
                style={{
                    padding: "1px 6px",
                    border: 0,
                    background: "transparent",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                }}
            >
                ×
            </button>
        </div>
    );
}

/** v2 equivalent of WishTimeCapsuleWrapper: keeps the wish locked until unlock.date (unless adminBypass), then shows the block viewer. */
export function V2WishShell({
    wish,
    wishId,
    adminBypass = false,
    adminMeta,
}: {
    wish: WishDataV2;
    wishId?: string;
    adminBypass?: boolean;
    adminMeta?: AdminPreviewMeta;
}) {
    const [visitorLocked, setVisitorLocked] = useState(false);
    const [showLockOverlay, setShowLockOverlay] = useState(false);

    useEffect(() => {
        const isFuture = !!(wish.unlock.date && new Date(wish.unlock.date).getTime() > Date.now());
        setVisitorLocked(isFuture);
        setShowLockOverlay(isFuture && !adminBypass);
    }, [wish.unlock.date, adminBypass]);

    return (
        <main style={{ height: "100svh", width: "100vw", overflow: "hidden", background: "#000", position: "relative" }}>
            {adminBypass && (
                <AdminPreviewBanner
                    meta={adminMeta}
                    visitorLocked={visitorLocked}
                    unlockDate={wish.unlock.date}
                    showingLock={showLockOverlay}
                    onToggleLock={() => setShowLockOverlay((v) => !v)}
                />
            )}
            {showLockOverlay && (
                <CountdownOverlay
                    unlockDate={wish.unlock.date}
                    onUnlock={() => {
                        setVisitorLocked(false);
                        setShowLockOverlay(false);
                    }}
                    targetName={wish.recipient.name}
                    wishType={wish.wishType}
                />
            )}
            <div style={{ width: "100%", height: "100%", transition: "opacity 0.6s", opacity: showLockOverlay ? 0 : 1, pointerEvents: showLockOverlay ? "none" : "auto" }}>
                <BlockViewer wish={wish} wishId={wishId} adminBypass={adminBypass} />
            </div>
        </main>
    );
}
