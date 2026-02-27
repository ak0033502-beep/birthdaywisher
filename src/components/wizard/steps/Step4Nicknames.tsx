"use client";

import { useWishContext } from "@/lib/WishContext";
import { Smile } from "lucide-react";

export function Step4Nicknames() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Nicknames & Alter Egos 🎭</h2>
                <p className="text-foreground/60 text-lg">
                    What do you secretly (or openly) call {wishData.targetName || "them"}?
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-primary" /> Their Nickname
                    </label>
                    <input
                        type="text"
                        value={wishData.nickname}
                        onChange={(e) => updateWishData({ nickname: e.target.value })}
                        placeholder="e.g. Potato, Pookie, Boss"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20 text-center text-xl font-medium"
                    />
                    <p className="text-xs text-foreground/40 text-center mt-2">
                        We&apos;ll use this occasionally in the story to make it personal.
                    </p>
                </div>
            </div>
        </div>
    );
}
