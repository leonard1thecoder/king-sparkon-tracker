import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerTipsPage() {
  return <RouteSectionPage role="OWNER" title="Tips" description="Review worker tips, payment link state, gross amount, configured fee, net amount, and paid state." endpoint="GET /api/tips · PATCH /api/tips/{id}/paid" />;
}
