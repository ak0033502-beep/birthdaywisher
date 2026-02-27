"use client";

import { useWishContext } from "@/lib/WishContext";
import { Mic, Square, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

export function Step12VoiceNote() {
    const { wishData, updateWishData } = useWishContext();
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const toggleRecording = async () => {
        if (!isRecording) {
            // Start Recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                    stream.getTracks().forEach(track => track.stop());

                    setIsUploading(true);
                    try {
                        const signRes = await fetch("/api/cloudinary-sign");
                        if (!signRes.ok) throw new Error("Failed to initialize upload");
                        const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

                        const formData = new FormData();
                        formData.append("file", audioBlob, "voicenote.mp3");
                        formData.append("api_key", apiKey);
                        formData.append("timestamp", timestamp);
                        formData.append("signature", signature);
                        formData.append("folder", folder);

                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                            method: "POST",
                            body: formData,
                        });

                        if (!res.ok) throw new Error("Audio upload failed");
                        const data = await res.json();

                        updateWishData({ audioUrl: data.secure_url });
                    } catch (error) {
                        console.error(error);
                        alert("Failed to upload audio. Please try again.");
                    } finally {
                        setIsUploading(false);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied", err);
                alert("Please allow microphone access to record a voice note.");
            }
        } else {
            // Stop Recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
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
                        <audio controls src={wishData.audioUrl} className="w-full" />
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
                        disabled={isUploading}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isUploading ? "bg-black/50 border-4 border-white/10 text-primary" :
                            isRecording
                                ? "bg-red-500/20 border-4 border-red-500 animate-pulse text-red-500"
                                : "bg-black/50 border-4 border-white/10 hover:border-primary/50 hover:bg-white/5 text-foreground/50 hover:text-primary"
                            }`}
                    >
                        {isUploading ? <Loader2 className="w-10 h-10 animate-spin" /> :
                            isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-12 h-12" />}
                    </button>
                )}

                {!wishData.audioUrl && (
                    <p className={`text-sm font-medium ${isRecording ? "text-red-500 animate-pulse" : isUploading ? "text-primary" : "text-foreground/50"}`}>
                        {isUploading ? "Uploading recording..." : isRecording ? "Recording... (Tap to stop)" : "Tap to record"}
                    </p>
                )}
            </div>
        </div>
    );
}
