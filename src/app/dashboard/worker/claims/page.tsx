import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function WorkerClaimsPage() {
  return <RouteSectionPage role="WORKER" title="Claims" description="Lookup returnable references using referenceEmail and submit customer claim records against barcode or reference routes." endpoint="GET /api/barcodes/reference/{reference} · POST /api/barcodes/{id}/claim" />;
}
