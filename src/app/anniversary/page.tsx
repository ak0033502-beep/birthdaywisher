import Link from "next/link";
import { WishCounter } from "@/components/ui/WishCounter";
import { PartyPage } from "@/components/party/PartyPage";
import { Balloons, Bunting } from "@/components/party/Decor";

const PRIVACY = [
    { e: "⏳", t: "10-Hour Self Destruct", d: "The countdown starts only when the couple opens the link. After 10 hours, the entire wish — photos, voice notes, and messages — vanishes permanently. No traces, no archives." },
    { e: "🔒", t: "End-to-End Obfuscated Storage", d: "Your wedding photos and intimate voice recordings are never publicly accessible. They live in a secure, encrypted database accessible only via the unique generated shortlink." },
    { e: "🗑️", t: "Automated Media Nuking", d: "All uploaded photos and voice notes are permanently deleted from our Cloudinary servers via automated cron once the 10-hour window expires. We keep absolutely nothing." },
    { e: "🛡️", t: "No Account Required", d: "No sign-up, no email, no data harvesting. Create your anniversary wish anonymously. We don’t track who creates what — your love story stays yours alone." },
];

const FEATURES = [
    { e: "📸", c: "var(--p-pink)", t: "Heartbeat Photo Reveal", d: "Your favorite couple photo slowly fades in, beating like a heart to the rhythm of the background music." },
    { e: "🎟️", c: "var(--p-lemon)", t: "The Golden Ticket", d: "A glowing, customized ticket with your 'Future Promise' — a romantic getaway, a dinner date, or a shared dream." },
    { e: "🎙️", c: "var(--p-grape)", t: "Voice Note Surprise", d: "Record your heartfelt anniversary message. It plays automatically during the stunning finale with fireworks." },
    { e: "🫧", c: "var(--p-mint)", t: "Floating Memories", d: "Your partner's quirky traits and inside jokes float across the screen as interactive, poppable bubbles." },
    { e: "💑", c: "var(--p-orange)", t: "'How Well Do You Know Me?' Quiz", d: "They must prove their love by answering custom trivia about your relationship to unlock the final message." },
    { e: "🤗", c: "var(--p-pink)", t: "Virtual Hug & Haptic Feedback", d: "A long-press button that vibrates their phone, delivering a digital hug across any distance." },
];

const STEPS = [
    { n: 1, e: "💌", c: "var(--p-pink)", t: "Pour Your Heart Out", d: "Answer fun prompts about your relationship. Upload wedding photos, record a voice note, and set the emotional vibe." },
    { n: 2, e: "🎨", c: "var(--p-grape)", t: "Choose the Aesthetics", d: "Select premium themes, pick anniversary music, and customize the grand finale celebration with confetti or fireworks." },
    { n: 3, e: "🔗", c: "var(--p-mint)", t: "Send the Secret Link", d: "Get a unique, private URL instantly. Share it via WhatsApp. The link self-destructs 10 hours after opening." },
];

