import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerBillingWorkspace } from "@/components/billing/OwnerBillingWorkspace";

export const metadata: Metadata = {
  title: "Owner Plan & Billing",
  description: "Business subscription, feature access and Stripe plan checkout.",
};

export default function OwnerBillingPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Plan & Billing" description="Review the current business plan, live feature access, renewal status and available Stripe subscription upgrades." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerBillingWorkspace />
      </main>
    </>
  );
}
