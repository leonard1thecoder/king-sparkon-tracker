import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { TipCartWorkspace } from "@/components/tips/TipCartWorkspace";

export const metadata: Metadata = {
  title: "Tip Cart | User Dashboard",
  description: "Review unpaid worker tips added from QR scans and pay them through the secure PayFast handoff.",
};

export default function UserTipCartPage() {
  return (
    <RouteSectionPage
      role="USER WORKSPACE"
      title="Tip cart"
      description="Scan a worker QR, set an amount, submit it to the tip cart, and pay here."
    >
      <TipCartWorkspace />
    </RouteSectionPage>
  );
}
