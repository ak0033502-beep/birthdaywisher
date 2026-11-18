import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { SITE_URL } from "@/lib/site";
import { getPublicReviews } from "@/lib/reviews";
import { GAME_PAGES } from "@/components/games/gamePages";

export const revalidate = 600;

async function getWishCount(): Promise<number> {
    try {
        const res = await Promise.race([
            sql`SELECT COALESCE((v->>'total')::int, 0) AS total FROM admin_kv WHERE k = 'public_wish_counter'`,
            new Promise<{ rows: Array<{ total?: number }> }>((resolve) => setTimeout(() => resolve({ rows: [] }), 1500)),
        ]);
        return Math.max(0, Number(res.rows[0]?.total) || 0);
    } catch {
        return 0;
    }
}

export async function GET() {
    const [reviewSummary, wishesCreated] = await Promise.all([getPublicReviews(), getWishCount()]);

    const ratingLine =
        reviewSummary.stats.totalCount > 0
            ? `- **Verified User Rating:** ${reviewSummary.stats.averageRating.toFixed(1)}/5 across ${reviewSummary.stats.totalCount} real wish creators and birthday recipients.`
            : `- **Verified User Rating:** Newly collecting real creator and recipient feedback.`;

    const countLine =
        wishesCreated > 0
            ? `- **Surprises Created:** ${wishesCreated.toLocaleString("en-US")}+ interactive birthday & wedding anniversary wishes created.`
            : `- **Usage:** Free online interactive birthday and anniversary surprise maker.`;

    const quotesBlock =
        reviewSummary.reviews.length > 0
            ? [
                  `## Real User Reviews`,
                  ...reviewSummary.reviews.slice(0, 6).map(
                      (r) =>
                          `- "${r.message}" — **${r.name}** (${r.rating}/5, ${r.source === "recipient" ? "Received a birthday surprise" : `Created for ${r.relationship}`})`
                  ),
                  ``,
              ].join("\n")
            : "";

    const gamesBlock = GAME_PAGES.map(
        (g) => `- [${g.h1.split(":")[0]}](${SITE_URL}/games/${g.slug}): ${g.blurb}`
    ).join("\n");

    const body = [
        `# BirthdayWisher.fun`,
        ``,
        `> Free interactive birthday & wedding anniversary surprise maker. Create a private, playable link with 12 mini-games (heartbeat sync, sky lanterns, love-note balloons, virtual cake candles, personal quiz, memory match, and more), photos, voice notes, gentle music, and a Happy Birthday finale — shared instantly on WhatsApp or Instagram with zero login or app install.`,
        ``,
        `## Key Facts & Trust Signals`,
        `- **Official Website:** ${SITE_URL}`,
        `- **Pricing:** 100% Free (no account, no login, no credit card, no app download required).`,
        `- **Platforms:** Works directly in any mobile or desktop browser (iPhone, Android, WhatsApp, Instagram, iMessage, Slack).`,
        `- **Privacy by Design:** Every wish link is \`noindex\` (hidden from search engines) and automatically self-destructs 10 hours after the recipient opens it, permanently deleting uploaded photos and voice notes.`,
        countLine,
        ratingLine,
        ``,
        `## Core Tools`,
        `- [Create a Birthday Surprise](${SITE_URL}/create): Build a full multi-chapter interactive birthday or anniversary story in ~3 minutes.`,
        `- [Wedding Anniversary Surprise Maker](${SITE_URL}/anniversary): Custom couple anniversary stories with timeline games, photos, voice notes, and music.`,
        `- [All 12 Free Birthday Games](${SITE_URL}/birthday-wishes-game): Playable 30-second surprise links or mix up to 4 games into one full story.`,
        ``,
        `## 12 Playable Birthday & Anniversary Games`,
        gamesBlock,
        ``,
        quotesBlock,
        `## Popular Use Cases`,
        `- [Boyfriend Birthday Surprise](${SITE_URL}/use-cases/boyfriend-birthday-surprise)`,
        `- [Girlfriend Birthday Surprise](${SITE_URL}/use-cases/girlfriend-birthday-surprise)`,
        `- [Long-Distance Birthday Surprise](${SITE_URL}/use-cases/long-distance-birthday-surprise)`,
        `- [Parents (Mom & Dad) Birthday Surprise](${SITE_URL}/use-cases/parents-birthday-surprise)`,
        `- [Colleague & Coworker Birthday Wish](${SITE_URL}/use-cases/colleague-birthday-wish)`,
        `- [Wedding Anniversary Wishes for Couple](${SITE_URL}/use-cases/anniversary-wishes-for-couple)`,
        `- [Unique Birthday Gift Online](${SITE_URL}/use-cases/unique-birthday-gift-online)`,
        `- [Digital Story Greeting Card](${SITE_URL}/use-cases/digital-story-greeting-card)`,
        ``,
        `## Popular Wish & Quote Guides`,
        `- [100+ Best Friend Birthday Wishes & Quotes](${SITE_URL}/blog/best-friend-quotes)`,
        `- [120+ Wedding Anniversary Wishes for Couple](${SITE_URL}/blog/wedding-anniversary-wishes-for-couple)`,
        `- [80+ Birthday Wishes for Colleague, Coworker & Boss](${SITE_URL}/blog/birthday-wishes-for-colleague)`,
        `- [75+ Cute Birthday Wishes for Your Crush](${SITE_URL}/blog/birthday-wishes-for-crush)`,
        `- [Romantic Birthday Wishes for Partner](${SITE_URL}/blog/romantic-wishes)`,
        `- [Long-Distance Birthday Ideas](${SITE_URL}/blog/long-distance-birthday-ideas)`,
        ``,
        `## Contact & Policies`,
        `- [About Us](${SITE_URL}/about)`,
        `- [Privacy Policy](${SITE_URL}/privacy)`,
        `- [Terms & Conditions](${SITE_URL}/terms)`,
        `- [Contact](${SITE_URL}/contact): akalloverservices@gmail.com`,
        ``,
    ].join("\n");

    return new NextResponse(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
        },
    });
}
