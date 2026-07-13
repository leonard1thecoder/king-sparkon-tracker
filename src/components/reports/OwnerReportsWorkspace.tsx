"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Boxes, Loader2, RefreshCw, TrendingDown, TrendingUp, Wine } from "lucide-react";
import { apiGet, normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

type InventorySummary = {
  totalProducts: number;
  alcoholProducts: number;
  nonAlcoholProducts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  lowStockProducts: number;
};

type AlcoholReport = {
  from: string;
  to: string;
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
};

type ProductMovement = {
  productId: number;
  productName: string;
  category: string;
  barcodes: string[];
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

export function OwnerReportsWorkspace() {
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [alcohol, setAlcohol] = useState<AlcoholReport | null>(null);
  const [movement, setMovement] = useState<ProductMovement[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const threshold = Math.max(Number(lowStockThreshold || 5), 0);
    setLoading(true);
    setError(null);
    try {
      const [inventoryResponse, alcoholResponse, movementResponse] = await Promise.all([
        apiGet<InventorySummary>(`/reports/inventory-summary?lowStockThreshold=${threshold}`),
        apiGet<AlcoholReport>("/reports/alcohol"),
        apiGet<ProductMovement[]>("/reports/product-movement"),
      ]);
      setInventory(inventoryResponse);
      setAlcohol(alcoholResponse);
      setMovement(Array.isArray(movementResponse) ? movementResponse : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalSold = useMemo(() => movement.reduce((sum, item) => sum + Number(item.soldQuantity ?? 0), 0), [movement]);
  const soldValue = useMemo(() => movement.reduce((sum, item) => sum + Number(item.soldValue ?? 0), 0), [movement]);
  const topProduct = useMemo(() => [...movement].sort((left, right) => right.soldQuantity - left.soldQuantity)[0], [movement]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Products" value={loading ? "..." : String(inventory?.totalProducts ?? 0)} detail={`${inventory?.alcoholProducts ?? 0} alcohol · ${inventory?.nonAlcoholProducts ?? 0} non-alcohol`} tone="confirm" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Stock units" value={loading ? "..." : String(inventory?.totalStockQuantity ?? 0)} detail="Current inventory quantity" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Stock value" value={loading ? "..." : money(inventory?.totalStockValue)} detail="Current product valuation" tone="signal" icon={<BarChart3 className="h-5 w-5" />} />
        <MetricCard label="Units sold" value={loading ? "..." : String(totalSold)} detail={topProduct ? `Top: ${topProduct.productName}` : "Product movement"} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard label="Low stock" value={loading ? "..." : String(inventory?.lowStockProducts ?? 0)} detail={`At or below ${lowStockThreshold || 5} units`} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><CardTitle>Report controls</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Change the low-stock threshold, then refresh all inventory and movement reports.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Low-stock threshold<input value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value.replace(/\D/g, ""))} inputMode="numeric" className="min-h-11 w-40 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)]" /></label><Button type="button" disabled={loading} onClick={() => void load()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh reports</Button></div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="border-[var(--gold)]/45 bg-white">
          <CardHeader><CardTitle>Alcohol movement</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Bought and sold alcohol quantities and values across the complete available report range.</p></CardHeader>
          <CardContent>
            {loading ? <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--signal)]" /></div> : <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface)] p-5"><TrendingDown className="h-6 w-6 text-[var(--signal)]" /><p className="mt-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Bought</p><p className="mt-1 text-3xl font-black text-[var(--ink)]">{alcohol?.boughtQuantity ?? 0}</p><p className="money mt-1 font-black text-[var(--steel)]">{money(alcohol?.boughtValue)}</p></div><div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface)] p-5"><Wine className="h-6 w-6 text-[var(--confirm)]" /><p className="mt-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Sold</p><p className="mt-1 text-3xl font-black text-[var(--ink)]">{alcohol?.soldQuantity ?? 0}</p><p className="money mt-1 font-black text-[var(--steel)]">{money(alcohol?.soldValue)}</p></div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Product movement ranking</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Bought and sold movement by product. Total sold value: {money(soldValue)}.</p></CardHeader>
          <CardContent>
            {loading ? <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading movement</div> : movement.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No product movement has been recorded.</p> : <div className="overflow-x-auto rounded-[1.3rem] border border-[var(--line)]"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Bought</th><th className="px-4 py-3 text-right">Sold</th><th className="px-4 py-3 text-right">Sold value</th></tr></thead><tbody>{[...movement].sort((left, right) => right.soldQuantity - left.soldQuantity).map((item) => <tr key={item.productId} className="border-t border-[var(--line)]"><td className="px-4 py-3"><p className="font-black text-[var(--ink)]">{item.productName}</p><p className="mt-1 font-mono text-xs font-bold text-[var(--muted)]">Product #{item.productId} · {item.barcodes?.length ?? 0} barcodes</p></td><td className="px-4 py-3"><StatusPill label={item.category} tone={item.category === "Alcohol" ? "signal" : "confirm"} /></td><td className="px-4 py-3 text-right"><p className="font-black text-[var(--ink)]">{item.boughtQuantity}</p><p className="money text-xs font-bold text-[var(--muted)]">{money(item.boughtValue)}</p></td><td className="px-4 py-3 text-right font-black text-[var(--ink)]">{item.soldQuantity}</td><td className="px-4 py-3 text-right money font-black text-[var(--ink)]">{money(item.soldValue)}</td></tr>)}</tbody></table></div>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
