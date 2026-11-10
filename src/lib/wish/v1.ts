import type { WishData } from "@/lib/WishContext";

/**
 * Default values of the v1 (flat) wish format.
 * Single source of truth: the wizard's WishContext uses these too.
 * Kept in a React-free module so server code and tests can import it.
 */
export const V1_DEFAULTS: WishData = {
    wishType: "birthday",
    targetName: "",
    targetAge: "",
    targetGender: "",
    anniversaryYear: "",
    coupleName: "",
    relationship: "",
    vibe: "Pure Romance",
    nickname: "",
    mediaUrl: "",
    mediaType: null,
    mediaItems: [],
    memoryTale: "",
    secretDate: "",
    quirks: [],
    roastLevel: 0,
    quizQ1: "",
    quizA1: "",
    quizQ2: "",
    quizA2: "",
    awardTitle: "",
    audioUrl: "",
    gratitudeText: "",
    puzzleImageUrl: "",
    coreMessage: "",
    futurePromise: "",
    timeCapsule: "",
    soundtrack: "lofi",
    theme: "elegant",
    finaleEffect: "confetti",
    presentationStyle: "cinematic",
    unlockDate: "",
    requireSmileToUnlock: false,
    showAsScratchOff: true,
    language: "en",
};
