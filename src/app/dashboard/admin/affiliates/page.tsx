import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Affiliates | King Sparkon Tracker",
  description: "Admin affiliate oversight shell for referral links, commissions, and payout state.",
};

export default function AdminAffiliatesPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Affiliates"
      description="Platform affiliate oversight for referral codes, QR links, commission rules, marketing assets, payout eligibility, and promoter performance."
      endpoint="GET /api/admin/affiliates"
    />
  );
}
