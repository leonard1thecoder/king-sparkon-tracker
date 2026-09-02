"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, WandSparkles } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { getWorkerProductById } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { WorkerOnlinePurchaseCheckout } from "./WorkerOnlinePurchaseCheckout";
import { WorkerTuckShopBarcodeCheckout, type WorkerScannedProduct } from "./WorkerTuckShopBarcodeCheckout";

function productBarcode(product: Product) {
  return product.productBarcode?.trim() || "";
}

const STORAGE_KEY = "workerPendingCheckoutLines";

type PendingLine = {
  productId: number;
  productName: string;
  barcode: string;
  quantity: number;
  automaticBarcode: boolean;
  unitPrice: number;
};

export function WorkerScanCheckoutWorkspace() {
  const searchParams = useSearchParams();
  const [scannedProduct, setScannedProduct] = useState<WorkerScannedProduct | null>(null);
  const [lookupValue, setLookupValue] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Hydrate pending lines from localStorage + query params (quantity, barcode) for Sell product flow
  useEffect(() => {
    const productId = Number(searchParams.get("productId"));
    const quantity = Number(searchParams.get("quantity") ?? "1");
    const barcodeParam = searchParams.get("barcode");
    const automatic = searchParams.get("automatic") === "true";

    if (Number.isInteger(productId) && productId > 0) {
      let active = true;
      setLookupValue(`Product #${productId}`);
      setLookupError(null);
      void getWorkerProductById(productId)
        .then((product) => {
          if (!active) return;
          const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
          const barcode = automatic ? "" : (barcodeParam ?? productBarcode(product));
          const unitPrice = Number(product.salePrice ?? product.price ?? 0);
          setScannedProduct({
            token: `${Date.now()}-query-${product.id}-${qty}`,
            productId: product.id,
            productName: product.name,
            barcode,
            scannedValue: barcode || "AUTO-GENERATED",
            automaticBarcode: automatic,
            unitPrice,
          });
          // also push to pending storage for Quantity persistence
          if (typeof window !== "undefined") {
            try {
              const existing: PendingLine[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
              const next = [...existing];
              const idx = next.findIndex((l) => l.productId === product.id && l.automaticBarcode === automatic && l.barcode === barcode);
              if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
              else next.push({ productId: product.id, productName: product.name, barcode, quantity: qty, automaticBarcode: automatic, unitPrice });
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
          }
        })
        .catch((exception) => {
          if (active) setLookupError(normalizeApiError(exception).message);
        })
        .finally(() => {
          if (active) setLookupValue(null);
        });
      return () => {
        active = false;
      };
    }

    // If no query, hydrate from localStorage pending lines (first pending line as scannedProduct)
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: PendingLine[] = JSON.parse(raw);
          setPendingCount(parsed.length);
          if (parsed.length > 0 && !scannedProduct) {
            const first = parsed[0] as PendingLine;
            setScannedProduct({
              token: `${Date.now()}-pending-${first.productId}`,
              productId: first.productId,
              productName: first.productName,
              barcode: first.barcode,
              scannedValue: first.barcode || "AUTO-GENERATED",
              automaticBarcode: first.automaticBarcode,
              unitPrice: (first as unknown as { unitPrice?: number }).unitPrice,
            });
          }
        }
      } catch {}
    }
  }, [searchParams]);

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.2rem] border border-[var(--line)] bg-white p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
        <p className="font-black text-[var(--ink)]">Checkout is populated from products you sold on <span className="text-[var(--signal)]">/dashboard/worker/products</span>.</p>
        <p className="mt-1">Use <span className="font-black">Scan product</span> or <span className="font-black">Sell product</span> on the products page — scanner appears as a popup there. After choosing quantity, you are taken here where quantity, barcode, Product and product id are already filled in Worker Tuck Shop checkout below.</p>
        {pendingCount > 0 ? <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--signal-soft)] px-3 py-1 text-xs font-black text-[var(--signal)]">{pendingCount} pending product(s) from worker products</p> : null}
      </div>

      {lookupValue ? <p className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-4 text-sm font-black text-[var(--ink)]"><Loader2 className="h-4 w-4 animate-spin text-[var(--signal)]" /> Loading {lookupValue}</p> : null}
      {lookupError ? <p className="rounded-[1.2rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{lookupError}</p> : null}

      {scannedProduct ? (
        <p className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">
          {scannedProduct.automaticBarcode ? <WandSparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {scannedProduct.productName} was added to checkout {scannedProduct.automaticBarcode ? "without a physical scan" : "after barcode verification"}.
        </p>
      ) : null}

      <WorkerTuckShopBarcodeCheckout scannedProduct={scannedProduct} />
      <WorkerOnlinePurchaseCheckout />
    </div>
  );
}
