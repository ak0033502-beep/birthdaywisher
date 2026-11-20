import { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartyPage, Prose, CtaCard } from "@/components/party/PartyPage";
import { Bunting } from "@/components/party/Decor";

interface UseCaseEntry {
    title: string;
    subtitle: string;
    description: string;
    benefits: string[];
    ctaText: string;
    heroEmoji: string;
    seoSections: { heading: string; body: string }[];
    recommendedGames: { href: string; e: string; name: string; desc: string }[];
    faq: { q: string; a: string }[];
}

const USE_CASES: Record<string, UseCaseEntry> = {
    "interactive-birthday-wish": {
        title: "Free Interactive Birthday & Anniversary Wish Maker",
        subtitle: "Turn any birthday or anniversary message into a playable story link — 100% free, zero login.",
        description:
            "Looking for a free interactive wish website? Build a private, tap-through birthday or wedding anniversary surprise packed with 12 playable mini-games, favourite photos, a recorded voice note, gentle music, and a Happy Birthday candle finale — shared as one link on WhatsApp, Instagram, or iMessage.",
        benefits: [
            "100% Free forever — no login, no account, no watermark, no paywall.",
            "12 playable games: Heartbeat Sync, Sky Lanterns, Blow the Candles, Balloons & Quiz.",
            "Add real photos, inside jokes, a voice note & 6 presentation styles.",
            "Private self-destructing link (noindex, auto-deletes 10 hours after opening).",
        ],
        ctaText: "Create Free Interactive Wish",
        heroEmoji: "🎮",
        recommendedGames: [
            { href: "/games/hold-my-hand", e: "🫶", name: "Hold My Hand (Heartbeat)", desc: "Sync heartbeats on screen across any distance" },
            { href: "/games/blow-the-candles", e: "🕯️", name: "Blow the Candles", desc: "3-tier cake they blow out using their phone mic" },
            { href: "/games/balloon-pop", e: "🎈", name: "Love-Note Balloons", desc: "Hide sweet compliments inside floating balloons" },
        ],
        seoSections: [
            {
                heading: "What Makes an Interactive Wish Better Than an E-Card?",
                body: "Static greeting cards and plain 'HBD' texts are forgotten in seconds. An interactive wish turns your message into a multi-chapter experience the recipient actively plays and feels — from holding their thumb on the screen to sync heartbeats with yours, to popping pastel balloons filled with compliments, solving inside-joke trivia, and blowing out virtual birthday candles while the Happy Birthday melody plays.",
            },
            {
                heading: "100% Free Interactive Wish Website — Zero Signup or App Install",
                body: "Many online surprise card platforms lock your finished card behind a paywall at the final step. BirthdayWisher.fun is completely free from start to finish. Neither you nor the birthday star ever needs to create an account, enter an email, or install an app — your link opens smoothly inside WhatsApp, Instagram, iMessage, Telegram, or any phone browser in under a second.",
            },
            {
                heading: "Private by Design: 10-Hour Auto-Delete Protection",
                body: "Personal photos and voice recordings shouldn't sit on public servers forever. Every interactive wish link generated on BirthdayWisher.fun is hidden from search engines (noindex), free of third-party ads on the recipient's screen, and automatically self-destructs 10 hours after your loved one opens it — permanently deleting uploaded photos and audio.",
            },
        ],
        faq: [
            {
                q: "Is BirthdayWisher.fun really 100% free to make an interactive wish?",
                a: "Yes — creating, customizing, uploading photos or a voice note, adding up to 4 mini-games, and sharing your interactive wish link is 100% free with zero hidden checkout.",
            },
            {
                q: "Does the recipient need to download an app or log in to open the interactive wish?",
                a: "No! Your interactive wish opens directly in any iPhone, Android, or desktop browser right from WhatsApp, Instagram DMs, or SMS.",
            },
            {
                q: "Which interactive games can I include inside my wish?",
                a: "You can mix up to 4 games from all 12 playable experiences: Hold My Hand (Heartbeat Sync), Sky Lanterns of Wishes, Love-Note Balloons, Photo Memory Match, Guess the Year, Blow the Candles, Personal Quiz, Prank Link, Spin the Treat Wheel, Catch the Gifts, Treasure Hunt, and The Birthday Gazette.",
            },
            {
                q: "Can I schedule my interactive wish to unlock at midnight?",
                a: "Yes! Set an optional Time-Capsule unlock date & time — before midnight, the link shows a live countdown screen without revealing any message or photo early.",
            },
        ],
    },
    "unique-birthday-gift-online": {
        title: "The Most Unique Birthday Gift Online",
        subtitle: "Why buy a generic physical gift when you can build an unforgettable digital experience?",
        description:
            "In a world of next-day deliveries, the most unique birthday gifts are the ones that spark genuine emotion. BirthdayWisher.fun lets you craft a personalised, interactive story with photos, playable games, and your real voice — wrapped inside one secret link.",
        benefits: [
            "100% Free & instant delivery via WhatsApp or Instagram link.",
            "12 interactive games (Memory Match, Quiz, Candles, Treasure Hunt).",
            "Photo gallery & recorded voice note with gentle background music.",
            "Self-destructs 10 hours after opening for complete privacy.",
        ],
        ctaText: "Create the Ultimate Gift",
        heroEmoji: "🎁",
        recommendedGames: [
            { href: "/games/blow-the-candles", e: "🕯️", name: "Blow the Candles", desc: "Virtual 3-tier birthday cake with mic breath meter" },
            { href: "/games/birthday-treasure-hunt", e: "🗺️", name: "Birthday Treasure Hunt", desc: "Personal riddles that can even reveal a real hidden gift" },
            { href: "/games/spin-the-wheel", e: "🎡", name: "Spin the Treat Wheel", desc: "Awards an official Birthday Treat Voucher from you" },
        ],
        seoSections: [
            {
                heading: "Why Personalised Digital Gifts Hit Deeper",
                body: "Store-bought items are quickly set aside, while emotional experiences become core memories. A unique birthday gift online isn't measured by price tag — it's measured by how well it reflects your shared history, inside jokes, and affection. Taking three minutes to build a custom interactive story shows real thoughtfulness.",
            },
            {
                heading: "Combine Digital Magic With Real-World Treats",
                body: "Pair your interactive story with Spin the Treat Wheel or a Golden Promise Ticket — letting the birthday star win a coffee drive, dinner date, or movie night on you, or use Birthday Treasure Hunt riddles to lead them to a physical gift hidden in their room!",
            },
            {
                heading: "Instant, Free, and Private Anywhere on Earth",
                body: "No shipping delays, customs fees, or subscriptions. Your wish link is ready the moment you tap Create, works on any smartphone, and automatically deletes uploaded media 10 hours after opening.",
            },
        ],
        faq: [
            {
                q: "What is the best last-minute unique birthday gift online?",
                a: "A personalised interactive birthday story link — you can add favourite photos, 3 inside-joke quiz questions, a Spin-the-Treat voucher, and a voice note in ~3 minutes and send it at midnight.",
            },
            {
                q: "Can I pair this online surprise with a real gift or gift card?",
                a: "Yes! Add our Gift Card reveal block or Treasure Hunt game to point them to a real present or digital voucher at the end of the story.",
            },
            {
                q: "How much does creating a birthday surprise cost?",
                a: "₹0 / $0 — BirthdayWisher.fun is completely free with no login required.",
            },
        ],
    },
    "digital-story-greeting-card": {
        title: "Digital Story Greeting Card Maker",
        subtitle: "Upgrade from plain WhatsApp texts to a cinematic, tap-through story card.",
        description:
            "Send a digital story greeting card that feels like a personal mini-film. Choose from 6 visual worlds (Storybook, Cinematic, Chat, Galaxy, Gallery, or Retro Terminal), add photos, music, interactive games, and fireworks.",
        benefits: [
            "6 handcrafted presentation styles with custom ambient soundtracks.",
            "Upload favourite photos and record a heartfelt voice message.",
            "Interactive chapters that respond to every tap and swipe.",
            "Designed mobile-first for effortless viewing on any phone.",
        ],
        ctaText: "Start Your Story Card",
        heroEmoji: "📱",
        recommendedGames: [
            { href: "/games/memory-match", e: "🃏", name: "Photo Memory Match", desc: "Turns your uploaded wish photos into 3D flip cards" },
            { href: "/games/balloon-pop", e: "🎈", name: "Love-Note Balloons", desc: "Each popped balloon unfolds a personal note" },
            { href: "/games/birthday-newspaper", e: "📰", name: "The Birthday Gazette", desc: "Front-page vintage breaking news starring them" },
        ],
        seoSections: [
            {
                heading: "Six Visual Worlds Instead of Static Templates",
                body: "Traditional e-cards look dated and generic. Our Digital Story Greeting Card maker lets you match the recipient's personality: warm gilded Storybook pages, dark velvet Cinema, realistic Messenger chat bubbles, Cosmic Galaxy, Minimal Photo Gallery, or a glowing Retro Terminal.",
            },
            {
                heading: "Gentle Soundtracks That Respect Your Words",
                body: "Every presentation style includes a soft, drum-free instrumental soundtrack that automatically lowers in volume on reading slides and pauses cleanly when your recorded voice note or the Happy Birthday candle finale plays.",
            },
            {
                heading: "Built for Mobile Touch & Zero Friction",
                body: "Over 85% of digital greeting cards are opened on phones. Every slide supports natural edge-taps, swipe navigation, and instant photo preloading so your story flows seamlessly.",
            },
        ],
        faq: [
            {
                q: "How is a digital story greeting card different from a regular e-card?",
                a: "Instead of a single static image, the recipient taps through interactive chapters — unlocking memories, playing mini-games, listening to your voice note, and blowing out virtual birthday candles.",
            },
            {
                q: "Can I preview my digital greeting card before sharing the link?",
                a: "Yes! A live phone preview updates as you build, and you can tap 'Play full wish' anytime before creating your link.",
            },
            {
                q: "Does it support multiple languages?",
                a: "Yes — wish labels support English, Hindi, Spanish, French, German, Portuguese, Arabic, Japanese, Korean, and more.",
            },
        ],
    },
    "boyfriend-birthday-surprise": {
        title: "The Ultimate Boyfriend Birthday Surprise",
        subtitle: "Make him laugh with playful banter, then melt his heart at the finale.",
        description:
            "Looking for a creative birthday surprise website for your boyfriend? Combine a playful 'Roast vs. Toast' opener, a private couple quiz, Hold My Hand heartbeat sync, your favourite photos together, and a Spin-the-Treat date voucher.",
        benefits: [
            "Start with playful teasing before revealing your romantic letter.",
            "Include Hold My Hand (Heartbeat Sync) & a private couple quiz.",
            "Award him a Spin-the-Wheel date night or Golden Promise Ticket.",
            "Lock the link until 12:00 AM for a true midnight surprise.",
        ],
        ctaText: "Surprise Your Boyfriend",
        heroEmoji: "💙",
        recommendedGames: [
            { href: "/games/hold-my-hand", e: "🫶", name: "Hold My Hand", desc: "He holds his thumb on screen to feel your heartbeat sync" },
            { href: "/games/birthday-quiz", e: "🎯", name: "Couple Bond Quiz", desc: "Private quiz on your inside jokes & first-date memories" },
            { href: "/games/spin-the-wheel", e: "🎡", name: "Date-Night Treat Wheel", desc: "Let him spin for dinner, midnight drive or movie night" },
        ],
        seoSections: [
            {
                heading: "How to Surprise Your Boyfriend Online (Even When He Says 'I Don't Want Anything')",
                body: "Every guy who claims he doesn't want a fuss secretly melts when someone puts real effort into celebrating him. A custom interactive story centered around your inside jokes, favourite photos, and future date plans hits harder than any generic store gift.",
            },
            {
                heading: "The 'Roast Then Toast' Formula That Always Works",
                body: "Open with a harmless Prank Link or a playful Roast Meter teasing his sleepy habits or gaming marathons. Once he's grinning, transition into your favourite couple photos, a Heartbeat Sync touch moment, and your real recorded voice wishing him Happy Birthday.",
            },
            {
                heading: "Turn Your Link Into a Real Date Night",
                body: "Add Spin the Treat Wheel or a Golden Promise Ticket at the end of his wish so he walks away with a screenshot-ready voucher for his favourite meal, late-night ice cream drive, or weekend plan together.",
            },
        ],
        faq: [
            {
                q: "What is the best online birthday surprise for my boyfriend at midnight?",
                a: "Build a custom story on BirthdayWisher.fun, set the Time-Capsule unlock to 12:00 AM, and send him the link at 11:58 PM — he watches the live countdown hit zero and unlocks your photos, games, and voice note.",
            },
            {
                q: "Which style looks best for a boyfriend birthday surprise?",
                a: "Cinema (dark gold spotlight), Chat Story (realistic late-night text bubbles), and Galaxy are the top three styles girlfriends pick for boyfriends — or Retro Terminal if he codes or games!",
            },
            {
                q: "Is his birthday link completely private?",
                a: "100% private — hidden from Google, no public leaderboard, no ads on his wish, and automatically deleted 10 hours after he opens it.",
            },
        ],
    },
    "anniversary-wishes-for-couple": {
        title: "Wedding Anniversary Wishes for Couple — Interactive Story",
        subtitle: "Celebrate 1st, 5th, 10th, 25th or 50th anniversaries with a living digital keepsake.",
        description:
            "Create a deeply personal, interactive wedding anniversary surprise for your spouse, parents, or favourite couple. Combine wedding & travel photos, Guess the Year timeline milestones, Sky Lantern blessings, and a heartfelt voice note.",
        benefits: [
            "Tailored for 1st, 10th, 25th (Silver) & 50th (Golden) milestones.",
            "Guess the Year timeline game + Photo Memory Match for couples.",
            "Elegant Rose Gold, Champagne & Storybook presentation themes.",
            "Share privately on WhatsApp with family or just the two of you.",
        ],
        ctaText: "Create Anniversary Wish",
        heroEmoji: "💍",
        recommendedGames: [
            { href: "/games/guess-the-year", e: "📅", name: "Guess the Year Timeline", desc: "Relive the exact years of your wedding, trips & milestones" },
            { href: "/games/sky-lanterns", e: "🏮", name: "Sky Lanterns of Blessings", desc: "Float warm anniversary wishes into a starry night sky" },
            { href: "/games/hold-my-hand", e: "🫶", name: "Hold My Hand", desc: "Two hearts meet along a red thread as they hold the screen" },
        ],
        seoSections: [
            {
                heading: "More Meaningful Than a Forwarded 'Happy Anniversary' Message",
                body: "Whether you are surprising your husband or wife, or celebrating your parents' 25th Silver Jubilee, a custom interactive anniversary story turns years of shared memories into a warm 3-minute journey they can experience together on any phone.",
            },
            {
                heading: "Relive Every Chapter With Timeline & Photo Games",
                body: "Use Guess the Year to walk through the year they met, got married, or took an unforgettable family trip, pair it with Photo Memory Match featuring real couple portraits, and close with glowing Sky Lanterns carrying blessings for the years ahead.",
            },
            {
                heading: "Romantic Skins & Gentle Piano-Strings Music",
                body: "Choose Rose Gold Elegance, Golden Anniversary, Vintage Love Letter, or Fairy-Tale Storybook — paired with soft instrumental music that lets every word of your anniversary letter shine.",
            },
        ],
        faq: [
            {
                q: "Can I make this anniversary surprise for my parents or another couple (like Bhaiya & Bhabhi)?",
                a: "Yes! In Anniversary mode you can enter the couple's names (e.g. 'Mom & Dad' or 'Aarav & Meera'), add their milestone year, upload family photos, and pack Sky Lantern blessings from everyone.",
            },
            {
                q: "Is the Wedding Anniversary Maker free?",
                a: "Completely free — no signup, no watermark, and instant sharing on WhatsApp.",
            },
            {
                q: "Where can I also find copy-paste anniversary wishes?",
                a: "Visit our full 120+ Wedding Anniversary Wishes for Couple guide (/blog/wedding-anniversary-wishes-for-couple) for romantic, funny, milestone, and Hindi/Hinglish wishes.",
            },
        ],
    },
    "girlfriend-birthday-surprise": {
        title: "The Most Romantic Girlfriend Birthday Surprise",
        subtitle: "Give her the dreamy, heart-melting birthday website surprise she deserves.",
        description:
            "Looking for a birthday wishing website for your girlfriend? Craft an aesthetic, deeply romantic story with Love-Note Balloons, Storybook or Pastel Dream visuals, her cutest quirks, favourite couple photos, and your real voice.",
        benefits: [
            "Dreamy Storybook, Pastel Petals & Rose-Gold presentation themes.",
            "Hide 6 reasons you adore her inside floating Love-Note Balloons.",
            "Upload couple Polaroids + record an unedited voice note.",
            "Ends with a full Happy Birthday piano melody & candle blow.",
        ],
        ctaText: "Create Her Perfect Surprise",
        heroEmoji: "💗",
        recommendedGames: [
            { href: "/games/balloon-pop", e: "🎈", name: "Love-Note Balloons", desc: "Every pastel balloon pops open to reveal a sweet note" },
            { href: "/games/hold-my-hand", e: "🫶", name: "Hold My Hand", desc: "Romantic red-thread heartbeat connection on her phone" },
            { href: "/games/sky-lanterns", e: "🏮", name: "Sky Lanterns of Wishes", desc: "Warm glowing wishes plus one private wish of her own" },
        ],
        seoSections: [
            {
                heading: "Proof That You Remember Every Little Detail",
                body: "The most romantic girlfriend birthday surprise isn't just grand words — it's noticing the little things: her iced-coffee order, the song she replays in the car, and the nickname only you call her. Putting those details into an interactive story creates a keepsake she'll replay with happy tears.",
            },
            {
                heading: "Designed for Dreamy, Screenshot-Worthy Aesthetics",
                body: "Pick Storybook (illustrated parchment with gold leaf) or Pastel Dream (soft floating petals), add Polaroid-framed couple photos, and let her pop Love-Note Balloons one by one before reading your heartfelt letter.",
            },
            {
                heading: "Your Voice + Happy Birthday Candle Finale",
                body: "Add a short recorded voice message so she hears your real voice, followed by the 3-tier birthday cake where she blows out the candles to the full Happy Birthday waltz arrangement.",
            },
        ],
        faq: [
            {
                q: "How long does it take to build a girlfriend birthday surprise website link?",
                a: "About 3 minutes in Quick or Romantic Partner template mode — or 5 minutes if you customize multiple games, photos, and a voice note.",
            },
            {
                q: "Can she blow out the birthday candles on her phone?",
                a: "Yes! Both the Blow the Candles game and the Grand Finale cake let her blow into her phone mic (or tap each candle) while Happy Birthday plays.",
            },
            {
                q: "Will ads appear on my girlfriend's birthday wish link?",
                a: "Never. Every recipient wish link (/wish/... and /w/...) is 100% ad-free and private.",
            },
        ],
    },
    "long-distance-birthday-surprise": {
        title: "Long-Distance Birthday Surprise Link Online",
        subtitle: "Miles apart at midnight, yet right there in the palm of their hand.",
        description:
            "Can't be there in person with a cake at 12:00 AM? Send a long-distance birthday surprise link where they hold their thumb on screen to sync heartbeats with yours, blow out virtual candles, release sky lanterns, and hear your real voice.",
        benefits: [
            "Hold My Hand syncs a warm heartbeat pulse across any distance.",
            "Virtual 3-tier birthday cake they blow out on their phone.",
            "Time-zone friendly midnight countdown lock (zero early spoilers).",
            "Instant delivery to the US, UK, India, Canada, Australia & anywhere.",
        ],
        ctaText: "Bridge the Distance Now",
        heroEmoji: "✈️",
        recommendedGames: [
            { href: "/games/hold-my-hand", e: "🫶", name: "Hold My Hand (Heartbeat)", desc: "Built specifically for long-distance partners & besties" },
            { href: "/games/blow-the-candles", e: "🕯️", name: "Blow the Candles", desc: "Send a midnight birthday cake across time zones" },
            { href: "/games/sky-lanterns", e: "🏮", name: "Sky Lanterns", desc: "Light glowing blessings together under one night sky" },
        ],
        seoSections: [
            {
                heading: "Feel Physically Connected Even Across Continents",
                body: "Shipping boxes across borders risks late deliveries and customs fees, while a plain text feels miles away. With Hold My Hand (Heartbeat Sync), your partner, best friend, or family member places their thumb on the glowing heart and feels a gentle heartbeat pulse as two hearts travel along a red thread until they meet.",
            },
            {
                heading: "Midnight Cake + Real Voice Note Across Time Zones",
                body: "Schedule your wish link to unlock at 12:00 AM in their local time zone. Right at midnight, the countdown opens into your photo memories, your recorded voice saying Happy Birthday, and a virtual cake they blow out into their phone microphone.",
            },
            {
                heading: "Works for Long-Distance Couples, Best Friends & Family Abroad",
                body: "Whether your partner is studying in the US/UK, your bestie moved to another city for work, or your parents are back home, one WhatsApp link bridges thousands of miles in seconds.",
            },
        ],
        faq: [
            {
                q: "How does Hold My Hand work for a long-distance birthday?",
                a: "When your loved one presses and holds the glowing heart on their phone screen, warm heartbeat audio (and gentle haptic vibration on supported phones) pulses as two hearts move together to 100% sync — unlocking your secret note.",
            },
            {
                q: "Can I schedule the surprise for midnight in another country's time zone?",
                a: "Yes — pick the exact unlock date & time in the Link step; before that moment, the server shows only a live countdown without leaking any wish content.",
            },
            {
                q: "Does it work internationally on WhatsApp, iMessage, and Instagram?",
                a: "Yes, everywhere in the world with zero app download or login.",
            },
        ],
    },
    "colleague-birthday-wish": {
        title: "Birthday Wish for Colleague & Coworker Online",
        subtitle: "Upgrade the office Slack thread with a fun, workplace-safe interactive card.",
        description:
            "Celebrate a teammate, work bestie, or manager with a cheerful interactive birthday card! Put them on the front page of The Birthday Gazette, add light team trivia or a coffee Spin-the-Wheel treat, and share one link in Slack, Teams, or WhatsApp.",
        benefits: [
            "100% workplace-appropriate, warm, and genuinely fun.",
            "Put them on page one of The Birthday Gazette breaking news.",
            "One link drops cleanly into Slack, Microsoft Teams, or WhatsApp.",
            "Great for remote, hybrid, and in-office teams alike.",
        ],
        ctaText: "Create Colleague's Wish",
        heroEmoji: "💼",
        recommendedGames: [
            { href: "/games/birthday-newspaper", e: "📰", name: "The Birthday Gazette", desc: "Front-page vintage breaking news celebrating your coworker" },
            { href: "/games/spin-the-wheel", e: "🎡", name: "Coffee / Lunch Wheel", desc: "Let them spin for coffee, dessert, or a zero-meeting pass" },
            { href: "/games/birthday-quiz", e: "🎯", name: "Fun Team Trivia", desc: "Lighthearted questions on their go-to coffee or catchphrase" },
        ],
        seoSections: [
            {
                heading: "Stand Out From 30 Identical 'HBD!' Slack Replies",
                body: "Office chat threads fill up fast with copy-pasted 'Happy Birthday!' messages. Dropping a custom Birthday Gazette front page or a 3-question team quiz takes 60 seconds and instantly gets the whole team smiling.",
            },
            {
                heading: "Made for Remote & Hybrid Teams",
                body: "When teammates work across cities or time zones, you can't gather around an office desk with a cake — so send a virtual Blow-the-Candles cake + Birthday Newspaper link they can open right between meetings.",
            },
            {
                heading: "Need Ready-to-Paste Office Wishes Too?",
                body: "Pair your interactive card with a polished message from our 80+ Birthday Wishes for Colleague, Coworker & Boss guide (/blog/birthday-wishes-for-colleague), covering Slack one-liners, LinkedIn greetings, remote teammates, and Hinglish office groups.",
            },
        ],
        faq: [
            {
                q: "Is BirthdayWisher.fun safe and appropriate for workplace / boss birthdays?",
                a: "Yes! Choose the Celebration or Gratitude vibe and clean Gallery or Storybook style for a warm, respectful card suitable for colleagues, managers, and clients.",
            },
            {
                q: "Can our whole Slack or Microsoft Teams channel open the same colleague birthday link?",
                a: "Yes — everyone on the team can open and enjoy the link during the 10-hour celebration window.",
            },
            {
                q: "Does my coworker need to sign in to view their card?",
                a: "No login or account needed — it opens right in their desktop or mobile browser.",
            },
        ],
    },
    "parents-birthday-surprise": {
        title: "Birthday Surprise for Mom & Dad — Digital Gratitude Card",
        subtitle: "Give Mom or Dad an emotional family keepsake filled with blessings, photos & your real voice.",
        description:
            "Plain text messages feel too small for the people who raised you. Build a warm, easy-to-open birthday surprise for Mom or Dad with childhood & family photos, glowing Sky Lantern blessings, a family Guess-the-Year timeline, and your recorded voice.",
        benefits: [
            "Simple, large-text tap navigation that's effortless for parents.",
            "Release glowing Sky Lanterns carrying blessings for their health & joy.",
            "Add family photos + record your real voice saying 'Happy Birthday'.",
            "Available in English, Hindi & 10+ languages — 100% free & ad-free.",
        ],
        ctaText: "Surprise Mom or Dad Now",
        heroEmoji: "👨‍👩‍👧",
        recommendedGames: [
            { href: "/games/sky-lanterns", e: "🏮", name: "Sky Lanterns of Blessings", desc: "Peaceful glowing lanterns carrying your wishes for Mom/Dad" },
            { href: "/games/guess-the-year", e: "📅", name: "Family Timeline Game", desc: "Relive favourite family vacations & milestones together" },
            { href: "/games/blow-the-candles", e: "🕯️", name: "Virtual Birthday Cake", desc: "A warm 3-tier cake with the full Happy Birthday tune" },
        ],
        seoSections: [
            {
                heading: "Why Parents Cherish Personal Effort Over Expensive Store Gifts",
                body: "Mom and Dad rarely ask for anything for themselves — what touches them most is knowing their children took time to remember shared moments and express gratitude. Combining old family photos, a heartfelt thank-you letter, and glowing Sky Lanterns creates happy tears every single time.",
            },
            {
                heading: "Effortless for Every Parent to Open on WhatsApp",
                body: "There are zero confusing menus, zero logins, and zero ads on your parent's wish link. They simply tap your WhatsApp link, hold the gift cover to open, and tap Next at their own comfortable pace while gentle piano-and-strings music plays.",
            },
            {
                heading: "Living Away From Home? Let Them Hear Your Voice",
                body: "If studies or work keep you in another city or country on Mom or Dad's birthday, recording a 20-second voice note inside your wish lets them hear your real voice right before blowing out the birthday candles.",
            },
        ],
        faq: [
            {
                q: "Is it easy for Mom or Dad to open if they aren't tech-savvy?",
                a: "Very easy! It opens directly from WhatsApp with one tap, uses clear large buttons, has zero ads, and even auto-advances gentle games if needed so parents never get stuck.",
            },
            {
                q: "Can I create the birthday wish for Mom or Dad in Hindi?",
                a: "Yes! You can select Hindi (or English/Hinglish) in the Look & Language step and write your messages in Hindi or Hinglish.",
            },
            {
                q: "Which game is best for a parent's birthday?",
                a: "Sky Lanterns of Wishes (/games/sky-lanterns) and Guess the Year (/games/guess-the-year) are peaceful, nostalgic favourites for both Mom and Dad.",
            },
        ],
    },
};

