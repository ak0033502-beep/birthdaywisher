"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { ChevronRight, Heart, Star, Sparkles, Trophy, Quote, ScrollText, Lock, Unlock, HelpCircle, PartyPopper } from "lucide-react";

// Theme map defines how every element of the story should look based on the chosen preview style
const themeStyles: Record<string, Record<string, string>> = {
    neon: {
        bg: "bg-black",
        container: "bg-zinc-950 text-white border-white/10",
        accent: "text-pink-500",
        accentBg: "bg-pink-500/20",
        gradientText: "bg-gradient-to-r from-pink-500 to-cyan-500",
        card: "bg-white/5 border-white/10 backdrop-blur-md",
        font: "font-sans",
        progress: "bg-pink-500",
        iconFill: "fill-pink-500/20",
        roastGradient: "from-pink-500 to-purple-600",
        input: "bg-zinc-900 border-pink-500/50 focus:border-pink-500 text-white"
    },
    elegant: {
        bg: "bg-zinc-950",
        container: "bg-black text-yellow-50 border-yellow-500/20",
        accent: "text-yellow-400",
        accentBg: "bg-yellow-400/20",
        gradientText: "bg-gradient-to-r from-yellow-200 to-yellow-600",
        card: "bg-zinc-900 border-yellow-500/20",
        font: "font-sans",
        progress: "bg-yellow-400",
        iconFill: "fill-yellow-400/20",
        roastGradient: "from-yellow-500 to-yellow-700",
        input: "bg-zinc-900 border-yellow-500/50 focus:border-yellow-400 text-white"
    },
    pastel: {
        bg: "bg-pink-100",
        container: "bg-pink-50 text-slate-800 border-pink-200",
        accent: "text-pink-500",
        accentBg: "bg-pink-200",
        gradientText: "bg-gradient-to-r from-pink-400 to-purple-400",
        card: "bg-white border-pink-200 shadow-xl",
        font: "font-sans",
        progress: "bg-pink-400",
        iconFill: "fill-pink-200",
        roastGradient: "from-pink-300 to-pink-500",
        input: "bg-white border-pink-300 focus:border-pink-500 text-slate-800"
    },
    monochrome: {
        bg: "bg-zinc-900",
        container: "bg-white text-black border-zinc-200",
        accent: "text-zinc-900",
        accentBg: "bg-zinc-200",
        gradientText: "bg-gradient-to-r from-zinc-700 to-black",
        card: "bg-zinc-50 border-zinc-200 shadow-md",
        font: "font-serif",
        progress: "bg-black",
        iconFill: "fill-zinc-200",
        roastGradient: "from-zinc-400 to-zinc-800",
        input: "bg-zinc-100 border-zinc-400 focus:border-black text-black"
    },
    paper: {
        bg: "bg-[#d4c5b0]",
        container: "bg-[#f4ebd8] text-[#3e3222] border-[#d4c5b0] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]",
        accent: "text-[#8b3a3a]",
        accentBg: "bg-[#8b3a3a]/10",
        gradientText: "bg-gradient-to-r from-[#8b3a3a] to-[#5e2727]",
        card: "bg-[#fdfbf7] border-[#d4c5ab] shadow-[2px_2px_10px_rgba(0,0,0,0.05)] rounded-sm",
        font: "font-serif tracking-wide",
        progress: "bg-[#8b3a3a]",
        iconFill: "fill-[#8b3a3a]/20",
        roastGradient: "from-[#8b3a3a] to-[#5e2727]",
        input: "bg-[#fdfbf7] border-[#d4c5ab] focus:border-[#8b3a3a] text-[#3e3222]"
    }
};

