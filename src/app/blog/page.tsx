import Link from "next/link";
import { Metadata } from "next";
import { PartyPage, PageHero, CtaCard } from "@/components/party/PartyPage";

export const metadata: Metadata = {
    alternates: { canonical: "/blog" },
    title: "Birthday & Anniversary Wishes Ideas, Quotes & Inspiration | BirthdayWisher.fun Blog",
    description: "Discover the best birthday wishes, wedding anniversary wishes for couple, rare quotes, funny roasts, and unique gift ideas. Heart-touching ideas for best friends, partners, couples, family, and coworkers.",
    keywords: "Birthday wishes, birthday quotes, happy birthday messages, birthday ideas, best friend birthday, romantic birthday wishes, funny birthday wishes, birthday wishes for brother, birthday wishes for sister, birthday wishes for husband, birthday wishes for wife, birthday wishes for mom, birthday wishes for dad, wedding anniversary wishes for couple, anniversary wishes for couple, happy anniversary wishes, marriage anniversary wishes",
};

const CAT_STYLE: Record<string, { e: string; c: string }> = {
    "For Friends": { e: "🎈", c: "var(--p-pink)" },
    "For Partners": { e: "💖", c: "var(--p-grape)" },
    "Guides": { e: "🎮", c: "var(--p-mint)" },
    "For Family": { e: "🏡", c: "var(--p-orange)" },
    "For Everyone": { e: "🎉", c: "var(--p-pink)" },
    "For Couples": { e: "💍", c: "var(--p-grape)" },
    "For Coworkers": { e: "💼", c: "var(--p-mint)" },
    "For Crush": { e: "💌", c: "var(--p-pink)" },
    "Long Distance": { e: "✈️", c: "var(--p-orange)" },
};

const blogPosts = [
    {
        slug: "top-50-heart-touching-birthday-wishes-for-best-friend",
        title: "Top 50 Heart-Touching Birthday Wishes for a Best Friend",
        excerpt: "Struggling to find the right words? Here are 50 unique, emotional, and funny birthday wishes guaranteed to make your bestie smile or cry (happy tears!).",
        date: "Oct 24, 2024",
        author: "BirthdayWisher.fun Team",
        category: "For Friends"
    },
    {
        slug: "best-friend-quotes",
        title: "100+ Best Friend Birthday Quotes & Wishes That Hit Different",
        excerpt: "Find the most heart-touching, funny, and unique birthday wishes for your best friend. Copy-paste ready emotional quotes, roast messages, and surprise ideas.",
        date: "Oct 25, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Friends"
    },
    {
        slug: "romantic-wishes",
        title: "Romantic Birthday Wishes & Surprises for Boyfriend, Girlfriend & Partner",
        excerpt: "Find the most romantic birthday wishes, love quotes, surprise ideas, and creative digital gifts for your boyfriend, girlfriend, husband, or wife.",
        date: "Oct 22, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Partners"
    },
    {
        slug: "romantic-birthday-surprise-ideas-for-boyfriend",
        title: "10 Romantic Birthday Surprise Ideas for Your Boyfriend",
        excerpt: "Go beyond the standard gift. Discover 10 creative, romantic, and budget-friendly birthday surprise ideas for your boyfriend — including the ultimate digital surprise.",
        date: "Oct 15, 2024",
        author: "BirthdayWisher.fun Team",
        category: "For Partners"
    },
    {
        slug: "how-to-create-a-gamified-birthday-card",
        title: "How to Create a Gamified Birthday Card Online in 2025",
        excerpt: "Text messages are boring. Learn how you can build a 20-step interactive journey with puzzles, voice notes, and fireworks to give them an unforgettable birthday experience.",
        date: "Oct 05, 2024",
        author: "Product Team",
        category: "Guides"
    },
    {
        slug: "happy-birthday-wishes-for-sister",
        title: "50+ Happy Birthday Wishes for Sister — Emotional, Funny & Heartfelt",
        excerpt: "Make your sister's birthday extra special with heart-touching emotional paragraphs and savage roasts that only a sibling can deliver.",
        date: "Nov 02, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Family"
    },
    {
        slug: "birthday-wishes-for-brother",
        title: "50+ Birthday Wishes for Brother — Emotional, Funny & Real",
        excerpt: "From heartfelt paragraphs to savage roasts, find the perfect birthday wish for your brother that actually means something. He won't admit it, but he'll love it.",
        date: "Nov 05, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Family"
    },
    {
        slug: "birthday-wishes-for-husband",
        title: "Romantic Birthday Wishes for Husband — Messages That Melt His Heart",
        excerpt: "Find the most romantic, emotional, and unique birthday wishes for your husband. From short texts to long heartfelt paragraphs for your hubby.",
        date: "Nov 10, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Partners"
    },
    {
        slug: "birthday-wishes-for-wife",
        title: "Birthday Wishes for Wife — Romantic Messages She Deserves",
        excerpt: "The most romantic, emotional, and unique birthday wishes for your wife. Long paragraphs, short texts, and creative surprise ideas to make her day unforgettable.",
        date: "Nov 12, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Partners"
    },
    {
        slug: "funny-birthday-wishes",
        title: "100+ Funny Birthday Wishes That Actually Make People Laugh",
        excerpt: "Skip the cringe. Genuinely funny birthday wishes, savage roasts, and sarcastic messages for friends, siblings, coworkers, and partners.",
        date: "Nov 18, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Everyone"
    },
    {
        slug: "birthday-wishes-for-mom-dad",
        title: "Birthday Wishes for Mom & Dad — Heartfelt Messages for Parents",
        excerpt: "Express your love with the most emotional and touching birthday wishes for your mother and father. Gratitude messages that make them tear up.",
        date: "Nov 22, 2024",
        author: "BirthdayWisher.fun Editorial",
        category: "For Family"
    },
    {
        slug: "wedding-anniversary-wishes-for-couple",
        title: "100+ Wedding Anniversary Wishes for Couple — Romantic, Funny & Heartfelt",
        excerpt: "The best wedding anniversary wishes for couple — from 1st to 50th year. Romantic, funny, and heart-touching anniversary messages for husband, wife, parents, and friends.",
        date: "Mar 02, 2026",
        author: "BirthdayWisher.fun Editorial",
        category: "For Couples"
    },
    {
        slug: "birthday-wishes-for-colleague",
        title: "Birthday Wishes for Colleague & Coworker — Professional Yet Heartfelt",
        excerpt: "Find the perfect birthday wishes for your colleague or coworker. From professional to funny, these messages strike the right balance between warmth and workplace appropriateness.",
        date: "Mar 05, 2026",
        author: "BirthdayWisher.fun Editorial",
        category: "For Coworkers"
    },
    {
        slug: "birthday-wishes-for-crush",
        title: "Birthday Wishes for Crush — Sweet, Subtle & Smooth Messages",
        excerpt: "Don't know what to say to your crush on their birthday? These sweet, subtle, and smooth birthday wishes help you express your feelings without being too forward.",
        date: "Mar 06, 2026",
        author: "BirthdayWisher.fun Editorial",
        category: "For Crush"
    },
    {
        slug: "long-distance-birthday-ideas",
        title: "Long Distance Birthday Surprise Ideas — Make Miles Feel Like Inches",
        excerpt: "Being far away doesn't mean you can't make their birthday unforgettable. The best long-distance birthday surprise ideas that bridge the gap with love and creativity.",
        date: "Mar 07, 2026",
        author: "BirthdayWisher.fun Editorial",
        category: "Long Distance"
    }
];

