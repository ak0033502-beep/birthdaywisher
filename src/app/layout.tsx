import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Nunito } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/party/themeScript";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SiteLanguageProvider } from "@/lib/SiteLanguageContext";
import { SITE_NAME, SITE_URL, absUrl } from "@/lib/site";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// "Joyful Party" design fonts: Baloo 2 (playful display, supports Hindi/Devanagari) + Nunito (soft body text)
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "devanagari"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  // All relative URLs (canonical, Open Graph) resolve against the www host Google indexes
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "0U1YiEFE8R79Y3OBSHah0kzi2xrwwMaelRhnv9cjIeQ",
  },
  // Default title/description for routes that don't set their own.
  // NOTE: no canonical here on purpose. A root canonical would be inherited by every page.
  title: "BirthdayWisher.fun | Birthday Wishes Game & Interactive Birthday Surprise",
  description: "Create a free birthday wishes game link with photos, quizzes, voice notes and surprises. Share it on WhatsApp with no login. Wedding anniversary wishes for couples too.",
  openGraph: {
    title: "BirthdayWisher.fun | Birthday Wishes Game & Interactive Surprise",
    description: "Turn your birthday wish into a game: photos, quizzes, voice notes and confetti in one link.",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    // og:image comes from src/app/opengraph-image.png (file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Wishes Game | BirthdayWisher.fun",
    description: "Turn your birthday wish into a game: photos, quizzes, voice notes and confetti in one link.",
    // twitter:image comes from src/app/twitter-image.png (file convention)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Day Party / Night Party: set before first paint to avoid a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6302942607473891"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BirthdayWisher.fun",
              "url": SITE_URL,
              "logo": absUrl("/logo.png"),
              "description": "The #1 Online Birthday & Anniversary Wish Creator. Create interactive, gamified wishes with puzzles, voice notes, and confetti.",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "akalloverservices@gmail.com",
                "contactType": "customer service"
              },
              "sameAs": []
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${nunito.variable} antialiased`}
      >
        <ThemeProvider>
          <SiteLanguageProvider>
            <Navbar />
            {children}
            <GoogleAnalytics />
          </SiteLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