export default function AnniversaryPage() {
    return (
        <PartyPage>
            {/* Hero */}
            <header className="bw-hero bw-page-hero is-center bw-ann-hero">
                <Bunting />
                <Balloons count={5} />
                <div className="bw-container bw-page-hero-in">
                    <span className="bw-eyebrow">💑 Wedding Anniversary Wishes for Couple</span>
                    <h1>Celebrate Your Love <span className="bw-hl">Like Never Before.</span></h1>
                    <p className="bw-sub">
                        Ditch the generic &quot;Happy Anniversary&quot; text. Create a highly interactive, gamified, and deeply emotional anniversary wish for your partner, your parents, or any couple you love. Photos, voice notes, quizzes, and a breathtaking finale — all wrapped in military-grade privacy.
                    </p>
                    <div className="bw-ann-ctas">
                        <Link href="/create?type=anniversary" className="bw-btn bw-btn-primary bw-uc-cta">💖 Create Anniversary Wish</Link>
                    </div>
                    <p className="bw-ann-meta">⏱️ Takes 3 minutes · 100% Free · 100% Private</p>
                    <div className="bw-ann-counter">
                        <WishCounter variant="anniversary" />
                    </div>
                </div>
            </header>

            {/* Privacy & Security */}
            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <span className="bw-eyebrow">🛡️ Top-Notch Privacy &amp; Security</span>
                        <h2 style={{ marginTop: 14 }}>Your Love Story. <span className="bw-hl">Zero Compromises on Privacy.</span></h2>
                        <p>
                            Anniversary wishes contain your most intimate moments — wedding photos, voice recordings, and deep emotional messages. We treat this data like it&apos;s sacred, because it is.
                        </p>
                        <p>
                            Our <b style={{ color: "var(--p-pink)" }}>&quot;Read &amp; Destroy&quot;</b> architecture ensures your memories exist only for the moment they&apos;re meant to be experienced — then they vanish forever.
                        </p>
                    </div>
                    <h3 className="bw-ann-subhead">🔐 Military-Grade Privacy</h3>
                    <div className="bw-priv-grid bw-ann-priv-grid">
                        {PRIVACY.map((p) => (
                            <div key={p.t} className="bw-card bw-priv">
                                <div className="ic" aria-hidden="true">{p.e}</div>
                                <h4>{p.t}</h4>
                                <p>{p.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bw-section bw-alt">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <h2>What&apos;s Inside Your Anniversary Wish? 🎁</h2>
                        <p>A 20-step interactive love story engineered to make any couple laugh, cry, and fall in love all over again.</p>
                    </div>
                    <div className="bw-feat-grid">
                        {FEATURES.map((f) => (
                            <div key={f.t} className="bw-card bw-feat">
                                <div className="ic" aria-hidden="true" style={{ background: `color-mix(in srgb, ${f.c} 22%, var(--p-surface))` }}>{f.e}</div>
                                <h3>{f.t}</h3>
                                <p>{f.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bw-section">
                <div className="bw-container">
                    <div className="bw-section-title">
                        <h2>3 Steps to the Perfect Anniversary Surprise</h2>
                    </div>
                    <div className="bw-ann-steps">
                        {STEPS.map((s) => (
                            <div key={s.n} className="bw-card bw-step">
                                <span className="num" style={{ ["--c" as string]: s.c }}>{s.n}</span>
                                <div className="ill" aria-hidden="true">{s.e}</div>
                                <h3>{s.t}</h3>
                                <p>{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bw-final bw-alt">
                <Balloons count={5} />
                <div className="bw-container" style={{ position: "relative", zIndex: 2 }}>
                    <div className="bw-cake is-lit bw-ann-cake" aria-hidden="true">
                        <svg viewBox="0 0 220 200">
                            <g className="flame">
                                <path d="M110 22 C 100 38, 102 48, 110 52 C 118 48, 120 38, 110 22 Z" fill="#FF9F43" />
                                <path d="M110 32 C 105 42, 106 47, 110 49 C 114 47, 115 42, 110 32 Z" fill="#FFD93D" />
                            </g>
                            <rect x="105" y="50" width="10" height="34" rx="3" fill="#7C5CFF" />
                            <rect x="104" y="58" width="12" height="4" fill="#fff" opacity=".6" />
                            <rect x="104" y="70" width="12" height="4" fill="#fff" opacity=".6" />
                            <rect x="40" y="84" width="140" height="44" rx="12" fill="#FF5C8A" />
                            <path d="M40 98 q 11.7 14 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0" fill="none" stroke="#FFF8F0" strokeWidth="7" strokeLinecap="round" />
                            <rect x="25" y="126" width="170" height="54" rx="14" fill="#7C5CFF" />
                            <path d="M62 146 c -4 -6 -12 -2 -8 5 l 8 8 l 8 -8 c 4 -7 -4 -11 -8 -5 z" fill="#FF5C8A" />
                            <path d="M110 140 c -4 -6 -12 -2 -8 5 l 8 8 l 8 -8 c 4 -7 -4 -11 -8 -5 z" fill="#FFD93D" />
                            <path d="M158 146 c -4 -6 -12 -2 -8 5 l 8 8 l 8 -8 c 4 -7 -4 -11 -8 -5 z" fill="#FF5C8A" />
                            <rect x="10" y="178" width="200" height="12" rx="6" fill="#2B2240" opacity=".15" />
                        </svg>
                    </div>
                    <h2>Ready to make them fall in love all over again? 🥂</h2>
                    <p>Photos, voice notes, a love quiz and a confetti finale — free, private and ready in 3 minutes.</p>
                    <Link href="/create?type=anniversary" className="bw-btn bw-btn-primary bw-uc-cta">💍 Create Anniversary Wish Now</Link>
                    <p className="bw-ann-links">
                        <Link href="/">Home</Link> · <Link href="/blog/wedding-anniversary-wishes-for-couple">Anniversary Wishes Blog</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
                    </p>
                </div>
            </section>
        </PartyPage>
    );
}
