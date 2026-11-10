import type { GameType } from "@/blocks/registry";

/** SEO + page content for the standalone game pages (/games/[slug]). */
export interface GamePage {
    slug: string;
    game: GameType;
    e: string;
    title: string;        // <title>
    h1: string;
    description: string;  // meta description
    intro: string;
    steps: [string, string, string];
    why: string[];
    faq: Array<{ q: string; a: string }>;
}

export const GAME_PAGES: GamePage[] = [
    {
        slug: "blow-the-candles",
        game: "candles",
        e: "🕯️",
        title: "Blow the Candles Birthday Game – Virtual Cake Online, Free",
        h1: "Blow the Candles: a virtual birthday cake they really blow out",
        description: "Send a virtual birthday cake game: your friend blows into their phone's mic (or taps) to blow out the candles, then sees your wish. Free, no app, works on WhatsApp.",
        intro: "Can't be there with a real cake? Send one in a link. Your friend opens it, blows into their phone and the candles go out one by one, just like a real cake. Then your birthday message appears with confetti. No mic? They can simply tap the candles.",
        steps: ["Type their name and pick how many candles (or match their age).", "Write a short wish to show after the candles go out.", "Get a link and send it on WhatsApp or Instagram."],
        why: ["Feels real: the phone actually listens for a blow", "Works for long-distance birthdays and video-call parties", "Tap fallback, so it works on every phone and needs no permissions", "Add photos, a voice note and more in the full wizard"],
        faq: [
            { q: "Does the recipient need to allow the microphone?", a: "Only if they want to blow for real. There is always a tap option, and the candles auto-blow after 60 seconds so nobody gets stuck." },
            { q: "Is the microphone audio recorded or uploaded?", a: "No. The sound level is measured on the phone itself to detect a blow. Nothing is recorded or sent anywhere." },
            { q: "Is the Blow the Candles game free?", a: "Yes, it's 100% free with no signup. The link opens in any phone browser." },
        ],
    },
    {
        slug: "birthday-prank-link",
        game: "prank",
        e: "😂",
        title: "Birthday Prank Link – Fake Error Then Real Surprise (Free)",
        h1: "Birthday Prank Link: fake them out, then surprise them",
        description: "Create a funny birthday prank link: a fake 'wish expired' error, a silly birthday prediction or an endless loading screen, then the real surprise. Free, harmless, works on WhatsApp.",
        intro: "Start the birthday with a laugh. Your friend opens the link and sees a fake \"This wish has expired\" error, a ridiculous birthday prediction or a gift that never finishes loading. Seconds later: \"Gotcha!\" and your real birthday wish appears.",
        steps: ["Type their name and choose a prank: fake error, funny prediction or endless loading.", "Add a short birthday message for the reveal.", "Share the link and wait for their reaction."],
        why: ["Harmless and funny: no scary pop-ups, no fake viruses", "The reveal happens automatically after a few seconds", "Perfect for best friends and siblings who love a good roast", "Combine it with photos, a quiz and more in the full wizard"],
        faq: [
            { q: "Is the prank safe?", a: "Yes. It's just a funny screen inside the wish: no downloads, no pop-ups and no fake warnings outside the page. The real wish appears within seconds." },
            { q: "Which prank is the funniest?", a: "The fake 'wish expired' error gets the biggest reaction from best friends; the birthday prediction is great for family groups." },
            { q: "Can I add the prank to a bigger birthday surprise?", a: "Yes. Tap 'Add photos, voice & more' to open the full wizard with your prank already added at the start." },
        ],
    },
    {
        slug: "birthday-quiz",
        game: "trivia",
        e: "🏅",
        title: "Birthday Quiz with Leaderboard – How Well Do You Know Them?",
        h1: "Birthday Quiz + Leaderboard: who knows the birthday star best?",
        description: "Make a multiple-choice birthday quiz about your friend and share one link with the group. Everyone plays and a live leaderboard shows who knows them best. Free, no app.",
        intro: "Turn the birthday group chat into a game. Write a few multiple-choice questions about the birthday person and share one link. The birthday star (and all their friends) can play. Every score goes onto a live leaderboard, so the whole group can see who really knows them best.",
        steps: ["Write 1–10 multiple-choice questions and tap the correct answers.", "Keep the leaderboard on to let the whole group compete.", "Share one link in the group chat and watch the scores roll in."],
        why: ["One link for the whole friend group", "Live leaderboard (first names only)", "Funny score titles: 'Certified Bestie' or 'Do you even know them?'", "Add it to a full birthday surprise with photos and a voice note"],
        faq: [
            { q: "How many people can play the birthday quiz?", a: "Anyone with the link can play. The leaderboard shows the top 10 scores." },
            { q: "What is shown on the leaderboard?", a: "Only the name each player types and their score. No phone numbers, emails or accounts." },
            { q: "How long does the quiz stay online?", a: "Like every wish, it is deleted automatically after it has been opened (or after 7 days if nobody opens it), together with its scores." },
        ],
    },
];

export const getGamePage = (slug: string) => GAME_PAGES.find((g) => g.slug === slug);

/** Games planned for Phase 6 (shown as 'coming soon'). Server-safe so the hub page can import it. */
export const COMING_SOON: Array<{ e: string; t: string }> = [
    { e: "🎈", t: "Balloon Pop" }, { e: "🎡", t: "Spin the Wheel" }, { e: "🃏", t: "Memory Match" },
    { e: "🎁", t: "Catch the Gifts" }, { e: "🗺️", t: "Treasure Hunt" }, { e: "📰", t: "Fake Newspaper" }, { e: "📅", t: "Guess the Year" },
];
