import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Clock, Heart, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Romantic Birthday Wishes & Surprises for Boyfriend, Girlfriend & Partner | BirthdayWisher.fun",
    description: "Find the most romantic birthday wishes, love quotes, surprise ideas, and creative digital gifts for your boyfriend, girlfriend, husband, or wife. Make their birthday truly unforgettable.",
    keywords: "romantic birthday wishes, birthday wishes for boyfriend, birthday wishes for girlfriend, romantic birthday quotes, birthday surprise for husband, birthday surprise for wife, love birthday messages, happy birthday my love, romantic birthday text messages, heart touching birthday wishes for lover, birthday gift ideas for partner, digital birthday surprise, long distance birthday wish for boyfriend, midnight birthday surprise ideas",
};

export default function RomanticWishesPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">

                <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Idea Vault
                </Link>

                {/* Article Header */}
                <header className="mb-16">
                    <div className="text-sm font-bold text-pink-500 mb-6 uppercase tracking-widest">For Partners</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">The Ultimate Guide to Romantic Birthday Wishes & Surprises for Your Partner</h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60 font-medium">
                        <div className="flex items-center gap-2"><User className="w-4 h-4" /> Romance Editors</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Oct 22, 2024</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 14 min read</div>
                    </div>
                </header>

                {/* Article Content */}
                <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-secondary">
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">
                        When it comes to your partner, a simple "Happy Birthday, babe" just isn't enough. Whether you're dating, engaged, or married, your significant other deserves birthday wishes that perfectly capture your unique chemistry, inside jokes, and deep affection. This is the internet's most comprehensive guide to <strong>romantic birthday wishes</strong>, <strong>surprise ideas</strong>, and creative ways to make their birthday unforgettable.
                    </p>

                    {/* Section 1 — For Boyfriend */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">💙 Romantic Birthday Wishes for Boyfriend</h2>
                    <p className="mb-4 text-foreground/70">Finding the right <strong>birthday wish for your boyfriend</strong> means balancing romance with authenticity. Here are messages that hit hard without being cringey:</p>

                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"Happy Birthday to the man who turned my entire world upside down — in the best way possible. I love you more than I can ever put into words."</li>
                        <li>"You're not just my boyfriend, you're my best friend, my safe place, and my favorite person. Happy Birthday, handsome. Here's to many more adventures together."</li>
                        <li>"I fell in love with your smile first. Then your laugh. Then your kindness. Now I'm in love with every single thing about you. Happy Birthday, my love."</li>
                        <li>"Thank you for being the man who shows up — not just on the good days, but especially on the hard ones. You make me believe in forever. Happy Birthday."</li>
                        <li>"To the boy who makes my heart race and my anxiety disappear: I love you. Happy Birthday, babe."</li>
                        <li>"You asked me what I want for your birthday. Honestly? Just you. Today, tomorrow, and every day after that. Happy Birthday."</li>
                        <li>"Before you, birthdays were just another day. Now, your birthday feels like a holiday to me — because it's the day the universe created my favorite person."</li>
                    </ul>

                    <p className="mb-8 text-foreground/70">
                        Want to go beyond text? Learn how to build a <Link href="/use-cases/boyfriend-birthday-surprise" className="text-primary hover:text-secondary">boyfriend birthday surprise</Link> with interactive puzzles, roasts, and a heartbeat photo reveal.
                    </p>

                    {/* Section 2 — For Girlfriend */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-500">💗 Romantic Birthday Wishes for Girlfriend</h2>
                    <p className="mb-4 text-foreground/70">Your girlfriend deserves the full cinematic treatment. These <strong>birthday wishes for girlfriend</strong> are designed to be aesthetic, emotional, and screenshot-worthy:</p>

                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"Happy Birthday to the most beautiful soul I've ever met. You make the world feel warmer just by being in it. I love you endlessly, my love."</li>
                        <li>"You're the poem I never knew how to write, the song I never get tired of hearing. Happy Birthday, gorgeous. You deserve every beautiful thing life has to offer."</li>
                        <li>"I love the way your eyes light up when you talk about things that make you happy. I love the way you love me without limits. Happy Birthday, my everything."</li>
                        <li>"To my girl: you are the strongest, kindest, and most incredible woman I know. I'm grateful to be yours. Happy Birthday, baby."</li>
                        <li>"The day you were born is the day my story truly started — I just didn't know it yet. Happy Birthday, love."</li>
                        <li>"You're not just my girlfriend. You're my muse, my comfort, my chaos, and my calm. Happy Birthday to the love of my life."</li>
                        <li>"Every love song suddenly makes sense because of you. Happy Birthday, my forever person."</li>
                    </ul>

                    <p className="mb-8 text-foreground/70">
                        Create the ultimate <Link href="/use-cases/girlfriend-birthday-surprise" className="text-primary hover:text-secondary">girlfriend birthday surprise</Link> with a personalized digital story featuring floating memory bubbles and a heartbeat photo reveal.
                    </p>

                    {/* Section 3 — For Husband/Wife */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-yellow-400">💍 Birthday Wishes for Husband & Wife</h2>
                    <p className="mb-4 text-foreground/70">Married love is deeper, tested by time and life. These <strong>birthday wishes for husband</strong> and <strong>birthday wishes for wife</strong> capture that legacy:</p>

                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"To my husband: you're the plot twist I never saw coming and the happily ever after I never want to end. Happy Birthday, my love."</li>
                        <li>"Happy Birthday to the woman who chose me, challenges me, and loves me harder every single year. I'm the luckiest person alive."</li>
                        <li>"You've given me a home, a family, and a love that makes everything worthwhile. Happy Birthday to my forever partner."</li>
                        <li>"Growing old with you isn't something I fear — it's the thing I look forward to most. Happy Birthday, babe."</li>
                        <li>"Happy Birthday to the one person who still gives me butterflies after all these years. Here's to a lifetime more."</li>
                    </ul>

                    {/* Section 4 — Long paragraphs */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">💌 Long Romantic Birthday Paragraphs</h2>
                    <p className="mb-4 text-foreground/70">When a one-liner isn't enough, pour your heart out with these full <strong>long birthday paragraphs for your partner</strong>:</p>

                    <div className="glass-panel p-6 rounded-2xl border border-pink-500/20 mb-6">
                        <p className="text-foreground/80 italic">"My love, today is the day the universe created the most beautiful soul I've ever known. I don't know how to fully express what you mean to me, because every word feels too small. You're not just my partner — you're the reason I wake up excited about life. You've shown me what unconditional love looks like, and I'm a better person because of you. On your birthday, I want you to know: I choose you. Not just today, but every single day for the rest of my life. I love you more than you'll ever understand. Happy Birthday, my forever."</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 mb-8">
                        <p className="text-foreground/80 italic">"Hey babe, I know I'm not always the best with words, but today I'm going to try. You changed my life the moment you walked into it. Before you, I was going through the motions. After you, everything felt intentional, meaningful, and full of color. I love your laugh — the real one, not the polite one. I love how you care about people, even strangers. I love how you make me feel like I'm enough, even on days when I don't feel like it. Happy Birthday to my person. I'm so proud to be yours."</p>
                    </div>

                    {/* Section 5 — Midnight Surprise Ideas */}
                    <h2 className="text-3xl font-bold mt-12 mb-6">🌙 Midnight Birthday Surprise Ideas</h2>
                    <p className="mb-4 text-foreground/70">The clock strikes midnight and their phone lights up. Here are the top <strong>midnight birthday surprise ideas</strong> that create instant core memories:</p>

                    <div className="space-y-4 mb-8">
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-lg mb-1">1. The "Secret Link" Surprise</h3>
                            <p className="text-foreground/70">At exactly 12:00 AM, send them a mysterious link with the text "Open this. Trust me." The link opens a <Link href="/use-cases/digital-story-greeting-card" className="text-primary hover:text-secondary">digital story greeting card</Link> — a fully interactive, gamified 20-step love story you built just for them.</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-lg mb-1">2. The Voice Note Bomb</h3>
                            <p className="text-foreground/70">Record 12 short voice notes (one for each month of the year) and schedule-send them at midnight. Each note highlights one memory from each month. Pair this with a <Link href="/create" className="text-primary hover:text-secondary">gamified wish link</Link> for the finale.</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-lg mb-1">3. The Countdown Playlist</h3>
                            <p className="text-foreground/70">Create a Spotify/YouTube playlist with songs that define your relationship. Share the link at midnight with the message: "Play this from top to bottom. Each song is a chapter of us."</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-lg mb-1">4. The Treasure Hunt Text</h3>
                            <p className="text-foreground/70">Send a series of riddles via text, each leading to a virtual "clue." The final clue reveals a link to the <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift</Link> you've created for them online.</p>
                        </div>
                    </div>

                    {/* Section 6 — Long Distance */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">✈️ Long Distance Birthday Surprise Ideas</h2>
                    <p className="mb-6 text-foreground/70">
                        Long-distance relationships make birthdays harder, but also make the effort even more meaningful. If you can't be there physically, be there digitally in the most impactful way possible. The best <strong>long distance birthday surprise for boyfriend</strong> or <strong>girlfriend</strong> combines genuine emotion with creative digital tools.
                    </p>
                    <p className="mb-8 text-foreground/70">
                        Build a fully personalized interactive love story using BirthdayWisher. Add your favorite photos, record a voice note that plays at the climax, and set up a "How Well Do You Know Me?" quiz that they need to pass before unlocking your heartfelt message. It bridges the physical distance in a way that FaceTime simply can't.
                    </p>

                    {/* Internal Linking Section */}
                    <h2 className="text-3xl font-bold mt-12 mb-6">📚 Explore More Birthday Ideas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <Link href="/blog/best-friend-quotes" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">100+ Best Friend Birthday Quotes</div>
                                <div className="text-sm text-foreground/50">Emotional, funny & roast wishes</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/use-cases/boyfriend-birthday-surprise" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Heart className="w-5 h-5 text-blue-400 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">Boyfriend Birthday Surprise</div>
                                <div className="text-sm text-foreground/50">The ultimate roast + toast method</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/use-cases/girlfriend-birthday-surprise" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-500 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">Girlfriend Birthday Surprise</div>
                                <div className="text-sm text-foreground/50">Aesthetic & Instagram-worthy ideas</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/blog/how-to-create-a-gamified-birthday-card" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Zap className="w-5 h-5 text-green-500 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">How to Create a Gamified Card</div>
                                <div className="text-sm text-foreground/50">Step-by-step guide</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="my-16 p-8 rounded-[2rem] bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <Heart className="w-12 h-12 mx-auto mb-6 text-pink-500 fill-pink-500 animate-pulse" />
                            <h3 className="text-3xl font-black mb-4">Make Them Cry Happy Tears</h3>
                            <p className="mb-8 text-foreground/80 text-lg max-w-2xl mx-auto">
                                Build them a completely personalized, highly interactive, and gamified digital love story in less than 5 minutes. Voice notes, heartbeat photo reveals, and fireworks included.
                            </p>
                            <Link href="/create">
                                <button className="px-10 py-5 bg-pink-500 text-white font-black rounded-full hover:bg-pink-600 transition-all text-xl shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                                    Start Building For Free
                                </button>
                            </Link>
                        </div>
                    </div>

                </article>
            </main>
        </div>
    );
}
