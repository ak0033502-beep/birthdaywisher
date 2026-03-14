"use client";

import { useState, useEffect, useCallback } from "react";
import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { Link2, Check, X, Loader2 } from "lucide-react";

export function StepCustomLink() {
    const title = useStepTitle("StepCustomLink");
    const { wishData, updateWishData } = useWishContext();
    const [slug, setSlug] = useState(wishData.customSlug || "");
    const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const checkAvailability = useCallback(async (value: string) => {
        const clean = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (clean.length < 3) {
            setStatus("invalid");
            return;
        }
        setStatus("checking");
        try {
            const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(clean)}`);
            const data = await res.json();
            setStatus(data.available ? "available" : "taken");
            if (data.available) {
                updateWishData({ customSlug: clean });
            }
        } catch {
            setStatus("idle");
        }
    }, [updateWishData]);

    useEffect(() => {
        return () => { if (debounceTimer) clearTimeout(debounceTimer); };
    }, [debounceTimer]);

    const handleChange = (value: string) => {
        const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(clean);

        if (clean.length === 0) {
            setStatus("idle");
            updateWishData({ customSlug: undefined });
            return;
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(() => checkAvailability(clean), 500);
        setDebounceTimer(timer);
    };

    const statusConfig = {
        idle: { icon: <Link2 className="w-5 h-5 text-foreground/30" />, text: "", color: "" },
        checking: { icon: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />, text: "Checking...", color: "text-blue-400" },
        available: { icon: <Check className="w-5 h-5 text-green-500" />, text: "Available! ✨", color: "text-green-500" },
        taken: { icon: <X className="w-5 h-5 text-red-400" />, text: "Already taken", color: "text-red-400" },
        invalid: { icon: <X className="w-5 h-5 text-yellow-400" />, text: "Min 3 characters", color: "text-yellow-400" },
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    Create a personalized URL for your wish. <span className="text-foreground/40">(Optional)</span>
                </p>
            </div>

            <div className="max-w-lg mx-auto w-full space-y-6">
                {/* URL Preview */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                    <p className="text-xs text-foreground/40 mb-2 font-medium">Your wish URL will be:</p>
                    <p className="font-mono text-sm text-white break-all">
                        birthdaywisher.fun/w/
                        <span className={slug ? "text-primary font-bold" : "text-foreground/30"}>
                            {slug || "your-custom-slug"}
                        </span>
                    </p>
                </div>

                {/* Input */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 text-sm font-mono">
                        w/
                    </div>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="for-neha"
                        maxLength={40}
                        className="w-full pl-10 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {statusConfig[status].icon}
                    </div>
                </div>

                {/* Status text */}
                {status !== "idle" && (
                    <p className={`text-sm font-medium ${statusConfig[status].color}`}>
                        {statusConfig[status].text}
                    </p>
                )}

                {/* Hint */}
                <p className="text-xs text-foreground/30">
                    Use lowercase letters, numbers, and hyphens. Leave empty to get a random link.
                </p>
            </div>
        </div>
    );
}
