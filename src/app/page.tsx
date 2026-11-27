import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import { getPublicReviews } from "@/lib/reviews";

// Revalidate SSR reviews & AggregateRating JSON-LD hourly (and immediately via revalidatePath on POST /api/reviews)
// Keeping this at 1h lets Neon serverless Postgres scale-to-zero cleanly during quiet periods.
export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Birthday Wishes Game – Free Interactive Birthday Surprise Link",
    description:
        "Free interactive wish maker & birthday wishes game link! Add 12 mini-games, photos, quiz & voice notes. Share on WhatsApp with no login — anniversaries too.",
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
