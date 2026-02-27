"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { ScratchCard } from "@/components/story/ScratchCard";
import { SmileLock } from "@/components/story/SmileLock";
import { LockTimer } from "@/components/story/LockTimer";
import { ChevronRight, Heart, Star, Sparkles, Trophy, Quote, ScrollText, Lock, Unlock, HelpCircle, PartyPopper, Mic, Image as ImageIcon, Video, Puzzle, Mail } from "lucide-react";

// Theme map defines how every element of the story should look based on the chosen preview style
// REDESIGNED for Cinematic Glassmorphism and Deep Mesh Gradients
const themeStyles: Record<string, Record<string, string>> = {
    neon: {
        bg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-zinc-950 to-black",
        container: "bg-black/40 backdrop-blur-xl text-white border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.1)]",
        accent: "text-pink-500 text-shadow-[0_0_20px_rgba(236,72,153,0.5)]",
        accentBg: "bg-pink-500/20 border border-pink-500/30",
        gradientText: "bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400",
        card: "bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl",
        font: "font-sans",
        progress: "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]",
        iconFill: "fill-pink-500/20",
        roastGradient: "from-pink-500 via-purple-500 to-cyan-500",
        input: "bg-black/50 border-pink-500/50 focus:border-pink-400 text-white backdrop-blur-md"
    },
    elegant: {
        bg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-black to-zinc-950",
        container: "bg-black/60 backdrop-blur-xl text-yellow-50 border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.1)]",
        accent: "text-yellow-400 text-shadow-[0_0_15px_rgba(234,179,8,0.3)]",
        accentBg: "bg-yellow-500/10 border border-yellow-500/20",
        gradientText: "bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600",
        card: "bg-zinc-900/50 border border-yellow-500/20 backdrop-blur-md shadow-2xl",
        font: "font-serif",
        progress: "bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
        iconFill: "fill-yellow-400/10",
        roastGradient: "from-amber-600 via-yellow-500 to-yellow-700",
        input: "bg-black/50 border-yellow-500/30 focus:border-yellow-400 text-white backdrop-blur-md"
    },
    pastel: {
        bg: "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-teal-100 to-violet-100",
        container: "bg-white/40 backdrop-blur-xl text-slate-800 border-white shadow-2xl",
        accent: "text-rose-500",
        accentBg: "bg-white/50 border border-rose-200",
        gradientText: "bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400",
        card: "bg-white/60 border border-white backdrop-blur-md shadow-xl",
        font: "font-sans tracking-tight",
        progress: "bg-rose-400",
        iconFill: "fill-rose-200",
        roastGradient: "from-rose-300 via-fuchsia-300 to-indigo-300",
        input: "bg-white/50 border border-white focus:border-rose-300 text-slate-800 backdrop-blur-md"
    },
    monochrome: {
        bg: "bg-gradient-to-b from-zinc-800 to-zinc-950",
        container: "bg-zinc-900/80 backdrop-blur-xl text-white border-white/5 shadow-2xl",
        accent: "text-white",
        accentBg: "bg-white/10 border border-white/20",
        gradientText: "bg-gradient-to-b from-white to-zinc-400",
        card: "bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl",
        font: "font-serif tracking-widest uppercase",
        progress: "bg-white",
        iconFill: "fill-white/10",
        roastGradient: "from-zinc-400 via-zinc-600 to-zinc-800",
        input: "bg-black/50 border-zinc-700 focus:border-white text-white backdrop-blur-md"
    },
    paper: {
        bg: "bg-[#d4c5b0] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]",
        container: "bg-[#fdfbf7]/90 backdrop-blur-sm text-[#3e3222] border-[#d4c5b0] shadow-2xl",
        accent: "text-[#8b3a3a]",
        accentBg: "bg-[#8b3a3a]/10 border border-[#8b3a3a]/20",
        gradientText: "bg-gradient-to-br from-[#8b3a3a] to-[#5e2727]",
        card: "bg-[#fdfbf7] border border-[#d4c5ab] shadow-[10px_10px_30px_rgba(0,0,0,0.1)]",
        font: "font-serif",
        progress: "bg-[#8b3a3a]",
        iconFill: "fill-[#8b3a3a]/10",
        roastGradient: "from-[#8b3a3a] to-[#5e2727]",
        input: "bg-transparent border-b-2 border-dashed border-[#8b3a3a]/50 focus:border-[#8b3a3a] text-[#3e3222] rounded-none px-0"
    }
};

