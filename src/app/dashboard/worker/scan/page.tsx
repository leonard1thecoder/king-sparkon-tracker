import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { WorkerTuckShopBarcodeCheckout } from "@/components/tuck-shop/WorkerTuckShopBarcodeCheckout";

export default function WorkerScanPage() {
  return (
    <RouteSectionPage role="WORKER" title="Scan terminal" description="Camera scanner for product barcodes, QR codes, and worker-assisted Tuck Shop barcode checkout." endpoint="GET /api/products/barcode/{barcode}">
      <BarcodeScanner />
      <WorkerTuckShopBarcodeCheckout />
    </RouteSectionPage>
  );
}
