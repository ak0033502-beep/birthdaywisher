import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import { getPublicReviews } from "@/lib/reviews";

// Revalidate SSR reviews & AggregateRating JSON-LD every 2 minutes (and immediately on POST /api/reviews)
export const revalidate = 120;

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

export default async function HomePage() {
    const initialReviews = await getPublicReviews();
    return <HomeClient initialReviews={initialReviews} />;
}
