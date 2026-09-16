import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { WorkerTipQrScanner } from "@/components/tips/WorkerTipQrScanner";

export default function UserTipWorkerScanPage() {
  return (
    <RouteSectionPage
      role="USER WORKSPACE"
      title="Tip a worker"
      description="Scan a worker QR code, confirm the worker, then continue into the worker tip payment flow."
    >
      <WorkerTipQrScanner />
    </RouteSectionPage>
  );
}
