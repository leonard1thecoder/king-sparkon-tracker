import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KscWalletSection } from "@/components/ksc/KscWalletSection";

export default function UserWalletPage() {
  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="KSC Wallet" description="King Sparkon Coin for AI payments and services — separate from any ZAR balances." />
      <main className="page-main">
        <KscWalletSection />
      </main>
    </>
  );
}
