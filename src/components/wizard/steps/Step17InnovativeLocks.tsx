"use client";

import { useWishContext } from "@/lib/WishContext";
import { Clock, SmilePlus, Hand } from "lucide-react";

export function Step17InnovativeLocks() {
    const { wishData, updateWishData } = useWishContext();

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                    Viral Features
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-4">Make It Unforgettable.</h2>
                <p className="text-foreground/60 text-lg">
                    Add world-first interactive locks that nobody else has seen before. Surprise them completely.
                </p>
            </div>

            <div className="space-y-6">

                {/* 1. Time Capsule Countdown */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                        <Clock className="w-24 h-24 text-primary" />
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">The Time Capsule Lock</h3>
                            <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                                Don't let them peek! Select an exact date and time. If they open the link early, they will be blocked by a live ticking countdown clock building massive anticipation.
                            </p>

                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2 block">
                                Unlock Date & Time (Optional)
                            </label>
                            <input
                                type="datetime-local"
                                value={wishData.unlockDate || ""}
                                onChange={(e) => updateWishData({ unlockDate: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                            />
                            {wishData.unlockDate && (
                                <button
                                    onClick={() => updateWishData({ unlockDate: "" })}
                                    className="text-xs text-rose-400 mt-2 hover:underline"
                                >
                                    Remove Time Lock
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Smile to Unlock */}
                <div
                    onClick={() => updateWishData({ requireSmileToUnlock: !wishData.requireSmileToUnlock })}
                    className={`glass-panel p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                        ${wishData.requireSmileToUnlock ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/30'}
                    `}
                >
                    <div className="flex gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                            ${wishData.requireSmileToUnlock ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}
                        `}>
                            <SmilePlus className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white mb-2">"Smile-To-Unlock" Camera</h3>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    ${wishData.requireSmileToUnlock ? 'border-primary bg-primary' : 'border-white/20'}
                                `}>
                                    {wishData.requireSmileToUnlock && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                            </div>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Force them to have a positive physical reaction! To view your final "Future Promise", our lightweight on-device AI will use their front camera and force them to physically smile wide to shatter the lock.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Scratch-Off Reveal */}
                <div
                    onClick={() => updateWishData({ showAsScratchOff: !wishData.showAsScratchOff })}
                    className={`glass-panel p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                        ${wishData.showAsScratchOff ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/30'}
                    `}
                >
                    <div className="flex gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                            ${wishData.showAsScratchOff ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}
                        `}>
                            <Hand className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white mb-2">The Foil Scratch-Off Reveal</h3>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    ${wishData.showAsScratchOff ? 'border-primary bg-primary' : 'border-white/20'}
                                `}>
                                    {wishData.showAsScratchOff && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                            </div>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Instead of just reading your Future Promise, it will be hidden behind a digital silver-foil lottery ticket! They will have to literally rub their screen or use their mouse to scratch it away and reveal the message underneath.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
