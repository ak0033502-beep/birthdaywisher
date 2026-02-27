import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | BirthdayWisher",
    description: "Terms of service and usage conditions for the BirthdayWisher platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Terms & Conditions</h1>
                <p className="text-foreground/60 mb-12">Last Updated: October 2024</p>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p>Welcome to BirthdayWisher. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing or using BirthdayWisher (the "Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the Service.</p>

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
                    <p>While we strive for 100% uptime, BirthdayWisher is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the Service will function uninterrupted or be error-free.</p>
                    <p>Remember that our service is designed for temporary delivery. <strong>Do not use BirthdayWisher as a permanent backup for your photos or voice notes.</strong> We are not liable for any loss of data, either through our automated self-destruct sequence or technical failure.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">4. Intellectual Property</h2>
                    <p>The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of BirthdayWisher and its licensors. You retain full ownership of any text, photos, or audio you upload (User Content).</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">5. Changes to Terms</h2>
                    <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the date at the top of this page.</p>
                </div>
            </main>
        </div>
    );
}
