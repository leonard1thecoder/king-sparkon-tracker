import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Subscribers | King Sparkon",
  description: "View and manage platform subscribers.",
};

export default function AdminSubscribersPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Subscribers"
      description="View and manage registered platform subscribers. Use Bulk Import to add subscribers in bulk from a CSV file."
      endpoint="GET /api/admin/subscribers"
    />
  );
}
