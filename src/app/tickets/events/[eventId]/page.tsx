import type { Metadata } from "next";
import { getEventById } from "@/services/ticketService";
import { EventDetailsClient } from "./event-details-client";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  return {
    title: event ? `${event.name} | Event Details` : "Event Details",
    description: event ? `Buy and view ${event.name} tickets with Regular, VIP, and VVIP capacity tracking.` : "King Sparkon Tracker event details page.",
    alternates: { canonical: `/tickets/events/${eventId}` },
  };
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { eventId } = await params;
  return <EventDetailsClient eventId={eventId} />;
}
