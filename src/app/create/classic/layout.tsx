import type { Metadata } from "next";

// The classic (v1) wizard, kept as a fallback while Wizard 2.0 settles in.
// Not indexed: /create is the canonical page for creating a wish.
export const metadata: Metadata = {
    title: "Classic wizard | BirthdayWisher.fun",
    alternates: { canonical: "/create" },
    robots: { index: false, follow: true },
};

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
    return children;
}
