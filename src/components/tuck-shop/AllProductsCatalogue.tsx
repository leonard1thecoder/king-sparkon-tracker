"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Boxes, CheckCircle2, Loader2, RotateCcw, Search, ShoppingCart, Store } from "lucide-react";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TuckShopProductCard } from "@/components/tuck-shop/TuckShopProductCard";
import { addTuckShopProductToCart } from "@/lib/tuck-shop/cart";
import { groupAllProductsByBusiness } from "@/lib/tuck-shop/catalogue";

const PAGE_SIZE = 100;
const MAX_BACKEND_PAGES = 50;

async function loadEveryProduct(search: string, businessId: string) {
  const products: Product[] = [];
  const seen = new Set<number>();

  for (let page = 0; page < MAX_BACKEND_PAGES; page += 1) {
    const response = await listTuckShopProducts({
      page,
      size: PAGE_SIZE,
      search,
      businessId: businessId ? Number(businessId) : undefined,
    });

    for (const product of response.content ?? []) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        products.push(product);
      }
    }

    const totalPages = Number(response.totalPages ?? 1);
    if (!Number.isFinite(totalPages) || page + 1 >= Math.max(totalPages, 1)) break;
  }

  return products;
}

export function AllProductsCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  async function refresh(nextSearch = search, nextBusinessId = businessId) {
    setLoading(true);
    setError(null);

    try {
      setProducts(await loadEveryProduct(nextSearch, nextBusinessId));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessGroups = useMemo(() => groupAllProductsByBusiness(products), [products]);
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + Math.max(Number(product.stockQuantity ?? 0), 0), 0),
    [products],
  );

  function addToCart(product: Product) {
    addTuckShopProductToCart(product);
    setCartNotice(`${product.name} added to cart.`);
  }

  function resetFilters() {
    setSearch("");
    setBusinessId("");
    void refresh("", "");
  }

  return (
    <section className="grid gap-6">
      <SectionHeader
        eyebrow="Complete Tuck Shop catalogue"
        title="All products from every business, with no catalogue pagination."
        description="Every matching business and product is rendered on this page. Products remain grouped by business so customers can understand who owns each item."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="All products" value={loading ? "..." : String(products.length)} detail="No frontend product pagination" tone="confirm" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Businesses" value={loading ? "..." : String(businessGroups.length)} detail="Every matching business group" tone="signal" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Units in stock" value={loading ? "..." : String(totalStock)} detail="Across the complete view" />
      </div>

      <Card>
        <CardHeader className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(34rem,0.9fr)] xl:items-end">
          <div>
            <CardTitle>View all products</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">Filter the complete catalogue without introducing product or business page controls.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/user/shop" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--gold)]"><ArrowLeft className="h-4 w-4" /> Business pages</Link>
              <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--signal)]"><ShoppingCart className="h-4 w-4" /> Open cart</Link>
            </div>
          </div>

          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void refresh(search, businessId);
            }}
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Product or business</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all products" className="min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Business ID</span>
              <input value={businessId} onChange={(event) => setBusinessId(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 501" inputMode="numeric" className="min-h-11 rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            </label>
            <Button type="submit" variant="secondary" className="self-end"><Search className="h-4 w-4" /> Filter</Button>
            <Button type="button" variant="quiet" className="self-end" onClick={resetFilters}><RotateCcw className="h-4 w-4" /> Reset</Button>
          </form>
        </CardHeader>

        <CardContent className="grid gap-6">
          {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
          {cartNotice ? (
            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)] sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" /> {cartNotice}</span>
              <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]">View cart <ShoppingCart className="h-4 w-4" /></Link>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading the complete catalogue</div>
          ) : businessGroups.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-10 text-center">
              <Boxes className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 font-black text-[var(--ink)]">No products match these filters</p>
              <Button type="button" variant="quiet" className="mt-5" onClick={resetFilters}><RotateCcw className="h-4 w-4" /> Show all products</Button>
            </div>
          ) : (
            <div className="grid gap-8">
              {businessGroups.map((group) => (
                <section key={group.key} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] border border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"><Store className="h-5 w-5" /></div>
                    <div>
                      <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Business product group</p>
                      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{group.businessName}</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{group.products.length} product{group.products.length === 1 ? "" : "s"}{group.businessId ? ` · Business ID ${group.businessId}` : ""}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.products.map((product) => <TuckShopProductCard key={product.id} product={product} businessName={group.businessName} fluid onAdd={addToCart} />)}
                  </div>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
