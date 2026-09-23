import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { ComputerCareTabs } from "@/components/computer-care/ComputerCareTabs";

export const metadata: Metadata = {
  title: "NM Computer Care",
  description: "Browse Basic Care, Performance Care and Business Care service plans with live quotes and lifecycle statuses.",
};

export default function OwnerComputerCarePage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="NM Computer Care"
      description="Service plans for computers and business devices. Pick a care type to list live plans, filter by lifecycle status, and review quoted totals."
      endpoint="GET /api/v1/basic-care-plans · /api/v1/performance-care-plans · /api/v1/business-care-plans"
    >
      <ComputerCareTabs />
    </RouteSectionPage>
  );
}
