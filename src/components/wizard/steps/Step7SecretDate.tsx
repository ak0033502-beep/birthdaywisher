"use client";

import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { Lock } from "lucide-react";

export function Step7SecretDate() {
    const { wishData, updateWishData } = useWishContext();
    const title = useStepTitle("Step7SecretDate");
    const isAnniversary = wishData.wishType === "anniversary";

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? "When did the couple tie the knot? They'll have to guess this!"
                        : "A date only you two know about (When you first met, first trip, inside joke origin). They'll have to guess this!"}
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> {isAnniversary ? "Wedding Date" : "Secret Date"}
                    </label>
                    <div className="flex flex-col gap-2 relative">
                        <input
                            type="date"
                            value={wishData.secretDate}
                            onChange={(e) => updateWishData({ secretDate: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-foreground/40 text-center mt-4">
                        {isAnniversary
                            ? "If they can't remember their own wedding date... that's a different conversation. 😅"
                            : "If they don't remember this date, it's automatic minus points."}
                    </p>
                </div>
            </div>
        </div>
    );
}
