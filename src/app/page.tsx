"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Gift, Heart, Zap, Music, Ticket, Camera, Clock, MessageCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />

      {/* Hero Section */}
      <main className="w-full relative z-10">
        <section className="container max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wide">The #1 Online Birthday Card Maker & Wish Generator</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Make Their Birthday <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">Unforgettable.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-12 font-medium"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ditch the boring text messages and basic WhatsApp forwards. Create a highly interactive, gamified, and emotional story-style birthday wish in 3 minutes. Stop sending plain text, start creating magic.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/create">
              <button className="relative group overflow-hidden rounded-full p-[3px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                <div className="relative flex items-center gap-3 px-10 py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                  <span className="font-bold text-xl group-hover:text-white transition-colors">Create Free Birthday Wish</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                </div>
              </button>
            </Link>
            <span className="text-sm text-foreground/50 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> Takes just 3 minutes • 100% Free
            </span>
          </motion.div>
        </section>

        {/* Feature Showcase Grid - SEO Optimized */}
        <section className="container max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Not Your Average Birthday Card!</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">We&apos;ve engineered the ultimate emotional rollercoaster. From interactive puzzles to a stunning final celebration.</p>
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
          </div>
        </section>

        {/* How it Works / Social Proof */}
        <section className="w-full bg-white/5 py-24">
          <div className="container max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-16">How To Create The Best Birthday Surprise Online</h2>

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

      </main>

      {/* SEO Footer */}
      <footer className="w-full border-t border-white/10 glass-panel mt-12 py-12 px-6">
        <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">BirthdayWisher.in</h4>
            <p className="text-foreground/60">The ultimate aesthetic birthday wisher tool. Create interactive, emotional, and unforgettable web-based greeting cards online for free.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Popular Nav</h4>
            <ul className="space-y-2 text-foreground/60">
              <li><Link href="/create" className="hover:text-primary transition-colors">Create Birthday Wish</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Birthday Wish Ideas (Blog)</Link></li>
              <li><Link href="/blog/best-friend-quotes" className="hover:text-primary transition-colors">For Best Friends</Link></li>
              <li><Link href="/blog/romantic-wishes" className="hover:text-primary transition-colors">For Partner / Boyfriend / Girlfriend</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Legal & Trust</h4>
            <ul className="space-y-2 text-foreground/60">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Use Cases</h4>
            <ul className="space-y-2 text-foreground/60">
              <li><Link href="/use-cases/unique-birthday-gift-online" className="hover:text-primary transition-colors">Unique Birthday Gift Online</Link></li>
              <li><Link href="/use-cases/digital-story-greeting-card" className="hover:text-primary transition-colors">Digital Story Greeting Card</Link></li>
              <li><Link href="/use-cases/boyfriend-birthday-surprise" className="hover:text-primary transition-colors">Boyfriend Birthday Surprise</Link></li>
              <li><Link href="/use-cases/girlfriend-birthday-surprise" className="hover:text-primary transition-colors">Girlfriend Birthday Surprise</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-white/10 text-foreground/40 text-sm flex flex-col gap-2">
          <p>© {new Date().getFullYear()} BirthdayWisher.in. Crafted with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> to make birthdays special.</p>
          <p className="font-medium text-foreground/50">Property of Akalloverservices | Contact: <a href="mailto:akalloverservices@gmail.com" className="hover:text-primary transition-colors">akalloverservices@gmail.com</a></p>
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
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-primary/20 border-4 border-background">
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/60 px-4 leading-relaxed">{desc}</p>
    </div>
  )
}
