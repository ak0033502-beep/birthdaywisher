"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gift, Heart, Zap, Music, Ticket, Camera, Clock, MessageCircle, PlayCircle, ShieldCheck, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WishCounter } from "@/components/ui/WishCounter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />

      {/* Hero Section */}
      <main className="w-full relative z-10">
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wide">The #1 Online Birthday & Anniversary Wish Creator</span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Make Their Birthday <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">Unforgettable.</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-8 sm:mb-12 font-medium px-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ditch the boring text messages and basic WhatsApp forwards. Create a highly interactive, gamified, and emotional story-style birthday wish or wedding anniversary wish for couple in 3 minutes. Perfect for birthdays, anniversaries, and celebrations. Stop sending plain text, start creating magic.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/create">
                <button className="relative group overflow-hidden rounded-full p-[3px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                  <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">Create Birthday Wish</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                  </div>
                </button>
              </Link>
              <Link href="/anniversary">
                <button className="relative group overflow-hidden rounded-full p-[3px] shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                  <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">Anniversary Wish 💍</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                  </div>
                </button>
              </Link>
            </div>

            <a href="https://guesskaro.games/couples" target="_blank" rel="noopener noreferrer">
              <button className="relative group overflow-hidden rounded-full p-[3px] shadow-xl shadow-pink-500/10 hover:shadow-pink-500/30 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                  <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">🎮 Play Couple Quiz Game</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                </div>
              </button>
            </a>

            <span className="text-sm text-foreground/50 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> Takes just 3 minutes • 100% Free
            </span>

            <WishCounter variant="full" />
          </motion.div>
        </section>

        {/* Feature Showcase Grid - SEO Optimized */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">Not Your Average Birthday or Anniversary Card!</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">We&apos;ve engineered the ultimate emotional rollercoaster for birthdays & wedding anniversary wishes for couple. From interactive puzzles to a stunning final celebration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Camera className="w-6 h-6 text-pink-500" />}
              title="Heartbeat Photo Reveal"
              desc="Their favorite photo slowly fades in, beating like a heart to the rhythm of the background music."
            />
            <FeatureCard
              icon={<Ticket className="w-6 h-6 text-yellow-500" />}
              title="The Golden Ticket"
              desc="A glowing, customized ticket displaying your 'Future Promise' for their amazing year ahead."
            />
            <FeatureCard
              icon={<Music className="w-6 h-6 text-blue-500" />}
              title="Voice Note Autoplay"
              desc="As the final fireworks explode, your actual recorded voice message plays automatically."
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6 text-purple-500" />}
              title="Floating Memories"
              desc="Their quirky traits and nicknames float across the screen as interactive, poppable bubbles."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-green-500" />}
              title="Interactive Puzzle Games"
              desc="Make them earn it! They have to guess your secret date and pass a 'How well do you know me' quiz."
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6 text-red-500" />}
              title="Haptic Virtual Hug"
              desc="A long-press button that physically vibrates their phone, delivering a digital hug across the internet."
            />
            <FeatureCard
              icon={<Gift className="w-6 h-6 text-amber-500" />}
              title="Anniversary Wishes for Couple"
              desc="Celebrate your wedding anniversary with a gamified, interactive wish. Perfect romantic anniversary wishes for couple — from 1st to 50th year."
            />
          </div>
        </section>

        {/* Security & Privacy Section - NEW */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden rounded-2xl sm:rounded-[3rem] bg-gradient-to-br from-background via-black/50 to-background border border-white/5 my-6 sm:my-12">
          {/* Subtle glow behind the shield */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="glass-panel p-5 sm:p-8 md:p-12 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150" />

                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  Military-Grade Birthday Privacy
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">10-Hour Self Destruct</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">The timer doesn&apos;t start until they open the link. Exactly 10 hours later, the wish vanishes forever. It&apos;s an exclusive, fleeting experience that demands their full attention.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Lock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">End-to-End Obfuscation</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">Unlike sending photos over WhatsApp, your memories and inside jokes are housed in a secure Vercel Postgres database accessible only via the generated shortlink.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Trash2 className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">Automated Media Wiping</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">Your uploaded photos and intimate voice notes are stored securely on Cloudinary. Once the 10 hours are up, our serverless cron automatically permadeletes the assets. We keep nothing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 text-left lg:pl-8 relative z-10">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                  100% Private & Secure
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">Create Intimate Wishes Without The Fear.</h2>
                <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                  We know that the best birthday wishes contain embarrassing photos, deep emotional texts, and inside jokes that no one else should ever see.
                </p>
                <p className="text-lg text-foreground/70 mb-10 leading-relaxed font-medium">
                  That&apos;s why birthdaywisher.fun is engineered with a strict <span className="text-emerald-400 font-bold">\"Read & Destroy\"</span> philosophy. Share your heart out, knowing it will all disappear beautifully in 10 hours.
                </p>

                <Link href="/create">
                  <button className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Create a Secure Wish <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works / Social Proof */}
        <section className="w-full bg-white/5 py-24">
          <div className="container max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12 sm:mb-16">How To Create The Best Birthday & Anniversary Surprise Online</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (Desktop only) */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

              <StepCard
                number="1"
                title="Personalize The Journey"
                desc="Answer 20 fun questions about the birthday boy/girl. Add inside jokes, upload photos, and set the emotional vibe (Roast or Toast)."
              />
              <StepCard
                number="2"
                title="Select Aesthetics"
                desc="Choose from premium CSS themes, select soundtrack music, and customize the final fireworks celebration."
              />
              <StepCard
                number="3"
                title="Share The Secret Link"
                desc="Get a unique URL instantly. Send it via WhatsApp or Instagram. The link auto-destructs after opening for privacy!"
              />
            </div>

            <div className="mt-20">
              <Link href="/create">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,105,180,0.4)] transition-all hover:-translate-y-1">
                  Start Customizing Now
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials / Social Proof */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6 border-primary/30">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium tracking-wide">Loved by Real People</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">What People Are Saying</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">Real reactions from people who received interactive birthday wishes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              quote="My girlfriend literally cried happy tears when the voice note played over the photo reveal. This is 1000x better than a WhatsApp text."
              name="Rahul M."
              context="Created a birthday wish for his girlfriend"
              rating={5}
            />
            <TestimonialCard
              quote="I was skeptical about a digital gift, but the puzzle and quiz made it so interactive. My best friend screenshotted every step before it self-destructed!"
              name="Priya K."
              context="Created a birthday wish for her best friend"
              rating={5}
            />
            <TestimonialCard
              quote="Used this for my parents' 25th wedding anniversary. The floating memory bubbles with our family inside jokes made my mom tear up. Best free tool I've found."
              name="Amit S."
              context="Created an anniversary wish for his parents"
              rating={5}
            />
            <TestimonialCard
              quote="The roast section had my brother absolutely dying. Then the emotional voice note hit and he went silent. Perfect balance of funny and heartfelt."
              name="Sneha R."
              context="Created a birthday wish for her brother"
              rating={5}
            />
            <TestimonialCard
              quote="I forgot my friend's birthday and found this at 11 PM. Made the whole thing in 3 minutes and she thought I'd been planning it for weeks. Lifesaver."
              name="Karan D."
              context="Last-minute birthday wish for a friend"
              rating={5}
            />
            <TestimonialCard
              quote="We're in a long-distance relationship and this was the most personal digital gift I've ever sent. The Golden Ticket for our next date was such a sweet touch."
              name="Meera J."
              context="Created a birthday wish for her boyfriend"
              rating={5}
            />
          </div>
        </section>

      </main>
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
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-primary/20 border-4 border-background">
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/60 px-4 leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ quote, name, context, rating }: { quote: string, name: string, context: string, rating: number }) {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col h-full">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
      </div>
      <blockquote className="text-foreground/80 leading-relaxed flex-grow mb-6 text-sm sm:text-base">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="pt-4 border-t border-white/5">
        <p className="font-bold text-white text-sm">{name}</p>
        <p className="text-foreground/50 text-xs">{context}</p>
      </div>
    </div>
  );
}
