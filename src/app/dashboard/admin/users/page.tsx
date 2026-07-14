import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AdminUsersPage() {
  return <RouteSectionPage role="ADMIN" title="Users" description="Platform user oversight by role, verification state, business assignment, and account status." endpoint="GET /api/admin/users" />;
}
