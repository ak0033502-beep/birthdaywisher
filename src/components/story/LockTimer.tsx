"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

const sessionDeadlines = new Map<string, number>();

/**
 * A circular countdown timer that auto-unlocks after the given duration.
 * Preserves its deadline across back/forward slide navigation and pauses auto-fire while inactive.
 */
export function LockTimer({
    durationSeconds = 60,
    onAutoUnlock,
    label = "Auto-unlock in",
    active = true,
    timerKey,
}: {
    durationSeconds?: number;
    onAutoUnlock: () => void;
    label?: string;
    active?: boolean;
    timerKey?: string;
}) {
    const deadlineRef = useRef<number | null>(null);
    const firedRef = useRef(false);
    const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

    // Keep the latest callback without restarting the countdown when the parent re-renders
    const onAutoUnlockRef = useRef(onAutoUnlock);
    useEffect(() => {
        onAutoUnlockRef.current = onAutoUnlock;
    }, [onAutoUnlock]);

    // Deadline-based countdown: never resets on back/forward navigation, and only triggers unlock while slide is active.
    useEffect(() => {
        if (!active || firedRef.current) return;
        const resolveDeadline = () => {
            if (deadlineRef.current !== null) return deadlineRef.current;
            const scopedKey =
                timerKey && typeof window !== "undefined"
                    ? `${window.location.pathname}::${timerKey}`
                    : null;
            if (scopedKey) {
                const saved = sessionDeadlines.get(scopedKey);
                if (typeof saved === "number") {
                    deadlineRef.current = saved;
                    return saved;
                }
            }
            const fresh = Date.now() + durationSeconds * 1000;
            deadlineRef.current = fresh;
            if (scopedKey) sessionDeadlines.set(scopedKey, fresh);
            return fresh;
        };
        const deadline = resolveDeadline();

        const sync = () => {
            const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left <= 0 && !firedRef.current) {
                firedRef.current = true;
                if (timerKey && typeof window !== "undefined") {
                    sessionDeadlines.delete(`${window.location.pathname}::${timerKey}`);
                }
                onAutoUnlockRef.current();
                return true;
            }
            return false;
        };

        if (sync()) return;
        const interval = setInterval(() => {
            if (sync()) clearInterval(interval);
        }, 250);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, durationSeconds, timerKey]);

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
