"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, MessageCircle, Mail, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareLink: string;
    recipientName: string;
}

export function ShareModal({ isOpen, onClose, shareLink, recipientName }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#ec4899', '#8b5cf6', '#06b6d4'] });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement("textarea");
            ta.value = shareLink;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareWhatsApp = () => {
        const message = encodeURIComponent(
            `🎂 I made a special birthday wish for you, ${recipientName}! Open it here:\n\n${shareLink}\n\n✨ Made with love on BirthdayWisher.fun`
        );
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

    const shareEmail = () => {
        const subject = encodeURIComponent(`🎂 A special birthday wish for ${recipientName}!`);
        const body = encodeURIComponent(
            `Hey ${recipientName}!\n\nI made something special just for you. Click the link below to see your birthday wish:\n\n${shareLink}\n\n✨ Made with love on BirthdayWisher.fun`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    };

    const shareNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `🎂 Birthday Wish for ${recipientName}`,
                    text: `I made a special birthday wish for you!`,
                    url: shareLink,
                });
            } catch {
                // User cancelled
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 relative"
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                                <Share2 className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Share Your Wish</h3>
                            <p className="text-foreground/50 text-sm mt-1">Send it to {recipientName} 💖</p>
                        </div>

                        {/* Link + Copy */}
                        <div className="flex items-center gap-2 p-3 bg-black/30 border border-white/10 rounded-xl mb-6">
                            <p className="text-xs font-mono text-white/80 truncate flex-1">{shareLink}</p>
                            <button
                                onClick={copyToClipboard}
                                className="p-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Share buttons */}
                        <div className="space-y-3">
                            {/* WhatsApp */}
                            <button
                                onClick={shareWhatsApp}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-sm">WhatsApp</p>
                                    <p className="text-xs text-foreground/40">Send directly via WhatsApp</p>
                                </div>
                                <span className="text-xs text-green-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            {/* Email */}
                            <button
                                onClick={shareEmail}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-sm">Email</p>
                                    <p className="text-xs text-foreground/40">Send via email</p>
                                </div>
                                <span className="text-xs text-blue-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            {/* Native Share (if available) */}
                            {typeof navigator !== "undefined" && "share" in navigator && (
                                <button
                                    onClick={shareNative}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
                                        <Share2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-sm">More Options</p>
                                        <p className="text-xs text-foreground/40">Instagram, Telegram, etc.</p>
                                    </div>
                                    <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
