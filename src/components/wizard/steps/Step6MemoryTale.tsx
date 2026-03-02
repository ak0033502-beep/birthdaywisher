"use client";

import { useWishContext } from "@/lib/WishContext";
import { BookOpen, Lightbulb } from "lucide-react";

const birthdayPrompts = [
    "Remember when we got lost in Goa at 3 AM looking for momos...",
    "That time you fell asleep during my birthday video call...",
    "When we accidentally wore matching outfits to the party...",
];

const anniversaryPrompts = [
    "Our first date — you were so nervous you spilled coffee on yourself...",
    "That unplanned road trip where we ended up at the most beautiful sunset...",
    "The day you surprised me with flowers at work and my whole office went 'Awww'...",
    "When we got stuck in the rain and danced in the parking lot like maniacs...",
    "Our wedding day — when you couldn't stop crying during the vows...",
];

export function Step6MemoryTale() {
    const { wishData, updateWishData } = useWishContext();
    const isAnniversary = wishData.wishType === "anniversary";
    const prompts = isAnniversary ? anniversaryPrompts : birthdayPrompts;

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                    {isAnniversary ? "Your Love Story 📖" : "\"Remember When...\" 📖"}
                </h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? "Share a beautiful moment from your journey together."
                        : "Share a specific, unforgettable memory you two share."}
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-secondary" /> {isAnniversary ? "The Memory" : "The Story"}
                    </label>
                    <textarea
                        value={wishData.memoryTale}
                        onChange={(e) => updateWishData({ memoryTale: e.target.value })}
                        placeholder={isAnniversary
                            ? "e.g. Remember our first date when you couldn't stop laughing at my jokes..."
                            : "e.g. Remember when we got lost in Goa at 3 AM looking for momos..."}
                        rows={5}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-white/20 resize-none"
                    />
                    <div className="flex justify-between text-xs text-foreground/50">
                        <span>{isAnniversary ? "Make it emotional, funny, or both!" : "Make it juicy, embarrassing, or emotional."}</span>
                        <span>{wishData.memoryTale.length}/300</span>
                    </div>
                </div>

                {/* Suggestion Prompts */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Need Ideas? Click to use
                    </label>
                    <div className="flex flex-col gap-2 mt-2">
                        {prompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => updateWishData({ memoryTale: prompt })}
                                className="text-left text-sm text-foreground/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                            >
                                &quot;{prompt}&quot;
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
