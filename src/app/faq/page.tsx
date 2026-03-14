import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
    title: "FAQ — Birthday Wishes & Anniversary Card Questions Answered | BirthdayWisher.fun",
    description: "Get answers to frequently asked questions about birthday wishes, online birthday cards, anniversary wishes for couple, and how to use BirthdayWisher.fun to create interactive, gamified greetings.",
    keywords: "birthday wishes FAQ, how to wish happy birthday uniquely, what to write in birthday card, how to make birthday special, online birthday card questions, anniversary wishes for couple FAQ",
};

const faqData = [
    {
        category: "General",
        questions: [
            {
                q: "How do I wish someone happy birthday in a unique way?",
                a: "Instead of sending a plain text message, create an interactive birthday experience. BirthdayWisher.fun lets you build a 20-step gamified story with photo reveals, voice notes, inside jokes, puzzles, and a confetti celebration — all for free. It takes just 3 minutes and delivers via a shareable link."
            },
            {
                q: "What should I write in a birthday card?",
                a: "The best birthday messages are personal and specific. Mention a shared memory, an inside joke, or something you genuinely admire about the person. Avoid generic phrases like 'HBD.' For inspiration, browse our collection of birthday wishes for best friends, siblings, partners, and parents on our blog."
            },
            {
                q: "Are digital birthday cards tacky?",
                a: "Not at all — digital birthday cards have evolved far beyond generic e-cards. Interactive experiences like those created on BirthdayWisher.fun include personalized puzzles, voice notes, photo reveals, and themed animations that are more thoughtful and memorable than any store-bought card. The effort you put into personalizing it is what matters."
            },
            {
                q: "How can I make someone's birthday special from far away?",
                a: "Long-distance birthday surprises work best when they feel personal and interactive. Create a gamified birthday wish on BirthdayWisher.fun — you can upload photos, record a voice note, add inside jokes as floating memory bubbles, and set up a 'How well do you know me?' quiz. The link works on any device, anywhere in the world."
            },
        ]
    },
    {
        category: "Using BirthdayWisher.fun",
        questions: [
            {
                q: "Is BirthdayWisher.fun really free?",
                a: "Yes, BirthdayWisher.fun is 100% free to use. There are no hidden charges, no premium tiers, and no watermarks. You can create as many birthday and anniversary wishes as you like."
            },
            {
                q: "How long does it take to create a birthday wish?",
                a: "About 3 minutes. Our 20-step wizard guides you through the personalization process — from choosing the recipient's name and relationship to uploading photos, recording voice notes, and selecting a visual theme."
            },
            {
                q: "What happens to my photos and voice notes after the wish expires?",
                a: "BirthdayWisher.fun follows a strict 'Read & Destroy' privacy philosophy. After the wish is opened, a 10-hour countdown begins. Once it expires, all uploaded media (photos, voice notes) are permanently deleted from our servers via an automated cleanup process. We keep nothing."
            },
            {
                q: "Can I create an anniversary wish, not just a birthday wish?",
                a: "Yes! BirthdayWisher.fun supports both birthday and wedding anniversary wishes. Our anniversary mode uses a tailored 16-step wizard optimized for couple celebrations — from 1st to 50th anniversary milestones."
            },
            {
                q: "How do I share the birthday wish I created?",
                a: "After completing the wizard, you receive a unique shareable link. Send it via WhatsApp, Instagram DM, iMessage, email, or any messaging app. The recipient taps the link and experiences the full interactive story on their phone or computer."
            },
        ]
    },
    {
        category: "For Partners & Couples",
        questions: [
            {
                q: "What is the best birthday surprise for a boyfriend or girlfriend?",
                a: "The best birthday surprise for a partner combines humor, emotion, and personal memories. BirthdayWisher.fun lets you build a 'Roast vs. Toast' experience — tease them with funny moments before revealing a heartfelt message. Add a 'Golden Ticket' with a future promise (like a date night or trip) to extend the surprise into the real world."
            },
            {
                q: "How do I write romantic anniversary wishes for my partner?",
                a: "Start by recalling a specific moment that defines your relationship — your first date, a funny mishap, or a quiet evening that meant everything. Build your message around that memory rather than using generic phrases. For an unforgettable delivery, wrap your words in an interactive anniversary story with photos and your voice."
            },
            {
                q: "Can I create wedding anniversary wishes for another couple (like my parents)?",
                a: "Absolutely. Many users create anniversary wishes for their parents, friends, or other couples. The wizard lets you customize the relationship type, add photos of the couple, and include messages from multiple people. It works perfectly for surprising parents on their 25th or 50th wedding anniversary."
            },
        ]
    },
    {
        category: "For Friends & Family",
        questions: [
            {
                q: "What do you write in a birthday card for a best friend?",
                a: "For a best friend, go personal: reference your inside jokes, embarrassing memories, or the specific qualities you love about them. Avoid generic quotes. Check our 'Top 50 Heart-Touching Birthday Wishes for a Best Friend' blog post for inspiration, or create an interactive wish that includes a quiz about your friendship."
            },
            {
                q: "How do I make my sister's or brother's birthday special?",
                a: "Sibling birthdays call for a mix of roasting and genuine emotion. Use BirthdayWisher.fun's 'Roast Meter' to find the perfect balance. Add childhood photos, quirky traits as floating bubbles, and end with a heartfelt voice note. The combination of humor and emotion creates a wish they will remember."
            },
            {
                q: "What is a good last-minute birthday gift idea?",
                a: "BirthdayWisher.fun is the perfect last-minute birthday gift — it takes only 3 minutes to create, delivers instantly via a link, and looks like you spent hours on it. Upload a photo, record a quick voice note, and choose a theme. It is significantly more personal than an e-gift card."
            },
        ]
    }
];

// Flatten all questions for JSON-LD
const allQuestions = faqData.flatMap(cat => cat.questions);

export default function FAQPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: allQuestions.map(item => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <div className="container max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6 border-primary/30">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium tracking-wide">Frequently Asked Questions</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Got <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary">Questions?</span>
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Everything you need to know about creating unforgettable birthday wishes, anniversary greetings, and interactive digital cards.
                    </p>
                </div>

                <div className="space-y-12">
                    {faqData.map((category, catIdx) => (
                        <div key={catIdx}>
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((item, qIdx) => (
                                    <details
                                        key={qIdx}
                                        className="group glass-panel rounded-2xl border border-white/10 overflow-hidden"
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-white/5 transition-colors">
                                            <h3 className="text-lg font-semibold text-white pr-4">{item.q}</h3>
                                            <ChevronDown className="w-5 h-5 text-foreground/50 shrink-0 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="px-6 pb-6 pt-2 text-foreground/70 leading-relaxed border-t border-white/5">
                                            <p>{item.a}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10">
                    <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-foreground/70 mb-8 text-lg max-w-xl mx-auto">
                        The best way to understand BirthdayWisher.fun is to try it. Create your first interactive birthday wish in 3 minutes — it&apos;s completely free.
                    </p>
                    <Link href="/create">
                        <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,105,180,0.4)] transition-all hover:-translate-y-1 text-lg">
                            Create a Birthday Wish <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
