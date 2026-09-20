import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { WorkerBrowser } from "@/components/tips/WorkerBrowser";
import { WorkerTipQrScanner } from "@/components/tips/WorkerTipQrScanner";

export const metadata: Metadata = {
  title: "Tip a Worker",
  description: "Find a King Sparkon worker by business or name, scan a worker QR code, and continue to the secure worker tip payment flow.",
};

export default function UserTipWorkerPage() {
  return (
    <RouteSectionPage
      role="USER WORKSPACE"
      title="Tip a worker"
      description="Find workers by business or name, scan a worker QR code, confirm the worker, review your tip history, and continue into the secure payment flow."
    >
      <div className="grid gap-6">
        <WorkerBrowser />
        <WorkerTipQrScanner />
      </div>
    </RouteSectionPage>
  );
}
