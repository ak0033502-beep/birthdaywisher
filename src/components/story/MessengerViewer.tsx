"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { WishData } from "@/lib/WishContext";
import { ChevronLeft, ChevronRight, Info, Send, Camera, Mic, Paperclip, Heart, Star, Sparkles, Smile, Image as ImageIcon, Video, Lock, Unlock, Phone, Video as VideoIcon } from "lucide-react";
import { LockTimer } from "@/components/story/LockTimer";

export function MessengerViewer({ data }: { data: WishData }) {
    const [opened, setOpened] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Locks
    const [dateGuess, setDateGuess] = useState("");
    const [dateUnlocked, setDateUnlocked] = useState(!data.secretDate);

    const [slidingPuzzleUnlocked, setSlidingPuzzleUnlocked] = useState(!data.puzzleImageUrl);

    const [quiz1Guess, setQuiz1Guess] = useState("");
    const [quiz1Unlocked, setQuiz1Unlocked] = useState(!data.quizQ1);

    const [quiz2Guess, setQuiz2Guess] = useState("");
    const [quiz2Unlocked, setQuiz2Unlocked] = useState(!data.quizQ2);

    // UI state
    const [typing, setTyping] = useState(true);

    useEffect(() => {
        if (!opened) return;
        setTyping(true);
        const t = setTimeout(() => setTyping(false), 1200);
        return () => clearTimeout(t);
    }, [currentSlide, opened]);

    const checkGuess = (guess: string, answer: string) => {
        if (!answer) return true;
        return guess.toLowerCase().trim() === answer.toLowerCase().trim();
    };

    const handleUnlockDate = () => {
        if (dateGuess === data.secretDate) {
            setDateUnlocked(true);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    };

    const handleUnlockQuiz1 = () => {
        if (checkGuess(quiz1Guess, data.quizA1 || "")) {
            setQuiz1Unlocked(true);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    };

    const handleUnlockQuiz2 = () => {
        if (checkGuess(quiz2Guess, data.quizA2 || "")) {
            setQuiz2Unlocked(true);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    };

    const MessageBubble = ({ text, isSender = false, delay = 0, isComponent = false }: { text?: string, isSender?: boolean, delay?: number, isComponent?: boolean, children?: React.ReactNode }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, delay }}
            className={`max-w-[80%] rounded-2xl px-4 py-3 mb-2 shadow-sm relative text-[15px] leading-snug ${isSender ? 'bg-blue-500 text-white self-end rounded-br-sm ml-auto' : 'bg-white text-black self-start rounded-bl-sm border border-gray-100'}`}
        >
            {text}
            {!isComponent && isSender && (
                <div className="absolute right-4 -bottom-4 text-[10px] text-gray-400 font-medium">Delivered</div>
            )}
        </motion.div>
    );

    const ComponentBubble = ({ children, isSender = false, delay = 0 }: { children: React.ReactNode, isSender?: boolean, delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, delay }}
            className={`max-w-[85%] rounded-2xl overflow-hidden mb-2 shadow-sm border border-gray-100 bg-white ${isSender ? 'self-end rounded-br-sm ml-auto' : 'self-start rounded-bl-sm'}`}
        >
            {children}
        </motion.div>
    );

    const slides = [
        // Slide 0: Intro
        {
            id: "intro",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    <MessageBubble text="Hey! 👋" delay={0} isSender={true} />
                    <MessageBubble text={`Happy Birthday, ${data.nickname || data.targetName}!! 🎉`} delay={0.8} isSender={true} />
                    <MessageBubble text={`Can you believe you are ${data.targetAge} now? Time flies 🚀`} delay={1.6} isSender={true} />
                </div>
            )
        },
        // Slide 1: Connection
        {
            id: "connection",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    <MessageBubble text={`To my favorite ${data.relationship?.replace("-", " ")} in the world... ❤️`} delay={0} isSender={true} />
                    <MessageBubble text="I made this little interactive chat for you to celebrate today." delay={0.8} isSender={true} />
                    <MessageBubble text="Tap the right side of the screen to send your replies and continue the story! 👉" delay={1.6} isSender={true} />
                </div>
            )
        },
        // Slide 2: Quirks
        {
            id: "quirks",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    <MessageBubble text="You know what I love about you?" delay={0} isSender={true} />
                    <ComponentBubble delay={0.8} isSender={true}>
                        <div className="p-4 bg-blue-500 text-white">
                            <ul className="list-disc pl-4 space-y-2 font-medium">
                                {data.quirks.map((q, i) => (
                                    <li key={i}>{q}</li>
                                ))}
                            </ul>
                        </div>
                    </ComponentBubble>
                    <MessageBubble text="Literally all of that. Never change. 🥺" delay={1.6} isSender={true} />
                </div>
            )
        },
        // Slide 3: Memory Tale
        {
            id: "tale",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    <MessageBubble text="Remember this?" delay={0} isSender={true} />
                    <ComponentBubble delay={0.8} isSender={true}>
                        <div className="p-4 bg-gray-100 text-gray-800 italic leading-relaxed border-l-4 border-blue-500">
                            &quot;{data.memoryTale}&quot;
                        </div>
                    </ComponentBubble>
                    <MessageBubble text="I still think about that all the time. 😂" delay={1.6} isSender={true} />
                </div>
            )
        },
        // Slide 4: Photo Gallery
        ...(data.mediaItems && data.mediaItems.length > 0 ? data.mediaItems.map((item, idx) => ({
            id: `media-${idx}`,
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    {idx === 0 && <MessageBubble text="Also, had to dig up this gem... 📸" delay={0} isSender={true} />}
                    {idx > 0 && <MessageBubble text="And this one... 🤭" delay={0} isSender={true} />}

                    <ComponentBubble delay={0.8} isSender={true}>
                        <div className="w-full aspect-square bg-black overflow-hidden relative">
                            {item.type === "video" ? (
                                <video src={item.url} autoPlay loop muted playsInline controls className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <img src={item.url} alt={`Memory ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                        </div>
                    </ComponentBubble>
                </div>
            )
        })) : []),
        // Slide 5: Secret Date (LOCK)
        {
            id: "date",
            locked: !dateUnlocked,
            content: (
                <div className="flex flex-col w-full px-4 pt-4">
                    <MessageBubble text="Hold on, security check. 🛑" delay={0} isSender={true} />
                    <MessageBubble text="When is our most special date?" delay={0.8} isSender={true} />

                    {!dateUnlocked ? (
                        <ComponentBubble delay={1.6} isSender={false}>
                            <div className="p-4 bg-gray-50 flex flex-col gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reply with the date</span>
                                <input
                                    type="date"
                                    value={dateGuess}
                                    onChange={(e) => setDateGuess(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 mb-2"
                                />
                                <button
                                    onClick={handleUnlockDate}
                                    className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl active:bg-blue-600 transition-colors flex justify-center items-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Send Reply
                                </button>
                            </div>
                        </ComponentBubble>
                    ) : (
                        <MessageBubble text={data.secretDate} delay={0} isSender={false} />
                    )}

                    {dateUnlocked && <MessageBubble text="Correct! You passed the test. 🥳" delay={0.5} isSender={true} />}
                </div>
            )
        },
        // Slide 6: Core Message
        {
            id: "core",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4 pb-20 overflow-y-auto">
                    <MessageBubble text="Okay, serious time for a second." delay={0} isSender={true} />
                    <ComponentBubble delay={0.8} isSender={true}>
                        <div className="p-5 bg-blue-500 text-white font-medium leading-relaxed whitespace-pre-wrap">
                            {data.coreMessage}
                        </div>
                    </ComponentBubble>
                </div>
            )
        },
        // Slide 7: Future Promise (Finale)
        {
            id: "finale",
            locked: false,
            content: (
                <div className="flex flex-col w-full px-4 pt-4 pb-20">
                    <MessageBubble text={`My promise to you:`} delay={0} isSender={true} />
                    <MessageBubble text={data.futurePromise} delay={0.8} isSender={true} />

                    <div className="mt-8 flex justify-center w-full">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: "spring" }}
                            className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full font-medium"
                        >
                            Read {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="mt-8 text-center text-rose-500 font-bold text-2xl animate-pulse flex items-center justify-center gap-2">
                        Happy Birthday! <Heart fill="currentColor" />
                    </motion.div>
                </div>
            )
        }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (slides[currentSlide].locked) return;
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(s => s + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(s => s - 1);
        }
    };


    if (!opened) {
        return (
            <div className="w-full h-svh bg-black flex items-center justify-center p-4">
                {/* Lock Screen Notification */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-sm bg-[#2c2c2e]/90 backdrop-blur-xl rounded-3xl p-4 cursor-pointer hover:bg-[#3c3c3e]/90 transition-colors shadow-2xl relative"
                    onClick={() => {
                        setOpened(true);
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
                    }}
                >
                    <div className="flex justify-between items-center mb-2 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path fillRule="evenodd" d="M12 21a9 9 0 100-18 9 9 0 000 18zm-.232-5.36l5-6a.75.75 0 111.164.96l-5.5 6.6a.75.75 0 01-1.12.04l-3-3a.75.75 0 111.02-1.1l2.436 2.44z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="text-white/60 text-[13px] font-semibold tracking-wide">MESSAGES</span>
                        </div>
                        <span className="text-white/40 text-[13px]">now</span>
                    </div>

                    <div className="px-1">
                        <h3 className="text-white font-semibold text-[15px] mb-0.5">{data.targetName}</h3>
                        <p className="text-white/80 text-[15px] line-clamp-2">I have a surprise for you. Tap to view...</p>
                    </div>

                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity rounded-3xl"></div>
                </motion.div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/80 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-0 md:p-4 overflow-hidden select-none bg-gray-100 font-sans">

            {/* Phone Container */}
            <div className={`relative w-full h-full md:max-w-[400px] md:h-[85vh] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#f2f2f7] border-0 md:border-[12px] md:border-black flex flex-col`}>

                {/* iOS Header */}
                <div className="bg-[#f2f2f7]/90 backdrop-blur-md pt-12 pb-2 px-4 flex items-center justify-between border-b border-gray-300/50 z-50 shrink-0 sticky top-0">
                    <button className="flex items-center text-blue-500 font-medium text-[17px] -ml-2 hover:opacity-70">
                        <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                        <span className="mb-[1px]">2</span>
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-gradient-to-tr from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white/50">
                            {data.targetName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                            {data.targetName} <ChevronRight className="w-3 h-3 -ml-1 text-gray-300" strokeWidth={3} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-blue-500 -mr-1">
                        <VideoIcon className="w-6 h-6 hover:opacity-70 cursor-pointer" />
                    </div>
                </div>

                {/* Slides content mapping to Chat Area */}
                <div className="flex-1 overflow-y-auto w-full relative custom-scrollbar flex flex-col justify-end pt-20">

                    {/* Timestamp */}
                    <div className="text-center text-[11px] text-gray-400 font-medium mb-6 mt-4 uppercase tracking-wider">
                        Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Messages Container */}
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col justify-end min-h-full pb-4 px-2"
                        >
                            {slides[currentSlide].content}

                            {/* Typing indicator */}
                            {typing && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="bg-gray-200 w-16 h-8 rounded-full rounded-bl-sm self-start ml-4 mt-2 flex items-center justify-center gap-1 px-3 shadow-sm"
                                >
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* iOS Compose Area */}
                <div className="bg-[#f2f2f7] pt-3 pb-8 px-4 flex items-end gap-3 border-t border-gray-300/50 shrink-0 relative z-50">
                    <button className="text-gray-400 hover:text-gray-600 pb-1.5 hidden sm:block">
                        <PlusIcon className="w-7 h-7" />
                    </button>

                    <div className="flex-1 min-h-[36px] bg-white border border-gray-300 rounded-full px-4 py-1.5 flex items-center justify-between text-[17px] shadow-sm">
                        <span className="text-gray-300 select-none">iMessage</span>
                        <Mic className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* Visible Bottom Navigation Arrows */}
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none">
                    <button onClick={handlePrev} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === 0 ? "opacity-0 pointer-events-none" : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"}`}>
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <button onClick={handleNext} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${currentSlide === totalSlides - 1 ? "opacity-0 pointer-events-none" : "bg-black/40 border-white/20 text-white/80 hover:bg-white/10"}`}>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute top-[88px] bottom-[90px] right-0 w-3/4 z-40 cursor-pointer" onClick={handleNext} />

            </div>
            {/* Home Indicator on Desktop frame */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/80 rounded-full hidden md:block"></div>
        </div>
    );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    )
}
