"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Barcode, CheckCircle2, FlaskConical, Loader2, PackageCheck, QrCode, RefreshCw, ShoppingBag, WandSparkles, X } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  assignOnlinePurchaseBarcode,
  listProductBarcodeConfigurations,
  listWorkerOnlinePurchases,
  prepareAutomaticOnlinePurchaseBarcodes,
  type OnlineTuckShopPurchase,
  type ProductBarcodeConfiguration,
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
  return order.fulfilmentStatus === "READY_FOR_COLLECTION" || order.fulfilmentStatus === "COLLECTED" ? "confirm" as const : "signal" as const;
}

function orderReference(order: OnlineTuckShopPurchase) {
  return isMockWorkerOnlinePurchase(order) ? `DEMO-${Math.abs(order.transactionId)}` : String(order.transactionId);
}

type ActiveAssignment = { transactionId: number; productId: number; productName: string };

export function WorkerOnlinePurchaseCheckout() {
  const scanLockRef = useRef(false);
  const [orders, setOrders] = useState<OnlineTuckShopPurchase[]>([]);
  const [configurations, setConfigurations] = useState<ProductBarcodeConfiguration[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null);
  const [visibleQrOrderId, setVisibleQrOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configurationByProduct = useMemo(
    () => new Map(configurations.map((configuration) => [configuration.productId, configuration])),
    [configurations],
  );

  async function loadOrders() {
    setLoading(true);
    setError(null);
    const [orderResult, configurationResult] = await Promise.allSettled([
      listWorkerOnlinePurchases(),
      listProductBarcodeConfigurations(),
    ]);

    const liveOrders = orderResult.status === "fulfilled" && Array.isArray(orderResult.value) ? orderResult.value : [];
    setOrders(withMockWorkerOnlinePurchases(liveOrders));
    setConfigurations(configurationResult.status === "fulfilled" ? configurationResult.value : []);
    if (orderResult.status === "rejected") {
      setError(`Live paid carts are unavailable. Demo paid carts remain ready for testing: ${normalizeApiError(orderResult.reason).message}`);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadOrders();
    function refreshMockOrders() {
      setOrders((current) => withMockWorkerOnlinePurchases(current.filter((order) => !isMockWorkerOnlinePurchase(order))));
    }
    window.addEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockOrders);
    return () => window.removeEventListener(MOCK_WORKER_ONLINE_PURCHASES_EVENT, refreshMockOrders);
  }, []);

  function applyUpdatedOrder(updated: OnlineTuckShopPurchase, productName: string, productId: number) {
    setOrders((current) => current.map((order) => order.transactionId === updated.transactionId ? updated : order));
    const updatedLine = updated.items.find((item) => item.productId === productId);
    const lineRemaining = Math.max(Number(updatedLine?.quantity ?? 0) - Number(updatedLine?.barcodes?.length ?? 0), 0);
    if (updated.fulfilmentStatus === "READY_FOR_COLLECTION") {
      setSuccess(`${isMockWorkerOnlinePurchase(updated) ? "Demo cart" : "Order"} #${orderReference(updated)} is ready for collection. Verify cart is now available.`);
      setActiveAssignment(null);
    } else {
      setSuccess(`${productName} still needs ${lineRemaining} barcode${lineRemaining === 1 ? "" : "s"}.`);
    }
  }

  async function assignBarcode(scannedValue: string) {
    if (!activeAssignment || scanLockRef.current) return;
    const barcode = scannedValue.trim();
    if (!barcode) return;
    const selectedOrder = orders.find((order) => order.transactionId === activeAssignment.transactionId);
    if (!selectedOrder) return setError("The selected paid cart is no longer available.");

    scanLockRef.current = true;
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = isMockWorkerOnlinePurchase(selectedOrder)
        ? assignMockWorkerOnlinePurchaseBarcode(activeAssignment.transactionId, activeAssignment.productId, barcode)
        : await assignOnlinePurchaseBarcode(activeAssignment.transactionId, activeAssignment.productId, barcode);
      applyUpdatedOrder(updated, activeAssignment.productName, activeAssignment.productId);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setAssigning(false);
      window.setTimeout(() => { scanLockRef.current = false; }, 700);
    }
  }

  async function prepareAutomatically(order: OnlineTuckShopPurchase, productId: number, productName: string, required: number) {
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      let updated = order;
      if (isMockWorkerOnlinePurchase(order)) {
        for (let index = 0; index < required; index++) {
          updated = assignMockWorkerOnlinePurchaseBarcode(order.transactionId, productId, `AUTO-${index + 1}`);
        }
      } else {
        updated = await prepareAutomaticOnlinePurchaseBarcodes(order.transactionId, productId);
      }
      applyUpdatedOrder(updated, productName, productId);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <Card id="online-orders" className="border-[var(--gold)]/45 bg-white">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><CardTitle>Online purchase worker checkout</CardTitle><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Paid branded items require scans. Paid auto-generated items prepare every remaining code in one action. Verify cart appears only after the full order is ready.</p></div>
        <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadOrders()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh orders</Button>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="flex items-start gap-3 rounded-[1.1rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4 text-sm font-bold leading-6 text-[var(--ink)]"><FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" /> Demo paid carts remain available for testing and never create real inventory transactions.</div>
        {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
        {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

        {loading ? <div className="flex min-h-44 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading paid online purchases</div> : orders.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" /><p className="mt-3 text-xl font-black text-[var(--ink)]">No paid product carts need preparation.</p></div> : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const demo = isMockWorkerOnlinePurchase(order);
              return <article key={order.transactionId} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Paid online cart #{orderReference(order)}</p>{demo ? <StatusPill label="DEMO PAID CART" tone="neutral" /> : null}</div><h3 className="mt-1 text-xl font-black text-[var(--ink)]">{order.customerUsername ?? "Registered customer"} · {order.businessName ?? `Business #${order.businessId ?? "-"}`}</h3><p className="mt-1 text-xs font-bold text-[var(--steel)]">Quantity is paid. Complete every row before collection verification.</p></div><div className="flex flex-wrap items-center gap-3"><StatusPill label={statusLabel(order)} tone={statusTone(order)} /><p className="money text-2xl font-black text-[var(--ink)]">{money(order.productTotal)}</p></div></div>

                <div className="overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-white text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Required</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>
                  {order.items.map((item) => {
                    const assigned = Number(item.barcodes?.length ?? 0);
                    const required = Math.max(Number(item.quantity ?? 0) - assigned, 0);
                    const configuration = configurationByProduct.get(item.productId);
                    const automatic = configuration?.barcodeMode === "AUTO_GENERATED";
                    const isActive = activeAssignment?.transactionId === order.transactionId && activeAssignment.productId === item.productId;
                    return <tr key={`${order.transactionId}-${item.productId}`} className="border-t border-[var(--line)]"><td className="px-4 py-3"><p className="font-black text-[var(--ink)]">{item.productName}</p><p className="mt-1 font-mono text-[0.65rem] font-bold text-[var(--muted)]">Product #{item.productId}</p></td><td className="px-4 py-3"><StatusPill label={automatic ? "AUTO" : "SCAN"} tone={automatic ? "confirm" : "signal"} /></td><td className="px-4 py-3 font-black text-[var(--ink)]">{item.quantity}</td><td className="px-4 py-3 font-black text-[var(--confirm)]">{assigned}</td><td className="px-4 py-3 font-black text-[var(--signal)]">{required}</td><td className="px-4 py-3 text-right">
                      {automatic ? <button type="button" onClick={() => void prepareAutomatically(order, item.productId, item.productName, required)} disabled={required <= 0 || assigning} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-white px-4 text-xs font-black text-[var(--confirm)] hover:bg-[var(--confirm)] hover:text-white disabled:opacity-50"><WandSparkles className="h-4 w-4" /> {required <= 0 ? "Prepared" : `Prepare automatically · ${required}`}</button> : <button type="button" onClick={() => setActiveAssignment(isActive ? null : { transactionId: order.transactionId, productId: item.productId, productName: item.productName })} disabled={required <= 0 || assigning} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-white px-4 text-xs font-black text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white disabled:opacity-50">{required <= 0 ? <PackageCheck className="h-4 w-4" /> : isActive ? <X className="h-4 w-4" /> : <Barcode className="h-4 w-4" />}{required <= 0 ? "Complete" : isActive ? "Close scanner" : `Add barcodes · ${required}`}</button>}
                    </td></tr>;
                  })}
                </tbody></table></div>

                {activeAssignment?.transactionId === order.transactionId ? <div className="grid gap-3 border-t border-[var(--line)] bg-[var(--gold)]/10 p-4"><div><p className="font-black text-[var(--ink)]">Scan a physical barcode for {activeAssignment.productName}</p><p className="mt-1 text-xs font-semibold text-[var(--steel)]">Only branded products use this scanner.</p></div>{assigning ? <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--signal)]"><Loader2 className="h-4 w-4 animate-spin" /> Assigning barcode</span> : null}<BarcodeScanner onScan={(value) => void assignBarcode(value)} compact hideIdleResult /></div> : null}

                {order.fulfilmentStatus === "READY_FOR_COLLECTION" ? <div className="border-t border-[var(--line)] p-4"><button type="button" onClick={() => setVisibleQrOrderId((current) => current === order.transactionId ? null : order.transactionId)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]"><QrCode className="h-4 w-4" /> {visibleQrOrderId === order.transactionId ? "Hide cart QR" : "Verify cart · show QR"}</button>{visibleQrOrderId === order.transactionId ? <div className="mt-4 grid gap-4 rounded-[1.4rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-5 md:grid-cols-[auto_1fr] md:items-center">{order.collectionQrCodeUrl ? <img src={order.collectionQrCodeUrl} alt={`Collection QR for cart ${orderReference(order)}`} className="h-52 w-52 rounded-[1.2rem] border border-[var(--line)] bg-white p-2" /> : <div className="grid h-52 w-52 place-items-center rounded-[1.2rem] border border-dashed border-[var(--line)] bg-white"><QrCode className="h-14 w-14 text-[var(--signal)]" /></div>}<div><p className="text-xl font-black text-[var(--ink)]">Customer collection verification</p><p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Ask {order.customerUsername ?? "the customer"} to open My Carts, select Collect and scan this QR.</p><p className="code mt-3 break-all rounded-[1rem] border border-[var(--line)] bg-white p-3 text-xs font-bold text-[var(--muted)]">{order.collectionQrCodeValue ?? "Collection QR is being prepared"}</p></div></div> : null}</div> : null}
              </article>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
