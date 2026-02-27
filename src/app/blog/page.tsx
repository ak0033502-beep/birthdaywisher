import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Birthday Wishes Ideas, Quotes & Inspiration | BirthdayWisher Blog",
    description: "Discover the best birthday wishes, rare quotes, funny roasts, and unique gift ideas to make your loved ones feel truly special. Heart-touching ideas for best friends, partners, family, and coworkers.",
    keywords: "Birthday wishes, birthday quotes, happy birthday messages, birthday ideas, best friend birthday, romantic birthday wishes, funny birthday wishes, birthday wishes for brother, birthday wishes for sister, birthday wishes for husband, birthday wishes for wife, birthday wishes for mom, birthday wishes for dad",
};

// Mock data for initial SEO until a CMS is ready
const blogPosts = [
    {
        slug: "top-50-heart-touching-birthday-wishes-for-best-friend",
        title: "Top 50 Heart-Touching Birthday Wishes for a Best Friend",
        excerpt: "Struggling to find the right words? Here are 50 unique, emotional, and funny birthday wishes guaranteed to make your bestie smile or cry (happy tears!).",
        date: "Oct 24, 2024",
        author: "BirthdayWisher Team",
        category: "For Friends"
    },
    {
        slug: "romantic-birthday-surprise-ideas-for-boyfriend",
        title: "10 Romantic Birthday Surprise Ideas for Your Boyfriend",
        excerpt: "Go beyond the standard gift. Discover 10 creative, romantic, and budget-friendly birthday surprise ideas for your boyfriend — including the ultimate digital surprise.",
        date: "Oct 15, 2024",
        author: "BirthdayWisher Team",
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
        author: "BirthdayWisher Editorial",
        category: "For Family"
    },
    {
        slug: "birthday-wishes-for-brother",
        title: "50+ Birthday Wishes for Brother — Emotional, Funny & Real",
        excerpt: "From heartfelt paragraphs to savage roasts, find the perfect birthday wish for your brother that actually means something. He won't admit it, but he'll love it.",
        date: "Nov 05, 2024",
        author: "BirthdayWisher Editorial",
        category: "For Family"
    },
    {
        slug: "birthday-wishes-for-husband",
        title: "Romantic Birthday Wishes for Husband — Messages That Melt His Heart",
        excerpt: "Find the most romantic, emotional, and unique birthday wishes for your husband. From short texts to long heartfelt paragraphs for your hubby.",
        date: "Nov 10, 2024",
        author: "BirthdayWisher Editorial",
        category: "For Partners"
    },
    {
        slug: "birthday-wishes-for-wife",
        title: "Birthday Wishes for Wife — Romantic Messages She Deserves",
        excerpt: "The most romantic, emotional, and unique birthday wishes for your wife. Long paragraphs, short texts, and creative surprise ideas to make her day unforgettable.",
        date: "Nov 12, 2024",
        author: "BirthdayWisher Editorial",
        category: "For Partners"
    },
    {
        slug: "funny-birthday-wishes",
        title: "100+ Funny Birthday Wishes That Actually Make People Laugh",
        excerpt: "Skip the cringe. Genuinely funny birthday wishes, savage roasts, and sarcastic messages for friends, siblings, coworkers, and partners.",
        date: "Nov 18, 2024",
        author: "BirthdayWisher Editorial",
        category: "For Everyone"
    },
    {
        slug: "birthday-wishes-for-mom-dad",
        title: "Birthday Wishes for Mom & Dad — Heartfelt Messages for Parents",
        excerpt: "Express your love with the most emotional and touching birthday wishes for your mother and father. Gratitude messages that make them tear up.",
        date: "Nov 22, 2024",
        author: "BirthdayWisher Editorial",
        category: "For Family"
    }
];

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="container max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Idea <span className="text-gradient">Vault.</span></h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Your ultimate resource for finding the perfect birthday wishes, rare quotes, and unique surprise ideas for every relationship — best friends, partners, siblings, parents, and coworkers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <article className="glass-panel p-6 rounded-3xl h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-xs font-bold text-primary mb-4 uppercase tracking-wider">{post.category}</div>
                                <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                                <p className="text-foreground/70 mb-6 flex-grow line-clamp-3">{post.excerpt}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 text-sm text-foreground/50">
                                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</div>
                                    <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">Read <ArrowRight className="w-4 h-4" /></div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
