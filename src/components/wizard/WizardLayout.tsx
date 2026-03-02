"use client";

import { useWishContext } from "@/lib/WishContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Copy, CheckCircle2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WizardLayout({
    children,
    onNext,
    onPrev,
    disableNext = false,
    totalSteps = 20,
}: {
    children: React.ReactNode;
    onNext?: () => void;
    onPrev?: () => void;
    disableNext?: boolean;
    totalSteps?: number;
}) {
    const { currentStep, nextStep, prevStep, wishData } = useWishContext();
    const isAnniversary = wishData.wishType === "anniversary";
    const progressPercent = (currentStep / totalSteps) * 100;
    const isLastStep = currentStep === totalSteps;
    const router = useRouter();
    const [isGenerated, setIsGenerated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    const shareLink = typeof window !== "undefined" && generatedId
        ? `${window.location.origin}/wish/${generatedId}`
        : "";

    const handleNext = async () => {
        if (isLastStep) {
            setIsGenerating(true);
            try {
                // Post all context data to our backend
                const response = await fetch('/api/wish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(wishData),
                });

                const data = await response.json();
                if (data.id) {
                    setGeneratedId(data.id);
                    setIsGenerated(true);
                } else {
                    console.error("Failed to generate link.", data);
                    alert("Something went wrong creating the link.");
                }
            } catch (error) {
                console.error("Failed to submit wish data", error);
                alert("Something went wrong saving your wish.");
            } finally {
                setIsGenerating(false);
            }
            return;
        }
        if (onNext) onNext();
        nextStep();
    };

    const handlePrev = () => {
        if (onPrev) onPrev();
        prevStep();
    };

    const copyToClipboard = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="min-h-svh pt-20 sm:pt-24 pb-24 sm:pb-12 flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-background -z-20" />
            {isAnniversary ? (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-background to-pink-950/20 -z-19" />
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-[130px] -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[130px] -z-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[150px] -z-10" />
                </>
            ) : (
                <>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -z-10" />
                </>
            )}

            {/* Progress Bar Container */}
            <div className="fixed top-16 sm:top-20 left-0 right-0 z-40 px-4 sm:px-6 max-w-3xl mx-auto w-full">
                <div className="flex justify-between text-xs font-semibold text-foreground/50 mb-2">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${isAnniversary
                            ? "bg-gradient-to-r from-amber-500 via-pink-500 to-amber-400"
                            : "bg-gradient-to-r from-primary to-secondary"
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center container max-w-3xl mx-auto px-3 sm:px-6 mt-4 sm:mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <div className={`p-4 sm:p-6 md:p-10 rounded-2xl w-full ${isAnniversary
                            ? "glass-panel border border-amber-500/10"
                            : "glass-panel"
                            }`}>
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-6 bg-background/80 backdrop-blur-md border-t border-white/10 z-40 safe-bottom">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1 || isGenerated}
                        className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${currentStep === 1 || isGenerated
                            ? "opacity-50 cursor-not-allowed text-foreground/50"
                            : "text-foreground hover:bg-white/5 active:bg-white/10"
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={disableNext || isGenerated}
                        className={`flex items-center gap-1 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold relative overflow-hidden group transition-all text-sm sm:text-base ${disableNext || isGenerated ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                            }`}
                    >
                        <span className={`absolute inset-0 rounded-full ${isAnniversary
                            ? "bg-gradient-to-r from-amber-500 to-pink-500"
                            : "bg-gradient-to-r from-primary to-secondary"
                            }`} />
                        <span className="relative z-10 flex items-center gap-2 text-white">
                            {isLastStep ? (isGenerating ? "Generating..." : "Generate Link") : "Next Step"}
                            {isLastStep ? (
                                <Wand2 className={`w-5 h-5 transition-transform ${isGenerating ? "animate-pulse" : "group-hover:rotate-12"}`} />
                            ) : (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            )}
                        </span>
                    </button>
                </div>
            </div>

            {/* Generated Link Overlay */}
            <AnimatePresence>
                {isGenerated && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-background border border-white/10 shadow-2xl p-5 sm:p-8 rounded-3xl max-w-lg w-full text-center relative overflow-hidden glass-panel"
                        >
                            <div className={`absolute top-0 inset-x-0 h-1 ${isAnniversary
                                ? "bg-gradient-to-r from-amber-500 to-pink-500"
                                : "bg-gradient-to-r from-primary to-secondary"
                                }`} />

                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isAnniversary
                                ? "bg-amber-500/20"
                                : "bg-primary/20"
                                }`}>
                                <CheckCircle2 className={`w-10 h-10 ${isAnniversary ? "text-amber-500" : "text-primary"}`} />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Magic Created! ✨</h2>
                            <p className="text-foreground/70 mb-8 leading-relaxed">
                                Your personalized, interactive {isAnniversary ? "anniversary" : "birthday"} wish is ready. Send this unique link to them.
                                <br /><span className="text-xs text-secondary/80 font-bold mt-2 block">Note: This link will self-destruct 10 hours after they open it!</span>
                            </p>

                            <div className="flex items-center gap-2 p-3 bg-black/50 border border-white/10 rounded-xl mb-8">
                                <div className="truncate text-sm flex-1 text-left font-mono text-white/90 selec-all px-2">
                                    {shareLink}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-sm"
                                >
                                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            <button
                                onClick={() => router.push(`/wish/${generatedId}`)}
                                className="text-sm font-medium text-foreground/50 hover:text-white transition-colors underline underline-offset-4"
                            >
                                Preview it myself first
                            </button>

                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-6 border-t border-white/10 w-full">
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex-1 w-full px-4 py-3 rounded-xl text-sm font-semibold text-foreground/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                >
                                    ← Go Home
                                </button>
                                <a
                                    href="https://guesskaro.games/couples"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 w-full px-4 py-3 rounded-xl text-sm font-semibold text-center text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition-all"
                                >
                                    🎮 Play Couple Quiz Game
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
