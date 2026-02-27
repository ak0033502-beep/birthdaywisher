"use client";

import { useWishContext } from "@/lib/WishContext";
import { Palette } from "lucide-react";

const themes = [
    { id: "neon", label: "Neon Cyberpunk", desc: "Vibrant pinks, blues, and dark backgrounds.", colors: ["bg-pink-500", "bg-blue-500"] },
    { id: "elegant", label: "Elegant Gold", desc: "Premium black and gold vibes. Classy.", colors: ["bg-black", "bg-yellow-500"] },
    { id: "pastel", label: "Pastel Dream", desc: "Soft, light, and airy baby colors.", colors: ["bg-purple-300", "bg-pink-200"] },
    { id: "monochrome", label: "Noir Cinematic", desc: "Black and white dramatic contrast.", colors: ["bg-gray-900", "bg-gray-200"] },
    { id: "paper", label: "Vintage Scrapbook", desc: "Classic paper format. Warm, nostalgic and premium.", colors: ["bg-[#e6dcc8]", "bg-[#8b3a3a]"] },
];

export function Step19Theme() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Visual Aesthetics 🎨</h2>
                <p className="text-foreground/60 text-lg">
                    Choose the &quot;Era&quot; or color theme for their story presentation.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => updateWishData({ theme: theme.id })}
                        className={`flex flex-col items-start gap-4 p-6 rounded-2xl border transition-all text-left group ${wishData.theme === theme.id
                            ? "bg-white/10 border-primary shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                            : "bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20"
                            }`}
                    >
                        <div className="flex gap-2 w-full">
                            {theme.colors.map((c, i) => (
                                <div key={i} className={`h-8 flex-1 rounded-md ${c} shadow-inner`}></div>
                            ))}
                        </div>

                        <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={`font-bold text-lg ${wishData.theme === theme.id ? "text-primary" : "text-white"}`}>
                                    {theme.label}
                                </h3>
                                {wishData.theme === theme.id && <Palette className="w-5 h-5 text-primary" />}
                            </div>
                            <p className="text-sm text-foreground/50 leading-relaxed">
                                {theme.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
