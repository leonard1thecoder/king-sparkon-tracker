"use client";

import { useEffect, useMemo, useState } from "react";
import { Barcode, Boxes, PackageSearch, Warehouse } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { listOwnerProducts, listWorkerOnlinePurchases } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import {
  MOCK_WORKER_ONLINE_PURCHASES_EVENT,
  onlinePurchasedBarcodesRequired,
  withMockWorkerOnlinePurchases,
} from "@/lib/mock/worker-online-purchases";

function barcodeRequired(product: Product) {
  const remaining = Number(product.remainingBarcodeSlots);
  if (Number.isFinite(remaining)) return Math.max(Math.trunc(remaining), 0);

  const stock = Math.max(Number(product.stockQuantity ?? 0), 0);
  const assigned = Math.max(Number(product.barcodeCount ?? product.barcodes?.length ?? 0), 0);
  return Math.max(Math.trunc(stock - assigned), 0);
}

export function WorkerProductMetrics() {
  const [products, setProducts] = useState<Product[]>([]);
  const [onlineRequired, setOnlineRequired] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadMetrics() {
    setLoading(true);

    const [productResult, onlineResult] = await Promise.allSettled([
      listOwnerProducts({ page: 0, size: 100 }),
      listWorkerOnlinePurchases(),
    ]);

    if (productResult.status === "fulfilled") {
      setProducts(productResult.value.content ?? []);
    }

    const liveOrders = onlineResult.status === "fulfilled" && Array.isArray(onlineResult.value)
      ? onlineResult.value
      : [];
    setOnlineRequired(onlinePurchasedBarcodesRequired(withMockWorkerOnlinePurchases(liveOrders)));
    setLoading(false);
  }

  useEffect(() => {
    void loadMetrics();

    function refreshMockRequirement() {
      void loadMetrics();
    }

    window.addEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockRequirement);
    return () => window.removeEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockRequirement);
  }, []);

  const totalUnits = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(Number(product.stockQuantity ?? 0), 0), 0),
    [products],
  );
  const requiredBarcodes = useMemo(
    () => products.reduce((sum, product) => sum + barcodeRequired(product), 0),
    [products],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Business products"
        value={loading ? "..." : String(products.length)}
        detail="Products assigned to your workplace"
        tone="confirm"
        icon={<Boxes className="h-5 w-5" />}
      />
      <MetricCard
        label="Barcodes required"
        value={loading ? "..." : String(requiredBarcodes)}
        detail="Stock units still needing barcodes"
        tone="signal"
        icon={<Barcode className="h-5 w-5" />}
      />
      <MetricCard
        label="Stock units"
        value={loading ? "..." : String(totalUnits)}
        detail="Current business stock"
        icon={<Warehouse className="h-5 w-5" />}
      />
      <MetricCard
        label="Online barcodes required"
        value={loading ? "..." : String(onlineRequired)}
        detail="Paid product units awaiting barcode assignment"
        tone="signal"
        icon={<PackageSearch className="h-5 w-5" />}
      />
    </div>
  );
}
