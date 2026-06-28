import type { Metadata } from "next";
import { MyTicketsClient } from "./my-tickets-client";

export const metadata: Metadata = {
  title: "My Tickets | King Sparkon Tracker",
  description: "View purchased event tickets, QR code placeholders, ticket status, references, and event details in King Sparkon Tracker.",
  keywords: ["My Tickets", "QR event tickets", "ticket dashboard", "King Sparkon Tracker"],
  alternates: { canonical: "/tickets/my-tickets" },
};

export default function MyTicketsPage() {
  return <MyTicketsClient />;
}
