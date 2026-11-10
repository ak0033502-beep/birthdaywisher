import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";

// Server wrapper so the homepage can have its own metadata + canonical
// (the page UI itself is a client component because of the language switcher).
export const metadata: Metadata = {
    title: "Birthday Wishes Game – Free Interactive Birthday Surprise Link",
    description:
        "Create a free birthday wishes game link with photos, quizzes, voice notes and surprises. Share it on WhatsApp, no login needed. Anniversary wishes for couples too.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "Birthday Wishes Game – Free Interactive Birthday Surprise",
        description: "Turn your birthday wish into a game: photos, quizzes, voice notes and confetti in one link.",
        url: "/",
        type: "website",
    },
};

export default function HomePage() {
    return <HomeClient />;
}
