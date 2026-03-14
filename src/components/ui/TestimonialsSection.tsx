"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Quote } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface Review {
    id: number;
    name: string;
    rating: number;
    message: string;
    relationship: string;
    created_at: string;
}

export function TestimonialsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => {
                setReviews(data.reviews || []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0";

    // Show empty state with CTA if no reviews yet
    if (isLoading) {
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Star className="w-3.5 h-3.5 fill-yellow-400" /> Real User Reviews
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
                            What People Are Saying
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
                            {reviews.length > 0
                                ? `${reviews.length} creators have shared their experience. Average rating: ${averageRating}/5 ⭐`
                                : "Be the first to share your experience! We'd love to hear how your wish turned out."
                            }
                        </p>
                    </motion.div>
                </div>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {reviews.slice(0, 6).map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-primary/20 transition-colors"
                            >
                                {/* Decorative quote */}
                                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-primary/10 transition-colors" />

                                {/* Stars */}
                                <div className="flex gap-0.5 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= review.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-foreground/15"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Message */}
                                <p className="text-foreground/80 text-sm leading-relaxed mb-4 line-clamp-4">
                                    &ldquo;{review.message}&rdquo;
                                </p>

                                {/* Author */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <div>
                                        <p className="font-bold text-sm text-white">{review.name}</p>
                                        <p className="text-xs text-foreground/40">Created for {review.relationship}</p>
                                    </div>
                                    <div className="text-xs text-foreground/30">
                                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center mb-12">
                        <div className="glass-panel inline-flex flex-col items-center p-8 sm:p-12 rounded-3xl border border-white/10 max-w-md">
                            <MessageSquare className="w-12 h-12 text-foreground/20 mb-4" />
                            <p className="text-foreground/50 text-sm mb-2">No reviews yet</p>
                            <p className="text-foreground/30 text-xs">Be the first to share your experience!</p>
                        </div>
                    </div>
                )}

                {/* CTA: Leave a Review */}
                <div className="text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-foreground font-bold rounded-full hover:bg-white/10 hover:border-primary/30 transition-all inline-flex items-center gap-2"
                    >
                        <Star className="w-5 h-5 text-yellow-400" />
                        Leave a Review
                    </button>
                </div>
            </section>

            <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
