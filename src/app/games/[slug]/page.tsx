import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/site";
import { GAME_PAGES, getGamePage } from "@/components/games/gamePages";
import { GameDemoBox, GameMaker, OtherGames } from "@/components/games/GameMaker";
import { Bunting } from "@/components/party/Decor";
import { PartyFooter } from "@/components/party/PartyFooter";

export function generateStaticParams() {
    return GAME_PAGES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = getGamePage(slug);
    if (!page) return { title: "Game not found | BirthdayWisher.fun", robots: { index: false } };
    return {
        title: page.title,
        description: page.description,
        alternates: { canonical: `/games/${page.slug}` },
        openGraph: { title: page.title, description: page.description, url: `/games/${page.slug}`, images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }] },
        twitter: { card: "summary_large_image", title: page.title, description: page.description, images: ["/twitter-image.png"] },
    };
}

export default async function GamePageRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = getGamePage(slug);
    if (!page) notFound();

    return (
        <div className="party">
            <JsonLd data={[
                { "@context": "https://schema.org", "@type": "WebApplication", name: page.h1, url: absUrl(`/games/${page.slug}`), applicationCategory: "GameApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: page.description },
                breadcrumbLd([{ name: "Home", path: "/" }, { name: "Birthday Wishes Game", path: "/birthday-wishes-game" }, { name: page.h1, path: `/games/${page.slug}` }]),
                { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
            ]} />

            <header className="bw-hero" style={{ minHeight: 0, paddingBottom: 30 }}>
                <Bunting />
                <div className="bw-container" style={{ position: "relative", zIndex: 2 }}>
                    <nav aria-label="Breadcrumb" style={{ fontSize: 13, fontWeight: 700, color: "var(--p-muted)", marginBottom: 12 }}>
                        <Link href="/">Home</Link> › <Link href="/birthday-wishes-game">Birthday Wishes Game</Link> › <span>{page.e} {page.h1.split(":")[0]}</span>
                    </nav>
                    <span className="bw-eyebrow">{page.e} Free · no app · WhatsApp ready</span>
                    <h1 style={{ fontSize: "clamp(34px, 5.6vw, 60px)" }}>{page.h1}</h1>
                    <p className="bw-sub" style={{ maxWidth: 760 }}>{page.intro}</p>
                </div>
            </header>

            <section className="bw-section" style={{ paddingTop: 30 }}>
                <div className="bw-container bw-game-split">
                    <div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>▶ Try it yourself</h2>
                        <GameDemoBox game={page.game} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>🎁 Make one in 30 seconds</h2>
                        <GameMaker game={page.game} slug={page.slug} />
                    </div>
                </div>
            </section>

            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>How it works</h2></div>
                    <div className="bw-feat-grid">
                        {page.steps.map((s, i) => (
                            <div key={i} className="bw-card bw-feat"><div className="ic" style={{ background: ["#FFE3EC", "#FFF1C9", "#DDF8F1"][i] }} aria-hidden="true">{["1️⃣", "2️⃣", "3️⃣"][i]}</div><p style={{ color: "var(--p-text)", fontWeight: 700 }}>{s}</p></div>
                        ))}
                    </div>
                    <div className="bw-card" style={{ padding: 24, marginTop: 22 }}>
                        <h3 style={{ fontSize: 22, fontWeight: 800 }}>Why people love it</h3>
                        <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6, fontWeight: 600, color: "var(--p-muted)" }}>
                            {page.why.map((w) => <li key={w}>{w}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title"><h2>Questions? 🤔</h2></div>
                    <div className="bw-faq">
                        {page.faq.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>)}
                    </div>
                </div>
            </section>

            <section className="bw-section" style={{ paddingTop: 0 }}>
                <div className="bw-container">
                    <div className="bw-section-title"><h2>More birthday games 🎮</h2></div>
                    <OtherGames current={page.game} />
                    <p style={{ textAlign: "center", marginTop: 26 }}><Link href="/create" className="bw-btn bw-btn-primary">🎁 Make a full birthday surprise</Link></p>
                </div>
            </section>
            <PartyFooter />
        </div>
    );
}
