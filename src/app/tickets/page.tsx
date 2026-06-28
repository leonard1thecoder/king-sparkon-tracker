import type { Metadata } from "next";
import { TicketsLandingClient } from "./tickets-landing-client";

export const metadata: Metadata = {
  title: "Ticket Management | Event Tickets & QR Ticket Verification",
  description:
    "Find, buy, view, and verify event tickets with King Sparkon Tracker QR ticket management, event capacity tracking, ticket classes, and worker gate scanning.",
  keywords: ["Ticket Management", "Event Tickets", "QR Ticket Verification", "King Sparkon Tracker tickets", "event ticket scanner", "VIP tickets"],
  alternates: { canonical: "/tickets" },
  openGraph: {
    title: "King Sparkon Tracker Tickets",
    description: "Browse upcoming events, buy QR tickets, and verify entry with a scan-first ticket portal.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker ticket management" }],
  },
};

export default function TicketsPage() {
  return <TicketsLandingClient />;
}
