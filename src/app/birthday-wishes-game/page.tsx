import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";
import { GAME_PAGES } from "@/components/games/gamePages";
import { Bunting } from "@/components/party/Decor";
import { PartyFooter } from "@/components/party/PartyFooter";

const TITLE = "Birthday Wishes Game – 12 Free Birthday Games for WhatsApp";
const DESC = "Send a birthday wish they can feel & play: sync heartbeats, release sky lanterns, pop love-note balloons, blow candles or spin a treat wheel for free.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: "/birthday-wishes-game" },
    openGraph: { title: TITLE, description: DESC, url: "/birthday-wishes-game", images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/twitter-image.png"] },
};

const RELATIONS = [
    { href: "/use-cases/boyfriend-birthday-surprise", e: "💙", t: "For your boyfriend" },
    { href: "/use-cases/girlfriend-birthday-surprise", e: "💗", t: "For your girlfriend" },
    { href: "/use-cases/long-distance-birthday-surprise", e: "✈️", t: "Long-distance birthdays" },
    { href: "/use-cases/parents-birthday-surprise", e: "👨‍👩‍👧", t: "For mom and dad" },
    { href: "/use-cases/colleague-birthday-wish", e: "💼", t: "For a colleague" },
    { href: "/use-cases/unique-birthday-gift-online", e: "🎁", t: "Unique online gift ideas" },
];

const FAQ = [
    { q: "What is a birthday wishes game?", a: "It's an interactive birthday or anniversary surprise that your loved one plays and feels instead of just reading — from syncing heartbeats across distance and releasing glowing sky lanterns to blowing out virtual cake candles or spinning a treat wheel." },
    { q: "Are all 12 birthday games free and private?", a: "Yes. Every game on BirthdayWisher.fun is 100% free with no signup, no app install, and no public leaderboard — your wish stays completely private between you and the recipient." },
    { q: "Which games are best for an emotional or long-distance birthday?", a: "Hold My Hand (Heartbeat Sync), Sky Lanterns of Wishes, Love-Note Balloons, Memory Match and Guess the Year are designed specifically to create warm, personal, heart-connected moments." },
    { q: "Can I combine multiple games inside one full surprise?", a: "Yes! In the full birthday wizard you can add up to 4 games and place them at the start, in the middle or right before the Grand Finale — alongside photos, a voice note and your heartfelt letter." },
    { q: "Do the games work on every phone?", a: "Yes. All 12 games run smoothly in any Android or iPhone browser, include one-tap accessibility options, and auto-advance if needed so nobody ever gets stuck." },
];

