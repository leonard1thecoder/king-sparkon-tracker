import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerCompletedProductSales } from "@/components/tuck-shop/WorkerCompletedProductSales";

export const metadata: Metadata = {
  title: "Worker Product Sales",
  description: "Completed counter and collected online product carts.",
};

export default function WorkerTransactionsPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Product sales" description="Review every paid counter checkout and completed online product collection." />
      <main className="p-5 md:p-8">
        <WorkerCompletedProductSales />
      </main>
    </>
  );
}