export function StoryViewer({ data }: { data: WishData }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [shakeError, setShakeError] = useState(false);

    // Locks
    const [dateGuess, setDateGuess] = useState("");
    const [dateUnlocked, setDateUnlocked] = useState(false);
    const [dateMsg, setDateMsg] = useState("");

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
                <div className={`flex flex-col items-center justify-center h-full text-center px-6 ${t.font}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className={`w-20 h-20 ${t.accentBg} rounded-full flex items-center justify-center mb-6`}>
                        <Sparkles className={`w-10 h-10 ${t.accent}`} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-5xl font-bold bg-clip-text text-transparent ${t.gradientText} mb-4 leading-tight`}
                    >
                        Happy Birthday,<br /> {data.nickname || data.targetName}!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
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
                <div className={`flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-b from-transparent to-black/10 ${t.font}`}>
                    <motion.div initial={{ opacity: 0, rotate: -180 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.8 }} className="mb-6">
                        <Heart className={`w-16 h-16 ${t.accent} ${t.iconFill}`} />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="text-3xl font-bold mb-4"
                    >
                        To my favorite <span className="capitalize opacity-90">{data.relationship?.replace("-", " ")}</span>...
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-lg opacity-60">
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
                <div className={`flex flex-col justify-center h-full px-8 ${t.font}`}>
                    <h2 className="text-3xl font-bold mb-8">The Roast Meter 🔥</h2>
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
                <div className={`flex flex-col justify-center h-full px-8 ${t.font}`}>
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
                <div className={`flex flex-col justify-center h-full px-8 relative overflow-hidden ${t.font}`}>
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
        // Slide 5: Secret Date (PUZZLE)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-8 bg-black/5 ${t.font}`}>
                    {!dateUnlocked ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="w-full flex flex-col items-center"
                        >
                            <Lock className={`w-16 h-16 mb-6 ${t.accent}`} />
                            <h2 className="text-3xl font-bold mb-2">Memory Check!</h2>
                            <p className="text-lg opacity-80 mb-8">Enter our secret date to unlock the rest of the wish. 🤫</p>

                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full relative z-50 pointer-events-auto">
                                <input
                                    type="date"
                                    value={dateGuess}
                                    onChange={(e) => setDateGuess(e.target.value)}
                                    className={`w-full p-4 rounded-xl text-lg font-bold outline-none border-2 transition-all mb-4 ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockDate}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Unlock 🔓
                                </button>
                                {dateMsg && <p className={`mt-4 text-sm font-bold ${t.accent}`}>{dateMsg}</p>}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <Unlock className={`w-16 h-16 mb-6 ${t.accent}`} />
                            <h2 className="text-2xl font-bold mb-4 opacity-80">{dateMsg || "You remembered!"}</h2>
                            <div className={`text-5xl font-black text-transparent bg-clip-text ${t.gradientText} py-4`}>
                                {data.secretDate}
                            </div>
                        </motion.div>
                    )}
                </div>
            )
        },
        // Slide 6: Quiz 1 (PUZZLE)
        ...(data.quizQ1 ? [{
            id: "quiz1",
            locked: !quiz1Unlocked,
            content: (
                <div className={`flex flex-col items-center justify-center h-full text-center px-8 ${t.font}`}>
                    {!quiz1Unlocked ? (
                        <motion.div className="w-full flex flex-col items-center pointer-events-auto relative z-50">
                            <HelpCircle className={`w-16 h-16 mb-6 ${t.accent}`} />
                            <h2 className="text-2xl font-bold mb-6">Quiz Time! 🧠</h2>
                            <div className={`p-6 rounded-2xl w-full mb-8 font-medium text-xl ${t.card}`}>
                                &quot;{data.quizQ1}&quot;
                            </div>
                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full">
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={quiz1Guess}
                                    onChange={(e) => setQuiz1Guess(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockQuiz1()}
                                    className={`w-full p-4 rounded-xl text-lg font-bold outline-none border-2 transition-all mb-4 ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockQuiz1}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Submit
                                </button>
                                {quiz1Msg && <p className={`mt-4 text-sm font-bold ${t.accent}`}>{quiz1Msg}</p>}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <CheckIcon className={`w-20 h-20 mb-6 ${t.accent}`} />
                            <h2 className="text-3xl font-black mb-4">{quiz1Msg || "Spot on!"}</h2>
                            <div className={`p-6 rounded-2xl font-medium text-xl opacity-80 ${t.card}`}>
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
                <div className={`flex flex-col items-center justify-center h-full text-center px-8 ${t.font}`}>
                    {!quiz2Unlocked ? (
                        <motion.div className="w-full flex flex-col items-center pointer-events-auto relative z-50">
                            <HelpCircle className={`w-16 h-16 mb-6 ${t.accent}`} />
                            <h2 className="text-2xl font-bold mb-6">One more question! 🫣</h2>
                            <div className={`p-6 rounded-2xl w-full mb-8 font-medium text-xl ${t.card}`}>
                                &quot;{data.quizQ2}&quot;
                            </div>
                            <motion.div animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}} className="w-full">
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={quiz2Guess}
                                    onChange={(e) => setQuiz2Guess(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockQuiz2()}
                                    className={`w-full p-4 rounded-xl text-lg font-bold outline-none border-2 transition-all mb-4 ${t.input}`}
                                />
                                <button
                                    onClick={handleUnlockQuiz2}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${t.gradientText}`}
                                >
                                    Submit
                                </button>
                                {quiz2Msg && <p className={`mt-4 text-sm font-bold ${t.accent}`}>{quiz2Msg}</p>}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <PartyPopper className={`w-20 h-20 mb-6 ${t.accent}`} />
                            <h2 className="text-3xl font-black mb-4">{quiz2Msg || "You did it!"}</h2>
                            <div className={`text-2xl font-bold ${t.accent}`}>
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
                <div className={`flex flex-col items-center justify-center h-full text-center px-8 ${t.font}`}>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                        className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 ${t.accentBg}`}
                    >
                        <Trophy className={`w-16 h-16 ${t.accent}`} />
                    </motion.div>
                    <p className="text-xl opacity-80 mb-4 uppercase tracking-widest font-bold">You officially win:</p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`text-4xl font-black leading-tight ${t.accent}`}
                    >
                        &quot;{data.awardTitle}&quot;
                    </motion.h2>
                </div>
            )
        },
        // Slide 9: Gratitude
        {
            id: "gratitude",
            locked: false,
            content: (
                <div className={`flex flex-col justify-center h-full px-8 bg-gradient-to-tr from-black/5 to-transparent ${t.font}`}>
                    <h2 className={`text-3xl font-bold mb-8 flex items-center gap-3 ${t.accent}`}>
                        <Heart className="w-8 h-8" />
                        I&apos;m so thankful...
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl leading-snug font-medium opacity-90"
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
                <div className={`flex flex-col justify-center h-full px-8 bg-black/5 ${t.font}`}>
                    <h2 className={`text-2xl font-bold mb-8 flex items-center gap-2 ${t.accent}`}>
                        <ScrollText className="w-6 h-6" /> Heart to Heart
                    </h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="text-xl leading-relaxed whitespace-pre-wrap font-medium opacity-90"
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
                <div className={`flex flex-col items-center justify-center text-center h-full px-8 ${t.font}`}>
                    <h2 className={`text-2xl font-bold mb-8 ${t.accent}`}>My Promise to You 🌟</h2>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        className={`p-8 rounded-3xl border ${t.card}`}
                    >
                        <p className="text-2xl font-medium leading-relaxed opacity-90">
                            {data.futurePromise}
                        </p>
                    </motion.div>
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

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center p-0 md:p-4 overflow-hidden select-none transition-colors duration-1000 ${t.bg}`}>

            {/* Story Container (Locked aspect ratio on Desktop, full screen on mobile) */}
            <div className={`relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-[2.5rem] overflow-hidden border-0 md:border-[12px] shadow-2xl transition-colors duration-1000 ${t.container}`}>

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

                {/* Tap Navigation Zones (Invisible Overlays) */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={handlePrev} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-pointer" onClick={handleNext} />

                {/* Tap / Interaction Hint */}
                {currentSlide === 0 && (
                    <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
                            className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm font-medium"
                        >
                            Tap right to continue <ChevronRight className="w-4 h-4" />
                        </motion.div>
                    </div>
                )}

                {slides[currentSlide].locked && (
                    <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-500/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold"
                        >
                            <Lock className="w-3 h-3" /> Locked
                        </motion.div>
                    </div>
                )}
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

    return (
        <div className={`relative flex flex-col items-center justify-center text-center h-full px-8 ${t.font} overflow-hidden w-full`}>
            {/* Heartbeat Photo Background */}
            {data.mediaUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                    animate={{ opacity: 0.3, scale: [1, 1.05, 1], filter: 'blur(4px)' }}
                    transition={{
                        opacity: { duration: 3, delay: 1 },
                        filter: { duration: 3, delay: 1 },
                        scale: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                    }}
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${data.mediaUrl})` }}
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
                className={`relative z-10 w-full max-w-sm rounded-[2rem] p-6 backdrop-blur-xl border-2 shadow-2xl overflow-hidden ${t.card}`}
                style={{
                    background: isHugging ? 'rgba(255, 105, 180, 0.4)' : undefined,
                    borderColor: isHugging ? '#ff69b4' : undefined,
                    transition: 'all 0.5s ease'
                }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <PartyPopper className={`w-8 h-8 ${t.accent}`} />
                </div>

                <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Admit One: Amazing Year</h3>
                <h1 className={`text-4xl font-black mb-1 leading-none ${t.accent}`}>{data.targetName}</h1>
                <p className="text-xs opacity-60 mb-6 font-mono font-bold tracking-widest">EST. {new Date().getFullYear()}</p>

                <div className="border-t-2 border-dashed border-current opacity-20 my-4" />

                <p className="text-sm font-bold opacity-80 mb-2 mt-4 tracking-widest uppercase">My Promise To You:</p>
                <p className="text-xl italic leading-tight mb-8 font-medium">&quot;{data.futurePromise}&quot;</p>

                {/* Long-Press Hug Button */}
                <motion.button
                    onPointerDown={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setIsHugging(true); }}
                    onPointerUp={() => { setIsHugging(false); setHugProgress(0); }}
                    onPointerLeave={() => { setIsHugging(false); setHugProgress(0); }}
                    onContextMenu={(e) => e.preventDefault()}
                    animate={{ scale: isHugging ? 0.95 : 1 }}
                    className={`relative w-full py-4 mt-2 rounded-2xl font-black text-lg shadow-xl transition-all overflow-hidden ${isHugging ? 'bg-pink-500 text-white' : t.accentBg}`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isHugging ? "I Love You!" : "Hold for a Hug!"} <Heart className={isHugging ? "animate-ping text-white" : "text-current"} />
                    </span>
                    {isHugging && (
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-white/30"
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
