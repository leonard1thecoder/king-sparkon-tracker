import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Tips & Withdrawals | King Sparkon Tracker",
  description: "Admin tips and withdrawals oversight shell for worker QR tips and payout reviews.",
};

export default function AdminTipsPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Tips & Withdrawals"
      description="Platform oversight for worker tip QR links, gross amount, service fee, net payout, owner approval state, and withdrawal history."
      endpoint="GET /api/tips?status=PAID"
    />
  );
}
