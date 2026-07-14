import type { Metadata } from "next";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export const metadata: Metadata = {
  title: "Admin Products | King Sparkon Tracker",
  description: "Admin product oversight shell for barcode inventory and stock health.",
};

export default function AdminProductsPage() {
  return (
    <RouteSectionPage
      role="ADMIN"
      title="Products"
      description="Platform-wide product oversight for barcode allocation, stock status, category health, and suspicious inventory activity."
      endpoint="GET /api/products"
    />
  );
}
