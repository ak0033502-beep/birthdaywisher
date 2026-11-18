import { Metadata } from "next";

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
    return <>{children}</>;
}
