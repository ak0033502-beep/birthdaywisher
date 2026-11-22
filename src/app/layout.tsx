import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Nunito } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/party/themeScript";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SiteLanguageProvider } from "@/lib/SiteLanguageContext";
import { INSTAGRAM_URL, SITE_NAME, SITE_URL, absUrl } from "@/lib/site";
import { safeJsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { SiteTracker } from "@/components/seo/SiteTracker";
import { AdSenseLoader } from "@/components/seo/AdSenseLoader";

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
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-NB4BVN3F" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
        <meta name="google-adsense-account" content="ca-pub-6302942607473891" />
        <link rel="alternate" type="text/markdown" title="BirthdayWisher.fun AI Overview" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" title="BirthdayWisher.fun Complete AI Reference" href="/llms-full.txt" />
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  "name": "BirthdayWisher.fun",
                  "alternateName": ["BirthdayWisher", "Birthday Wisher"],
                  "url": SITE_URL,
                },
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  "name": "BirthdayWisher.fun",
                  "url": SITE_URL,
                  "logo": {
                    "@type": "ImageObject",
                    "url": absUrl("/logo.png"),
                    "width": 512,
                    "height": 512,
                  },
                  "image": absUrl("/logo.png"),
                  "description": "The #1 Online Birthday & Anniversary Wish Creator. Create interactive, gamified wishes with puzzles, voice notes, and confetti.",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "akalloverservices@gmail.com",
                    "contactType": "customer service"
                  },
                  "sameAs": [INSTAGRAM_URL]
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${nunito.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NB4BVN3F"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>
          <SiteLanguageProvider>
            <Navbar />
            {children}
            <AdSenseLoader />
            <GoogleAnalytics />
            <SiteTracker />
          </SiteLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
