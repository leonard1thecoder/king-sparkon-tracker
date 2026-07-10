import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerProductWorkspace } from "@/components/tuck-shop/WorkerProductWorkspace";

export const metadata: Metadata = {
  title: "Worker Products",
  description: "Worker business product catalogue with stock, barcode readiness, scan checkout, and product sales navigation.",
};

export default function WorkerProductsPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Products & stock" description="View your business products, stock quantities, barcode readiness and the correct routes for scanning and product sales." />
      <main className="grid gap-6 p-5 md:p-8">
        <WorkerProductWorkspace />
      </main>
    </>
  );
}
