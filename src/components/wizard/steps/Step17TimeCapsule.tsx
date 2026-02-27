"use client";

import { useWishContext } from "@/lib/WishContext";
import { Hourglass } from "lucide-react";

export function Step17TimeCapsule() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Time Capsule ⏳</h2>
                <p className="text-foreground/60 text-lg">
                    Write a secret message. They will only be able to unlock and read this on their <span className="text-primary font-bold">NEXT</span> birthday.
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                    <label className="text-sm font-medium text-primary flex items-center gap-2">
                        <Hourglass className="w-4 h-4" /> Message to their Future Self
                    </label>
                    <textarea
                        value={wishData.timeCapsule}
                        onChange={(e) => updateWishData({ timeCapsule: e.target.value })}
                        placeholder="By this time next year, I hope you have finally..."
                        rows={4}
                        className="w-full bg-black/50 border border-primary/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20 resize-none font-medium"
                    />
                    <p className="text-xs text-foreground/50 text-center">
                        We will securely hash and store this until 365 days from now.
                    </p>
                </div>
            </div>
        </div>
    );
}
