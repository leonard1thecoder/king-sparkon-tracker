"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, PackageCheck, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import { listCompletedWorkerPurchases, type OnlineTuckShopPurchase } from "@/lib/api/tuck-shop";

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function completed(order: OnlineTuckShopPurchase) {
  if (order.fulfilmentStatus === "COLLECTED") return true;
  return order.fulfilmentStatus === "NOT_REQUIRED" && order.paymentStatus === "PAID";
}

export function WorkerCompletedProductSales() {
  const [orders, setOrders] = useState<OnlineTuckShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSales() {
    setLoading(true);
    setError(null);
    try {
      const response = await listCompletedWorkerPurchases();
      setOrders(Array.isArray(response) ? response : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSales();
  }, []);

  const completedOrders = useMemo(() => orders.filter(completed), [orders]);
  const totalRevenue = useMemo(() => completedOrders.reduce((sum, order) => sum + Number(order.productTotal ?? 0), 0), [completedOrders]);
  const totalUnits = useMemo(() => completedOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity ?? 0), 0), 0), [completedOrders]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Completed carts" value={loading ? "..." : String(completedOrders.length)} detail="Completed counter and collected online carts" tone="confirm" icon={<PackageCheck className="h-5 w-5" />} />
        <MetricCard label="Products sold" value={loading ? "..." : String(totalUnits)} detail="Quantity across completed carts" icon={<ShoppingBag className="h-5 w-5" />} />
        <MetricCard label="Product revenue" value={loading ? "..." : money(totalRevenue)} detail="Completed cart value" tone="signal" icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Completed product carts</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Completed counter sales and online carts only after customer collection verification.</p></div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadSales()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-44 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading completed carts</div> : completedOrders.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" /><p className="mt-3 text-xl font-black text-[var(--ink)]">No completed product carts yet</p></div> : (
            <div className="overflow-x-auto rounded-[1.4rem] border border-[var(--line)]"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]"><tr><th className="px-4 py-3">Cart</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Collection</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody>
              {completedOrders.map((order) => <tr key={order.transactionId} className="border-t border-[var(--line)]"><td className="px-4 py-3"><p className="font-black text-[var(--ink)]">#{order.transactionId}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-ZA") : "Completed sale"}</p></td><td className="px-4 py-3 font-bold text-[var(--ink)]">{order.customerUsername ?? "Counter customer"}</td><td className="px-4 py-3"><p className="font-black text-[var(--ink)]">{order.items.reduce((sum, item) => sum + item.quantity, 0)} units</p><p className="mt-1 max-w-sm text-xs font-semibold text-[var(--steel)]">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p></td><td className="px-4 py-3"><StatusPill label={order.paymentStatus ?? "PAID"} tone="confirm" /><p className="mt-1 text-xs font-bold text-[var(--muted)]">{order.paymentType ?? "PAYMENT"}</p></td><td className="px-4 py-3"><StatusPill label={order.fulfilmentStatus === "COLLECTED" ? "COLLECTED" : "COUNTER COMPLETE"} tone="confirm" /></td><td className="px-4 py-3 text-right money text-lg font-black text-[var(--ink)]">{money(order.productTotal)}</td></tr>)}
            </tbody></table></div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
