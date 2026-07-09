import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TuckShopCartDashboard } from "@/components/tuck-shop/TuckShopCartDashboard";

export default function UserTuckShopCartPage() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Cart" description="Review product and ticket cart items, confirm quantities, and checkout with Stripe from the user dashboard." />
      <main className="grid gap-6 p-5 md:p-8">
        <TuckShopCartDashboard />
      </main>
    </>
  );
}
