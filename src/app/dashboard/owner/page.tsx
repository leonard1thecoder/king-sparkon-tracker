import type { Metadata } from "next";

import { DashboardShell } from "../dashboard-shell";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description:
    "Owner workspace for King Sparkon Tracker inventory, workers, reports, audit logs, and billing controls.",
};

export default function OwnerDashboardPage() {
  return (
    <div className="ks-dashboard min-h-screen bg-[#000510] text-white">
      <DashboardShell expectedRole="owner" />
    </div>
  );
}
