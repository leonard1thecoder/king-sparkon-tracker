import type { Metadata } from "next";
import { DashboardOwnerEventDetails } from "@/components/tickets/DashboardOwnerEventDetails";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export const metadata: Metadata = {
  title: "Ticket Event Details | Owner Dashboard",
  description: "Owner dashboard event details route for ticket capacity and class-level sales visibility.",
};

export default async function OwnerDashboardTicketEventPage({ params }: PageProps) {
  const { eventId } = await params;
  return <DashboardOwnerEventDetails eventId={eventId} />;
}
