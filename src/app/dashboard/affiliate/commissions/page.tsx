import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliateCommissionsPage() {
  return <RouteSectionPage role="AFFILIATE" title="Commissions" description="Commission summary, referred subscription value, status, and source-of-truth payout state from backend records." endpoint="GET /api/affiliate/commissions · GET /api/users/me" />;
}
