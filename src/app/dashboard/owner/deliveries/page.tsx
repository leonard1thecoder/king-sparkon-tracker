import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DeliveryWorkspace } from "@/components/tuck-shop/DeliveryWorkspace";

export const metadata: Metadata = {
  title: "Deliveries",
  description: "Paid delivery orders with addresses, fees and lead times.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerDeliveriesPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Deliveries" description="Paid delivery orders with addresses, fees and lead times." />
      <main className="p-5 md:p-8">
        <DeliveryWorkspace />
      </main>
    </>
  );
}
