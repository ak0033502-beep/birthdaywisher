"use client";

import { useWishContext } from "@/lib/WishContext";
import { Heart } from "lucide-react";

export function Step16FuturePromises() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Future Promises 🌟</h2>
                <p className="text-foreground/60 text-lg">
                    What is your wish or promise to them for the upcoming year?
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" /> A promise for this year
                    </label>
                    <textarea
                        value={wishData.futurePromise}
                        onChange={(e) => updateWishData({ futurePromise: e.target.value })}
                        placeholder="I promise to always be there when you need a 2 AM rant session..."
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder:text-white/20 resize-none font-medium"
                    />
                </div>
            </div>
        </div>
    );
}
