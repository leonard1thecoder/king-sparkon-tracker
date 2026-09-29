import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerRefundRequests } from "@/components/tuck-shop/WorkerRefundRequests";

export const metadata: Metadata = {
  title: "Worker Refund Requests",
  description: "Approve customer product and ticket refunds with cash payout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkerRefundsPage() {
  return (
    <>
      <DashboardHeader role="WORKER TERMINAL" title="Refund requests" description="Confirm product and ticket refunds and approve the cash payout." />
      <main className="p-5 md:p-8">
        <WorkerRefundRequests />
      </main>
    </>
  );
}
