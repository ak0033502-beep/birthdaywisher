"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock, ArrowRight } from "lucide-react";

export function CountdownOverlay({
    unlockDate,
    onUnlock
}: {
    unlockDate: string;
    onUnlock: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const target = new Date(unlockDate).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                onUnlock();
                return null;
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        // Initial set
        const initial = calculateTimeLeft();
        if (!initial) return;
        setTimeLeft(initial);

        // Update every second
        const timer = setInterval(() => {
            const current = calculateTimeLeft();
            if (!current) {
                clearInterval(timer);
            } else {
                setTimeLeft(current);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [unlockDate, onUnlock]);

    // Don't render until hydration to avoid mismatch
    if (!isClient || !timeLeft) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            >
                {/* Background ambient effects */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]" />

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
                        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin [animation-duration:3s]" />
                        <Lock className="w-10 h-10 text-white/50" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        No Peeking.
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-white/60 mb-10 sm:mb-16 max-w-lg mx-auto font-medium px-2">
                        Your surprise is safely locked inside a time capsule. It will automatically open when the countdown reaches zero.
                    </p>

                    {/* The Ticking Clock */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8 w-full">
                        <TimeUnit value={timeLeft.days} label="Days" />
                        <TimeUnit value={timeLeft.hours} label="Hours" />
                        <TimeUnit value={timeLeft.minutes} label="Minutes" />
                        <TimeUnit value={timeLeft.seconds} label="Seconds" />
                    </div>

                </motion.div>

                {/* Visual Lock Interface Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary"
                        animate={{
                            width: ["0%", "100%", "0%"],
                            left: ["0%", "0%", "100%"]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-4 relative overflow-hidden backdrop-blur-xl">
                {/* Glossy reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 rounded-t-3xl" />
                <span className="text-3xl sm:text-4xl md:text-7xl font-mono font-bold text-white relative z-10">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/40">
                {label}
            </span>
        </div>
    );
}
