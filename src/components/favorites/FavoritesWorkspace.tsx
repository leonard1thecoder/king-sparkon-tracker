"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Package, Ticket, BriefcaseBusiness, Store, Trash2, MapPin, Calendar } from "lucide-react";
import { businessKey, fetchFavoriteKeysFromBackend, readFavoriteBusinessKeys, removeFavoriteFromBackend, writeFavoriteBusinessKeys } from "@/lib/favorites";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import { getLiveUpcomingEvents } from "@/lib/api/tickets";
import { getPublicJobs } from "@/lib/api/job-opportunities";
import type { Product } from "@/lib/types/backend";
import type { TicketEvent } from "@/types/tickets";
import type { JobOpportunity } from "@/lib/types/backend";
import { groupProductsByBusiness, productPrice, money } from "@/lib/tuck-shop/cart";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProductCard } from "@/components/tuck-shop/ProductCard";

export function FavoritesWorkspace() {
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavoriteKeys(readFavoriteBusinessKeys());
    void fetchFavoriteKeysFromBackend().then(setFavoriteKeys).catch(() => {});
    const handler = () => setFavoriteKeys(readFavoriteBusinessKeys());
    window.addEventListener("storage", handler);
    window.addEventListener("king-sparkon:favorites", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("king-sparkon:favorites", handler as EventListener);
    };
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Products — fetch only favorited businesses in parallel (much faster than complete catalogue)
        // TODO backend: GET /api/v1/favorites/products — returns only products from favorited businesses in one call
        if (favoriteKeys.size === 0) {
          setProducts([]);
        } else {
          const perBusiness = await Promise.all(
            Array.from(favoriteKeys).map(async (key) => {
              const businessId = Number(key);
              const isNumeric = !isNaN(businessId) && String(businessId) === key;
              try {
                const res = await listTuckShopProducts({
                  page: 0,
                  size: 100,
                  businessId: isNumeric ? businessId : undefined,
                  search: isNumeric ? undefined : key,
                });
                return res.content ?? [];
              } catch {
                return [] as Product[];
              }
            })
          );
          const flat = perBusiness.flat();
          const unique = new Map<number, Product>();
          flat.forEach((p) => unique.set(p.id, p));
          // Fallback: if per-business fetch returned empty (e.g., key is name with no exact match), load first page as fallback
          if (unique.size === 0) {
            try {
              const fallback = await listTuckShopProducts({ page: 0, size: 100 });
              (fallback.content ?? []).forEach((p: Product) => unique.set(p.id, p));
            } catch {}
          }
          setProducts(Array.from(unique.values()));
        }
      } catch {}
      try {
        const e = await getLiveUpcomingEvents();
        setEvents(e);
      } catch {}
      try {
        const j = await getPublicJobs({ size: 100 });
        setJobs(j.content ?? []);
      } catch {}
      setLoading(false);
    }
    void load();
  }, [favoriteKeys]);

  const favoriteBusinessGroups = useMemo(() => {
    const groups = groupProductsByBusiness(products);
    return groups.filter((g) => favoriteKeys.has(businessKey(g.businessId, g.businessName)));
  }, [products, favoriteKeys]);

  const favoriteJobs = useMemo(() => {
    return jobs.filter((job) => favoriteKeys.has(businessKey(job.businessId, job.companyName)));
  }, [jobs, favoriteKeys]);

  const favoriteEvents = useMemo(() => {
    // Events currently have no business linkage; show all as placeholder until backend links them.
    // TODO backend: filter events by favorite business ownerId/businessId
    if (favoriteKeys.size === 0) return [];
    return events.slice(0, 6);
  }, [events, favoriteKeys]);

  function removeFavorite(key: string, name: string) {
    const next = new Set(favoriteKeys);
    next.delete(key);
    writeFavoriteBusinessKeys(next);
    setFavoriteKeys(next);
    void removeFavoriteFromBackend(key);
  }

  if (favoriteKeys.size === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="grid place-items-center p-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">No favorites yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--steel)]">Tap the heart on any business in the shop to favorite it. Your favorites will appear here with quick access to their products, tickets and job posts.</p>
            <Link href="/dashboard/user/shop" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-500 px-6 text-sm font-black text-white hover:bg-rose-600">
              <Store className="h-4 w-4" /> Browse shop
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {/* Header stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500">
              <Heart className="h-5 w-5 fill-rose-500" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Favorited businesses</p>
              <p className="text-2xl font-black">{favoriteKeys.size}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Favorite products</p>
              <p className="text-2xl font-black">{favoriteBusinessGroups.reduce((a, g) => a + g.products.length, 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Favorite jobs</p>
              <p className="text-2xl font-black">{favoriteJobs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Favorite businesses */}
      <section className="grid gap-6">
        <h2 className="text-xl font-black tracking-[-0.04em]">Favorited businesses</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from(favoriteKeys).map((key) => {
            const group = favoriteBusinessGroups.find((g) => businessKey(g.businessId, g.businessName) === key);
            const businessName = group?.businessName ?? key;
            const businessId = group?.businessId ?? null;
            return (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500">
                      <Store className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{businessName}</p>
                      <p className="text-xs font-semibold text-[var(--muted)]">{businessId ? `Business ID ${businessId}` : "Business"} · {group?.products.length ?? 0} products</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFavorite(key, businessName)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--steel)] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${businessName} from favorites`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {/* Quick links */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link href={`/dashboard/user/shop?businessId=${businessId ?? ""}`} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 text-xs font-black hover:border-[var(--signal)]">
                      <Package className="h-3.5 w-3.5" /> Products
                    </Link>
                    <Link href="/dashboard/user/tickets/buy" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 text-xs font-black hover:border-[var(--signal)]">
                      <Ticket className="h-3.5 w-3.5" /> Tickets
                    </Link>
                    <Link href="/dashboard/user/jobs" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 text-xs font-black hover:border-[var(--signal)]">
                      <BriefcaseBusiness className="h-3.5 w-3.5" /> Jobs
                    </Link>
                  </div>
                  {/* Backend: This card will be hydrated from GET /api/businesses/{id}/overview bundling tickets/products/jobs */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Favorite Products */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Products from favorites</h2>
          <Link href="/dashboard/user/shop" className="text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">View shop</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white" />
            ))}
          </div>
        ) : favoriteBusinessGroups.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-[var(--muted)]">No products from your favorites yet. Favorite more businesses in the shop.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favoriteBusinessGroups.flatMap((g) => g.products).slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} showBusiness size="sm" />
            ))}
          </div>
        )}
      </section>

      {/* Favorite Tickets */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Tickets from favorites</h2>
          <Link href="/dashboard/user/tickets/buy" className="text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">View tickets</Link>
        </div>
        {favoriteEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-[var(--muted)]">No tickets linked to your favorites yet. Events will appear here once backend links tickets to businesses.</p>
            {/* Backend: GET /api/user/favorites/tickets */}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favoriteEvents.map((e) => (
              <Card key={e.id} className="overflow-hidden">
                <div className="h-44 overflow-hidden bg-slate-950">
                  {e.bannerUrl ? <img src={e.bannerUrl} alt={e.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-800" />}
                </div>
                <CardContent className="p-4">
                  <h3 className="line-clamp-2 text-sm font-black">{e.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]"><MapPin className="h-3.5 w-3.5" />{e.location}</p>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]"><Calendar className="h-3.5 w-3.5" />{e.eventDate}</p>
                  <Link href={`/dashboard/user/tickets/events/${e.id}`} className="mt-3 flex min-h-10 items-center justify-center rounded-xl border border-[var(--signal)] bg-white text-xs font-black hover:bg-[var(--signal)] hover:text-white">View tickets</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Favorite Jobs */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Job posts from favorites</h2>
          <Link href="/dashboard/user/jobs" className="text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">View jobs</Link>
        </div>
        {favoriteJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-[var(--muted)]">No job posts from your favorites yet.</p>
            {/* Backend: GET /api/user/favorites/jobs */}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favoriteJobs.slice(0, 8).map((job) => (
              <Card key={job.id} className="p-4">
                <h3 className="line-clamp-2 text-sm font-black">{job.title}</h3>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{job.companyName}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--steel)]">{job.description}</p>
                <Link href={`/dashboard/user/jobs`} className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-3 text-xs font-black">View job</Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
