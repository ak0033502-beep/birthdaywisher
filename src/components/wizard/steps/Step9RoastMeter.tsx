"use client";

import { useWishContext } from "@/lib/WishContext";
import { Flame, Heart } from "lucide-react";

export function Step9RoastMeter() {
    const { wishData, updateWishData } = useWishContext();

    const getLabel = (level: number) => {
        if (level < 20) return "Pure Heart-Melting Toast 🥺";
        if (level < 40) return "Sweet With A Little Sass 😏";
        if (level < 60) return "Perfectly Balanced ⚖️";
        if (level < 80) return "Getting A Bit Personal 💀";
        return "Savage, Unforgiving Roast 🔥";
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Roast vs. Toast 🎚️</h2>
                <p className="text-foreground/60 text-lg">
                    Set the tone for the intro. How hard are we going in on them?
                </p>
            </div>

            <div className="mt-8 space-y-12">
                <div className="relative pt-12 pb-8">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={wishData.roastLevel}
                        onChange={(e) => updateWishData({ roastLevel: Number(e.target.value) })}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer outline-none slider-thumb"
                        style={{
                            background: `linear-gradient(to right, #ec4899 0%, #3b82f6 50%, #f97316 100%)`,
                        }}
                    />

                    <div className="absolute top-0 left-0 text-pink-500 font-bold flex flex-col items-center">
                        <Heart className="w-6 h-6 mb-1" />
                        <span className="text-xs uppercase tracking-wider">Toast</span>
                    </div>

                    <div className="absolute top-0 right-0 text-orange-500 font-bold flex flex-col items-center">
                        <Flame className="w-6 h-6 mb-1" />
                        <span className="text-xs uppercase tracking-wider">Roast</span>
                    </div>
                </div>

                <div className="text-center p-6 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-2xl font-bold mb-2">
                        Level {wishData.roastLevel}
                    </p>
                    <p className="text-foreground/80 font-medium">
                        {getLabel(wishData.roastLevel)}
                    </p>
                </div>
            </div>

            <style jsx>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          margin-top: -12.5px;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: transparent;
          border-radius: 1.3px;
        }
      `}</style>
        </div>
    );
}
