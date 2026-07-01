import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Owner Capacity | King Sparkon Tracker",
  description: "Owner capacity dashboard shell for products, workers, tickets, jobs, tips, promotions, and reports.",
};

export default function OwnerCapacityPage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="Business capacity"
      description="View operating capacity across products, stock, barcodes, workers, ticket classes, job opportunities, applications, tips, promotions, and reports."
      endpoint="GET /api/owner/capacity"
    />
  );
}