export function StoryViewer({ data }: { data: WishData }) {
    const [envelopeOpened, setEnvelopeOpened] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [shakeError, setShakeError] = useState(false);

    // Locks
    const [dateGuess, setDateGuess] = useState("");
    const [dateUnlocked, setDateUnlocked] = useState(!data.secretDate);
    const [dateMsg, setDateMsg] = useState("");

    const [slidingPuzzleUnlocked, setSlidingPuzzleUnlocked] = useState(!data.puzzleImageUrl);

    const [quiz1Guess, setQuiz1Guess] = useState("");
    const [quiz1Unlocked, setQuiz1Unlocked] = useState(!data.quizQ1);
    const [quiz1Msg, setQuiz1Msg] = useState("");

    const [quiz2Guess, setQuiz2Guess] = useState("");
    const [quiz2Unlocked, setQuiz2Unlocked] = useState(!data.quizQ2);
    const [quiz2Msg, setQuiz2Msg] = useState("");

    const t = themeStyles[data.theme || "neon"] || themeStyles["neon"];

    const errorMessages = ["Oops, that's not it! Try again, love.", "Haha, nope! Think harder! 🧐", "Are you sure? 🥺", "Wrong! But you're still cute.", "Not quite! Memory failing you? 🤭"];
    const successMessages = ["Aww, you got it! ❤️", "Look at you go! 🎉", "Perfect memory! 🥰", "That's my favorite! 💖", "Yesss! You're the best! 🌟"];
    const getRandomMsg = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    // Normalized guess checker
    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            setDateMsg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } else {
            setDateMsg(getRandomMsg(errorMessages));
            triggerError();
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            setQuiz1Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } else {
            setQuiz1Msg(getRandomMsg(errorMessages));
            triggerError();
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            setQuiz2Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } else {
            setQuiz2Msg(getRandomMsg(errorMessages));
            triggerError();
        }
    };

    const triggerError = () => {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
    };

    // Cleaned up floatingTexts as it's now handled by the new Constellation system

    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-3 sm:px-6 ${t.font}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className={`w-20 h-20 ${t.accentBg} rounded-full flex items-center justify-center mb-6`}>
                        <Sparkles className={`w-10 h-10 ${t.accent}`} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`text-5xl lg:text-7xl font-bold bg-clip-text text-transparent ${t.gradientText} mb-6 leading-tight drop-shadow-2xl`}
                    >
                        Happy Birthday,<br /> {data.nickname || data.targetName}!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ delay: 0.8, duration: 1.5 }}
                        className="text-2xl opacity-80 font-medium"
                    >
                        Turning {data.targetAge} looks <span className={`${t.accent} font-bold italic`}>good</span> on you.
                    </motion.p>
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-3 sm:px-6 ${t.font}`}>
                    <motion.div initial={{ opacity: 0, scale: 0.5, rotateY: 180 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1.5, type: "spring", bounce: 0.4 }} className="mb-6">
                        <Heart className={`w-20 h-20 ${t.accent} ${t.iconFill} drop-shadow-2xl`} />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
                        className="text-3xl sm:text-4xl font-black mb-4 tracking-tight"
                    >
                        To my favorite <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 2 }} className={`capitalize ${t.accent}`}>{data.relationship?.replace("-", " ")}</motion.span>...
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.5 }} className="text-xl opacity-60">
                        Get ready for a little trip down memory lane.
                    </motion.p>
                </div>
            )
        },
        // Slide 2: Roast Meter
        {
            id: "roast",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-4 sm:px-8 ${t.font}`}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8">The Roast Meter 🔥</h2>
                    <p className="text-xl mb-6 opacity-80">I set the vibe meter for this to...</p>

                    <div className="relative h-6 bg-black/10 rounded-full overflow-hidden mb-4 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.roastLevel}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${t.roastGradient}`}
                        />
                    </div>
                    <div className="flex justify-between text-sm font-bold opacity-50">
                        <span>0% (Pure Toast)</span>
                        <span>100% (Savage)</span>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }} className={`mt-8 text-center text-4xl font-black ${t.accent}`}>
                        {data.roastLevel}% {data.roastLevel > 50 ? "ROAST!" : "TOAST!"}
                    </motion.div>
                </div>
            )
        },
        // Slide 3: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-4 sm:px-8 ${t.font}`}>
                    <h2 className="text-4xl font-bold mb-8 leading-tight">Things I absolutely love about you...</h2>
                    <div className="flex flex-col gap-4">
                        {data.quirks.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.3, type: "spring" }}
                                className={`px-6 py-4 rounded-2xl border font-medium text-lg flex items-center gap-3 ${t.card}`}
                            >
                                <Star className={`w-5 h-5 shrink-0 ${t.accent}`} />
                                <span>{q}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )
        },
        // Slide 4: Memory Tale
        {
            id: "tale",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-4 sm:px-8 relative overflow-hidden ${t.font}`}>
                    <Quote className="absolute top-10 left-4 w-32 h-32 opacity-5 -z-10" />
                    <h2 className={`text-3xl font-bold mb-8 ${t.accent}`}>Remember that time...</h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-2xl leading-relaxed italic font-serif opacity-90"
                    >
                        &quot;{data.memoryTale}&quot;
                    </motion.div>
                </div>
            )
        },
        // Slide 4.5: Multiple Media Gallery (Cinematic Polaroid Scrapbook)
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center h-full px-4 overflow-hidden perspective-[1000px] bg-black/5 ${t.font}`}>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                        className={`text-3xl font-bold mb-8 z-20 drop-shadow-lg text-center ${t.accent}`}
                    >
                        {idx === 0 ? "A Little Memory..." : "And another one..."}
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateZ: (Math.random() - 0.5) * 40, y: 100 }}
                        animate={{ opacity: 1, scale: 1, rotateZ: (Math.random() - 0.5) * 10, y: 0 }}
                        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                        whileHover={{ scale: 1.05, rotateZ: 0, zIndex: 50 }}
                        className="w-[90%] max-w-sm bg-white p-4 pb-16 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex-shrink-0"
                    >
                        <div className="w-full aspect-square bg-black overflow-hidden relative">
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.url} alt={`Memory ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                        </div>
                        {/* Tape effect */}
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm rotate-[-2deg]"></div>
                    </motion.div>
                </div>
            )
        })) :
            // Fallback for legacy database entries seamlessly
            (data.mediaUrl ? [{
                id: "media-legacy",
                locked: false,
                content: (
                    <div className={`flex flex-col items-center justify-center h-full px-4 overflow-hidden perspective-[1000px] bg-black/5 ${t.font}`}>
                        <h2 className={`text-3xl font-bold mb-8 z-20 drop-shadow-lg ${t.accent}`}>A Little Memory...</h2>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateZ: -5, y: 100 }}
                            animate={{ opacity: 1, scale: 1, rotateZ: 3, y: 0 }}
                            transition={{ duration: 1.2, type: "spring" }}
                            className="w-[90%] max-w-sm bg-white p-4 pb-16 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                        >
                            <div className="w-full aspect-square bg-black overflow-hidden relative">
                                {data.mediaType === "video" ? (
                                    <video src={data.mediaUrl} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={data.mediaUrl} alt="Memory" className="absolute inset-0 w-full h-full object-cover" />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )
            }] : [])),
        // Slide 5: Secret Date (PUZZLE)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 bg-black/5 ${t.font}`}>
                    {!dateUnlocked ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="w-full flex flex-col items-center perspective-[1000px]"
                        >
                            <motion.div animate={shakeError ? { x: [-15, 15, -15, 15, 0], rotateZ: [-10, 10, -10, 10, 0] } : {}} className="relative mb-8">
                                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 data-[error=true]:opacity-50 transition-opacity" data-error={shakeError}></div>
                                <div className={`w-24 h-24 rounded-3xl ${t.card} flex items-center justify-center border-t-2 border-l-2 bg-gradient-to-br from-white/20 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>
                                    <Lock className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Memory Vault</h2>
                            <p className="text-lg opacity-80 mb-8">Enter our secret date to unlock the rest of the wish. 🤫</p>

                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full relative z-50 pointer-events-auto">
                                <input
                                    type="date"
                                    value={dateGuess}
                                    onChange={(e) => setDateGuess(e.target.value)}
                                    className={`w-full p-5 rounded-2xl text-xl font-bold outline-none border transition-all mb-4 text-center shadow-inner ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockDate}
                                    className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Unlock 🔓
                                </button>
                                {dateMsg && <p className={`mt-4 text-sm font-bold animate-pulse text-red-400`}>{dateMsg}</p>}
                                <LockTimer durationSeconds={60} onAutoUnlock={() => { setDateUnlocked(true); setDateMsg("Time's up! Here it is..."); confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); }} />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0, rotateY: 180 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-3xl ${t.accentBg} flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)]`}>
                                <Unlock className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 opacity-80">{dateMsg || "You remembered!"}</h2>
                            <div className={`text-6xl font-black text-transparent bg-clip-text ${t.gradientText} py-4 drop-shadow-2xl`}>
                                {data.secretDate}
                            </div>
                        </motion.div>
                    )}
                </div>
            )
        },
        // Slide 5.5: Sliding Puzzle
        ...(data.puzzleImageUrl ? [{
            id: "slidingpuzzle",
            locked: !slidingPuzzleUnlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-3 sm:px-6 bg-black/5 ${t.font}`}>
                    {!slidingPuzzleUnlocked ? (
                        <motion.div className="w-full flex flex-col items-center pointer-events-auto relative z-50">
                            <motion.div animate={shakeError ? { x: [-15, 15, -15, 15, 0], rotateZ: [-10, 10, -10, 10, 0] } : {}} className="relative mb-6">
                                <div className={`w-20 h-20 rounded-3xl ${t.card} flex items-center justify-center border-t-2 border-l-2 bg-gradient-to-br from-white/20 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>
                                    <Puzzle className={`w-10 h-10 ${t.accent}`} strokeWidth={1.5} />
                                </div>
                            </motion.div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 drop-shadow-md">Picture Puzzle! 🧩</h2>
                            <p className="text-lg opacity-80 mb-8 max-w-xs leading-tight">Tap adjacent tiles to slide and unscramble the image!</p>

                            <div className={`w-full max-w-[320px] p-2 rounded-2xl ${t.card} shadow-2xl`}>
                                <SlidingPuzzle
                                    imageUrl={data.puzzleImageUrl}
                                    t={t}
                                    onSolve={() => {
                                        setSlidingPuzzleUnlocked(true);
                                        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#ec4899', '#eab308', '#06b6d4'] });
                                    }}
                                />
                            </div>
                            <LockTimer durationSeconds={60} onAutoUnlock={() => { setSlidingPuzzleUnlocked(true); confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); }} label="Skipping in" />
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0, rotateY: 180 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="flex flex-col items-center w-full perspective-[1000px]">
                            <div className={`w-20 h-20 rounded-3xl ${t.accentBg} flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)]`}>
                                <Unlock className={`w-10 h-10 ${t.accent}`} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black mb-6 drop-shadow-lg">Puzzle Solved!</h2>
                            <motion.div
                                initial={{ rotateZ: -5, y: 50 }} animate={{ rotateZ: 2, y: 0 }} transition={{ type: "spring" }}
                                className="w-[90%] max-w-sm bg-white p-4 pb-16 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                            >
                                <div className="w-full aspect-square bg-black overflow-hidden relative">
                                    <img src={data.puzzleImageUrl} alt="Solved Memory" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm rotate-[-2deg]"></div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            )
        }] : []),
        // Slide 6: Quiz 1 (PUZZLE)
        ...(data.quizQ1 ? [{
            id: "quiz1",
            locked: !quiz1Unlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 bg-black/5 ${t.font}`}>
                    {!quiz1Unlocked ? (
                        <motion.div className="w-full flex flex-col items-center pointer-events-auto relative z-50 perspective-[1000px]">
                            <motion.div animate={shakeError ? { x: [-15, 15, -15, 15, 0], rotateZ: [-10, 10, -10, 10, 0] } : {}} className="relative mb-8">
                                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 data-[error=true]:opacity-50 transition-opacity" data-error={shakeError}></div>
                                <div className={`w-24 h-24 rounded-3xl ${t.card} flex items-center justify-center border-t-2 border-l-2 bg-gradient-to-br from-white/20 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>
                                    <HelpCircle className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Quiz Time! 🧠</h2>
                            <div className={`p-6 rounded-3xl w-full mb-8 font-medium text-xl shadow-xl ${t.card} border-t border-l bg-gradient-to-br from-white/10 to-transparent`}>
                                &quot;{data.quizQ1}&quot;
                            </div>
                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full">
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={quiz1Guess}
                                    onChange={(e) => setQuiz1Guess(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockQuiz1()}
                                    className={`w-full p-5 rounded-2xl text-lg font-bold outline-none border transition-all mb-4 text-center shadow-inner ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockQuiz1}
                                    className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Submit
                                </button>
                                {quiz1Msg && <p className={`mt-4 text-sm font-bold animate-pulse text-red-400`}>{quiz1Msg}</p>}
                                <LockTimer durationSeconds={60} onAutoUnlock={() => { setQuiz1Unlocked(true); setQuiz1Msg("Time's up! Let me show you..."); confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); }} />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0, rotateY: 180 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-3xl ${t.accentBg} flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)]`}>
                                <CheckIcon className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">{quiz1Msg || "Spot on!"}</h2>
                            <div className={`p-8 rounded-3xl font-medium text-2xl opacity-90 ${t.card} shadow-2xl`}>
                                &quot;{data.quizA1}&quot;
                            </div>
                        </motion.div>
                    )}
                </div>
            )
        }] : []),
        // Slide 7: Quiz 2 (PUZZLE)
        ...(data.quizQ2 ? [{
            id: "quiz2",
            locked: !quiz2Unlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 bg-black/5 ${t.font}`}>
                    {!quiz2Unlocked ? (
                        <motion.div className="w-full flex flex-col items-center pointer-events-auto relative z-50 perspective-[1000px]">
                            <motion.div animate={shakeError ? { x: [-15, 15, -15, 15, 0], rotateZ: [-10, 10, -10, 10, 0] } : {}} className="relative mb-8">
                                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 data-[error=true]:opacity-50 transition-opacity" data-error={shakeError}></div>
                                <div className={`w-24 h-24 rounded-3xl ${t.card} flex items-center justify-center border-t-2 border-l-2 bg-gradient-to-br from-white/20 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>
                                    <HelpCircle className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <h2 className="text-2xl sm:text-3xl font-bold mb-6">One more question! 🫣</h2>
                            <div className={`p-6 rounded-3xl w-full mb-8 font-medium text-xl shadow-xl ${t.card} border-t border-l bg-gradient-to-br from-white/10 to-transparent`}>
                                &quot;{data.quizQ2}&quot;
                            </div>
                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full">
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={quiz2Guess}
                                    onChange={(e) => setQuiz2Guess(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockQuiz2()}
                                    className={`w-full p-5 rounded-2xl text-lg font-bold outline-none border transition-all mb-4 text-center shadow-inner ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockQuiz2}
                                    className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Submit
                                </button>
                                {quiz2Msg && <p className={`mt-4 text-sm font-bold animate-pulse text-red-400`}>{quiz2Msg}</p>}
                                <LockTimer durationSeconds={60} onAutoUnlock={() => { setQuiz2Unlocked(true); setQuiz2Msg("Time's up! Here's the answer..."); confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); }} />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0, rotateY: 180 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-3xl ${t.accentBg} flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)]`}>
                                <PartyPopper className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">{quiz2Msg || "You did it!"}</h2>
                            <div className={`text-3xl font-bold ${t.accent}`}>
                                You truly know me well!
                            </div>
                        </motion.div>
                    )}
                </div>
            )
        }] : []),
        // Slide 8: Award
        {
            id: "award",
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 bg-black/5 ${t.font}`}>
                    <motion.div
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.5 }}
                        className={`w-40 h-40 rounded-full flex items-center justify-center mb-10 border-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${t.accentBg} bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md`}
                    >
                        <Trophy className={`w-20 h-20 ${t.accent} drop-shadow-[0_0_15px_currentColor]`} strokeWidth={1.5} />
                    </motion.div>
                    <p className="text-xl opacity-80 mb-4 uppercase tracking-[0.2em] font-bold">You officially win:</p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className={`p-8 rounded-3xl ${t.card} border-t border-l bg-gradient-to-br from-white/10 to-transparent shadow-2xl w-full relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" />
                        <h2 className={`text-4xl font-black leading-tight ${t.gradientText} text-transparent bg-clip-text`}>
                            &quot;{data.awardTitle}&quot;
                        </h2>
                    </motion.div>
                </div>
            )
        },
        // Slide 8.5: Voice Note
        ...(data.audioUrl ? [{
            id: "voice",
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 bg-black/5 pointer-events-auto ${t.font}`}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-24 h-24 rounded-full ${t.card} flex items-center justify-center border-t border-l bg-gradient-to-br from-white/10 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-8`}
                    >
                        <Mic className={`w-12 h-12 ${t.accent} drop-shadow-[0_0_10px_currentColor]`} strokeWidth={1.5} />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-black mb-4 drop-shadow-md">Listen closely...</h2>
                    <p className="text-lg opacity-80 mb-10">Tap play to hear my voice.</p>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", delay: 0.3 }}
                        className={`relative z-50 w-full max-w-sm p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-l ${t.card} bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl`}
                    >
                        <audio controls src={data.audioUrl} className="w-full outline-none opacity-90" />
                    </motion.div>
                </div>
            )
        }] : []),
        // Slide 9: Gratitude
        {
            id: "gratitude",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-4 sm:px-8 bg-gradient-to-tr from-black/5 to-transparent ${t.font} relative overflow-hidden`}>
                    <Heart className={`absolute top-20 right-[-20%] w-96 h-96 ${t.iconFill} opacity-20 -z-10 rotate-12`} />
                    <h2 className={`text-3xl font-bold mb-10 flex items-center gap-4 ${t.accent} drop-shadow-md`}>
                        <div className={`p-3 rounded-2xl ${t.card} bg-white/10 backdrop-blur-md`}>
                            <Heart className="w-8 h-8" strokeWidth={2} />
                        </div>
                        I&apos;m so thankful...
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`text-3xl leading-relaxed font-serif italic ${t.card} p-8 rounded-3xl border-l-4 border-l-[${t.accent}] shadow-xl`}
                    >
                        &quot;...because {data.gratitudeText}&quot;
                    </motion.p>
                </div>
            )
        },
        // Slide 10: Core Message
        {
            id: "core",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-6 bg-black/5 ${t.font}`}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${t.card} border-t border-l mb-8 shadow-lg self-start backdrop-blur-md`}
                    >
                        <ScrollText className={`w-6 h-6 ${t.accent}`} strokeWidth={1.5} />
                        <span className="font-bold tracking-widest uppercase text-sm">Heart to Heart</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        className={`text-xl leading-relaxed whitespace-pre-wrap font-medium p-8 rounded-3xl ${t.card} border-t border-l shadow-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl relative overflow-y-auto max-h-[60vh] custom-scrollbar`}
                    >
                        {data.coreMessage}
                    </motion.div>
                </div>
            )
        },
        // Slide 11: Future Promise
        {
            id: "future",
            locked: false,
            content: (
                <div className={`flex flex-col items-center justify-center text-center h-full px-6 ${t.font} relative overflow-hidden w-full`}>
                    <Star className={`absolute top-20 left-[-10%] w-64 h-64 ${t.iconFill} opacity-20 -z-10 -rotate-12`} />
                    <h2 className={`text-3xl font-black mb-6 drop-shadow-md flex items-center gap-3 ${t.accent}`}>
                        <Sparkles className="w-8 h-8" /> My Promise <Sparkles className="w-8 h-8" />
                    </h2>

                    {(() => {
                        const content = (
                            <div className="w-full max-w-sm">
                                {data.showAsScratchOff ? (
                                    <div className="w-full aspect-[4/3] mb-4">
                                        <ScratchCard onUnlock={() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })}>
                                            <div className={`p-8 w-full h-full flex flex-col items-center justify-center ${t.card} bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl text-center`} style={{ borderRadius: 0 }}>
                                                <div className={`w-12 h-12 rounded-full ${t.accentBg} flex items-center justify-center border-t border-l shadow-lg mb-4`}>
                                                    <Heart className={`w-5 h-5 ${t.accent}`} fill="currentColor" />
                                                </div>
                                                <p className="text-xl md:text-2xl font-serif italic font-medium leading-relaxed drop-shadow-sm line-clamp-4">
                                                    &quot;{data.futurePromise}&quot;
                                                </p>
                                            </div>
                                        </ScratchCard>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                        transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
                                        className={`p-10 rounded-[2.5rem] border-t-2 border-l-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ${t.card} bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl relative w-full`}
                                    >
                                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${t.accentBg} flex items-center justify-center border-t border-l shadow-lg`}>
                                            <Heart className={`w-5 h-5 ${t.accent}`} fill="currentColor" />
                                        </div>
                                        <p className="text-2xl font-serif italic font-medium leading-relaxed mt-4 drop-shadow-sm">
                                            &quot;{data.futurePromise}&quot;
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        );

                        if (data.requireSmileToUnlock) {
                            return (
                                <div className="w-full max-w-sm pointer-events-auto z-50">
                                    <SmileLock onUnlock={() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ec4899'] })}>
                                        {content}
                                    </SmileLock>
                                </div>
                            );
                        }

                        return content;
                    })()}
                </div>
            )
        },
        // Slide 12: Finale
        {
            id: "finale",
            locked: false,
            content: <FinaleSlideContent data={data} t={t} />
        }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (slides[currentSlide].locked) {
            triggerError();
            return;
        }
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(s => s + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(s => s - 1);
        }
    };

    // PHADU CELEBRATION EFFECT (FIREWORKS)
    useEffect(() => {
        if (currentSlide === totalSlides - 1) {
            // Massive Celebration! Phadu!
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // Fire from both bottom edges
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] }));

            }, 250);

            // Center massive explosion
            setTimeout(() => {
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.6 },
                    colors: ['#ffe100', '#ff0055', '#3300ff', '#00ffaa']
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentSlide, totalSlides]);

    if (!envelopeOpened) {
        return (
            <div className={`w-full h-svh flex items-center justify-center ${t.bg} overflow-hidden relative perspective-[1000px]`}>
                {/* Ambient Particles */}
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://transparenttextures.com/patterns/stardust.png')]"></div>

                <motion.div
                    initial={{ y: 50, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                    onClick={() => {
                        setEnvelopeOpened(true);
                        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#ec4899', '#eab308', '#06b6d4'] });
                    }}
                >
                    <div className="relative w-80 h-52 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                        {/* Envelope Flap Lines */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 before:absolute before:inset-0 before:border-t-[100px] before:border-t-zinc-700/50 before:border-l-[160px] before:border-l-transparent before:border-r-[160px] before:border-r-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-0 after:absolute after:bottom-0 after:inset-x-0 after:border-b-[100px] after:border-b-zinc-800/80 after:border-l-[160px] after:border-l-transparent after:border-r-[160px] after:border-r-transparent"></div>

                        <div className="z-20 text-center px-4 mt-8">
                            <span className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Confidential</span>
                            <h2 className={`text-2xl font-serif text-white/90 truncate`}>To: {data.targetName}</h2>
                        </div>

                        {/* Wax Seal */}
                        <motion.div
                            className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full ${t.accentBg} shadow-xl border-2 border-white/20 flex items-center justify-center z-30 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition-shadow duration-500`}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <Heart className={`w-8 h-8 ${t.accent}`} fill="currentColor" />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 text-white/60 font-medium tracking-widest uppercase text-sm flex items-center gap-2"
                    >
                        Tap to unseal <ChevronRight className="w-4 h-4 animate-pulse" />
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center p-0 md:p-4 overflow-hidden select-none transition-colors duration-1000 ${t.bg}`}>
            {/* Cinematic background glow overlay */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

            {/* Base layer noise pattern to hold themes better */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Story Container (Locked aspect ratio on Desktop, full screen on mobile) */}
            <div className={`relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-[2.5rem] overflow-hidden border-0 md:border-[12px] md:border-black/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-colors duration-1000 ${t.container}`}>

                {/* Progress Bars */}
                <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
                    {Array.from({ length: totalSlides }).map((_, i) => {
                        const isLocked = slides[i].locked;
                        const isCurrent = i === currentSlide;

                        return (
                            <div key={i} className="h-1.5 flex-1 bg-black/10 rounded-full overflow-hidden backdrop-blur-md relative">
                                <motion.div
                                    className={`absolute inset-0 ${isLocked && isCurrent ? 'bg-red-500/80 animate-pulse' : t.progress} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                                    initial={{ width: i < currentSlide ? "100%" : "0%" }}
                                    animate={{ width: i === currentSlide ? (isLocked ? "30%" : "100%") : i < currentSlide ? "100%" : "0%" }}
                                    transition={{ duration: i === currentSlide ? (isLocked ? 0.5 : 8) : 0.2 }}
                                    onAnimationComplete={() => {
                                        // Auto advance if unlocked and animation finishes
                                        if (i === currentSlide && !isLocked) {
                                            if (currentSlide < totalSlides - 1) {
                                                // handleNext(); // Autoplay disabled for a better puzzle experience? 
                                                // Actually, if we want them to interact, we shouldn't autoplay too fast. Let's rely on manual taps.
                                            }
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Slides content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 z-10"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>

                {/* Visible Bottom Navigation Arrows */}
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none">
                    {/* Back button */}
                    <button
                        onClick={handlePrev}
                        className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === 0
                            ? "opacity-0 pointer-events-none"
                            : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"
                            }`}
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>

                    {/* Lock badge */}
                    {slides[currentSlide].locked && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-500/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold pointer-events-none"
                        >
                            <Lock className="w-3 h-3" /> Solve to continue
                        </motion.div>
                    )}

                    {/* Tap hint (only on first slide) */}
                    {currentSlide === 0 && !slides[currentSlide].locked && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ delay: 2, repeat: Infinity, duration: 2 }}
                            className="text-white/60 text-xs font-medium pointer-events-none"
                        >
                            Tap →
                        </motion.div>
                    )}

                    {/* Forward button */}
                    <button
                        onClick={handleNext}
                        className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${slides[currentSlide].locked
                            ? "bg-red-500/30 border-red-500/40 text-red-300 animate-pulse"
                            : currentSlide === totalSlides - 1
                                ? "opacity-0 pointer-events-none"
                                : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"
                            }`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FinaleSlideContent({ data, t }: { data: WishData; t: Record<string, string> }) {
    const [isHugging, setIsHugging] = useState(false);
    const [hugProgress, setHugProgress] = useState(0);

    // Audio playback on mount
    useEffect(() => {
        if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            audio.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [data.audioUrl]);

    // Haptic feedback loop during hold
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHugging) {
            interval = setInterval(() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setHugProgress(p => Math.min(100, p + 5));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isHugging]);

    const getFinalBgPhoto = () => {
        if (data.mediaItems && data.mediaItems.length > 0) {
            const photo = data.mediaItems.find(i => i.type === "photo");
            if (photo) return photo.url;
        }
        if (data.mediaUrl && data.mediaType === "photo") return data.mediaUrl;
        return null;
    };

    const finalBgUrl = getFinalBgPhoto();

    return (
        <div className={`relative flex flex-col items-center justify-center text-center h-full px-6 ${t.font} overflow-hidden w-full bg-black/5`}>
            {/* Heartbeat Photo Background */}
            {finalBgUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                    animate={{ opacity: 0.15, scale: [1, 1.05, 1], filter: 'blur(8px)' }}
                    transition={{
                        opacity: { duration: 3, delay: 1 },
                        filter: { duration: 3, delay: 1 },
                        scale: { duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                    }}
                    className="absolute inset-0 z-0 bg-cover bg-center mix-blend-luminosity"
                    style={{ backgroundImage: `url(${finalBgUrl})` }}
                />
            )}

            {/* Memory Constellation */}
            {data.quirks.concat([data.nickname || '']).filter(Boolean).map((text, i) => (
                <FloatingConstellation key={i} text={text} t={t} delay={i * 0.5} />
            ))}

            {/* Glowing Ticket to the Future */}
            <motion.div
                initial={{ y: 100, opacity: 0, rotateX: 45 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ type: "spring", bounce: 0.4, delay: 1 }}
                className={`relative z-10 w-full max-w-[340px] rounded-[2.5rem] p-8 backdrop-blur-2xl border-t-2 border-l-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden ${t.card} bg-gradient-to-br from-white/10 to-transparent`}
                style={{
                    background: isHugging ? 'linear-gradient(135deg, rgba(236,72,153,0.4), transparent)' : undefined,
                    borderColor: isHugging ? '#ec4899' : undefined,
                    boxShadow: isHugging ? '0 0 50px rgba(236,72,153,0.5)' : undefined,
                    transition: 'all 0.5s ease'
                }}
            >
                <div className="absolute top-0 right-0 p-6 opacity-30">
                    <PartyPopper className={`w-12 h-12 ${t.accent}`} strokeWidth={1.5} />
                </div>

                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <Star className={`w-4 h-4 ${t.accent}`} fill="currentColor" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] leading-tight">Admit One:<br />Amazing Year</h3>
                </div>

                <h1 className={`text-5xl font-black mb-2 leading-none text-transparent bg-clip-text ${t.gradientText} drop-shadow-lg`}>{data.targetName}</h1>
                <p className="text-sm opacity-60 mb-8 font-mono font-bold tracking-[0.3em]">EST. {new Date().getFullYear()}</p>

                <div className="border-t-2 border-dashed border-current opacity-20 my-6" />

                <p className="text-xs font-bold opacity-80 mb-3 mt-4 tracking-widest uppercase flex items-center gap-2">
                    <Heart className="w-3 h-3" /> My Promise <Heart className="w-3 h-3" />
                </p>
                <p className="text-xl italic leading-tight mb-10 font-medium opacity-90">&quot;{data.futurePromise}&quot;</p>

                {/* Long-Press Hug Button */}
                <motion.button
                    onPointerDown={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setIsHugging(true); }}
                    onPointerUp={() => { setIsHugging(false); setHugProgress(0); }}
                    onPointerLeave={() => { setIsHugging(false); setHugProgress(0); }}
                    onContextMenu={(e) => e.preventDefault()}
                    animate={{ scale: isHugging ? 0.95 : 1 }}
                    className={`relative w-full py-5 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all overflow-hidden border ${isHugging ? 'bg-pink-500 text-white border-pink-400' : `${t.accentBg} border-white/20 text-white`}`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
                        {isHugging ? "I Love You!" : "Hold for a Hug!"} <Heart className={isHugging ? "animate-ping text-white" : "text-current"} fill={isHugging ? "currentColor" : "none"} />
                    </span>
                    {isHugging && (
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-white/30 backdrop-blur-sm"
                            style={{ width: `${hugProgress}%` }}
                        />
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
}

function FloatingConstellation({ text, t, delay }: { text: string; t: Record<string, string>; delay: number }) {
    const [popped, setPopped] = useState(false);

    // Initial random positions calculated once per mount to remain pure
    const [pos] = useState(() => ({
        startX: (Math.random() * 200 - 100),
        startY: (Math.random() * 400 - 200),
        endX: (Math.random() * 200 - 100),
        endY: (Math.random() * 400 - 200),
    }));

    const handlePop = () => {
        if (popped || !text) return;
        setPopped(true);
        confetti({
            particleCount: 15,
            spread: 40,
            scalar: 0.8,
            shapes: ['circle'],
            colors: ['#ff0000', '#ff69b4']
        });
    };

    if (popped || !text) return null;

    return (
        <motion.div
            className={`absolute font-bold text-sm px-4 py-2 rounded-full cursor-pointer z-20 backdrop-blur-md shadow-lg ${t.card} ${t.accent}`}
            initial={{
                x: pos.startX,
                y: pos.startY,
                opacity: 0,
                scale: 0
            }}
            animate={{
                y: [null, pos.endY],
                x: [null, pos.endX],
                opacity: [0, 0.9, 0.9, 0],
                scale: [0, 1, 1, 0]
            }}
            transition={{
                duration: 6,
                delay,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut'
            }}
            onClick={handlePop}
        >
            <Sparkles className="w-3 h-3 inline mr-1" />
            {text}
        </motion.div>
    );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function SlidingPuzzle({ imageUrl, onSolve, t }: { imageUrl: string, onSolve: () => void, t: Record<string, string> }) {
    const [tiles, setTiles] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const [isSolved, setIsSolved] = useState(false);

    useEffect(() => {
        // Shuffle by making 50 random valid moves from solved state to guarantee solvability
        let current = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let emptyIdx = 8;
        for (let i = 0; i < 60; i++) {
            const validMoves = [];
            const row = Math.floor(emptyIdx / 3);
            const col = emptyIdx % 3;
            if (row > 0) validMoves.push(emptyIdx - 3);
            if (row < 2) validMoves.push(emptyIdx + 3);
            if (col > 0) validMoves.push(emptyIdx - 1);
            if (col < 2) validMoves.push(emptyIdx + 1);

            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            current[emptyIdx] = current[randomMove];
            current[randomMove] = 8;
            emptyIdx = randomMove;
        }
        setTiles([...current]);
    }, []);

    const moveTile = (index: number) => {
        const emptyIdx = tiles.indexOf(8);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIdx / 3);
        const emptyCol = emptyIdx % 3;

        // Check if adjacent
        if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
            const newTiles = [...tiles];
            newTiles[emptyIdx] = newTiles[index];
            newTiles[index] = 8;
            setTiles(newTiles);

            if (newTiles.join(',') === '0,1,2,3,4,5,6,7,8') {
                setIsSolved(true);
                setTimeout(onSolve, 1000);
            }
        }
    };

    return (
        <div className={`w-full aspect-square relative ${t.card} border-t-2 border-l-2 bg-gradient-to-br from-white/10 to-transparent rounded-2xl overflow-hidden p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full z-0 bg-black/40 rounded-xl overflow-hidden p-1 border border-black/20 shadow-inner">
                {tiles.map((tile, i) => (
                    <motion.div
                        key={i}
                        layout
                        onClick={() => !isSolved && moveTile(i)}
                        className={`w-full h-full rounded-md shadow-md relative ${tile === 8 && !isSolved ? 'opacity-0' : 'cursor-pointer hover:brightness-110'} bg-black`}
                        style={{
                            backgroundImage: (isSolved || tile !== 8) ? `url(${imageUrl})` : 'none',
                            backgroundSize: '300% 300%',
                            backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%`
                        }}
                    >
                        {!isSolved && tile !== 8 && (
                            <div className="absolute inset-0 border-[0.5px] border-white/20 pointer-events-none rounded-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"></div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

