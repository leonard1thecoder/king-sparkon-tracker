import type { Metadata } from "next";
import { AdminBillingDiscounts } from "@/components/admin/AdminBillingDiscounts";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";

export const metadata: Metadata = {
  title: "Service Discounts | King Sparkon Tracker",
  description: "Administrator controls for Plus and Pro service discounts.",
};

export default function AdminDiscountsPage() {
  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <DashboardHeader role="ADMIN WORKSPACE" title="Service discounts" description="Create and schedule Plus and Pro discounts that render in plan cards and change Stripe checkout pricing." />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <AdminBillingDiscounts />
      </main>
    </DashboardFrame>
  );
}
