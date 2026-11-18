import { Metadata } from "next";
import Link from "next/link";
import { Heart, Zap } from "lucide-react";
import { PartyPage, PageHero, Prose, CtaCard } from "@/components/party/PartyPage";
import { notFound } from "next/navigation";
import { SITE_URL, toIsoDate } from "@/lib/site";

// Placeholder data - In production this would come from a CMS or MDX
const getPostData = (slug: string) => {
    const posts: Record<string, { title: string, content: React.ReactNode, date: string, modifiedDate?: string, author: string, readTime: string, category: string, description: string, keywords: string, faq?: Array<{ q: string; a: string }> }> = {
        "top-50-heart-touching-birthday-wishes-for-best-friend": {
            title: "Top 50 Heart-Touching Birthday Wishes for a Best Friend",
            description: "Struggling to find the right words? Here are 50 unique, emotional, and funny birthday wishes guaranteed to make your bestie smile.",
            keywords: "heart touching birthday wishes for best friend, happy birthday best friend, birthday quotes for BFF, emotional birthday wishes",
            date: "Oct 24, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "8 min read",
            category: "For Friends",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Finding the perfect words for the person who knows all your secrets isn&apos;t easy. A generic &quot;HBD&quot; text just won&apos;t cut it. Your best friend deserves a message that reflects your unique bond, the inside jokes you share, and the memories you&apos;ve built together.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">Why Standard Texts Fail</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">
                        In the age of instant messaging, a standard &apos;Happy Birthday&apos; sent via WhatsApp or iMessage feels incredibly low-effort. It gets lost in a sea of other identical messages from acquaintances and coworkers. To stand out and truly make your best friend feel valued, you need to elevate your communication. This means either writing a deeply personalized paragraph, or even better, turning that paragraph into an interactive experience using a <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link>.
                    </p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">Emotional & Tear-Jerking Wishes</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">
                        If you want to remind your best friend why they are irreplaceable in your life, skip the jokes and go straight for the heartstrings. Here are some templates to get you started:
                    </p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;To my unbiological sibling: thank you for being the calm to my storm. Happy Birthday, I love you endlessly.&quot;</li>
                        <li>&quot;We&apos;ve laughed until we cried and cried until we laughed. Here&apos;s to a lifetime more of exactly that. Have the best birthday!&quot;</li>
                        <li>&quot;No matter where life takes us, you will always be my person. You&apos;ve seen me at my absolute worst and loved me anyway. Wishing you the happiest of birthdays today.&quot;</li>
                        <li>&quot;They say true friends are rare, but finding a soulmate in a best friend is a miracle. Thank you for being my miracle. Have a beautiful birthday.&quot;</li>
                        <li>&quot;I didn&apos;t believe in found family until I met you. Every year we spend together is a gift I cherish. Happy birthday to the kindest heart I know.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">Funny & Roast Wishes</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">
                        Maybe your friendship isn&apos;t built on deep emotional declarations, but rather on constant roasting and sarcasm. If that&apos;s the case, these are for you. For even more funny quotes, check out our full <Link href="/blog/best-friend-quotes" className="text-primary hover:text-secondary">best friend birthday quotes collection</Link>.
                    </p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! I was going to get you a super expensive gift, but then I remembered that having me as your best friend is gift enough.&quot;</li>
                        <li>&quot;Here&apos;s to another year of us laughing at our own jokes and keeping each other sane. Happy Birthday weirdo!&quot;</li>
                        <li>&quot;Happy Birthday to someone who is almost as awesome as I am!&quot;</li>
                        <li>&quot;I promise to keep all your secrets... mostly because I have a terrible memory. Have a great birthday!&quot;</li>
                        <li>&quot;Congratulations on surviving another year of my friendship. You deserve an award, but a &apos;Happy Birthday&apos; will have to do.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">How to Deliver These Wishes</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">
                        Now that you have the perfect quote picked out, how do you deliver it? Copy-pasting it into a text is boring. Writing it on a card is better, but still traditional.
                        <strong> The best way to deliver a powerful birthday quote in 2026 is to hide it at the end of a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link>.</strong> Let them solve trivia about your friendship, unlock a heartbeat photo reveal, and then present them with your beautifully written wish.
                    </p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold mb-4">Want to make your wish truly unforgettable?</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Don&apos;t just copy-paste text. Create an interactive, 20-step gamified story for them.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all">
                                Create a Magical Wish Now
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "how-to-create-a-gamified-birthday-card": {
            title: "How to Create a Gamified Birthday Card Online in 2026",
            description: "Text messages are boring. Learn how you can build a 20-step interactive journey with puzzles, voice notes, and fireworks to give them an unforgettable birthday experience.",
            keywords: "gamified birthday card, interactive birthday card online, digital birthday card maker, online birthday card, free birthday card maker",
            date: "Oct 05, 2024",
            modifiedDate: "Nov 18, 2026",
            author: "Product Team",
            readTime: "7 min read",
            category: "Guides",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Why settle for a piece of folded paper or a 2-second WhatsApp text when you can give someone an entire interactive experience? The traditional greeting card industry has failed to innovate, leaving us with boring, static alternatives that don&apos;t capture the dynamism of our relationships.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Enter: The Gamified Wish</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">With BirthdayWisher.fun, we&apos;ve revolutionized how you say &quot;Happy Birthday&quot;. Instead of just reading text, the birthday boy or girl has to <strong>earn</strong> their wish. A gamified birthday card transforms a passive reading moment into an active, engaging, and memorable event. This is what makes it the most <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link>.</p>

                    <p className="mb-10 text-foreground/80 leading-relaxed">Let&apos;s walk through exactly how you can use our free tool to build an unforgettable experience in less than 5 minutes.</p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gold">Step 1: The Memory Quiz Setup</h3>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Test their memory! The first few steps of the gamified journey involve interactive trivia. You can set up custom questions like &quot;Where did we first meet?&quot; or &quot;Who got drunk first on New Year&apos;s Eve?&quot;. You provide the correct answers and a few funny decoys. If they get it wrong, they&apos;re met with a hilarious roast prompt.</p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-secondary">Step 2: The Secret Date Lock</h3>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Before they can access the final emotional core of the card, they must bypass the lock. This is generally an important date — like their actual birthdate, your anniversary, or the date of a core inside joke. It adds a sense of exclusivity and security to the gift.</p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-primary">Step 3: The Heartbeat Reveal & Audio Integration</h3>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Once unlocked, the real magic begins. Their favorite photo slowly fades in, beating like a heart to the rhythm of a background track you selected. But the ultimate touch is the voice note. As the screen illuminates with digital fireworks, a raw, unedited audio recording of your voice plays, delivering your actual wish out loud. It&apos;s the perfect <Link href="/use-cases/digital-story-greeting-card" className="text-primary hover:text-secondary">digital story greeting card</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Why Gamified Cards Work (The Psychology)</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">The psychology behind gamification is powerful. When we invest effort into unlocking something (like solving a trivia quiz), the reward (the emotional wish) feels significantly more impactful because we&apos;ve earned it. It triggers dopamine loops that physical cards simply can&apos;t touch. Studies show that interactive experiences create stronger emotional connections and are remembered 3x longer than passive media consumption.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Who Is This For?</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Whether you&apos;re creating a <Link href="/use-cases/boyfriend-birthday-surprise" className="text-primary hover:text-secondary">boyfriend birthday surprise</Link>, a <Link href="/use-cases/girlfriend-birthday-surprise" className="text-primary hover:text-secondary">girlfriend birthday surprise</Link>, or the ultimate <Link href="/blog/best-friend-quotes" className="text-primary hover:text-secondary">best friend birthday wish</Link>, gamified cards work universally. The personalization is what makes each one unique.</p>

                    <div className="my-16 flex justify-center">
                        <Link href="/create">
                            <button className="px-10 py-5 bg-background border-2 border-primary text-primary font-black rounded-full hover:bg-primary hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all text-xl">
                                Try it yourself (100% Free)
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "romantic-birthday-surprise-ideas-for-boyfriend": {
            title: "10 Romantic Birthday Surprise Ideas for Your Boyfriend in 2026",
            description: "Go beyond the standard gift. Discover 10 creative, romantic, and budget-friendly birthday surprise ideas for your boyfriend — including the ultimate digital surprise.",
            keywords: "birthday surprise for boyfriend, romantic birthday ideas for him, boyfriend birthday gift ideas, surprise birthday ideas for boyfriend, creative birthday surprise for boyfriend, long distance birthday surprise boyfriend",
            date: "Oct 15, 2024",
            modifiedDate: "Nov 18, 2026",
            author: "BirthdayWisher.fun Team",
            readTime: "9 min read",
            category: "For Partners",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Planning a <strong>birthday surprise for your boyfriend</strong> can feel overwhelming — especially when he&apos;s the kind of person who says &quot;I don&apos;t want anything&quot; (we all know he does). This guide covers 10 creative and budget-friendly surprise ideas, from handmade efforts to the ultimate digital love story.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">1. The &quot;Date Jar&quot; of Future Memories</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Fill a jar with 52 folded slips of paper, each containing a unique date idea — from &quot;midnight drive and ice cream&quot; to &quot;cook each other&apos;s favorite meal blindfolded.&quot; One date per week for the entire year ahead.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">2. The Scavenger Hunt</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Leave riddles around the house (or city) with each clue leading to the next location. At the final stop, have his real gift waiting — or better yet, a link to a <Link href="/use-cases/boyfriend-birthday-surprise" className="text-primary hover:text-secondary">gamified boyfriend birthday surprise</Link> you created online.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">3. The Video Montage</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Collect short video clips from his friends and family saying &quot;Happy Birthday.&quot; Edit them together with a song that&apos;s meaningful to your relationship. This works brilliantly as part of a <Link href="/use-cases/digital-story-greeting-card" className="text-primary hover:text-secondary">digital story greeting card</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">4. The Midnight Text Bomb</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">At exactly midnight, send him a flood of messages — one for each reason you love him. Then follow it all up with a mysterious link: your <Link href="/create" className="text-primary hover:text-secondary">gamified birthday wish</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">5. The &quot;Open When&quot; Letters</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Write a series of handwritten letters labeled &quot;Open when you&apos;re sad,&quot; &quot;Open when you miss me,&quot; &quot;Open on our next anniversary.&quot; It&apos;s old-school romance that never goes out of style.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">6. The Experience Gift</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Instead of a physical present, book an experience: a cooking class together, a pottery workshop, indoor skydiving, or a surprise concert. Experiences create memories that last longer than objects.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">7. The Gaming Marathon</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">If he&apos;s a gamer, set up his entire gaming setup with snacks, his favorite drinks, a new game, and a &quot;no responsibilities for 24 hours&quot; pass. Bonus: pair this with a voice-note-powered interactive <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">8. The Personalized Playlist</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Create a Spotify playlist where every song title, when read as a list, spells out a secret message or tells the story of your relationship.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">9. The Long-Distance Love Story Link</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">If you&apos;re in a long-distance relationship, distance should not stop you from going all out. Build a 20-step <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link> complete with trivia about your relationship, a heartbeat photo reveal, and your recorded voice saying &quot;Happy Birthday.&quot;</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">10. The Full Digital Surprise Experience ⚡</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">The ultimate move: combine several of these ideas. Send the midnight text bomb to build hype, follow it with the mystery link to the interactive experience, and then present the physical gift at the end. This three-layer approach creates an unforgettable, multi-sensory birthday.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                        <h3 className="text-2xl font-bold mb-4">Build His Dream Birthday Surprise</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create a personalized 20-step gamified love story with puzzles, voice notes, and fireworks — completely free.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-blue-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                                Surprise Your Boyfriend Now
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "happy-birthday-wishes-for-sister": {
            title: "50+ Happy Birthday Wishes for Sister — Emotional, Funny & Heartfelt",
            description: "Make your sister's birthday extra special with these heart-touching, funny, and unique birthday wishes. From emotional paragraphs to savage roasts.",
            keywords: "happy birthday wishes for sister, birthday quotes for sister, emotional birthday wishes for sister, funny birthday messages for sister, birthday paragraph for sister, birthday wishes for elder sister, birthday wishes for younger sister",
            date: "Nov 02, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "8 min read",
            category: "For Family",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your sister is your first best friend, your forever rival, and the person who has seen you at your most embarrassing. She deserves a <strong>birthday wish</strong> that captures the chaos, the love, and everything in between.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">Emotional Birthday Wishes for Sister</h2>
                    <p className="mb-4 text-foreground/70">These <strong>heart-touching birthday wishes for sister</strong> will make her feel like the most loved person in the world:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the woman who taught me what strength looks like. You&apos;re my hero, my role model, and my best friend. I love you, sis.&quot;</li>
                        <li>&quot;Growing up with you was the greatest gift life has ever given me. I wouldn&apos;t trade our fights, our laughs, or our late-night conversations for anything. Happy Birthday, sister.&quot;</li>
                        <li>&quot;You&apos;re not just my sister — you&apos;re the keeper of my childhood, the guardian of my secrets, and the person I trust most in this world. Happy Birthday.&quot;</li>
                        <li>&quot;To my big sister: you paved every path I&apos;ve walked and softened every fall I&apos;ve taken. Thank you for loving me unconditionally. Happy Birthday.&quot;</li>
                        <li>&quot;To my little sister: watching you grow into the incredible woman you are today is my proudest achievement. Happy Birthday, baby girl.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">Funny Birthday Wishes for Sister</h2>
                    <p className="mb-4 text-foreground/70">Sisters and roasting go hand-in-hand. These <strong>funny birthday messages for sister</strong> are chef&apos;s kiss:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the sibling I tolerate the most. Yes, that&apos;s your gift. You&apos;re welcome.&quot;</li>
                        <li>&quot;We&apos;ve survived sharing a bathroom, clothes, and parents. If that&apos;s not true love, I don&apos;t know what is. HBD sis!&quot;</li>
                        <li>&quot;Happy Birthday! Remember, I know every embarrassing thing you did from ages 0-18. Your secret is safe with me... for now.&quot;</li>
                        <li>&quot;I got you the best gift possible this year: my silence about that thing from 2019. Happy Birthday!&quot;</li>
                        <li>&quot;You&apos;re aging like fine wine... or maybe more like milk. Either way, Happy Birthday, sis! Love you!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Make It Unforgettable</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Instead of texting these quotes, why not deliver them in a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link>? Build a 20-step interactive story featuring childhood photos, sibling trivia, and your recorded voice note. It&apos;s the most <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link> your sister will ever receive.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold mb-4">Surprise Your Sister with Something Special</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create an interactive gamified birthday wish she&apos;ll screenshot and save forever.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all">
                                Build Her Birthday Wish Now
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-brother": {
            title: "50+ Birthday Wishes for Brother — Emotional, Funny & Real",
            description: "From heartfelt paragraphs to savage roasts, find the perfect birthday wish for your brother that actually means something.",
            keywords: "birthday wishes for brother, happy birthday brother, funny birthday wishes for brother, emotional birthday message for brother, birthday paragraph for brother, birthday quotes for brother, birthday wishes for elder brother",
            date: "Nov 05, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "7 min read",
            category: "For Family",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your brother might not admit it, but your <strong>birthday wish</strong> matters to him more than he&apos;ll ever let on. Whether he&apos;s your older protector or your younger troublemaker, these wishes capture the real bond between siblings.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">Emotional Birthday Wishes for Brother</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday, bro. You&apos;ve always been the strong one, the reliable one, the one who never let me face anything alone. I hope you know how much I admire you.&quot;</li>
                        <li>&quot;To my brother: you&apos;re the reason I know what unconditional support looks like. Thank you for always having my back. Happy Birthday.&quot;</li>
                        <li>&quot;We fought over everything growing up — the remote, the last slice of pizza, who got the front seat. But I wouldn&apos;t trade any of it. You&apos;re irreplaceable. HBD.&quot;</li>
                        <li>&quot;You taught me how to be tough and how to be kind. That&apos;s the greatest gift any sibling can give. Happy Birthday, brother.&quot;</li>
                        <li>&quot;I might not say it often, but you&apos;re my hero. Always have been, always will be. Happy Birthday.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">Funny Birthday Wishes for Brother</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the only person who could annoy me to tears AND make me laugh in the same minute. Legend.&quot;</li>
                        <li>&quot;Bro, you&apos;re aging faster than your phone battery dies. Happy Birthday, old man!&quot;</li>
                        <li>&quot;Happy Birthday! I&apos;d wish you all the best, but you already have me as a sibling. Can&apos;t top that.&quot;</li>
                        <li>&quot;To my brother: thanks for lowering the bar so I could always look like the better sibling. HBD!&quot;</li>
                        <li>&quot;Happy Birthday to someone who&apos;s been my tag-along since birth. Still can&apos;t get rid of you. Love it though.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Level Up Your Wish</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Brothers act tough, but a genuinely thoughtful birthday surprise will melt even the hardest exterior. Instead of sending a plain text, create a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link> featuring childhood photo reveals, sibling trivia quizzes, and your actual voice note. Check out more ideas at our <Link href="/blog/best-friend-quotes" className="text-primary hover:text-secondary">best friend quotes collection</Link> — because the best brothers are also best friends.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold mb-4">Make Your Brother&apos;s Birthday Legendary</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Build an interactive gamified wish with puzzles, voice notes, and a heartbeat photo reveal.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all">
                                Create His Birthday Wish
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-husband": {
            title: "Romantic Birthday Wishes for Husband — Messages That Melt His Heart",
            description: "Find the most romantic, emotional, and unique birthday wishes for your husband. From short texts to long heartfelt paragraphs to make his birthday special.",
            keywords: "birthday wishes for husband, romantic birthday wishes for husband, happy birthday husband, birthday message for hubby, emotional birthday wishes for husband, birthday paragraph for husband, birthday surprise ideas for husband",
            date: "Nov 10, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "8 min read",
            category: "For Partners",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your husband is your partner in everything — parenting, adulting, late-night snacking, and surviving life. He deserves <strong>birthday wishes</strong> that remind him just how much he means to you, even after years of marriage.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">Deeply Romantic Birthday Wishes for Husband</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the man who makes ordinary days feel extraordinary. I fall in love with you all over again every single day.&quot;</li>
                        <li>&quot;You&apos;re the reason I believe in forever. Thank you for being the most amazing husband, father, and partner. Happy Birthday, my love.&quot;</li>
                        <li>&quot;To my husband: life with you is my favorite adventure. I can&apos;t wait to see what the next chapter brings. Happy Birthday.&quot;</li>
                        <li>&quot;Marrying you was the best decision I ever made. Every birthday of yours is a celebration of my happiness too. I love you.&quot;</li>
                        <li>&quot;You&apos;ve given me a home, a family, and a love story I never want to end. Happy Birthday, hubby.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">Funny Birthday Wishes for Husband</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the man who snores like a chainsaw but loves like a legend. Wouldn&apos;t trade you for anything.&quot;</li>
                        <li>&quot;Another year older, still the same man who forgets to put the toilet seat down. But I love you anyway. HBD!&quot;</li>
                        <li>&quot;Happy Birthday! Your gift? I&apos;m letting you pick the restaurant tonight. Don&apos;t get used to it.&quot;</li>
                        <li>&quot;To my husband: you&apos;re living proof that dreams come true. Because I tell everyone you are my dream husband… even though you can&apos;t cook. HBD!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Surprise Him Like Never Before</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Upgrade your wish from a text message to a full interactive experience. Create a <Link href="/use-cases/boyfriend-birthday-surprise" className="text-primary hover:text-secondary">boyfriend/husband birthday surprise</Link> with gamified trivia about your marriage, a heartbeat photo reveal of your wedding photo, and your voice note playing over digital fireworks. Also explore more <Link href="/blog/romantic-wishes" className="text-primary hover:text-secondary">romantic birthday wishes and surprise ideas</Link>.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/20 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-pink-500 fill-pink-500" />
                        <h3 className="text-2xl font-bold mb-4">Create His Dream Birthday Surprise</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Gamified love story, voice notes, and fireworks — all free.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-pink-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all">
                                Start Building Now
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-wife": {
            title: "Birthday Wishes for Wife — Romantic Messages She Deserves",
            description: "The most romantic, emotional, and unique birthday wishes for your wife. Long paragraphs, short texts, and creative surprise ideas to make her birthday unforgettable.",
            keywords: "birthday wishes for wife, romantic birthday wishes for wife, happy birthday wife, birthday message for wife, emotional birthday wishes for wife, birthday surprise for wife, birthday paragraph for wife, birthday gift ideas for wife",
            date: "Nov 12, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "8 min read",
            category: "For Partners",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your wife does everything — she manages, she loves, she inspires. Her birthday is the one day of the year when she should feel like the queen she is. These <strong>birthday wishes for wife</strong> are designed to express the love words often can&apos;t capture.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-500">Romantic Birthday Wishes for Wife</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the woman who turned my house into a home and my life into a love story. You are my everything.&quot;</li>
                        <li>&quot;Every morning I wake up next to you feels like a gift. Today, on your birthday, I want you to know: you are the best thing that has ever happened to me.&quot;</li>
                        <li>&quot;You deserve the moon, the ocean, and every beautiful thing in between. But for now, please accept my whole heart. Happy Birthday, my love.&quot;</li>
                        <li>&quot;I married my best friend, my soulmate, and the love of my life — all in one person. Happy Birthday, wifey.&quot;</li>
                        <li>&quot;To my wife: your smile is my sunrise, your laugh is my favorite song, and your love is my greatest treasure. Happy Birthday.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">Funny Birthday Wishes for Wife</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday to the boss of the house! I promise to do the dishes today. Just today though.&quot;</li>
                        <li>&quot;To my wife: you&apos;re aging like fine wine. I, on the other hand, am aging like milk. Happy Birthday, gorgeous!&quot;</li>
                        <li>&quot;Happy Birthday! Your gift is my promise to not leave my socks on the floor for a whole week. I know, I&apos;m too generous.&quot;</li>
                        <li>&quot;You make marriage look easy, even though we both know I&apos;m the difficult one. Thanks for choosing me anyway. HBD!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Give Her the Ultimate Digital Gift</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">She deserves more than a text. Build a stunning <Link href="/use-cases/girlfriend-birthday-surprise" className="text-primary hover:text-secondary">girlfriend/wife birthday surprise</Link> with floating memory bubbles featuring her cutest quirks, a heartbeat photo reveal set to her favorite song, and your raw voice note playing over digital fireworks. Explore more ideas in our <Link href="/blog/romantic-wishes" className="text-primary hover:text-secondary">romantic birthday wishes guide</Link>.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-pink-500 fill-pink-500" />
                        <h3 className="text-2xl font-bold mb-4">She Deserves the Best</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create a personalized, interactive love story she&apos;ll never forget.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-pink-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all">
                                Create Her Birthday Wish
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "funny-birthday-wishes": {
            title: "100+ Funny Birthday Wishes That Actually Make People Laugh",
            description: "Skip the cringe. These genuinely funny birthday wishes, roasts, and sarcastic messages will make anyone laugh. Perfect for friends, siblings, coworkers, and partners.",
            keywords: "funny birthday wishes, hilarious birthday messages, sarcastic birthday wishes, birthday roasts, funny birthday quotes, birthday memes text, funny happy birthday messages, humorous birthday wishes",
            date: "Nov 18, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "9 min read",
            category: "For Everyone",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Let&apos;s be honest — most &quot;funny&quot; birthday wishes you find online aren&apos;t actually funny. They&apos;re the digital equivalent of your uncle&apos;s dad jokes. This list is different. These are <strong>genuinely funny birthday wishes</strong> that will make people actually laugh out loud, not just politely smile.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">🔥 Savage Birthday Roasts</h2>
                    <p className="mb-4 text-foreground/70">Use these at your own risk. Best deployed against people who can take a joke:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! At your age, &apos;getting lucky&apos; means finding your car in the parking lot.&quot;</li>
                        <li>&quot;You&apos;re not old. You&apos;re just... a classic. Like a vintage car. That doesn&apos;t start on the first try.&quot;</li>
                        <li>&quot;Happy Birthday! Don&apos;t worry about getting older. Worry about getting weirder. Oh wait, too late.&quot;</li>
                        <li>&quot;I was going to make you a birthday cake, but then I remembered your diet. So here&apos;s a text. You&apos;re welcome.&quot;</li>
                        <li>&quot;Happy Birthday to someone who is old enough to know better but still young enough to get away with it!&quot;</li>
                        <li>&quot;Congratulations! You&apos;ve now reached the age where your back goes out more than you do.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">😂 Funny Birthday Wishes for Friends</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! We&apos;re at that age where our candles cost more than our cakes.&quot;</li>
                        <li>&quot;On your birthday, I want you to know: Google says most heart attacks happen on Monday mornings. So... at least you made it to your birthday! HBD!&quot;</li>
                        <li>&quot;A good friend would bring you a gift. A best friend knows you just want someone to order pizza with. Pizza&apos;s on me. Happy Birthday!&quot;</li>
                        <li>&quot;Happy Birthday! I got you the gift of my presence. I know, I know — you&apos;re overwhelmed.&quot;</li>
                        <li>&quot;Welcome to the age where you start sentences with &apos;When I was your age...&apos; Happy Birthday, grandpa/grandma!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">😭 Funny Birthday Wishes for Coworkers</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! May your coffee be strong and your meetings be short today.&quot;</li>
                        <li>&quot;Happy Birthday! You officially qualify for the &apos;veteran&apos; discount at the office cafeteria.&quot;</li>
                        <li>&quot;Hope your birthday is as fun as marking &apos;read&apos; on emails from the boss! HBD!&quot;</li>
                        <li>&quot;Happy Birthday to the only coworker I&apos;d actually help hide a body for. Just kidding. Maybe.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Level Up Your Funny Wish</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Take the funniest quote from above and make it the punchline of an entire interactive experience. With <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">our gamified birthday card maker</Link>, you can build a multi-step roast session complete with trivia that your friend has to survive before seeing your hilarious final message. Check out our <Link href="/blog/best-friend-quotes" className="text-primary hover:text-secondary">best friend birthday quotes</Link> for even more inspiration.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-2xl font-bold mb-4">The Ultimate Birthday Roast Experience</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Build a gamified wish that roasts them through puzzles before delivering your real message. Free.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all">
                                Create a Funny Wish Now
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-mom-dad": {
            title: "Birthday Wishes for Mom & Dad — Heartfelt Messages for Parents",
            description: "Express your love with the most emotional and touching birthday wishes for your mother and father. From heartfelt paragraphs to gratitude messages that make them tear up.",
            keywords: "birthday wishes for mom, birthday wishes for dad, happy birthday mom, happy birthday dad, birthday message for mother, birthday message for father, emotional birthday wishes for parents, birthday paragraph for mom, birthday paragraph for dad",
            date: "Nov 22, 2024",
            author: "BirthdayWisher.fun Editorial",
            readTime: "8 min read",
            category: "For Family",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your parents gave you everything. Their birthdays are your chance to give back — not with expensive gifts, but with words that come straight from the heart. These <strong>birthday wishes for mom and dad</strong> will help you express the gratitude and love that&apos;s often hard to say out loud.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-500">💗 Birthday Wishes for Mom</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday, Mom. You sacrificed your sleep, your time, and your peace so I could have a beautiful life. I will never be able to repay that, but I will spend every day trying. I love you.&quot;</li>
                        <li>&quot;To the strongest woman I know: you make everything look easy even when it&apos;s not. Thank you for being my superwoman. Happy Birthday.&quot;</li>
                        <li>&quot;Mom, you&apos;re the reason I know what unconditional love feels like. Every good thing about me, I learned from you. Happy Birthday.&quot;</li>
                        <li>&quot;The older I get, the more I realize how much you were right about literally everything. Happy Birthday to the wisest woman in the universe.&quot;</li>
                        <li>&quot;Happy Birthday to the woman who built a home out of love and a childhood out of magic. You&apos;re everything.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-blue-400">💙 Birthday Wishes for Dad</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday, Dad. You never told me how to live — you lived and let me watch. Thank you for being my silent hero.&quot;</li>
                        <li>&quot;To the man who worked tirelessly so I could dream freely: I hope your birthday is as incredible as the life you&apos;ve given me.&quot;</li>
                        <li>&quot;Dad, I know you&apos;re not big on emotional stuff. But today I want you to know: you&apos;re the greatest man I&apos;ve ever known. Happy Birthday.&quot;</li>
                        <li>&quot;Happy Birthday to the man who taught me that real strength is staying calm when everything is falling apart. I aspire to be like you every day.&quot;</li>
                        <li>&quot;Dad, you always put the family first, even when no one was watching. That&apos;s the kind of person I want to be. Happy Birthday, hero.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Create Something Special for Them</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Parents may not be on TikTok, but they absolutely love personalized, heartfelt surprises. Build a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link> featuring family photos, a heartbeat photo reveal, and your actual voice recording saying &quot;Happy Birthday, Mom/Dad.&quot; It&apos;s the most <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link> they&apos;ll ever receive.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-red-500 fill-red-500" />
                        <h3 className="text-2xl font-bold mb-4">Make Their Birthday Extra Special</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Build a personalized interactive wish with family photos, voice notes, and a heartbeat photo reveal.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all">
                                Create Their Birthday Wish
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-colleague": {
            title: "80+ Birthday Wishes for Colleague, Coworker & Boss — Warm, Short & Funny",
            description: "Copy warm, professional, funny and Hinglish birthday wishes for colleagues, Slack/Teams channels, remote coworkers and bosses.",
            keywords: "birthday wishes for colleague, birthday message for coworker, professional birthday wishes, office birthday messages, slack birthday message, birthday wishes for boss, birthday wishes for work friend, hinglish birthday wishes for colleague",
            date: "Mar 05, 2026",
            modifiedDate: "Nov 18, 2026",
            author: "BirthdayWisher.fun Editorial",
            readTime: "10 min read",
            category: "For Coworkers",
            faq: [
                {
                    q: "What is the best short birthday message for a coworker on Slack or Teams?",
                    a: "Keep it warm, specific, and workplace-safe: 'Happy Birthday! May your coffee stay hot, your calendar stay clear, and your year ahead be amazing!' works brilliantly in any Slack or Microsoft Teams channel."
                },
                {
                    q: "How do you wish your boss or manager a happy birthday professionally?",
                    a: "Focus on gratitude for their mentorship without sounding overly formal: 'Wishing you a very Happy Birthday! Thank you for leading our team with patience, clarity, and encouragement. Have a wonderful celebration!'"
                },
                {
                    q: "What should I write in a group office birthday card when I barely know the colleague?",
                    a: "Go with friendly and inclusive: 'Happy Birthday! Wishing you a relaxing day filled with great food, good laughs, and an awesome year ahead — glad to have you on the team!'"
                },
                {
                    q: "How can our team surprise a remote or work-from-home colleague on their birthday?",
                    a: "Drop a custom Birthday Newspaper link (/games/birthday-newspaper) or Spin-the-Treat-Wheel link (/games/spin-the-wheel) into your team chat — it opens right in their browser with zero login or app install."
                }
            ],
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Your colleague spends more waking hours with you than almost anyone else in your life. Whether they save you during tough client calls, share snacks at 4 PM, or keep your Slack DMs sane — they deserve a <strong>birthday message for coworker</strong> that feels genuine instead of a copy-pasted &quot;HBD!&quot;</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">💼 Professional Yet Warm Birthday Wishes (Email &amp; Card Ready)</h2>
                    <p className="mb-4 text-foreground/70">Polished enough for an email or signed office card, warm enough to actually mean something:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! Working alongside you makes even Monday mornings brighter. Wishing you a joyful day and a rewarding year ahead.&quot;</li>
                        <li>&quot;To a truly dependable teammate — Happy Birthday! May your inbox stay calm today and your year ahead bring exciting wins.&quot;</li>
                        <li>&quot;Happy Birthday! You bring calm, kindness, and positive energy to every project. We&apos;re genuinely lucky to have you on the team.&quot;</li>
                        <li>&quot;Wishing you a birthday filled with great food, zero urgent pings, and the people you love most. Have a wonderful celebration!&quot;</li>
                        <li>&quot;Happy Birthday! Thank you for always being the teammate everyone can count on. Hope this year brings big milestones both at work and beyond.&quot;</li>
                        <li>&quot;Warmest birthday wishes to someone whose ideas and humour lift the whole team every single week. Enjoy your day to the fullest!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">💬 Short One-Liners for Slack, Microsoft Teams &amp; Office WhatsApp</h2>
                    <p className="mb-4 text-foreground/70">Quick, upbeat messages that stand out in a busy <code>#celebrations</code> or team WhatsApp thread:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! May your coffee be strong and your meetings be cancelled today! ☕🎂&quot;</li>
                        <li>&quot;Happiest Birthday! Officially granting you a zero-deadline pass for the next 24 hours 🎉&quot;</li>
                        <li>&quot;Happy Birthday to our resident problem-solver — hope you celebrate big tonight! 🥳&quot;</li>
                        <li>&quot;Levelled up another year! Wishing you cake, calm, and zero &apos;quick 5-min calls&apos; today 🎈&quot;</li>
                        <li>&quot;Happy Birthday! Thanks for bringing elite vibes to every stand-up. Have the best day! 🙌&quot;</li>
                        <li>&quot;Wishing the happiest birthday to the teammate who always knows the answer! 🎁&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">😂 Funny Birthday Wishes for Coworkers &amp; Work Besties</h2>
                    <p className="mb-4 text-foreground/70">For the work bestie who shares eye-contact across Zoom calls and keeps you employed:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! I promise not to CC the manager on anything chaotic today. Today is 100% YOUR day.&quot;</li>
                        <li>&quot;Happy Birthday to the only reason I survive 9 AM Monday calls. Please never switch jobs.&quot;</li>
                        <li>&quot;Another year older, another year of nodding thoughtfully while someone shares their screen! Happy Birthday, legend.&quot;</li>
                        <li>&quot;Happy Birthday! Your gift from me is not scheduling a single meeting on your calendar today. You&apos;re welcome.&quot;</li>
                        <li>&quot;To my favourite work human: without our daily chai/coffee breaks, I would have lost my mind months ago. Happy Birthday!&quot;</li>
                        <li>&quot;Happy Birthday! May your salary grow faster than our backlog this year.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">🌍 Birthday Wishes for Remote &amp; Work-From-Home Teammates</h2>
                    <p className="mb-4 text-foreground/70">Even across cities or time zones, make your remote teammate feel part of the celebration:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday from across the screen! Even on Zoom, your energy lights up our whole team. Hope you log off early and celebrate properly!&quot;</li>
                        <li>&quot;Sending virtual cake across time zones! 🎂 Thank you for making remote teamwork feel effortless. Have an unforgettable birthday!&quot;</li>
                        <li>&quot;Happy Birthday! Wish we could cut a cake at the office together, so please treat yourself to an extra slice on us today!&quot;</li>
                        <li>&quot;From Slack huddles to late deployments, working with you is always a highlight. Have the happiest, screen-free evening!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-gold">🏆 Respectful Birthday Wishes for Your Boss, Manager or Mentor</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! Thank you for being a leader who guides with trust, patience, and clarity rather than pressure. Wishing you a wonderful year ahead.&quot;</li>
                        <li>&quot;Wishing a very Happy Birthday to a mentor whose advice has shaped my career for the better. Have a relaxing and joyful celebration!&quot;</li>
                        <li>&quot;Happy Birthday! Your leadership makes hard projects rewarding and great days even better. Wishing you health, happiness, and continued success.&quot;</li>
                        <li>&quot;Warmest birthday wishes! Thank you for always backing the team and celebrating every small win with us.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">🇮🇳 Warm Hinglish Office Birthday Wishes (WhatsApp Group Hits)</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday yaar! Aaj koi Excel sheet nahi, sirf cake aur party honi chahiye — treat kab de rahe ho? 🎂🥳&quot;</li>
                        <li>&quot;Janamdin mubarak ho! Office ke sabse chill aur helpful teammate ko dher saari khushiyan aur jaldi wala appraisal mile!&quot;</li>
                        <li>&quot;Happy Birthday work bestie! Tere aur shaam ki chai ke bina yeh office survive karna impossible tha ☕❤️&quot;</li>
                        <li>&quot;Wishing you a super Happy Birthday! Aaj laptop jaldi band karo aur full family/friends ke saath enjoy karo 🎉&quot;</li>
                        <li>&quot;Happy Birthday Sir/Ma&apos;am! Aapki guidance aur support ke liye dil se thank you — wishing you great health &amp; success ahead!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">📰 Upgrade the Office Email: Put Them on The Birthday Gazette!</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Want the whole Slack channel laughing and cheering? Put your coworker on the front page of <Link href="/games/birthday-newspaper" className="text-primary hover:text-secondary">The Birthday Gazette newspaper game</Link>, let them spin for a coffee or lunch treat on <Link href="/games/spin-the-wheel" className="text-primary hover:text-secondary">Spin the Treat Wheel</Link>, or build a full <Link href="/use-cases/colleague-birthday-wish" className="text-primary hover:text-secondary">colleague birthday surprise</Link> with team trivia and inside jokes in under 2 minutes!</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold mb-4">Surprise Your Colleague in 60 Seconds</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create a workplace-friendly birthday game or newspaper front page your whole team will love.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all">
                                Create Their Birthday Wish
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "birthday-wishes-for-crush": {
            title: "75+ Birthday Wishes for Your Crush — Sweet, Subtle & Smooth Texts",
            description: "Wondering how to say happy birthday to your crush without being awkward? Copy sweet, subtle, flirty and Hinglish birthday wishes that spark a real conversation.",
            keywords: "birthday wishes for crush, how to say happy birthday to your crush, happy birthday crush, birthday message for crush, cute birthday wishes for crush, flirty birthday text for crush, hinglish birthday wishes for crush",
            date: "Mar 06, 2026",
            modifiedDate: "Nov 18, 2026",
            author: "BirthdayWisher.fun Editorial",
            readTime: "9 min read",
            category: "For Crush",
            faq: [
                {
                    q: "How do I say happy birthday to my crush without sounding awkward or desperate?",
                    a: "Pair a warm, genuine compliment with a light open-ended question so they have an easy way to reply — for example: 'Happy Birthday! Hope today treats you well — what is the #1 birthday snack on the menu today?'"
                },
                {
                    q: "Should I text my crush at midnight (12:00 AM) on their birthday?",
                    a: "If you already talk or snap regularly, texting around 12:02 AM feels thoughtful and sweet. If you barely talk yet, wait until ~10:30 AM or 8:30 PM when the midnight rush is over so your message gets their full attention."
                },
                {
                    q: "What if my crush only replies 'Thank you!!' to my birthday wish?",
                    a: "Avoid dead-end wishes! Add a playful follow-up or send an interactive balloon-pop or birthday cake link (/games/balloon-pop or /games/blow-the-candles) — people naturally reply with their reaction after playing."
                },
                {
                    q: "Can I send a cute digital birthday surprise to my crush?",
                    a: "Yes! Love-Note Balloons (/games/balloon-pop) with 3 light compliments or Hold My Hand (/games/hold-my-hand) if you're already close makes you stand out effortlessly from 50 plain 'HBD' texts."
                }
            ],
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Typing a <strong>birthday wish for your crush</strong> is one of the highest-stakes texts on your phone. Too dry (&quot;HBD!&quot;) and you blend into fifty other notifications. Too intense and it feels sudden. The secret to <strong>how to say happy birthday to your crush</strong> is simple: warm, effortless, and easy to reply to.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-500">💗 Sweet &amp; Subtle Birthday Wishes (Smooth, Zero Awkwardness)</h2>
                    <p className="mb-4 text-foreground/70">These say &quot;you&apos;re genuinely special to me&quot; while keeping things cool and natural:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! Just wanted to say the world definitely got a little brighter the day you showed up. Hope you have the best day 🎉&quot;</li>
                        <li>&quot;Hey, Happy Birthday! You deserve all the good energy today and all year — hope someone spoils you with your favourite cake 🎂&quot;</li>
                        <li>&quot;Happy Birthday to someone who effortlessly makes every room (and group chat) better just by being in it.&quot;</li>
                        <li>&quot;Wishing the happiest birthday to my favourite notification. Hope your year ahead is everything you&apos;ve been manifesting!&quot;</li>
                        <li>&quot;Happy Birthday! Not to be dramatic, but getting to know you has genuinely been a highlight of my year.&quot;</li>
                        <li>&quot;Happiest Birthday! Keep that exact smile going all year — it suits you way too well.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">💬 Reply-Starter Wishes (So They Don&apos;t Just Say &quot;Thanks!&quot;)</h2>
                    <p className="mb-4 text-foreground/70">The #1 mistake is sending a text that ends the chat. Use one of these conversation-starters instead:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday!! Okay serious question: what cake flavour won the birthday spot this year? 🍰&quot;</li>
                        <li>&quot;Happy Birthday! Rate your day out of 10 so far — and if it&apos;s under a 9, coffee/dessert is officially on me.&quot;</li>
                        <li>&quot;Happiest Birthday! Tell me you&apos;re actually taking the day off and doing something fun today?&quot;</li>
                        <li>&quot;Happy Birthday! You get one guilt-free birthday wish today — what are you wishing for first?&quot;</li>
                        <li>&quot;Happy Birthday! I owe you a birthday treat next time I see you — pizza, iced coffee, or ice cream?&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-secondary">😏 Confident &amp; Playfully Flirty Birthday Texts</h2>
                    <p className="mb-4 text-foreground/70">Already bantering or flirting back and forth? Turn the charm up a notch:</p>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! I was going to play it cool today, then decided you deserve to know you&apos;re kind of unforgettable.&quot;</li>
                        <li>&quot;Wishing you the best birthday ever — and if you need great company for round two of cake, my schedule is suspiciously clear 😊&quot;</li>
                        <li>&quot;Happy Birthday to the person who lives rent-free in my head way more than I admit. Have an amazing night! 🎁&quot;</li>
                        <li>&quot;Another year of you getting cuter? Honestly unfair to the rest of us. Happy Birthday!&quot;</li>
                        <li>&quot;Happy Birthday! Consider this your official voucher for one coffee drive with me — redeemable anytime.&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-gold">⏰ Midnight vs Evening: When Should You Text Your Crush?</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">
                        Timing changes how your message lands! <strong>If you talk almost every day:</strong> send your wish between <strong>12:01 AM and 12:05 AM</strong> — it quietly shows they were on your mind. <strong>If you only talk occasionally:</strong> skip the crowded midnight rush and send your message around <strong>10:30 AM</strong> or <strong>8:30 PM</strong> (&quot;Saved my wish for the end of the day so it wouldn&apos;t get buried — hope you had the best birthday!&quot;). Evening birthday texts get 2x longer replies because their day has finally slowed down!
                    </p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-500">💌 Cute Hinglish Birthday Wishes for Your Crush</h2>
                    <ul className="space-y-4 mb-8 text-foreground/80 list-disc pl-6 leading-relaxed">
                        <li>&quot;Happy Birthday! Sach bataun toh tumhari smile dekh kar hi aadha din acha ho jaata hai — keep shining always 🎂💗&quot;</li>
                        <li>&quot;Happiest Birthday! Aaj ka din bilkul tumhari tarah sweet aur special hona chahiye — btw birthday treat kab mil rahi hai? 😊&quot;</li>
                        <li>&quot;Happy Birthday! Zyada cheesy nahi bolunga/bolungi, par tumse baat karna genuinely din ka best part hota hai.&quot;</li>
                        <li>&quot;Janamdin mubarak! Ek coffee treat meri taraf se pending rahi — jab bolo tab chalte hain ☕🎈&quot;</li>
                        <li>&quot;Happy Birthday! Sab log &apos;HBD&apos; bhej rahe honge, toh socha kuch thoda khaas bheju — hope today makes you smile non-stop!&quot;</li>
                    </ul>

                    <h2 className="text-3xl font-bold mt-12 mb-6">🎈 Stand Out Instantly: Send a Cute 30-Second Game Link</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Want a 100% guaranteed &quot;OMG wait how did you make this?!&quot; reply? Hide 3 cute compliments inside <Link href="/games/balloon-pop" className="text-primary hover:text-secondary">Love-Note Balloons</Link>, send a virtual cake they blow out on their phone with <Link href="/games/blow-the-candles" className="text-primary hover:text-secondary">Blow the Candles</Link>, or if things are already getting romantic, try <Link href="/games/hold-my-hand" className="text-primary hover:text-secondary">Hold My Hand (Heartbeat Sync)</Link>. You can also explore our <Link href="/blog/romantic-wishes" className="text-primary hover:text-secondary">romantic birthday wishes guide</Link> for more inspiration.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-pink-500" />
                        <h3 className="text-2xl font-bold mb-4">Make Your Crush Smile in Seconds</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create a playful, low-pressure interactive birthday link they&apos;ll actually remember.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-pink-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all">
                                Create a Crush-Worthy Wish
                            </button>
                        </Link>
                    </div>
                </>
            )
        },
        "long-distance-birthday-ideas": {
            title: "Long Distance Birthday Surprise Ideas — Make Miles Feel Like Inches",
            description: "Being far away doesn't mean you can't make their birthday unforgettable. Here are the best long-distance birthday surprise ideas that bridge the gap with love and creativity.",
            keywords: "long distance birthday ideas, long distance birthday surprise, birthday surprise for long distance boyfriend, long distance birthday gift, virtual birthday surprise, online birthday surprise ideas, birthday ideas for long distance relationship, birthday wishes from far away",
            date: "Mar 07, 2026",
            author: "BirthdayWisher.fun Editorial",
            readTime: "9 min read",
            category: "Long Distance",
            content: (
                <>
                    <p className="text-xl mb-6 text-foreground/80 leading-relaxed font-medium">Being miles apart doesn&apos;t mean you can&apos;t make their birthday magical. In fact, the effort you put into a <strong>long-distance birthday surprise</strong> often means MORE because they know you went above and beyond despite the distance. Here are the best ideas to make them feel loved from anywhere in the world.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">1. The Midnight Text Countdown</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Start texting exactly at midnight their time. Send one message per minute counting down reasons you love them: &quot;Reason #10: You always know what to say when I&apos;m spiraling...&quot; By the time you hit reason #1, follow up with the link to their interactive birthday wish you created on <Link href="/create" className="text-primary hover:text-secondary">BirthdayWisher.fun</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">2. The Interactive Digital Love Story</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">This is THE ultimate long-distance birthday surprise. Create a <Link href="/blog/how-to-create-a-gamified-birthday-card" className="text-primary hover:text-secondary">gamified birthday card</Link> featuring your best memories together, trivia about your relationship (that they have to solve!), a heartbeat photo reveal of your favorite photo together, and your actual voice recording saying &quot;Happy Birthday.&quot; It&apos;s like being there without being there. Perfect for a <Link href="/use-cases/boyfriend-birthday-surprise" className="text-primary hover:text-secondary">boyfriend birthday surprise</Link> or <Link href="/use-cases/girlfriend-birthday-surprise" className="text-primary hover:text-secondary">girlfriend birthday surprise</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">3. Surprise Delivery Chain</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Coordinate with a local friend or family member to deliver a series of small surprises throughout the day: flowers in the morning, their favorite snack at lunch, and a heartfelt handwritten letter in the evening. Each package contains a QR code that leads to a different digital surprise.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">4. Virtual Birthday Party</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Set up a surprise video call with all their friends and family. Ask everyone to hold up letters spelling &quot;HAPPY BIRTHDAY&quot; when the call starts. Record the whole thing and add it to your interactive wish card.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">5. The &quot;Open At&quot; Email Series</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Schedule emails throughout their birthday: &quot;Open at 8 AM&quot; (a childhood photo), &quot;Open at 12 PM&quot; (a voice note), &quot;Open at 6 PM&quot; (the link to their gamified wish). Each one builds anticipation for the next.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">6. Spotify Secret Message Playlist</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Create a playlist where the first letter of each song title spells out a message like &quot;I LOVE YOU HAPPY BDAY.&quot; Name the playlist something mysterious and send it without explanation.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">7. Online Gift Card + Digital Surprise Combo</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">An Amazon or DoorDash gift card for something practical, PLUS a gamified interactive wish for the emotional punch. The gift card says &quot;I care about your comfort&quot; and the wish says &quot;I care about your heart.&quot; It&apos;s the most <Link href="/use-cases/unique-birthday-gift-online" className="text-primary hover:text-secondary">unique birthday gift online</Link>.</p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Why Digital Surprises Work Best for Long Distance</h2>
                    <p className="mb-6 text-foreground/80 leading-relaxed">Physical gifts can get lost in shipping. Video calls depend on schedules and time zones. But a <Link href="/use-cases/digital-story-greeting-card" className="text-primary hover:text-secondary">digital story greeting card</Link> is available the instant you share it — no shipping delays, no timezone coordination. They open it on their terms, and the 10-hour self-destruct feature makes it feel urgent, exclusive, and deeply personal. Browse more ideas in our <Link href="/blog/best-friend-quotes" className="text-primary hover:text-secondary">best friend quotes collection</Link>.</p>

                    <div className="my-16 p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 text-center">
                        <Heart className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                        <h3 className="text-2xl font-bold mb-4">Bridge the Distance with Love</h3>
                        <p className="mb-6 text-foreground/80 text-lg">Create a personalized interactive wish that makes miles feel like inches.</p>
                        <Link href="/create">
                            <button className="px-8 py-4 bg-blue-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                                Create a Long-Distance Surprise
                            </button>
                        </Link>
                    </div>
                </>
            )
        }
    };

    return posts[slug] || null;
}

const SEO_BLOG: Record<string, { title: string; description: string }> = {
    "top-50-heart-touching-birthday-wishes-for-best-friend": {
        title: "50 Heart-Touching Birthday Wishes for Best Friend (2026)",
        description: "Struggling to find the right words? Copy 50 emotional, funny & unique birthday wishes for your best friend, or turn them into a free birthday game.",
    },
    "how-to-create-a-gamified-birthday-card": {
        title: "How to Create a Gamified Birthday Card Online (Free 2026)",
        description: "Learn how to build a free interactive birthday card online with quizzes, heartbeat sync, photos, voice notes & fireworks in under 3 minutes.",
    },
    "romantic-birthday-surprise-ideas-for-boyfriend": {
        title: "10 Romantic Birthday Surprise Ideas for Your Boyfriend",
        description: "Go beyond standard gifts with 10 creative, romantic & budget-friendly birthday surprise ideas for your boyfriend, plus a free interactive wish link.",
    },
    "happy-birthday-wishes-for-sister": {
        title: "50+ Happy Birthday Wishes for Sister (Emotional & Funny)",
        description: "Make your sister's birthday unforgettable with 50+ heart-touching paragraphs, funny sibling roasts & cute wishes ready to copy or send as a game.",
    },
    "birthday-wishes-for-brother": {
        title: "50+ Birthday Wishes for Brother — Emotional & Funny",
        description: "From heartfelt paragraphs for your elder brother to funny sibling roasts, find 50+ birthday wishes for your brother that actually mean something.",
    },
    "birthday-wishes-for-husband": {
        title: "Romantic Birthday Wishes for Husband (Heartfelt & Funny)",
        description: "Find deeply romantic, emotional & funny birthday wishes for your husband — from short WhatsApp texts to heartfelt paragraphs that melt his heart.",
    },
    "birthday-wishes-for-wife": {
        title: "Romantic Birthday Wishes for Wife — Sweet & Heartfelt",
        description: "Make her feel like a queen with romantic, emotional & funny birthday wishes for your wife, plus a free interactive love-story surprise link.",
    },
    "funny-birthday-wishes": {
        title: "100+ Funny Birthday Wishes & Roasts That Make Them Laugh",
        description: "Skip the cringe! Copy 100+ genuinely funny birthday wishes, savage roasts & witty messages for friends, siblings, coworkers and partners.",
    },
    "birthday-wishes-for-mom-dad": {
        title: "Heartfelt Birthday Wishes for Mom & Dad (Parents Guide)",
        description: "Express your gratitude with emotional, heart-touching birthday wishes and paragraphs for your mom and dad, plus a sweet family photo surprise.",
    },
    "birthday-wishes-for-colleague": {
        title: "80+ Birthday Wishes for Colleague, Coworker & Boss (2026)",
        description: "Copy warm, professional & funny birthday messages for coworkers, Slack/Teams channels, remote teammates & bosses — plus Hinglish office wishes.",
    },
    "birthday-wishes-for-crush": {
        title: "75+ Cute Birthday Wishes for Your Crush (Subtle & Smooth)",
        description: "Wondering how to say happy birthday to your crush without being awkward? Copy sweet, subtle, flirty & Hinglish birthday texts that start a chat.",
    },
    "long-distance-birthday-ideas": {
        title: "Long-Distance Birthday Surprise Ideas That Feel Close",
        description: "Bridge the miles with creative long-distance birthday surprise ideas — midnight countdowns, heartbeat sync links, sky lanterns & voice-note cards.",
    },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const post = getPostData(resolvedParams.slug);

    if (!post) {
        return { title: "Post Not Found | BirthdayWisher.fun", robots: { index: false } };
    }

    const seo = SEO_BLOG[resolvedParams.slug] ?? {
        title: post.title.slice(0, 62),
        description: post.description.slice(0, 158),
    };

    return {
        title: seo.title,
        alternates: { canonical: `/blog/${resolvedParams.slug}` },
        description: seo.description,
        keywords: post.keywords,
        openGraph: {
            title: seo.title,
            description: seo.description,
            type: "article",
            authors: [post.author],
            url: `/blog/${resolvedParams.slug}`,
            images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "BirthdayWisher.fun - Turn your birthday wish into a game" }],
        },
        twitter: {
            card: "summary_large_image",
            title: seo.title,
            description: seo.description,
            images: ["/twitter-image.png"],
        }
    };
}

const CATEGORY_EMOJI: Record<string, string> = {
    "For Friends": "🎈",
    "For Partners": "💗",
    "Guides": "🎮",
    "For Family": "🏡",
    "For Everyone": "🎉",
    "For Couples": "💍",
    "For Coworkers": "💼",
    "For Crush": "💌",
    "Long Distance": "✈️",
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = getPostData(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    return (
        <PartyPage>
            <script
                suppressHydrationWarning
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": post.title,
                        "description": post.description,
                        "author": {
                            "@type": "Organization",
                            "name": post.author
                        },
                        "datePublished": toIsoDate(post.date),
                        "dateModified": toIsoDate(post.modifiedDate ?? post.date),
                        "publisher": {
                            "@type": "Organization",
                            "name": "BirthdayWisher.fun",
                            "url": SITE_URL
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `${SITE_URL}/blog/${resolvedParams.slug}`
                        }
                    })
                }}
            />
            <script
                suppressHydrationWarning
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": SITE_URL
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Blog",
                                "item": `${SITE_URL}/blog`
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": post.title,
                                "item": `${SITE_URL}/blog/${resolvedParams.slug}`
                            }
                        ]
                    })
                }}
            />
            {post.faq && post.faq.length > 0 && (
                <script
                    suppressHydrationWarning
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": post.faq.map((f) => ({
                                "@type": "Question",
                                "name": f.q,
                                "acceptedAnswer": { "@type": "Answer", "text": f.a }
                            }))
                        })
                    }}
                />
            )}

            <PageHero
                crumbs={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: post.title }]}
                eyebrow={<>{CATEGORY_EMOJI[post.category] ?? "🎉"} {post.category}</>}
                title={post.title}
                sub={post.description}
            >
                <div className="bw-page-meta">
                    <span className="bw-chip">✍️ {post.author}</span>
                    <span className="bw-chip">📅 {post.modifiedDate ?? post.date}</span>
                    <span className="bw-chip">⏱️ {post.readTime}</span>
                </div>
            </PageHero>

            <section className="bw-section" style={{ paddingTop: 20 }}>
                <div className="bw-container">
                    {/* Article Content */}
                    <div className="bw-card bw-paper">
                        <Prose legacy>{post.content}</Prose>
                    </div>

                    {post.faq && post.faq.length > 0 && (
                        <>
                            <h2 className="bw-section-title" style={{ marginTop: 48, fontSize: "clamp(24px, 3.6vw, 32px)" }}>Frequently Asked Questions 🤔</h2>
                            <div className="bw-faq">
                                {post.faq.map((f, i) => (
                                    <details key={f.q} open={i === 0}>
                                        <summary>{f.q}</summary>
                                        <p>{f.a}</p>
                                    </details>
                                ))}
                            </div>
                        </>
                    )}

                    {/* More Articles Section */}
                    <h2 className="bw-section-title" style={{ marginTop: 56, fontSize: "clamp(26px, 4vw, 36px)" }}>More Birthday Ideas</h2>
                    <div className="bw-guide-grid">
                        <Link href="/blog/best-friend-quotes" className="bw-card bw-guide">
                            <span className="e" aria-hidden="true">🎈</span>
                            <span>
                                100+ Best Friend Quotes
                                <small style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--p-muted)", marginTop: 2 }}>Emotional, funny &amp; roast wishes</small>
                            </span>
                        </Link>
                        <Link href="/blog/romantic-wishes" className="bw-card bw-guide">
                            <span className="e" aria-hidden="true">💗</span>
                            <span>
                                Romantic Wishes &amp; Surprises
                                <small style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--p-muted)", marginTop: 2 }}>For boyfriend, girlfriend &amp; partner</small>
                            </span>
                        </Link>
                        <Link href="/blog" className="bw-card bw-guide">
                            <span className="e" aria-hidden="true">📝</span>
                            <span>
                                Back to all articles
                                <small style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--p-muted)", marginTop: 2 }}>Every wish guide in one place</small>
                            </span>
                        </Link>
                    </div>

                    <CtaCard
                        title="Turn your wish into a birthday game"
                        text="Pick your favourite message and hide it at the end of an interactive surprise with quizzes, photos and confetti."
                        cta="🎁 Create a birthday surprise"
                        emoji="🎂"
                    />
                </div>
            </section>
        </PartyPage>
    );
}
