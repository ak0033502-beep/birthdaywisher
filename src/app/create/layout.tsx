import type { Metadata } from "next";
import { WishProvider } from "@/lib/WishContext";

export const metadata: Metadata = {
    title: "Create a Birthday Wishes Game Link – Free | BirthdayWisher.fun",
    description: "Build your interactive birthday or anniversary surprise in minutes: photos, quiz, voice note, puzzle and confetti. Free, no login. Get a link to share on WhatsApp.",
    alternates: { canonical: "/create" },
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WishProvider>{children}</WishProvider>;
}
