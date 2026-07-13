"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Barcode, Boxes, CheckCircle2, CreditCard, Loader2, Plus, RefreshCw, ScanLine, Search, WandSparkles, X } from "lucide-react";
import {
  addProductBarcode,
  fillAutomaticProductBarcodes,
  listOwnerProducts,
  listProductBarcodeConfigurations,
  type ProductBarcodeConfiguration,
} from "@/lib/api/tuck-shop";
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

function reusableProductBarcode(product: Product) {
  return product.productBarcode?.trim() || primaryBarcode(product).trim();
}

function barcodeRequired(product: Product, configuration?: ProductBarcodeConfiguration) {
  if (configuration) return Math.max(Number(configuration.barcodesRequired ?? 0), 0);
  const remaining = Number(product.remainingBarcodeSlots);
  if (Number.isFinite(remaining)) return Math.max(Math.trunc(remaining), 0);
  const stock = Math.max(Number(product.stockQuantity ?? 0), 0);
  const assigned = Math.max(Number(product.barcodeCount ?? product.barcodes?.length ?? 0), 0);
  return Math.max(Math.trunc(stock - assigned), 0);
}

function fieldClass() {
  return "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";
}

export function WorkerProductWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [configurations, setConfigurations] = useState<ProductBarcodeConfiguration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [barcodeEditorProductId, setBarcodeEditorProductId] = useState<number | null>(null);
  const [barcodeValues, setBarcodeValues] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configurationByProduct = useMemo(
    () => new Map(configurations.map((configuration) => [configuration.productId, configuration])),
    [configurations],
  );

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const [response, barcodeModes] = await Promise.all([
        listOwnerProducts({ page: 0, size: 100 }),
        listProductBarcodeConfigurations().catch(() => []),
      ]);
      setProducts(response.content ?? []);
      setConfigurations(barcodeModes);
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
    return products.filter((product) => {
      const configuration = configurationByProduct.get(product.id);
      return [product.name, product.category, product.status, reusableProductBarcode(product), configuration?.barcodeMode, product.id]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [configurationByProduct, products, search]);

  const readyProducts = useMemo(
    () => products.filter((product) => product.status === "CREATED" && product.stockQuantity > 0 && barcodeRequired(product, configurationByProduct.get(product.id)) === 0),
    [configurationByProduct, products],
  );
  const totalUnits = useMemo(() => products.reduce((sum, product) => sum + Math.max(Number(product.stockQuantity ?? 0), 0), 0), [products]);
  const requiredBarcodes = useMemo(
    () => products.reduce((sum, product) => sum + barcodeRequired(product, configurationByProduct.get(product.id)), 0),
    [configurationByProduct, products],
  );

  function openBarcodeEditor(product: Product) {
    setError(null);
    setSuccess(null);
    setBarcodeEditorProductId(product.id);
    setBarcodeValues((current) => ({ ...current, [product.id]: current[product.id] ?? reusableProductBarcode(product) }));
  }

  async function addBarcodes(product: Product) {
    const configuration = configurationByProduct.get(product.id);
    const required = barcodeRequired(product, configuration);
    if (required <= 0) {
      setSuccess(`${product.name} already has a barcode for every stock unit.`);
      return;
    }

    setAddingProductId(product.id);
    setError(null);
    setSuccess(null);
    try {
      if (configuration?.barcodeMode === "AUTO_GENERATED") {
        const updated = await fillAutomaticProductBarcodes(product.id);
        setConfigurations((current) => current.map((item) => item.productId === product.id ? updated : item));
        setSuccess(`${updated.barcodeCount} automatic stock-unit codes now match ${product.name}'s stock. ${updated.barcodesRequired} still required.`);
        await loadProducts();
        return;
      }

      const reusableBarcode = (barcodeValues[product.id] ?? reusableProductBarcode(product)).trim();
      if (!reusableBarcode) {
        openBarcodeEditor(product);
        setError("Enter the reusable manufacturer barcode before adding the first stock-unit barcode.");
        return;
      }
      const updated = await addProductBarcode(product.id, { unitCode: null, barcode: reusableBarcode, referenceEmail: null });
      setProducts((current) => current.map((candidate) => candidate.id === product.id ? updated : candidate));
      setBarcodeValues((current) => ({ ...current, [product.id]: reusableBarcode }));
      setBarcodeEditorProductId(null);
      const remaining = barcodeRequired(updated, configurationByProduct.get(product.id));
      setSuccess(remaining > 0 ? `One barcode added to ${product.name}. ${remaining} still required.` : `${product.name} now has barcodes for every stock unit.`);
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setAddingProductId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Business products" value={loading ? "..." : String(products.length)} detail="Products assigned to your workplace" tone="confirm" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Ready to sell" value={loading ? "..." : String(readyProducts.length)} detail="Stock with every required unit code" tone="signal" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Stock units" value={loading ? "..." : String(totalUnits)} detail="Current business stock" />
        <MetricCard label="Barcodes required" value={loading ? "..." : String(requiredBarcodes)} detail="Stock units still needing codes" icon={<Barcode className="h-5 w-5" />} />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-4 bg-[var(--gold)] p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Worker product tools</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[var(--ink)]">Scan branded stock or sell auto-coded stock without scanning.</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--ink)]/65">Automatic products create all missing internal codes in one action. Branded products retain manufacturer barcode verification.</p></div>
          <Link href="/dashboard/worker/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:bg-white hover:text-[var(--ink)]"><ScanLine className="h-4 w-4" /> Scan & sell</Link>
          <Link href="/dashboard/worker/transactions" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)]/20 bg-white/70 px-5 text-sm font-black text-[var(--ink)] hover:bg-white"><CreditCard className="h-4 w-4" /> Product sales</Link>
        </div>
      </Card>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)_auto] lg:items-end">
          <div><CardTitle>Business product catalogue</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Stock, barcode mode, assigned codes and the correct checkout action for every product.</p></div>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search products</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, barcode mode, category or ID" className={`${fieldClass()} pl-10`} /></span></label>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadProducts()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-48 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading business products</div> : filteredProducts.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">No products match the current search.</p> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const configuration = configurationByProduct.get(product.id);
                const automatic = configuration?.barcodeMode === "AUTO_GENERATED" || (!configuration && !product.productBarcode);
                const required = barcodeRequired(product, configuration);
                const assigned = configuration?.barcodeCount ?? Math.max(Number(product.barcodeCount ?? product.barcodes?.length ?? 0), 0);
                const ready = product.status === "CREATED" && product.stockQuantity > 0 && required === 0;
                const reusableBarcode = reusableProductBarcode(product);
                const editingBarcode = barcodeEditorProductId === product.id;
                const adding = addingProductId === product.id;

                return <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                  <div className="aspect-[16/9] overflow-hidden bg-[var(--surface)]"><img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" /></div>
                  <div className="grid gap-4 p-5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product #{product.id}</p><h3 className="mt-1 truncate text-xl font-black text-[var(--ink)]">{product.name}</h3><p className="mt-1 text-xs font-bold text-[var(--steel)]">{automatic ? "King Sparkon auto-generated codes" : reusableBarcode || "Manufacturer barcode not set"}</p></div><StatusPill label={automatic ? "AUTO CODED" : ready ? "SCAN READY" : required > 0 ? `${required} NEEDED` : product.status ?? "PRODUCT"} tone={automatic || ready ? "confirm" : required > 0 ? "signal" : "neutral"} /></div>
                    <div className="grid grid-cols-2 gap-2 rounded-[1.1rem] bg-[var(--surface)] p-3 text-center sm:grid-cols-4"><div><p className="money text-lg font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Price</p></div><div><p className="text-lg font-black text-[var(--ink)]">{product.stockQuantity}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Stock</p></div><div className={required > 0 ? "rounded-[0.8rem] border border-[var(--signal)]/30 bg-[var(--signal)]/10 p-1" : "p-1"}><p className={`text-lg font-black ${required > 0 ? "text-[var(--signal)]" : "text-[var(--confirm)]"}`}>{required}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Required</p></div><div><p className="text-lg font-black text-[var(--ink)]">{assigned}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Assigned</p></div></div>

                    {editingBarcode && !automatic ? <div className="grid gap-3 rounded-[1.15rem] border border-[var(--gold)] bg-[var(--gold)]/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[var(--ink)]">Manufacturer product barcode</p><p className="mt-1 text-xs font-semibold leading-5 text-[var(--steel)]">Required before adding branded stock units.</p></div><button type="button" onClick={() => setBarcodeEditorProductId(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-white"><X className="h-4 w-4" /></button></div><input value={barcodeValues[product.id] ?? reusableBarcode} onChange={(event) => setBarcodeValues((current) => ({ ...current, [product.id]: event.target.value.replace(/\s/g, "") }))} required placeholder="Scan or enter manufacturer barcode" className={fieldClass()} /><Button type="button" disabled={adding || !(barcodeValues[product.id] ?? reusableBarcode).trim()} onClick={() => void addBarcodes(product)}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Barcode className="h-4 w-4" />} Save and add barcode</Button></div> : null}

                    <div className={`grid gap-2 ${automatic ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
                      {automatic ? <Link href={`/dashboard/worker/scan?productId=${product.id}&automatic=true`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-4 text-sm font-black text-white hover:bg-[var(--ink)]"><WandSparkles className="h-4 w-4" /> Sell without scan</Link> : <Link href="/dashboard/worker/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 text-sm font-black text-[var(--ink)] hover:bg-white"><ScanLine className="h-4 w-4" /> Scan this stock for sale</Link>}
                      <button type="button" onClick={() => automatic || reusableBarcode ? void addBarcodes(product) : openBarcodeEditor(product)} disabled={adding || required <= 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-white px-4 text-sm font-black text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--surface)] disabled:text-[var(--muted)]">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : required <= 0 ? <CheckCircle2 className="h-4 w-4" /> : automatic ? <WandSparkles className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{adding ? "Creating codes..." : required <= 0 ? "Barcodes complete" : automatic ? `Create all ${required} codes` : `Add barcode · ${required} required`}</button>
                    </div>
                  </div>
                </article>;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
