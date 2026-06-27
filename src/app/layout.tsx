import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com"),
  title: {
    default: "King Sparkon Tracker | Scan, Verify, Move Stock",
    template: "%s | King Sparkon Tracker",
  },
  description:
    "A barcode and QR verification platform for product tracking, stock movement, worker tips, payouts, affiliate referrals, promotions, and audit-ready business operations.",
  keywords: [
    "barcode scanner platform",
    "QR verification",
    "stock movement tracking",
    "worker tips",
    "product audit trail",
    "King Sparkon Tracker",
  ],
  icons: {
    icon: "/king-sparkon-logo.png",
    shortcut: "/king-sparkon-logo.png",
    apple: "/king-sparkon-logo.png",
  },
  openGraph: {
    title: "King Sparkon Tracker | Scan, Verify, Move Stock",
    description:
      "Precision barcode operations for owners, workers, affiliates, admins, website payments, tips, payouts, and audit trails.",
    siteName: "King Sparkon Tracker",
    type: "website",
    images: [
      {
        url: "/king-sparkon-logo.png",
        width: 512,
        height: 512,
        alt: "King Sparkon Tracker logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter marketingOnly />
      </body>
    </html>
  );
}
