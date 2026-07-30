"use client";

import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { Play, Pause, Music } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const tracks = [
    { id: "lofi", label: "Lofi Chill", artist: "Cozy vibes", emoji: "☕" },
    { id: "bollywood", label: "Bollywood Romantic", artist: "Strings & Flute", emoji: "🎻" },
    { id: "upbeat", label: "Midnight Party", artist: "House beats", emoji: "🎉" },
    { id: "emotional", label: "Cinematic Emotional", artist: "Piano & Cello", emoji: "🎹" },
    { id: "none", label: "No Music", artist: "Silent vibes", emoji: "🔇" },
];

export function Step18Soundtrack() {
    const title = useStepTitle("Step18Soundtrack");
    const { wishData, updateWishData } = useWishContext();
    const [playing, setPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Stop audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = (id: string) => {
        if (id === "none") return;

        if (playing === id) {
            // Pause
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlaying(null);
        } else {
            // Stop previous audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            // Play new track preview
            const audio = new Audio(`/demo-audio/${id}.mp3`);
            audio.loop = true;
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Audio file may not exist — fail silently
            });
            audio.addEventListener("ended", () => setPlaying(null));
            audioRef.current = audio;
            setPlaying(id);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    Select the background music that will play during the story.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {tracks.map((track) => (
                    <div
                        key={track.id}
                        onClick={() => updateWishData({ soundtrack: track.id })}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${wishData.soundtrack === track.id
                            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                            : "bg-black/40 border-white/10 hover:bg-white/5"
                            }`}
                    >
                        {track.id !== "none" ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(track.id); }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${playing === track.id ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                            >
                                {playing === track.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                            </button>
                        ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white">
                                <Music className="w-5 h-5 opacity-50" />
                            </div>
                        )}

                        <div className="flex-grow">
                            <h3 className={`font-bold ${wishData.soundtrack === track.id ? "text-white" : "text-foreground/80"}`}>
                                {track.emoji} {track.label}
                            </h3>
                            <p className="text-xs text-foreground/50">{track.artist}</p>
                        </div>

                        <div className="px-4 border-l border-white/10 h-full flex items-center">
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
