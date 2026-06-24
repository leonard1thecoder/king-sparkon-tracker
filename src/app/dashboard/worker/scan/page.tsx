import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";

export default function WorkerScanPage() {
  return (
    <RouteSectionPage role="WORKER" title="Scan terminal" description="Camera scanner for product barcodes and QR codes with verification result card." endpoint="GET /api/products/barcode/{barcode}">
      <BarcodeScanner />
    </RouteSectionPage>
  );
}
