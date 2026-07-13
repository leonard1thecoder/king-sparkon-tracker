import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerOnlinePurchaseCheckout } from "@/components/tuck-shop/WorkerOnlinePurchaseCheckout";

export const metadata: Metadata = {
  title: "Worker Online Orders",
  description: "Prepare paid online product carts and verify collection.",
};

export default function WorkerOnlineOrdersPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Online orders" description="Assign scanned or automatic stock-unit codes, then display the collection QR when the cart is ready." />
      <main className="p-5 md:p-8">
        <WorkerOnlinePurchaseCheckout />
      </main>
    </>
  );
}
