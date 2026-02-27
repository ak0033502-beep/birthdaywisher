"use client";

import { useWishContext } from "@/lib/WishContext";
import { Palette, Check } from "lucide-react";

const presentationStyles = [
    {
        id: "cinematic",
        label: "Cinematic Vault",
        desc: "Premium glassmorphism with animated polaroids.",
        icon: "✨",
        preview: "bg-gradient-to-br from-pink-500/30 via-purple-900/60 to-indigo-900/80",
        overlayText: "text-pink-300",
        borderAccent: "border-pink-500/30",
    },
    {
        id: "terminal",
        label: "Hacker Terminal",
        desc: "Retro MS-DOS aesthetic. Decrypt the memories.",
        icon: "💻",
        preview: "bg-gradient-to-br from-black via-green-950 to-black",
        overlayText: "text-green-400",
        borderAccent: "border-green-500/30",
    },
    {
        id: "storybook",
        label: "Magical Storybook",
        desc: "A vintage book that physically flips pages.",
        icon: "📖",
        preview: "bg-gradient-to-br from-amber-800/40 via-orange-200/30 to-amber-900/50",
        overlayText: "text-amber-300",
        borderAccent: "border-amber-500/30",
    },
    {
        id: "messenger",
        label: "Encrypted Chat",
        desc: "Looks like an iMessage chat history.",
        icon: "💬",
        preview: "bg-gradient-to-br from-blue-500/30 via-gray-300/20 to-blue-400/30",
        overlayText: "text-blue-300",
        borderAccent: "border-blue-500/30",
    },
    {
        id: "galaxy",
        label: "Space Odyssey",
        desc: "Fly through a 3D galaxy of memories.",
        icon: "🚀",
        preview: "bg-gradient-to-br from-indigo-950 via-purple-900/40 to-blue-400/20",
        overlayText: "text-purple-300",
        borderAccent: "border-purple-500/30",
    },
    {
        id: "gallery",
        label: "Art Museum",
        desc: "A classy walkthrough of a virtual art gallery.",
        icon: "🖼️",
        preview: "bg-gradient-to-br from-stone-200/30 via-stone-800/40 to-stone-900/60",
        overlayText: "text-stone-300",
        borderAccent: "border-stone-400/30",
    },
];

export function Step19Theme() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Presentation Experience 🎭</h2>
                <p className="text-foreground/60 text-base sm:text-lg">
                    How should they experience this wish? Choose a completely unique UI theme.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-2 max-h-[55vh] overflow-y-auto hide-scrollbar p-1">
                {presentationStyles.map((style) => {
                    const isSelected = wishData.presentationStyle === style.id;
                    return (
                        <button
                            key={style.id}
                            onClick={() => updateWishData({ presentationStyle: style.id })}
                            className={`relative flex flex-col rounded-2xl border-2 transition-all overflow-hidden group
                                ${isSelected
                                    ? `${style.borderAccent} shadow-lg ring-2 ring-primary/40 scale-[1.02]`
                                    : "border-white/10 hover:border-white/25 hover:scale-[1.01]"
                                }`}
                        >
                            {/* Theme Preview Visual */}
                            <div className={`relative w-full aspect-[4/3] ${style.preview} flex items-center justify-center overflow-hidden`}>
                                {/* Fake UI elements to give a sense of the theme */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-60">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${isSelected ? 'border-white/60' : 'border-white/30'} flex items-center justify-center`}>
                                        <span className="text-lg sm:text-xl">{style.icon}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-6 h-1 rounded bg-white/30"></div>
                                        <div className="w-4 h-1 rounded bg-white/20"></div>
                                        <div className="w-5 h-1 rounded bg-white/25"></div>
                                    </div>
                                    <div className="w-12 h-0.5 rounded bg-white/15 mt-1"></div>
                                </div>

                                {/* CRT/grain overlay for terminal */}
                                {style.id === "terminal" && (
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] mix-blend-overlay opacity-50 pointer-events-none"></div>
                                )}

                                {/* Selected checkmark */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {/* Label & Description */}
                            <div className={`p-2.5 sm:p-3 text-left ${isSelected ? 'bg-white/10' : 'bg-black/40'}`}>
                                <h3 className={`font-bold text-xs sm:text-sm leading-tight ${isSelected ? "text-primary" : "text-white"}`}>
                                    {style.label}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-foreground/50 leading-snug mt-1 line-clamp-2">
                                    {style.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
