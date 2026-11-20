import { Metadata } from "next";
import Link from "next/link";
import { PartyPage, PageHero } from "@/components/party/PartyPage";

export const metadata: Metadata = {
    alternates: { canonical: "/privacy" },
    title: "Privacy Policy | BirthdayWisher.fun",
    description: "Learn how BirthdayWisher.fun protects your privacy with 10-hour self-destructing wish links, anonymous analytics, and Google AdSense cookie choices.",
};

export default function PrivacyPage() {
    return (
        <PartyPage>
            <PageHero
                crumbs={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]}
                eyebrow="🔒 Your memories stay private"
                title={<>Privacy Policy</>}
                sub={<>Last Updated: November 2026</>}
            />
            <section className="bw-section" style={{ paddingTop: 10 }}>
                <div className="bw-container">
                    <div className="bw-card bw-paper" style={{ maxWidth: 940, margin: "0 auto" }}>
                        <div className="bw-prose bw-legacy is-wide">
                            <p className="lead text-xl">
                                At BirthdayWisher.fun, your privacy is our priority. We built this platform so you can share heartfelt birthday and wedding anniversary surprises without worrying about your personal photos or voice notes living on the internet forever.
                            </p>

                            <h2 className="text-2xl font-bold mt-12 mb-4">1. Information We Collect</h2>
                            <p>We collect only the minimum information required to create and deliver your interactive surprise:</p>
                            <ul>
                                <li><strong>Wish Content:</strong> Names, nicknames, messages, quiz questions, and promises you enter while building a wish.</li>
                                <li><strong>Temporary Media:</strong> Photos, short video clips, or voice notes you choose to upload for a wish.</li>
                                <li><strong>Privacy-Safe Analytics:</strong> Anonymous, cookie-free page view and performance metrics (browser/device family and country code). We do not store raw visitor IP addresses in our analytics tables.</li>
                                <li><strong>Optional Reviews:</strong> Ratings, display name, and feedback if you voluntarily submit a public review.</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-12 mb-4">2. Self-Destructing Wish Links (Data Retention)</h2>
                            <p>
                                <strong>Private wishes are temporary by design.</strong> Every generated wish link (<code>/wish/...</code> and <code>/w/...</code>) is marked <code>noindex</code> so search engines do not list it, and third-party advertisements are disabled on private wish pages.
                            </p>
                            <p>
                                Exactly <strong>10 hours after the recipient opens your link</strong> (or after 7 days if a link is never opened), our automated cleanup permanently deletes the wish record from our database along with its uploaded photos, videos, and voice notes from cloud storage. Abandoned draft uploads are also automatically purged.
                            </p>

                            <h2 className="text-2xl font-bold mt-12 mb-4">3. How We Use Your Information</h2>
                            <p>
                                Your wish text, photos, and voice notes are used solely to render the interactive surprise for the person you share the link with. We never sell your personal wish content, photos, or audio recordings to third parties.
                            </p>

                            <h2 className="text-2xl font-bold mt-12 mb-4">4. Cookies &amp; Google AdSense Advertising</h2>
                            <p>
                                To keep BirthdayWisher.fun 100% free for everyone, we display advertisements via <strong>Google AdSense</strong> on public informational pages (such as our homepage, blog guides, and game pages). Private recipient wish links remain ad-free.
                            </p>
                            <ul>
                                <li>Third-party vendors, including Google, use cookies (such as the Google advertising / DoubleClick cookie) to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.</li>
                                <li>Google&apos;s use of advertising cookies enables it and its partners to serve personalized or non-personalized ads to visitors based on their visit to BirthdayWisher.fun and/or other sites on the internet.</li>
                                <li>You may opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutads.info/choices</a>.</li>
                                <li>Visitors from the European Economic Area (EEA), the UK, and Switzerland are presented with a consent choice in accordance with GDPR and Google&apos;s EU User Consent Policy before personalized advertising cookies are used.</li>
                                <li>Learn more about how Google uses information from sites that use its services at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Partner Sites Policy</a>.</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-12 mb-4">5. Third-Party Infrastructure Providers</h2>
                            <p>We rely on trusted infrastructure providers to operate the service securely:</p>
                            <ul>
                                <li><strong>Vercel:</strong> Application hosting, SSL encryption, and global edge delivery.</li>
                                <li><strong>Vercel Postgres (Neon):</strong> Encrypted database storage for active wishes prior to auto-deletion.</li>
                                <li><strong>Cloudinary:</strong> Temporary encrypted media delivery for uploaded wish photos and voice notes prior to auto-deletion.</li>
                                <li><strong>Google Analytics &amp; Google AdSense:</strong> Aggregate traffic measurement and ad serving on public pages.</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-12 mb-4">6. Your Rights &amp; Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, or if you want a wish link deleted immediately before its 10-hour self-destruct timer finishes, please email us at{" "}
                                <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline font-semibold">akalloverservices@gmail.com</a>{" "}
                                or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PartyPage>
    );
}
