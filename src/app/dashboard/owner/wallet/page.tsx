import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KscWalletSection } from "@/components/ksc/KscWalletSection";

export const metadata: Metadata = {
  title: "KSC Wallet",
  description: "Business KSC wallet: balance, top-ups, payments and AI spending mandates. Separate from ZAR earnings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerWalletPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="KSC Wallet" description="Business coin balance alongside — never mixed with — ZAR earnings." />
      <main className="page-main">
        <KscWalletSection
          title="Business KSC Wallet"
          description="Coin for AI/MCP payments and King Sparkon services. Your ZAR business earnings stay untouched in Withdrawals."
        />
      </main>
    </>
  );
}
