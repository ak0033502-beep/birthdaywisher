"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations, type SiteStrings } from "@/lib/siteTranslations";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Bunting, GiftCube, Balloons } from "@/components/party/Decor";
import { burst, useReveal, useTier, useTiltAndMagnet, type Tier } from "@/components/party/interactions";
import { Hero3D } from "./Hero3D";
import { PartyFooter } from "@/components/party/PartyFooter";
import { getHomeStrings, HOME_FAQ_EN, type HomeStrings } from "./homeStrings";

/* ---------- Structured data (English; Google renders the default English page) ---------- */
const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BirthdayWisher.fun",
    url: SITE_URL,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Create a free birthday wishes game: an interactive birthday or wedding anniversary surprise with puzzles, quizzes, photos, voice notes and confetti, shared as one link.",
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How To Create The Best Birthday & Anniversary Surprise Online",
    step: [
      { "@type": "HowToStep", name: "Personalize The Journey", text: "Answer fun questions about the birthday boy/girl. Add inside jokes, upload photos, and set the emotional vibe (Roast or Toast)." },
      { "@type": "HowToStep", name: "Select Aesthetics", text: "Choose a presentation style, select soundtrack music, and customize the final celebration." },
      { "@type": "HowToStep", name: "Share The Secret Link", text: "Get a unique URL instantly. Send it via WhatsApp or Instagram. The link auto-destructs after opening for privacy." },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ_EN.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

const RELATIONS: Array<{ key: keyof HomeStrings["relations"]; e: string; href: string }> = [
  { key: "bestie", e: "👯", href: "/blog/best-friend-quotes" },
  { key: "boyfriend", e: "❤️", href: "/use-cases/boyfriend-birthday-surprise" },
  { key: "girlfriend", e: "💕", href: "/use-cases/girlfriend-birthday-surprise" },
  { key: "parents", e: "👨‍👩‍👧", href: "/use-cases/parents-birthday-surprise" },
  { key: "colleague", e: "💼", href: "/use-cases/colleague-birthday-wish" },
  { key: "couple", e: "💍", href: "/anniversary" },
  { key: "longDistance", e: "✈️", href: "/use-cases/long-distance-birthday-surprise" },
  { key: "crush", e: "🙈", href: "/blog/birthday-wishes-for-crush" },
];

const FEATURES: Array<{ e: string; t: keyof SiteStrings; d: keyof SiteStrings; bg: string }> = [
  { e: "📸", t: "feat1", d: "feat1d", bg: "#FFE3EC" },
  { e: "🎟️", t: "feat2", d: "feat2d", bg: "#FFF1C9" },
  { e: "🎵", t: "feat3", d: "feat3d", bg: "#DDF4FF" },
  { e: "💬", t: "feat4", d: "feat4d", bg: "#EDE7FF" },
  { e: "⚡", t: "feat5", d: "feat5d", bg: "#DDF8F1" },
  { e: "❤️", t: "feat6", d: "feat6d", bg: "#FFE0E6" },
  { e: "🎁", t: "feat7", d: "feat7d", bg: "#FFEBD6" },
];

const GUIDES = [
  { e: "❤️", t: "Boyfriend birthday surprise", href: "/use-cases/boyfriend-birthday-surprise" },
  { e: "✈️", t: "Long-distance birthday ideas", href: "/blog/long-distance-birthday-ideas" },
  { e: "👯", t: "Best friend birthday quotes", href: "/blog/best-friend-quotes" },
  { e: "👩", t: "Birthday surprise for Mom & Dad", href: "/use-cases/parents-birthday-surprise" },
  { e: "💼", t: "Birthday wishes for colleague", href: "/blog/birthday-wishes-for-colleague" },
  { e: "💍", t: "Wedding anniversary wishes for couple", href: "/blog/wedding-anniversary-wishes-for-couple" },
];

export function HomeClient() {
  const { lang } = useSiteLanguage();
  const s = getSiteTranslations(lang);
  const h = getHomeStrings(lang);
  const tier = useTier();
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, tier);
  useTiltAndMagnet(rootRef, tier);

  const [hint, setHint] = useState<{ msg: string | null; cta: boolean }>({ msg: null, cta: false });
  const onHint = useCallback((msg: string | null, cta = false) => setHint({ msg, cta }), []);

  return (
    <div className="party" ref={rootRef}>
      <JsonLd data={STRUCTURED_DATA} />

      {/* ① HERO */}
      <header className="bw-hero">
        <Bunting />
        <Hero3D tier={tier} onHint={onHint} labels={{ popMsgs: h.popMsgs, giftMsg: h.giftMsg, giftLabel: "Open the gift" }} />
        <div className="bw-container bw-hero-grid">
          <div>
            <span className="bw-eyebrow">{h.eyebrow}</span>
            <h1>
              {s.heroTitle1} <span className="bw-hl">{s.heroTitle2}</span> <span aria-hidden="true">🎮🎂</span>
            </h1>
            <p className="bw-sub">{s.heroSubtitle}</p>
            <div className="bw-hero-ctas">
              <Link href="/create" className="bw-btn bw-btn-primary bw-magnetic">🎁 {s.createBirthdayWish}</Link>
              <a href="#see" className="bw-btn bw-btn-ghost">{h.seeDemo}</a>
            </div>
            <div className="bw-hero-meta">
              <span>{h.readyIn}</span>
              <span>{h.anniversaryQ} <Link href="/anniversary">{h.createOne}</Link></span>
            </div>
            <span className="bw-pop-hint" aria-live="polite">
              {hint.msg ?? h.popHint}
              {hint.cta && <> <Link href="/create" style={{ color: "var(--p-pink)" }}>{h.makeOne}</Link></>}
            </span>
          </div>
          <div className="bw-scene-space" aria-hidden="true" />
        </div>
      </header>

      {/* ② TRUST STRIP (real numbers from /api/stats) */}
      <TrustStrip h={h} />

      {/* ③ WHO IS IT FOR */}
      <section className="bw-section">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal>
            <h2>{h.relTitleA}<span className="bw-hl">{h.relTitleHl}</span>{h.relTitleB}</h2>
            <p>{h.relSub}</p>
          </div>
          <div className="bw-rel-grid">
            {RELATIONS.map((r, i) => (
              <Link key={r.key} href={r.href} className="bw-card bw-rel-card bw-sticker bw-tilt" style={{ ["--tilt" as string]: `${i % 2 ? 1.5 : -1.5}deg` }} data-reveal>
                <span className="em" aria-hidden="true">{r.e}</span>
                <h3>{h.relations[r.key].t}</h3>
                <p>{h.relations[r.key].d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Wave />

      {/* ④ FEATURES (keeps the existing translated SEO copy) */}
      <section className="bw-section bw-alt" id="features">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal>
            <h2>{s.featuresTitle}</h2>
            <p>{s.featuresSubtitle}</p>
          </div>
          <div className="bw-feat-grid">
            {FEATURES.map((f) => (
              <div key={f.t} className="bw-card bw-feat bw-tilt" data-reveal>
                <div className="ic" style={{ background: f.bg }} aria-hidden="true">{f.e}</div>
                <h3>{s[f.t]}</h3>
                <p>{s[f.d]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ HOW IT WORKS: 3D gift changes per step */}
      <HowItWorks s={s} />

      <Wave flip />

      {/* ⑥ FUN SURPRISES INSIDE (real features) as a 3D coverflow */}
      <section className="bw-section" id="games">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal>
            <h2>{h.playTitleA}<span className="bw-hl">{h.playTitleHl}</span> 🎮</h2>
            <p>{h.playSub}</p>
          </div>
        </div>
        <Coverflow items={h.play} tier={tier} />
        <p className="bw-swipe-hint">{h.swipe}</p>
        <p className="bw-swipe-hint" style={{ marginTop: 10 }}><Link href="/birthday-wishes-game" style={{ fontWeight: 800, textDecoration: "underline" }}>{h.moreGames}</Link></p>
      </section>

      {/* ⑦ PRESENTATION STYLES (the 6 real viewer styles) */}
      <section className="bw-section bw-alt">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal>
            <h2>{h.stylesTitle}</h2>
            <p>{h.stylesSub}</p>
          </div>
          <div className="bw-style-grid">
            {h.styles.map((st) => (
              <div key={st.t} className="bw-card bw-style bw-tilt" data-reveal>
                <div className="prev" style={{ background: st.bg }}><span aria-hidden="true">{st.e}</span>{st.t}</div>
                <div className="meta"><b>{st.t}</b>{st.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ SEE WHAT THEY SEE */}
      <section className="bw-section" id="see">
        <div className="bw-container bw-see">
          <div data-reveal>
            <h2 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 800 }}>{h.seeTitleA}<span className="bw-hl">{h.seeTitleHl}</span>{h.seeTitleB}</h2>
            <p style={{ color: "var(--p-muted)", fontSize: 18, marginTop: 10, fontWeight: 600 }}>{h.seeSub}</p>
            <ul>
              {h.seeItems.map((it) => <li key={it.t}><span aria-hidden="true" style={{ fontSize: 24 }}>{it.e}</span>{it.t}</li>)}
            </ul>
          </div>
          <div className="bw-phone" data-reveal aria-hidden="true">
            <div className="bw-phone-screen">
              <div className="bw-story">
                <div><span className="e">🔒</span><b>{h.story[0]}</b></div>
                <div><span className="e">🧩</span><b>{h.story[1]}</b></div>
                <div><span className="e">🧠</span><b>{h.story[2]}</b></div>
                <div><span className="e">🎂</span><b>{h.story[3]}</b><span style={{ fontSize: 24 }}>🎉🎊🎉</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⑨ PRIVATE & SAFE (existing translated copy) */}
      <section className="bw-section bw-alt">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal>
            <span className="bw-eyebrow">🔐 {s.secBadge}</span>
            <h2 style={{ marginTop: 14 }}>{s.secTitle}</h2>
            <p>{s.secSub}</p>
          </div>
          <div className="bw-priv-grid">
            {([["🙈", s.sec1, s.sec1d], ["🧹", s.sec2, s.sec2d], ["💣", s.sec3, s.sec3d]] as const).map(([e, t, d]) => (
              <div key={t} className="bw-card bw-priv bw-tilt" data-reveal>
                <div className="ic" aria-hidden="true">{e}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link href="/create" className="bw-btn bw-btn-primary">{s.secCta} →</Link>
          </div>
        </div>
      </section>

      {/* ⑩ REAL REVIEWS: existing component, hosted in a night band (it is designed for dark) */}
      <section className="bw-night-band" style={{ marginTop: 40 }}>
        <TestimonialsSection />
      </section>

      {/* ⑪ FAQ (visible; same content as the FAQPage schema) */}
      <section className="bw-section" id="faq">
        <div className="bw-container">
          <div className="bw-section-title" data-reveal><h2>{h.faqTitle}</h2></div>
          <div className="bw-faq">
            {h.faq.map((f, i) => (
              <details key={f.q} open={i === 0} data-reveal>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ⑫ GUIDES (internal links to content pages) */}
      <section className="bw-section" style={{ paddingTop: 20 }}>
        <div className="bw-container">
          <div className="bw-section-title" data-reveal><h2>{h.guidesTitle}</h2></div>
          <div className="bw-guide-grid">
            {GUIDES.map((g) => (
              <Link key={g.href} href={g.href} className="bw-card bw-guide bw-tilt" data-reveal>
                <span className="e" aria-hidden="true">{g.e}</span>{g.t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ⑬ FINAL CTA: light the candle */}
      <FinalCta h={h} />

      {/* FOOTER */}
      <PartyFooter />
    </div>
  );
}

/* ================= Sections ================= */

function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <svg className="bw-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" style={flip ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" />
    </svg>
  );
}

function TrustStrip({ h }: { h: HomeStrings }) {
  const [total, setTotal] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive && d && typeof d.total === "number") setTotal(d.total); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (total === null) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1500);
      setShown(Math.floor(total * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [total]);
  return (
    <div className="bw-container bw-trust">
      {total !== null && total > 0 && <div className="bw-pill">🎉 <b>{shown.toLocaleString("en-IN")}</b> {h.trustCreated}</div>}
      <div className="bw-pill">💸 {h.trustFree}</div>
      <div className="bw-pill">💬 {h.trustWorks}</div>
    </div>
  );
}

function HowItWorks({ s }: { s: SiteStrings }) {
  const [state, setState] = useState(1);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) setState(Number((en.target as HTMLElement).dataset.step));
    }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  const steps = [
    { n: 1, c: "var(--p-pink)", e: "🎯", t: s.how1, d: s.how1d },
    { n: 2, c: "var(--p-orange)", e: "🎨", t: s.how2, d: s.how2d },
    { n: 3, c: "var(--p-mint)", e: "💬", t: s.how3, d: s.how3d },
  ];
  return (
    <section className="bw-section bw-alt" id="how" style={{ paddingTop: 20 }}>
      <div className="bw-container">
        <div className="bw-section-title" data-reveal><h2>{s.howTitle}</h2></div>
        <div className="bw-how-grid">
          <div>
            <div className="bw-how-sticky">
              <div className="bw-how-stage" data-state={state}><GiftCube decor pop="🔗" /></div>
              <div className="bw-how-caption">{["①", "②", "③"][state - 1]} {steps[state - 1].t}</div>
            </div>
          </div>
          <div className="bw-how-steps">
            {steps.map((st, i) => (
              <div key={st.n} ref={(el) => { refs.current[i] = el; }} data-step={st.n} className={`bw-card bw-step bw-tilt ${state === st.n ? "" : "is-dim"}`}>
                <span className="num" style={{ ["--c" as string]: st.c }}>{st.n}</span>
                <div className="ill" aria-hidden="true">{st.e}</div>
                <h3>{st.t}</h3>
                <p>{st.d}</p>
              </div>
            ))}
            <div style={{ textAlign: "center" }}>
              <Link href="/create" className="bw-btn bw-btn-primary">{s.howCta} →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Coverflow({ items, tier }: { items: HomeStrings["play"]; tier: Tier | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const car = ref.current;
    if (!car || !tier || tier === "low") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = car.scrollLeft + car.clientWidth / 2;
      car.querySelectorAll<HTMLElement>(".bw-play-card").forEach((c) => {
        const center = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.max(-1.6, Math.min(1.6, (center - mid) / (car.clientWidth / 2)));
        c.style.transform = `rotateY(${-d * 32}deg) translateZ(${-Math.abs(d) * 140}px) scale(${1 - Math.abs(d) * 0.08})`;
        c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        c.classList.toggle("is-center", Math.abs(d) < 0.3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    car.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const third = car.querySelectorAll<HTMLElement>(".bw-play-card")[2];
    if (third) car.scrollLeft = third.offsetLeft - car.clientWidth / 2 + third.offsetWidth / 2;
    update();
    return () => { car.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [tier]);
  return (
    <div className="bw-coverflow" ref={ref}>
      {items.map((it) => (
        <div key={it.t} className="bw-card bw-play-card">
          <div className="art" style={{ background: it.bg }} aria-hidden="true">{it.e}</div>
          <div className="body"><h3>{it.t}</h3><p>{it.d}</p></div>
        </div>
      ))}
    </div>
  );
}

function FinalCta({ h }: { h: HomeStrings }) {
  const [lit, setLit] = useState(false);
  return (
    <section className="bw-final bw-alt">
      <Balloons count={5} />
      <div className="bw-container" style={{ position: "relative", zIndex: 2 }}>
        <button
          type="button"
          className={`bw-cake ${lit ? "is-lit" : ""}`}
          aria-label="Light the candle"
          onClick={(e) => { if (!lit) { setLit(true); burst(e.clientX, e.clientY, 140); } }}
        >
          <svg viewBox="0 0 220 200" aria-hidden="true">
            <g className="flame">
              <path d="M110 22 C 100 38, 102 48, 110 52 C 118 48, 120 38, 110 22 Z" fill="#FF9F43" />
              <path d="M110 32 C 105 42, 106 47, 110 49 C 114 47, 115 42, 110 32 Z" fill="#FFD93D" />
            </g>
            <rect x="105" y="50" width="10" height="34" rx="3" fill="#7C5CFF" />
            <rect x="104" y="58" width="12" height="4" fill="#fff" opacity=".6" />
            <rect x="104" y="70" width="12" height="4" fill="#fff" opacity=".6" />
            <rect x="40" y="84" width="140" height="44" rx="12" fill="#FF5C8A" />
            <path d="M40 98 q 11.7 14 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0 t 23.3 0" fill="none" stroke="#FFF8F0" strokeWidth="7" strokeLinecap="round" />
            <rect x="25" y="126" width="170" height="54" rx="14" fill="#FF9F43" />
            <circle cx="55" cy="152" r="5" fill="#FFD93D" /><circle cx="90" cy="158" r="5" fill="#2ED8B6" />
            <circle cx="130" cy="150" r="5" fill="#7C5CFF" /><circle cx="165" cy="157" r="5" fill="#FFD93D" />
            <rect x="10" y="178" width="200" height="12" rx="6" fill="#2B2240" opacity=".15" />
          </svg>
        </button>
        <h2>{lit ? h.finalLit : h.finalIdle}</h2>
        <p>{h.finalSub}</p>
        <Link href="/create" className="bw-btn bw-btn-primary bw-magnetic">{h.finalCta}</Link>
      </div>
    </section>
  );
}
