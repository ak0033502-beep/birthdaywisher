"use client";

import { useState, useRef } from "react";
import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { Gift, Upload, X, Loader2, Check } from "lucide-react";

const giftCardOptions = [
    { id: "amazon", name: "Amazon", emoji: "🛒", color: "from-amber-500 to-orange-600" },
    { id: "flipkart", name: "Flipkart", emoji: "🛍️", color: "from-blue-500 to-indigo-600" },
    { id: "dineout", name: "Dineout", emoji: "🍽️", color: "from-red-500 to-rose-600" },
    { id: "myntra", name: "Myntra", emoji: "👗", color: "from-pink-500 to-fuchsia-600" },
    { id: "swiggy", name: "Swiggy", emoji: "🍔", color: "from-orange-500 to-red-500" },
    { id: "custom", name: "Custom PDF", emoji: "📄", color: "from-purple-500 to-violet-600" },
];

export function StepGiftCard() {
    const title = useStepTitle("StepGiftCard");
    const { wishData, updateWishData } = useWishContext();
    const [selectedType, setSelectedType] = useState(wishData.giftCardType || "");
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(wishData.giftCardUrl || "");
    const [message, setMessage] = useState(wishData.giftCardMessage || "");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSelect = (id: string) => {
        if (selectedType === id) {
            // Deselect
            setSelectedType("");
            updateWishData({ giftCardType: undefined, giftCardUrl: undefined, giftCardMessage: undefined });
            return;
        }
        setSelectedType(id);
        updateWishData({ giftCardType: id });
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "birthdaywisher");
            formData.append("folder", "gift_cards");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            if (data.secure_url) {
                setUploadedUrl(data.secure_url);
                updateWishData({ giftCardUrl: data.secure_url });
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleMessageChange = (val: string) => {
        setMessage(val);
        updateWishData({ giftCardMessage: val });
    };

    const removeUpload = () => {
        setUploadedUrl("");
        updateWishData({ giftCardUrl: undefined });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                    <Gift className="inline w-8 h-8 mr-2 align-middle" />
                    Attach a Gift Card 🎁
                </h2>
                <p className="text-foreground/60 text-lg">
                    Surprise them with a gift card! <span className="text-foreground/40">(Optional)</span>
                </p>
            </div>

            <div className="max-w-lg mx-auto w-full space-y-6">
                {/* Gift Card Type Selection */}
                <div className="grid grid-cols-3 gap-3">
                    {giftCardOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectedType === opt.id
                                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-2xl">{opt.emoji}</span>
                            <span className="text-xs font-bold">{opt.name}</span>
                            {selectedType === opt.id && <Check className="w-3 h-3 text-primary" />}
                        </button>
                    ))}
                </div>

                {/* Upload Section */}
                {selectedType && (
                    <div className="space-y-4">
                        {!uploadedUrl ? (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                                ) : (
                                    <Upload className="w-8 h-8 mx-auto text-foreground/30 mb-2" />
                                )}
                                <p className="text-sm font-medium text-foreground/50">
                                    {uploading ? "Uploading..." : "Upload gift card image or PDF"}
                                </p>
                                <p className="text-xs text-foreground/30 mt-1">PNG, JPG, or PDF (max 10MB)</p>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUpload(file);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="relative p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-green-400">Gift card uploaded!</p>
                                        <p className="text-xs text-foreground/40 truncate">{uploadedUrl}</p>
                                    </div>
                                    <button
                                        onClick={removeUpload}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Personal Message */}
                        <div>
                            <label className="text-sm font-medium text-foreground/50 mb-2 block">
                                Gift card message (optional)
                            </label>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => handleMessageChange(e.target.value)}
                                placeholder="e.g. Buy yourself something nice! 🎉"
                                maxLength={100}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {!selectedType && (
                    <p className="text-xs text-center text-foreground/30">
                        Skip this step if you don&apos;t want to attach a gift card
                    </p>
                )}
            </div>
        </div>
    );
}
