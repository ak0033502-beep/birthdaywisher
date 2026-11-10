import { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartyPage, Prose, CtaCard } from "@/components/party/PartyPage";
import { Bunting } from "@/components/party/Decor";

// Data specific for the high-converting "Use Case" landing pages in the footer
const getUseCaseData = (slug: string) => {
    const useCases: Record<string, { title: string, subtitle: string, description: string, benefits: string[], ctaText: string, heroEmoji: string, seoSections: { heading: string, body: string }[] }> = {
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
            heroEmoji: "🎁",
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
            heroEmoji: "📱",
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
            heroEmoji: "💙",
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
        "anniversary-wishes-for-couple": {
            title: "Wedding Anniversary Wishes for Couple — Interactive & Gamified",
            subtitle: "Go beyond a boring text. Create an unforgettable interactive anniversary experience.",
            description: "Celebrate any wedding anniversary with a deeply personal, gamified digital wish. BirthdayWisher.fun lets you build an interactive anniversary story for any couple — from 1st to 50th year. Upload wedding photos, record a heartfelt voice note, and add a 'How Well Do You Know Each Other?' quiz. The perfect wedding anniversary wishes for couple, delivered digitally.",
            benefits: [
                "Perfect for any milestone — 1st, 5th, 10th, 25th, or 50th anniversary.",
                "Upload couple photos & record a heartfelt anniversary voice note.",
                "Add a 'How Well Do You Know Your Partner?' interactive quiz.",
                "Self-destructs after opening for complete privacy."
            ],
            ctaText: "Create Anniversary Wish",
            heroEmoji: "💍",
            seoSections: [
                {
                    heading: "Why Digital Anniversary Wishes Are the Future",
                    body: "In a world where couples have everything, the most meaningful wedding anniversary wish for a couple isn't something you buy — it's something you build. A personalized interactive anniversary story shows more love, effort, and thoughtfulness than any store-bought card ever could. Whether you're creating anniversary wishes for your own partner, your parents, or your favorite couple, the digital experience creates an emotional impact that lasts far beyond the day itself."
                },
                {
                    heading: "Personalized Anniversary Wishes for Every Milestone",
                    body: "From the excitement of a 1st anniversary to the gravitas of a golden 50th, every milestone deserves unique recognition. Our platform helps you craft wedding anniversary wishes for couple that match the significance of the occasion. Add memories from each year, create inside-joke trivia questions, and let the couple relive their love story through an interactive, tap-through experience that ends with a stunning celebration."
                },
                {
                    heading: "The Perfect Couple Gift: An Interactive Love Story",
                    body: "Forget the generic 'Happy Anniversary' text. With BirthdayWisher.fun, you create a multi-step interactive journey specifically designed for the couple. It includes a memory quiz where they prove how well they know each other, floating memory bubbles of their best moments, a heartbeat photo reveal of their favorite wedding photo, and a finale complete with confetti and your recorded voice note. It's not just anniversary wishes for couple — it's an experience they'll never forget."
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
            heroEmoji: "💖",
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
        },
        "long-distance-birthday-surprise": {
            title: "Long Distance Birthday Surprise Online",
            subtitle: "Miles apart, but the love hits close to home.",
            description: "Being in a long-distance relationship doesn't mean you can't make their birthday magical. Create an interactive, gamified birthday wish that delivers your love instantly — no shipping delays, no timezone headaches. Just pure, personalized emotion delivered via a secret link.",
            benefits: [
                "Instant delivery via link — works anywhere in the world.",
                "Record a voice note so they hear YOUR voice on their birthday.",
                "Add your best couple photos to a heartbeat photo reveal.",
                "Self-destructs after 10 hours for intimate, private experience."
            ],
            ctaText: "Bridge the Distance Now",
            heroEmoji: "✈️",
            seoSections: [
                {
                    heading: "Why Long-Distance Birthday Surprises Matter Even More",
                    body: "When you're in a long-distance relationship, every gesture carries extra weight. A birthday wish isn't just a formality — it's proof that distance hasn't dimmed your love. The effort you invest in creating something personal and interactive shows your partner that you're thinking about them deeply, even when you can't be physically present. That's why BirthdayWisher.fun is the perfect tool for long-distance couples."
                },
                {
                    heading: "The Digital Advantage Over Physical Gifts",
                    body: "Physical gifts shipped internationally face customs delays, damaged packaging, and unpredictable delivery windows. A digital birthday surprise, however, arrives instantly. The second you share the link, your partner can begin their interactive journey — complete with puzzles about your relationship, your recorded voice, and a stunning visual celebration. No tracking numbers needed."
                },
                {
                    heading: "Making It Feel Like You're Right There",
                    body: "The voice note feature is a game-changer for long-distance couples. As the final fireworks explode on screen, your actual voice plays — raw, unedited, sincere. It's the closest thing to being there in person. Combined with your photos, inside jokes, and memory quizzes, this creates an experience that transcends physical distance."
                }
            ]
        },
        "colleague-birthday-wish": {
            title: "Birthday Wish for Colleague & Coworker",
            subtitle: "Go beyond the generic Slack message. Make it memorable.",
            description: "Your colleague deserves more than a 'Happy Birthday' on the team channel. Create a fun, interactive birthday wish featuring work inside jokes, team trivia, and a heartfelt message. It's the most creative office birthday surprise — and it's completely free.",
            benefits: [
                "Perfect balance of professional and personal.",
                "Feature work inside jokes and team memories.",
                "Easy to share via Slack, Teams, or email link.",
                "Fun interactive elements that will entertain the whole team."
            ],
            ctaText: "Create Colleague's Birthday Wish",
            heroEmoji: "🎉",
            seoSections: [
                {
                    heading: "Why Personalized Colleague Birthday Wishes Stand Out",
                    body: "In a typical office, birthdays are celebrated with a mass email or a signed card that people barely glance at. A personalized, interactive birthday wish for a colleague shows genuine care and effort. It features their specific contributions, work style, and the funny moments that make your professional relationship special. It's the kind of gesture that strengthens team bonds."
                },
                {
                    heading: "Perfect for Remote Teams",
                    body: "If your team works remotely, traditional birthday celebrations are even harder. You can't bring a cake or decorate their desk. But you CAN send a gamified digital wish that the entire team can enjoy. Add trivia questions like 'What's their go-to coffee order?' or 'What's their famous catchphrase in meetings?' — it becomes a fun team activity."
                },
                {
                    heading: "From Casual to Heartfelt",
                    body: "Whether they're your work bestie or a valued professional connection, BirthdayWisher.fun lets you customize the tone. Set the vibe slider to 'Celebration' for a light, fun experience, or go with 'Pure Romance' for a closer work friend who's practically family. Either way, it beats the standard office birthday email chain."
                }
            ]
        },
        "parents-birthday-surprise": {
            title: "Birthday Surprise for Mom & Dad — Digital Love Letter",
            subtitle: "Give your parents the gratitude they've always deserved.",
            description: "Your parents gave you everything. Now give them a birthday surprise that captures decades of love, gratitude, and inside jokes. Create an interactive digital love letter featuring family photos, a heartfelt voice recording, and a walk down memory lane they'll never forget.",
            benefits: [
                "Upload childhood & family photos for heartbeat photo reveal.",
                "Record a voice note saying what you've always wanted to say.",
                "Add family trivia and inside jokes as interactive elements.",
                "Perfect for parents who live far away."
            ],
            ctaText: "Surprise Mom or Dad Now",
            heroEmoji: "👨‍👩‍👧",
            seoSections: [
                {
                    heading: "Why Parents Deserve the Best Birthday Surprise",
                    body: "Parents rarely ask for anything on their birthdays. A simple 'Happy Birthday, Mom' or 'Happy Birthday, Dad' text feels inadequate for the people who gave you life, sacrificed their sleep, and loved you unconditionally. An interactive birthday surprise lets you express the depth of your gratitude in a way that words alone cannot capture."
                },
                {
                    heading: "The Family Memory Lane Experience",
                    body: "Nothing makes parents happier than reliving family memories. BirthdayWisher.fun lets you create a journey through time — upload childhood photos that slowly reveal in a heartbeat animation, add family trivia ('In which year did we take our first family vacation?'), and include the quirky family traditions that only your family understands. It's a digital scrapbook that comes alive."
                },
                {
                    heading: "Perfect for Adult Children Living Far Away",
                    body: "If you've moved away for work or studies, a physical gift might feel impersonal. But a personalized interactive wish with your actual voice recording? That's pure love delivered digitally. As your mom or dad taps through each section, hearing your voice at the finale, it creates an emotional experience that no Amazon delivery could ever match."
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
        return { title: "Use Case Not Found | BirthdayWisher.fun", robots: { index: false } };
    }

    return {
        title: `${data.title} | BirthdayWisher.fun`,
        alternates: { canonical: `/use-cases/${resolvedParams.slug}` },
        description: data.description,
        openGraph: {
            title: data.title,
            description: data.description,
            url: `/use-cases/${resolvedParams.slug}`,
            images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "BirthdayWisher.fun - Turn your birthday wish into a game" }],
        },
    };
}

const USE_CASE_LINKS: { slug: string; e: string; name: string }[] = [
    { slug: "unique-birthday-gift-online", e: "🎁", name: "Unique Birthday Gift Online" },
    { slug: "digital-story-greeting-card", e: "📱", name: "Digital Story Greeting Card" },
    { slug: "boyfriend-birthday-surprise", e: "💙", name: "Boyfriend Birthday Surprise" },
    { slug: "girlfriend-birthday-surprise", e: "💖", name: "Girlfriend Birthday Surprise" },
    { slug: "anniversary-wishes-for-couple", e: "💍", name: "Anniversary Wishes for Couple" },
    { slug: "long-distance-birthday-surprise", e: "✈️", name: "Long Distance Birthday Surprise" },
    { slug: "colleague-birthday-wish", e: "🎉", name: "Colleague Birthday Wish" },
    { slug: "parents-birthday-surprise", e: "👨‍👩‍👧", name: "Parents Birthday Surprise" },
];

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const data = getUseCaseData(slug);

    if (!data) {
        notFound();
    }

    const isAnniversary = slug === "anniversary-wishes-for-couple";
    const createHref = isAnniversary ? "/create?type=anniversary" : "/create";
    const related = USE_CASE_LINKS.filter((u) => u.slug !== slug);

    return (
        <PartyPage>
            <JsonLd data={[
                { "@context": "https://schema.org", "@type": "WebPage", name: data.title, description: data.description, url: absUrl(`/use-cases/${slug}`) },
                breadcrumbLd([{ name: "Home", path: "/" }, { name: data.title, path: `/use-cases/${slug}` }]),
            ]} />

            <header className="bw-hero bw-page-hero">
                <Bunting />
                <div className="bw-container bw-page-hero-in">
                    <nav aria-label="Breadcrumb" className="bw-crumbs">
                        <Link href="/">← Back to Home</Link>
                    </nav>
                    <div className="bw-split">
                        <div>
                            <div className="bw-uc-emoji" aria-hidden="true">{data.heroEmoji}</div>
                            <h1>{data.title}</h1>
                            <p className="bw-uc-subtitle">{data.subtitle}</p>
                            <p className="bw-sub">{data.description}</p>
                            <ul className="bw-checks">
                                {data.benefits.map((benefit, i) => (
                                    <li key={i}>{benefit}</li>
                                ))}
                            </ul>
                            <Link href={createHref} className="bw-btn bw-btn-primary bw-uc-cta">{data.heroEmoji} {data.ctaText}</Link>
                        </div>

                        <div className="bw-uc-visual" aria-hidden="true">
                            <div className="bw-card bw-uc-card">
                                <div className="bw-uc-gift">{isAnniversary ? "💝" : "🎁"}</div>
                                <h3>See the surprise</h3>
                                <p>Takes exactly 3 minutes to build a customized wish they will never forget.</p>
                                <ol className="bw-uc-steps">
                                    <li><span style={{ ["--c" as string]: "var(--p-pink)" }}>1</span> Add photos, jokes &amp; a voice note</li>
                                    <li><span style={{ ["--c" as string]: "var(--p-grape)" }}>2</span> Pick the vibe &amp; the music</li>
                                    <li><span style={{ ["--c" as string]: "var(--p-mint)" }}>3</span> Send the secret link 🎈</li>
                                </ol>
                                <div className="bw-uc-bar"><i /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Long Form SEO Content Section */}
            <section className="bw-section" style={{ paddingTop: 30 }}>
                <div className="bw-container">
                    <div className="bw-card bw-paper" style={{ maxWidth: 860, margin: "0 auto" }}>
                        <Prose>
                            {data.seoSections?.map((section, idx) => (
                                <div key={idx}>
                                    <h2>{section.heading}</h2>
                                    <p>{section.body}</p>
                                </div>
                            ))}
                        </Prose>
                    </div>
                </div>
            </section>

            {/* Related use cases */}
            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>More ways to surprise someone 🎈</h2></div>
                    <div className="bw-guide-grid">
                        {related.map((u) => (
                            <Link key={u.slug} href={`/use-cases/${u.slug}`} className="bw-card bw-guide">
                                <span className="e" aria-hidden="true">{u.e}</span>{u.name}
                            </Link>
                        ))}
                        <Link href="/birthday-wishes-game" className="bw-card bw-guide">
                            <span className="e" aria-hidden="true">🎮</span>Birthday Wishes Games
                        </Link>
                    </div>
                    <CtaCard
                        title={isAnniversary ? "Make their anniversary unforgettable" : "Ready to make their day unforgettable?"}
                        text="Free, private and ready in about 3 minutes — no app, no sign-up."
                        href={createHref}
                        cta={`${data.heroEmoji} ${data.ctaText}`}
                        emoji={isAnniversary ? "🥂" : "🎂"}
                    />
                </div>
            </section>
        </PartyPage>
    );
}
