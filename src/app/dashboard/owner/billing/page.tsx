import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerBillingPage() {
  return <RouteSectionPage role="OWNER" title="Billing" description="Plan list, current business billing state, checkout handoff, subscription activation, and Pro feature locks." endpoint="GET /api/billing/plans · GET /api/billing/dashboard" />;
}
