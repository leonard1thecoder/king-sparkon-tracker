import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerProductsPage() {
  return <RouteSectionPage role="OWNER" title="Products" description="Create, update, stock, barcode capacity, and approval state for business products." endpoint="GET/POST /api/products" />;
}
