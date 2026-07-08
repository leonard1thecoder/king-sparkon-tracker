import type { Metadata } from "next";
import { DashboardMyTickets } from "@/components/tickets/DashboardMyTickets";

export const metadata: Metadata = {
  title: "My Tickets | User Dashboard",
  description: "User dashboard route for issued QR ticket access without leaving the dashboard shell.",
};

export default function UserTicketsPage() {
  return <DashboardMyTickets />;
}
