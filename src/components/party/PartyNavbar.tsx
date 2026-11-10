"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { languages } from "@/lib/i18n";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations } from "@/lib/siteTranslations";
import { PartyThemeToggle } from "./PartyThemeToggle";

/** Navbar for redesigned ("Joyful Party") pages. Carries its own `.party` scope for design tokens. */
export function PartyNavbar() {
    const { lang, setLang } = useSiteLanguage();
    const s = getSiteTranslations(lang);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = languages.find((l) => l.code === lang);

    useEffect(() => {
        const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    return (
        <header className="party bw-nav">
            <div className="bw-nav-in">
                <Link href="/" className="bw-logo" aria-label="BirthdayWisher.fun home">🎂 BirthdayWisher<b>.fun</b></Link>
                <nav className="bw-nav-links" aria-label="Main">
                    <Link href="/birthday-wishes-game">Games</Link>
                    <Link href="/anniversary">{s.anniversary}</Link>
                    <Link href="/blog">{s.blog}</Link>
                    <Link href="/about">{s.about}</Link>
                </nav>
                <div className="bw-nav-right">
                    <div style={{ position: "relative" }} ref={ref}>
                        <button type="button" className="bw-round-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} title="Select language">
                            🌐<span className="lbl">{current?.nativeName || "EN"}</span>
                        </button>
                        {open && (
                            <div className="bw-menu" role="listbox">
                                {languages.map((l) => (
                                    <button key={l.code} type="button" role="option" aria-selected={lang === l.code} className={lang === l.code ? "is-on" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
                                        <span>{l.flag}</span>
                                        <span style={{ flex: 1 }}><b style={{ display: "block", fontSize: 12 }}>{l.nativeName}</b><span style={{ fontSize: 10, opacity: 0.6 }}>{l.name}</span></span>
                                        {lang === l.code && <span aria-hidden="true">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <PartyThemeToggle />
                    <Link href="/create" className="bw-btn bw-btn-primary bw-nav-cta">{s.createWish}</Link>
                </div>
            </div>
        </header>
    );
}
