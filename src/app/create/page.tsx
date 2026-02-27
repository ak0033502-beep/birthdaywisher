"use client";

import { useWishContext } from "@/lib/WishContext";
import { WizardLayout } from "@/components/wizard/WizardLayout";

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
import { Step17TimeCapsule } from "@/components/wizard/steps/Step17TimeCapsule";
import { Step18Soundtrack } from "@/components/wizard/steps/Step18Soundtrack";
import { Step19Theme } from "@/components/wizard/steps/Step19Theme";
import { Step20Finale } from "@/components/wizard/steps/Step20Finale";

export default function CreateWizard() {
    const { currentStep } = useWishContext();

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1Target />;
            case 2: return <Step2Connection />;
            case 3: return <Step3Vibe />;
            case 4: return <Step4Nicknames />;
            case 5: return <Step5Media />;
            case 6: return <Step6MemoryTale />;
            case 7: return <Step7SecretDate />;
            case 8: return <Step8Quirks />;
            case 9: return <Step9RoastMeter />;
            case 10: return <Step10Quiz />;
            case 11: return <Step11Awards />;
            case 12: return <Step12VoiceNote />;
            case 13: return <Step13Gratitude />;
            case 14: return <Step14Puzzle />;
            case 15: return <Step15CoreMessage />;
            case 16: return <Step16FuturePromises />;
            case 17: return <Step17TimeCapsule />;
            case 18: return <Step18Soundtrack />;
            case 19: return <Step19Theme />;
            case 20: return <Step20Finale />;
            default:
                return (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold mb-4">Step {currentStep} 🚧</h2>
                        <p className="text-foreground/60">This step is under construction.</p>
                    </div>
                );
        }
    };

    return <WizardLayout>{renderStep()}</WizardLayout>;
}
