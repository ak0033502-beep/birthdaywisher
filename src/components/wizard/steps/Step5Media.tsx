"use client";

import { useWishContext } from "@/lib/WishContext";
import { Image as ImageIcon, Video, Loader2, X, Plus, UploadCloud } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_PHOTOS = 5;
const MAX_VIDEOS = 3;

interface UploadProgress {
    percentage: number;
    speedText: string;
    timeLeftText: string;
    uploadedMB: string;
    totalMB: string;
}

export function Step5Media() {
    const { wishData, updateWishData } = useWishContext();
    const [isUploading, setIsUploading] = useState(false);

    // Progress Tracking State
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const photosCount = wishData.mediaItems.filter(i => i.type === "photo").length;
    const videosCount = wishData.mediaItems.filter(i => i.type === "video").length;

    // Helper to format bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 MB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Helper to format remaining time
    const formatTimeLeft = (seconds: number) => {
        if (!isFinite(seconds) || seconds < 0) return "Calculating...";
        if (seconds < 60) return `${Math.ceil(seconds)} seconds left`;
        const mins = Math.floor(seconds / 60);
        const secs = Math.ceil(seconds % 60);
        return `${mins}m ${secs}s left`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Filter and validate files BEFORE starting upload
        const validFiles = [];
        let pCount = photosCount;
        let vCount = videosCount;
        let totalSize = 0;

        for (const file of files) {
            const isVideo = file.type.startsWith("video/");
            if (isVideo && vCount >= MAX_VIDEOS) {
                alert(`Maximum ${MAX_VIDEOS} videos allowed. Skipping ${file.name}.`);
                continue;
            }
            if (!isVideo && pCount >= MAX_PHOTOS) {
                alert(`Maximum ${MAX_PHOTOS} photos allowed. Skipping ${file.name}.`);
                continue;
            }
            if (file.size > 25 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Max 25MB.`);
                continue;
            }

            validFiles.push(file);
            totalSize += file.size;
            if (isVideo) vCount++;
            else pCount++;
        }

        if (validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploading(true);
        setProgress({
            percentage: 0,
            speedText: "Calculating...",
            timeLeftText: "Estimating...",
            uploadedMB: "0 MB",
            totalMB: formatBytes(totalSize)
        });

        const newItems = [...wishData.mediaItems];

        try {
            // Fetch Signature Once
            const signRes = await fetch("/api/cloudinary-sign");
            if (!signRes.ok) throw new Error("Failed to initialize secure upload");
            const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

            // Sequential upload with global progress tracking
            let overallUploadedBytes = 0;
            const startTime = Date.now();
            let lastSpeedUpdate = Date.now();
            let bytesSinceLastUpdate = 0;
            let currentSpeed = 0; // Bytes per millisecond

            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];
                const isVideo = file.type.startsWith("video/");

                const formData = new FormData();
                formData.append("api_key", String(apiKey));
                formData.append("timestamp", String(timestamp));
                formData.append("signature", String(signature));
                formData.append("folder", String(folder));
                formData.append("file", file);

                // Start chunk byte count for this specific file
                let fileUploadedBytes = 0;

                const url = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhrRef.current = xhr;

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const now = Date.now();
                            const newlyUploaded = event.loaded - fileUploadedBytes;
                            fileUploadedBytes = event.loaded;

                            // Update global trackers
                            overallUploadedBytes += newlyUploaded;
                            bytesSinceLastUpdate += newlyUploaded;

                            // Recalculate speed every 500ms for smoothness
                            const timeSinceUpdate = now - lastSpeedUpdate;
                            if (timeSinceUpdate > 500) {
                                currentSpeed = bytesSinceLastUpdate / timeSinceUpdate; // bytes per ms
                                lastSpeedUpdate = now;
                                bytesSinceLastUpdate = 0;
                            }

                            const percent = Math.round((overallUploadedBytes / totalSize) * 100);

                            // Calculate remaining bytes and time
                            const remainingBytes = totalSize - overallUploadedBytes;

                            // Speed in ms to Seconds
                            const speedBytesPerSec = currentSpeed * 1000;
                            let secondsLeft = remainingBytes / speedBytesPerSec;

                            // Calculate Speed Text
                            let speedText = "Calculating...";
                            if (speedBytesPerSec > 0) {
                                speedText = `${(speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
                            }

                            setProgress({
                                percentage: Math.min(percent, 99), // Keep it at 99% until fully processed by Cloudinary
                                speedText,
                                timeLeftText: formatTimeLeft(secondsLeft),
                                uploadedMB: formatBytes(overallUploadedBytes),
                                totalMB: formatBytes(totalSize)
                            });
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response.secure_url);
                            } catch (e) {
                                reject(new Error("Invalid JSON response from server"));
                            }
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error("Network error during upload"));
                    xhr.onabort = () => reject(new Error("Upload aborted by user"));

                    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);
                    xhr.send(formData);
                });

                newItems.push({
                    url,
                    type: isVideo ? "video" : "photo"
                });
            }

            // Successfully finished all
            // Small artificial delay to show 100% completion state nicely
            setProgress(prev => prev ? { ...prev, percentage: 100, speedText: "Processing complete", timeLeftText: "Done!" } : null);
            await new Promise(r => setTimeout(r, 800));
            updateWishData({ mediaItems: newItems });

        } catch (error: any) {
            console.error("Upload error:", error);
            if (error.message !== "Upload aborted by user") {
                alert(`Failed to upload media: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsUploading(false);
            setProgress(null);
            xhrRef.current = null;
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const cancelUpload = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
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

                <AnimatePresence mode="popLayout">
                    {/* Active Upload Progress UI */}
                    {isUploading && progress && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            className="bg-black/30 border border-primary/30 rounded-2xl p-6 mb-8 relative overflow-hidden backdrop-blur-md"
                        >
                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <div>
                                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                        <UploadCloud className="w-5 h-5 text-primary animate-bounce" />
                                        Uploading Vault Data...
                                    </h4>
                                    <p className="text-sm text-foreground/60 mt-1">
                                        {progress.timeLeftText} • {progress.speedText}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                        {progress.percentage}%
                                    </span>
                                    <p className="text-xs text-foreground/50 font-mono mt-1">
                                        {progress.uploadedMB} / {progress.totalMB}
                                    </p>
                                </div>
                            </div>

                            {/* Main Progress Bar Container */}
                            <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden mb-4 relative z-10 shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.percentage}%` }}
                                    transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                                    style={{ backgroundSize: '200% 100%' }}
                                >
                                    {/* Shimmer effect on bar */}
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </motion.div>
                            </div>

                            <button
                                onClick={cancelUpload}
                                className="relative z-10 text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider"
                            >
                                Cancel Upload
                            </button>

                            {/* Background ambient glow based on progress */}
                            <div
                                className="absolute top-1/2 left-0 right-0 h-full bg-primary/10 blur-[50px] pointer-events-none -z-0 transition-opacity duration-1000"
                                style={{ opacity: progress.percentage / 100 }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    disabled={isUploading}
                                    className={`absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {(photosCount < MAX_PHOTOS || videosCount < MAX_VIDEOS) && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-primary/50 transition-all group ${isUploading ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                            >
                                <Plus className="w-8 h-8 text-white/50 group-hover:text-primary transition-colors" />
                            </button>
                        )}
                    </div>
                )}

                {wishData.mediaItems.length === 0 && !isUploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-primary/50 transition-all group"
                    >
                        <div className="flex gap-4 mb-4">
                            <ImageIcon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                            <Video className="w-12 h-12 text-secondary group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="font-medium text-lg">Upload Photos & Videos</span>
                        <span className="text-sm text-foreground/50 mt-2">You can select multiple files at once. Max 25MB each.</span>
                    </button>
                )}
            </div>
        </div>
    );
}
