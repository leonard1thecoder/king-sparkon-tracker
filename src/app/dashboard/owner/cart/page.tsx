import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TuckShopCartDashboard } from "@/components/tuck-shop/TuckShopCartDashboard";

export const metadata: Metadata = {
  title: "Shared Cart | Owner Dashboard",
  description: "Review the shared product and ticket cart, confirm quantities, and checkout with PayFast from the owner dashboard.",
};

export default function OwnerSharedCartPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Shared cart" description="Review product and ticket cart items, confirm quantities, and checkout with PayFast from the owner dashboard." />
      <main className="grid gap-6 p-5 md:p-8">
        <TuckShopCartDashboard role="owner" />
      </main>
    </>
  );
}
