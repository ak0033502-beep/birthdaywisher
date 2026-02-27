"use client";

import { useWishContext } from "@/lib/WishContext";
import { HeartHandshake } from "lucide-react";

export function Step15CoreMessage() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">The Heart-To-Heart 💌</h2>
                <p className="text-foreground/60 text-lg">
                    This is it. The main paragraph. Pour your heart out (or roast them some more).
                    <br /><span className="text-sm font-medium text-primary mt-2 block">This unlocks AFTER they solve the puzzle!</span>
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-primary" /> The Core Message
                    </label>
                    <textarea
                        value={wishData.coreMessage}
                        onChange={(e) => updateWishData({ coreMessage: e.target.value })}
                        placeholder="Happy Birthday! I just wanted to say that..."
                        rows={8}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20 resize-none text-lg selection:bg-primary/30"
                    />
                    <div className="flex justify-between text-xs text-foreground/50">
                        <span>Make it count!</span>
                        <span>{wishData.coreMessage.length} chars</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
