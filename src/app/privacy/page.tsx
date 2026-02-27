import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | BirthdayWisher",
    description: "Our commitment to your privacy. Learn how BirthdayWisher protects your data and handles your uploaded media with our self-destructing links.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
                <p className="text-foreground/60 mb-12">Last Updated: October 2024</p>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="lead text-xl">
                        At BirthdayWisher, your privacy is our absolute priority. We designed this platform specifically so that you can share intimate memories without worrying about them living on the internet forever.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">1. Data We Collect</h2>
                    <p>We collect only the information necessary to generate and display your custom birthday wish. This includes:</p>
                    <ul>
                        <li>Text inputs (names, nicknames, core messages, promises).</li>
                        <li>Uploaded media (photos or short video/audio clips).</li>
                        <li>Technical data (IP addresses and browser types for basic analytics and abuse prevention).</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">2. The Self-Destruct Mechanism (Data Retention)</h2>
                    <p>
                        <strong>This is our core privacy feature.</strong> We do not want to store your personal photos or messages indefinitely.
                    </p>
                    <p>
                        Once you generate a wish link, it remains active until the recipient opens it. Exactly 10 hours after the recipient first opens the link, the system automatically and permanently deletes the entire record from our database, including all associated text, photos, and voice notes.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">3. How We Use Your Data</h2>
                    <p>
                        Your data is used exclusively to render the interactive birthday story for the recipient. We do not sell your data, use it for targeted advertising, or share it with third-party marketers.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">4. Third-Party Services</h2>
                    <p>We use trusted infrastructure providers to host our application and store media temporarily:</p>
                    <ul>
                        <li><strong>Vercel:</strong> For hosting the application and global edge delivery.</li>
                        <li><strong>Vercel Postgres / Blob:</strong> For temporary database and media storage prior to auto-deletion.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy or wish to request manual deletion of a link before the self-destruct timer, please contact our support team at privacy@birthdaywisher.in.</p>
                </div>
            </main>
        </div>
    );
}
