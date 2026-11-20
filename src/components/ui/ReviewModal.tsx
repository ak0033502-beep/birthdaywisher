"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send, Loader2 } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitted?: () => void;
}

export function ReviewModal({ isOpen, onClose, onSubmitted }: ReviewModalProps) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [message, setMessage] = useState("");
    const [relationship, setRelationship] = useState("Friend");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const relationships = ["Friend", "Partner", "Sibling", "Parent", "Colleague", "Other"];

    const handleSubmit = async () => {
        if (!name.trim() || !message.trim() || rating === 0) {
            setError("Please fill in your name, select a rating, and write a short message.");
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
                onSubmitted?.();
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
        setTimeout(() => {
            setName("");
            setRating(5);
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
                    className="rv-modal-backdrop"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="rv-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close review dialog"
                            style={{
                                position: "absolute",
                                top: 14,
                                right: 14,
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                border: "1px solid var(--p-line, rgba(0,0,0,0.1))",
                                background: "var(--p-surface2, #fff4ea)",
                                color: "var(--p-muted, #6b6380)",
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <X style={{ width: 17, height: 17 }} />
                        </button>

                        {submitted ? (
                            <div style={{ textAlign: "center", padding: "24px 8px" }}>
                                <div style={{ fontSize: 48, marginBottom: 10 }} aria-hidden="true">🎉</div>
                                <h3>Thank You! ❤️</h3>
                                <p style={{ color: "var(--p-muted)", fontWeight: 600, margin: "8px 0 20px" }}>
                                    Your review is live! Thank you for spreading the joy.
                                </p>
                                <button type="button" onClick={handleClose} className="bw-btn bw-btn-primary bw-btn-sm">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3>Leave a Review ❤️</h3>
                                <p style={{ color: "var(--p-muted)", fontSize: 14, fontWeight: 600, margin: "0 0 18px" }}>
                                    Tell us how your surprise turned out!
                                </p>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                                        Your Rating
                                    </label>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {[1, 2, 3, 4, 5].map((n) => {
                                            const active = n <= (hoveredRating || rating);
                                            return (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setRating(n)}
                                                    onMouseEnter={() => setHoveredRating(n)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    aria-label={`Rate ${n} out of 5`}
                                                    style={{
                                                        padding: 4,
                                                        border: 0,
                                                        background: "transparent",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Heart
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            color: active ? "#FF5C8A" : "rgba(120,110,145,0.28)",
                                                            fill: active ? "#FF5C8A" : "none",
                                                        }}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Priya S."
                                        maxLength={80}
                                        className="rv-modal-field"
                                    />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                                        Created for my…
                                    </label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {relationships.map((rel) => {
                                            const on = relationship === rel;
                                            return (
                                                <button
                                                    key={rel}
                                                    type="button"
                                                    onClick={() => setRelationship(rel)}
                                                    style={{
                                                        padding: "6px 13px",
                                                        borderRadius: 999,
                                                        fontSize: 12.5,
                                                        fontWeight: 800,
                                                        border: on ? "0" : "1.5px solid var(--p-line)",
                                                        background: on ? "var(--p-pink, #ff5c8a)" : "var(--p-surface2, #fff4ea)",
                                                        color: on ? "#fff" : "var(--p-text)",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {rel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                                        Your Experience
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How did they react when they opened it?"
                                        maxLength={400}
                                        rows={3}
                                        className="rv-modal-field"
                                        style={{ resize: "none" }}
                                    />
                                </div>

                                {error && (
                                    <p style={{ color: "#ef4444", fontSize: 12.5, fontWeight: 700, margin: "0 0 12px" }}>
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bw-btn bw-btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                                            <span>Submitting…</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send style={{ width: 17, height: 17 }} />
                                            <span>Submit Review</span>
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
