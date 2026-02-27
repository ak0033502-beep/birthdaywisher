"use client";

import { useWishContext } from "@/lib/WishContext";
import { Flame, Droplet } from "lucide-react";

const vibes = [
    { id: "tear-jerker", label: "Tear-Jerker", desc: "Pure emotional crying guaranteed.", icon: <Droplet className="w-8 h-8 text-blue-400" />, color: "border-blue-500", bg: "bg-blue-500/10" },
    { id: "hardcore-roast", label: "Hardcore Roast", desc: "No mercy. Savage jokes.", icon: <Flame className="w-8 h-8 text-orange-500" />, color: "border-orange-500", bg: "bg-orange-500/10" },
    { id: "pure-romance", label: "Pure Romance", desc: "Butterflies and deep love.", icon: <HeartIcon />, color: "border-pink-500", bg: "bg-pink-500/10" },
    { id: "grand-celebration", label: "Grand Celebration", desc: "Hype, confetti, and party mode!", icon: <Flame className="w-8 h-8 text-yellow-500" />, color: "border-yellow-500", bg: "bg-yellow-500/10" },
];

function HeartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-pink-500">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
    );
}

export function Step3Vibe() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Vibe Engine 🔮</h2>
                <p className="text-foreground/60 text-lg">
                    What is the overarching emotion of this birthday wish?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {vibes.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => updateWishData({ vibe: v.id })}
                        className={`flex items-start gap-4 p-6 rounded-2xl border transition-all text-left group ${wishData.vibe === v.id
                            ? `${v.bg} ${v.color} shadow-[0_0_20px_rgba(0,0,0,0.2)]`
                            : "bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20"
                            }`}
                    >
                        <div className={`mt-1 transition-transform group-hover:scale-110 ${wishData.vibe === v.id ? "" : "opacity-70"}`}>
                            {v.icon}
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg mb-1 ${wishData.vibe === v.id ? "text-white" : "text-foreground/80"}`}>
                                {v.label}
                            </h3>
                            <p className="text-sm text-foreground/50 leading-relaxed">
                                {v.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
