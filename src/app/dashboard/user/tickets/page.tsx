import type { Metadata } from "next";
import { DashboardTicketsWorkspace } from "@/components/tickets/DashboardTicketsWorkspace";

export const metadata: Metadata = {
  title: "My Tickets | King Sparkon Tracker",
  description: "User dashboard route for issued QR ticket access without leaving the dashboard shell.",
};

export default function UserTicketsPage() {
  return <DashboardTicketsWorkspace role="User" />;
}
