import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliatePerformancePage() {
  return <RouteSectionPage role="AFFILIATE" title="Performance" description="Referral metrics, promotion activity, conversion readiness, and backend-visible affiliate profile data." endpoint="GET /api/affiliate/performance · GET /api/users/me" />;
}
