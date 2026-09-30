"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Loader2, Minus, PackageCheck, Plus, Search, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/tuck-shop/ProductCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { normalizeApiError } from "@/lib/api/client";
import { createIdempotencyKey } from "@/lib/api/contracts";
import { createWorkerStaffPurchase, getWorkerDashboard, listWorkerMallProducts, listWorkerMallPurchases } from "@/lib/api/worker-dashboard";
import type { Product, TuckShopPurchase, WorkerDashboardStats } from "@/lib/types/backend";
import { productPrice } from "@/lib/tuck-shop/cart";

export function WorkerMallWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [dashboard, setDashboard] = useState<WorkerDashboardStats | null>(null);
  const [purchases, setPurchases] = useState<TuckShopPurchase[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [page, dash, mine] = await Promise.all([
        listWorkerMallProducts({ page: 0, size: 48, search: appliedSearch || undefined }),
        getWorkerDashboard().catch(() => null),
        listWorkerMallPurchases().catch(() => [] as TuckShopPurchase[]),
      ]);
      setProducts(page.content ?? []);
      setTotal(Number(page.totalElements ?? (page.content ?? []).length));
      if (dash) setDashboard(dash);
      setPurchases(Array.isArray(mine) ? mine : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch]);

  const staffPercent = useMemo(() => Number(dashboard?.staffDiscountPercentage ?? 0), [dashboard]);
  const staffEnabled = staffPercent > 0;

  function quantityFor(productId: number) {
    return Math.max(1, quantities[productId] ?? 1);
  }

  async function buyAtStaffPrice(product: Product) {
    if (!staffEnabled) {
      setError("No staff discount is set for this worker. Ask the business owner to set a staff %.");
      return;
    }
    setBuyingId(product.id);
    setError(null);
    setNotice(null);
    try {
      const result = await createWorkerStaffPurchase(
        { items: [{ productId: product.id, quantity: quantityFor(product.id) }] },
        createIdempotencyKey("worker-mall-staff-purchase"),
      );
      setNotice(`Staff order #${result.transactionId} created at staff price (R${Number(result.netTotal ?? 0).toFixed(2)}).`);
      const mine = await listWorkerMallPurchases().catch(() => [] as TuckShopPurchase[]);
      setPurchases(Array.isArray(mine) ? mine : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="grid gap-8 p-5 md:p-8 pb-10">
      {staffEnabled ? (
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--signal)]/30 bg-[var(--signal-soft)] px-4 py-1.5 text-xs font-black text-[var(--signal-strong)]"><BadgePercent className="h-4 w-4" /> Staff price active · {staffPercent}% off sale prices · applies automatically at checkout</p>
      ) : (
        <Card className="border-dashed p-5 text-sm font-bold text-[var(--steel)]">No staff discount set yet. You can still browse the mall — ask your owner to add a staff % (0-90) to unlock staff price.</Card>
      )}

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">{notice}</p> : null}

      <section className="grid gap-4">
        <SectionHeader title="My staff purchases" description={purchases.length > 0 ? `${purchases.length} staff order${purchases.length === 1 ? "" : "s"}` : "Your staff-price checkouts will appear here"} eyebrow="MY PURCHASES" />
        {purchases.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {purchases.slice(0, 6).map((purchase) => (
              <Card key={purchase.transactionId} className="p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--signal)]"><PackageCheck className="h-4 w-4" /> Order #{purchase.transactionId}</div>
                <p className="mt-2 text-base font-black">{purchase.businessName ?? "King Sparkon Mall"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--steel)]">{purchase.items?.length ?? 0} items · R{(purchase.netTotal ?? purchase.productTotal ?? 0).toFixed(2)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-[var(--signal)]" />
            <p className="mt-2 text-sm font-bold text-[var(--steel)]">No staff purchases yet. Buy below at staff price.</p>
          </Card>
        )}
      </section>

      <section className="grid gap-4">
        <SectionHeader title="Staff mall" description={total > 0 ? `${total} products · staff prices shown in green` : "Browse mall products with staff prices"} eyebrow="SHOP" />
        <form onSubmit={(event) => { event.preventDefault(); setAppliedSearch(search.trim()); }} className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, barcodes, businesses…" className="min-h-12 w-full rounded-[1.2rem] border border-[var(--line)] bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
          </label>
          <Button type="submit">Search</Button>
        </form>

        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading staff mall…</p>
        ) : products.length === 0 ? (
          <Card className="p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <p className="mt-3 font-black">No products found</p>
            <p className="mt-1 text-sm text-[var(--steel)]">Try a different search.</p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const qty = quantityFor(product.id);
              const staffPrice = product.staffPrice ?? null;
              return (
                <div key={product.id} className="grid gap-3">
                  <ProductCard product={product} size="sm" />
                  <div className="flex items-center justify-between gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white p-3">
                    <div className="inline-flex items-center gap-2">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setQuantities((current) => ({ ...current, [product.id]: Math.max(1, qty - 1) }))} className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)]"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-black">{qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQuantities((current) => ({ ...current, [product.id]: qty + 1 }))} className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)]"><Plus className="h-4 w-4" /></button>
                    </div>
                    <Button type="button" disabled={buyingId === product.id || !staffEnabled || product.stockQuantity <= 0} onClick={() => void buyAtStaffPrice(product)}>
                      {buyingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
                      {staffPrice ? `Buy R${Number(staffPrice).toFixed(2)}` : `Buy R${Number(productPrice(product)).toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