export default function BlogIndex() {
    return (
        <PartyPage>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Birthday & Anniversary Wishes Ideas, Quotes & Inspiration",
                        "description": "Discover the best birthday wishes, wedding anniversary wishes for couple, rare quotes, funny roasts, and unique gift ideas.",
                        "url": "https://www.birthdaywisher.fun/blog",
                        "isPartOf": {
                            "@type": "WebSite",
                            "name": "BirthdayWisher.fun",
                            "url": "https://www.birthdaywisher.fun"
                        }
                    })
                }}
            />

            <PageHero
                center
                crumbs={[{ name: "Home", href: "/" }, { name: "Blog" }]}
                eyebrow="📝 Birthday wish ideas & guides"
                title={<>Idea <span className="bw-hl">Vault.</span></>}
                sub="Your ultimate resource for finding the perfect birthday wishes, rare quotes, and unique surprise ideas for every relationship — best friends, partners, siblings, parents, and coworkers."
            />

            <section className="bw-section" style={{ paddingTop: 24 }}>
                <div className="bw-container">
                    <div className="bw-post-grid">
                        {blogPosts.map((post) => {
                            const st = CAT_STYLE[post.category] ?? { e: "🎂", c: "var(--p-pink)" };
                            return (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="bw-card bw-post-card"
                                    style={{ ["--c" as string]: st.c }}
                                >
                                    <span className="cat">{st.e} {post.category}</span>
                                    <h2>{post.title}</h2>
                                    <p>{post.excerpt}</p>
                                    <div className="meta">
                                        <span>📅 {post.date}</span>
                                        <span>✍️ {post.author}</span>
                                    </div>
                                    <span className="go">Read article →</span>
                                </Link>
                            );
                        })}
                    </div>

                    <CtaCard
                        title="Found the perfect words? Make them playable!"
                        text="Turn any quote or message into an interactive birthday surprise with photos, voice notes, mini-games and confetti."
                        cta="🎁 Create a birthday surprise"
                        emoji="🎂"
                    />
                </div>
            </section>
        </PartyPage>
    );
}
