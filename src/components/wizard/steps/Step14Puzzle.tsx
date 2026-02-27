"use client";

import { useWishContext } from "@/lib/WishContext";
import { Grid3X3, UploadCloud } from "lucide-react";
import { useState } from "react";

export function Step14Puzzle() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            // Mock upload mapping for the puzzle background
            updateWishData({ puzzleImageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop" });
            setIsUploading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Interactive Puzzle 🧩</h2>
                <p className="text-foreground/60 text-lg">
                    Upload an image they will have to unscramble (sliding tile puzzle) to unlock your final message!
                </p>
            </div>

            <div className="mt-4">
                {wishData.puzzleImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 group bg-black/50 p-2 max-w-sm mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={wishData.puzzleImageUrl} alt="Puzzle Base" className="w-full aspect-square object-cover rounded-xl opacity-50 sepia-[.5]" />
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <Grid3X3 className="w-16 h-16 text-white/50 mb-2" />
                            <span className="font-bold text-white tracking-widest uppercase">Puzzle Preview</span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto">
                            <button
                                onClick={() => updateWishData({ puzzleImageUrl: "" })}
                                className="px-4 py-2 bg-red-500/80 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
                            >
                                Change Image
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent/50 transition-all group aspect-square"
                    >
                        <UploadCloud className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-lg">Upload Puzzle Image</span>
                        <span className="text-sm text-foreground/50 mt-2 text-center">We will automatically chop this into a 3x3 sliding tile puzzle.</span>
                    </button>
                )}

                {isUploading && (
                    <div className="mt-4 text-center text-sm text-accent animate-pulse">
                        Shattering image into puzzle pieces...
                    </div>
                )}
            </div>
        </div>
    );
}
