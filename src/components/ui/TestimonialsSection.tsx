"use client";

import "./testimonials.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Heart } from "lucide-react";
import { ReviewModal } from "./ReviewModal";
import type { PublicReview, PublicReviewsSummary } from "@/lib/reviews";

const FACE_LABEL: Record<number, { e: string; label: string }> = {
    5: { e: "🥳", label: "Amazing!" },
    4: { e: "😍", label: "Loved it!" },
    3: { e: "🙂", label: "Good" },
    2: { e: "😕", label: "Okay" },
    1: { e: "😢", label: "Needs work" },
};

function formatMonthYear(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function repeatToMin<T>(items: T[], minLen: number): Array<{ item: T; isClone: boolean; key: string }> {
    if (items.length === 0) return [];
    const out: Array<{ item: T; isClone: boolean; key: string }> = [];
    let pass = 0;
    while (out.length < minLen || pass === 0) {
        for (let i = 0; i < items.length; i++) {
            out.push({
                item: items[i],
                isClone: pass > 0,
                key: `${pass}-${i}`,
            });
        }
        pass++;
    }
    return out;
}

export function TestimonialsSection({ initialData }: { initialData?: PublicReviewsSummary }) {
    const [reviews, setReviews] = useState<PublicReview[]>(initialData?.reviews ?? []);
    const [quickRatings, setQuickRatings] = useState<PublicReview[]>(initialData?.quickRatings ?? []);
    const [stats, setStats] = useState<PublicReviewsSummary["stats"]>(
        initialData?.stats ?? { totalCount: 0, averageRating: 0, amazingCount: 0, lovedCount: 0 },
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLatest = useCallback(() => {
        fetch("/api/reviews", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: PublicReviewsSummary | null) => {
                if (!data) return;
                if (Array.isArray(data.reviews)) setReviews(data.reviews);
                if (Array.isArray(data.quickRatings)) setQuickRatings(data.quickRatings);
                if (data.stats && typeof data.stats.totalCount === "number") setStats(data.stats);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetchLatest();
    }, [fetchLatest]);

    const totalCount = stats.totalCount || reviews.length + quickRatings.length;
    const averageRating =
        stats.averageRating > 0
            ? stats.averageRating.toFixed(1)
            : reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : "5.0";

    const amazingCount =
        stats.amazingCount ??
        [...reviews, ...quickRatings].filter((r) => r.rating === 5).length;
    const lovedCount =
        stats.lovedCount ??
        [...reviews, ...quickRatings].filter((r) => r.rating === 4).length;

    const reviewLoop = useMemo(() => repeatToMin(reviews, 6), [reviews]);
    const reactionLoop = useMemo(() => repeatToMin(quickRatings, 8), [quickRatings]);

    const layer1Duration = `${Math.max(30, Math.round(reviewLoop.length * 5.5))}s`;
    const layer2Duration = `${Math.max(26, Math.round(reactionLoop.length * 4.2))}s`;

    const renderReviewCard = (review: PublicReview, hidden: boolean, key: string) => (
        <article
            key={key}
            className="rv-card"
            aria-hidden={hidden ? "true" : undefined}
        >
            <div>
                <div className="rv-card-top">
                    <span className="rv-hearts" aria-label={hidden ? undefined : `Rated ${review.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Heart
                                key={n}
                                style={{
                                    width: 15,
                                    height: 15,
                                    color: n <= review.rating ? "#FF5C8A" : "rgba(120,110,145,0.25)",
                                    fill: n <= review.rating ? "#FF5C8A" : "none",
                                }}
                            />
                        ))}
                    </span>
                    <span className="rv-role-tag">
                        {review.source === "recipient"
                            ? "🎂 Birthday Receiver"
                            : review.source === "creator"
                              ? "🎁 Wish Creator"
                              : "❤️ Verified User"}
                    </span>
                </div>
                <p className="rv-quote" style={{ marginTop: 10 }}>
                    &ldquo;{review.message}&rdquo;
                </p>
            </div>

            <div className="rv-card-foot">
                <div>
                    <span className="rv-author">{review.name}</span>
                    <span className="rv-rel">
                        {" · "}
                        {review.source === "recipient"
                            ? "Received surprise"
                            : `For ${review.relationship}`}
                    </span>
                </div>
                <span className="rv-rel">{formatMonthYear(review.created_at)}</span>
            </div>
        </article>
    );

    const renderReactionChip = (q: PublicReview, hidden: boolean, key: string) => {
        const face = FACE_LABEL[q.rating] || FACE_LABEL[5];
        const whoText =
            q.source === "recipient"
                ? "🎂 Birthday Receiver"
                : `🎁 For ${q.relationship}`;
        return (
            <div
                key={key}
                className="rv-chip"
                aria-hidden={hidden ? "true" : undefined}
            >
                <span className="rv-chip-emoji" aria-hidden="true">
                    {face.e}
                </span>
                <div className="rv-chip-body">
                    <span className="rv-chip-title">{face.label}</span>
                    <span className="rv-chip-score">{q.rating}/5 ❤️</span>
                    <span className="rv-chip-who">
                        {whoText}
                        {q.created_at ? ` · ${formatMonthYear(q.created_at)}` : ""}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bw-container rv-wrap">
                {/* Compact Header + Live Scoreboard + Leave Review CTA */}
                <div className="rv-head">
                    <div className="rv-head-left">
                        <span className="bw-eyebrow">❤️ Real Love &amp; Reactions</span>
                        <h2>What People Are Saying</h2>
                        <p>
                            {totalCount > 0
                                ? `Live feedback from ${totalCount} wish creators & birthday receivers`
                                : "Share how your birthday or anniversary surprise turned out!"}
                        </p>
                    </div>

                    <div className="rv-scorebar">
                        {totalCount > 0 && (
                            <span className="rv-score-pill">
                                <b>{averageRating} / 5</b>
                                <span>❤️ ({totalCount})</span>
                            </span>
                        )}
                        {amazingCount > 0 && (
                            <span className="rv-react-stat" title="5/5 Amazing reactions">
                                <span aria-hidden="true">🥳</span> Amazing ({amazingCount})
                            </span>
                        )}
                        {lovedCount > 0 && (
                            <span className="rv-react-stat" title="4/5 Loved it reactions">
                                <span aria-hidden="true">😍</span> Loved it ({lovedCount})
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bw-btn bw-btn-primary bw-btn-sm"
                        >
                            ❤️ Leave a Review
                        </button>
                    </div>
                </div>

                {/* LAYER 1: Written Reviews (Auto-scrolls Left ->) */}
                {reviewLoop.length > 0 && (
                    <div>
                        <p className="rv-layer-lbl">
                            <span className="dot" aria-hidden="true" />
                            <span>Written Reviews ({reviews.length}) · Hover or touch to pause</span>
                        </p>
                        <div className="rv-marquee" style={{ ["--rv-dur" as string]: layer1Duration }}>
                            <div className="rv-track is-left">
                                <div className="rv-group">
                                    {reviewLoop.map((entry) =>
                                        renderReviewCard(entry.item, entry.isClone, `a-${entry.key}`),
                                    )}
                                </div>
                                <div className="rv-group" aria-hidden="true">
                                    {reviewLoop.map((entry) =>
                                        renderReviewCard(entry.item, true, `b-${entry.key}`),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LAYER 2: Separate Instant Reactions (Auto-scrolls Opposite Direction <-) */}
                {reactionLoop.length > 0 && (
                    <div className="rv-layer2">
                        <p className="rv-layer-lbl">
                            <span className="dot dot-mint" aria-hidden="true" />
                            <span>Instant 1-Tap Reactions ({quickRatings.length}) · Live from Finish &amp; Finale screens</span>
                        </p>
                        <div className="rv-marquee" style={{ ["--rv-dur" as string]: layer2Duration }}>
                            <div className="rv-track is-right">
                                <div className="rv-group">
                                    {reactionLoop.map((entry) =>
                                        renderReactionChip(entry.item, entry.isClone, `ra-${entry.key}`),
                                    )}
                                </div>
                                <div className="rv-group" aria-hidden="true">
                                    {reactionLoop.map((entry) =>
                                        renderReactionChip(entry.item, true, `rb-${entry.key}`),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitted={fetchLatest}
            />
        </>
    );
}
