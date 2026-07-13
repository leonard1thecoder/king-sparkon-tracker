"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, ChevronDown, ChevronUp, CreditCard, Loader2, RefreshCw, ShoppingBag, Smartphone } from "lucide-react";
import { apiGet, normalizeApiError } from "@/lib/api/client";
import { listOwnerProducts } from "@/lib/api/tuck-shop";
import type { PageResponse, Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

type TransactionLine = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  barcodes?: string[];
};

type ProductTransaction = {
  id: number;
  date: string;
  type: string;
  paymentType?: "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT" | string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentEmail?: string | null;
  paymentContact?: string | null;
  totalAmount: number;
  employeeId?: number | null;
  items: TransactionLine[];
};

type ProductPurchaseRow = ProductTransaction & {
  line: TransactionLine;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function image(product?: Product) {
  return product?.productImageUrl || "/king-sparkon-logo.png";
}

function payment(paymentType?: string | null) {
  if (paymentType === "CASH") return { label: "CASH", detail: "Cash at counter", icon: Banknote, tone: "confirm" as const };
  if (paymentType === "SWIPE_MACHINE") return { label: "CARD", detail: "Card machine", icon: CreditCard, tone: "signal" as const };
  return { label: "APP", detail: "King Sparkon App", icon: Smartphone, tone: "neutral" as const };
}

export function OwnerProductTransactions() {
  const [transactions, setTransactions] = useState<ProductTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [transactionPage, productPage] = await Promise.all([
        apiGet<PageResponse<ProductTransaction>>("/transactions?page=0&size=100"),
        listOwnerProducts({ page: 0, size: 100 }),
      ]);
      setTransactions((transactionPage.content ?? []).filter((item) => item.type === "SELL"));
      setProducts(productPage.content ?? []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const purchasesByProduct = useMemo(() => {
    const grouped = new Map<number, ProductPurchaseRow[]>();
    transactions.forEach((transaction) => {
      transaction.items.forEach((line) => {
        const rows = grouped.get(line.productId) ?? [];
        rows.push({ ...transaction, line });
        grouped.set(line.productId, rows);
      });
    });
    grouped.forEach((rows) => rows.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()));
    return grouped;
  }, [transactions]);

  const productGroups = useMemo(() => Array.from(purchasesByProduct.entries()).map(([productId, rows]) => {
    const product = productById.get(productId);
    const totalQuantity = rows.reduce((sum, row) => sum + Number(row.line.quantity ?? 0), 0);
    const revenue = rows.reduce((sum, row) => sum + Number(row.line.unitPrice ?? 0) * Number(row.line.quantity ?? 0), 0);
    const methods = new Set(rows.map((row) => payment(row.paymentType).label));
    return { productId, product, productName: product?.name ?? rows[0]?.line.productName ?? `Product #${productId}`, rows, totalQuantity, revenue, methods };
  }).sort((left, right) => right.revenue - left.revenue), [purchasesByProduct, productById]);

  const totalRevenue = useMemo(() => productGroups.reduce((sum, group) => sum + group.revenue, 0), [productGroups]);
  const totalUnits = useMemo(() => productGroups.reduce((sum, group) => sum + group.totalQuantity, 0), [productGroups]);
  const appRevenue = useMemo(() => transactions.filter((transaction) => transaction.paymentType === "WEBSITE_PAYMENT" && transaction.paymentStatus === "PAID").reduce((sum, transaction) => sum + Number(transaction.totalAmount ?? 0), 0), [transactions]);

  function toggle(productId: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products purchased" value={loading ? "..." : String(productGroups.length)} detail="Products with recorded sales" tone="confirm" icon={<ShoppingBag className="h-5 w-5" />} />
        <MetricCard label="Product units sold" value={loading ? "..." : String(totalUnits)} detail="Cash, card and app quantities" icon={<ShoppingBag className="h-5 w-5" />} />
        <MetricCard label="Recorded sales" value={loading ? "..." : money(totalRevenue)} detail="All product payment methods" tone="signal" icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard label="App-paid revenue" value={loading ? "..." : money(appRevenue)} detail="Included in unified balance" icon={<Smartphone className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Product purchases</CardTitle><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Products are grouped like a customer catalogue. Open a product to review every cash, card-machine and King Sparkon App transaction.</p></div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading product transactions</div> : productGroups.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center text-sm font-bold text-[var(--steel)]">No product sales have been recorded yet.</p> : (
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {productGroups.map((group) => {
                const open = expanded.has(group.productId);
                return (
                  <article key={group.productId} className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]"><img src={image(group.product)} alt={group.productName} className="h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-14 text-white"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">Product #{group.productId}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{group.productName}</h2></div></div>
                    <div className="grid gap-4 p-5">
                      <div className="grid grid-cols-3 gap-2"><div className="rounded-[1rem] bg-[var(--surface)] p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Purchases</p><p className="mt-1 text-xl font-black text-[var(--ink)]">{group.rows.length}</p></div><div className="rounded-[1rem] bg-[var(--surface)] p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Units</p><p className="mt-1 text-xl font-black text-[var(--ink)]">{group.totalQuantity}</p></div><div className="rounded-[1rem] bg-[var(--surface)] p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Revenue</p><p className="money mt-1 text-lg font-black text-[var(--ink)]">{money(group.revenue)}</p></div></div>
                      <div className="flex flex-wrap gap-2">{Array.from(group.methods).map((method) => <StatusPill key={method} label={method} tone={method === "CASH" ? "confirm" : method === "CARD" ? "signal" : "neutral"} />)}</div>
                      <Button type="button" variant="quiet" onClick={() => toggle(group.productId)}>{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {open ? "Hide purchases" : "View product purchases"}</Button>
                    </div>
                    {open ? <div className="border-t border-[var(--line)] bg-[var(--surface)]/55 p-4"><div className="grid gap-3">{group.rows.map((row) => { const method = payment(row.paymentType); const Icon = method.icon; return <div key={`${row.id}-${row.line.id}`} className="rounded-[1.15rem] border border-[var(--line)] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[var(--signal)]" /><StatusPill label={method.label} tone={method.tone} /><StatusPill label={row.paymentStatus ?? (row.paymentType === "WEBSITE_PAYMENT" ? "PENDING" : "COMPLETED")} tone={row.paymentStatus === "PAID" || row.paymentType !== "WEBSITE_PAYMENT" ? "confirm" : "signal"} /></div><p className="mt-2 font-mono text-xs font-black text-[var(--muted)]">Transaction #{row.id}</p><p className="mt-1 text-xs font-semibold text-[var(--steel)]">{new Date(row.date).toLocaleString("en-ZA")} · {method.detail}</p></div><div className="text-right"><p className="money text-xl font-black text-[var(--ink)]">{money(Number(row.line.unitPrice) * Number(row.line.quantity))}</p><p className="mt-1 text-xs font-bold text-[var(--steel)]">{row.line.quantity} × {money(row.line.unitPrice)}</p></div></div>{row.paymentEmail || row.paymentContact ? <p className="mt-3 break-all text-xs font-bold text-[var(--muted)]">Customer: {row.paymentContact || row.paymentEmail}</p> : null}</div>; })}</div></div> : null}
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
