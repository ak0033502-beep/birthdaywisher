"use client";

import { useWishContext } from "@/lib/WishContext";
import { HelpCircle, AlertCircle } from "lucide-react";

export function Step10Quiz() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">The Gateway Quiz 🧠</h2>
                <p className="text-foreground/60 text-lg">
                    Set up 2 questions they MUST answer correctly to read your main message.
                </p>
            </div>

            <div className="space-y-8 mt-4">
                {/* Question 1 */}
                <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
                        <h3 className="font-semibold text-lg">Question One</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <HelpCircle className="w-3 h-3" /> Question
                        </label>
                        <input
                            type="text"
                            value={wishData.quizQ1}
                            onChange={(e) => updateWishData({ quizQ1: e.target.value })}
                            placeholder="e.g. What is my favorite movie?"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Exact Answer Required
                        </label>
                        <input
                            type="text"
                            value={wishData.quizA1}
                            onChange={(e) => updateWishData({ quizA1: e.target.value })}
                            placeholder="e.g. Inception"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Question 2 */}
                <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">2</div>
                        <h3 className="font-semibold text-lg">Question Two</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <HelpCircle className="w-3 h-3" /> Question
                        </label>
                        <input
                            type="text"
                            value={wishData.quizQ2}
                            onChange={(e) => updateWishData({ quizQ2: e.target.value })}
                            placeholder="e.g. Who usually pays for the food?"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-white/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Exact Answer Required
                        </label>
                        <input
                            type="text"
                            value={wishData.quizA2}
                            onChange={(e) => updateWishData({ quizA2: e.target.value })}
                            placeholder="e.g. Me"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
