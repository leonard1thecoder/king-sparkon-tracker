import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AffiliateOnboardingPage() {
  return <RouteSectionPage role="AFFILIATE" title="Onboarding" description="Complete affiliate payout and promotion profile details before referral campaigns go live." endpoint="POST /api/affiliate/onboarding" />;
}
