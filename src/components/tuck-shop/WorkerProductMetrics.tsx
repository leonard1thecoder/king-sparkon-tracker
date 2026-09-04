"use client";

import { useEffect, useMemo, useState } from "react";
import { Barcode, Boxes, PackageSearch, Warehouse } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { listOwnerProducts, listWorkerOnlinePurchases } from "@/lib/api/tuck-shop";
import type { OnlineTuckShopPurchase } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";

function barcodeRequired(product: Product) {
  const remaining = Number(product.remainingBarcodeSlots);
  if (Number.isFinite(remaining)) return Math.max(Math.trunc(remaining), 0);

  const stock = Math.max(Number(product.stockQuantity ?? 0), 0);
  const assigned = Math.max(Number(product.barcodeCount ?? product.barcodes?.length ?? 0), 0);
  return Math.max(Math.trunc(stock - assigned), 0);
}

function onlinePurchasedBarcodesRequired(orders: OnlineTuckShopPurchase[]) {
  return orders.reduce((total, order) => {
    if (order.fulfilmentStatus === "COLLECTED") return total;
    const calculated = order.items.reduce(
      (sum, item) => sum + Math.max(Number(item.quantity ?? 0) - Number(item.barcodes?.length ?? 0), 0),
      0,
    );
    return total + Math.max(Number(order.barcodesRequired ?? calculated), calculated, 0);
  }, 0);
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
    setOnlineRequired(onlinePurchasedBarcodesRequired(liveOrders));
    setLoading(false);
  }

  useEffect(() => {
    void loadMetrics();
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
