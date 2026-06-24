import type { Metadata } from "next";

import { DashboardShell } from "../dashboard-shell";

export const metadata: Metadata = {
  title: "Worker Dashboard",
  description:
    "Worker workspace for King Sparkon Tracker barcode assignment, transactions, product lookup, and barcode claims.",
};

export default function WorkerDashboardPage() {
  return (
    <div className="ks-dashboard min-h-screen bg-[#000510] text-white">
      <DashboardShell expectedRole="worker" />
    </div>
  );
}
