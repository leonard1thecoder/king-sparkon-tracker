import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";

export default function Page() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Buy products" description="Browse businesses, follow job alerts, view product details, add quantities, and checkout from the user dashboard." />
      <main className="grid gap-6 p-5 md:p-8">
        <TuckShopDashboard />
      </main>
    </>
  );
}
