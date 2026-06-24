import type { Metadata } from "next";
import { DashboardShell } from "../dashboard-shell";

export const metadata: Metadata = {
  title: "Worker Dashboard",
  description: "Worker workspace for barcode scans, transactions, tips, claims, and profile controls.",
};

export default function WorkerDashboardPage() {
  return <DashboardShell role="Worker" />;
}
