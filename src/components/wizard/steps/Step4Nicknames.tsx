"use client";

import { useWishContext } from "@/lib/WishContext";
import { Smile } from "lucide-react";

const birthdaySuggestions = ["Potato", "Pookie", "Boss", "Bubba", "Chhotu", "Pagal"];
const anniversarySuggestions = ["Jaan", "My Love", "Hubby", "Wifey", "Babu", "Soulmate", "Better Half", "My Forever"];

export function Step4Nicknames() {
    const { wishData, updateWishData } = useWishContext();
    const isAnniversary = wishData.wishType === "anniversary";
    const suggestions = isAnniversary ? anniversarySuggestions : birthdaySuggestions;

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                    {isAnniversary ? "Pet Names & Love Language 💕" : "Nicknames & Alter Egos 🎭"}
                </h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? `What do you lovingly call ${wishData.targetName || "them"}?`
                        : `What do you secretly (or openly) call ${wishData.targetName || "them"}?`}
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-primary" /> {isAnniversary ? "Their Pet Name" : "Their Nickname"}
                    </label>
                    <input
                        type="text"
                        value={wishData.nickname}
                        onChange={(e) => updateWishData({ nickname: e.target.value })}
                        placeholder={isAnniversary ? "e.g. Jaan, My Love, Hubby" : "e.g. Potato, Pookie, Boss"}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20 text-center text-xl font-medium"
                    />
                    <p className="text-xs text-foreground/40 text-center mt-2">
                        We&apos;ll use this occasionally in the story to make it personal.
                    </p>
                </div>

                {/* Suggestion Chips */}
                <div>
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                        💡 Quick Suggestions
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {suggestions.map((name) => (
                            <button
                                key={name}
                                onClick={() => updateWishData({ nickname: name })}
                                className={`px-4 py-2 rounded-full text-sm border transition-all ${wishData.nickname === name
                                    ? "bg-primary/20 border-primary text-white"
                                    : "border-white/10 text-foreground/60 hover:border-white/30 hover:text-white"
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
