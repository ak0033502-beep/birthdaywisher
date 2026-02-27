import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Clock, Sparkles, ArrowRight, Heart } from "lucide-react";

export const metadata: Metadata = {
    title: "100+ Best Friend Birthday Quotes & Wishes That Hit Different | BirthdayWisher",
    description: "Find the most heart-touching, funny, and unique birthday wishes for your best friend. Copy-paste ready emotional quotes, roast messages, and creative surprise ideas to make their day unforgettable.",
    keywords: "best friend birthday quotes, funny birthday wishes for best friend, emotional birthday wishes, happy birthday bestie, heart touching birthday wishes for best friend, birthday wishes for BFF, cute birthday messages for best friend, long birthday paragraph for best friend, unique birthday gift for bestie, birthday wishes for close friend, sentimental birthday wishes, birthday quotes for soulmate friend",
};

export default function BestFriendQuotesPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">

                <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Idea Vault
                </Link>

                {/* Article Header */}
                <header className="mb-16">
                    <div className="text-sm font-bold text-primary mb-6 uppercase tracking-widest">For Friends</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">100+ Best Friend Birthday Quotes & Wishes That Won't Get Ignored</h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60 font-medium">
                        <div className="flex items-center gap-2"><User className="w-4 h-4" /> Editorial Team</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Oct 25, 2024</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 12 min read</div>
                    </div>
                </header>

                {/* Article Content */}
                <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-secondary">
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">
                        Your best friend has been there through every awkward phase, late-night breakdown, and questionable decision. A generic "Happy Birthday bro" text just isn't going to cut it this year. They deserve something that actually captures the depth of your friendship — something that makes them laugh, cry, and screenshot to save forever.
                    </p>

                    <p className="mb-8 text-foreground/70">
                        Whether you're looking for <strong>heart-touching birthday wishes for your best friend</strong>, hilarious <strong>roast birthday messages</strong>, or <strong>long birthday paragraphs</strong> that make them feel like the most important person in the world, this guide has everything. We've organized 100+ wishes by mood so you can find the perfect one instantly.
                    </p>

                    {/* Section 1 */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">💔 The "Tear-Jerker" Emotional Birthday Quotes</h2>
                    <p className="mb-4 text-foreground/70">Use these when you want to remind them how much they truly mean to you. These are perfect for <strong>sentimental birthday wishes</strong> that create a lasting emotional impact:</p>
                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"To the person who knows all my secrets and still likes me: Thank you for existing. I love you more than words can express. Happy Birthday, my irreplaceable human."</li>
                        <li>"We might not share DNA, but you're more family to me than anyone else. Here is to a lifetime of memories, late-night drives, and terrible karaoke."</li>
                        <li>"No matter how far apart life takes us, my favorite place is still right beside you. Happy Birthday, soulmate."</li>
                        <li>"You taught me that family isn't always blood. It's the people who show up at 3 AM, no questions asked. Thank you for being that person. Happy Birthday."</li>
                        <li>"If everyone in the world had a best friend like you, there would be no sadness. You make everything better just by existing. I hope your birthday is as magical as you are."</li>
                        <li>"I've never been good with words, but here goes: You changed my life. Before you, I didn't know what real friendship felt like. Happy Birthday to my person."</li>
                        <li>"They say you only get one soulmate in life. I found mine — and it's you. Not in a romantic way, but in a 'I literally cannot do life without you' way. HBD."</li>
                        <li>"Thank you for loving me at my worst, celebrating me at my best, and being the constant in my ever-changing life. Happy Birthday, best friend."</li>
                    </ul>

                    {/* Section 2 */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">😂 The "Roast Session" Funny Birthday Quotes</h2>
                    <p className="mb-4 text-foreground/70">Perfect for the friend who never takes anything seriously. These <strong>funny birthday wishes for best friend</strong> quotes balance humor with love:</p>
                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"Happy Birthday! I was going to get you an expensive gift, but I figured having me as a best friend is already the ultimate prize. You're welcome."</li>
                        <li>"We've been friends for so long I can't remember which one of us is the bad influence. Actually, it's definitely you. Happy Birthday!"</li>
                        <li>"Happy Birthday to someone who is almost as good looking, intelligent, and humble as I am!"</li>
                        <li>"Congratulations on being old enough to know better but still young enough to do it anyway. Proud of you. HBD."</li>
                        <li>"I'm not saying you're old, but if you were a phone, you'd still be on Android 4.0. Happy Birthday, dinosaur."</li>
                        <li>"To my partner in crime: another year of bad decisions and zero regrets. Let's keep the streak alive. Happy Birthday!"</li>
                        <li>"Happy Birthday! May your day be more beautiful than your selfies and more memorable than your browser history."</li>
                        <li>"I promise to keep all your secrets... mostly because I've already forgotten half of them. Have a great birthday, weirdo!"</li>
                    </ul>

                    {/* Section 3 */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">💌 Long Birthday Paragraphs for Best Friend</h2>
                    <p className="mb-4 text-foreground/70">Sometimes a one-liner isn't enough. Here are full <strong>long birthday paragraphs for best friend</strong> messages that you can send directly or use as the final message in a <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link>:</p>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                        <p className="text-foreground/80 italic">"Dear [Name], I want you to know that you are the single most important person in my world. I know I don't say it enough, because we're always busy cracking jokes and being idiots. But today, on your birthday, I want to be serious for once. You've held my hand through the darkest chapters of my life and you've danced with me through the brightest ones. There is genuinely no version of my life that works without you in it. I love you endlessly. Happy Birthday, best friend. Here's to another year of us against the world."</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                        <p className="text-foreground/80 italic">"Happy Birthday to the person who deserves the entire universe but will settle for a text from me at midnight. You are the funniest, kindest, most chaotic, and most loyal human I have ever met. I genuinely thank the universe every single day for putting you in my life. Whatever happens — job changes, cities, relationships — you and I are forever. That's not a promise, that's a fact. I love you more than words will ever capture. Enjoy your day, superstar."</p>
                    </div>

                    {/* Section 4 */}
                    <h2 className="text-3xl font-bold mt-12 mb-6">🎉 Cute & Short Birthday Wishes for Best Friend</h2>
                    <p className="mb-4 text-foreground/70">Need something quick but impactful for an Instagram caption or a WhatsApp status? These <strong>cute birthday messages for best friend</strong> are perfect:</p>
                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"HBD to my favorite weirdo. Never change. 💛"</li>
                        <li>"Another year older, still the same level of immature. Love it. Happy Birthday!"</li>
                        <li>"You + me = unstoppable. Happy Birthday, partner!"</li>
                        <li>"Life's better with you in it. Facts. Happy Birthday, bestie."</li>
                        <li>"My ride or die since [year]. Happy Birthday! 🎂"</li>
                        <li>"Cheers to the human who makes adulting bearable. HBD! 🥂"</li>
                        <li>"Happy Birthday to my personal therapist, hype person, and emergency contact. Love you."</li>
                    </ul>

                    {/* Section 5 */}
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">🌍 Birthday Wishes for Long-Distance Best Friends</h2>
                    <p className="mb-4 text-foreground/70">Distance doesn't diminish real friendships. These are ideal <strong>birthday wishes for long-distance best friends</strong>, especially when you can't be there in person. Consider pairing these with a <Link href="/use-cases/digital-story-greeting-card" className="text-primary hover:text-secondary">digital story greeting card</Link> for maximum emotional impact:</p>
                    <ul className="list-disc pl-6 mb-8 text-foreground/80 space-y-3">
                        <li>"Miles apart but never in heart. I wish I could be there to give you the biggest hug today. Happy Birthday from across the distance."</li>
                        <li>"The hardest part about today isn't finding the right words — it's not being there to celebrate with you in person. I miss you, and I love you. Happy Birthday."</li>
                        <li>"Different cities, different time zones, same unbreakable bond. Happy Birthday, best friend. I'll see you soon."</li>
                        <li>"Just because I'm not there doesn't mean I'm not celebrating. I'm doing our signature dance alone in my apartment right now. Happy Birthday!"</li>
                    </ul>

                    {/* Section 6 — How to deliver */}
                    <h2 className="text-3xl font-bold mt-16 mb-6">🚀 How to Deliver Your Best Friend Birthday Wish Like a Pro</h2>
                    <p className="mb-6 text-foreground/70">
                        You've found the perfect quote. Now what? Sending it raw in a WhatsApp text will get buried under 50 other "HBD" messages. Here are three levels of delivery:
                    </p>

                    <div className="space-y-6 mb-12">
                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2">Level 1: The Text Message (Basic)</h3>
                            <p className="text-foreground/70">Copy-paste into WhatsApp or iMessage. It works, but it's forgettable.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2">Level 2: The Handwritten Card (Classic)</h3>
                            <p className="text-foreground/70">Write it out by hand. Better impact, but requires physical delivery and planning.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5">
                            <h3 className="text-xl font-bold mb-2 text-primary">Level 3: The Gamified Interactive Wish (Legendary) ⚡</h3>
                            <p className="text-foreground/70">Hide your quote at the end of a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link> with puzzles, voice notes, and a heartbeat photo reveal. Your best friend has to solve trivia about your friendship before they earn the message. <strong>This is the method that gets screenshots and tears.</strong></p>
                        </div>
                    </div>

                    {/* Internal Linking Section */}
                    <h2 className="text-3xl font-bold mt-12 mb-6">📚 More Birthday Content You'll Love</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <Link href="/blog/romantic-wishes" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-500 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">Romantic Birthday Wishes & Surprises</div>
                                <div className="text-sm text-foreground/50">For boyfriend, girlfriend & partner</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/blog/top-50-heart-touching-birthday-wishes-for-best-friend" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">Top 50 Heart-Touching Wishes</div>
                                <div className="text-sm text-foreground/50">The ultimate curated list</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/use-cases/unique-birthday-gift-online" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-primary shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">Unique Birthday Gift Online</div>
                                <div className="text-sm text-foreground/50">Why digital gifts are the future</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                        <Link href="/blog/how-to-create-a-gamified-birthday-card" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-green-500 shrink-0" />
                            <div>
                                <div className="font-bold group-hover:text-primary transition-colors">How to Create a Gamified Card</div>
                                <div className="text-sm text-foreground/50">Step-by-step guide</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-foreground/30 ml-auto" />
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="my-16 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                        <div className="relative z-10">
                            <Sparkles className="w-10 h-10 mx-auto mb-6 text-primary animate-pulse" />
                            <h3 className="text-3xl font-black mb-4">Don't Just Text It. Make Them Play For It.</h3>
                            <p className="mb-8 text-foreground/80 text-lg max-w-2xl mx-auto">
                                Take your favorite quote from above and bury it at the end of a 20-step interactive puzzle game. Make your best friend solve trivia quizzes about your friendship to unlock their message!
                            </p>
                            <Link href="/create">
                                <button className="px-10 py-5 bg-background border-2 border-primary text-primary hover:bg-primary hover:text-foreground font-black rounded-full transition-all text-xl shadow-[0_0_30px_rgba(255,105,180,0.3)]">
                                    Create Gamified Wish (Free)
                                </button>
                            </Link>
                        </div>
                    </div>

                </article>
            </main>
        </div>
    );
}
