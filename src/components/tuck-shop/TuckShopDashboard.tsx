"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  Boxes,
  CheckCircle2,
  Eye,
  Loader2,
  PackageCheck,
  RotateCcw,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  addTuckShopProductToCart,
  groupProductsByBusiness,
  money,
  productImage,
  productPrice,
} from "@/lib/tuck-shop/cart";

const JOB_ALERTS_STORAGE_KEY = "king-sparkon-job-alert-businesses";

function businessKey(businessId?: number | null, businessName?: string) {
  return String(businessId ?? businessName ?? "unknown");
}

function readJobAlertBusinessKeys() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const stored = JSON.parse(window.localStorage.getItem(JOB_ALERTS_STORAGE_KEY) ?? "[]") as string[];
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set<string>();
  }
}

function writeJobAlertBusinessKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOB_ALERTS_STORAGE_KEY, JSON.stringify(Array.from(keys)));
}

export function TuckShopDashboard({ compact = false }: { compact?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [jobAlertBusinesses, setJobAlertBusinesses] = useState<Set<string>>(() => new Set());
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts(nextSearch = search, nextBusinessId = businessId) {
    setLoading(true);
    setError(null);

    try {
      const response = await listTuckShopProducts({
        page: 0,
        size: 100,
        search: nextSearch,
        businessId: nextBusinessId ? Number(nextBusinessId) : undefined,
      });
      setProducts(response.content ?? []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setJobAlertBusinesses(readJobAlertBusinessKeys());
    void loadProducts("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessGroups = useMemo(() => {
    const groups = groupProductsByBusiness(products);
    return groups.sort((left, right) => {
      const leftFollowed = jobAlertBusinesses.has(businessKey(left.businessId, left.businessName));
      const rightFollowed = jobAlertBusinesses.has(businessKey(right.businessId, right.businessName));
      if (leftFollowed !== rightFollowed) return leftFollowed ? -1 : 1;
      return left.businessName.localeCompare(right.businessName);
    });
  }, [jobAlertBusinesses, products]);

  const totalStock = useMemo(
    () => products.reduce((total, product) => total + Math.max(Number(product.stockQuantity ?? 0), 0), 0),
    [products],
  );

  const promotedProducts = useMemo(
    () => products.filter((product) => product.salePrice !== undefined && product.salePrice < product.price).length,
    [products],
  );

  function addToCart(product: Product) {
    addTuckShopProductToCart(product);
    setCartNotice(`${product.name} added to cart.`);
  }

  function toggleJobAlert(group: { businessId?: number | null; businessName: string }) {
    const key = businessKey(group.businessId, group.businessName);
    const nextKeys = new Set(jobAlertBusinesses);

    if (nextKeys.has(key)) {
      nextKeys.delete(key);
      setCartNotice(`Job alerts muted for ${group.businessName}.`);
    } else {
      nextKeys.add(key);
      setCartNotice(`Job alerts enabled for ${group.businessName}.`);
    }

    writeJobAlertBusinessKeys(nextKeys);
    setJobAlertBusinesses(nextKeys);
  }

  function resetFilters() {
    setSearch("");
    setBusinessId("");
    void loadProducts("", "");
  }

  return (
    <section className="grid gap-6">
      <SectionHeader
        eyebrow="King Sparkon Tuck Shop"
        title="Browse every available product."
        description="The catalogue loads the complete product set, keeps ownership clear, and uses a responsive grid instead of hiding stock inside horizontal carousels."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Products visible"
          value={loading ? "..." : String(products.length)}
          detail="Complete loaded catalogue"
          tone="confirm"
          icon={<Boxes className="h-5 w-5" />}
        />
        <MetricCard
          label="Businesses"
          value={loading ? "..." : String(businessGroups.length)}
          detail="Grouped by product owner"
          tone="signal"
          icon={<Store className="h-5 w-5" />}
        />
        <MetricCard label="Units in stock" value={loading ? "..." : String(totalStock)} detail="Across visible products" />
        <MetricCard label="Special prices" value={loading ? "..." : String(promotedProducts)} detail="Products with sale pricing" />
      </div>

      <Card>
        <CardHeader className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(34rem,0.9fr)] xl:items-end">
          <div>
            <CardTitle>Product catalogue</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">
              Search by product or business, or use a business ID. Every matching product remains visible in a clean card grid.
            </p>
          </div>

          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadProducts(search, businessId);
            }}
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Product or business</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the catalogue"
                  className="min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
                />
              </span>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Business ID</span>
              <input
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 501"
                inputMode="numeric"
                className="min-h-11 rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
              />
            </label>

            <Button type="submit" variant="secondary" className="self-end">
              <Search className="h-4 w-4" /> Filter
            </Button>
            <Button type="button" variant="quiet" className="self-end" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </form>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="mb-5 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          {cartNotice ? (
            <div className="mb-5 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)] sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--confirm)]" /> {cartNotice}
              </span>
              <Link
                href="/dashboard/user/shop/cart"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]"
              >
                View cart <ShoppingCart className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading all products
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-10 text-center">
              <PackageCheck className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 font-black text-[var(--ink)]">No products match these filters</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Reset the filters to display the complete catalogue again.</p>
              <Button type="button" variant="quiet" className="mt-5" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" /> Show all products
              </Button>
            </div>
          ) : (
            <div className="grid gap-7">
              <div className="flex flex-col gap-2 rounded-[1.25rem] border border-[var(--gold)]/50 bg-[var(--gold)]/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]">Complete catalogue loaded</p>
                  <p className="mt-1 text-sm font-bold text-[var(--steel)]">
                    Showing all {products.length} matching product{products.length === 1 ? "" : "s"} across {businessGroups.length} business{businessGroups.length === 1 ? "" : "es"}.
                  </p>
                </div>
                <Link
                  href="/dashboard/user/shop/cart"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:border-[var(--signal)] hover:bg-[var(--signal)]"
                >
                  Open cart <ShoppingCart className="h-4 w-4" />
                </Link>
              </div>

              {businessGroups.map((group) => {
                const followed = jobAlertBusinesses.has(businessKey(group.businessId, group.businessName));

                return (
                  <section key={group.key} className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] border border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)] shadow-[var(--shadow-soft)]">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">
                            {followed ? "Followed business · job alerts on" : "Business catalogue"}
                          </p>
                          <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{group.businessName}</h2>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                            {group.products.length} product{group.products.length === 1 ? "" : "s"}
                            {group.businessId ? ` · Business ID ${group.businessId}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleJobAlert(group)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:bg-[var(--gold)]"
                        >
                          {followed ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          {followed ? "Job alerts on" : "Job alert"}
                        </button>
                      </div>
                    </div>

                    <div className={`grid gap-4 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"}`}>
                      {group.products.map((product) => {
                        const salePrice = productPrice(product);
                        const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;

                        return (
                          <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[var(--shadow-ledger)]">
                            <div className="relative overflow-hidden bg-[var(--surface)]">
                              <img src={productImage(product)} alt={product.name} className="h-48 w-full object-cover transition duration-300 hover:scale-[1.03]" />
                              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
                                {hasDiscount ? <StatusPill label="SPECIAL" tone="signal" /> : null}
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col gap-4 p-4">
                              <div className="min-h-[5rem]">
                                <p className="truncate font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{group.businessName}</p>
                                <h3 className="mt-1 line-clamp-2 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{product.name}</h3>
                              </div>

                              <div className="grid grid-cols-2 gap-3 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                                <div>
                                  <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Price</p>
                                  <p className="money mt-1 text-xl font-black text-[var(--ink)]">{money(salePrice)}</p>
                                  {hasDiscount ? <p className="money text-xs font-bold text-[var(--muted)] line-through">{money(product.price)}</p> : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Stock</p>
                                  <p className="money mt-1 text-xl font-black text-[var(--ink)]">{product.stockQuantity}</p>
                                  <p className="text-xs font-semibold text-[var(--steel)]">units ready</p>
                                </div>
                              </div>

                              <div className="mt-auto grid gap-2 sm:grid-cols-2">
                                <Button onClick={() => addToCart(product)} disabled={product.stockQuantity <= 0} className="w-full">
                                  <ShoppingCart className="h-4 w-4" /> Add
                                </Button>
                                <Link
                                  href={`/dashboard/user/shop/products/${product.id}`}
                                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--surface)]"
                                >
                                  <Eye className="h-4 w-4" /> Details
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
