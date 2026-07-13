import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerReportsWorkspace } from "@/components/reports/OwnerReportsWorkspace";

export const metadata: Metadata = {
  title: "Owner Business Reports",
  description: "Inventory valuation, low stock, alcohol activity and product movement reports.",
};

export default function OwnerReportsPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Business Reports" description="Monitor stock valuation, low-stock risk, alcohol movement and product sales activity from the live backend reports." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerReportsWorkspace />
      </main>
    </>
  );
}
