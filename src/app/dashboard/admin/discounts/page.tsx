import type { Metadata } from "next";
import { AdminBillingDiscounts } from "@/components/admin/AdminBillingDiscounts";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";

export const metadata: Metadata = {
  title: "Service Discounts | King Sparkon",
  description: "Administrator controls for Plus and Pro service discounts.",
};

export default function AdminDiscountsPage() {
  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <DashboardHeader role="ADMIN WORKSPACE" title="Service discounts" description="Create and schedule Plus and Pro discounts that render in plan cards and change checkout pricing." />
      <main className="page-main bg-[var(--surface)]">
        <AdminBillingDiscounts />
      </main>
    </DashboardFrame>
  );
}
