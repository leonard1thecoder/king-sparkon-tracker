import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerReportsPage() {
  return <RouteSectionPage role="OWNER" title="Reports" description="Inventory summary, alcohol/category report, and product movement report for business operations." endpoint="GET /api/reports/inventory-summary · GET /api/reports/alcohol · GET /api/reports/product-movement" />;
}
