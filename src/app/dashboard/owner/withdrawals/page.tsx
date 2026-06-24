import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerWithdrawalsPage() {
  return <RouteSectionPage role="OWNER" title="Withdrawals" description="Request tip and transaction withdrawals. Backend validates hold days, minimums, configured fees, and payout status." endpoint="POST /api/tips/withdrawals · POST /api/transactions/withdrawals" />;
}
