"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { normalizeApiError } from "@/lib/api/client";
import { getWorkerProductByBarcode } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { WorkerOnlinePurchaseCheckout } from "./WorkerOnlinePurchaseCheckout";
import { WorkerTuckShopBarcodeCheckout, type WorkerScannedProduct } from "./WorkerTuckShopBarcodeCheckout";

function productBarcode(product: Product, scannedValue: string) {
  return product.productBarcode?.trim() || scannedValue.trim();
}

export function WorkerScanCheckoutWorkspace() {
  const [scannedProduct, setScannedProduct] = useState<WorkerScannedProduct | null>(null);
  const [lookupValue, setLookupValue] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleProductScan(value: string) {
    const scannedValue = value.trim();
    if (!scannedValue) return;

    setLookupValue(scannedValue);
    setLookupError(null);
    try {
      const product = await getWorkerProductByBarcode(scannedValue);
      setScannedProduct({
        token: `${Date.now()}-${scannedValue}`,
        productId: product.id,
        productName: product.name,
        barcode: productBarcode(product, scannedValue),
        scannedValue,
      });
    } catch (exception) {
      setLookupError(normalizeApiError(exception).message);
    } finally {
      setLookupValue(null);
    }
  }

  return (
    <div className="grid gap-6">
      <BarcodeScanner onScan={(value) => void handleProductScan(value)} />

      {lookupValue ? (
        <p className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-4 text-sm font-black text-[var(--ink)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--signal)]" /> Verifying product barcode {lookupValue}
        </p>
      ) : null}

      {lookupError ? (
        <p className="rounded-[1.2rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{lookupError}</p>
      ) : null}

      {scannedProduct ? (
        <p className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">
          <CheckCircle2 className="h-4 w-4" /> {scannedProduct.productName} was verified and added to the worker checkout.
        </p>
      ) : (
        <p className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white p-4 text-sm font-bold text-[var(--steel)]">
          <ScanLine className="h-4 w-4 text-[var(--signal)]" /> Scan or verify a product manually to fill the checkout below.
        </p>
      )}

      <WorkerTuckShopBarcodeCheckout scannedProduct={scannedProduct} />
      <WorkerOnlinePurchaseCheckout />
    </div>
  );
}
