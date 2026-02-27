"use client";

import { useWishContext } from "@/lib/WishContext";
import { BookOpen } from "lucide-react";

export function Step6MemoryTale() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">&quot;Remember When...&quot; 📖</h2>
                <p className="text-foreground/60 text-lg">
                    Share a specific, unforgettable memory you two share.
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-secondary" /> The Story
                    </label>
                    <textarea
                        value={wishData.memoryTale}
                        onChange={(e) => updateWishData({ memoryTale: e.target.value })}
                        placeholder="e.g. Remember when we got lost in Goa at 3 AM looking for momos..."
                        rows={5}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-white/20 resize-none"
                    />
                    <div className="flex justify-between text-xs text-foreground/50">
                        <span>Make it juicy, embarrassing, or emotional.</span>
                        <span>{wishData.memoryTale.length}/300</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
