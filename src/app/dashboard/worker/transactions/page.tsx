import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function WorkerTransactionsPage() {
  return <RouteSectionPage role="WORKER" title="Transactions" description="Create multi-product BUY or SELL checkout with paymentType, paymentEmail, paymentContact, and returned payment link details." endpoint="POST /api/transactions · GET /api/transactions" />;
}
