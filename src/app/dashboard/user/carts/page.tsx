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
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <UserCartPurchaseHistory />
      </main>
    </>
  );
}
