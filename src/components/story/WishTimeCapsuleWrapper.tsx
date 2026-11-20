"use client";

import { useState, useEffect } from "react";
import { WishData } from "@/lib/WishContext";
import { StoryViewerRouter } from "@/components/story/StoryViewerRouter";
import { CountdownOverlay } from "@/components/story/CountdownOverlay";
import { AdminPreviewBanner, type AdminPreviewMeta, type PreviewRole } from "@/components/viewer/V2WishShell";

export function WishTimeCapsuleWrapper({
    wishData,
    adminBypass = false,
    previewRole,
    adminMeta,
}: {
    wishData: WishData;
    adminBypass?: boolean;
    previewRole?: PreviewRole;
    adminMeta?: AdminPreviewMeta;
}) {
    const activeRole: PreviewRole | undefined = previewRole ?? (adminBypass ? "admin" : undefined);
    const canBypassTimeLock = !!activeRole;
    const [visitorLocked, setVisitorLocked] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const isFuture = !!(wishData.unlockDate && new Date(wishData.unlockDate).getTime() > Date.now());
        setVisitorLocked(isFuture);
        setIsLocked(isFuture && !canBypassTimeLock);
    }, [wishData.unlockDate, canBypassTimeLock]);

    return (
        <main className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center relative">
            {activeRole && (
                <AdminPreviewBanner
                    role={activeRole}
                    meta={adminMeta}
                    visitorLocked={visitorLocked}
                    unlockDate={wishData.unlockDate}
                    showingLock={isLocked}
                    onToggleLock={() => setIsLocked((v) => !v)}
                />
            )}
            {isLocked && wishData.unlockDate && (
                <CountdownOverlay
                    unlockDate={wishData.unlockDate}
                    onUnlock={() => {
                        setVisitorLocked(false);
                        setIsLocked(false);
                    }}
                    targetName={wishData.targetName}
                    wishType={wishData.wishType}
                />
            )}

            <div className={`w-full h-full transition-opacity duration-700 ${isLocked ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <StoryViewerRouter data={wishData} />
            </div>
        </main>
    );
}
