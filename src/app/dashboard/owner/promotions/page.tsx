import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerPromotionsPage() {
  return <RouteSectionPage role="OWNER" title="Promotions" description="Quote audience count and bulk price, then create scheduled email, WhatsApp, or any-channel promotions with anti-crowding note." endpoint="GET /api/promotions/quote · POST /api/promotions · GET /api/promotions" />;
}
