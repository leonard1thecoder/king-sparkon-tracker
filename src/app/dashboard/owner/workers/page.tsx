import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerWorkersPage() {
  return <RouteSectionPage role="OWNER" title="Workers" description="Create, list, and remove workers with plan-limit locked states from backend billing policy." endpoint="GET /api/users · POST /api/users/workers · DELETE /api/users/workers/{id}" />;
}
