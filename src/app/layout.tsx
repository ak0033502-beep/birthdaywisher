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
  verification: {
    google: "0U1YiEFE8R79Y3OBSHah0kzi2xrwwMaelRhnv9cjIeQ",
  },
  title: "BirthdayWisher.fun | Animated Birthday & Wedding Anniversary Wishes for Couple Online",
  description: "Create interactive, gamified birthday wishes & wedding anniversary wishes for couple. Personalize puzzles, upload photos, add voice notes, and trigger confetti explosions — all for free. Perfect anniversary wishes for couple & birthday surprises.",
  keywords: "Happy Birthday Wishes, Unique Birthday Greetings, Online Birthday Card Maker, Best Birthday Gift Ideas, Romantic Birthday Surprise, Digital Greeting Card, Interactive Birthday Card, wedding anniversary wishes for couple, anniversary wishes for couple, happy anniversary wishes, romantic anniversary messages, wedding anniversary greetings, couple anniversary wishes, marriage anniversary wishes",
  openGraph: {
    title: "BirthdayWisher.fun - Birthday & Wedding Anniversary Wishes for Couple",
    description: "Create interactive, gamified birthday & anniversary wishes for couple with puzzles, golden tickets, and confetti!",
    url: "https://birthdaywisher.fun",
    siteName: "BirthdayWisher.fun",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BirthdayWisher.fun - Birthday & Anniversary Wishes Interactive Preview",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday & Wedding Anniversary Wishes for Couple — Make It Unforgettable",
    description: "The #1 Online Birthday & Anniversary Wish Creator. Interactive, gamified, and highly emotional. Perfect wedding anniversary wishes for couple.",
    // images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BirthdayWisher.fun",
    url: "https://birthdaywisher.fun",
    logo: "https://birthdaywisher.fun/og-image.jpg",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: "akalloverservices@gmail.com",
      contactType: "customer support",
    },
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BirthdayWisher.fun",
    url: "https://birthdaywisher.fun",
    description:
      "Create interactive, gamified birthday wishes & wedding anniversary wishes for couple. Personalize puzzles, upload photos, add voice notes, and trigger confetti explosions — all for free.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://birthdaywisher.fun/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BirthdayWisher.fun",
    url: "https://birthdaywisher.fun/create",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Create interactive, gamified birthday wishes with puzzles, voice notes, photo reveals, and confetti celebrations. 100% free.",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
