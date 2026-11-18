"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Quote } from "lucide-react";
import { ReviewModal } from "./ReviewModal";
import type { PublicReview, PublicReviewsSummary } from "@/lib/reviews";

const FACE_LABEL: Record<number, { e: string; label: string }> = {
    5: { e: "🥳", label: "Amazing!" },
    4: { e: "😍", label: "Loved it" },
    3: { e: "🙂", label: "Good" },
    2: { e: "😕", label: "Okay" },
    1: { e: "😢", label: "Needs work" },
};

function formatMonthYear(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function TestimonialsSection({ initialData }: { initialData?: PublicReviewsSummary }) {
    const [reviews, setReviews] = useState<PublicReview[]>(initialData?.reviews ?? []);
    const [quickRatings, setQuickRatings] = useState<PublicReview[]>(initialData?.quickRatings ?? []);
    const [stats, setStats] = useState<{ totalCount: number; averageRating: number }>(
        initialData?.stats ?? { totalCount: 0, averageRating: 0 }
    );
    const [showAll, setShowAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(!initialData);

    const fetchLatest = useCallback(() => {
        fetch("/api/reviews", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: PublicReviewsSummary | null) => {
                if (!data) return;
                if (Array.isArray(data.reviews)) setReviews(data.reviews);
                if (Array.isArray(data.quickRatings)) setQuickRatings(data.quickRatings);
                if (data.stats && typeof data.stats.totalCount === "number") setStats(data.stats);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        // If server didn't pass initialData, fetch on mount; if it did, silently refresh in background
        fetchLatest();
    }, [fetchLatest]);

    const totalCount = stats.totalCount || reviews.length + quickRatings.length;
    const averageRating =
        stats.averageRating > 0
            ? stats.averageRating.toFixed(1)
            : reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : "0";

    const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

    if (isLoading && reviews.length === 0 && quickRatings.length === 0) {
        return (
            <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse mx-auto" />
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
                <div className="text-center mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Heart className="w-3.5 h-3.5 fill-pink-400" /> Verified Creator &amp; Recipient Reviews
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
                            What People Are Saying
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
                            {totalCount > 0
                                ? `${totalCount} happy creators & birthday stars shared their rating · Average: ${averageRating}/5 ❤️`
                                : "Be the first to share your experience! We'd love to hear how your wish turned out."}
                        </p>
                    </motion.div>
                </div>

                {visibleReviews.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {visibleReviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08 }}
                                    className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-primary/20 transition-colors flex flex-col"
                                >
                                    <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-primary/10 transition-colors" />

                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <div className="flex gap-1" aria-label={`Rated ${review.rating} out of 5`}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <Heart
                                                    key={n}
                                                    className={`w-4 h-4 ${
                                                        n <= review.rating
                                                            ? "text-pink-400 fill-pink-400"
                                                            : "text-foreground/15"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-foreground/60">
                                            {review.source === "recipient"
                                                ? "🎂 Birthday Star"
                                                : review.source === "creator"
                                                  ? "🎁 Wish Creator"
                                                  : "❤️ Verified User"}
                                        </span>
                                    </div>

                                    <p className="text-foreground/85 text-sm leading-relaxed mb-4 line-clamp-4">
                                        &ldquo;{review.message}&rdquo;
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div>
                                            <p className="font-bold text-sm text-white">{review.name}</p>
                                            <p className="text-xs text-foreground/45">
                                                {review.source === "recipient"
                                                    ? "Received a birthday surprise"
                                                    : `Created for ${review.relationship}`}
                                            </p>
                                        </div>
                                        <div className="text-xs text-foreground/35">
                                            {formatMonthYear(review.created_at)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {reviews.length > 6 && !showAll && (
                            <div className="text-center mb-8">
                                <button
                                    type="button"
                                    onClick={() => setShowAll(true)}
                                    className="px-5 py-2 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-foreground/75 hover:bg-white/10 transition-colors"
                                >
                                    Show all {reviews.length} written reviews
                                </button>
                            </div>
                        )}
                    </>
                ) : totalCount === 0 ? (
                    <div className="text-center mb-12">
                        <div className="glass-panel inline-flex flex-col items-center p-8 sm:p-12 rounded-3xl border border-white/10 max-w-md">
                            <MessageSquare className="w-12 h-12 text-foreground/20 mb-4" />
                            <p className="text-foreground/50 text-sm mb-2">No reviews yet</p>
                            <p className="text-foreground/30 text-xs">Be the first to share your experience!</p>
                        </div>
                    </div>
                ) : null}

                {/* Live 1-tap reaction ratings strip (from post-wish & post-finale prompts) */}
                {quickRatings.length > 0 && (
                    <div className="mb-12">
                        <p className="text-center text-xs font-bold uppercase tracking-wider text-foreground/45 mb-3">
                            Recent Instant Reactions
                        </p>
                        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
                            {quickRatings.slice(0, 6).map((q) => {
                                const face = FACE_LABEL[q.rating] || FACE_LABEL[5];
                                const whoText =
                                    q.source === "recipient"
                                        ? "Birthday recipient"
                                        : `Created for ${q.relationship}`;
                                return (
                                    <div
                                        key={q.id}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-foreground/80"
                                    >
                                        <span aria-hidden="true" className="text-base leading-none">
                                            {face.e}
                                        </span>
                                        <span className="font-bold text-white">{face.label}</span>
                                        <span className="text-pink-400 font-bold">{q.rating}/5</span>
                                        <span className="text-foreground/45">· {whoText}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-foreground font-bold rounded-full hover:bg-white/10 hover:border-primary/30 transition-all inline-flex items-center gap-2"
                    >
                        <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                        Leave a Review
                    </button>
                </div>
            </section>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitted={fetchLatest}
            />
        </>
    );
}
