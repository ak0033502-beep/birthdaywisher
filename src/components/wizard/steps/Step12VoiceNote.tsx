"use client";

import { useWishContext } from "@/lib/WishContext";
import { Mic, Play, Square } from "lucide-react";
import { useState } from "react";

export function Step12VoiceNote() {
    const { wishData, updateWishData } = useWishContext();
    const [isRecording, setIsRecording] = useState(false);

    // Mock recording
    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setTimeout(() => {
                setIsRecording(false);
                updateWishData({ audioUrl: "mock_audio_url.mp3" });
            }, 3000); // simulate 3 sec recording
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Voice Note 🎙️</h2>
                <p className="text-foreground/60 text-lg">
                    Sing Happy Birthday or just leave a raw, unedited voice message.
                </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center space-y-8">
                {wishData.audioUrl ? (
                    <div className="w-full max-w-sm p-6 bg-primary/10 border border-primary/30 rounded-2xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                            <div className="w-1/3 h-full bg-primary rounded-full"></div>
                        </div>
                        <button
                            onClick={() => updateWishData({ audioUrl: "" })}
                            className="mt-2 text-sm text-foreground/50 hover:text-red-400 transition-colors"
                        >
                            Delete & Rerecord
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={toggleRecording}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording
                                ? "bg-red-500/20 border-4 border-red-500 animate-pulse text-red-500"
                                : "bg-black/50 border-4 border-white/10 hover:border-primary/50 hover:bg-white/5 text-foreground/50 hover:text-primary"
                            }`}
                    >
                        {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-12 h-12" />}
                    </button>
                )}

                {!wishData.audioUrl && (
                    <p className={`text-sm font-medium ${isRecording ? "text-red-500 animate-pulse" : "text-foreground/50"}`}>
                        {isRecording ? "Recording... (Tap to stop)" : "Tap to record"}
                    </p>
                )}
            </div>
        </div>
    );
}
