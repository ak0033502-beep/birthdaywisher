"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { Terminal, Lock, Unlock, AlertTriangle, ShieldAlert , ChevronRight } from "lucide-react";
import { LockTimer } from "@/components/story/LockTimer";

// A simple typewriter effect component for that terminal feel
function TypewriterText({ text, speed = 30, className = "", onComplete }: { text: string, speed?: number, className?: string, onComplete?: () => void }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [text]);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, speed, onComplete]);

    return (
        <span className={className}>
            {text.substring(0, index)}
            {index < text.length && <span className="animate-pulse bg-green-500 w-2 h-4 inline-block ml-1 align-middle" />}
        </span>
    );
}

export function TerminalViewer({ data }: { data: WishData }) {
    const [booting, setBooting] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [accessDenied, setAccessDenied] = useState(false);

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

    useEffect(() => {
        // Simulate terminal boot sequence
        const timer = setTimeout(() => setBooting(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const triggerAccessDenied = (setter: any) => {
        setter("> SYSTEM ERROR: INVALID HASH.");
        setAccessDenied(true);
        setTimeout(() => setAccessDenied(false), 800);
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            setDateMsg("> ENCRYPTION BYPASSED.");
        } else {
            triggerAccessDenied(setDateMsg);
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            setQuiz1Msg("> FIREWALL BREACHED.");
        } else {
            triggerAccessDenied(setQuiz1Msg);
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            setQuiz2Msg("> ROOT ACCESS GRANTED.");
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#00ff00', '#003300'] });
        } else {
            triggerAccessDenied(setQuiz2Msg);
        }
    };


    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className="flex flex-col items-start justify-center h-full text-left w-full max-w-lg mx-auto p-8">
                    <Terminal className="w-12 h-12 text-green-500 mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-green-400 mb-6 leading-tight uppercase">
                        <TypewriterText text={`> INIT sequence...\n> TARGET: ${data.nickname || data.targetName}`} speed={40} />
                    </h1>
                    <div className="text-xl text-green-500/80 mt-4">
                        <TypewriterText text={`> SYSTEM LOG: Detected age increment... [ ${data.targetAge} ]`} speed={50} />
                    </div>
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className="flex flex-col items-start justify-center h-full text-left w-full max-w-lg mx-auto p-8">
                    <h2 className="text-2xl font-bold mb-4 tracking-widest text-green-400 uppercase">
                        <TypewriterText text="&gt; QUERYING DATABASE FOR CONNECTION..." />
                    </h2>
                    <div className="mt-8 border-l-4 border-green-500 pl-4 py-2">
                        <TypewriterText text={`> MATCH FOUND: ${data.relationship}\n> DOWNLOADING MEMORIES...`} speed={30} />
                    </div>
                </div>
            )
        },
        // Slide 2: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full w-full max-w-lg mx-auto p-4 sm:p-8">
                    <h2 className="text-2xl font-bold mb-8 uppercase text-green-400">&gt; RUNNING ANOMALY SCAN...</h2>
                    <div className="flex flex-col gap-4">
                        {data.quirks.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.5 }}
                                className="font-mono text-lg text-green-500 break-words"
                            >
                                <span className="text-green-600 mr-2">[{i}]</span> {q}
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
                <div className="flex flex-col justify-center h-full w-full max-w-lg mx-auto p-4 sm:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-green-400">&gt; RETRIEVING ARCHIVED LOG...</h2>
                    <div className="text-lg leading-relaxed text-green-500 border border-green-500/30 p-4 bg-green-500/5 overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <TypewriterText text={data.memoryTale} speed={20} />
                    </div>
                </div>
            )
        },
        // Slide 4: Photo Gallery (Terminal Style - Ascii Art placeholder logic or just glitchy images)
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full w-full p-8">
                    <h2 className="text-xl font-bold mb-8 text-green-400 w-full text-left max-w-lg">&gt; DECRYPTING MEDIA PAYLOAD {idx + 1}...</h2>
                    <motion.div
                        initial={{ opacity: 0, filter: "brightness(0) invert(1)" }}
                        animate={{ opacity: 1, filter: "brightness(1) invert(0)" }}
                        transition={{ duration: 1.5 }}
                        className="w-full max-w-sm border-2 border-green-500 p-2 relative bg-black"
                    >
                        {/* CRT Scanline overlay on image */}
                        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 mix-blend-overlay"></div>

                        <div className="w-full aspect-square bg-green-900/20 overflow-hidden relative grayscale sepia-[.8] hue-rotate-[70deg] contrast-[1.2]">
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <img src={item.url} alt={`Payload ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="text-xs text-green-500/70 mt-2 truncate">PATH: /sys/memories/img_{idx}.dat  STATUS: OK</div>
                    </motion.div>
                </div>
            )
        })) : []),
        // Slide 5: Secret Date (LOCK)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8">
                    {!dateUnlocked ? (
                        <motion.div
                            animate={accessDenied ? { x: [-10, 10, -10, 10, 0] } : {}}
                            className="w-full max-w-sm border border-green-500 bg-black p-6 relative"
                        >
                            <ShieldAlert className="w-16 h-16 text-green-500 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <h2 className="text-2xl font-bold mb-2 text-green-400">&gt; ACCESS RESTRICTED</h2>
                            <p className="text-sm opacity-80 mb-8 text-green-500">PLEASE ENTER ENCRYPTION KEY (DATE)</p>

                            <input
                                type="date"
                                value={dateGuess}
                                onChange={(e) => setDateGuess(e.target.value)}
                                className="w-full p-4 bg-green-950/30 text-green-400 font-mono text-xl border border-green-500/50 outline-none focus:border-green-400 mb-4 text-center"
                                style={{ colorScheme: 'dark' }}
                            />
                            <button
                                onClick={handleUnlockDate}
                                className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500 font-bold text-xl hover:bg-green-500 hover:text-black transition-colors uppercase tracking-widest"
                            >
                                [ INITIATE DECRYPTION ]
                            </button>
                            {dateMsg && <p className="mt-4 text-xs font-bold text-red-500 animate-pulse">{dateMsg}</p>}
                            <LockTimer durationSeconds={60} onAutoUnlock={() => { setDateUnlocked(true); setDateMsg("Time's up! Here it is..."); }} />
                        </motion.div>
                    ) : (
                        <div className="text-green-500 text-center">
                            <Unlock className="w-16 h-16 mx-auto mb-6 text-green-400" />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">&gt; ENCRYPTION BYPASSED</h2>
                            <div className="text-3xl sm:text-4xl font-black bg-green-500 text-black px-4 py-2 inline-block">
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
                <div className="flex flex-col justify-center h-full w-full max-w-lg mx-auto p-4 sm:p-8">
                    <h2 className="text-xl font-bold mb-6 text-green-400 w-full text-left">&gt; DECRYPTING CORE.DAT...</h2>
                    <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium p-6 border border-green-500/30 overflow-y-auto max-h-[60vh] custom-scrollbar text-green-500 bg-green-500/5">
                        <TypewriterText text={data.coreMessage} speed={15} />
                    </div>
                </div>
            )
        },
        // Slide 7: Future Promise (Finale in this shortened version)
        {
            id: "finale",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center text-center h-full px-6">
                    <motion.div
                        className="w-full max-w-[340px] border border-green-400 p-8 bg-black relative shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                    >
                        <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-none text-green-400 uppercase">&gt;&gt; SYSTEM OK</h1>
                        <p className="text-xs opacity-60 mb-8 font-mono tracking-[0.3em] text-green-500 border-b border-green-500/30 pb-4">
                            TRANSMISSION COMPLETE
                        </p>

                        <p className="text-xl italic leading-tight mb-10 font-medium text-green-300">
                            &quot;{data.futurePromise}&quot;
                        </p>

                        <div className="text-sm font-bold opacity-80 mt-8 tracking-widest uppercase text-green-500 animate-pulse">
                            _SESSION ENDED
                        </div>
                    </motion.div>
                </div>
            )
        }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (slides[currentSlide].locked) {
            triggerAccessDenied(setDateMsg);
            triggerAccessDenied(setQuiz1Msg);
            triggerAccessDenied(setQuiz2Msg);
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


    if (booting) {
        return (
            <div className="w-full h-svh bg-black text-green-500 font-mono flex flex-col p-8 overflow-hidden relative">
                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 mix-blend-overlay"></div>
                <div className="text-sm">
                    <TypewriterText text="WISH-OS v1.0.4 BOOT SEQUENCE INITIATED...&#10;LOADING KERNEL... OK&#10;MOUNTING FILESYSTEM... OK&#10;ESTABLISHING SECURE CONNECTION... OK&#10;DECRYPTING EMOTIONAL PAYLOAD... PLEASE WAIT...&#10;" speed={30} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-0 md:p-4 overflow-hidden select-none bg-zinc-900 font-mono">
            {/* Story Container */}
            <div className="relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-xl overflow-hidden md:border-8 md:border-zinc-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] bg-black text-green-500">

                {/* CRT Scanline Overlay applied to whole container */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 mix-blend-overlay opacity-80"></div>

                {/* CRT Flicker Animation */}
                <motion.div
                    animate={{ opacity: [0.95, 1, 0.98, 1, 0.95] }}
                    transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none z-40 bg-green-500/5 mix-blend-overlay"
                />

                {/* Progress Indicators (Terminal block style) */}
                <div className="absolute top-4 left-4 right-4 flex gap-1 z-50 font-mono text-[10px] text-green-500/50">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <div key={i} className={`h-1 flex-1 ${i <= currentSlide ? 'bg-green-500' : 'bg-green-900/40'}`} />
                    ))}
                </div>

                {/* Slides content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-10 pt-8"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>

                {/* Visible Bottom Navigation Arrows */}
                <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none">
                    <button onClick={handlePrev} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === 0 ? "opacity-0 pointer-events-none" : "bg-black/60 border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <button onClick={handleNext} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === totalSlides - 1 ? "opacity-0 pointer-events-none" : "bg-black/60 border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 z-50 text-[10px] bg-green-950/80 border-t border-green-500/30 flex justify-between text-green-400">
                    <span>SYS: ONLINE</span>
                    <span>MEM: {currentSlide + 1}/{totalSlides}</span>
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
    );
}

