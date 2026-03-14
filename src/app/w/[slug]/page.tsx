import { getWishBySlug } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export default async function CustomSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const result = await getWishBySlug(resolvedParams.slug);

    if (!result) {
        notFound();
    }

    // Redirect to the actual wish page
    redirect(`/wish/${result.id}`);
}
