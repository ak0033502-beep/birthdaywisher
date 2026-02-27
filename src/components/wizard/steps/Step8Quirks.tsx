"use client";

import { useWishContext } from "@/lib/WishContext";
import { Tag, Plus, X } from "lucide-react";
import { useState } from "react";

const presetQuirks = [
    "Always 30 mins late",
    "Your weird laugh",
    "Making the best maggi",
    "Overthinking text messages",
    "Stealing my hoodies",
    "Never letting me pay",
];

export function Step8Quirks() {
    const { wishData, updateWishData } = useWishContext();
    const [customQuirk, setCustomQuirk] = useState("");

    const handleToggleQuirk = (quirk: string) => {
        if (wishData.quirks.includes(quirk)) {
            updateWishData({ quirks: wishData.quirks.filter(q => q !== quirk) });
        } else if (wishData.quirks.length < 5) {
            updateWishData({ quirks: [...wishData.quirks, quirk] });
        }
    };

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        if (customQuirk.trim() && wishData.quirks.length < 5 && !wishData.quirks.includes(customQuirk.trim())) {
            updateWishData({ quirks: [...wishData.quirks, customQuirk.trim()] });
            setCustomQuirk("");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Things I Love (The Quirks) ✨</h2>
                <p className="text-foreground/60 text-lg">
                    Select or add up to 5 unique traits that make them special.
                </p>
            </div>

            <div className="mt-4 flex flex-col gap-6">
                {/* Selected Quirks */}
                <div className="flex flex-wrap gap-2 min-h-12 p-4 rounded-xl border border-white/10 bg-black/20">
                    {wishData.quirks.length === 0 ? (
                        <span className="text-foreground/40 text-sm italic py-1">No quirks selected yet...</span>
                    ) : (
                        wishData.quirks.map((quirk) => (
                            <span key={quirk} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-sm">
                                {quirk}
                                <button onClick={() => handleToggleQuirk(quirk)} className="hover:text-red-400">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))
                    )}
                </div>

                {/* Custom Input */}
                <form onSubmit={handleAddCustom} className="flex gap-2">
                    <input
                        type="text"
                        value={customQuirk}
                        onChange={(e) => setCustomQuirk(e.target.value)}
                        placeholder="Add custom quirk..."
                        disabled={wishData.quirks.length >= 5}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!customQuirk.trim() || wishData.quirks.length >= 5}
                        className="p-3 bg-accent text-white rounded-xl hover:bg-accent/80 transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                {/* Presets */}
                <div>
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Suggestions
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {presetQuirks.map(quirk => (
                            <button
                                key={quirk}
                                onClick={() => handleToggleQuirk(quirk)}
                                disabled={!wishData.quirks.includes(quirk) && wishData.quirks.length >= 5}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${wishData.quirks.includes(quirk)
                                        ? "bg-white/10 border-white/30 text-white"
                                        : "border-white/10 text-foreground/60 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-foreground/60"
                                    }`}
                            >
                                {quirk}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
