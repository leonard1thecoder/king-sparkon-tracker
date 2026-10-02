import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerReturnableRefunds } from "@/components/tuck-shop/WorkerReturnableRefunds";

export const metadata: Metadata = {
  title: "Worker Returnable Refunds",
  description: "Approve customer returnable deposit cash-back requests at the counter.",
};

export default function WorkerReturnableRefundsPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Returnable refunds" description="Confirm handed-back empties and approve the deposit cash payout." />
      <main className="page-main">
        <WorkerReturnableRefunds />
      </main>
    </>
  );
}
