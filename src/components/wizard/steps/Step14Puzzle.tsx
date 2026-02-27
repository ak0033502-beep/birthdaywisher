"use client";

import { useWishContext } from "@/lib/WishContext";
import { Grid3X3, UploadCloud, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

export function Step14Puzzle() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 25 * 1024 * 1024) {
            alert("File too large. Max 25MB.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            updateWishData({ puzzleImageUrl: data.url });
        } catch (error) {
            console.error(error);
            alert("Failed to upload puzzle image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
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
                    <div className="w-full flex flex-col items-center">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent/50 transition-all group aspect-square"
                        >
                            {isUploading ? (
                                <Loader2 className="w-12 h-12 text-accent mb-4 animate-spin" />
                            ) : (
                                <UploadCloud className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="font-medium text-lg">{isUploading ? "Chopping into pieces..." : "Upload Puzzle Image"}</span>
                            <span className="text-sm text-foreground/50 mt-2 text-center">We will automatically chop this into a 3x3 sliding tile puzzle.</span>
                        </button>
                    </div>
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