const getUseCaseData = (slug: string): UseCaseEntry | null => USE_CASES[slug] || null;

const USE_CASE_SEO: Record<string, { title: string; description: string }> = {
    "interactive-birthday-wish": {
        title: "Free Interactive Wish Maker — Birthday & Anniversary Link",
        description: "Create a 100% free interactive birthday or anniversary wish link in 3 minutes — with 12 playable games, photos, voice notes & fireworks. Zero login!",
    },
    "unique-birthday-gift-online": {
        title: "Unique Birthday Gift Online — Free Interactive Surprise",
        description: "Send a unique online birthday gift in 3 minutes: build a personalised interactive story with photos, 12 games, voice notes & fireworks. 100% free.",
    },
    "digital-story-greeting-card": {
        title: "Free Digital Story Greeting Card Maker | BirthdayWisher",
        description: "Upgrade from plain texts to an interactive digital story greeting card with 6 visual styles, photos, music, games & voice notes. Free, no login.",
    },
    "boyfriend-birthday-surprise": {
        title: "Boyfriend Birthday Surprise Website — Free Midnight Link",
        description: "Surprise your boyfriend at midnight with a playful roast-and-toast story, couple quiz, heartbeat sync, photos & date voucher. 100% free on WhatsApp.",
    },
    "anniversary-wishes-for-couple": {
        title: "Interactive Wedding Anniversary Wishes for Couple (Free)",
        description: "Create a heartfelt interactive wedding anniversary surprise for any couple (1st to 50th year) with photos, timeline games, sky lanterns & voice notes.",
    },
    "girlfriend-birthday-surprise": {
        title: "Romantic Girlfriend Birthday Surprise Website (Free Link)",
        description: "Make your girlfriend's birthday unforgettable with love-note balloons, dreamy photo frames, heartbeat sync, your voice note & fireworks. 100% free.",
    },
    "long-distance-birthday-surprise": {
        title: "Long-Distance Birthday Surprise Link — Heartbeat & Cake",
        description: "Miles apart at midnight? Send a free long-distance birthday surprise link with on-screen heartbeat sync, sky lanterns, virtual cake & your voice note.",
    },
    "colleague-birthday-wish": {
        title: "Creative Birthday Wish for Colleague & Coworker (Free)",
        description: "Skip generic Slack texts: make a fun, workplace-safe interactive birthday card with The Birthday Gazette newspaper, team trivia & treat wheel.",
    },
    "parents-birthday-surprise": {
        title: "Birthday Surprise for Mom & Dad — Free Family Photo Card",
        description: "Make Mom or Dad smile with an easy-to-open digital birthday surprise featuring family photos, glowing sky lantern blessings & your real voice note.",
    },
};

