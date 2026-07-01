import type { Metadata } from "next";
import { DashboardShell } from "../dashboard-shell";

export const metadata: Metadata = {
  title: "User Tuck Shop Dashboard",
  description: "Buyer workspace for King Sparkon Tuck Shop product browsing, self-service checkout, Stripe payment links, worker tips, tickets, and job applications.",
};

export default function UserDashboardPage() {
  return <DashboardShell role="User" />;
}
