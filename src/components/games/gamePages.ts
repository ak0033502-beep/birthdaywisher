import type { GameType } from "@/blocks/registry";

/** SEO + page content for all 12 standalone game pages (/games/[slug]). */
export interface GamePage {
    slug: string;
    game: GameType;
    mood: "heart" | "fun";
    e: string;
    blurb: string;
    title: string;        // <title> (kept concise for Google SERPs)
    h1: string;
    description: string;  // meta description
    intro: string;
    steps: [string, string, string];
    why: string[];
    faq: Array<{ q: string; a: string }>;
}

export const GAME_PAGES: GamePage[] = [
    /* ================= ❤️ Emotional, Sweet & Connected ================= */
    {
        slug: "hold-my-hand",
        game: "heartbeat",
        mood: "heart",
        e: "🫶",
        blurb: "They place their thumb on the screen to feel a real heartbeat sync with yours across any distance.",
        title: "Hold My Hand Birthday Surprise – Long-Distance Heartbeat Link",
        h1: "Hold My Hand: sync heartbeats across any distance",
        description: "Send a touching long-distance birthday or anniversary surprise: they hold their thumb on the screen, feel a warm heartbeat pulse, and unlock your secret note.",
        intro: "Miles apart at midnight? Send a touch they can actually feel. When your partner, best friend or parent opens your link and holds their thumb on the glowing heart, their phone pulses with a gentle heartbeat as two hearts travel along a red thread until they meet — revealing your personal message.",
        steps: ["Type their name and write a heartfelt whisper (or tap a ready-made Hinglish/English line).", "Create your private link in one tap.", "Send it on WhatsApp so they can hold your hand from anywhere."],
        why: ["Real heartbeat sound & gentle phone vibration as you hold", "Red-thread heart animation that meets at 100% connection", "Perfect for long-distance partners, best friends & parents", "Combine with voice notes, photos & fireworks in the full wizard"],
        faq: [
            { q: "Does Hold My Hand work on every phone?", a: "Yes. Every phone plays the warm heartbeat audio and red-thread animation, and Android phones also vibrate gently to the beat. A single-tap option is always included too." },
            { q: "Is the Hold My Hand link private?", a: "Completely private. Wish links are hidden from Google and self-destruct automatically after opening." },
            { q: "Can I use it for an anniversary?", a: "Yes! Tap 'Add photos, voice & more' to include it inside a full birthday or anniversary story." },
        ],
    },
    {
        slug: "sky-lanterns",
        game: "lanterns",
        mood: "heart",
        e: "🏮",
        blurb: "Light and release glowing sky lanterns, each carrying a heartfelt blessing, plus one private wish of their own.",
        title: "Sky Lanterns Birthday Wish – Send Glowing Blessings Online",
        h1: "Sky Lanterns of Wishes: release glowing blessings together",
        description: "Pack 3 to 5 glowing sky lanterns with warm birthday blessings. Your loved one lights & floats each lantern into the night sky, plus a private wish.",
        intro: "Some birthdays call for warmth, peace and heartfelt blessings rather than loud noise. Pack glowing sky lanterns with your wishes for their year ahead. Each tap lights a lantern, reveals your blessing on a warm scroll, and floats it into the twilight sky — ending with a golden lantern for their own secret wish.",
        steps: ["Add 1–5 heartfelt blessings (or pick from warm Hinglish & English suggestions).", "Add an optional closing birthday note.", "Share your link on WhatsApp — opens instantly with zero app install."],
        why: ["Calm, deeply emotional night-sky experience", "Every lantern reveals one of your personal blessings", "Final golden lantern lets them make a private wish (never stored anywhere)", "Loved by parents, partners and close friends alike"],
        faq: [
            { q: "Is the recipient's own lantern wish saved anywhere?", a: "Never. Their final golden lantern wish stays strictly on their own screen as a private moment and is never uploaded." },
            { q: "How many lanterns can I include?", a: "Up to 5 personal blessing lanterns, plus the recipient's own golden wish lantern at the end." },
            { q: "Is Sky Lanterns free?", a: "Yes — 100% free, no signup, and works smoothly on every phone browser." },
        ],
    },
    {
        slug: "balloon-pop",
        game: "balloons",
        mood: "heart",
        e: "🎈",
        blurb: "Floating pastel balloons with a personal love-note or compliment hidden inside every pop.",
        title: "Balloon Pop Birthday Game – Hide Sweet Notes Inside Balloons",
        h1: "Love-Note Balloons: pop each balloon to unfold a sweet note",
        description: "Hide personal compliments, memories or reasons you love them inside floating birthday balloons. Every pop reveals a paper note and confetti. Free WhatsApp link.",
        intro: "Turn 'why you're special to me' into a joyful tactile moment. Each floating balloon holds one short note from you — a compliment, an inside joke or a reason you're grateful for them. They pop the balloons one by one until the golden heart balloon reveals your final hug.",
        steps: ["Write 2–6 short notes or tap ready-made sweet lines.", "Add their name and generate your link.", "Send on WhatsApp and let them pop every balloon."],
        why: ["Every pop feels rewarding with crisp sound, confetti & a personal note", "Turns simple compliments into an unforgettable keepsake", "Golden heart balloon finale for the last note", "Easy 15-second setup with Hinglish & English ideas"],
        faq: [
            { q: "How many balloons can I put in the game?", a: "Between 2 and 6 balloons so every pop stays meaningful and fun on mobile screens." },
            { q: "Do I have to write every note from scratch?", a: "Not at all — default notes and one-tap ideas are ready to use or edit." },
            { q: "Can I add photos with Balloon Pop?", a: "Yes! Tap 'Add photos, voice & more' to combine Love-Note Balloons with photos, music and the Grand Finale." },
        ],
    },
    {
        slug: "memory-match",
        game: "memoryMatch",
        mood: "heart",
        e: "🃏",
        blurb: "3D flip-card matching game that uses your uploaded photos and sweet birthday icons.",
        title: "Birthday Memory Match Game – Custom Photo Flip Cards Online",
        h1: "Memory Match: flip & match your favourite moments together",
        description: "Create a custom birthday or anniversary Memory Match card game. Automatically uses your uploaded photos in the full wizard, or cute celebration icons in 30 seconds.",
        intro: "A classic cozy card game made personal. Your recipient flips smooth 3D cards to match 6 pairs — and when you build a full surprise with photos, your real uploaded photos appear right on the cards! Matching every pair unlocks your heartfelt message.",
        steps: ["Enter their name and customize the winning message.", "Create a quick icon card game here, or open the full wizard to use your own photos.", "Share the link on WhatsApp — plays right in the browser."],
        why: ["Automatically turns your wish photos into playable Polaroid pairs", "Smooth 3D card flips with gentle chimes", "Never punishing: includes an auto-reveal timer if someone is in a rush", "Great for couples, siblings, besties and kids"],
        faq: [
            { q: "How do I put my own photos on the Memory Match cards?", a: "Tap 'Add photos, voice & more' to upload 1–6 photos in the wizard — Memory Match automatically uses them on the cards!" },
            { q: "What if I don't upload photos?", a: "It uses 6 cheerful celebration icons (cake, gift, balloon, love letter, cupcake and heart) so it's always ready to play." },
            { q: "Are uploaded photos deleted later?", a: "Yes. Like every wish on BirthdayWisher.fun, photos self-destruct automatically after the wish expires." },
        ],
    },
    {
        slug: "guess-the-year",
        game: "guessYear",
        mood: "heart",
        e: "📅",
        blurb: "Nostalgic timeline slider where they guess the year your favourite memories happened.",
        title: "Guess the Year Birthday Game – Memory Timeline Quiz Online",
        h1: "Guess the Year: take a walk down your timeline together",
        description: "Share 1 to 4 special memories and let them slide the timeline dial to guess the exact year each moment happened. Warm, nostalgic & free on WhatsApp.",
        intro: "Remember the year you first met, took that chaotic trip, or stayed up talking till sunrise? Turn your shared history into a warm timeline game. They slide the year dial to lock in their guess — and even close guesses are celebrated warmly!",
        steps: ["Add 1–4 short memory clues and the year each happened.", "Write an optional birthday note.", "Send the link and see if they remember the exact years!"],
        why: ["Instant nostalgia for longtime friends, siblings & partners", "Warm hints & forgiving '1 year off!' celebration so nobody gets stuck", "Shows your complete timeline together at the end", "Pairs beautifully with photo slides and Storybook style"],
        faq: [
            { q: "What happens if they guess the wrong year?", a: "First they get a gentle 'earlier / later' hint, and on the next try (or if they're just 1 year off!) the real year unlocks warmly so the mood stays joyful." },
            { q: "How many memories can I add?", a: "From 1 quick memory up to 4 timeline milestones." },
            { q: "Is Guess the Year good for anniversaries too?", a: "It's one of the best anniversary games — from first meeting to trips and milestones!" },
        ],
    },

    /* ================= 🎉 Party, Playful & Fun ================= */
    {
        slug: "blow-the-candles",
        game: "candles",
        mood: "fun",
        e: "🕯️",
        blurb: "A 3-tier virtual cake in a link. They blow into their phone mic (with a live breath meter!) or tap each candle.",
        title: "Blow the Candles Birthday Game – Virtual Cake Online, Free",
        h1: "Blow the Candles: a virtual birthday cake they really blow out",
        description: "Send a virtual 3-tier birthday cake game: your friend blows into their phone's mic (or taps) to blow out the candles, then sees your wish. Free on WhatsApp.",
        intro: "Can't be there at midnight with a real cake? Send one in a link. Your friend opens it, blows into their phone, watches the live breath meter react, and sees the candles go out in puffs of smoke — followed by your birthday wish and confetti.",
        steps: ["Type their name and pick how many candles (or match their age).", "Write a wish to show once the candles go out.", "Send the link on WhatsApp or Instagram."],
        why: ["Live breath-strength bar reacts as they blow into the mic", "Tap any individual candle if they don't want to use the mic", "Zero audio is ever recorded or uploaded — measured locally on device", "Combine with the full Happy Birthday tune & Grand Finale in the wizard"],
        faq: [
            { q: "Does the recipient need to allow the microphone?", a: "Only if they want to blow with their breath. Tapping candles works instantly without any permission, and candles auto-blow after 60 seconds." },
            { q: "Is microphone audio recorded or uploaded?", a: "Never. Volume is checked locally in their browser solely to detect a blow." },
            { q: "Is Blow the Candles free?", a: "100% free with no app download and no signup." },
        ],
    },
    {
        slug: "birthday-quiz",
        game: "trivia",
        mood: "fun",
        e: "🎯",
        blurb: "Personal multiple-choice bond quiz ('How well do you know me?') with instant reactions — 100% private, no public leaderboard.",
        title: "Personal Birthday Quiz – How Well Do We Know Each Other?",
        h1: "Birthday Quiz: a personal bond quiz made just for the two of you",
        description: "Create a fun, private multiple-choice birthday quiz with inside jokes and favourite memories. Instant celebratory feedback and zero public leaderboard.",
        intro: "Test your inside jokes, midnight food orders and favourite memories in a private 1-on-1 quiz. There is no public leaderboard and no name prompt — your birthday star jumps straight into Question 1, gets instant chime & confetti reactions, and unlocks a personal bond badge at the end!",
        steps: ["Write 1–10 multiple-choice questions (or tap ready-made starter ideas).", "Mark the ✓ correct option for each question.", "Share your private link on WhatsApp."],
        why: ["100% personal & private — no public scoreboard or extra login", "Starts immediately on Question 1 with crisp sound & confetti", "One-tap starter questions so setup takes seconds", "Celebrates every score warmly at the end"],
        faq: [
            { q: "Is there a public leaderboard on the quiz?", a: "No! We keep every birthday wish personal and private between you and the recipient — no public scoreboard." },
            { q: "How many questions can I add?", a: "Anywhere from 1 quick inside-joke question up to 10 questions." },
            { q: "What if they pick the wrong option?", a: "It playfully highlights the right answer and moves forward — nothing blocks their birthday surprise." },
        ],
    },
    {
        slug: "birthday-prank-link",
        game: "prank",
        mood: "fun",
        e: "😂",
        blurb: "A harmless fake 'HTTP 410 expired' screen, funny prophecy, or 99% stuck loader — then 'Gotcha!' and your real wish.",
        title: "Birthday Prank Link – Fake Error Then Real Surprise (Free)",
        h1: "Birthday Prank Link: fake them out, then make them smile",
        description: "Create a harmless funny birthday prank link: a fake 'surprise expired' screen, crystal prophecy or 99% stuck gift loader, then 'Gotcha!' and your real wish.",
        intro: "Start their birthday with a laugh. They open your link and see a convincing 'HTTP 410: Surprise Expired (sender ate the cake)' card, a ridiculous future scanner, or a gift stuck at 99% — before it rips open with confetti into your real wish!",
        steps: ["Pick your prank: Fake Expired Error, Funny Prediction, or 99% Stuck Loader.", "Add a warm or roast birthday message for the reveal.", "Send the link and wait for their voice note reaction!"],
        why: ["100% harmless & wholesome — zero scary pop-ups", "Reveals automatically in ~6 seconds or as soon as they tap", "Made for best friends, siblings & cousins who love banter", "Works great as the opener of a full multi-slide surprise"],
        faq: [
            { q: "Is the Birthday Prank Link safe?", a: "Completely safe. Everything happens cleanly inside the wish card with zero downloads or external pop-ups." },
            { q: "Which prank gets the biggest laugh?", a: "Fake Expired Error gets the best gasp from best friends; Funny Prediction is a hit with family!" },
            { q: "Can I put a heartfelt letter after the prank?", a: "Yes — tap 'Add photos, voice & more' to start with a laugh and end with an emotional letter & fireworks." },
        ],
    },
    {
        slug: "spin-the-wheel",
        game: "wheel",
        mood: "fun",
        e: "🎡",
        blurb: "Colourful prize wheel loaded with real birthday treats from you — awards a screenshot-able Treat Voucher!",
        title: "Spin the Wheel Birthday Game – Custom Treat Voucher Online",
        h1: "Spin the Treat Wheel: let fate pick their birthday treat",
        description: "Load a colourful prize wheel with 3 to 6 treats (pizza, coffee drive, movie night, big hug) and send the link. They spin and win an official Birthday Treat Voucher!",
        intro: "Not sure whether to treat them to pizza, a late-night coffee drive or dessert? Put all of them on a colourful wheel and let them spin! When the pointer lands, they get an official Birthday Treat Voucher to screenshot and redeem from you.",
        steps: ["Customize 3–6 slices on the wheel (fun defaults are already filled in!).", "Add their name and an optional birthday note.", "Send the link and wait for their winning voucher screenshot!"],
        why: ["Smooth physics spin with real ticking sound effects", "Awards a cute 'Official Treat Voucher' they'll screenshot immediately", "Turns an online wish into a real-life hangout plan", "Can be spun again just for fun"],
        faq: [
            { q: "How many slices can I customize on the wheel?", a: "Between 3 and 6 slices — short labels like '🍕 Pizza treat' look sharpest on the wheel." },
            { q: "Can I use Spin the Wheel for dares or date nights?", a: "Absolutely! Couples love filling it with date ideas, and friend groups love silly birthday dares." },
            { q: "Is Spin the Wheel free?", a: "Yes, completely free and instant on WhatsApp." },
        ],
    },
    {
        slug: "catch-the-gifts",
        game: "catchGifts",
        mood: "fun",
        e: "🎁",
        blurb: "Mini arcade stage: slide the basket (or tap!) to catch falling cakes & gifts while dodging birthday broccoli.",
        title: "Catch the Gifts Birthday Game – Playable Mini-Game Link",
        h1: "Catch the Gifts: a joyful mini-game inside your birthday wish",
        description: "Send a fast, cheerful birthday mini-game where they slide a basket or tap falling gifts and cupcakes (while dodging broccoli!) to unlock your birthday message.",
        intro: "Bring arcade energy right into your wish! Gifts, cakes, cupcakes and love letters rain down while sneaky broccoli and alarm clocks try to photobomb the party. Once they catch enough gifts, confetti bursts and your message unlocks.",
        steps: ["Choose how many gifts they need to catch (5, 8, 10 or 12).", "Write the message that unlocks when they win.", "Share the link on WhatsApp — works with finger drag or simple taps."],
        why: ["Works both by dragging the basket AND by tapping gifts directly", "Zero game-over frustration — silly items just crack a joke", "Quick 15–25 second burst of fun on any phone", "Auto-completes after 60 seconds if needed"],
        faq: [
            { q: "Can someone lose Catch the Gifts?", a: "No! Catching broccoli just shows a funny quip without taking points away, keeping the birthday mood 100% happy." },
            { q: "Is it easy to play on a small phone screen?", a: "Yes — both sliding the basket at the bottom and tapping gifts directly work effortlessly." },
            { q: "Can I combine it with other blocks?", a: "Yes, add it in the middle of a full surprise alongside photos, quiz and Grand Finale." },
        ],
    },
    {
        slug: "birthday-treasure-hunt",
        game: "treasure",
        mood: "fun",
        e: "🗺️",
        blurb: "1 to 4 personal riddles or inside-joke clues that unlock a golden birthday treasure chest.",
        title: "Birthday Treasure Hunt Online – Custom Riddle Clues Link",
        h1: "Birthday Treasure Hunt: personal riddles that unlock your surprise",
        description: "Create an online birthday treasure hunt with 1 to 4 personal clues or riddles. Each right answer opens a lock until the treasure chest bursts open!",
        intro: "Turn shared memories and inside jokes into a mini mystery! Write 1 to 4 clues — like the café where you always meet, your pet nickname for them, or where their real gift is hidden in the house! Solving the clues pops open the treasure chest.",
        steps: ["Write 1–4 clues and their short answers.", "Type the treasure reward message waiting inside the chest (even a real-life hiding spot!).", "Send the link and let the hunt begin!"],
        why: ["Can even point to a real physical gift hidden at home!", "Smart lenient answer matching + a built-in hint/reveal button after a wrong try", "Makes opening a birthday message feel earned & exciting", "Works in all 6 visual styles including Storybook & Hacker Terminal"],
        faq: [
            { q: "What if they spell the answer slightly differently?", a: "Answers are matched case-insensitively, and if they miss once, a friendly hint + 'Reveal answer' button appears so they never get stuck." },
            { q: "Can I use this to hide a real gift in the room?", a: "Yes! Many people make the final chest message say 'Look under your pillow / inside the wardrobe!'." },
            { q: "How many clues can I add?", a: "From 1 quick riddle up to 4 connected clues." },
        ],
    },
    {
        slug: "birthday-newspaper",
        game: "newspaper",
        mood: "fun",
        e: "📰",
        blurb: "Vintage 'Daily Celebration' front-page breaking news edition starring them — with an interactive Certified Icon stamp!",
        title: "Birthday Newspaper Generator – Custom Breaking News Wish",
        h1: "The Birthday Gazette: put them on the front page today",
        description: "Make a vintage front-page breaking news edition celebrating their birthday, complete with custom headline, story, photo support and an interactive red ink stamp!",
        intro: "Extra! Extra! Put your favourite human on the front page of The Daily Celebration. Customize the breaking headline, subhead and article — and when used inside a full wish with photos, their first photo automatically prints in vintage sepia right on page one!",
        steps: ["Write a fun breaking headline (use {name} anywhere!) and short article.", "Add an optional personal message.", "Send the link so they can stamp themselves 'Certified Favourite Human'!"],
        why: ["Authentic vintage broadsheet typography & layout", "Automatically prints their uploaded photo in the full wizard", "Interactive red ink stamp with sound & confetti", "Awesome opener slide before emotional memories"],
        faq: [
            { q: "How do I include their photo on the newspaper?", a: "Tap 'Add photos, voice & more' and add at least one photo in the Photos step — the newspaper automatically features it on the front page!" },
            { q: "Can I customize the headline and article text?", a: "Yes — headline, subhead and the breaking news paragraph are all 100% editable." },
            { q: "Does it work for milestone ages like 18th, 21st, 30th or 50th?", a: "It's a huge hit for milestone birthdays, promotions, retirements and anniversaries!" },
        ],
    },
];

export const getGamePage = (slug: string) => GAME_PAGES.find((g) => g.slug === slug);

/** All planned games are now live! Kept as empty array so legacy imports stay clean. */
export const COMING_SOON: Array<{ e: string; t: string }> = [];
