"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

/**
 * A circular countdown timer that auto-unlocks after the given duration.
 * It displays a progress ring and remaining seconds.
 * When time runs out, it calls onAutoUnlock.
 */
export function LockTimer({
    durationSeconds = 60,
    onAutoUnlock,
    label = "Auto-unlock in",
}: {
    durationSeconds?: number;
    onAutoUnlock: () => void;
    label?: string;
}) {
    const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

    useEffect(() => {
        if (secondsLeft <= 0) {
            onAutoUnlock();
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, onAutoUnlock]);

    const progress = secondsLeft / durationSeconds;
    const circumference = 2 * Math.PI * 18; // radius = 18
    const dashOffset = circumference * (1 - progress);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
            <div className="relative w-9 h-9 shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
                    {/* Background circle */}
                    <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke={secondsLeft <= 10 ? "#ef4444" : "#ec4899"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <Timer className={`absolute inset-0 m-auto w-3.5 h-3.5 ${secondsLeft <= 10 ? 'text-red-400' : 'text-pink-400'}`} />
            </div>
            <span className={`text-xs font-medium ${secondsLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white/60'}`}>
                {secondsLeft > 0
                    ? `${label} ${secondsLeft}s`
                    : "Unlocking..."
                }
            </span>
        </motion.div>
    );
}
