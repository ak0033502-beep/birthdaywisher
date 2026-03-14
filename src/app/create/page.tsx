"use client";

import { useWishContext } from "@/lib/WishContext";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Steps Imports 
import { Step1Target } from "@/components/wizard/steps/Step1Target";
import { Step2Connection } from "@/components/wizard/steps/Step2Connection";
import { Step3Vibe } from "@/components/wizard/steps/Step3Vibe";
import { Step4Nicknames } from "@/components/wizard/steps/Step4Nicknames";
import { Step5Media } from "@/components/wizard/steps/Step5Media";
import { Step6MemoryTale } from "@/components/wizard/steps/Step6MemoryTale";
import { Step7SecretDate } from "@/components/wizard/steps/Step7SecretDate";
import { Step8Quirks } from "@/components/wizard/steps/Step8Quirks";
import { Step9RoastMeter } from "@/components/wizard/steps/Step9RoastMeter";
import { Step10Quiz } from "@/components/wizard/steps/Step10Quiz";
import { Step11Awards } from "@/components/wizard/steps/Step11Awards";
import { Step12VoiceNote } from "@/components/wizard/steps/Step12VoiceNote";
import { Step13Gratitude } from "@/components/wizard/steps/Step13Gratitude";
import { Step14Puzzle } from "@/components/wizard/steps/Step14Puzzle";
import { Step15CoreMessage } from "@/components/wizard/steps/Step15CoreMessage";
import { Step16FuturePromises } from "@/components/wizard/steps/Step16FuturePromises";
import { Step17InnovativeLocks } from "@/components/wizard/steps/Step17InnovativeLocks";
import { Step19Theme } from "@/components/wizard/steps/Step19Theme";
import { Step20Finale } from "@/components/wizard/steps/Step20Finale";
import { StepCustomLink } from "@/components/wizard/steps/StepCustomLink";
import { StepLanguage } from "@/components/wizard/steps/StepLanguage";
import { StepGiftCard } from "@/components/wizard/steps/StepGiftCard";

// Birthday: full 20-step sequence
const birthdaySteps = [
    StepLanguage, Step1Target, Step2Connection, Step3Vibe, Step4Nicknames, Step5Media,
    Step6MemoryTale, Step7SecretDate, Step8Quirks, Step9RoastMeter, Step10Quiz,
    Step11Awards, Step12VoiceNote, Step13Gratitude, Step14Puzzle, Step15CoreMessage,
    Step16FuturePromises, Step17InnovativeLocks, Step19Theme, Step20Finale,
    StepGiftCard, StepCustomLink,
];

// Anniversary: curated 16-step sequence (removes Roast, Awards, Puzzle, InnovativeLocks)
const anniversarySteps = [
    StepLanguage, Step1Target, Step2Connection, Step3Vibe, Step4Nicknames, Step5Media,
    Step6MemoryTale, Step7SecretDate, Step8Quirks, Step10Quiz, Step12VoiceNote,
    Step13Gratitude, Step15CoreMessage, Step16FuturePromises,
    Step19Theme, Step20Finale, StepGiftCard, StepCustomLink,
];

// Detects ?type=anniversary and sets wishType in context
function AnniversaryDetector() {
    const searchParams = useSearchParams();
    const { updateWishData } = useWishContext();

    useEffect(() => {
        const type = searchParams.get("type");
        if (type === "anniversary") {
            updateWishData({ wishType: "anniversary" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default function CreateWizard() {
    const { currentStep, wishData } = useWishContext();
    const isAnniversary = wishData.wishType === "anniversary";
    const steps = isAnniversary ? anniversarySteps : birthdaySteps;
    const totalSteps = steps.length;
    const StepComponent = steps[currentStep - 1];

    return (
        <>
            <Suspense fallback={null}>
                <AnniversaryDetector />
            </Suspense>
            <WizardLayout totalSteps={totalSteps}>
                {StepComponent ? <StepComponent /> : (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold mb-4">Step {currentStep} 🚧</h2>
                        <p className="text-foreground/60">This step is under construction.</p>
                    </div>
                )}
            </WizardLayout>
        </>
    );
}
