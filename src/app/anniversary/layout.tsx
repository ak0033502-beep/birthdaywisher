import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Wedding Anniversary Wishes for Couple — Create Interactive Anniversary Wish | BirthdayWisher.fun",
    description: "Create a stunning, interactive wedding anniversary wish for any couple. Gamified love story with photos, voice notes, quizzes, and military-grade privacy. The perfect anniversary wishes for couple — 100% free.",
    keywords: "wedding anniversary wishes for couple, anniversary wishes for couple, create anniversary wish, interactive anniversary card, digital anniversary gift, anniversary surprise online, wedding anniversary greetings",
};

export default function AnniversaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
