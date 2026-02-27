"use client";

import { useState, useEffect } from "react";
import { WishData } from "@/lib/WishContext";
import { StoryViewerRouter } from "@/components/story/StoryViewerRouter";
import { CountdownOverlay } from "@/components/story/CountdownOverlay";

export function WishTimeCapsuleWrapper({ wishData }: { wishData: WishData }) {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (wishData.unlockDate) {
            const target = new Date(wishData.unlockDate).getTime();
            const now = new Date().getTime();
            if (target > now) {
                setIsLocked(true);
            }
        }
    }, [wishData.unlockDate]);

    return (
        <main className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center relative">
            {isLocked && wishData.unlockDate && (
                <CountdownOverlay
                    unlockDate={wishData.unlockDate}
                    onUnlock={() => setIsLocked(false)}
                />
            )}

            {/* The main story viewer is always mounted behind the lock, 
                or rendered freely if not locked */}
            <div className={`w-full h-full transition-opacity duration-1000 ${isLocked ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <StoryViewerRouter data={wishData} />
            </div>
        </main>
    );
}
