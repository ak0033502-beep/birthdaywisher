import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | BirthdayWisher.fun — Birthday & Anniversary Wishes",
    description: "Learn about the mission behind BirthdayWisher. We believe birthdays and wedding anniversaries should be unforgettable, emotional, and interactive experiences. Create the perfect anniversary wishes for couple.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-6xl font-black mb-8">About <span className="text-primary">BirthdayWisher.fun</span></h1>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-8">
                        We are on a mission to kill the boring "HBD" text message.
                    </p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Our Story</h2>
                    <p>
                        Birthdays and wedding anniversaries are special. They are the days dedicated entirely to celebrating someone's existence and the love between two people. Yet, in the digital age, we've resorted to sending identical, copied-and-pasted text messages or quickly tapping a reaction on social media.
                    </p>
                    <p>
                        We realized that sending a plain text message for a birthday or anniversary feels incredibly transactional. We wanted to build something that allowed people to put real thought, emotion, and fun back into digital greetings — whether it's birthday wishes, wedding anniversary wishes for couple, or any celebration of love. That's how BirthdayWisher.fun was born.
                    </p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">What We Do</h2>
                    <p>
                        BirthdayWisher.fun is an online platform that empowers anyone to create highly interactive, gamified, and deeply emotional birthday and anniversary "stories." Think of it as a beautifully animated digital greeting card crossed with a personalized mini-game — perfect for birthday wishes, wedding anniversary wishes for couple, and every celebration in between.
                    </p>
                    <p>
                        Our 20-step wizard helps you craft a unique journey for your loved one, complete with inside jokes, memory quizzes, voice notes, and stunning visual finales.
                    </p>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Our Core Values</h2>
                    <ul>
                        <li><strong>Emotion Over Convenience:</strong> We believe taking 3 minutes to build a custom wish is infinitely better than taking 3 seconds to send a text.</li>
                        <li><strong>Privacy First:</strong> The memories you share are sacred. Our unique self-destruct mechanism ensures your photos and voice notes don't live on the internet forever.</li>
                        <li><strong>Unforgettable Design:</strong> We are obsessed with creating the "WOW" factor. Every animation, confetti burst, and haptic feedback is designed to delight.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
