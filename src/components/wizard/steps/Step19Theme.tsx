"use client";

import { useWishContext } from "@/lib/WishContext";
import { Palette } from "lucide-react";

const presentationStyles = [
    { id: "cinematic", label: "Cinematic Vault", desc: "Premium 3D glassmorphism and animated polaroids.", icon: "✨", colors: ["bg-pink-500", "bg-purple-900"] },
    { id: "terminal", label: "Hacker Terminal", desc: "Retro MS-DOS aesthetic. Decrypt the memories.", icon: "💻", colors: ["bg-black", "bg-green-500"] },
    { id: "storybook", label: "Magical Storybook", desc: "A 3D book that physically flips pages.", icon: "📖", colors: ["bg-amber-900", "bg-orange-200"] },
    { id: "messenger", label: "Encrypted Chat", desc: "Looks like an iMessage chat history.", icon: "💬", colors: ["bg-blue-500", "bg-gray-200"] },
    { id: "galaxy", label: "Space Odyssey", desc: "Fly through a 3D galaxy of memories.", icon: "🚀", colors: ["bg-indigo-950", "bg-blue-400"] },
    { id: "gallery", label: "Art Museum", desc: "A classy 2.5D walkthrough of an art gallery.", icon: "🖼️", colors: ["bg-stone-100", "bg-stone-800"] },
];

export function Step19Theme() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Presentation Experience 🎭</h2>
                <p className="text-foreground/60 text-lg">
                    How do you want them to experience this wish? Choose a completely unique UI theme.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {presentationStyles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => updateWishData({ presentationStyle: style.id })}
                        className={`flex flex-col items-start gap-4 p-6 rounded-2xl border transition-all text-left group ${wishData.presentationStyle === style.id
                            ? "bg-white/10 border-primary shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                            : "bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20"
                            }`}
                    >
                        <div className="flex gap-2 w-full">
                            {style.colors.map((c, i) => (
                                <div key={i} className={`h-2 flex-1 rounded-full ${c} shadow-inner opacity-50`}></div>
                            ))}
                        </div>

                        <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={`font-bold text-lg flex items-center gap-2 ${wishData.presentationStyle === style.id ? "text-primary" : "text-white"}`}>
                                    <span>{style.icon}</span> {style.label}
                                </h3>
                                {wishData.presentationStyle === style.id && <Palette className="w-5 h-5 text-primary" />}
                            </div>
                            <p className="text-sm text-foreground/50 leading-relaxed mt-2">
                                {style.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
