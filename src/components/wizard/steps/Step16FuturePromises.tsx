"use client";

import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { Heart, Lightbulb } from "lucide-react";

const birthdayPromises = [
    "I promise to always be there when you need a 2 AM rant session...",
    "This year, I'll finally learn to cook your favorite meal...",
];

const anniversaryPromises = [
    "I promise to keep choosing you, every single day, no matter what life throws at us.",
    "This year, I'll plan that dream trip we've been talking about for years.",
    "I promise more random 'I love you' texts, more surprise dates, and more dancing in the kitchen.",
    "No matter how many anniversaries we celebrate, I promise to never stop making you feel special.",
    "I promise to always be your biggest supporter, your safe space, and your forever person.",
];

export function Step16FuturePromises() {
    const { wishData, updateWishData } = useWishContext();
    const title = useStepTitle("Step16FuturePromises");
    const isAnniversary = wishData.wishType === "anniversary";
    const suggestions = isAnniversary ? anniversaryPromises : birthdayPromises;

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? "What do you promise for the next year of your journey together?"
                        : "What is your wish or promise to them for the upcoming year?"}
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" /> {isAnniversary ? "Your anniversary promise" : "A promise for this year"}
                    </label>
                    <textarea
                        value={wishData.futurePromise}
                        onChange={(e) => updateWishData({ futurePromise: e.target.value })}
                        placeholder={isAnniversary
                            ? "I promise to keep choosing you, every single day..."
                            : "I promise to always be there when you need a 2 AM rant session..."}
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder:text-white/20 resize-none font-medium"
                    />
                </div>

                {/* Suggestion Prompts */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Click to use
                    </label>
                    <div className="flex flex-col gap-2 mt-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => updateWishData({ futurePromise: s })}
                                className="text-left text-sm text-foreground/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                            >
                                &quot;{s}&quot;
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
