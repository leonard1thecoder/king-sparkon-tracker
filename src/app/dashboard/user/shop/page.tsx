import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";

export default function Page() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Buy products" description="Browse business catalogues, follow job alerts, add quantities, and checkout from the user dashboard." />
      <main className="page-main">
        <TuckShopDashboard />
      </main>
    </>
  );
}
