import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerSettingsPage() {
  return <RouteSectionPage role="OWNER" title="Settings" description="Business profile, onboarding completion fields, localization, physical address, cellphone number, and feature state." endpoint="GET /api/users/me · POST /api/users/onboarding" />;
}
