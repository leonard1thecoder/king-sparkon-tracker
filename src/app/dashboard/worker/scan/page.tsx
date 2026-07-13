import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { WorkerScanCheckoutWorkspace } from "@/components/tuck-shop/WorkerScanCheckoutWorkspace";

export default function WorkerScanPage() {
  return (
    <RouteSectionPage
      role="WORKER"
      title="Scan terminal"
      description="Verify products, fill the worker checkout automatically, create counter payments, and prepare paid online carts for collection."
      endpoint="GET /api/products/barcode/{barcode}"
    >
      <WorkerScanCheckoutWorkspace />
    </RouteSectionPage>
  );
}
