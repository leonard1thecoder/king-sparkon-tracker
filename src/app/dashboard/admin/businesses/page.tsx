import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AdminBusinessesPage() {
  return <RouteSectionPage role="ADMIN" title="Businesses" description="Business plan, billing policy, worker limits, feature locks, and operational status oversight." endpoint="GET /api/admin/businesses" />;
}
