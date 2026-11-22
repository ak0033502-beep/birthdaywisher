import { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";

export const metadata: Metadata = {
    alternates: { canonical: "/anniversary" },
    title: "Wedding Anniversary Wishes & Surprise Maker | BirthdayWisher",
    description: "Create an interactive wedding anniversary surprise for any couple with photos, voice notes, timeline games & fireworks. Private, no login, 100% free.",
    keywords: "wedding anniversary wishes for couple, anniversary wishes for couple, create anniversary wish, interactive anniversary card, digital anniversary gift, anniversary surprise online, wedding anniversary greetings",
};

export default function AnniversaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        name: "BirthdayWisher.fun Wedding Anniversary Surprise Maker",
                        url: absUrl("/anniversary"),
                        applicationCategory: "EntertainmentApplication",
                        operatingSystem: "Any (Mobile & Desktop Web Browser)",
                        isAccessibleForFree: true,
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                        },
                        featureList: [
                            "Interactive wedding anniversary story for couples, wife, husband & parents",
                            "Couple trivia quiz, Guess the Year photo timeline & Heartbeat Sync",
                            "Wedding photo memories, recorded voice note & Future Promise ticket",
                            "Midnight anniversary countdown lock & 10-hour auto-delete privacy",
                        ],
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        name: "How to Create an Interactive Wedding Anniversary Surprise Link",
                        totalTime: "PT3M",
                        step: [
                            {
                                "@type": "HowToStep",
                                position: 1,
                                name: "Personalize Your Love Story",
                                text: "Open the Anniversary Creator, enter your partner's or couple's names, upload favourite photos, and record a voice note.",
                            },
                            {
                                "@type": "HowToStep",
                                position: 2,
                                name: "Add Couple Games & Aesthetics",
                                text: "Choose romantic themes, gentle music, couple quiz questions, or Heartbeat Sync.",
                            },
                            {
                                "@type": "HowToStep",
                                position: 3,
                                name: "Send Your Private Anniversary Link",
                                text: "Copy the generated private URL and share it on WhatsApp or Instagram with zero login required.",
                            },
                        ],
                    },
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Wedding Anniversary Surprise Maker", path: "/anniversary" },
                    ]),
                ]}
            />
            {children}
        </>
    );
}
