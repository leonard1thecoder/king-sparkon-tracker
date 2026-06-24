import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

export default function WorkerBarcodesPage() {
  return <RouteSectionPage role="WORKER" title="Barcode registry" description="Assign physical item barcodes to products, using referenceEmail naming for returnable customer references." endpoint="POST /api/products/{id}/barcodes · POST /api/products/{id}/submit-approval" />;
}
