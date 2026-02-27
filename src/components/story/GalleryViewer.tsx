"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { ChevronRight, KeyRound, Unlock, Ticket, Image as ImageIcon, Search } from "lucide-react";

export function GalleryViewer({ data }: { data: WishData }) {
    const [entered, setEntered] = useState(false);
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

    const errorMessages = ["I'm sorry, that is incorrect.", "Please try again.", "The curator shakes their head.", "Access to this exhibit is restricted."];
    const successMessages = ["Fascinating! You may proceed.", "Correct. A brilliant deduction.", "The exhibit opens for you.", "Exquisite memory."];
    const getRandomMsg = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            setDateMsg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#52525b', '#e4e4e7', '#a1a1aa'] });
        } else {
            setDateMsg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            setQuiz1Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#52525b', '#e4e4e7', '#a1a1aa'] });
        } else {
            setQuiz1Msg(getRandomMsg(errorMessages));
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            setQuiz2Msg(getRandomMsg(successMessages));
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#52525b', '#e4e4e7', '#a1a1aa'] });
        } else {
            setQuiz2Msg(getRandomMsg(errorMessages));
        }
    };

    // Styling constants
    const accent = "text-zinc-800";
    const frameBase = "bg-white p-4 shadow-[10px_10px_30px_rgba(0,0,0,0.15)] border-2 border-zinc-200";

    const ArtworkPlaque = ({ title, desc }: { title: string, desc?: string }) => (
        <div className="mt-8 bg-white px-6 py-4 shadow-sm border border-zinc-200 text-center w-3/4 max-w-sm mx-auto relative">
            {/* Small golden screws in corners */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-300"></div>

            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-zinc-900 mb-1">{title}</h3>
            {desc && <p className="text-xs text-zinc-500 font-sans">{desc}</p>}
        </div>
    );

    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 relative z-20 w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`${frameBase} w-full max-w-md relative before:absolute before:-inset-4 before:border before:border-zinc-200/50 before:-z-10`}
                    >
                        <div className="bg-zinc-50 py-16 px-8 border border-zinc-100 h-full flex flex-col justify-center shadow-inner">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-zinc-800 mb-6 leading-tight tracking-[0.1em] uppercase">
                                The<br />{data.nickname || data.targetName}<br />Collection
                            </h1>
                            <div className="w-16 h-[1px] bg-zinc-300 mx-auto my-6"></div>
                            <p className="text-sm text-zinc-500 tracking-[0.2em] font-sans uppercase">
                                Exhibit {data.targetAge}
                            </p>
                        </div>
                    </motion.div>
                    <ArtworkPlaque title="Main Hall" desc="Curated with love" />
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 w-full max-w-lg mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                        className="text-3xl font-serif text-zinc-800 mb-8 leading-relaxed"
                    >
                        A study in the dynamic of<br />
                        <span className="italic">The {data.relationship?.replace("-", " ")}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg leading-loose text-zinc-600 font-serif text-justify"
                    >
                        Every great artist needs a muse. You have been mine for as long as I can recall.
                        This exhibition attempts to capture the essence of what makes you truly remarkable.
                    </motion.p>
                </div>
            )
        },
        // Slide 2: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full px-4 sm:px-8 w-full max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4 relative z-10 w-full mb-8">
                        {data.quirks.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.2 }}
                                className={`p-4 flex items-center justify-center text-center ${frameBase} aspect-square ${i === 2 ? 'col-span-2 aspect-auto py-8' : ''}`}
                            >
                                <span className="text-zinc-700 font-serif italic text-lg leading-snug">{q}</span>
                            </motion.div>
                        ))}
                    </div>
                    <ArtworkPlaque title="Character Studies" desc={`Mixed media, ${new Date().getFullYear()}`} />
                </div>
            )
        },
        // Slide 3: Memory Tale
        {
            id: "tale",
            locked: false,
            content: (
                <div className="flex flex-col justify-center h-full px-4 sm:px-8 relative max-w-lg mx-auto">
                    <div className={`p-10 ${frameBase} relative overflow-hidden bg-[#fafafa]`}>
                        <Search className="absolute top-4 right-4 w-6 h-6 text-zinc-300" strokeWidth={1.5} />
                        <p className="text-lg leading-loose font-serif text-zinc-700 relative z-10 text-justify first-line:uppercase first-line:tracking-widest first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:font-bold">
                            {data.memoryTale}
                        </p>
                    </div>
                    <ArtworkPlaque title="A Lasting Impression" desc="Oral History Project" />
                </div>
            )
        },
        // Slide 4: Photo Gallery
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center h-full w-full px-3 sm:px-6 relative">
                    <motion.div
                        className={`w-full max-w-sm ${frameBase} pb-16 relative`} // Extra thick bottom border for polaroid/frame style
                    >
                        <div className="w-full aspect-[4/5] bg-zinc-100 overflow-hidden relative border border-zinc-200/50 shadow-inner">
                            {/* Realistic matting effect */}
                            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 z-20"></div>
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-[0.8]" />
                            ) : (
                                <img src={item.url} alt={`Gallery Piece ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-[0.8]" />
                            )}
                        </div>
                    </motion.div>
                    <ArtworkPlaque title={`Untitled No. ${idx + 1}`} desc="Photography Collection" />
                </div>
            )
        })) : []),
        // Slide 5: Secret Date (LOCK)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8 relative z-20 max-w-sm mx-auto">
                    {!dateUnlocked ? (
                        <div className={`w-full p-8 ${frameBase} relative bg-zinc-50`}>
                            <KeyRound className={`w-8 h-8 mx-auto mb-6 text-zinc-400`} strokeWidth={1.5} />

                            <h2 className="text-xl font-serif mb-2 text-zinc-800">The Vault Room</h2>
                            <p className="text-sm opacity-60 mb-8 text-zinc-500 font-sans max-w-[200px] mx-auto">Only patrons possessing the historical date may enter.</p>

                            <input
                                type="date"
                                value={dateGuess}
                                onChange={(e) => setDateGuess(e.target.value)}
                                className="w-full p-3 bg-white border border-zinc-300 text-zinc-800 font-sans text-lg outline-none focus:border-zinc-500 mb-6 text-center shadow-inner"
                            />
                            <button
                                onClick={handleUnlockDate}
                                className="w-full py-3 bg-zinc-800 text-white font-sans text-sm tracking-widest uppercase hover:bg-zinc-700 transition-colors"
                            >
                                Request Entry
                            </button>
                            {dateMsg && <p className="mt-4 text-xs font-serif italic text-red-600">{dateMsg}</p>}
                        </div>
                    ) : (
                        <div className="text-center z-20">
                            <Unlock className={`w-12 h-12 mx-auto mb-6 text-zinc-800`} strokeWidth={1} />
                            <h2 className="text-xl font-serif mb-4 text-zinc-800">The Vault is Open</h2>
                            <div className="text-4xl font-sans tracking-[0.2em] text-zinc-900 border-t border-b border-zinc-300 py-4 px-2 my-6">
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
                <div className="flex flex-col justify-start h-full px-3 sm:px-6 pt-12 sm:pt-20 w-full max-w-lg mx-auto">
                    <div className={`p-8 md:p-12 ${frameBase} relative overflow-hidden bg-[#fdfdfd]`}>
                        <div className="text-lg leading-loose font-serif text-zinc-800 overflow-y-auto max-h-[60vh] custom-scrollbar relative z-10 text-justify">
                            {data.coreMessage}
                        </div>
                    </div>
                    <ArtworkPlaque title="The Artist's Statement" desc="Ink on paper" />
                </div>
            )
        },
        // Slide 7: Future Promise
        {
            id: "finale",
            locked: false,
            content: (
                <div className="flex flex-col items-center justify-center text-center h-full px-4 sm:px-8 relative z-20 max-w-lg mx-auto">
                    <h1 className="text-2xl font-serif text-zinc-800 mb-12 uppercase tracking-[0.2em]">
                        The Masterpiece
                    </h1>

                    <p className="text-2xl leading-relaxed font-serif italic text-zinc-900 mb-16 relative">
                        <span className="text-6xl text-zinc-200 absolute -top-10 -left-6 -z-10 font-serif">&quot;</span>
                        {data.futurePromise}
                        <span className="text-6xl text-zinc-200 absolute -bottom-16 -right-2 -z-10 font-serif">&quot;</span>
                    </p>

                    <div className="w-12 h-[1px] bg-zinc-400 mb-8"></div>

                    <p className="text-xs font-sans tracking-[0.3em] uppercase text-zinc-500">
                        Thank you for attending.
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


    if (!entered) {
        return (
            <div className="w-full h-svh bg-zinc-100 flex flex-col items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 opacity-40 bg-[url('https://transparenttextures.com/patterns/concrete-wall.png')] pointer-events-none mix-blend-multiply"></div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                    onClick={() => {
                        setEntered(true);
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#ffffff', '#f4f4f5', '#e4e4e7'],
                            disableForReducedMotion: true
                        });
                    }}
                >
                    <div className="w-[300px] h-32 bg-zinc-50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-t border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500">
                        {/* Ticket perforation edges */}
                        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-zinc-100 rounded-full shadow-inner"></div>
                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-zinc-100 rounded-full shadow-inner"></div>

                        <div className="flex items-center gap-4 text-zinc-800">
                            <Ticket className="w-8 h-8 opacity-40" strokeWidth={1} />
                            <div className="text-left border-l border-zinc-300 pl-4">
                                <h2 className="font-serif text-lg uppercase tracking-widest">{data.targetName}</h2>
                                <p className="font-sans text-xs text-zinc-500 tracking-wider">ADMIT ONE - VIP GUEST</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-zinc-500 font-sans tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                        Present Ticket to Enter
                    </div>
                </motion.div>
            </div>
        );
    }

    // Gallery Room Wall Texture
    const WallBackground = () => (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Soft gallery lighting gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-zinc-100 to-zinc-200"></div>
            {/* Museum wall texture */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://transparenttextures.com/patterns/clean-text-pattern.png')] mix-blend-multiply"></div>

            {/* Track lighting cones */}
            <div className="absolute top-0 left-1/4 w-[50%] h-[100%] bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-3xl transform -skew-x-12 opacity-60"></div>
            <div className="absolute top-0 right-1/4 w-[50%] h-[100%] bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-3xl transform skew-x-12 opacity-60"></div>

            {/* Floor/Baseboard line if we wanted pseudo 3D, keeping it 2.5D flat for now */}
        </div>
    );

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-0 md:p-8 overflow-hidden select-none bg-zinc-200">

            {/* Gallery Room Container */}
            <div className={`relative w-full h-full md:max-w-[450px] md:h-[85vh] md:rounded-lg overflow-hidden md:shadow-[0_40px_80px_rgba(0,0,0,0.2)] bg-zinc-100 flex flex-col`}>

                <WallBackground />

                {/* Slides content */}
                {/* Crossfade animation for walking down the gallery hall */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-10 pt-12 md:pt-4"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>

                {/* Status dot indicators (subtle gallery floor markers) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <div
                            key={i}
                            className={`transition-all duration-700 w-1.5 h-1.5 rounded-full ${i === currentSlide ? 'bg-zinc-800' : 'bg-zinc-300'}`}
                        />
                    ))}
                </div>

                {/* Tap Navigation Zones */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={handlePrev} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-pointer" onClick={handleNext} />

            </div>
        </div>
    );
}
