import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerProductMetrics } from "@/components/tuck-shop/WorkerProductMetrics";
import { WorkerProductWorkspace } from "@/components/tuck-shop/WorkerProductWorkspace";

export const metadata: Metadata = {
  title: "Worker Products",
  description: "Worker business product catalogue with stock, barcode readiness, paid online barcode preparation, scan checkout, and product sales navigation.",
};

export default function WorkerProductsPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Products & stock" description="View your business products, stock quantities, required barcodes, paid online preparation and the correct routes for scanning and product sales." />
      <main className="grid gap-6 p-5 md:p-8">
        <WorkerProductMetrics />
        <div className="[&>section>div:first-child]:hidden">
          <WorkerProductWorkspace />
        </div>
      </main>
    </>
  );
}
