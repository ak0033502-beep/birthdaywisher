import { V1_DEFAULTS } from "./v1";
import type { WishData } from "@/lib/WishContext";

/**
 * Sample v1 wishes for local design review of the v2 viewer (/dev/viewer-v2).
 * Uses only images that exist in this repo, so it works offline and with the site's CSP.
 */
export const DEMO_BIRTHDAY: WishData = {
    ...V1_DEFAULTS,
    wishType: "birthday",
    targetName: "Rahul", targetAge: "25", relationship: "best friend", vibe: "Funny", nickname: "Potato",
    mediaItems: [{ url: "/opengraph-image.png", type: "photo" }, { url: "/logo.png", type: "photo" }],
    memoryTale: "Remember when we got lost in Goa at 3 AM looking for momos and ended up watching the sunrise?",
    secretDate: "2019-07-14",
    quirks: ["Always 30 mins late", "Steals my hoodies", "Makes the best maggi", "That laugh"],
    roastLevel: 72,
    quizQ1: "Where did we first meet?", quizA1: "college",
    quizQ2: "My comfort food?", quizA2: "maggi",
    awardTitle: "Best Human of 2026",
    gratitudeText: "you always pick up my 2 AM calls",
    puzzleImageUrl: "/logo.png",
    coreMessage: "Happy birthday, Potato! Another year of you being the most annoying and the most amazing person I know. Never change. 🎂",
    futurePromise: "Pizza is on me this weekend 🍕",
    showAsScratchOff: true,
    requireSmileToUnlock: false,
    theme: "neon",
    presentationStyle: "cinematic",
    language: "en",
};

export const DEMO_ANNIVERSARY: WishData = {
    ...V1_DEFAULTS,
    wishType: "anniversary",
    targetName: "Riya & Aman", coupleName: "Riya & Aman", anniversaryYear: "5", relationship: "couple",
    memoryTale: "Our first date when you spilled coffee everywhere and laughed it off.",
    quizQ1: "Where did we go on our honeymoon?", quizA1: "manali",
    coreMessage: "Five years of choosing each other, every single day. Happy anniversary! 💍",
    futurePromise: "A trip to the mountains, just us two",
    showAsScratchOff: false,
    theme: "rosegold-elegance",
    language: "en",
};
