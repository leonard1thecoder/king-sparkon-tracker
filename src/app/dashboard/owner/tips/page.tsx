import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { OwnerTipsWorkspace } from "@/components/tips/OwnerTipsWorkspace";

export default function OwnerTipsPage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="Tips & PayPal"
      description="Review business worker tips and move the unified owner balance through PayPal payouts."
    >
      <OwnerTipsWorkspace />
    </RouteSectionPage>
  );
}