export default function BirthdayWishesGamePage() {
    const heartGames = GAME_PAGES.filter((g) => g.mood === "heart");
    const funGames = GAME_PAGES.filter((g) => g.mood === "fun");

    return (
        <div className="party">
            <JsonLd data={[
                {
                    "@context": "https://schema.org", "@type": "CollectionPage", name: TITLE, url: absUrl("/birthday-wishes-game"), description: DESC,
                    hasPart: GAME_PAGES.map((g) => ({ "@type": "WebApplication", name: g.h1.split(":")[0], url: absUrl(`/games/${g.slug}`), applicationCategory: "GameApplication", operatingSystem: "Web" })),
                },
                breadcrumbLd([{ name: "Home", path: "/" }, { name: "Birthday Wishes Game", path: "/birthday-wishes-game" }]),
                { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
            ]} />

            <header className="bw-hero" style={{ minHeight: 0, paddingBottom: 30 }}>
                <Bunting />
                <div className="bw-container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                    <nav aria-label="Breadcrumb" style={{ fontSize: 13, fontWeight: 700, color: "var(--p-muted)", marginBottom: 12 }}>
                        <Link href="/">Home</Link> › <span>Birthday Wishes Game</span>
                    </nav>
                    <span className="bw-eyebrow">🎮 12 Playable Games · Free · Private on WhatsApp</span>
                    <h1 style={{ fontSize: "clamp(34px, 5.6vw, 62px)" }}>Birthday Wishes Game: send a surprise they can <span className="bw-hl">feel &amp; play</span></h1>
                    <p className="bw-sub" style={{ maxWidth: 760, margin: "14px auto 0" }}>
                        From goosebump long-distance heartbeat syncs and glowing sky lanterns to blowing out virtual cake candles and spinning a treat wheel — pick any game below, try it live, and create a private link in 30 seconds.
                    </p>
                    <p style={{ marginTop: 22 }}><Link href="#heart-games" className="bw-btn bw-btn-primary">❤️ Explore Emotional &amp; Party Games</Link></p>
                </div>
            </header>

            <section className="bw-section" id="heart-games" style={{ paddingTop: 30 }}>
                <div className="bw-container">
                    <div className="bw-section-title">
                        <h2>❤️ Emotional, Sweet &amp; Connected Games</h2>
                        <p>Designed for partners, best friends, parents &amp; long-distance loved ones — warm, personal &amp; unforgettable.</p>
                    </div>
                    <div className="bw-game-cards">
                        {heartGames.map((g) => (
                            <Link key={g.slug} href={`/games/${g.slug}`} className="bw-card bw-game-card">
                                <span className="e" aria-hidden="true">{g.e}</span>
                                <h3>{g.h1.split(":")[0]}</h3>
                                <p>{g.blurb}</p>
                                <span className="go">Try live demo &amp; make one →</span>
                            </Link>
                        ))}
                    </div>

                    <div className="bw-section-title" style={{ marginTop: 56 }}>
                        <h2>🎉 Party, Playful &amp; Fun Games</h2>
                        <p>Laughs, treats, riddles &amp; cake — 100% personal with no public scoreboard.</p>
                    </div>
                    <div className="bw-game-cards">
                        {funGames.map((g) => (
                            <Link key={g.slug} href={`/games/${g.slug}`} className="bw-card bw-game-card">
                                <span className="e" aria-hidden="true">{g.e}</span>
                                <h3>{g.h1.split(":")[0]}</h3>
                                <p>{g.blurb}</p>
                                <span className="go">Try live demo &amp; make one →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <article className="bw-prose">
                        <h2>Why send an interactive birthday game?</h2>
                        <p>
                            Everyone receives dozens of identical &quot;Happy Birthday!&quot; texts. An interactive birthday game stands out because your favourite person gets to <strong>touch, play and feel</strong> the moment: holding their thumb on the screen to sync heartbeats with yours, lighting sky lanterns filled with your blessings, popping balloons stuffed with compliments, or blowing out candles on a virtual cake.
                        </p>
                        <p>
                            Every game on BirthdayWisher.fun is strictly <strong>personal and private</strong>. There are no public leaderboards or accounts — just a quiet, joyful connection between you and the person you&apos;re celebrating.
                        </p>

                        <h2>How to send a birthday game in 3 steps</h2>
                        <ol>
                            <li><strong>Choose the mood.</strong> Pick a heartfelt connection game like <Link href="/games/hold-my-hand">Hold My Hand</Link> or <Link href="/games/sky-lanterns">Sky Lanterns</Link>, or a playful hit like <Link href="/games/blow-the-candles">Blow the Candles</Link>, <Link href="/games/spin-the-wheel">Spin the Wheel</Link> or <Link href="/games/birthday-prank-link">Prank Link</Link>.</li>
                            <li><strong>Make it personal.</strong> Add their name, customize your notes, blessings or riddles in seconds, and add an optional closing message.</li>
                            <li><strong>Share on WhatsApp.</strong> Send the link on WhatsApp, Instagram or iMessage — it opens immediately in any phone browser with zero app install.</li>
                        </ol>

                        <h2>Combine up to 4 games in one grand surprise</h2>
                        <p>
                            Want the full experience? Open the <Link href="/create">Birthday Surprise Wizard</Link> to weave up to four games into a complete story alongside your photos, voice note, heartfelt letter, background music and our 5-act Grand Fireworks Finale.
                        </p>
                    </article>
                </div>
            </section>

            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Birthday surprise ideas by relationship 💝</h2></div>
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