export function generateStaticParams() {
    return Object.keys(USE_CASES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const data = getUseCaseData(resolvedParams.slug);

    if (!data) {
        return { title: "Use Case Not Found | BirthdayWisher.fun", robots: { index: false } };
    }

    const seo = USE_CASE_SEO[resolvedParams.slug] || { title: data.title.slice(0, 62), description: data.description.slice(0, 158) };
    return {
        title: seo.title,
        alternates: { canonical: `/use-cases/${resolvedParams.slug}` },
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `/use-cases/${resolvedParams.slug}`,
            images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "BirthdayWisher.fun - Free Interactive Birthday & Anniversary Wish Maker" }],
        },
        twitter: {
            card: "summary_large_image",
            title: seo.title,
            description: seo.description,
            images: ["/twitter-image.png"],
        },
    };
}

const USE_CASE_LINKS: { slug: string; e: string; name: string }[] = [
    { slug: "interactive-birthday-wish", e: "🎮", name: "Free Interactive Wish Maker" },
    { slug: "unique-birthday-gift-online", e: "🎁", name: "Unique Birthday Gift Online" },
    { slug: "digital-story-greeting-card", e: "📱", name: "Digital Story Greeting Card" },
    { slug: "boyfriend-birthday-surprise", e: "💙", name: "Boyfriend Birthday Surprise" },
    { slug: "girlfriend-birthday-surprise", e: "💗", name: "Girlfriend Birthday Surprise" },
    { slug: "anniversary-wishes-for-couple", e: "💍", name: "Anniversary Wishes for Couple" },
    { slug: "long-distance-birthday-surprise", e: "✈️", name: "Long Distance Birthday Surprise" },
    { slug: "colleague-birthday-wish", e: "💼", name: "Colleague Birthday Wish" },
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
            <JsonLd
                data={[
                    { "@context": "https://schema.org", "@type": "WebPage", name: data.title, description: data.description, url: absUrl(`/use-cases/${slug}`) },
                    breadcrumbLd([{ name: "Home", path: "/" }, { name: data.title, path: `/use-cases/${slug}` }]),
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: data.faq.map((f) => ({
                            "@type": "Question",
                            name: f.q,
                            acceptedAnswer: { "@type": "Answer", text: f.a },
                        })),
                    },
                ]}
            />

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
                                <h3>100% Free · No Login</h3>
                                <p>Ready in ~3 minutes — opens on WhatsApp, Instagram or iMessage with zero ads on their wish.</p>
                                <ol className="bw-uc-steps">
                                    <li><span style={{ ["--c" as string]: "var(--p-pink)" }}>1</span> Add photos, games &amp; a voice note</li>
                                    <li><span style={{ ["--c" as string]: "var(--p-grape)" }}>2</span> Pick your style &amp; gentle music</li>
                                    <li><span style={{ ["--c" as string]: "var(--p-mint)" }}>3</span> Share the private link 🎈</li>
                                </ol>
                                <div className="bw-uc-bar"><i /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Recommended Playable Games for This Person */}
            <section className="bw-section" style={{ paddingTop: 28, paddingBottom: 12 }}>
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Best playable games to include 🎮</h2></div>
                    <div className="bw-guide-grid">
                        {data.recommendedGames.map((g) => (
                            <Link key={g.href} href={g.href} className="bw-card bw-guide">
                                <span className="e" aria-hidden="true">{g.e}</span>
                                <span>
                                    {g.name}
                                    <small style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--p-muted)", marginTop: 2 }}>{g.desc}</small>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Long Form SEO Content Section */}
            <section className="bw-section" style={{ paddingTop: 24 }}>
                <div className="bw-container">
                    <div className="bw-card bw-paper" style={{ maxWidth: 860, margin: "0 auto" }}>
                        <Prose>
                            {data.seoSections.map((section, idx) => (
                                <div key={idx}>
                                    <h2>{section.heading}</h2>
                                    <p>{section.body}</p>
                                </div>
                            ))}
                        </Prose>
                    </div>

                    {/* Visible FAQ Accordion matching FAQPage JSON-LD */}
                    <div style={{ maxWidth: 860, margin: "44px auto 0" }}>
                        <h2 className="bw-section-title" style={{ fontSize: "clamp(24px, 3.6vw, 32px)" }}>Frequently Asked Questions 🤔</h2>
                        <div className="bw-faq">
                            {data.faq.map((f, i) => (
                                <details key={f.q} open={i === 0}>
                                    <summary>{f.q}</summary>
                                    <p>{f.a}</p>
                                </details>
                            ))}
                        </div>
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
                            <span className="e" aria-hidden="true">🎮</span>All 12 Birthday Wishes Games
                        </Link>
                    </div>
                    <CtaCard
                        title={isAnniversary ? "Make their anniversary unforgettable" : "Ready to make their day unforgettable?"}
                        text="100% free, ad-free for your recipient, and ready in about 3 minutes — no app, no sign-up."
                        href={createHref}
                        cta={`${data.heroEmoji} ${data.ctaText}`}
                        emoji={isAnniversary ? "🥂" : "🎂"}
                    />
                </div>
            </section>
        </PartyPage>
    );
}
