"use client";

import { useWishContext } from "@/lib/WishContext";
import { Image as ImageIcon, Video, Loader2, X, Plus } from "lucide-react";
import { useState, useRef } from "react";

const MAX_PHOTOS = 5;
const MAX_VIDEOS = 3;

export function Step5Media() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photosCount = wishData.mediaItems.filter(i => i.type === "photo").length;
    const videosCount = wishData.mediaItems.filter(i => i.type === "video").length;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const newItems = [...wishData.mediaItems];

            for (const file of files) {
                const isVideo = file.type.startsWith("video/");

                // Constraints check
                const currentPhotos = newItems.filter(i => i.type === "photo").length;
                const currentVideos = newItems.filter(i => i.type === "video").length;

                if (isVideo && currentVideos >= MAX_VIDEOS) {
                    alert(`Maximum ${MAX_VIDEOS} videos allowed.`);
                    continue;
                }
                if (!isVideo && currentPhotos >= MAX_PHOTOS) {
                    alert(`Maximum ${MAX_PHOTOS} photos allowed.`);
                    continue;
                }
                if (file.size > 25 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Max 25MB.`);
                    continue;
                }

                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    console.error("Upload failed for", file.name);
                    continue;
                }

                const data = await res.json();
                newItems.push({
                    url: data.url,
                    type: isVideo ? "video" : "photo"
                });
            }

            updateWishData({ mediaItems: newItems });
        } catch (error) {
            console.error(error);
            alert("Failed to upload some media. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeMedia = (index: number) => {
        const newItems = [...wishData.mediaItems];
        newItems.splice(index, 1);
        updateWishData({ mediaItems: newItems });
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Memory Vault 📸</h2>
                <p className="text-foreground/60 text-lg">
                    Build a beautiful gallery. Upload up to {MAX_PHOTOS} photos and {MAX_VIDEOS} videos.
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm font-medium">
                    <span className={photosCount >= MAX_PHOTOS ? "text-red-400" : "text-primary"}>
                        <ImageIcon className="w-4 h-4 inline mr-1" /> {photosCount} / {MAX_PHOTOS} Photos
                    </span>
                    <span className={videosCount >= MAX_VIDEOS ? "text-red-400" : "text-secondary"}>
                        <Video className="w-4 h-4 inline mr-1" /> {videosCount} / {MAX_VIDEOS} Videos
                    </span>
                </div>
            </div>

            <div className="mt-4">
                <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading}
                />

                {wishData.mediaItems.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {wishData.mediaItems.map((item, idx) => (
                            <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 group bg-black/50 aspect-square">
                                {item.type === "photo" ? (
                                    <img src={item.url} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <video src={item.url} className="w-full h-full object-cover" />
                                )}

                                {item.type === "video" && (
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase font-bold text-white flex items-center gap-1">
                                        <Video className="w-3 h-3" /> Video
                                    </div>
                                )}

                                <button
                                    onClick={() => removeMedia(idx)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {(photosCount < MAX_PHOTOS || videosCount < MAX_VIDEOS) && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex flex-col items-center justify-center aspect-square rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-primary/50 transition-all group"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                ) : (
                                    <Plus className="w-8 h-8 text-white/50 group-hover:text-primary transition-colors" />
                                )}
                            </button>
                        )}
                    </div>
                )}

                {wishData.mediaItems.length === 0 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-primary/50 transition-all group"
                    >
                        {isUploading ? (
                            <Loader2 className="w-12 h-12 text-primary mb-4 animate-spin group-hover:scale-110 transition-transform" />
                        ) : (
                            <div className="flex gap-4 mb-4">
                                <ImageIcon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                                <Video className="w-12 h-12 text-secondary group-hover:scale-110 transition-transform" />
                            </div>
                        )}
                        <span className="font-medium text-lg">{isUploading ? "Uploading gallery..." : "Upload Photos & Videos"}</span>
                        <span className="text-sm text-foreground/50 mt-2">You can select multiple files at once. Max 25MB each.</span>
                    </button>
                )}
            </div>
        </div>
    );
}
