"use client";

import { useEffect, useRef, useState } from "react";
import { Barcode, CheckCircle2, FlaskConical, Loader2, PackageCheck, QrCode, RefreshCw, ScanLine, ShoppingBag, X } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  assignOnlinePurchaseBarcode,
  listWorkerOnlinePurchases,
  type OnlineTuckShopPurchase,
} from "@/lib/api/tuck-shop";
import {
  assignMockWorkerOnlinePurchaseBarcode,
  isMockWorkerOnlinePurchase,
  MOCK_WORKER_ONLINE_PURCHASES_EVENT,
  withMockWorkerOnlinePurchases,
} from "@/lib/mock/worker-online-purchases";

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function statusLabel(order: OnlineTuckShopPurchase) {
  if (order.fulfilmentStatus === "READY_FOR_COLLECTION") return "READY FOR COLLECTION";
  if (order.fulfilmentStatus === "COLLECTED") return "COLLECTED";
  return `${Math.max(Number(order.barcodesRequired ?? 0), 0)} BARCODES REQUIRED`;
}

function statusTone(order: OnlineTuckShopPurchase) {
  return order.fulfilmentStatus === "READY_FOR_COLLECTION" || order.fulfilmentStatus === "COLLECTED"
    ? "confirm" as const
    : "signal" as const;
}

function orderReference(order: OnlineTuckShopPurchase) {
  return isMockWorkerOnlinePurchase(order)
    ? `DEMO-${Math.abs(order.transactionId)}`
    : String(order.transactionId);
}

type ActiveAssignment = {
  transactionId: number;
  productId: number;
  productName: string;
};

