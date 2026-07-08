import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliateTipsPage() {
  return <RouteSectionPage role="AFFILIATE" title="Tip activity" description="Affiliate-facing view for tip-related referral activity when backend exposes affiliate tip records." endpoint="GET /api/affiliate/tips · GET /api/users/me" />;
}
