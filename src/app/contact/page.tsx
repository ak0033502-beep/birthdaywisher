import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | BirthdayWisher.fun",
    description: "Get in touch with the BirthdayWisher.fun team. We'd love to hear your feedback, suggestions, or answer any questions about our free birthday wish creator.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Contact Us</h1>
                <p className="text-foreground/60 mb-12">We&apos;d love to hear from you!</p>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-8">
                        Have a question, suggestion, or feedback about BirthdayWisher.fun? We&apos;re here to help and always happy to hear from our users.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">📧 Email Us</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        For general inquiries, feedback, partnerships, or support, reach out to us at:
                    </p>
                    <p className="text-foreground/90 leading-relaxed">
                        <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline font-semibold">
                            akalloverservices@gmail.com
                        </a>
                    </p>
                    <p className="text-foreground/60 text-sm">We typically respond within 24–48 hours.</p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">💬 What Can We Help With?</h2>
                    <ul className="text-foreground/70 leading-relaxed space-y-2">
                        <li>🎂 <strong>Birthday Wish Support:</strong> Issues creating or sharing birthday wishes</li>
                        <li>💍 <strong>Anniversary Wishes:</strong> Questions about anniversary wish features</li>
                        <li>🐛 <strong>Bug Reports:</strong> Found something broken? Let us know!</li>
                        <li>💡 <strong>Feature Requests:</strong> Suggest new features or improvements</li>
                        <li>🤝 <strong>Partnerships:</strong> Interested in collaborating with us?</li>
                        <li>📢 <strong>Advertising:</strong> Inquiries about advertising opportunities</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">🌐 About BirthdayWisher.fun</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        BirthdayWisher.fun is a free online platform that lets you create interactive, animated birthday wishes and wedding anniversary greetings. Our mission is to make every celebration unforgettable through personalized digital experiences — with puzzles, quizzes, photo memories, heartfelt letters, and more.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">📍 Business Information</h2>
                    <div className="text-foreground/70 leading-relaxed">
                        <p><strong>Website:</strong> <a href="https://birthdaywisher.fun" className="text-primary hover:underline">birthdaywisher.fun</a></p>
                        <p><strong>Email:</strong> <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline">akalloverservices@gmail.com</a></p>
                        <p><strong>Country:</strong> India</p>
                    </div>

                    <div className="mt-16 p-6 rounded-2xl bg-foreground/5 border border-foreground/10">
                        <p className="text-foreground/60 text-center text-sm">
                            Thank you for using BirthdayWisher.fun! Your feedback helps us create better birthday experiences for everyone. 🎉
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
