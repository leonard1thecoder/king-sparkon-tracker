import type { Metadata } from "next";
import { DashboardShell } from "../dashboard-shell";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description: "Owner workspace for products, workers, transactions, tips, withdrawals, promotions, reports, audit logs, and billing.",
};

export default function OwnerDashboardPage() {
  return <DashboardShell role="Owner" />;
}
