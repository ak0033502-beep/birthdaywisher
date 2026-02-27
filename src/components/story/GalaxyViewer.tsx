"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { Sparkles, Rocket, Star, Heart, Telescope, MapPin, KeyRound, Unlock, Orbit, Satellite, Moon } from "lucide-react";

export function GalaxyViewer({ data }: { data: WishData }) {
    const [launched, setLaunched] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    const errorMessages = ["Mission Control: Access Denied.", "Starfleet: Invalid coordinates.", "Orbit degraded. Try again.", "Shields holding. Incorrect passcode."];
    const successMessages = ["Coordinates locked! 🚀", "Hyperdrive engaged! ✨", "Welcome aboard! 🌌", "Docking successful! 🛰️"];
    const getRandomMsg = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            setDateMsg(getRandomMsg(successMessages));
            confetti({ particleCount: 100, spread: 360, colors: ['#a855f7', '#3b82f6', '#ec4899', '#ffffff'] });
        } else {
            setDateMsg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            setQuiz1Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 100, spread: 360, colors: ['#a855f7', '#3b82f6', '#ec4899', '#ffffff'] });
        } else {
            setQuiz1Msg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            setQuiz2Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 100, spread: 360, colors: ['#a855f7', '#3b82f6', '#ec4899', '#ffffff'] });
        } else {
            setQuiz2Msg(getRandomMsg(errorMessages));
        }
    };

    // Styling constants
    const accent = "text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]";
    const cardBg = "bg-[#0b0f19]/80 backdrop-blur-2xl border border-purple-500/20 shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]";

    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 relative z-20">
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="mb-8"
                    >
                        <Moon className={`w-24 h-24 ${accent}`} strokeWidth={1} fill="rgba(168,85,247,0.2)" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 drop-shadow-xl tracking-tight">
                        Orbiting Sector {data.targetAge}
                    </h1>

                    <p className="text-xl text-blue-200/80 font-light tracking-wide max-w-sm">
                        Happy Birthday, Commander <strong className="text-white font-bold">{data.nickname || data.targetName}</strong>.
                        A new cosmic cycle begins today.
                    </p>
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <Orbit className={`w-16 h-16 ${accent} mb-8`} strokeWidth={1.5} />
                    <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                        Gravitational Pull: <span className="uppercase font-black text-white ml-2">{data.relationship?.replace("-", " ")}</span>
                    </h2>
                    <p className="text-lg leading-relaxed text-blue-100/70 font-light">
                        Of all the billions of planets in this universe, I&apos;m incredibly glad our orbits crossed.
                        Let&apos;s chart the constellation of our journey together.
                    </p>
                </div>
            )
        },
        // Slide 2: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full px-8 w-full max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-10 text-center tracking-widest uppercase text-purple-300 drop-shadow-md">
                        <Sparkles className="inline-block w-5 h-5 mr-3 mb-1 text-pink-400" />
                        Stellar Qualities
                        <Sparkles className="inline-block w-5 h-5 ml-3 mb-1 text-pink-400" />
                    </h2>
                    <div className="flex flex-col gap-5 relative z-10 w-full">
                        {data.quirks.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className={`px-6 py-4 rounded-2xl flex items-center gap-4 ${cardBg} w-full`}
                            >
                                <Star className={`w-5 h-5 shrink-0 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]`} fill="currentColor" />
                                <span className="text-blue-50 font-medium">{q}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )
        },
        // Slide 3: Memory Tale
        {
            id: "tale",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full px-8 relative">
                    <Telescope className="absolute top-1/4 right-0 w-48 h-48 text-white/5 -z-10 tracking-widest" />
                    <h2 className="text-lg font-mono mb-4 text-pink-400 uppercase tracking-widest">&gt; Transmission Received</h2>
                    <div className={`p-8 rounded-3xl ${cardBg} relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                        <p className="text-xl leading-loose font-serif italic text-blue-50/90 relative z-10 text-justify">
                            &quot;{data.memoryTale}&quot;
                        </p>
                    </div>
                </div>
            )
        },
        // Slide 4: Photo Gallery
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full w-full px-6 relative">
                    <h2 className="text-sm font-mono tracking-[0.3em] uppercase mb-8 text-blue-300">Stardust Archive #{idx + 1}</h2>
                    <motion.div
                        className={`w-full max-w-sm p-4 rounded-[2rem] ${cardBg} relative`}
                    >
                        <div className="w-full aspect-[4/5] bg-black rounded-xl overflow-hidden relative shadow-inner shadow-black/50">
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 brightness-110 contrast-125" />
                            ) : (
                                <img src={item.url} alt={`Memory ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 brightness-110 contrast-125" />
                            )}
                            {/* Vignette */}
                            <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,1)' }}></div>
                        </div>
                    </motion.div>
                </div>
            )
        })) : []),
        // Slide 5: Secret Date (LOCK)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 relative z-20">
                    {!dateUnlocked ? (
                        <div className={`w-full max-w-sm rounded-[2rem] p-8 ${cardBg} relative overflow-hidden backdrop-blur-3xl`}>
                            {/* Radar sweep effect */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-full border border-purple-500/10 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 aspect-square rounded-full border border-purple-500/20 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,1)]"></div>

                            <KeyRound className={`w-12 h-12 mx-auto mb-6 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]`} strokeWidth={2} />

                            <h2 className="text-2xl font-bold mb-2 text-white">Wormhole Encrypted</h2>
                            <p className="text-sm opacity-60 mb-8 text-blue-200">Input standard temporal coordinates (Date) to proceed.</p>

                            <input
                                type="date"
                                value={dateGuess}
                                onChange={(e) => setDateGuess(e.target.value)}
                                className="w-full p-4 bg-transparent border-b-2 border-purple-500/50 text-white text-xl outline-none focus:border-pink-400 mb-8 text-center"
                                style={{ colorScheme: 'dark' }}
                            />
                            <button
                                onClick={handleUnlockDate}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            >
                                Initiate Jump
                            </button>
                            {dateMsg && <p className="mt-4 text-xs font-mono text-pink-400 animate-pulse uppercase tracking-widest">{dateMsg}</p>}
                        </div>
                    ) : (
                        <div className="text-center z-20">
                            <Unlock className={`w-20 h-20 mx-auto mb-6 ${accent}`} strokeWidth={1} />
                            <h2 className="text-3xl font-black mb-4 uppercase tracking-[0.2em] text-blue-200">Jump Completed</h2>
                            <div className="text-5xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-2xl">
                                {data.secretDate}
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        // Slide 6: Core Message
        {
            id: "core",
            locked: false,
            content: (
                <div className="flex flex-col justify-start h-full px-6 pt-20 w-full max-w-lg mx-auto">
                    <h2 className="text-sm font-mono uppercase tracking-[0.4em] mb-6 text-center text-purple-300">Captain&apos;s Log</h2>
                    <div className={`p-8 rounded-[2rem] ${cardBg} shadow-2xl overflow-hidden relative`}>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium text-blue-50/90 overflow-y-auto max-h-[55vh] custom-scrollbar relative z-10 px-2 text-justify">
                            {data.coreMessage}
                        </div>
                    </div>
                </div>
            )
        },
        // Slide 7: Future Promise
        {
            id: "finale",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center text-center h-full px-8 relative z-20">
                    <Satellite className="w-20 h-20 text-blue-400 mb-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]" strokeWidth={1} />

                    <h1 className="text-3xl font-bold mb-8 text-blue-200 uppercase tracking-widest">
                        Incoming Signal
                    </h1>

                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 mb-10"></div>

                    <p className="text-2xl leading-tight font-light italic text-white drop-shadow-md">
                        &quot;{data.futurePromise}&quot;
                    </p>

                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 mt-10 mb-8"></div>

                    <p className="text-sm tracking-[0.3em] uppercase text-purple-400 animate-pulse">
                        End of Transmission
                    </p>
                </div>
            )
        }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (slides[currentSlide].locked) {
            if (!dateUnlocked) setDateMsg(getRandomMsg(errorMessages));
            if (!quiz1Unlocked) setQuiz1Msg(getRandomMsg(errorMessages));
            if (!quiz2Unlocked) setQuiz2Msg(getRandomMsg(errorMessages));
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


    if (!launched) {
        return (
            <div className="w-full h-svh bg-[#030614] flex flex-col items-center justify-center p-8 overflow-hidden relative radial-gradient">
                <SpaceBackground />

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                    onClick={() => {
                        setLaunched(true);
                        // Blast off confetti
                        confetti({
                            particleCount: 150,
                            spread: 60,
                            origin: { y: 0.9 },
                            colors: ['#ef4444', '#f97316', '#eab308'],
                            startVelocity: 60,
                            gravity: 0.8
                        });
                    }}
                >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-[#0f172a] to-[#1e1b4b] border-[4px] border-blue-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.3)] relative group-hover:shadow-[0_0_100px_rgba(59,130,246,0.5)] group-hover:border-blue-400/60 transition-all duration-500">
                        {/* Glowing ring */}
                        <div className="absolute inset-[-10px] rounded-full border-2 border-dashed border-purple-500/40 animate-[spin_10s_linear_infinite]"></div>

                        <Rocket className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)] -translate-y-2 group-hover:translate-y-[-10px] transition-transform duration-500" strokeWidth={1.5} />
                    </div>

                    <div className="mt-12 text-blue-300 font-mono tracking-[0.3em] uppercase text-sm animate-pulse flex flex-col items-center gap-2">
                        <span>Tap to Launch</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-0 overflow-hidden select-none bg-[#030614] font-sans">

            <SpaceBackground />

            {/* Story Container - Mobile Full, Desktop slightly constrained */}
            <div className={`relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-[3rem] overflow-hidden md:border-[8px] md:border-[#1e293b] shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] bg-transparent flex flex-col backdrop-blur-3xl`}>

                {/* Navigation Dots (Planet Orbits) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-500 ${i === currentSlide ? 'w-3 h-3 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)]' : i < currentSlide ? 'w-2 h-2 bg-purple-500/60' : 'w-2 h-2 bg-white/20'}`}
                        />
                    ))}
                </div>

                {/* Slides content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -50 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 z-10"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>

                {/* Tap Navigation Zones (Invisible Overlays) */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={handlePrev} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-pointer" onClick={handleNext} />

            </div>
        </div>
    );
}


// Shared Space Background Component for depth
function SpaceBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#030614] to-black">
            {/* Deep space nebula clouds */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_alternate]"></div>

            {/* Stars layer 1 (Small, slow) */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://transparenttextures.com/patterns/stardust.png')] bg-[length:200px] animate-[slide_100s_linear_infinite]"></div>

            {/* Stars layer 2 (Larger, faster) */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://transparenttextures.com/patterns/cubes.png')] mix-blend-overlay bg-[length:400px] animate-[slide_60s_linear_infinite_reverse]"></div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide {
                    0% { background-position: 0 0; }
                    100% { background-position: -1000px -1000px; }
                }
            `}} />
        </div>
    )
}
