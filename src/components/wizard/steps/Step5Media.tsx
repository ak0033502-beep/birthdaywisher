"use client";

import { useWishContext } from "@/lib/WishContext";
import { Image as ImageIcon, Video } from "lucide-react";
import { useState } from "react";

export function Step5Media() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);

    // Mock upload handler
    const handleFileUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            // Simulate successful upload url
            updateWishData({
                mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
                mediaType: "photo"
            });
            setIsUploading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Memory Vault 📸</h2>
                <p className="text-foreground/60 text-lg">
                    Upload a favorite photo or record a 1-minute video message.
                </p>
            </div>

            <div className="mt-4">
                {wishData.mediaUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 group bg-black/50 p-2">
                        {wishData.mediaType === "photo" ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={wishData.mediaUrl} alt="Memory" className="w-full h-64 object-cover rounded-xl" />
                            </>
                        ) : (
                            <div className="w-full h-64 bg-gray-900 flex items-center justify-center rounded-xl">
                                <Video className="w-12 h-12 text-primary/50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => updateWishData({ mediaUrl: "", mediaType: null })}
                                className="px-4 py-2 bg-red-500/80 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
                            >
                                Remove Media
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                            className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-primary/50 transition-all group"
                        >
                            <ImageIcon className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Upload Photo</span>
                            <span className="text-xs text-foreground/50 mt-1">PNG, JPG up to 10MB</span>
                        </button>

                        <button
                            className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-secondary/50 transition-all group relative overflow-hidden"
                        >
                            {/* Coming soon overly for actual upload integration, keeping mockup clean */}
                            <Video className="w-10 h-10 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Upload / Record Video</span>
                            <span className="text-xs text-foreground/50 mt-1">Max 1 Minute duration</span>
                        </button>
                    </div>
                )}

                {isUploading && (
                    <div className="mt-4 text-center text-sm text-primary animate-pulse">
                        Uploading magic to the vault...
                    </div>
                )}
            </div>
        </div>
    );
}
