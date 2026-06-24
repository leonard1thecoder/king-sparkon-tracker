import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function WorkerProfilePage() {
  return <RouteSectionPage role="WORKER" title="Profile" description="Worker profile, business assignment, email verification state, tip QR eligibility, and session metadata." endpoint="GET /api/users/me" />;
}
