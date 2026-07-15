import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { WorkerTipQrScanner } from "@/components/tips/WorkerTipQrScanner";

export const metadata: Metadata = {
  title: "Tip a Worker",
  description: "Scan a King Sparkon worker QR code and continue to the secure worker tip payment flow.",
};

export default function UserTipWorkerPage() {
  return (
    <RouteSectionPage
      role="USER WORKSPACE"
      title="Tip a worker"
      description="Scan a worker QR code, confirm the worker, review your tip history, and continue into the secure payment flow."
      endpoint="SCAN /tips/workers/{workerId} · POST /api/tips/workers/{workerId}/paypal/checkout"
    >
      <WorkerTipQrScanner />
    </RouteSectionPage>
  );
}
