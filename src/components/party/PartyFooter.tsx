"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations } from "@/lib/siteTranslations";
import { getHomeStrings } from "@/components/home/homeStrings";
import { BrandMark } from "./BrandLogo";

/** Site footer in the "Joyful Party" design. Must be rendered inside a `.party` scope. */
export function PartyFooter() {
    const { lang } = useSiteLanguage();
    const s = getSiteTranslations(lang);
    const h = getHomeStrings(lang);
    return (
        <footer className="bw-footer">
            <div className="bw-container">
                <div className="bw-footer-grid">
                    <div>
                        <div className="bw-logo" style={{ marginBottom: 12 }}><BrandMark size={30} /><span>BirthdayWisher<b>.fun</b></span></div>
                        <p>{s.footerDesc}</p>
                    </div>
                    <div>
                        <h4>{h.footerCreate}</h4>
                        <ul>
                            <li><Link href="/create">Create Birthday Wish</Link></li>
                            <li><Link href="/anniversary">Create Anniversary Wish</Link></li>
                            <li><Link href="/birthday-wishes-game">Birthday Wishes Games</Link></li>
                            <li><Link href="/blog">Birthday Wish Ideas (Blog)</Link></li>
                            <li><Link href="/blog/best-friend-quotes">For Best Friends</Link></li>
                            <li><Link href="/blog/romantic-wishes">For Partner / Boyfriend / Girlfriend</Link></li>
                            <li><Link href="/blog/wedding-anniversary-wishes-for-couple">Anniversary Wishes for Couple</Link></li>
                            <li><Link href="/blog/birthday-wishes-for-colleague">For Colleague / Coworker</Link></li>
                            <li><Link href="/blog/birthday-wishes-for-crush">For Crush</Link></li>
                            <li><Link href="/blog/long-distance-birthday-ideas">Long Distance Ideas</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>{h.footerUseCases}</h4>
                        <ul>
                            <li><Link href="/use-cases/unique-birthday-gift-online">Unique Birthday Gift Online</Link></li>
                            <li><Link href="/use-cases/digital-story-greeting-card">Digital Story Greeting Card</Link></li>
                            <li><Link href="/use-cases/boyfriend-birthday-surprise">Boyfriend Birthday Surprise</Link></li>
                            <li><Link href="/use-cases/girlfriend-birthday-surprise">Girlfriend Birthday Surprise</Link></li>
                            <li><Link href="/use-cases/anniversary-wishes-for-couple">Anniversary Wishes for Couple</Link></li>
                            <li><Link href="/use-cases/long-distance-birthday-surprise">Long Distance Surprise</Link></li>
                            <li><Link href="/use-cases/colleague-birthday-wish">Colleague Birthday Wish</Link></li>
                            <li><Link href="/use-cases/parents-birthday-surprise">Parents Birthday Surprise</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>{h.footerCompany}</h4>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
                            <li><Link href="/disclaimer">Disclaimer</Link></li>
                            <li><Link href="/dmca">DMCA</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="bw-footer-bottom">© {new Date().getFullYear()} birthdaywisher.fun. {s.footerMade}</div>
            </div>
        </footer>
    );
}
