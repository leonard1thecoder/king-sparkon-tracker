"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, MapPin, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { deliverDelivery, dispatchDelivery, listPendingDeliveries } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import { money } from "@/lib/tuck-shop/cart";
import type { TuckShopPurchase } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

function etaLabel(minutes?: number | null) {
  if (minutes === null || minutes === undefined) return "ETA not set";
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `~${hours} hr` : `~${hours} hr ${rest} min`;
}

/**
 * Products to be delivered for the business: paid delivery orders with
 * address, fee and lead-time ETA. Shared by worker and owner dashboards.
 */
export function DeliveryWorkspace() {
  const [deliveries, setDeliveries] = useState<TuckShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listPendingDeliveries();
      setDeliveries(Array.isArray(items) ? items : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(transactionId: number, action: "dispatch" | "deliver") {
    setActingId(transactionId);
    setError(null);
    setNotice(null);
    try {
      if (action === "dispatch") {
        await dispatchDelivery(transactionId);
        setNotice(`Order #${transactionId} is out for delivery.`);
      } else {
        await deliverDelivery(transactionId);
        setNotice(`Order #${transactionId} delivered.`);
      }
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="grid gap-6">
      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {notice}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Deliveries to make</CardTitle>
            <p className="mt-2 text-sm text-[var(--steel)]">Paid delivery orders with address, fee and how long delivery takes. Prepare barcodes first, then dispatch.</p>
          </div>
          <Button type="button" variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading deliveries</div>
          : deliveries.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No deliveries waiting. Delivery carts appear here once paid.</p>
          : (
            <div className="grid gap-3">
              {deliveries.map((order) => (
                <article key={order.transactionId} className="grid gap-3 rounded-[1.4rem] border-2 border-[var(--danger)]/40 bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-[var(--ink)]">Order #{order.transactionId}</h3>
                    <StatusPill label={String(order.fulfilmentStatus ?? "PENDING").replaceAll("_", " ")} tone={order.fulfilmentStatus === "OUT_FOR_DELIVERY" ? "warning" : "signal"} />
                    <StatusPill label={`${order.items?.length ?? 0} ITEMS`} tone="neutral" />
                  </div>
                  <p className="flex items-start gap-1.5 text-sm font-bold text-[var(--ink)]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" /> {order.deliveryAddress ?? "No address"}</p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[var(--steel)]">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[var(--signal)]" /> Takes {etaLabel(order.deliveryEtaMinutes)}</span>
                    <span>Fee {money(order.deliveryFeeTotal ?? 0)}</span>
                    <span>Total {money(order.grandTotal ?? order.netTotal ?? 0)}</span>
                    {order.customerUsername ? <span>For {order.customerUsername}</span> : null}
                  </p>
                  <div className="grid gap-1 rounded-[1rem] bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--steel)]">
                    {(order.items ?? []).map((item, index) => (
                      <p key={`${item.productId}-${index}`}>{item.quantity} × {item.productName} · {item.fulfilment ?? "PICKUP"}</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.fulfilmentStatus === "READY_FOR_COLLECTION" ? (
                      <Button type="button" disabled={actingId === order.transactionId} onClick={() => void act(order.transactionId, "dispatch")}>
                        {actingId === order.transactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />} Dispatch
                      </Button>
                    ) : null}
                    {order.fulfilmentStatus === "OUT_FOR_DELIVERY" ? (
                      <Button type="button" disabled={actingId === order.transactionId} onClick={() => void act(order.transactionId, "deliver")}>
                        {actingId === order.transactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />} Mark delivered
                      </Button>
                    ) : null}
                    {order.fulfilmentStatus === "AWAITING_BARCODE_ASSIGNMENT" ? (
                      <p className="text-xs font-black text-[var(--gold)]">Assign barcodes first (Online Orders), then dispatch.</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
