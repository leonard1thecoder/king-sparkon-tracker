"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, PackageCheck, Search, ShoppingCart, Store } from "lucide-react";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { addTuckShopProductToCart, groupProductsByBusiness, money, productImage, productPrice } from "@/lib/tuck-shop/cart";

const BUSINESS_GROUPS_PER_PAGE = 3;

export function TuckShopDashboard({ compact = false }: { compact?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [businessPage, setBusinessPage] = useState(0);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts(nextSearch = search, nextBusinessId = businessId) {
    setLoading(true);
    setError(null);

    try {
      const response = await listTuckShopProducts({
        page: 0,
        size: compact ? 6 : 72,
        search: nextSearch,
        businessId: nextBusinessId ? Number(nextBusinessId) : undefined,
      });
      setProducts(response.content ?? []);
      setBusinessPage(0);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessGroups = useMemo(() => groupProductsByBusiness(products), [products]);
  const totalBusinessPages = Math.max(Math.ceil(businessGroups.length / BUSINESS_GROUPS_PER_PAGE), 1);
  const visibleBusinessGroups = businessGroups.slice(businessPage * BUSINESS_GROUPS_PER_PAGE, businessPage * BUSINESS_GROUPS_PER_PAGE + BUSINESS_GROUPS_PER_PAGE);

  function addToCart(product: Product) {
    addTuckShopProductToCart(product);
    setCartNotice(`${product.name} added to cart.`);
  }

  return (
    <section className="grid gap-5">
      <SectionHeader
        eyebrow="King Sparkon Tuck Shop"
        title="Buy products directly from businesses."
        description="Products are grouped by business, paginated by business, and displayed in horizontal rows so each business catalogue is easy to scan."
      />

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <CardTitle>Marketplace products by business</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Filter results still remain grouped by business. Use each row scroller to view more products from that business.</p>
          </div>
          <form
            className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadProducts(search, businessId);
            }}
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product or business"
                className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
              />
            </label>
            <input
              value={businessId}
              onChange={(event) => setBusinessId(event.target.value)}
              placeholder="Business ID"
              inputMode="numeric"
              className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
            />
            <Button type="submit" variant="quiet">Filter</Button>
          </form>
        </CardHeader>
        <CardContent>
          {error ? <p className="mb-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
          {cartNotice ? (
            <div className="mb-4 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)] sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" /> {cartNotice}</span>
              <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]">
                View cart <ShoppingCart className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading tuck shop products
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <PackageCheck className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 font-black text-[var(--ink)]">No available products yet</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Owners need to add stock and product photos first.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Business page {businessPage + 1} of {totalBusinessPages}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--steel)]">Showing {visibleBusinessGroups.length} of {businessGroups.length} business catalogue group{businessGroups.length === 1 ? "" : "s"}.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setBusinessPage((current) => Math.max(current - 1, 0))} disabled={businessPage === 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-40">
                    <ArrowLeft className="h-4 w-4" /> Prev businesses
                  </button>
                  <button type="button" onClick={() => setBusinessPage((current) => Math.min(current + 1, totalBusinessPages - 1))} disabled={businessPage >= totalBusinessPages - 1} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)] disabled:opacity-40">
                    Next businesses <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {visibleBusinessGroups.map((group) => (
                <section key={group.key} className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--gold)]">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Business catalogue</p>
                        <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{group.businessName}</h2>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{group.products.length} product{group.products.length === 1 ? "" : "s"}{group.businessId ? ` · Business ID ${group.businessId}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">Scroll products →</span>
                      <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)]">
                        Open cart <ShoppingCart className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-[var(--surface)] to-transparent" />
                    <div className="flex snap-x gap-4 overflow-x-auto pb-4 pr-12 [scrollbar-color:var(--signal)_transparent] [scrollbar-width:thin]">
                      {group.products.map((product) => (
                        <article key={product.id} className="w-[18rem] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)] md:w-[20rem]">
                          <img src={productImage(product)} alt={product.name} className="h-44 w-full object-cover" />
                          <div className="grid gap-4 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{group.businessName}</p>
                                <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{product.name}</h3>
                              </div>
                              <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
                            </div>
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Price</p>
                                <p className="money text-2xl font-black text-[var(--ink)]">{money(productPrice(product))}</p>
                              </div>
                              <p className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Stock {product.stockQuantity}</p>
                            </div>
                            <Button onClick={() => addToCart(product)} disabled={product.stockQuantity <= 0}>Add to cart</Button>
                          </div>
                        </article>
                      ))}
                    </div>
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
