"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Loader2 } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [message, setMessage] = useState("");
    const [relationship, setRelationship] = useState("Friend");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const relationships = ["Friend", "Partner", "Sibling", "Parent", "Colleague", "Other"];

    const handleSubmit = async () => {
        if (!name.trim() || !message.trim() || rating === 0) {
            setError("Please fill in your name, select a rating, and write a message.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), rating, message: message.trim(), relationship }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset after closing animation
        setTimeout(() => {
            setName("");
            setRating(0);
            setMessage("");
            setRelationship("Friend");
            setSubmitted(false);
            setError("");
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-panel rounded-3xl p-6 sm:p-8 w-full max-w-md border border-white/10 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-foreground/50" />
                        </button>

                        {submitted ? (
                            // Success State
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-10 h-10 text-green-500 fill-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Thank You! 💖</h3>
                                <p className="text-foreground/60 mb-6">Your review has been submitted. It means the world to us!</p>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
                                >
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            // Form State
                            <>
                                <h3 className="text-2xl font-bold mb-2">Leave a Review ⭐</h3>
                                <p className="text-foreground/50 text-sm mb-6">Tell us about your experience creating a wish!</p>

                                {/* Star Rating */}
                                <div className="mb-5">
                                    <label className="text-sm font-medium text-foreground/70 mb-2 block">Your Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-foreground/20"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-foreground/70 mb-2 block">Your Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Priya S."
                                        maxLength={100}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                {/* Relationship */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-foreground/70 mb-2 block">I created a wish for my...</label>
                                    <div className="flex flex-wrap gap-2">
                                        {relationships.map((rel) => (
                                            <button
                                                key={rel}
                                                onClick={() => setRelationship(rel)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${relationship === rel
                                                        ? "bg-primary text-white"
                                                        : "bg-white/5 text-foreground/60 hover:bg-white/10"
                                                    }`}
                                            >
                                                {rel}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="mb-5">
                                    <label className="text-sm font-medium text-foreground/70 mb-2 block">Your Experience</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us how the birthday wish turned out..."
                                        maxLength={500}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    />
                                    <p className="text-xs text-foreground/30 mt-1">{message.length}/500</p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-red-400 text-sm mb-4">{error}</p>
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> Submit Review
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