export function WorkerOnlinePurchaseCheckout() {
  const scanLockRef = useRef(false);
  const [orders, setOrders] = useState<OnlineTuckShopPurchase[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null);
  const [visibleQrOrderId, setVisibleQrOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const response = await listWorkerOnlinePurchases();
      setOrders(withMockWorkerOnlinePurchases(Array.isArray(response) ? response : []));
    } catch (exception) {
      setOrders(withMockWorkerOnlinePurchases([]));
      setError(`Live paid carts are unavailable. Demo paid carts remain ready for testing: ${normalizeApiError(exception).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();

    function refreshMockOrders() {
      setOrders((current) => withMockWorkerOnlinePurchases(current.filter((order) => !isMockWorkerOnlinePurchase(order))));
    }

    window.addEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockOrders);
    return () => window.removeEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockOrders);
  }, []);

  async function assignBarcode(scannedValue: string) {
    if (!activeAssignment || scanLockRef.current) return;
    const barcode = scannedValue.trim();
    if (!barcode) return;

    const selectedOrder = orders.find((order) => order.transactionId === activeAssignment.transactionId);
    if (!selectedOrder) {
      setError("The selected paid cart is no longer available.");
      return;
    }

    scanLockRef.current = true;
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = isMockWorkerOnlinePurchase(selectedOrder)
        ? assignMockWorkerOnlinePurchaseBarcode(
            activeAssignment.transactionId,
            activeAssignment.productId,
            barcode,
          )
        : await assignOnlinePurchaseBarcode(
            activeAssignment.transactionId,
            activeAssignment.productId,
            barcode,
          );

      setOrders((current) => current.map((order) => order.transactionId === updated.transactionId ? updated : order));

      const updatedLine = updated.items.find((item) => item.productId === activeAssignment.productId);
      const lineRemaining = Math.max(Number(updatedLine?.quantity ?? 0) - Number(updatedLine?.barcodes?.length ?? 0), 0);
      if (updated.fulfilmentStatus === "READY_FOR_COLLECTION") {
        setSuccess(`${isMockWorkerOnlinePurchase(updated) ? "Demo cart" : "Order"} #${orderReference(updated)} is fully prepared. Open Verify cart to show the collection QR.`);
        setActiveAssignment(null);
      } else {
        setSuccess(`Barcode assigned to ${activeAssignment.productName}. ${lineRemaining} still required for this product line.`);
      }
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setAssigning(false);
      window.setTimeout(() => {
        scanLockRef.current = false;
      }, 700);
    }
  }

  return (
    <Card className="border-[var(--gold)]/45 bg-white">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Online purchase worker checkout</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
            These product orders are already paid. Assign one physical barcode for every purchased unit, then display the collection QR so the authenticated customer can verify and collect the cart.
          </p>
        </div>
        <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadOrders()}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh orders
        </Button>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="flex items-start gap-3 rounded-[1.1rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4 text-sm font-bold leading-6 text-[var(--ink)]">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" />
          Demo paid carts are included for testing. Their barcode assignments are saved in this browser and never create real inventory transactions.
        </div>
        {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
        {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

        {loading ? (
          <div className="flex min-h-44 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading paid online purchases
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <p className="mt-3 text-xl font-black text-[var(--ink)]">No paid product carts need preparation.</p>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">New verified online purchases will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const demo = isMockWorkerOnlinePurchase(order);
              return (
                <article key={order.transactionId} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                  <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Paid online cart #{orderReference(order)}</p>
                        {demo ? <StatusPill label="DEMO PAID CART" tone="neutral" /> : null}
                      </div>
                      <h3 className="mt-1 text-xl font-black text-[var(--ink)]">{order.customerUsername ?? "Registered customer"} · {order.businessName ?? `Business #${order.businessId ?? "-"}`}</h3>
                      <p className="mt-1 text-xs font-bold text-[var(--steel)]">Quantity is already paid. Assign barcodes before collection.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill label={statusLabel(order)} tone={statusTone(order)} />
                      <p className="money text-2xl font-black text-[var(--ink)]">{money(order.productTotal)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-white text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Quantity</th>
                          <th className="px-4 py-3">Assigned</th>
                          <th className="px-4 py-3">Required</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => {
                          const assigned = Number(item.barcodes?.length ?? 0);
                          const required = Math.max(Number(item.quantity ?? 0) - assigned, 0);
                          const isActive = activeAssignment?.transactionId === order.transactionId && activeAssignment.productId === item.productId;
                          return (
                            <tr key={`${order.transactionId}-${item.productId}`} className="border-t border-[var(--line)]">
                              <td className="px-4 py-3"><p className="font-black text-[var(--ink)]">{item.productName}</p><p className="mt-1 font-mono text-[0.65rem] font-bold text-[var(--muted)]">Product #{item.productId}</p></td>
                              <td className="px-4 py-3 font-black text-[var(--ink)]">{item.quantity}</td>
                              <td className="px-4 py-3 font-black text-[var(--confirm)]">{assigned}</td>
                              <td className="px-4 py-3 font-black text-[var(--signal)]">{required}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setActiveAssignment(isActive ? null : { transactionId: order.transactionId, productId: item.productId, productName: item.productName })}
                                  disabled={required <= 0 || assigning}
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-white px-4 text-xs font-black text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--surface)] disabled:text-[var(--muted)]"
                                >
                                  {required <= 0 ? <PackageCheck className="h-4 w-4" /> : isActive ? <X className="h-4 w-4" /> : <Barcode className="h-4 w-4" />}
                                  {required <= 0 ? "Complete" : isActive ? "Close scanner" : `Add barcodes · ${required}`}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {activeAssignment?.transactionId === order.transactionId ? (
                    <div className="grid gap-3 border-t border-[var(--line)] bg-[var(--gold)]/10 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[var(--ink)]">Scan a physical barcode for {activeAssignment.productName}</p>
                          <p className="mt-1 text-xs font-semibold text-[var(--steel)]">A stock-unit code or the reusable product barcode is accepted. Each scan assigns one unique available unit.</p>
                        </div>
                        {assigning ? <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--signal)]"><Loader2 className="h-4 w-4 animate-spin" /> Assigning barcode</span> : null}
                      </div>
                      <BarcodeScanner onScan={(value) => void assignBarcode(value)} compact hideIdleResult />
                    </div>
                  ) : null}

                  {order.fulfilmentStatus === "READY_FOR_COLLECTION" ? (
                    <div className="border-t border-[var(--line)] p-4">
                      <button
                        type="button"
                        onClick={() => setVisibleQrOrderId((current) => current === order.transactionId ? null : order.transactionId)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]"
                      >
                        <QrCode className="h-4 w-4" /> {visibleQrOrderId === order.transactionId ? "Hide cart QR" : "Verify cart · show QR"}
                      </button>

                      {visibleQrOrderId === order.transactionId ? (
                        <div className="mt-4 grid gap-4 rounded-[1.4rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-5 md:grid-cols-[auto_1fr] md:items-center">
                          {order.collectionQrCodeUrl ? (
                            <img src={order.collectionQrCodeUrl} alt={`Collection QR for cart ${orderReference(order)}`} className="h-52 w-52 rounded-[1.2rem] border border-[var(--line)] bg-white p-2" />
                          ) : (
                            <div className="grid h-52 w-52 place-items-center rounded-[1.2rem] border border-dashed border-[var(--line)] bg-white"><QrCode className="h-14 w-14 text-[var(--signal)]" /></div>
                          )}
                          <div>
                            <p className="text-xl font-black text-[var(--ink)]">Customer collection verification</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Ask {order.customerUsername ?? "the customer"} to open My Carts, select Collect and scan this QR. The cart changes to COLLECTED only for the authenticated buyer.</p>
                            <p className="code mt-3 break-all rounded-[1rem] border border-[var(--line)] bg-white p-3 text-xs font-bold text-[var(--muted)]">{order.collectionQrCodeValue ?? "Collection QR is being prepared"}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
