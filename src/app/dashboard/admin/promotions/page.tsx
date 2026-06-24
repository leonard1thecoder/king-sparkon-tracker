import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AdminPromotionsPage() {
  return <RouteSectionPage role="ADMIN" title="Platform promotions" description="Create registered-subscriber campaign records with target count, bulk price, channel, audience, and delivery spacing note." endpoint="POST /api/admin/promotions/registered-subscribers" />;
}
