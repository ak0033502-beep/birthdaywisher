"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { BookOpen, ChevronRight, ChevronLeft, Heart, Star, Sparkles, BookHeart, Compass, Crown, KeyRound, Image as ImageIcon, Video, Mic, Unlock } from "lucide-react";
import { LockTimer } from "@/components/story/LockTimer";

export function StorybookViewer({ data }: { data: WishData }) {
    const [bookOpened, setBookOpened] = useState(false);
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

    // Book styling constants
    const textTheme = "text-amber-950 font-serif";
    const bgTheme = "bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]";

    const errorMessages = ["Alas, the magic word eludes you.", "That is not the correct incantation.", "Try again, noble traveler.", "The pages remain sealed."];
    const successMessages = ["The seal is broken! 📖", "You remember well! ✨", "The story continues... 🌟", "Ah, yes! Perfect! 🎉"];
    const getRandomMsg = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            setDateMsg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#b45309', '#d97706', '#fcd34d'] });
        } else {
            setDateMsg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            setQuiz1Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#b45309', '#d97706', '#fcd34d'] });
        } else {
            setQuiz1Msg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            setQuiz2Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#b45309', '#d97706', '#fcd34d'] });
        } else {
            setQuiz2Msg(getRandomMsg(errorMessages));
        }
    };

    // Elaborate drop caps and bookish layout
    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 relative">
                    <img src="https://www.transparenttextures.com/patterns/ornement.png" className="absolute top-4 w-32 opacity-20" alt="" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="mb-8">
                        <BookHeart className="w-20 h-20 text-amber-800 drop-shadow-md" strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
                        <span className="text-6xl text-amber-700 italic pr-2 font-black font-serif">O</span>nce Upon A Time...
                    </h1>
                    <p className="text-2xl text-amber-800/80 italic mt-4 max-w-sm border-t border-b border-amber-900/20 py-4">
                        A birthday tale for <strong className="text-amber-900">{data.nickname || data.targetName}</strong>, turning {data.targetAge}.
                    </p>
                    <img src="https://www.transparenttextures.com/patterns/ornement.png" className="absolute bottom-4 w-32 opacity-20 rotate-180" alt="" />
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-10 relative">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-amber-950 leading-loose">
                        Chapter 1<br />
                        <span className="text-xl font-normal italic text-amber-800">The Legend of the <span className="capitalize font-bold">{data.relationship?.replace("-", " ")}</span></span>
                    </h2>
                    <p className="text-xl leading-relaxed text-amber-900 text-justify">
                        Every great story needs its heroes, its sidekicks, its legendary figures. And in my story, nobody plays the role quite like you do.
                        Turn the page, and let us wander through the archives of our shared history.
                    </p>
                </div>
            )
        },
        // Slide 2: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full px-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-amber-900 text-center border-b-2 border-amber-900 border-dotted pb-4">Endearing Traits</h2>
                    <div className="flex flex-col gap-6">
                        {data.quirks.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.3 }}
                                className="text-xl text-amber-950 italic flex items-start gap-4"
                            >
                                <span className="text-amber-600 text-3xl leading-none mt-1">❦</span>
                                <span>{q}</span>
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
                <div className="flex flex-col justify-start h-full px-10 pt-16 align-top">
                    <h2 className="text-2xl font-bold mb-6 text-amber-900 italic text-center">An excerpt from the Archives...</h2>
                    <div className="text-xl leading-loose text-amber-950 text-justify first-letter:text-6xl first-letter:font-black first-letter:text-amber-800 first-letter:float-left first-letter:mr-2">
                        {data.memoryTale}
                    </div>
                </div>
            )
        },
        // Slide 4: Photo Gallery
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full w-full px-8 relative">
                    <h2 className="text-2xl font-bold mb-6 text-amber-900 italic text-center absolute top-10">Illustrated Plate No. {idx + 1}</h2>
                    <motion.div
                        className="w-full max-w-sm bg-white p-3 pb-12 shadow-[5px_5px_15px_rgba(0,0,0,0.2)] border border-[#eaddcf] rotate-2 relative"
                    >
                        <div className="w-full aspect-square bg-[#ece4d9] overflow-hidden relative border border-[#cabcaa]">
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover sepia-[0.3]" />
                            ) : (
                                <img src={item.url} alt={`Plate ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover sepia-[0.3]" />
                            )}
                        </div>
                        <div className="absolute bottom-4 w-full text-center left-0 text-amber-900/60 font-serif italic text-sm">
                            Fig. {idx + 1}
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
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                    {!dateUnlocked ? (
                        <div className="w-full max-w-sm relative">
                            <KeyRound className="w-16 h-16 text-amber-800 mx-auto mb-6" strokeWidth={1.5} />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-amber-900 leading-tight">A Seal Upon<br />The Parchment</h2>
                            <p className="text-lg opacity-80 mb-8 text-amber-950 italic">Only those who remember the sacred date may pass beyond this chapter.</p>

                            <input
                                type="date"
                                value={dateGuess}
                                onChange={(e) => setDateGuess(e.target.value)}
                                className="w-full p-4 bg-transparent border-b-2 border-amber-800 text-amber-950 font-serif text-xl outline-none focus:border-amber-600 mb-6 text-center"
                            />
                            <button
                                onClick={handleUnlockDate}
                                className="w-full py-4 bg-amber-800 text-white font-serif text-xl border-2 border-amber-900 hover:bg-amber-900 transition-colors shadow-lg"
                            >
                                Break the Seal
                            </button>
                            {dateMsg && <p className="mt-4 text-sm italic font-bold text-red-800">{dateMsg}</p>}
                            <LockTimer durationSeconds={60} onAutoUnlock={() => { setDateUnlocked(true); setDateMsg("Time's up! Here it is..."); }} />
                        </div>
                    ) : (
                        <div className="text-amber-900 text-center">
                            <Unlock className="w-16 h-16 mx-auto mb-6 text-amber-700" strokeWidth={1.5} />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 italic">The Seal is Broken</h2>
                            <div className="text-3xl sm:text-4xl font-black mt-4">
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
                <div className="flex flex-col justify-start h-full px-10 pt-16 align-top">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-amber-900 text-center border-b-2 border-amber-900 border-dotted pb-4">Heart of the Story</h2>
                    <div className="text-xl leading-relaxed whitespace-pre-wrap font-serif text-amber-950 overflow-y-auto max-h-[60vh] custom-scrollbar text-justify px-2">
                        {data.coreMessage}
                    </div>
                </div>
            )
        },
        // Slide 7: Future Promise (Finale)
        {
            id: "finale",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center text-center h-full px-10 relative">
                    <Crown className="w-20 h-20 text-amber-600 mb-8 drop-shadow-md" strokeWidth={1} />
                    <h1 className="text-3xl sm:text-4xl font-black mb-6 text-amber-900 italic">Happily Ever After...</h1>

                    <p className="text-2xl italic leading-tight mb-12 font-medium text-amber-950 border-t border-b border-amber-900/30 py-8">
                        &quot;{data.futurePromise}&quot;
                    </p>

                    <p className="text-lg font-bold uppercase tracking-[0.2em] text-amber-800 mt-4">
                        The End.
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


    if (!bookOpened) {
        return (
            <div className="w-full h-svh bg-[#2a1b14] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center p-8 overflow-hidden relative perspective-[1200px]">
                {/* Book Cover */}
                <motion.div
                    initial={{ y: 50, opacity: 0, rotateX: 30 }}
                    animate={{ y: 0, opacity: 1, rotateX: 10 }}
                    transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
                    className="relative z-10 flex flex-col items-center cursor-pointer group w-full max-w-[350px] aspect-[3/4] bg-[#5e2727] bg-[url('https://www.transparenttextures.com/patterns/leather.png')] rounded-r-3xl rounded-l-sm shadow-[20px_20px_50px_rgba(0,0,0,0.8),inset_-10px_0_20px_rgba(0,0,0,0.4)] border-l-8 border-[#3b1717] flex justify-center p-8"
                    onClick={() => {
                        setBookOpened(true);
                        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#fcd34d', '#fbbf24', '#f59e0b'] });
                    }}
                    style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
                    whileHover={{ rotateY: -10 }}
                >
                    {/* Golden corners and spine accents */}
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#d4af37] rounded-tr-xl opacity-80" />
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#d4af37] rounded-br-xl opacity-80" />

                    <div className="border-4 border-[#d4af37]/60 w-full h-full p-4 flex flex-col items-center justify-center relative shadow-inner">
                        <BookOpen className="w-16 h-16 text-[#d4af37] mb-8" strokeWidth={1} />
                        <h2 className="text-3xl font-serif text-[#d4af37] text-center drop-shadow-md leading-snug tracking-wider uppercase">{data.targetName}&apos;s<br />Tale</h2>
                        <div className="mt-12 text-[#d4af37]/80 font-serif italic tracking-widest text-sm flex items-center gap-2">
                            Open Book <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Faux pages edge on right */}
                    <div className="absolute top-2 bottom-2 right-[-14px] w-[14px] bg-[#fdfbf7] rounded-r-sm shadow-inner" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #d4c5b0, #d4c5b0 1px, #fdfbf7 1px, #fdfbf7 3px)' }}></div>
                </motion.div>
            </div>
        );
    }

    // Page turn animation variants
    const pageVariants = {
        enter: (direction: number) => ({
            rotateY: direction > 0 ? 90 : -90,
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            transformOrigin: 'left center'
        }),
        center: {
            zIndex: 1,
            rotateY: 0,
            x: 0,
            opacity: 1,
            transformOrigin: 'left center'
        },
        exit: (direction: number) => ({
            zIndex: 0,
            rotateY: direction < 0 ? 90 : -90,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            transformOrigin: 'left center'
        })
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-0 md:p-8 overflow-hidden select-none bg-[#2a1b14] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] font-serif perspective-[1500px]">

            {/* The Open Book */}
            <div className={`relative w-full h-full md:max-w-[450px] md:h-[85vh] md:rounded-r-3xl md:rounded-l-sm overflow-hidden shadow-[30px_30px_60px_rgba(0,0,0,0.9)] ${bgTheme} ${textTheme} border-l-[12px] border-l-[#5e2727] md:border-r-4 md:border-r-[#eaddcf]`}>

                {/* Page Texture overlay */}
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 shadow-[inset_-20px_0_30px_rgba(0,0,0,0.1)]"></div>

                {/* Page numbers */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-amber-950/40 text-sm font-bold z-50">
                    - {currentSlide + 1} -
                </div>

                {/* Slides content */}
                {/* using standard fade/slide for mobile reliability, true 3d page curl is complex in framer and looks bad if not perfect */}
                <AnimatePresence mode="wait" custom={1}>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(5px)' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 z-10"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>

                {/* Visible Bottom Navigation Arrows */}
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none">
                    <button onClick={handlePrev} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === 0 ? "opacity-0 pointer-events-none" : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"}`}>
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <button onClick={handleNext} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === totalSlides - 1 ? "opacity-0 pointer-events-none" : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"}`}>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {slides[currentSlide].locked && (
                    <div className="absolute bottom-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-800 text-sm italic font-bold">
                            Chapter Locked
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

