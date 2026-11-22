import type { Metadata } from "next";
import { WishProvider } from "@/lib/WishContext";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";

export const metadata: Metadata = {
    title: "Create a Birthday Wishes Game Link – Free | BirthdayWisher",
    description: "Build an interactive birthday or anniversary surprise with photos, games, quiz, voice note & fireworks. 100% free, no login, instant WhatsApp link.",
    alternates: { canonical: "/create" },
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WishProvider>
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        name: "BirthdayWisher.fun Interactive Surprise Creator",
                        url: absUrl("/create"),
                        applicationCategory: "EntertainmentApplication",
                        operatingSystem: "Any (Mobile & Desktop Web Browser)",
                        isAccessibleForFree: true,
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                        },
                        featureList: [
                            "12 playable birthday & anniversary mini-games",
                            "Blow out virtual cake candles via phone microphone",
                            "Long-distance two-thumb Heartbeat Sync",
                            "Sky Lanterns, Love-Note Balloons & Personal Relationship Quiz",
                            "Photo gallery, sliding picture puzzle & built-in voice recorder",
                            "6 presentation styles (Cinematic, Scrapbook, Storybook, Secret Chat, Gallery, Terminal)",
                            "Midnight 12:00 AM Time-Capsule Lock",
                            "Private noindex WhatsApp link with 10-hour auto-delete privacy",
                        ],
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        name: "How to Create an Interactive Birthday Surprise Link Online",
                        totalTime: "PT3M",
                        step: [
                            {
                                "@type": "HowToStep",
                                position: 1,
                                name: "Enter Recipient & Choose a Vibe",
                                text: "Type their name, pick your relationship (partner, best friend, family, coworker), and choose a presentation style.",
                            },
                            {
                                "@type": "HowToStep",
                                position: 2,
                                name: "Add Photos, Voice Note & Mini-Games",
                                text: "Upload personal photos, record a voice message, and select up to 4 playable mini-games such as Blow the Candles, Heartbeat Sync, or Personal Quiz.",
                            },
                            {
                                "@type": "HowToStep",
                                position: 3,
                                name: "Customize Link & Optional Midnight Lock",
                                text: "Pick a custom /w/name URL or schedule a midnight 12:00 AM time-capsule lock.",
                            },
                            {
                                "@type": "HowToStep",
                                position: 4,
                                name: "Share Privately on WhatsApp or Instagram",
                                text: "Copy your private link and send it on WhatsApp, Instagram DM, or SMS — zero login or app install needed.",
                            },
                        ],
                    },
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Create Birthday Surprise", path: "/create" },
                    ]),
                ]}
            />
            {children}
        </WishProvider>
    );
}
