import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PromotedProductsRow } from "@/components/tuck-shop/PromotedProductsRow";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";

export default function Page() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Buy products" description="Browse promoted brands and business catalogues, follow job alerts, add quantities, and checkout from the user dashboard." />
      <main className="grid gap-6 p-5 md:p-8">
        <PromotedProductsRow />
        <TuckShopDashboard />
      </main>
    </>
  );
}
