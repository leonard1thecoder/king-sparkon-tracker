import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";
import "./brand-polish.css";

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
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter marketingOnly />
        <FloatingChatbot />
      </body>
    </html>
  );
}
