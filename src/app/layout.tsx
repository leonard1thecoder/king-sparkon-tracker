import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://king-sparkon-tracker.com"),
  title: {
    default: "King Sparkon Tracker | Barcode Inventory Tracking SaaS",
    template: "%s | King Sparkon Tracker",
  },
  description:
    "King Sparkon Tracker is a barcode inventory tracking SaaS for product stock, barcode assignment, claims, worker activity, transactions, reports, audit logs, and billing.",
  keywords: [
    "barcode inventory software",
    "barcode product tracking",
    "inventory tracking SaaS",
    "stock movement tracking",
    "worker barcode scanning",
    "returnable product claims",
    "King Sparkon Tracker",
  ],
  icons: {
    icon: "/king-sparkon-logo.png",
    shortcut: "/king-sparkon-logo.png",
    apple: "/king-sparkon-logo.png",
  },
  openGraph: {
    title: "King Sparkon Tracker | Barcode Inventory Tracking SaaS",
    description:
      "Track every barcoded product from owner-created stock to worker scans, sales, claims, reports, audit logs, and billing.",
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
  twitter: {
    card: "summary",
    title: "King Sparkon Tracker | Barcode Inventory Tracking SaaS",
    description:
      "A business-scoped barcode inventory tracking SaaS for products, workers, transactions, claims, reports, and billing.",
    images: ["/king-sparkon-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
