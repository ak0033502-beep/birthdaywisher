"use client";

import { useWishContext } from "@/lib/WishContext";
import { Grid3X3, UploadCloud, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

export function Step14Puzzle() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 25 * 1024 * 1024) {
            alert("File too large. Max 25MB.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Get Cloudinary signature
            const signRes = await fetch("/api/cloudinary-sign");
            if (!signRes.ok) throw new Error("Failed to get upload signature");
            const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

            const formData = new FormData();
            formData.append("api_key", String(apiKey));
            formData.append("timestamp", String(timestamp));
            formData.append("signature", String(signature));
            formData.append("folder", String(folder));
            formData.append("file", file);

            // Use XMLHttpRequest for progress tracking
            const url = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.secure_url);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error("Upload failed"));
                xhr.send(formData);
            });

            updateWishData({ puzzleImageUrl: url });
        } catch (error) {
            console.error(error);
            alert("Failed to upload puzzle image. Please try again.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">The Interactive Puzzle 🧩</h2>
                <p className="text-foreground/60 text-base sm:text-lg">
                    Upload an image they will have to unscramble (sliding tile puzzle) to unlock your final message!
                </p>
            </div>

            <div className="mt-2">
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
                            className="w-full max-w-sm mx-auto flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent/50 transition-all group aspect-square"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-accent mb-4 animate-spin" />
                                    {/* Progress bar */}
                                    <div className="w-full max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="font-medium text-base">{uploadProgress}% uploaded</span>
                                </>
                            ) : (
                                <UploadCloud className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                            )}
                            {!isUploading && (
                                <>
                                    <span className="font-medium text-base sm:text-lg">Upload Puzzle Image</span>
                                    <span className="text-sm text-foreground/50 mt-2 text-center">We will automatically chop this into a 3x3 sliding tile puzzle.</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
