"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, History, Loader2, QrCode, RefreshCw, ShoppingBag, ShoppingCart, Store, X } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  listMyTuckShopPurchases,
  verifyTuckShopCollection,
  type OnlineTuckShopPurchase,
} from "@/lib/api/tuck-shop";
import {
  money,
  readTuckShopPurchaseHistory,
  type TuckShopPurchaseHistoryItem,
} from "@/lib/tuck-shop/cart";

const PURCHASES_PER_PAGE = 5;

type PurchaseView = {
  id: string;
  transactionId?: number;
  createdAt: string;
  businessId?: number | null;
  businessName?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  productTotal: number;
  items: Array<{
    productId: number;
    productName: string;
    productImageUrl?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    barcodes?: string[];
  }>;
  fulfilmentStatus: string;
  barcodesRequired: number;
  source: "LIVE" | "MOCK";
};

function fromLive(purchase: OnlineTuckShopPurchase): PurchaseView {
  return {
    id: `live-${purchase.transactionId}`,
    transactionId: purchase.transactionId,
    createdAt: purchase.createdAt ?? new Date().toISOString(),
    businessId: purchase.businessId,
    businessName: purchase.businessName,
    paymentStatus: purchase.paymentStatus,
    paymentReference: purchase.paymentReference,
    productTotal: Number(purchase.productTotal ?? 0),
    items: (purchase.items ?? []).map((item) => ({ ...item, barcodes: item.barcodes ?? [] })),
    fulfilmentStatus: String(purchase.fulfilmentStatus ?? "AWAITING_BARCODE_ASSIGNMENT"),
    barcodesRequired: Math.max(Number(purchase.barcodesRequired ?? 0), 0),
    source: "LIVE",
  };
}

function fromMock(purchase: TuckShopPurchaseHistoryItem): PurchaseView {
  return {
    ...purchase,
    id: `mock-${purchase.id}`,
    fulfilmentStatus: "MOCK_PENDING",
    barcodesRequired: purchase.items.reduce((sum, item) => sum + Math.max(Number(item.quantity ?? 0), 0), 0),
    source: "MOCK",
  };
}

function statusTone(status?: string | null) {
  const value = String(status ?? "MOCK_PENDING").toUpperCase();
  if (["COLLECTED", "READY_FOR_COLLECTION"].includes(value)) return "confirm" as const;
  if (["AWAITING_BARCODE_ASSIGNMENT", "MOCK_PENDING", "PENDING", "PROCESSING", "CREATED"].includes(value)) return "signal" as const;
  return "neutral" as const;
}

function statusLabel(status: string) {
  if (status === "READY_FOR_COLLECTION") return "READY FOR COLLECTION";
  if (status === "AWAITING_BARCODE_ASSIGNMENT") return "AWAITING BARCODES";
  if (status === "MOCK_PENDING") return "MOCK_PENDING";
  return status.replaceAll("_", " ");
}

