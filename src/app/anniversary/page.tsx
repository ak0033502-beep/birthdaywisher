"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, ShieldCheck, Lock, Clock, Trash2, Camera, Music, Zap, MessageCircle, Gift, Ticket } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { WishCounter } from "@/components/ui/WishCounter";

export default function AnniversaryPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background Orbs — warm gold/amber theme */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[150px] -z-10 mix-blend-screen" />
            <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[150px] -z-10 mix-blend-screen" />
            <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[120px] -z-10 mix-blend-screen" />

            {/* Hero Section */}
            <main className="w-full relative z-10">
                <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-amber-500/30"
                    >
                        <Heart className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium tracking-wide">Wedding Anniversary Wishes for Couple</span>
                    </motion.div>

                    <motion.h1
                        className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1]"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Celebrate Your Love <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-amber-500 animate-gradient-x">Like Never Before.</span>
                    </motion.h1>

                    <motion.p
                        className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-8 sm:mb-12 font-medium px-2"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Ditch the generic &quot;Happy Anniversary&quot; text. Create a highly interactive, gamified, and deeply emotional anniversary wish for your partner, your parents, or any couple you love. Photos, voice notes, quizzes, and a breathtaking finale — all wrapped in military-grade privacy.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Link href="/create?type=anniversary">
                            <button className="relative group overflow-hidden rounded-full p-[3px] shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">
                                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                                <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">Create Anniversary Wish</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                                </div>
                            </button>
                        </Link>

                        <a href="https://guesskaro.games/couples" target="_blank" rel="noopener noreferrer">
                            <button className="relative group overflow-hidden rounded-full p-[3px] shadow-xl shadow-pink-500/10 hover:shadow-pink-500/30 transition-shadow">
                                <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                                <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">🎮 Play Couple Quiz Game</span>
                                    <Gift className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                                </div>
                            </button>
                        </a>

                        <span className="text-sm text-foreground/50 font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Takes 3 minutes • 100% Free • 100% Private
                        </span>

                        <WishCounter variant="anniversary" />
                    </motion.div>
                </section>

                {/* Privacy & Security Section — TOP PRIORITY */}
                <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden rounded-2xl sm:rounded-[3rem] bg-gradient-to-br from-background via-black/50 to-background border border-emerald-500/10 my-6 sm:my-12">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-1 lg:order-1 text-left relative z-10">
                            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Top-Notch Privacy & Security
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">Your Love Story. <br /><span className="text-emerald-400">Zero Compromises on Privacy.</span></h2>
                                <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
                                    Anniversary wishes contain your most intimate moments — wedding photos, voice recordings, and deep emotional messages. We treat this data like it&apos;s sacred, because it is.
                                </p>
                                <p className="text-lg text-foreground/70 mb-10 leading-relaxed font-medium">
                                    Our <span className="text-emerald-400 font-bold">&quot;Read &amp; Destroy&quot;</span> architecture ensures your memories exist only for the moment they&apos;re meant to be experienced — then they vanish forever.
                                </p>
                            </motion.div>
                        </div>

                        <div className="order-2 lg:order-2 relative">
                            <div className="glass-panel p-5 sm:p-8 md:p-12 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150" />

                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                    Military-Grade Privacy
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                            <Clock className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 text-white">10-Hour Self Destruct</h4>
                                            <p className="text-foreground/70 text-sm leading-relaxed">The countdown starts only when the couple opens the link. After 10 hours, the entire wish — photos, voice notes, and messages — vanishes permanently. No traces, no archives.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                            <Lock className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 text-white">End-to-End Obfuscated Storage</h4>
                                            <p className="text-foreground/70 text-sm leading-relaxed">Your wedding photos and intimate voice recordings are never publicly accessible. They live in a secure, encrypted database accessible only via the unique generated shortlink.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                            <Trash2 className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 text-white">Automated Media Nuking</h4>
                                            <p className="text-foreground/70 text-sm leading-relaxed">All uploaded photos and voice notes are permanently deleted from our Cloudinary servers via automated cron once the 10-hour window expires. We keep absolutely nothing.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 text-white">No Account Required</h4>
                                            <p className="text-foreground/70 text-sm leading-relaxed">No sign-up, no email, no data harvesting. Create your anniversary wish anonymously. We don&apos;t track who creates what — your love story stays yours alone.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">What&apos;s Inside Your Anniversary Wish?</h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto text-lg">A 20-step interactive love story engineered to make any couple laugh, cry, and fall in love all over again.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Camera className="w-6 h-6 text-pink-500" />}
                            title="Heartbeat Photo Reveal"
                            desc="Your favorite couple photo slowly fades in, beating like a heart to the rhythm of the background music."
                        />
                        <FeatureCard
                            icon={<Ticket className="w-6 h-6 text-yellow-500" />}
                            title="The Golden Ticket"
                            desc="A glowing, customized ticket with your 'Future Promise' — a romantic getaway, a dinner date, or a shared dream."
                        />
                        <FeatureCard
                            icon={<Music className="w-6 h-6 text-blue-500" />}
                            title="Voice Note Surprise"
                            desc="Record your heartfelt anniversary message. It plays automatically during the stunning finale with fireworks."
                        />
                        <FeatureCard
                            icon={<MessageCircle className="w-6 h-6 text-purple-500" />}
                            title="Floating Memories"
                            desc="Your partner's quirky traits and inside jokes float across the screen as interactive, poppable bubbles."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-green-500" />}
                            title="'How Well Do You Know Me?' Quiz"
                            desc="They must prove their love by answering custom trivia about your relationship to unlock the final message."
                        />
                        <FeatureCard
                            icon={<Heart className="w-6 h-6 text-red-500" />}
                            title="Virtual Hug & Haptic Feedback"
                            desc="A long-press button that vibrates their phone, delivering a digital hug across any distance."
                        />
                    </div>
                </section>

                {/* How It Works */}
                <section className="w-full bg-white/5 py-24">
                    <div className="container max-w-6xl mx-auto px-6 text-center">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12 sm:mb-16">3 Steps to the Perfect Anniversary Surprise</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-0" />

                            <StepCard number="1" title="Pour Your Heart Out" desc="Answer fun prompts about your relationship. Upload wedding photos, record a voice note, and set the emotional vibe." />
                            <StepCard number="2" title="Choose the Aesthetics" desc="Select premium themes, pick anniversary music, and customize the grand finale celebration with confetti or fireworks." />
                            <StepCard number="3" title="Send the Secret Link" desc="Get a unique, private URL instantly. Share it via WhatsApp. The link self-destructs 10 hours after opening." />
                        </div>

                        <div className="mt-20">
                            <Link href="/create?type=anniversary">
                                <button className="px-8 py-4 bg-amber-500 text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1">
                                    Create Anniversary Wish Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/10 glass-panel mt-12 py-12 px-6">
                <div className="container max-w-7xl mx-auto text-center">
                    <p className="text-foreground/40 text-sm">
                        © {new Date().getFullYear()} birthdaywisher.fun · <Link href="/" className="hover:text-primary transition-colors">Home</Link> · <Link href="/blog/wedding-anniversary-wishes-for-couple" className="hover:text-primary transition-colors">Anniversary Wishes Blog</Link> · <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-panel p-8 text-left hover:bg-white/5 transition-colors duration-300 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500 scale-150 transform translate-x-4 -translate-y-4">
                {icon}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-white/10">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-foreground/70 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-amber-500/20 border-4 border-background">
                {number}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-foreground/60 px-4 leading-relaxed">{desc}</p>
        </div>
    );
}
