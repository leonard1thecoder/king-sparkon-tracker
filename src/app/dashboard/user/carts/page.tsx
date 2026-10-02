import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { UserCartPurchaseHistory } from "@/components/tuck-shop/UserCartPurchaseHistory";

export default function UserCartsPage() {
  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="My carts"
        description="Review completed product carts and purchases. Open the active cart separately when you are ready to continue shopping or checkout."
      />
      <main className="page-main bg-[var(--surface)]">
        <UserCartPurchaseHistory />
      </main>
    </>
  );
}
