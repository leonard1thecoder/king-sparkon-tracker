import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function AdminScanLogsPage() {
  return <RouteSectionPage role="ADMIN" title="Scan logs" description="Review barcode and QR scan history, audit events, and platform verification activity." endpoint="GET /api/admin/scan-logs · GET /api/audit-logs" />;
}
