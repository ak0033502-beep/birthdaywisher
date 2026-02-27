import { StoryViewerRouter } from "@/components/story/StoryViewerRouter";
import { WishTimeCapsuleWrapper } from "@/components/story/WishTimeCapsuleWrapper";
import { getWish } from "@/lib/db";

export default async function WishPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const wishData = await getWish(resolvedParams.id);

    if (!wishData) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Wish Not Found</h1>
                    <p className="text-foreground/60 max-w-md">
                        This wish link is either invalid or has self-destructed for privacy reasons.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <WishTimeCapsuleWrapper wishData={wishData} />
    );
}
