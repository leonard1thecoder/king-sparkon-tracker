import type { Metadata } from "next";
import { DashboardTicketEventDetails } from "@/components/tickets/DashboardTicketEventDetails";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export const metadata: Metadata = {
  title: "Ticket Event Details | User Dashboard",
  description: "Dashboard event details route for viewing and buying ticket classes without leaving the user workspace.",
};

export default async function UserDashboardTicketEventPage({ params }: PageProps) {
  const { eventId } = await params;
  return <DashboardTicketEventDetails eventId={eventId} />;
}
