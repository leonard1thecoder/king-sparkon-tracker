import type { Metadata } from "next";
import { DashboardTicketMarketplace } from "@/components/tickets/DashboardTicketMarketplace";

export const metadata: Metadata = {
  title: "Buy Tickets | User Dashboard",
  description: "User dashboard event ticket marketplace for buying QR tickets without public ticket redirects.",
};

export default function UserBuyTicketsPage() {
  return <DashboardTicketMarketplace />;
}
