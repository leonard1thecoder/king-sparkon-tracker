import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AllProductsCatalogue } from "@/components/tuck-shop/AllProductsCatalogue";

export const metadata: Metadata = {
  title: "All Tuck Shop Products",
  description: "View every King Sparkon Tuck Shop product grouped by business without frontend catalogue pagination.",
};

export default function AllProductsPage() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="All products" description="Browse every matching product from every business in one complete, unpaginated catalogue." />
      <main className="grid gap-6 p-5 md:p-8">
        <AllProductsCatalogue />
      </main>
    </>
  );
}
