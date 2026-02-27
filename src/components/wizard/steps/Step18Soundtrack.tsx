"use client";

import { useWishContext } from "@/lib/WishContext";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

const tracks = [
    { id: "lofi", label: "Lof Chill", artist: "Cozy vibes", src: "/demo-audio/lofi.mp3" },
    { id: "bollywood", label: "Bollywood Romantic", artist: "Strings & Flute", src: "/demo-audio/bollywood.mp3" },
    { id: "upbeat", label: "Midnight Party", artist: "House beats", src: "/demo-audio/party.mp3" },
    { id: "emotional", label: "Cinematic Emotional", artist: "Piano & Cello", src: "/demo-audio/emotional.mp3" },
];

export function Step18Soundtrack() {
    const { wishData, updateWishData } = useWishContext();
    const [playing, setPlaying] = useState<string | null>(null);

    const togglePlay = (id: string) => {
        if (playing === id) {
            setPlaying(null);
        } else {
            setPlaying(id);
            // In a real app we would use an HTML5 Audio object here
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Soundtrack 🎵</h2>
                <p className="text-foreground/60 text-lg">
                    Select the background music that will play during the story.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {tracks.map((track) => (
                    <div
                        key={track.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${wishData.soundtrack === track.id
                            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                            : "bg-black/40 border-white/10 hover:bg-white/5"
                            }`}
                    >
                        <button
                            onClick={() => togglePlay(track.id)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${playing === track.id ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
                                }`}
                        >
                            {playing === track.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>

                        <div
                            className="flex-grow cursor-pointer"
                            onClick={() => updateWishData({ soundtrack: track.id })}
                        >
                            <h3 className={`font-bold ${wishData.soundtrack === track.id ? "text-white" : "text-foreground/80"}`}>
                                {track.label}
                            </h3>
                            <p className="text-xs text-foreground/50">{track.artist}</p>
                        </div>

                        <div
                            className="cursor-pointer px-4 border-l border-white/10 h-full flex items-center"
                            onClick={() => updateWishData({ soundtrack: track.id })}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${wishData.soundtrack === track.id ? "border-primary" : "border-white/20"
                                }`}>
                                {wishData.soundtrack === track.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
