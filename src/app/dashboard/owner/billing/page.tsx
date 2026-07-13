import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerBillingWorkspace } from "@/components/billing/OwnerBillingWorkspace";

export const metadata: Metadata = {
  title: "Owner Plan & Billing",
  description: "Plus and Pro monthly or yearly subscriptions, feature access, renewal status and Stripe checkout.",
};

export default function OwnerBillingPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Plan & Billing" description="Choose Plus or Pro on monthly or yearly billing, review live feature access, and track the current renewal state." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerBillingWorkspace />
      </main>
    </>
  );
}
