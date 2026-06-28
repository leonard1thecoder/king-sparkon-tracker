import type { Metadata } from "next";
import { OwnerTicketsClient } from "./owner-tickets-client";

export const metadata: Metadata = {
  title: "Ticket Owner Dashboard | King Sparkon Tracker",
  description: "Owner and admin ticket dashboard for event management, ticket classes, capacity, tickets sold, revenue, and Regular, VIP, VVIP sales visibility.",
  keywords: ["Ticket Owner Dashboard", "event ticket management", "VIP ticket capacity", "King Sparkon Tracker"],
  alternates: { canonical: "/tickets/owner" },
};

export default function OwnerTicketsPage() {
  return <OwnerTicketsClient />;
}
