"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface WishData {
    // Wish Type
    wishType: "birthday" | "anniversary";
    // Step 1: Target
    targetName: string;
    targetAge: string;
    targetGender: string;
    // Anniversary-specific
    anniversaryYear: string;
    coupleName: string;
    // Step 2: Connection
    relationship: string;
    // Step 3: Vibe
    vibe: string;
    // Step 4: Nicknames
    nickname: string;
    // Step 5: Media
    mediaUrl?: string; // Legacy
    mediaType?: "photo" | "video" | null; // Legacy
    mediaItems: Array<{ url: string; type: "photo" | "video" }>;
    // Step 6: Remember When
    memoryTale: string;
    // Step 7: Secret Date
    secretDate: string;
    // Step 8: Quirks
    quirks: string[];
    // Step 9: Roast vs Toast
    roastLevel: number; // 0 to 100
    // Step 10: Quiz
    quizQ1: string;
    quizA1: string;
    quizQ2: string;
    quizA2: string;
    // Step 11: Awards
    awardTitle: string;
    // Step 12: Voice Note
    audioUrl: string;
    // Step 13: Gratitude
    gratitudeText: string;
    // Step 14: Puzzle Image
    puzzleImageUrl: string;
    // Step 15: Heart-To-Heart
    coreMessage: string;
    // Step 16: Future Promises
    futurePromise: string;
    // Step 17: Time Capsule
    timeCapsule: string;
    // Step 18: Soundtrack
    soundtrack: string;
    // Step 19: Aesthetics
    theme: string;
    // Step 20: Finale Layer
    finaleEffect: string;
    // Step 21: Presentation Experience 
    presentationStyle: string;

    // --- NEW INTERACTIVE VIRAL LOCKS ---
    // Step 19b: Innovative Locks
    unlockDate: string; // ISO String or empty
    requireSmileToUnlock: boolean;
    showAsScratchOff: boolean;

    // Custom short link
    customSlug?: string;

    // Language
    language: string;

    // Gift Card
    giftCardType?: string; // amazon | flipkart | dineout | custom
    giftCardUrl?: string;  // Cloudinary PDF URL
    giftCardMessage?: string;
}

const defaultWishData: WishData = {
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

const STORAGE_KEY = "birthdaywisher_wizard_progress";

function loadSavedProgress(): { wishData: WishData; currentStep: number } | null {
    if (typeof window === "undefined") return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.wishData && parsed.currentStep) {
                return parsed;
            }
        }
    } catch {
        // Corrupted data — ignore
    }
    return null;
}

function saveProgress(wishData: WishData, currentStep: number) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ wishData, currentStep }));
    } catch {
        // Storage full or unavailable — ignore
    }
}

export function clearWizardProgress() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore
    }
}

interface WishContextProps {
    wishData: WishData;
    updateWishData: (data: Partial<WishData>) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const WishContext = createContext<WishContextProps | undefined>(undefined);

export function WishProvider({ children }: { children: ReactNode }) {
    const [wishData, setWishData] = useState<WishData>(defaultWishData);
    const [currentStep, setCurrentStep] = useState(1);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Restore progress from localStorage on mount
    useEffect(() => {
        const saved = loadSavedProgress();
        if (saved) {
            setWishData(saved.wishData);
            setCurrentStep(saved.currentStep);
        }
        setHasLoaded(true);
    }, []);

    // Save progress to localStorage on every change (after initial load)
    useEffect(() => {
        if (hasLoaded) {
            saveProgress(wishData, currentStep);
        }
    }, [wishData, currentStep, hasLoaded]);

    const updateWishData = useCallback((data: Partial<WishData>) => {
        setWishData((prev) => {
            const updated = { ...prev, ...data };

            // Auto-set unlockDate when secretDate is set
            // Lock the wish until midnight (00:00) on the birthday/anniversary date
            if (data.secretDate && data.secretDate !== prev.secretDate) {
                const date = new Date(data.secretDate);
                if (!isNaN(date.getTime())) {
                    // Set to midnight (start of the day) in the user's local timezone
                    date.setHours(0, 0, 0, 0);
                    updated.unlockDate = date.toISOString();
                }
            }

            return updated;
        });
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep((prev) => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    return (
        <WishContext.Provider
            value={{
                wishData,
                updateWishData,
                currentStep,
                setCurrentStep,
                nextStep,
                prevStep,
            }}
        >
            {children}
        </WishContext.Provider>
    );
}

export function useWishContext() {
    const context = useContext(WishContext);
    if (context === undefined) {
        throw new Error("useWishContext must be used within a WishProvider");
    }
    return context;
}
