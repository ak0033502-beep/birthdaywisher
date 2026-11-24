import { getWishBySlug } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExpiredWishScreen } from "@/components/story/ExpiredWishScreen";

// Private short link: keep it out of search results
export const metadata: Metadata = {
    title: "You've got a surprise! 🎁 | BirthdayWisher.fun",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function CustomSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const result = await getWishBySlug(resolvedParams.slug);

    if (!result) {
        return <ExpiredWishScreen wishType="birthday" />;
    }

    // Redirect to the actual wish page
    redirect(`/wish/${result.id}`);
}
