"use client";

import { useWishContext } from "@/lib/WishContext";
import { MessageSquareHeart } from "lucide-react";

export function Step13Gratitude() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">The Gratitude Board 🙏</h2>
                <p className="text-foreground/60 text-lg">
                    &quot;I am most thankful for you because...&quot;
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <MessageSquareHeart className="w-4 h-4 text-pink-500" /> Completion Sentence
                    </label>
                    <div className="relative">
                        <span className="absolute top-4 left-4 text-foreground/50 italic pointer-events-none">
                            ...because
                        </span>
                        <textarea
                            value={wishData.gratitudeText}
                            onChange={(e) => updateWishData({ gratitudeText: e.target.value })}
                            placeholder=" you never fail to make me laugh when I'm down."
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-24 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none font-medium text-lg leading-relaxed"
                        />
                    </div>
                    <p className="text-xs text-foreground/40 text-center">
                        Keep it short and to the point. This gets its own highlight slide.
                    </p>
                </div>
            </div>
        </div>
    );
}
