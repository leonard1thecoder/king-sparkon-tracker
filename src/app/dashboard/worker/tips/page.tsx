import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function WorkerTipsPage() {
  return <RouteSectionPage role="WORKER" title="Tip QR and link" description="Create a worker tip payment request with callbackUrl and clientContact, then show paymentUrl and QR code URL from the backend." endpoint="POST /api/tips" />;
}
