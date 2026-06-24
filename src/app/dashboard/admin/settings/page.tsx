import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AdminSettingsPage() {
  return <RouteSectionPage role="ADMIN" title="Settings" description="Platform settings, role policy notes, registered-subscriber promotion controls, and operational configuration." endpoint="GET /api/users/me" />;
}
