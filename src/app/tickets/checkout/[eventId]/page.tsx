import type { Metadata } from "next";
import { TicketCheckoutClient } from "./ticket-checkout-client";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export const metadata: Metadata = {
  title: "Ticket Checkout | King Sparkon Tracker",
  description: "Select Regular, VIP, or VVIP tickets, review buyer details, calculate totals, and complete a typed placeholder event ticket payment.",
  alternates: { canonical: "/tickets/checkout" },
};

export default async function TicketCheckoutPage({ params }: PageProps) {
  const { eventId } = await params;
  return <TicketCheckoutClient eventId={eventId} />;
}
