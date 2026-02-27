"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface WishData {
    // Step 1: Target
    targetName: string;
    targetAge: string;
    targetGender: string;
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
}

const defaultWishData: WishData = {
    targetName: "",
    targetAge: "",
    targetGender: "",
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
    showAsScratchOff: true, // Defaulting scratch-off as a cool viral feature
};

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

    const updateWishData = (data: Partial<WishData>) => {
        setWishData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, 20));
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

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
