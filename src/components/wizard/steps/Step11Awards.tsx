"use client";

import { useWishContext } from "@/lib/WishContext";
import { Trophy, Medal } from "lucide-react";

const presetAwards = [
    "Best Drama Queen 2026",
    "Certified Masterchef (of Maggi)",
    "Professional Overthinker",
    "World's Okayest Driver",
    "Chief Snacking Officer",
    "The 'I Have Nothing To Wear' Champion",
];

export function Step11Awards() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Virtual Awards 🏆</h2>
                <p className="text-foreground/60 text-lg">
                    Give them a custom ridiculous (or sweet) award for the year.
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" /> Award Title
                    </label>
                    <input
                        type="text"
                        value={wishData.awardTitle}
                        onChange={(e) => updateWishData({ awardTitle: e.target.value })}
                        placeholder="e.g. Best Late Replier of the Timeline"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder:text-white/20 font-bold text-center text-xl text-yellow-400/90"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2 mt-6">
                        <Medal className="w-3 h-3" /> Quick Nominations
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {presetAwards.map(award => (
                            <button
                                key={award}
                                onClick={() => updateWishData({ awardTitle: award })}
                                className={`px-4 py-3 text-sm rounded-xl border transition-all text-left ${wishData.awardTitle === award
                                    ? "bg-yellow-400/20 border-yellow-400/50 text-yellow-100"
                                    : "bg-black/40 border-white/5 text-foreground/70 hover:bg-white/5 hover:border-white/20"
                                    }`}
                            >
                                {award}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
