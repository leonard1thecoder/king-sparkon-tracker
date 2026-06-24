import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerTransactionsPage() {
  return <RouteSectionPage role="OWNER" title="Transactions" description="Multi-line BUY and SELL checkout with payment type, payment contact, payment URL, status, and reference visibility." endpoint="GET/POST /api/transactions" />;
}
