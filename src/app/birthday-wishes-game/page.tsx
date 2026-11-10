import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";
import { COMING_SOON, GAME_PAGES } from "@/components/games/gamePages";
import { Bunting } from "@/components/party/Decor";
import { PartyFooter } from "@/components/party/PartyFooter";

const TITLE = "Birthday Wishes Game: Free Online Birthday Games to Send on WhatsApp";
const DESC = "Turn your birthday wish into a game: blow the candles, a funny prank link or a birthday quiz with a live leaderboard. Free, no app, opens in one tap on WhatsApp.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: "/birthday-wishes-game" },
    openGraph: { title: TITLE, description: DESC, url: "/birthday-wishes-game", images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/twitter-image.png"] },
};

const CARD_BLURB: Record<string, string> = {
    "blow-the-candles": "A virtual cake in a link. They blow into the phone (or tap) and the candles go out one by one.",
    "birthday-prank-link": "A fake 'wish expired' error or a silly prediction, then 'Gotcha!' and your real wish.",
    "birthday-quiz": "Multiple-choice questions about the birthday person. Share with the group and see who scores best.",
};

const RELATIONS = [
    { href: "/use-cases/boyfriend-birthday-surprise", e: "💙", t: "For your boyfriend" },
    { href: "/use-cases/girlfriend-birthday-surprise", e: "💖", t: "For your girlfriend" },
    { href: "/use-cases/long-distance-birthday-surprise", e: "✈️", t: "Long-distance birthdays" },
    { href: "/use-cases/parents-birthday-surprise", e: "👨‍👩‍👧", t: "For mom and dad" },
    { href: "/use-cases/colleague-birthday-wish", e: "💼", t: "For a colleague" },
    { href: "/use-cases/unique-birthday-gift-online", e: "🎁", t: "Unique online gift ideas" },
];

const FAQ = [
    { q: "What is a birthday wishes game?", a: "It's a birthday wish that the birthday person plays instead of just reading. They open your link, play a short game such as blowing out candles or answering a quiz about themselves, and then your message, photos and confetti appear." },
    { q: "Are these birthday games free?", a: "Yes. Every game on BirthdayWisher.fun is free, with no signup and no app to install. You get a link that opens in any phone browser." },
    { q: "How do I send a birthday game on WhatsApp?", a: "Pick a game, type the name and a short wish, then tap Create. You'll get a link that you can paste into WhatsApp, Instagram or any chat. It opens in one tap." },
    { q: "Can I put more than one game in a birthday surprise?", a: "Yes. In the full wizard you can add up to three games and choose where each one appears: at the start, in the middle or right before the finale, alongside photos, a voice note and a letter." },
    { q: "Do the games work on every phone?", a: "Yes. The games are lightweight and work on Android and iPhone. Blow the Candles has a tap option if the microphone isn't available, and nothing ever gets stuck: every game has an automatic way forward." },
];

