import type { Metadata } from "next";
import { AllTicketEventsClient } from "./all-ticket-events-client";

export const metadata: Metadata = {
  title: "All Ticket Events | King Sparkon Tracker",
  description:
    "View every King Sparkon Tracker ticket event across draft, published, completed, and cancelled states with QR ticket capacity and sales context.",
  keywords: ["all ticket events", "ticket event dashboard", "QR tickets", "King Sparkon Tracker events"],
  alternates: { canonical: "/tickets/events" },
  openGraph: {
    title: "All King Sparkon Tracker Ticket Events",
    description: "A full ticket-event workspace for operators, owners, workers, and admins.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker ticket events" }],
  },
};

export default function AllTicketEventsPage() {
  return <AllTicketEventsClient />;
}
