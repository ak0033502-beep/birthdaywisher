"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Clock, Heart, BarChart3, Link2, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
    wishId: string;
    viewCount: number;
    createdAt: string;
    openedAt: string | null;
    customSlug: string | null;
    totalTimeSpent: number;
    sectionTimes: Record<string, number>;
    mostLovedSection: string;
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainSec = seconds % 60;
    return `${minutes}m ${remainSec}s`;
}

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wishId, setWishId] = useState("");

    useEffect(() => {
        params.then((resolved) => {
            setWishId(resolved.id);
            // Get creator token from localStorage
            const token = localStorage.getItem(`creator_token_${resolved.id}`);
            if (!token) {
                setError("No access token found. You can only view analytics for wishes you created.");
                setLoading(false);
                return;
            }

            fetch(`/api/analytics?wishId=${resolved.id}&token=${token}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Unauthorized");
                    return res.json();
                })
                .then((data) => {
                    setAnalytics(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError("Could not load analytics. Invalid token or wish not found.");
                    setLoading(false);
                });
        });
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="glass-panel p-8 rounded-3xl max-w-md text-center border border-white/10">
                    <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-foreground/60 text-sm mb-6">{error}</p>
                    <Link href="/" className="text-primary hover:text-secondary transition-colors text-sm font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const stats = [
        { label: "Total Views", value: analytics.viewCount.toString(), icon: <Eye className="w-5 h-5" />, color: "text-blue-400" },
        { label: "Time Spent", value: formatDuration(analytics.totalTimeSpent), icon: <Clock className="w-5 h-5" />, color: "text-green-400" },
        { label: "Most Loved", value: analytics.mostLovedSection || "—", icon: <Heart className="w-5 h-5" />, color: "text-pink-500" },
        { label: "Status", value: analytics.openedAt ? "Opened ✨" : "Not opened yet", icon: <CalendarDays className="w-5 h-5" />, color: "text-amber-400" },
    ];

    const sortedSections = Object.entries(analytics.sectionTimes).sort(([, a], [, b]) => b - a);

    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] -z-10" />

            <main className="container max-w-4xl mx-auto px-4 sm:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Header */}
                    <div className="mb-10">
                        <Link href="/" className="text-foreground/40 hover:text-primary text-sm transition-colors mb-4 block">← Back to Home</Link>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-7 h-7 text-primary" />
                            <h1 className="text-2xl sm:text-3xl font-bold">Wish Analytics</h1>
                        </div>
                        <p className="text-foreground/50 text-sm">
                            Wish ID: <span className="font-mono text-foreground/70">{wishId}</span>
                            {analytics.customSlug && (
                                <span className="ml-2">
                                    <Link2 className="w-3.5 h-3.5 inline" /> <span className="font-mono text-primary">/w/{analytics.customSlug}</span>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-5 rounded-2xl border border-white/10"
                            >
                                <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                                <p className="text-xl sm:text-2xl font-bold text-white truncate">{stat.value}</p>
                                <p className="text-xs text-foreground/40 mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Section Breakdown */}
                    {sortedSections.length > 0 && (
                        <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" /> Section Breakdown
                            </h3>
                            <div className="space-y-4">
                                {sortedSections.map(([section, timeMs], i) => {
                                    const maxTime = sortedSections[0][1];
                                    const percent = maxTime > 0 ? (timeMs / maxTime) * 100 : 0;
                                    const isTop = i === 0;
                                    return (
                                        <div key={section}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className={`font-medium ${isTop ? "text-pink-400" : "text-foreground/70"}`}>
                                                    {isTop && "❤️ "}{section}
                                                </span>
                                                <span className="text-foreground/40 font-mono text-xs">{formatDuration(timeMs)}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    className={`h-full rounded-full ${isTop
                                                        ? "bg-gradient-to-r from-pink-500 to-purple-500"
                                                        : "bg-primary/60"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Created date */}
                    <div className="text-center text-xs text-foreground/30">
                        Created: {new Date(analytics.createdAt).toLocaleString()}
                        {analytics.openedAt && ` • Opened: ${new Date(analytics.openedAt).toLocaleString()}`}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
