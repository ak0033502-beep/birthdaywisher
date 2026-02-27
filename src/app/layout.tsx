import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BirthdayWisher | Create Next-Level Animated Birthday Wishes Online",
  description: "Ditch the boring texts! Create a highly interactive, 20-step gamified birthday wish. Personalize puzzles, upload photos, add voice notes, and trigger confetti explosions for free.",
  keywords: "Happy Birthday Wishes, Unique Birthday Greetings, Online Birthday Card Maker, Best Birthday Gift Ideas, Romantic Birthday Surprise, Digital Greeting Card, Interactive Birthday Card",
  openGraph: {
    title: "BirthdayWisher - Make Their Birthday Unforgettable",
    description: "Create an interactive, gamified birthday surprise with puzzles, golden tickets, and confetti!",
    url: "https://birthdaywisher.in",
    siteName: "BirthdayWisher",
    images: [
      {
        url: "/og-image.jpg", // We'll add a dummy placeholder path
        width: 1200,
        height: 630,
        alt: "BirthdayWisher Interactive Preview",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make Their Birthday Unforgettable",
    description: "The #1 Online Birthday Card Maker. Interactive, gamified, and highly emotional.",
    // images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
