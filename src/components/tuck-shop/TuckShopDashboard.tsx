"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  const [businessPage, setBusinessPage] = useState(0);
  const [jobAlertBusinesses, setJobAlertBusinesses] = useState<Set<string>>(() => new Set());
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productRowRef = useRef<HTMLDivElement | null>(null);

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
      setBusinessPage(0);
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

  useEffect(() => {
    setBusinessPage((current) => Math.min(current, Math.max(businessGroups.length - 1, 0)));
  }, [businessGroups.length]);

  useEffect(() => {
    productRowRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [businessPage]);

  const activeBusinessGroup = businessGroups[businessPage] ?? null;

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

  function scrollProducts(direction: "left" | "right") {
    const row = productRowRef.current;
    if (!row) return;

    const distance = Math.max(row.clientWidth * 0.82, 300);
    row.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  }

  function openBusinessPage(nextPage: number) {
    const lastPage = Math.max(businessGroups.length - 1, 0);
    setBusinessPage(Math.min(Math.max(nextPage, 0), lastPage));
  }

  function resetFilters() {
    setSearch("");
    setBusinessId("");
    setBusinessPage(0);
    void loadProducts("", "");
  }

  return (
    <section className="grid gap-6">
      <SectionHeader
        eyebrow="King Sparkon Tuck Shop"
        title="Browse products one business at a time."
        description="Each business has one clean horizontal product row. Use the product arrows to browse stock, then use the business arrows to move to the next or previous shop."
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
          detail="Paginated by product owner"
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
              Search by product or business, or use a business ID. Matching businesses are separated into simple pages.
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
          ) : activeBusinessGroup ? (
            <div className="grid gap-7">
              <div className="flex flex-col gap-2 rounded-[1.25rem] border border-[var(--gold)]/50 bg-[var(--gold)]/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]">Catalogue grouped by business</p>
                  <p className="mt-1 text-sm font-bold text-[var(--steel)]">
                    Showing business {businessPage + 1} of {businessGroups.length}, with {products.length} matching product{products.length === 1 ? "" : "s"} in total.
                  </p>
                </div>
                <Link
                  href="/dashboard/user/shop/cart"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:border-[var(--signal)] hover:bg-[var(--signal)]"
                >
                  Open cart <ShoppingCart className="h-4 w-4" />
                </Link>
              </div>

              <section key={activeBusinessGroup.key} className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-6">
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] border border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)] shadow-[var(--shadow-soft)]">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">
                        {jobAlertBusinesses.has(businessKey(activeBusinessGroup.businessId, activeBusinessGroup.businessName))
                          ? "Followed business · job alerts on"
                          : "Business catalogue"}
                      </p>
                      <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{activeBusinessGroup.businessName}</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                        {activeBusinessGroup.products.length} product{activeBusinessGroup.products.length === 1 ? "" : "s"}
                        {activeBusinessGroup.businessId ? ` · Business ID ${activeBusinessGroup.businessId}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleJobAlert(activeBusinessGroup)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:bg-[var(--gold)]"
                    >
                      {jobAlertBusinesses.has(businessKey(activeBusinessGroup.businessId, activeBusinessGroup.businessName)) ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {jobAlertBusinesses.has(businessKey(activeBusinessGroup.businessId, activeBusinessGroup.businessName)) ? "Job alerts on" : "Job alert"}
                    </button>

                    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]">
                      <button
                        type="button"
                        onClick={() => scrollProducts("left")}
                        disabled={activeBusinessGroup.products.length <= 1}
                        aria-label={`Scroll ${activeBusinessGroup.businessName} products left`}
                        className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="px-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--steel)]">Products</span>
                      <button
                        type="button"
                        onClick={() => scrollProducts("right")}
                        disabled={activeBusinessGroup.products.length <= 1}
                        aria-label={`Scroll ${activeBusinessGroup.businessName} products right`}
                        className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  ref={productRowRef}
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 pr-2 [scrollbar-color:var(--gold)_transparent] [scrollbar-width:thin]"
                >
                  {activeBusinessGroup.products.map((product) => {
                    const salePrice = productPrice(product);
                    const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;

                    return (
                      <article
                        key={product.id}
                        className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[var(--shadow-ledger)] ${compact ? "w-[min(82vw,18rem)]" : "w-[min(84vw,20rem)] sm:w-[20rem]"}`}
                      >
                        <div className="relative overflow-hidden bg-[var(--surface)]">
                          <img src={productImage(product)} alt={product.name} className="h-48 w-full object-cover transition duration-300 hover:scale-[1.03]" />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
                            {hasDiscount ? <StatusPill label="SPECIAL" tone="signal" /> : null}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 p-4">
                          <div className="min-h-[5rem]">
                            <p className="truncate font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{activeBusinessGroup.businessName}</p>
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

                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openBusinessPage(businessPage - 1)}
                    disabled={businessPage === 0}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] transition hover:border-[var(--gold)] hover:bg-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                  >
                    <ChevronLeft className="h-5 w-5" /> Previous business
                  </button>

                  <div className="text-center">
                    <p className="text-sm font-black text-[var(--ink)]">Business {businessPage + 1} of {businessGroups.length}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{activeBusinessGroup.businessName}</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Business pages">
                      {businessGroups.map((group, index) => (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => openBusinessPage(index)}
                          aria-label={`Open ${group.businessName}`}
                          aria-current={index === businessPage ? "page" : undefined}
                          className={`h-2.5 rounded-full transition ${index === businessPage ? "w-8 bg-[var(--signal)]" : "w-2.5 bg-[var(--line)] hover:bg-[var(--gold)]"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBusinessPage(businessPage + 1)}
                    disabled={businessPage >= businessGroups.length - 1}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white transition hover:border-[var(--signal)] hover:bg-[var(--signal)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                  >
                    Next business <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </section>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
