import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Capacity | King Sparkon Tracker",
  description: "Admin capacity dashboard shell for platform users, businesses, tickets, jobs, stock, tips, and promotions.",
};

export default function AdminCapacityPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="All platform capacity"
      description="View capacity across users, businesses, tickets, stock, workers, job opportunities, applications, promotions, tips, reports, and platform health."
      endpoint="GET /api/admin/capacity"
    />
  );
}
