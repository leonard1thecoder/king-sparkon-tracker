import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerWithdrawalsWorkspace } from "@/components/finance/OwnerWithdrawalsWorkspace";

export const metadata: Metadata = {
  title: "Owner Withdrawals",
  description: "Unified King Sparkon balance and withdrawal history for products, tickets and tips.",
};

export default function OwnerWithdrawalsPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Balance & withdrawals" description="Online product payments, successful ticket sales and paid tips increase one King Sparkon balance. Request withdrawals from R100 and review every historical payout." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerWithdrawalsWorkspace />
      </main>
    </>
  );
}
