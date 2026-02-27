"use client";

import { useWishContext } from "@/lib/WishContext";
import { Link2, Users, Heart } from "lucide-react";

const connections = [
    { id: "partner", label: "Partner / Lover", icon: <Heart className="w-6 h-6" /> },
    { id: "bff", label: "Best Friend Forever", icon: <Users className="w-6 h-6" /> },
    { id: "sibling", label: "Sibling / Family", icon: <Link2 className="w-6 h-6" /> },
    { id: "crush", label: "Secret Crush", icon: <Heart className="w-6 h-6 text-pink-500" /> },
    { id: "colleague", label: "Work Bestie", icon: <Users className="w-6 h-6 text-blue-500" /> },
    { id: "other", label: "Just Someone Special", icon: <Link2 className="w-6 h-6 text-yellow-500" /> },
];

export function Step2Connection() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What&apos;s the Connection? 🤝</h2>
                <p className="text-foreground/60 text-lg">
                    How do you know {wishData.targetName || "them"}? This sets the underlying tone.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {connections.map((conn) => (
                    <button
                        key={conn.id}
                        onClick={() => updateWishData({ relationship: conn.id })}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all hover:-translate-y-1 ${wishData.relationship === conn.id
                            ? "bg-secondary/20 border-secondary text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                            : "bg-black/40 border-white/10 text-foreground/70 hover:bg-white/5 hover:border-white/20"
                            }`}
                    >
                        <div className={`mb-3 ${wishData.relationship === conn.id ? "text-secondary" : "text-foreground/50"}`}>
                            {conn.icon}
                        </div>
                        <span className="font-medium text-center">{conn.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
