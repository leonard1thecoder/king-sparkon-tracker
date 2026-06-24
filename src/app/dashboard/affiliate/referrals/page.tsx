import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliateReferralsPage() {
  return <RouteSectionPage role="AFFILIATE" title="Referrals" description="Show referral code, promotion URL, QR preview, copy action, and referred business records." endpoint="GET /api/affiliate/referrals · GET /api/users/me" />;
}
