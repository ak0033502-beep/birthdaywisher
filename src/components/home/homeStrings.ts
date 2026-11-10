import type { Locale } from "@/lib/i18n";

/**
 * Text for the redesigned homepage sections that don't exist in siteTranslations.
 * English + Hindi now; every other language falls back to English until translated.
 * (Hero, features, privacy and how-it-works keep using the existing 14-language siteTranslations.)
 */
export type HomeStrings = {
    eyebrow: string;
    popHint: string;
    popMsgs: string[];
    giftMsg: string;
    makeOne: string;
    readyIn: string;
    anniversaryQ: string;
    createOne: string;
    seeDemo: string;
    trustCreated: string;
    trustFree: string;
    trustWorks: string;
    relTitleA: string; relTitleHl: string; relTitleB: string;
    relSub: string;
    relations: Record<"bestie" | "boyfriend" | "girlfriend" | "parents" | "colleague" | "couple" | "longDistance" | "crush", { t: string; d: string }>;
    playTitleA: string; playTitleHl: string;
    playSub: string;
    play: Array<{ e: string; t: string; d: string; bg: string }>;
    moreGames: string;
    swipe: string;
    stylesTitle: string; stylesSub: string;
    styles: Array<{ e: string; t: string; d: string; bg: string }>;
    seeTitleA: string; seeTitleHl: string; seeTitleB: string;
    seeSub: string;
    seeItems: Array<{ e: string; t: string }>;
    story: [string, string, string, string];
    faqTitle: string;
    faq: Array<{ q: string; a: string }>;
    guidesTitle: string;
    finalIdle: string;
    finalLit: string;
    finalSub: string;
    finalCta: string;
    footerCreate: string; footerCompany: string; footerUseCases: string;
};

const en: HomeStrings = {
    eyebrow: "🎈 Free · No login · Opens on any phone",
    popHint: "👉 Pop the balloons · tap the gift",
    popMsgs: ["Pop! 🎈", "Another one! 😂", "You're good at this 🎯", "Now tap the gift 🎁"],
    giftMsg: "🎉 That's the feeling!",
    makeOne: "Make one →",
    readyIn: "⏱ Ready in about 3 minutes",
    anniversaryQ: "💍 Anniversary?",
    createOne: "Create one →",
    seeDemo: "▶ See how it works",
    trustCreated: "wishes created",
    trustFree: "100% free · no signup",
    trustWorks: "Works on WhatsApp · Instagram · any phone",
    relTitleA: "Who's the ", relTitleHl: "birthday star", relTitleB: "? 🎂",
    relSub: "Pick who it's for and get ideas made for them.",
    relations: {
        bestie: { t: "Bestie", d: "Roasts + inside jokes" },
        boyfriend: { t: "Boyfriend", d: "Romantic + playful" },
        girlfriend: { t: "Girlfriend", d: "Sweet + emotional" },
        parents: { t: "Mom & Dad", d: "A heartfelt thank-you" },
        colleague: { t: "Colleague", d: "Nice + professional" },
        couple: { t: "Couple", d: "Anniversary special" },
        longDistance: { t: "Long distance", d: "Make miles feel small" },
        crush: { t: "Crush", d: "Sweet, subtle, smooth" },
    },
    playTitleA: "Fun ", playTitleHl: "surprises inside",
    playSub: "Your friend has to play, solve and unlock their way to your message.",
    play: [
        { e: "🧩", t: "Photo Puzzle", d: "Your photo becomes a jigsaw they must solve", bg: "linear-gradient(135deg,#FFE3EC,#FFD6A5)" },
        { e: "🧠", t: "Quiz Gate", d: "Answer your questions to unlock the message", bg: "linear-gradient(135deg,#E5DEFF,#C9F2FF)" },
        { e: "🪙", t: "Scratch Card", d: "Scratch to reveal a hidden surprise", bg: "linear-gradient(135deg,#FFF1C9,#FFE3EC)" },
        { e: "😊", t: "Smile to Unlock", d: "The camera waits for a real smile", bg: "linear-gradient(135deg,#DDF8F1,#FFF1C9)" },
        { e: "🎚️", t: "Roast Meter", d: "From sweet toast to full roast", bg: "linear-gradient(135deg,#FFE0D1,#E5DEFF)" },
        { e: "🏆", t: "Virtual Awards", d: "Crown them 'Best Human of the Year'", bg: "linear-gradient(135deg,#FFF1C9,#DDF8F1)" },
        { e: "🎤", t: "Voice Note", d: "Say it in your own voice", bg: "linear-gradient(135deg,#C9F2FF,#FFE3EC)" },
        { e: "⏳", t: "Midnight Countdown", d: "Unlocks exactly at 12 on their birthday", bg: "linear-gradient(135deg,#E8F5D0,#FFF1C9)" },
    ],
    moreGames: "New: Blow the Candles, Prank Link & Birthday Quiz games. Play them all →",
    swipe: "◀ swipe ▶",
    stylesTitle: "Pick a style they'll remember",
    stylesSub: "The same wish, six completely different experiences.",
    styles: [
        { e: "🎬", t: "Cinematic Vault", d: "Movie-style story reveal", bg: "linear-gradient(160deg,#2B2240,#FF5C8A)" },
        { e: "💻", t: "Hacker Terminal", d: "Your wish, 'decrypted' line by line", bg: "linear-gradient(160deg,#0f2b1d,#2ED8B6)" },
        { e: "📖", t: "Magical Storybook", d: "Pages that turn like a fairy tale", bg: "linear-gradient(160deg,#FF9F43,#FFD93D)" },
        { e: "💬", t: "Encrypted Chat", d: "A secret chat that types itself", bg: "linear-gradient(160deg,#7C5CFF,#2ED8B6)" },
        { e: "🪐", t: "Space Odyssey", d: "Float through memories in space", bg: "linear-gradient(160deg,#1A1530,#7C5CFF)" },
        { e: "🖼️", t: "Art Museum", d: "Photos framed like a gallery", bg: "linear-gradient(160deg,#FF5C8A,#FF9F43)" },
    ],
    seeTitleA: "See what ", seeTitleHl: "they", seeTitleB: " see 👀",
    seeSub: "They open your link and go through a little story made just for them.",
    seeItems: [
        { e: "🔒", t: "It can stay locked until midnight on their birthday" },
        { e: "🧩", t: "They solve a puzzle or quiz to earn the next part" },
        { e: "🎤", t: "Your photos, memories and voice play one by one" },
        { e: "🎉", t: "Then the big finale: your message and confetti" },
    ],
    story: ["Unlocking at 00:00…", "Solve the puzzle!", "\"Where did we first meet?\"", "Happy Birthday!"],
    faqTitle: "Questions? 🤔",
    faq: [
        { q: "Is BirthdayWisher.fun free to use?", a: "Yes! BirthdayWisher.fun is 100% free. You can create unlimited interactive birthday wishes and anniversary wishes without any charge." },
        { q: "How long does the birthday wish link last?", a: "The wish link auto-destructs 10 hours after the recipient first opens it. This ensures privacy: your photos, voice notes, and messages are permanently deleted from our servers." },
        { q: "Can I create anniversary wishes for couples?", a: "Absolutely! BirthdayWisher.fun supports both birthday wishes and wedding anniversary wishes for couples from 1st to 50th year and beyond." },
        { q: "What makes this different from a regular birthday card?", a: "Unlike static cards, BirthdayWisher creates a 20-step interactive journey with puzzles, quizzes, voice notes, photo reveals, and confetti celebrations. The recipient has to earn their wish through fun challenges." },
        { q: "Is my data private and secure?", a: "Yes. All uploaded photos, voice notes, and personal messages are automatically deleted after 10 hours. We use secure Vercel Postgres databases and Cloudinary for media storage with automated wiping." },
    ],
    guidesTitle: "Ideas & guides 💡",
    finalIdle: "Tap the candle to light it 🕯️",
    finalLit: "Yay! 🎉 Now let's make their day",
    finalSub: "It takes about 3 minutes. They'll remember it for years.",
    finalCta: "🎁 Start my birthday surprise",
    footerCreate: "Create", footerCompany: "Company", footerUseCases: "Use cases",
};