export function UserCartPurchaseHistory() {
  const scanLockRef = useRef(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseView[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refreshPurchaseHistory() {
    setLoading(true);
    setError(null);
    try {
      const livePurchases = await listMyTuckShopPurchases();
      const liveViews = (Array.isArray(livePurchases) ? livePurchases : []).map(fromLive);
      const liveTransactionIds = new Set(liveViews.map((purchase) => purchase.transactionId).filter(Boolean));
      const mockViews = readTuckShopPurchaseHistory()
        .filter((purchase) => !purchase.transactionId || !liveTransactionIds.has(purchase.transactionId))
        .map(fromMock);
      setPurchaseHistory([...liveViews, ...mockViews].sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
    } catch (exception) {
      setPurchaseHistory(readTuckShopPurchaseHistory().map(fromMock));
      setError(`Live collection status is unavailable. Showing saved mock carts: ${normalizeApiError(exception).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshPurchaseHistory();

    function refreshSavedHistory() {
      void refreshPurchaseHistory();
    }

    window.addEventListener("storage", refreshSavedHistory);
    window.addEventListener("king-sparkon:tuck-shop-purchase-history", refreshSavedHistory);
    return () => {
      window.removeEventListener("storage", refreshSavedHistory);
      window.removeEventListener("king-sparkon:tuck-shop-purchase-history", refreshSavedHistory);
    };
  }, []);

  const totalSpent = useMemo(
    () => purchaseHistory.reduce((total, purchase) => total + Number(purchase.productTotal ?? 0), 0),
    [purchaseHistory],
  );
  const businessCount = useMemo(
    () => new Set(purchaseHistory.map((purchase) => purchase.businessName ?? purchase.businessId ?? "Unknown business")).size,
    [purchaseHistory],
  );
  const collectedCount = useMemo(
    () => purchaseHistory.filter((purchase) => purchase.fulfilmentStatus === "COLLECTED").length,
    [purchaseHistory],
  );
  const totalPages = Math.max(1, Math.ceil(purchaseHistory.length / PURCHASES_PER_PAGE));
  const visiblePurchases = useMemo(
    () => purchaseHistory.slice(page * PURCHASES_PER_PAGE, page * PURCHASES_PER_PAGE + PURCHASES_PER_PAGE),
    [page, purchaseHistory],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(totalPages - 1, 0)));
  }, [totalPages]);

  async function verifyCollection(purchase: PurchaseView, qrValue: string) {
    if (scanLockRef.current) return;
    const value = qrValue.trim();
    if (!value) return;

    scanLockRef.current = true;
    setVerifying(true);
    setError(null);
    setSuccess(null);
    try {
      if (purchase.source === "MOCK") {
        if (!value.startsWith("KST-COLLECT:")) {
          throw new Error("Scan a King Sparkon collection QR beginning with KST-COLLECT.");
        }
        setPurchaseHistory((current) => current.map((item) => item.id === purchase.id ? { ...item, fulfilmentStatus: "COLLECTED", barcodesRequired: 0 } : item));
        setSuccess(`Mock cart #${purchase.transactionId ?? purchase.id} collected in preview mode.`);
      } else {
        const updated = await verifyTuckShopCollection(value);
        setPurchaseHistory((current) => current.map((item) => item.transactionId === updated.transactionId ? fromLive(updated) : item));
        setSuccess(`Cart #${updated.transactionId} verified and marked COLLECTED.`);
      }
      setActiveCollectionId(null);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setVerifying(false);
      window.setTimeout(() => {
        scanLockRef.current = false;
      }, 700);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Purchased carts" value={loading ? "..." : String(purchaseHistory.length)} detail="Saved and live product orders" tone="signal" icon={<ShoppingCart className="h-5 w-5" />} />
        <MetricCard label="Businesses" value={loading ? "..." : String(businessCount)} detail="Businesses purchased from" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Collected" value={loading ? "..." : String(collectedCount)} detail="Verified handovers" tone="confirm" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Total spent" value={loading ? "..." : money(totalSpent)} detail="Saved product purchase value" tone="confirm" icon={<History className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>My carts and collections</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
              Paid product carts wait for worker barcode assignment. When an order is ready, select Collect and scan the QR displayed by the worker. Only your authenticated account can complete the handover.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="quiet" disabled={loading} onClick={() => void refreshPurchaseHistory()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
            <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
              Open active cart <ShoppingCart className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {loading ? (
            <div className="flex min-h-44 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading cart collection status</div>
          ) : purchaseHistory.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-xl font-black text-[var(--ink)]">No purchased carts yet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Completed product checkouts will appear here with payment, barcode preparation, collection and totals.</p>
              <Link href="/dashboard/user/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">Buy products</Link>
            </div>
          ) : (
            <>
              {visiblePurchases.map((purchase) => {
                const canCollect = purchase.fulfilmentStatus === "READY_FOR_COLLECTION" || purchase.fulfilmentStatus === "MOCK_PENDING";
                const scannerOpen = activeCollectionId === purchase.id;
                return (
                  <article key={purchase.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                    <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{purchase.businessName ?? `Business #${purchase.businessId ?? "-"}`}</p>
                        <h3 className="mt-1 text-xl font-black text-[var(--ink)]">Cart #{purchase.transactionId ?? purchase.id}</h3>
                        <p className="mt-1 text-xs font-bold text-[var(--steel)]">{new Date(purchase.createdAt).toLocaleString("en-ZA")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusPill label={statusLabel(purchase.fulfilmentStatus)} tone={statusTone(purchase.fulfilmentStatus)} />
                        <p className="money text-2xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 p-4">
                      {purchase.items.map((item) => (
                        <div key={`${purchase.id}-${item.productId}`} className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black text-[var(--ink)]">{item.productName}</p>
                            <p className="text-xs font-bold text-[var(--steel)]">Qty {item.quantity} · {money(item.unitPrice)} each · {item.barcodes?.length ?? 0} barcode{(item.barcodes?.length ?? 0) === 1 ? "" : "s"} assigned</p>
                          </div>
                          <p className="money font-black text-[var(--ink)]">{money(item.lineTotal)}</p>
                        </div>
                      ))}

                      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Collection preparation</p>
                          <p className="mt-1 text-sm font-black text-[var(--ink)]">{purchase.barcodesRequired} barcode{purchase.barcodesRequired === 1 ? "" : "s"} still required</p>
                          {purchase.paymentReference ? <p className="code mt-1 break-all text-xs font-bold text-[var(--muted)]">Reference: {purchase.paymentReference}</p> : null}
                        </div>

                        {purchase.fulfilmentStatus === "COLLECTED" ? (
                          <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white"><CheckCircle2 className="h-4 w-4" /> COLLECTED</span>
                        ) : canCollect ? (
                          <button type="button" onClick={() => setActiveCollectionId(scannerOpen ? null : purchase.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                            {scannerOpen ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4" />} {scannerOpen ? "Close scanner" : "Collect"}
                          </button>
                        ) : (
                          <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-black text-[var(--steel)]">Worker preparing barcodes</span>
                        )}
                      </div>

                      {scannerOpen ? (
                        <div className="grid gap-3 rounded-[1.3rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-4">
                          <div>
                            <p className="text-lg font-black text-[var(--ink)]">Scan the worker cart QR</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-[var(--steel)]">The worker must display Verify cart after every purchased unit has a barcode. Scanning that QR marks this order COLLECTED.</p>
                          </div>
                          {verifying ? <p className="inline-flex items-center gap-2 text-sm font-black text-[var(--signal)]"><Loader2 className="h-4 w-4 animate-spin" /> Verifying cart collection</p> : null}
                          <BarcodeScanner onScan={(value) => void verifyCollection(purchase, value)} compact hideIdleResult />
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-4 sm:flex-row">
                <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-35 sm:w-auto"><ChevronLeft className="h-4 w-4" /> Previous</button>
                <p className="text-sm font-black text-[var(--ink)]">Page {page + 1} of {totalPages} · Up to {PURCHASES_PER_PAGE} carts</p>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white hover:bg-[var(--signal)] disabled:opacity-35 sm:w-auto">Next <ChevronRight className="h-4 w-4" /></button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
