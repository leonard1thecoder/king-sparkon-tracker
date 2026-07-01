import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Audit Logs | King Sparkon Tracker",
  description: "Admin audit trail shell for barcode, auth, ticket, job, payout, and role events.",
};

export default function AdminAuditLogsPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Audit Logs"
      description="Reviewable platform event stream for login, role routing, barcode scans, ticket verification, job changes, application updates, payouts, and admin actions."
      endpoint="GET /api/admin/audit-logs"
    />
  );
}
