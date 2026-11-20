"use client";

import { useRouter } from "next/navigation";
import { CountdownOverlay } from "@/components/story/CountdownOverlay";

/**
 * Server-enforced time-capsule lock screen.
 * Private wish content is NOT sent to the client until unlockDate passes;
 * when the countdown reaches 0, router.refresh() fetches the unlocked wish from the server.
 */
export function LockedWishScreen({
    unlockDate,
    targetName,
    wishType,
}: {
    unlockDate: string;
    targetName: string;
    wishType: "birthday" | "anniversary";
}) {
    const router = useRouter();
    return (
        <main className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center relative">
            <CountdownOverlay
                unlockDate={unlockDate}
                targetName={targetName}
                wishType={wishType}
                onUnlock={() => {
                    router.refresh();
                }}
            />
        </main>
    );
}
