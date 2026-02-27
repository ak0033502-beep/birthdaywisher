"use client";

import { useWishContext } from "@/lib/WishContext";
import { PartyPopper, HeartPulse, Flame } from "lucide-react";
import confetti from "canvas-confetti";

const effects = [
    { id: "confetti", label: "Confetti Explosion", icon: <PartyPopper className="w-8 h-8 text-blue-400" /> },
    { id: "hearts", label: "Virtual Hug & Hearts", icon: <HeartPulse className="w-8 h-8 text-pink-500" /> },
    { id: "lanterns", label: "Floating Lanterns", icon: <Flame className="w-8 h-8 text-orange-400" /> },
];

export function Step20Finale() {
    const { wishData, updateWishData } = useWishContext();

    const handlePreviewEffect = (id: string) => {
        updateWishData({ finaleEffect: id });
        if (id === "confetti") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ec4899', '#3b82f6', '#fbbf24']
            });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Grand Finale 🎆</h2>
                <p className="text-foreground/60 text-lg">
                    Choose the final effect that triggers when they reach the end of your story.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {effects.map((fx) => (
                    <button
                        key={fx.id}
                        onClick={() => handlePreviewEffect(fx.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all text-center group ${wishData.finaleEffect === fx.id
                            ? "bg-secondary/20 border-secondary text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                            : "bg-black/40 border-white/10 text-foreground/70 hover:bg-white/5 hover:border-white/20"
                            }`}
                    >
                        <div className={`mb-4 transition-transform group-hover:scale-110 ${wishData.finaleEffect === fx.id ? "text-secondary" : ""}`}>
                            {fx.icon}
                        </div>
                        <h3 className="font-bold">{fx.label}</h3>
                    </button>
                ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Ready to create magic?</h3>
                    <p className="text-foreground/70 text-sm max-w-sm mx-auto">
                        Review your choices. Once generated, you will get a unique, self-destructing link valid for 10 hours after they open it.
                    </p>
                </div>
            </div>
        </div>
    );
}
