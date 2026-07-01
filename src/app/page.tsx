import type { Metadata } from "next";
import { KingSparkonLanding } from "@/components/marketing/KingSparkonLanding";

export const metadata: Metadata = {
  title: "King Sparkon Tracker | Barcode, Tickets, Jobs, Cart & Role Dashboards",
  description:
    "King Sparkon Tracker is a premium barcode operations platform for inventory scanning, QR tickets, cart checkout, job opportunities, free user accounts, free affiliate accounts, worker tips, promotions, capacity views, and role-safe dashboards.",
  keywords: [
    "King Sparkon Tracker",
    "Sparks King Sparkon",
    "barcode inventory software",
    "QR ticket verification",
    "job opportunities platform",
    "free affiliate account",
    "free user account",
    "cart checkout platform",
    "worker tip QR codes",
    "South Africa barcode tracking",
  ],
  openGraph: {
    title: "King Sparkon Tracker | The Operating Crown",
    description: "Barcode inventory, QR tickets, cart checkout, jobs, free affiliates, worker tips, capacity views, and role-safe dashboards.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker barcode logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker | Barcode, Jobs & Ticket Platform",
    description: "Scan, track, verify, post jobs, sell tickets, run cart checkout, and manage role dashboards from one premium operating platform.",
    images: ["/king-sparkon-logo.png"],
  },
  alternates: { canonical: "/" },
};

export default function MarketingPage() {
  return <KingSparkonLanding />;
}
