"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { listWorkerOnlinePurchases } from "@/lib/api/tuck-shop";
import {
  MOCK_WORKER_ONLINE_PURCHASES_EVENT,
  onlinePurchasedBarcodesRequired,
  withMockWorkerOnlinePurchases,
} from "@/lib/mock/worker-online-purchases";

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function WorkerOnlineBarcodeHeaderAction() {
  const [required, setRequired] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refreshRequiredCount() {
      try {
        const liveOrders = await listWorkerOnlinePurchases();
        const allOrders = withMockWorkerOnlinePurchases(Array.isArray(liveOrders) ? liveOrders : []);
        if (active) setRequired(onlinePurchasedBarcodesRequired(allOrders));
      } catch {
        if (active) setRequired(onlinePurchasedBarcodesRequired(withMockWorkerOnlinePurchases([])));
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
    window.addEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshFromWorkerActivity);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshFromWorkerActivity);
      window.removeEventListener("storage", refreshFromWorkerActivity);
      window.removeEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshFromWorkerActivity);
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
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--signal)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--signal)] hover:text-white"
    >
      {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <PackageSearch className="h-4.5 w-4.5" />}
      <span
        className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-orange-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
        aria-hidden="true"
      >
        {loading ? "…" : countLabel(required)}
      </span>
      <span className="sr-only" aria-live="polite">{title}</span>
    </Link>
  );
}
