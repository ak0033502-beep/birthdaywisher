"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Gift, Heart } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
    const motionVal = useMotionValue(0);
    const rounded = useTransform(motionVal, (v) => Math.floor(v).toLocaleString());
    const [display, setDisplay] = useState("0");

    useEffect(() => {
        const controls = animate(motionVal, value, {
            duration: 2,
            ease: "easeOut",
        });
        const unsubscribe = rounded.on("change", (v) => setDisplay(v));
        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value, motionVal, rounded]);

    return <span>{display}</span>;
}

export function WishCounter({ variant = "full" }: { variant?: "full" | "birthday" | "anniversary" }) {
    const [stats, setStats] = useState({ birthday: 0, anniversary: 0, total: 0 });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                    setLoaded(true);
                }
            } catch {
                // Silently fail
            }
        };

        fetchStats();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!loaded) return null;

    if (variant === "birthday") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel border border-white/10 text-sm"
            >
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-foreground/60">
                    <span className="font-bold text-white"><AnimatedNumber value={stats.birthday} /></span> Birthday Wishes Created
                </span>
            </motion.div>
        );
    }

    if (variant === "anniversary") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel border border-amber-500/20 text-sm"
            >
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-foreground/60">
                    <span className="font-bold text-white"><AnimatedNumber value={stats.anniversary} /></span> Anniversary Wishes Created
                </span>
            </motion.div>
        );
    }

    // Full variant — shows all stats
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
        >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-foreground/60">
                    <span className="font-bold text-white"><AnimatedNumber value={stats.birthday} /></span> Birthday
                </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-amber-500/20">
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-foreground/60">
                    <span className="font-bold text-white"><AnimatedNumber value={stats.anniversary} /></span> Anniversary
                </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10">
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="text-foreground/60">
                    <span className="font-bold text-white"><AnimatedNumber value={stats.total} /></span> Total
                </span>
            </div>
        </motion.div>
    );
}
