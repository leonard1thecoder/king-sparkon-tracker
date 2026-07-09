import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TuckShopCartDashboard } from "@/components/tuck-shop/TuckShopCartDashboard";

export default function UserCartsPage() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="My carts" description="Open the active user cart. Purchased cart history is shown inside Profile with business and product details." />
      <main className="grid gap-6 p-5 md:p-8">
        <TuckShopCartDashboard />
      </main>
    </>
  );
}
