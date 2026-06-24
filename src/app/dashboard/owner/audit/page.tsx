import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function OwnerAuditPage() {
  return <RouteSectionPage role="OWNER" title="Audit logs" description="Review business-scoped product, barcode, transaction, worker, billing, and promotion activity." endpoint="GET /api/audit-logs" />;
}
