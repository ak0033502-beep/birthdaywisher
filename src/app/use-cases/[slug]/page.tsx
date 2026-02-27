import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle, Heart, Gift } from "lucide-react";
import { notFound } from "next/navigation";

// Data specific for the high-converting "Use Case" landing pages in the footer
const getUseCaseData = (slug: string) => {
    const useCases: Record<string, { title: string, subtitle: string, description: string, benefits: string[], ctaText: string, heroIcon: React.ReactNode, seoSections: { heading: string, body: string }[] }> = {
        "unique-birthday-gift-online": {
            title: "The Most Unique Birthday Gift Online",
            subtitle: "Why buy a boring physical gift when you can create an unforgettable digital experience?",
            description: "In a world of Amazon deliveries, the most unique birthday gifts are the ones that evoke real emotion. BirthdayWisher.fun lets you build a personalized, interactive, 20-step gamified story. It’s not just a digital greeting card—it’s an emotional rollercoaster wrapped in an interactive game.",
            benefits: [
                "100% Free & instant delivery via link.",
                "Interactive puzzles (Memory Quiz, Secret Date).",
                "Heartbeat photo reveal with custom background music.",
                "Self-destructs after opening for ultimate privacy."
            ],
            ctaText: "Create the Ultimate Gift",
            heroIcon: <Gift className="w-16 h-16 text-primary mb-6" />,
            seoSections: [
                {
                    heading: "Why Digital Gifts Are Taking Over",
                    body: "We live in an era where physical items are often forgotten, but experiences last forever. A unique birthday gift online isn't about the monetary value; it's about the emotional resonance. By creating a gamified journey, you're not just sending a message—you're gifting them your time, your effort, and a beautiful walk down memory lane. This level of personalization is impossible to find in a store-bought item."
                },
                {
                    heading: "The Power of Gamification and Surprise",
                    body: "Our unique platform forces the birthday boy or girl to truly interact. When was the last time a piece of folded cardboard made someone laugh out loud or tear up? BirthdayWisher.fun combines interactive trivia about your relationship with stunning visual aesthetics, resulting in a 'WOW' moment when the final heartbeat photo fades in alongside your custom voice note."
                },
                {
                    heading: "Instant, Free, and Private",
                    body: "The most unique birthday gifts shouldn't require shipping delays or expensive subscriptions. Our digital story maker is completely free. Moreover, we prioritize your privacy. The generated wish link is designed to self-destruct after it's opened, ensuring your intimate photos and voice messages remain completely secure and ephemeral."
                }
            ]
        },
        "digital-story-greeting-card": {
            title: "Digital Story Greeting Card Maker",
            subtitle: "Upgrade from WhatsApp text messages to a cinematic story experience.",
            description: "Send a digital story greeting card that rivals Spotify Wrapped. Add inside jokes, voice notes, personalized visual aesthetics, and custom fireworks. Watch them tap through a beautifully animated journey created entirely by you.",
            benefits: [
                "Premium animations powered by Framer Motion.",
                "Upload audio voice notes and special memories.",
                "Customize the overarching 'Vibe' (Roast, Romantic, Celebration).",
                "Looks incredible on mobile devices."
            ],
            ctaText: "Start Your Story Card",
            heroIcon: <Sparkles className="w-16 h-16 text-secondary mb-6" />,
            seoSections: [
                {
                    heading: "Beyond Traditional E-Cards",
                    body: "Traditional e-cards are a relic of the early internet. They are flat, uninspired, and usually end up in the spam folder. A Digital Story Greeting Card, however, is a cinematic, web-based applet built specifically for the recipient. It utilizes smooth frame-by-frame animations, interactive components, and layered audiovisuals to create a modern storytelling experience."
                },
                {
                    heading: "Step-by-Step Personalization",
                    body: "With our Digital Story Greeting Card maker, you act as the director. You choose the soundtrack, you dictate the pacing, and you write the script. From a 'roast' section where you poke fun at their embarrassing moments to the highly emotional climax containing long-form paragraphs of appreciation, every pixel of the story is yours to command."
                },
                {
                    heading: "Optimized for Mobile Viewing",
                    body: "We know that 90% of birthday wishes are opened on a phone. That's why your digital story is engineered like a premium native mobile application. With haptic feedback (vibrations), swipe gestures, and edge-to-edge media reveals, the Digital Story Greeting Card feels incredibly satisfying to navigate."
                }
            ]
        },
        "boyfriend-birthday-surprise": {
            title: "The Ultimate Boyfriend Birthday Surprise",
            subtitle: "Make him smile, laugh, and maybe even shed a tear.",
            description: "Looking for the perfect birthday surprise for your boyfriend? Combine an emotional 'Roast vs. Toast', a quiz to see how well he remembers your anniversaries, and a haptic 'Virtual Hug' button that physically vibrates his phone.",
            benefits: [
                "Add a 'Future Promise' ticket for your next date.",
                "Tease him with a fun roasting session before the emotional reveal.",
                "Upload your favorite couple photos.",
                "Include a secret time-capsule message."
            ],
            ctaText: "Surprise Your Boyfriend",
            heroIcon: <Heart className="w-16 h-16 text-blue-500 mb-6" />,
            seoSections: [
                {
                    heading: "How to Surprise Your Boyfriend Online",
                    body: "Finding the right birthday surprise for a boyfriend can be tough—especially if you're in a long-distance relationship or waiting for the midnight clock to strike. Men often pretend they don't care about aesthetic gifts, but a deeply personalized interactive game centered around your relationship consistently proves otherwise. It's the ultimate digital flex of girlfriend-tier effort."
                },
                {
                    heading: "The 'Roast and Toast' Method",
                    body: "The best boyfriend birthday surprise balances humor with deep affection. Start your gamified setup by roasting his terrible fashion sense or his obsession with video games. Once his guard is down and he's laughing, hit him with the 'Toast'—a beautiful, heartfelt voice note playing over your favorite polaroid picture together. It creates a massive emotional impact."
                },
                {
                    heading: "The Golden Ticket Feature",
                    body: "Don't let the surprise end when the link closes. Use our integrated 'Golden Ticket' feature to promise a future activity. Whether it's a homemade dinner, a weekend trip, or simply choosing the movie for the next three nights, the Golden Ticket acts as a digital coupon that extends the boyfriend birthday surprise straight into the real world."
                }
            ]
        },
        "girlfriend-birthday-surprise": {
            title: "The Most Romantic Girlfriend Birthday Surprise",
            subtitle: "Give her the aesthetic, emotional, 'Instagram-worthy' wish she deserves.",
            description: "Make your girlfriend's birthday unforgettable. Build a stunning digital journey featuring floating 'memory bubbles' of her cute quirks, a heartbeat photo reveal, and a grand finale celebration tailored just for her.",
            benefits: [
                "Extremely aesthetic and visually pleasing designs.",
                "Add a heartfelt, raw audio recording of your voice.",
                "Surprise her with a personalized 'Golden Ticket'.",
                "Make her laugh with custom inside jokes."
            ],
            ctaText: "Create Her Perfect Surprise",
            heroIcon: <Heart className="w-16 h-16 text-pink-500 mb-6" />,
            seoSections: [
                {
                    heading: "Creating a Core Memory",
                    body: "A truly romantic girlfriend birthday surprise is all about the details. It's not just about saying 'I love you'; it's about proving that you pay attention. When she taps through her custom digital story and sees references to that one specific coffee shop where you met, or the weird nickname only you use for her, it solidifies a core memory she will brag about to all her friends."
                },
                {
                    heading: "The Aesthetics of Romance",
                    body: "We understand that presentation is everything. Our platform provides premium, silky-smooth animations wrapped in aesthetic, modern typography. Your girlfriend's birthday surprise will look like it was designed by a high-end creative agency. From elegant floating memory bubbles to the rhythmic fade-in of your favorite couple photo, every visual element is engineered for maximum romantic impact."
                },
                {
                    heading: "Unleashing the Voice Note",
                    body: "Text can easily be misinterpreted, but a voice note carries your exact tone, emotion, and sincerity. The climax of this Girlfriend Birthday Surprise allows your unedited, raw audio to play in the background while fireworks animate on the screen. It's a digital serenity that bridges physical distance and delivers a level of intimacy that physical cards simply cannot match."
                }
            ]
        }
    };

    return useCases[slug] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const data = getUseCaseData(resolvedParams.slug);

    if (!data) {
        return { title: "Use Case Not Found | BirthdayWisher.fun" };
    }

    return {
        title: `${data.title} | BirthdayWisher.fun`,
        description: data.description,
        openGraph: {
            title: data.title,
            description: data.description,
        },
    };
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const data = getUseCaseData(resolvedParams.slug);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 overflow-hidden relative">
            {/* Background Element */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />

            <main className="container max-w-5xl mx-auto px-6">

                <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-12 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        {data.heroIcon}
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">{data.title}</h1>
                        <p className="text-xl text-primary font-bold mb-6">{data.subtitle}</p>
                        <p className="text-lg text-foreground/80 leading-relaxed mb-10">
                            {data.description}
                        </p>

                        <div className="space-y-4 mb-12 border-l-2 border-white/10 pl-6">
                            {data.benefits.map((benefit, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                                    <span className="text-foreground/80 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/create">
                            <button className="px-10 py-5 bg-primary text-white font-black rounded-full hover:shadow-[0_0_30px_rgba(255,105,180,0.5)] transition-all hover:-translate-y-1 text-lg w-full sm:w-auto text-center">
                                {data.ctaText}
                            </button>
                        </Link>
                    </div>

                    {/* Right Visual (Interactive Prompt) */}
                    <div className="hidden lg:flex justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] blur-2xl transform rotate-6" />
                        <div className="relative glass-panel rounded-[3rem] p-12 border border-white/10 shadow-2xl flex flex-col items-center text-center w-full max-w-sm">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-8 relative overflow-hidden group">
                                <Sparkles className="w-10 h-10 text-primary animate-pulse relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">See The Magic</h3>
                            <p className="text-foreground/60 mb-8">Takes exactly 3 minutes to build a customized wish they will never forget.</p>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-2/3 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Long Form SEO Content Section */}
                <div className="mt-32 pt-20 border-t border-white/10">
                    <div className="max-w-3xl mx-auto space-y-16">
                        {data.seoSections?.map((section, idx) => (
                            <div key={idx} className="prose prose-invert prose-lg max-w-none">
                                <h2 className="text-3xl font-bold mb-6 text-white">{section.heading}</h2>
                                <p className="text-foreground/70 leading-relaxed font-medium">
                                    {section.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
