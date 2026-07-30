"use client";

import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations, SiteStrings } from "@/lib/siteTranslations";

// Maps step component name to the translation key
const stepKeyMap: Record<string, keyof SiteStrings> = {
    StepLanguage: "chooseLang",
    Step1Target: "step1Title",
    Step2Connection: "step2Title",
    Step3Vibe: "step3Title",
    Step4Nicknames: "step4Title",
    Step5Media: "step5Title",
    Step6MemoryTale: "step6Title",
    Step7SecretDate: "step7Title",
    Step8Quirks: "step8Title",
    Step9RoastMeter: "step9Title",
    Step10Quiz: "step10Title",
    Step11Awards: "step11Title",
    Step12VoiceNote: "step12Title",
    Step13Gratitude: "step13Title",
    Step14Puzzle: "step14Title",
    Step15CoreMessage: "step15Title",
    Step16FuturePromises: "step16Title",
    Step17InnovativeLocks: "step17Title",
    Step18Soundtrack: "step18Title",
    Step19Theme: "step19Title",
    Step20Finale: "step20Title",
    StepGiftCard: "giftCardTitle",
    StepCustomLink: "customLinkTitle",
};

export function useStepTitle(stepKey: keyof typeof stepKeyMap): string {
    const { lang } = useSiteLanguage();
    const s = getSiteTranslations(lang);
    const translationKey = stepKeyMap[stepKey];
    return translationKey ? s[translationKey] : stepKey;
}

export function useSiteStrings() {
    const { lang } = useSiteLanguage();
    return getSiteTranslations(lang);
}
