"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Barcode, Boxes, CheckCircle2, CreditCard, Loader2, Plus, RefreshCw, ScanLine, Search, ShoppingCart, WandSparkles, X } from "lucide-react";
import {
  addProductBarcode,
  fillAutomaticProductBarcodes,
  getWorkerProductByBarcode,
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
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";

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

const STORAGE_KEY = "workerPendingCheckoutLines";

type PendingLine = {
  productId: number;
  productName: string;
  barcode: string;
  quantity: number;
  automaticBarcode: boolean;
};

function readPendingLines(): PendingLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as PendingLine[];
  } catch {}
  return [];
}

function writePendingLines(lines: PendingLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

function addPendingLine(line: PendingLine) {
  const current = readPendingLines();
  const existingIdx = current.findIndex((l) => l.productId === line.productId && l.automaticBarcode === line.automaticBarcode && l.barcode === line.barcode);
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], quantity: current[existingIdx].quantity + line.quantity };
  } else {
    current.push(line);
  }
  writePendingLines(current);
}

export function WorkerProductWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [configurations, setConfigurations] = useState<ProductBarcodeConfiguration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Scanner popup state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<"sellSearch" | "addBarcode">("sellSearch");
  const [scannerTargetProduct, setScannerTargetProduct] = useState<Product | null>(null);
  const [scannedDetailProduct, setScannedDetailProduct] = useState<Product | null>(null);
  const [scannedBarcodeValue, setScannedBarcodeValue] = useState<string | null>(null);
  const [scannerLookupLoading, setScannerLookupLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Quantity modal state
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [quantityProduct, setQuantityProduct] = useState<Product | null>(null);
  const [quantityValue, setQuantityValue] = useState("1");
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ name: string; qty: number } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(readPendingLines().length);
  }, [quantityOpen, choiceOpen, scannerOpen, success]);

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

  function openSellQuantity(product: Product) {
    setQuantityProduct(product);
    setQuantityValue("1");
    setQuantityError(null);
    setQuantityOpen(true);
  }

  function handleQuantityConfirm() {
    const qty = Number(quantityValue);
    if (!Number.isInteger(qty) || qty <= 0) {
      setQuantityError("Quantity must be a whole number greater than zero.");
      return;
    }
    if (!quantityProduct) return;
    const configuration = configurationByProduct.get(quantityProduct.id);
    const automatic = configuration?.barcodeMode === "AUTO_GENERATED" || (!configuration && !quantityProduct.productBarcode);
    const barcode = automatic ? "" : reusableProductBarcode(quantityProduct);
    const line: PendingLine = {
      productId: quantityProduct.id,
      productName: quantityProduct.name,
      barcode,
      quantity: qty,
      automaticBarcode: automatic,
    };
    addPendingLine(line);
    const remainingQty = Number(quantityProduct.stockQuantity ?? 0) - qty;
    if (remainingQty < 0) {
      setQuantityError(`Only ${quantityProduct.stockQuantity} in stock.`);
      return;
    }
    setLastAdded({ name: quantityProduct.name, qty });
    setCartCount(readPendingLines().length + 1);
    setQuantityOpen(false);
    setChoiceOpen(true);
    setSuccess(`${quantityProduct.name} × ${qty} added to cart. ${readPendingLines().length} item(s) in cash checkout.`);
  }

  function handleContinueAdding() {
    setChoiceOpen(false);
    setQuantityProduct(null);
    setCartCount(readPendingLines().length);
  }

  function handleGoToCheckout() {
    setChoiceOpen(false);
    if (!lastAdded || !quantityProduct) {
      window.location.href = "/dashboard/worker/scan";
      return;
    }
    const configuration = configurationByProduct.get(quantityProduct.id);
    const automatic = configuration?.barcodeMode === "AUTO_GENERATED" || (!configuration && !quantityProduct.productBarcode);
    const barcode = automatic ? "" : reusableProductBarcode(quantityProduct);
    window.location.href = `/dashboard/worker/scan?productId=${quantityProduct.id}&quantity=${lastAdded.qty}${automatic ? "&automatic=true" : `&barcode=${encodeURIComponent(barcode)}`}`;
  }

  // Scanner handlers
  function openScannerForSell() {
    setScannerMode("sellSearch");
    setScannerTargetProduct(null);
    setScannedDetailProduct(null);
    setScannedBarcodeValue(null);
    setScannerError(null);
    setScannerLookupLoading(false);
    setScannerOpen(true);
  }

  function openScannerForAddBarcode(product: Product) {
    setScannerMode("addBarcode");
    setScannerTargetProduct(product);
    setScannedDetailProduct(null);
    setScannedBarcodeValue(null);
    setScannerError(null);
    setScannerLookupLoading(false);
    setScannerOpen(true);
  }

  async function handleScannerScan(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setScannedBarcodeValue(trimmed);
    setScannerError(null);
    if (scannerMode === "addBarcode" && scannerTargetProduct) {
      // For add barcode, directly add the scanned barcode as manufacturer barcode
      setScannerLookupLoading(true);
      try {
        const updated = await addProductBarcode(scannerTargetProduct.id, { unitCode: null, barcode: trimmed, referenceEmail: null });
        setProducts((current) => current.map((c) => c.id === scannerTargetProduct.id ? updated : c));
        setSuccess(`Barcode ${trimmed} added to ${scannerTargetProduct.name}.`);
        setScannerOpen(false);
        await loadProducts();
      } catch (exception) {
        setScannerError(normalizeApiError(exception).message);
      } finally {
        setScannerLookupLoading(false);
      }
      return;
    }

    // sellSearch mode: lookup product by barcode
    setScannerLookupLoading(true);
    try {
      const product = await getWorkerProductByBarcode(trimmed);
      setScannedDetailProduct(product);
      setScannerError(null);
    } catch (exception) {
      setScannedDetailProduct(null);
      setScannerError(normalizeApiError(exception).message || "Product not found. Try searching below.");
      // If not found, close scanner and focus search
      setTimeout(() => {
        setScannerOpen(false);
        searchInputRef.current?.focus();
        setError("Product not found for scanned barcode. Try searching using the search product field below.");
      }, 1200);
    } finally {
      setScannerLookupLoading(false);
    }
  }

  async function handleScannedDetailSell() {
    if (!scannedDetailProduct) return;
    setScannerOpen(false);
    openSellQuantity(scannedDetailProduct);
  }

  async function handleAddBarcodeManualFallback(barcode: string) {
    await handleScannerScan(barcode);
  }

  async function handleFillAutomatic(product: Product) {
    const required = barcodeRequired(product, configurationByProduct.get(product.id));
    if (required <= 0) {
      setSuccess(`${product.name} already has a barcode for every stock unit.`);
      return;
    }
    setAddingProductId(product.id);
    setError(null);
    setSuccess(null);
    try {
      const updated = await fillAutomaticProductBarcodes(product.id);
      setConfigurations((current) => current.map((item) => item.productId === product.id ? updated : item));
      setSuccess(`${updated.barcodeCount} automatic stock-unit codes now match ${product.name}'s stock. ${updated.barcodesRequired} still required.`);
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
          <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Worker product tools</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[var(--ink)]">Scan to find product or sell from catalog.</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--ink)]/65">Use scanner to search product; if found shows product details like catalog. Sell product asks quantity and populates Worker Tuck Shop checkout.</p></div>
          <Button type="button" onClick={openScannerForSell} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:bg-white hover:text-[var(--ink)]"><ScanLine className="h-4 w-4" /> Scan product</Button>
          <Link href="/dashboard/worker/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)]/20 bg-white/70 px-5 text-sm font-black text-[var(--ink)] hover:bg-white"><CreditCard className="h-4 w-4" /> Go to checkout</Link>
        </div>
      </Card>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)_auto] lg:items-end">
          <div><CardTitle>Business product catalogue</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Stock, barcode mode, assigned codes and the correct checkout action for every product.</p></div>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search products</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, barcode mode, category or ID" className={`${fieldClass()} pl-10`} /></span></label>
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
                const adding = addingProductId === product.id;

                return <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                  <div className="aspect-[16/9] overflow-hidden bg-[var(--surface)]"><img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" /></div>
                  <div className="grid gap-4 p-5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product #{product.id}</p><h3 className="mt-1 truncate text-xl font-black text-[var(--ink)]">{product.name}</h3><p className="mt-1 text-xs font-bold text-[var(--steel)]">{automatic ? "King Sparkon auto-generated codes" : reusableBarcode || "Manufacturer barcode not set"}</p></div><StatusPill label={automatic ? "AUTO CODED" : ready ? "SCAN READY" : required > 0 ? `${required} NEEDED` : product.status ?? "PRODUCT"} tone={automatic || ready ? "confirm" : required > 0 ? "signal" : "neutral"} /></div>
                    <div className="grid grid-cols-2 gap-2 rounded-[1.1rem] bg-[var(--surface)] p-3 text-center sm:grid-cols-4"><div><p className="money text-lg font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Price</p></div><div><p className="text-lg font-black text-[var(--ink)]">{product.stockQuantity}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Stock</p></div><div className={required > 0 ? "rounded-[0.8rem] border border-[var(--signal)]/30 bg-[var(--signal)]/10 p-1" : "p-1"}><p className={`text-lg font-black ${required > 0 ? "text-[var(--signal)]" : "text-[var(--confirm)]"}`}>{required}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Required</p></div><div><p className="text-lg font-black text-[var(--ink)]">{assigned}</p><p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Assigned</p></div></div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button type="button" onClick={() => openSellQuantity(product)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:bg-[var(--ink)]"><ScanLine className="h-4 w-4" /> Sell product</Button>
                      {automatic ? (
                        <Button type="button" onClick={() => void handleFillAutomatic(product)} disabled={adding || required <= 0} variant="quiet" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--signal)] disabled:opacity-50"><WandSparkles className="h-4 w-4" />{adding ? "Creating..." : required <= 0 ? "Barcodes complete" : `Create all ${required} codes`}</Button>
                      ) : (
                        <Button type="button" onClick={() => openScannerForAddBarcode(product)} disabled={adding} variant="quiet" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--signal)] disabled:opacity-50"><Barcode className="h-4 w-4" /> Add barcode</Button>
                      )}
                    </div>
                  </div>
                </article>;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanner Popup */}
      {scannerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[1.5rem] border border-[var(--line)] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--signal)]">{scannerMode === "addBarcode" ? `Add barcode · ${scannerTargetProduct?.name ?? ""}` : "Scan product"}</p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">{scannerMode === "addBarcode" ? "Scan the manufacturer barcode to add stock codes" : "Scan to find product"}</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--steel)]">{scannerMode === "addBarcode" ? "Camera will capture barcode for this product's stock." : "If product not found, use search below to find it."}</p>
              </div>
              <button type="button" onClick={() => setScannerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--steel)] hover:bg-white"><X className="h-4 w-4" /></button>
            </div>

            {scannerLookupLoading ? <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--signal)]/20 bg-[var(--signal)]/10 px-4 py-3 text-sm font-black text-[var(--signal)]"><Loader2 className="h-4 w-4 animate-spin" /> Searching product...</p> : null}
            {scannerError ? <p className="mt-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">{scannerError}</p> : null}

            <div className="mt-5">
              <BarcodeScanner onScan={(v) => void handleScannerScan(v)} />
            </div>

            {scannedDetailProduct ? (
              <div className="mt-5 grid gap-4 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product found</p>
                <article className="overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-white">
                  <div className="aspect-[16/9] overflow-hidden bg-[var(--surface)]"><img src={productImage(scannedDetailProduct)} alt={scannedDetailProduct.name} className="h-full w-full object-cover" /></div>
                  <div className="p-4">
                    <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product #{scannedDetailProduct.id}</p>
                    <h4 className="mt-1 text-lg font-black text-[var(--ink)]">{scannedDetailProduct.name}</h4>
                    <p className="mt-1 text-xs font-bold text-[var(--steel)]">{reusableProductBarcode(scannedDetailProduct) || "No barcode"}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-[var(--surface)] p-2"><p className="text-sm font-black">{money(scannedDetailProduct.salePrice ?? scannedDetailProduct.price)}</p><p className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Price</p></div><div className="rounded-xl bg-[var(--surface)] p-2"><p className="text-sm font-black">{scannedDetailProduct.stockQuantity}</p><p className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Stock</p></div><div className="rounded-xl bg-[var(--surface)] p-2"><p className="text-sm font-black">{scannedBarcodeValue}</p><p className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Scanned</p></div></div>
                    <Button type="button" onClick={() => void handleScannedDetailSell()} className="mt-4 w-full"><ScanLine className="h-4 w-4" /> Sell product</Button>
                  </div>
                </article>
                <p className="text-xs font-semibold text-[var(--steel)]">Clicking Sell product will ask quantity and populate Worker Tuck Shop checkout.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Quantity Modal */}
      {quantityOpen && quantityProduct ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--signal)]">Quantity for {quantityProduct.name}</p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">How many units to sell?</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--steel)]">This will populate Worker Tuck Shop checkout (quantity, barcode, Product, product id).</p>
              </div>
              <button type="button" onClick={() => setQuantityOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                <img src={productImage(quantityProduct)} alt={quantityProduct.name} className="h-12 w-12 rounded-xl object-cover" />
                <div><p className="text-sm font-black text-[var(--ink)]">{quantityProduct.name}</p><p className="text-xs font-bold text-[var(--steel)]">#{quantityProduct.id} · {money(quantityProduct.salePrice ?? quantityProduct.price)} · Stock {quantityProduct.stockQuantity}</p></div>
              </div>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Quantity purchased<input value={quantityValue} onChange={(e) => setQuantityValue(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1" className={fieldClass()} autoFocus /></label>
              {quantityError ? <p className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-3 py-2 text-sm font-bold text-[var(--danger)]">{quantityError}</p> : null}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="quiet" onClick={() => setQuantityOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleQuantityConfirm}><Plus className="h-4 w-4" /> Confirm sell</Button>
              </div>
              <p className="text-center text-xs font-semibold text-[var(--muted)]">All added products go to cash checkout with their quantity for simple checkout.</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Continue adding vs Go to checkout */}
      {choiceOpen && lastAdded ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--confirm)]">{lastAdded.name} added</p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">Added ×{lastAdded.qty} to cart</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--steel)]">All added products are in cash checkout with their quantity. Continue adding or go to cart.</p>
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--signal-soft)] px-3 py-1 text-xs font-black text-[var(--signal)]"><ShoppingCart className="h-3 w-3" /> {readPendingLines().length} item(s) in cart</p>
              </div>
              <button type="button" onClick={handleContinueAdding} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-3">
              <Button type="button" variant="quiet" onClick={handleContinueAdding} className="w-full"><Plus className="h-4 w-4" /> Continue adding to cart</Button>
              <Button type="button" onClick={handleGoToCheckout} className="w-full"><ShoppingCart className="h-4 w-4" /> Go to cart · Cash Checkout</Button>
              <p className="text-center text-xs font-semibold text-[var(--muted)]">Cash checkout is simple: CASH only, no contact needed.</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
