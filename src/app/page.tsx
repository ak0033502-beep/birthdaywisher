"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gift, Heart, Zap, Music, Ticket, Camera, Clock, MessageCircle, PlayCircle, ShieldCheck, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WishCounter } from "@/components/ui/WishCounter";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations } from "@/lib/siteTranslations";

export default function Home() {
  const { lang } = useSiteLanguage();
  const s = getSiteTranslations(lang);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BirthdayWisher.fun",
            "url": "https://birthdaywisher.fun",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Create interactive, gamified birthday wishes & wedding anniversary wishes for couple. Personalize puzzles, upload photos, add voice notes, and trigger confetti explosions — all for free.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1200",
              "bestRating": "5"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How To Create The Best Birthday & Anniversary Surprise Online",
            "description": "Create an interactive, gamified birthday or anniversary wish in 3 simple steps.",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Personalize The Journey",
                "text": "Answer 20 fun questions about the birthday boy/girl. Add inside jokes, upload photos, and set the emotional vibe (Roast or Toast).",
                "position": 1
              },
              {
                "@type": "HowToStep",
                "name": "Select Aesthetics",
                "text": "Choose from premium CSS themes, select soundtrack music, and customize the final fireworks celebration.",
                "position": 2
              },
              {
                "@type": "HowToStep",
                "name": "Share The Secret Link",
                "text": "Get a unique URL instantly. Send it via WhatsApp or Instagram. The link auto-destructs after opening for privacy!",
                "position": 3
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is BirthdayWisher.fun free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! BirthdayWisher.fun is 100% free. You can create unlimited interactive birthday wishes and anniversary wishes without any charge."
                }
              },
              {
                "@type": "Question",
                "name": "How long does the birthday wish link last?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The wish link auto-destructs 10 hours after the recipient first opens it. This ensures privacy — your photos, voice notes, and messages are permanently deleted after viewing."
                }
              },
              {
                "@type": "Question",
                "name": "Can I create anniversary wishes for couples?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! BirthdayWisher.fun supports both birthday wishes and wedding anniversary wishes for couples from 1st to 50th year and beyond."
                }
              },
              {
                "@type": "Question",
                "name": "What makes this different from a regular birthday card?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Unlike static cards, BirthdayWisher creates a 20-step interactive journey with puzzles, quizzes, voice notes, photo reveals, and confetti celebrations. The recipient has to earn their wish through fun challenges."
                }
              },
              {
                "@type": "Question",
                "name": "Is my data private and secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. All uploaded photos, voice notes, and personal messages are automatically deleted after 10 hours. We use secure Vercel Postgres databases and Cloudinary for media storage with automated wiping."
                }
              }
            ]
          })
        }}
      />



      {/* Hero Section */}
      <main className="w-full relative z-10">
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wide">{lang === 'en' ? 'The #1 Online Birthday & Anniversary Wish Creator' : s.featuresTitle}</span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            {s.heroTitle1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">{s.heroTitle2}</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-8 sm:mb-12 font-medium px-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            {s.heroSubtitle}
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
                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">{s.createBirthdayWish}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                  </div>
                </button>
              </Link>
              <Link href="/anniversary">
                <button className="relative group overflow-hidden rounded-full p-[3px] shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                  <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                    <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">{s.anniversaryWish}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                  </div>
                </button>
              </Link>
            </div>

            <a href="https://guesskaro.games/couples" target="_blank" rel="noopener noreferrer">
              <button className="relative group overflow-hidden rounded-full p-[3px] shadow-xl shadow-pink-500/10 hover:shadow-pink-500/30 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-[shine_4s_linear_infinite] bg-[length:200%_auto] rounded-full" />
                <div className="relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-background rounded-full transition-all duration-300 group-hover:bg-opacity-0">
                  <span className="font-bold text-base sm:text-xl group-hover:text-white transition-colors">{s.coupleQuiz}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                </div>
              </button>
            </a>

            <span className="text-sm text-foreground/50 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> {s.takes3Min}
            </span>

            <WishCounter variant="full" />
          </motion.div>
        </section>

        {/* Feature Showcase Grid - SEO Optimized */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{s.featuresTitle}</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">{s.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Camera className="w-6 h-6 text-pink-500" />} title={s.feat1} desc={s.feat1d} />
            <FeatureCard icon={<Ticket className="w-6 h-6 text-yellow-500" />} title={s.feat2} desc={s.feat2d} />
            <FeatureCard icon={<Music className="w-6 h-6 text-blue-500" />} title={s.feat3} desc={s.feat3d} />
            <FeatureCard icon={<MessageCircle className="w-6 h-6 text-purple-500" />} title={s.feat4} desc={s.feat4d} />
            <FeatureCard icon={<Zap className="w-6 h-6 text-green-500" />} title={s.feat5} desc={s.feat5d} />
            <FeatureCard icon={<Heart className="w-6 h-6 text-red-500" />} title={s.feat6} desc={s.feat6d} />
            <FeatureCard icon={<Gift className="w-6 h-6 text-amber-500" />} title={s.feat7} desc={s.feat7d} />
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

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
                  {s.secPrivacy}
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">{s.sec1}</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">{s.sec1d}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Lock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">{s.sec2}</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">{s.sec2d}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                      <Trash2 className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">{s.sec3}</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">{s.sec3d}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 text-left lg:pl-8 relative z-10">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                  {s.secBadge}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">{s.secTitle}</h2>
                <p className="text-lg text-foreground/70 mb-8 leading-relaxed">{s.secSub}</p>
                <p className="text-lg text-foreground/70 mb-10 leading-relaxed font-medium">
                  That&apos;s why birthdaywisher.fun is engineered with a strict <span className="text-emerald-400 font-bold">\"Read & Destroy\"</span> philosophy. Share your heart out, knowing it will all disappear beautifully in 10 hours.
                </p>

                <Link href="/create">
                  <button className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {s.secCta} <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works / Social Proof */}
        <section className="w-full bg-white/5 py-24">
          <div className="container max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12 sm:mb-16">{s.howTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (Desktop only) */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

              <StepCard number="1" title={s.how1} desc={s.how1d} />
              <StepCard number="2" title={s.how2} desc={s.how2d} />
              <StepCard number="3" title={s.how3} desc={s.how3d} />
            </div>

            <div className="mt-20">
              <Link href="/create">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,105,180,0.4)] transition-all hover:-translate-y-1">
                  {s.howCta}
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* SEO Footer */}
      <footer className="w-full border-t border-white/10 glass-panel mt-12 py-12 px-6">
        <div className="container max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">birthdaywisher.fun</h4>
            <p className="text-foreground/60">{s.footerDesc}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Popular Nav</h4>
            <ul className="space-y-2 text-foreground/60">
              <li><Link href="/create" className="hover:text-primary transition-colors">Create Birthday Wish</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Birthday Wish Ideas (Blog)</Link></li>
              <li><Link href="/blog/best-friend-quotes" className="hover:text-primary transition-colors">For Best Friends</Link></li>
              <li><Link href="/blog/romantic-wishes" className="hover:text-primary transition-colors">For Partner / Boyfriend / Girlfriend</Link></li>
              <li><Link href="/blog/wedding-anniversary-wishes-for-couple" className="hover:text-primary transition-colors">Anniversary Wishes for Couple</Link></li>
              <li><Link href="/blog/birthday-wishes-for-colleague" className="hover:text-primary transition-colors">For Colleague / Coworker</Link></li>
              <li><Link href="/blog/birthday-wishes-for-crush" className="hover:text-primary transition-colors">For Crush</Link></li>
              <li><Link href="/blog/long-distance-birthday-ideas" className="hover:text-primary transition-colors">Long Distance Ideas</Link></li>
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
              <li><Link href="/use-cases/anniversary-wishes-for-couple" className="hover:text-primary transition-colors">Anniversary Wishes for Couple</Link></li>
              <li><Link href="/use-cases/long-distance-birthday-surprise" className="hover:text-primary transition-colors">Long Distance Surprise</Link></li>
              <li><Link href="/use-cases/colleague-birthday-wish" className="hover:text-primary transition-colors">Colleague Birthday Wish</Link></li>
              <li><Link href="/use-cases/parents-birthday-surprise" className="hover:text-primary transition-colors">Parents Birthday Surprise</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-white/10 text-foreground/40 text-sm flex flex-col gap-2">
          <p>© {new Date().getFullYear()} birthdaywisher.fun. {s.footerMade}</p>
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
