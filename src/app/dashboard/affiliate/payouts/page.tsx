import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliatePayoutsPage() {
  return <RouteSectionPage role="AFFILIATE" title="Payouts" description="Payout history, requested settlement status, provider handoff state, and commission settlement records." endpoint="GET /api/affiliate/payouts · GET /api/users/me" />;
}
