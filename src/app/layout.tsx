import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AffiliateAdManager } from "@/components/advertising/AffiliateAdManager";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MotionRouter } from "@/components/motion/MotionRouter";
import "./globals.css";
import "./brand-polish.css";
import "./motion.css";
import "./landing-motion-stability.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const adsensePublisherId = "ca-pub-8918343184695576";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com"),
  applicationName: "King Sparkon Tracker",
  manifest: "/manifest.webmanifest",
  title: {
    default: "King Sparkon | Commerce, tickets and team operations",
    template: "%s | King Sparkon",
  },
  description:
    "King Sparkon Tracker is a trademark platform of Sizolwakhe Leonard Mthimunye, known as King Sparkon: barcode inventory, QR tickets, jobs, affiliate marketing, Dev Hub software development, CI/CD, QA, cloud maintenance, worker tips, capacity dashboards, and role-safe business operations.",
  keywords: [
    "King Sparkon Tracker",
    "King Sparkon trademark",
    "Sizolwakhe Leonard Mthimunye",
    "Sizolwakhe Mthimunye King Sparkon",
    "barcode scanner platform",
    "QR verification",
    "stock movement tracking",
    "worker tips",
    "affiliate marketing platform",
    "job opportunities platform",
    "software development South Africa",
    "continuous integration development",
    "quality assurance software",
    "cloud maintenance support",
    "product audit trail",
  ],
  authors: [{ name: "Sizolwakhe Leonard Mthimunye", url: "https://github.com/leonard1thecoder" }],
  creator: "Sizolwakhe Leonard Mthimunye, known as King Sparkon",
  publisher: "King Sparkon Tracker",
  category: "Software Application",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: "/king-sparkon-logo.png",
    shortcut: "/king-sparkon-logo.png",
    apple: "/king-sparkon-logo.png",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "King Sparkon | Commerce, tickets and team operations",
    description:
      "A King Sparkon trademark platform for barcode inventory, QR tickets, jobs, affiliates, Dev Hub software development, CI/CD, QA, cloud maintenance, capacity dashboards, and role-safe business operations.",
    siteName: "King Sparkon",
    type: "website",
    locale: "en_ZA",
    images: [
      {
        url: "/king-sparkon-logo.png",
        width: 512,
        height: 512,
        alt: "King Sparkon Tracker trademark logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon | Commerce, tickets and team operations",
    description:
      "Trademark platform of Sizolwakhe Leonard Mthimunye: barcode scanning, QR tickets, jobs, affiliates, Dev Hub, QA, CI/CD, cloud maintenance, and capacity dashboards.",
    images: ["/king-sparkon-logo.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "King Sparkon Tracker",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com",
  logo: "https://king-sparkon-tracker.com/king-sparkon-logo.png",
  founder: {
    "@type": "Person",
    name: "Sizolwakhe Leonard Mthimunye",
    sameAs: ["https://github.com/leonard1thecoder"],
  },
  sameAs: ["https://github.com/leonard1thecoder"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "King Sparkon Tracker",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://king-sparkon-tracker.com/jobs?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <meta name="google-adsense-account" content={adsensePublisherId} />
        <script
          id="king-sparkon-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8918343184695576"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <MotionRouter />
        {children}
        <SiteFooter />
        <FloatingChatbot />
        <AffiliateAdManager />
      </body>
    </html>
  );
}
