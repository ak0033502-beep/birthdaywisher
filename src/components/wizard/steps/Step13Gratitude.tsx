"use client";

import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { MessageSquareHeart, Lightbulb } from "lucide-react";

const birthdaySuggestions = [
    "you never fail to make me laugh when I'm down.",
    "you always believe in me, even when I don't believe in myself.",
    "you make the world feel like a safer place.",
];

const anniversarySuggestions = [
    "you chose me every single day, even on the hard days.",
    "you make ordinary moments feel like magic.",
    "you're not just my partner — you're my home.",
    "every year with you is better than the last.",
    "you love me in a way I never knew I needed.",
];

export function Step13Gratitude() {
    const { wishData, updateWishData } = useWishContext();
    const title = useStepTitle("Step13Gratitude");
    const isAnniversary = wishData.wishType === "anniversary";
    const suggestions = isAnniversary ? anniversarySuggestions : birthdaySuggestions;

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? "\"I am most grateful for you because...\""
                        : "\"I am most thankful for you because...\""}
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
                            placeholder={isAnniversary
                                ? " you chose me every single day, even on the hard days."
                                : " you never fail to make me laugh when I'm down."}
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-24 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none font-medium text-lg leading-relaxed"
                        />
                    </div>
                    <p className="text-xs text-foreground/40 text-center">
                        Keep it short and to the point. This gets its own highlight slide.
                    </p>
                </div>

                {/* Suggestion Chips */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Click to use
                    </label>
                    <div className="flex flex-col gap-2 mt-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => updateWishData({ gratitudeText: s })}
                                className="text-left text-sm text-foreground/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                            >
                                ...because &quot;{s}&quot;
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
