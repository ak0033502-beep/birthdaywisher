import { Metadata } from "next";
import { PartyPage, PageHero } from "@/components/party/PartyPage";

export const metadata: Metadata = {
    alternates: { canonical: "/terms" },
    title: "Terms & Conditions | BirthdayWisher.fun",
    description: "Terms of service and usage conditions for the BirthdayWisher.fun platform.",
};

export default function TermsPage() {
    return (
        <PartyPage>
            <PageHero
                crumbs={[{ name: "Home", href: "/" }, { name: "Terms & Conditions" }]}
                eyebrow="📜 The friendly fine print"
                title={<>Terms & Conditions</>}
                sub={<>Last Updated: October 2024</>}
            />
            <section className="bw-section" style={{ paddingTop: 10 }}>
                <div className="bw-container">
                    <div className="bw-card bw-paper" style={{ maxWidth: 940, margin: "0 auto" }}>
                <div className="bw-prose bw-legacy is-wide">
                    <p>Welcome to BirthdayWisher. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing or using BirthdayWisher.fun (the "Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the Service.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">2. User Conduct & Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                        <li>Upload explicit, NSFW, or illegal media in the memory vault.</li>
                        <li>Impersonate any person or entity.</li>
                        <li>Upload content that infringes upon the intellectual property rights of others.</li>
                        <li>Attempt to bypass or exploit the self-destruct mechanism or access wishes you did not create or receive.</li>
                    </ul>
                    <p>We reserve the right to immediately terminate and delete any wish that violates these guidelines without notice.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">3. Service Availability & Data Loss</h2>
                    <p>While we strive for 100% uptime, BirthdayWisher.fun is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the Service will function uninterrupted or be error-free.</p>
                    <p>Remember that our service is designed for temporary delivery. <strong>Do not use BirthdayWisher.fun as a permanent backup for your photos or voice notes.</strong> We are not liable for any loss of data, either through our automated self-destruct sequence or technical failure.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">4. Intellectual Property</h2>
                    <p>The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of BirthdayWisher.fun and its licensors. You retain full ownership of any text, photos, or audio you upload (User Content).</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">5. Changes to Terms</h2>
                    <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the date at the top of this page.</p>
                </div>
                    </div>
                </div>
            </section>
        </PartyPage>
    );
}
