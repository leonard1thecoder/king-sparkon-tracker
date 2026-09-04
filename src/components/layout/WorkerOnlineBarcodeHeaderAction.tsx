"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { listWorkerOnlinePurchases, type OnlineTuckShopPurchase } from "@/lib/api/tuck-shop";

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
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

export function WorkerOnlineBarcodeHeaderAction() {
  const [required, setRequired] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refreshRequiredCount() {
      try {
        const liveOrders = await listWorkerOnlinePurchases();
        if (active) setRequired(onlinePurchasedBarcodesRequired(Array.isArray(liveOrders) ? liveOrders : []));
      } catch {
        if (active) setRequired(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    function refreshFromWorkerActivity() {
      void refreshRequiredCount();
    }

    void refreshRequiredCount();
    const intervalId = window.setInterval(refreshFromWorkerActivity, 30_000);
    window.addEventListener("focus", refreshFromWorkerActivity);
    window.addEventListener("storage", refreshFromWorkerActivity);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshFromWorkerActivity);
      window.removeEventListener("storage", refreshFromWorkerActivity);
    };
  }, []);

  const title = loading
    ? "Loading paid online products requiring barcodes"
    : `${required} paid online product unit${required === 1 ? "" : "s"} need barcode assignment`;

  return (
    <Link
      href="/dashboard/worker/scan"
      aria-label={title}
      title={title}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--signal)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white"
    >
      {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <PackageSearch className="h-4.5 w-4.5" />}
      <span
        className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
        aria-hidden="true"
      >
        {loading ? "…" : countLabel(required)}
      </span>
      <span className="sr-only" aria-live="polite">{title}</span>
    </Link>
  );
}