export default function BirthdayWishesGamePage() {
    return (
        <div className="party">
            <JsonLd data={[
                { "@context": "https://schema.org", "@type": "CollectionPage", name: TITLE, url: absUrl("/birthday-wishes-game"), description: DESC,
                  hasPart: GAME_PAGES.map((g) => ({ "@type": "WebApplication", name: g.h1.split(":")[0], url: absUrl(`/games/${g.slug}`), applicationCategory: "GameApplication", operatingSystem: "Web" })) },
                breadcrumbLd([{ name: "Home", path: "/" }, { name: "Birthday Wishes Game", path: "/birthday-wishes-game" }]),
                { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
            ]} />

            <header className="bw-hero" style={{ minHeight: 0, paddingBottom: 30 }}>
                <Bunting />
                <div className="bw-container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                    <nav aria-label="Breadcrumb" style={{ fontSize: 13, fontWeight: 700, color: "var(--p-muted)", marginBottom: 12 }}>
                        <Link href="/">Home</Link> › <span>Birthday Wishes Game</span>
                    </nav>
                    <span className="bw-eyebrow">🎮 Free · no app · opens on WhatsApp</span>
                    <h1 style={{ fontSize: "clamp(34px, 5.6vw, 62px)" }}>Birthday Wishes Game: send a wish they can <span className="bw-hl">play</span></h1>
                    <p className="bw-sub" style={{ maxWidth: 760, margin: "14px auto 0" }}>
                        A text message gets read in two seconds. A birthday game gets played, laughed at and screenshotted. Pick a game below, add a name and a short wish, and send the link.
                    </p>
                    <p style={{ marginTop: 22 }}><Link href="#games" className="bw-btn bw-btn-primary">🎂 Pick a game</Link></p>
                </div>
            </header>

            <section className="bw-section" id="games" style={{ paddingTop: 30 }}>
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Play-able birthday wishes 🎈</h2><p>Each game takes about 30 seconds to make. Try the demo first on its page.</p></div>
                    <div className="bw-game-cards">
                        {GAME_PAGES.map((g) => (
                            <Link key={g.slug} href={`/games/${g.slug}`} className="bw-card bw-game-card">
                                <span className="e" aria-hidden="true">{g.e}</span>
                                <h3>{g.h1.split(":")[0]}</h3>
                                <p>{CARD_BLURB[g.slug]}</p>
                                <span className="go">Try it and make one →</span>
                            </Link>
                        ))}
                    </div>
                    <h3 style={{ textAlign: "center", fontSize: 20, fontWeight: 800, margin: "34px 0 14px" }}>Coming soon</h3>
                    <div className="bw-soon">{COMING_SOON.map((c) => <span key={c.t}>{c.e} {c.t}</span>)}</div>
                </div>
            </section>

            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <article className="bw-prose">
                        <h2>Why turn a birthday wish into a game?</h2>
                        <p>
                            Everyone gets dozens of &quot;Happy birthday!&quot; messages on their big day, and most of them look the same. A birthday wishes game stands out because the birthday person has to <strong>do</strong> something: blow out candles on their screen, fall for a harmless prank or prove they know themselves better than their friends do. That moment of play is what turns a forgettable message into a reaction video, a screenshot in the group chat or a &quot;how did you make this?&quot; reply.
                        </p>
                        <p>
                            Games also solve the long-distance problem. If you can&apos;t be there with a real cake, a link where they blow into their phone and the candles actually go out feels surprisingly close to the real thing. For friend groups, a birthday quiz with a leaderboard gets everyone involved instead of just one person sending a wish.
                        </p>

                        <h2>How to send a birthday game in 3 steps</h2>
                        <ol>
                            <li><strong>Pick a game.</strong> Blow the Candles for something sweet, the Prank Link for a laugh or the Birthday Quiz for the whole group.</li>
                            <li><strong>Personalise it.</strong> Type their name, write a short wish and adjust the game: number of candles, type of prank or your own quiz questions.</li>
                            <li><strong>Share the link.</strong> Paste it into WhatsApp, Instagram or any chat. It opens instantly in the phone browser, with no app and no login.</li>
                        </ol>

                        <h2>Make it a full birthday surprise</h2>
                        <p>
                            A game is a great opener, but it gets even better with more inside. In the <Link href="/create">birthday surprise wizard</Link> you can add up to three games and decide where each one appears: at the very start, in the middle or right before the finale. Mix them with a photo slideshow, a voice note, a heartfelt letter and a confetti ending. Every surprise has a gift-box opening and a Day or Night party theme, and it works smoothly on budget phones too.
                        </p>

                        <h2>Which game should you choose?</h2>
                        <p>
                            <Link href="/games/blow-the-candles">Blow the Candles</Link> works for everyone, from parents to partners, and is perfect when you&apos;re far away. The <Link href="/games/birthday-prank-link">Birthday Prank Link</Link> is made for best friends and siblings who appreciate a good joke; it is harmless and reveals the real wish within seconds. The <Link href="/games/birthday-quiz">Birthday Quiz</Link> is ideal for friend groups and office teams: share one link and a live leaderboard (first names only) shows who knows the birthday person best.
                        </p>

                        <h2>Private and safe</h2>
                        <p>
                            Birthday surprise links are not listed on Google. Blow the Candles measures the sound level on the phone itself and never records or uploads audio. Quiz leaderboards only store a first name and a score, and they are deleted together with the wish.
                        </p>
                    </article>
                </div>
            </section>

            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Birthday game ideas by relationship 💝</h2></div>
                    <div className="bw-guide-grid">
                        {RELATIONS.map((r) => <Link key={r.href} href={r.href} className="bw-card bw-guide"><span className="e" aria-hidden="true">{r.e}</span>{r.t}</Link>)}
                    </div>
                </div>
            </section>

            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Questions? 🤔</h2></div>
                    <div className="bw-faq">
                        {FAQ.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>)}
                    </div>
                    <p style={{ textAlign: "center", marginTop: 30 }}><Link href="/create" className="bw-btn bw-btn-primary">🎁 Make a full birthday surprise</Link></p>
                </div>
            </section>
            <PartyFooter />
        </div>
    );
}