const hi: HomeStrings = {
    ...en,
    eyebrow: "🎈 फ्री · लॉगिन नहीं · हर फ़ोन पर खुलता है",
    popHint: "👉 गुब्बारे फोड़ो · गिफ्ट पर टैप करो",
    popMsgs: ["फट! 🎈", "एक और! 😂", "वाह, क्या निशाना है 🎯", "अब गिफ्ट पर टैप करो 🎁"],
    giftMsg: "🎉 बस यही एहसास!",
    makeOne: "अपना बनाओ →",
    readyIn: "⏱ लगभग 3 मिनट में तैयार",
    anniversaryQ: "💍 सालगिरह है?",
    createOne: "बनाओ →",
    seeDemo: "▶ देखो कैसे काम करता है",
    trustCreated: "विश बन चुकी हैं",
    trustFree: "100% फ्री · साइनअप नहीं",
    trustWorks: "WhatsApp · Instagram · हर फ़ोन पर चलता है",
    relTitleA: "किसका ", relTitleHl: "बर्थडे", relTitleB: " है? 🎂",
    relSub: "चुनो किसके लिए है, और उनके हिसाब से आइडिया पाओ।",
    relations: {
        bestie: { t: "बेस्टी", d: "रोस्ट + अंदर की बातें" },
        boyfriend: { t: "बॉयफ्रेंड", d: "रोमांटिक + मस्ती" },
        girlfriend: { t: "गर्लफ्रेंड", d: "प्यारा + इमोशनल" },
        parents: { t: "मम्मी-पापा", d: "दिल से शुक्रिया" },
        colleague: { t: "कलीग", d: "अच्छा + प्रोफेशनल" },
        couple: { t: "कपल", d: "सालगिरह स्पेशल" },
        longDistance: { t: "लॉन्ग डिस्टेंस", d: "दूरियाँ छोटी लगें" },
        crush: { t: "क्रश", d: "प्यारा, हल्का, स्मूद" },
    },
    playTitleA: "अंदर छुपे ", playTitleHl: "मज़ेदार सरप्राइज़",
    playSub: "आपके दोस्त को खेलकर, सुलझाकर और अनलॉक करके आपके मैसेज तक पहुँचना होगा।",
    seeTitleA: "देखो ", seeTitleHl: "उन्हें", seeTitleB: " क्या दिखेगा 👀",
    seeSub: "वो आपका लिंक खोलते हैं और सिर्फ़ उनके लिए बनी एक छोटी कहानी से गुज़रते हैं।",
    faqTitle: "सवाल? 🤔",
    guidesTitle: "आइडिया और गाइड 💡",
    finalIdle: "मोमबत्ती जलाने के लिए टैप करो 🕯️",
    finalLit: "वाह! 🎉 अब उनका दिन खास बनाते हैं",
    finalSub: "लगभग 3 मिनट लगते हैं। वो इसे सालों याद रखेंगे।",
    finalCta: "🎁 मेरा बर्थडे सरप्राइज़ शुरू करो",
};

export function getHomeStrings(locale: Locale): HomeStrings {
    return locale === "hi" ? hi : en;
}

/** FAQ in English feeds the FAQPage JSON-LD (Google sees the English page). */
export const HOME_FAQ_EN = en.faq;
