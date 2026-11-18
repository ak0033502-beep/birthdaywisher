import type { Metadata } from "next";
import { WishProvider } from "@/lib/WishContext";

export const metadata: Metadata = {
    title: "Create a Birthday Wishes Game Link – Free | BirthdayWisher",
    description: "Build an interactive birthday or anniversary surprise with photos, games, quiz, voice note & fireworks. 100% free, no login, instant WhatsApp link.",
    alternates: { canonical: "/create" },
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WishProvider>{children}</WishProvider>;
}
