"use client";

import { useWishContext } from "@/lib/WishContext";
import { User, Calendar, Heart } from "lucide-react";

export function Step1Target() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Who is the lucky one? 🎯</h2>
                <p className="text-foreground/60 text-lg">Let&apos;s set the target for this epic birthday wish.</p>
            </div>

            <div className="space-y-6 mt-4">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Their Full Name
                    </label>
                    <input
                        type="text"
                        value={wishData.targetName}
                        onChange={(e) => updateWishData({ targetName: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Age */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" /> Turning what age?
                    </label>
                    <input
                        type="number"
                        value={wishData.targetAge}
                        onChange={(e) => updateWishData({ targetAge: e.target.value })}
                        placeholder="e.g. 25"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-gold" /> Gender Identity (Optional)
                    </label>
                    <div className="flex gap-4">
                        {["He/Him", "She/Her", "They/Them", "Skip"].map((gender) => (
                            <button
                                key={gender}
                                onClick={() => updateWishData({ targetGender: gender })}
                                className={`flex-1 py-3 rounded-xl border transition-all ${wishData.targetGender === gender
                                    ? "bg-primary/20 border-primary text-white"
                                    : "bg-black/50 border-white/10 text-foreground/60 hover:bg-white/5"
                                    }`}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
