"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Boxes, CreditCard, Loader2, RefreshCw, ScanLine, Search, ShieldCheck } from "lucide-react";
import { listOwnerProducts } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

function primaryBarcode(product: Product) {
  const first = product.barcodes?.[0];
  if (typeof first === "string") return first;
  return first?.barcode ?? "";
}

function fieldClass() {
  return "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";
}

export function WorkerProductWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const response = await listOwnerProducts({ page: 0, size: 100 });
      setProducts(response.content ?? []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.category, product.status, primaryBarcode(product), product.id]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  const readyProducts = useMemo(
    () => products.filter((product) => product.status === "CREATED" && product.stockQuantity > 0),
    [products],
  );
  const totalUnits = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(Number(product.stockQuantity ?? 0), 0), 0),
    [products],
  );
  const assignedBarcodes = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(Number(product.barcodeCount ?? 0), 0), 0),
    [products],
  );

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Business products" value={loading ? "..." : String(products.length)} detail="Products assigned to your workplace" tone="confirm" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Ready to sell" value={loading ? "..." : String(readyProducts.length)} detail="Created products with stock" tone="signal" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Stock units" value={loading ? "..." : String(totalUnits)} detail="Current business stock" />
        <MetricCard label="Assigned barcodes" value={loading ? "..." : String(assignedBarcodes)} detail="Trackable physical units" />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-4 bg-[var(--gold)] p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Worker product tools</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[var(--ink)]">See the stock before scanning a customer sale.</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--ink)]/65">Workers can view their business catalogue, check barcode readiness, open the scanner and review product-sale transactions.</p>
          </div>
          <Link href="/dashboard/worker/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:bg-white hover:text-[var(--ink)]">
            <ScanLine className="h-4 w-4" /> Scan & sell
          </Link>
          <Link href="/dashboard/worker/transactions" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)]/20 bg-white/70 px-5 text-sm font-black text-[var(--ink)] hover:bg-white">
            <CreditCard className="h-4 w-4" /> Product sales
          </Link>
        </div>
      </Card>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)_auto] lg:items-end">
          <div>
            <CardTitle>Business product catalogue</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Stock, price, status and barcode capacity for products belonging to your worker business.</p>
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search products</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, barcode, category or ID" className={`${fieldClass()} pl-10`} />
            </span>
          </label>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadProducts()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading business products
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">No products match the current search.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const ready = product.status === "CREATED" && product.stockQuantity > 0;
                const barcode = primaryBarcode(product);
                return (
                  <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                    <div className="aspect-[16/9] overflow-hidden bg-[var(--surface)]">
                      <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                    </div>
                    <div className="grid gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product #{product.id}</p>
                          <h3 className="mt-1 truncate text-xl font-black text-[var(--ink)]">{product.name}</h3>
                          <p className="mt-1 text-xs font-bold text-[var(--steel)]">{product.category} · {barcode || "No barcode unit assigned"}</p>
                        </div>
                        <StatusPill label={ready ? "SELL READY" : product.status ?? "PRODUCT"} tone={ready ? "confirm" : "neutral"} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 rounded-[1.1rem] bg-[var(--surface)] p-3 text-center">
                        <div><p className="money text-lg font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Price</p></div>
                        <div><p className="text-lg font-black text-[var(--ink)]">{product.stockQuantity}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Stock</p></div>
                        <div><p className="text-lg font-black text-[var(--ink)]">{product.barcodeCount ?? 0}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Barcodes</p></div>
                      </div>

                      <Link href="/dashboard/worker/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 text-sm font-black text-[var(--ink)] hover:bg-white">
                        <ScanLine className="h-4 w-4" /> Scan this stock for sale
                      </Link>
                    </div>
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
