import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Reports | King Sparkon Tracker",
  description: "Admin reporting shell for platform health, revenue, scans, tickets, jobs, and users.",
};

export default function AdminReportsPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Reports"
      description="Platform reports for barcode scans, ticket revenue, job opportunity activity, applications, affiliate performance, users, businesses, and payout movement."
      endpoint="GET /api/admin/reports/overview"
    />
  );
}
