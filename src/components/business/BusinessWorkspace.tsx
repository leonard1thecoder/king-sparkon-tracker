"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Heart, MapPin, Package, Store, Ticket, Calendar } from "lucide-react";
import { addFavoriteToBackend, businessKey, fetchFavoriteKeysFromBackend, readFavoriteBusinessKeys, removeFavoriteFromBackend, writeFavoriteBusinessKeys } from "@/lib/favorites";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import { getLiveUpcomingEvents } from "@/lib/api/tickets";
import { getPublicJobs } from "@/lib/api/job-opportunities";
import type { Product } from "@/lib/types/backend";
import type { TicketEvent } from "@/types/tickets";
import type { JobOpportunity } from "@/lib/types/backend";
import { groupProductsByBusiness } from "@/lib/tuck-shop/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProductCard } from "@/components/tuck-shop/ProductCard";

export function BusinessWorkspace({ businessKeyParam }: { businessKeyParam: string }) {
  const decodedKey = decodeURIComponent(businessKeyParam);
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const isFavorited = favoriteKeys.has(decodedKey);

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
        // Fetch only this business's products via filtered endpoint — single request, not complete catalogue
        // TODO backend: GET /api/v1/businesses/{businessKey}/overview handles this server-side
        const businessIdNum = Number(decodedKey);
        const isNumeric = !isNaN(businessIdNum) && String(businessIdNum) === decodedKey;
        const p = await listTuckShopProducts({
          page: 0,
          size: 100,
          businessId: isNumeric ? businessIdNum : undefined,
          search: isNumeric ? undefined : decodedKey,
        });
        setProducts(p.content ?? []);
      } catch {}
      try {
        const e = await getLiveUpcomingEvents();
        setEvents(e);
      } catch {}
      try {
        const j = await getPublicJobs({ size: 100 });
        setJobs(j.content);
      } catch {}
      setLoading(false);
    }
    void load();
  }, [decodedKey]);

  const businessGroups = useMemo(() => groupProductsByBusiness(products), [products]);
  const currentGroup = useMemo(() => businessGroups.find((g) => businessKey(g.businessId, g.businessName) === decodedKey), [businessGroups, decodedKey]);
  const businessName = currentGroup?.businessName ?? decodedKey;
  const businessId = currentGroup?.businessId ?? (Number(decodedKey) ? Number(decodedKey) : null);

  const businessProducts = currentGroup?.products ?? products.filter((p) => businessKey((p as unknown as { businessId?: number | null }).businessId ?? undefined, p.businessName ?? undefined) === decodedKey || p.businessName === businessName).slice(0, 12);
  const businessJobs = useMemo(() => jobs.filter((j) => businessKey(j.businessId ?? undefined, j.companyName ?? undefined) === decodedKey || j.companyName === businessName), [jobs, decodedKey, businessName]);
  const businessEvents = useMemo(() => {
    // No direct business linkage on TicketEvent; show all with note until backend adds ownerId/businessId to events
    // TODO backend: filter by event.ownerId -> business
    return events.slice(0, 6);
  }, [events]);

  function toggleFavorite() {
    const next = new Set(favoriteKeys);
    const wasFavorited = next.has(decodedKey);
    if (wasFavorited) {
      next.delete(decodedKey);
      void removeFavoriteFromBackend(decodedKey);
    } else {
      next.add(decodedKey);
      void addFavoriteToBackend(decodedKey);
    }
    writeFavoriteBusinessKeys(next);
    setFavoriteKeys(next);
  }

  return (
    <div className="grid gap-6">
      <Link href="/dashboard/user/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--ink)]">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      {/* Business header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--signal-soft)] to-[var(--surface)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-white text-[var(--signal)] shadow-sm">
                <Store className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--signal)]">Business</p>
                <h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">{businessName}</h1>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{businessId ? `Business ID ${businessId} · ` : ""}{businessProducts.length} products · {businessEvents.length} tickets · {businessJobs.length} job posts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-6 text-sm font-black transition ${isFavorited ? "border-rose-200 bg-rose-500 text-white hover:bg-rose-600" : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-white" : isFavorited ? "fill-rose-500" : ""}`} />
              {isFavorited ? "Favorited" : "Favorite"}
            </button>
          </div>
        </div>
        <CardContent className="grid grid-cols-3 gap-3 bg-white p-4 text-center">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="text-lg font-black">{businessProducts.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Products</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="text-lg font-black">{businessEvents.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Tickets</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="text-lg font-black">{businessJobs.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Jobs</p>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Products</h2>
          <Link href="/dashboard/user/shop" className="text-xs font-black text-[var(--signal)] hover:underline">View all products</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white" />)}</div>
        ) : businessProducts.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-sm font-semibold text-[var(--muted)]">No products found for this business.</p></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessProducts.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} showBusiness={false} size="sm" />
            ))}
          </div>
        )}
      </section>

      {/* Tickets */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Tickets</h2>
          <Link href="/dashboard/user/tickets/buy" className="text-xs font-black text-[var(--signal)] hover:underline">View tickets</Link>
        </div>
        {businessEvents.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-sm font-semibold text-[var(--muted)]">No tickets for this business yet.</p></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessEvents.slice(0, 6).map((e) => (
              <Card key={e.id} className="overflow-hidden">
                <div className="h-44 overflow-hidden bg-slate-950">
                  {e.bannerUrl ? <img src={e.bannerUrl} alt={e.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-800" />}
                </div>
                <CardContent className="p-4">
                  <h3 className="line-clamp-2 text-sm font-black">{e.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]"><MapPin className="h-3.5 w-3.5" />{e.location}</p>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]"><Calendar className="h-3.5 w-3.5" />{e.eventDate}</p>
                  <Link href={`/dashboard/user/tickets/events/${e.id}`} className="mt-3 flex min-h-10 items-center justify-center rounded-xl border border-[var(--signal)] bg-white text-xs font-black">View event</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Backend: tickets filtered by business via GET /api/businesses/{businessKey}/tickets */}
      </section>

      {/* Jobs */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Job posts</h2>
          <Link href="/dashboard/user/jobs" className="text-xs font-black text-[var(--signal)] hover:underline">View jobs</Link>
        </div>
        {businessJobs.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-sm font-semibold text-[var(--muted)]">No job posts from this business.</p></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {businessJobs.slice(0, 6).map((job) => (
              <Card key={job.id} className="p-4">
                <h3 className="line-clamp-2 text-sm font-black">{job.title}</h3>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{job.companyName}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--steel)]">{job.description}</p>
                <Link href={`/jobs/${job.id}`} className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-3 text-xs font-black">View job</Link>
              </Card>
            ))}
          </div>
        )}
        {/* Backend: jobs filtered by business via GET /api/businesses/{businessKey}/jobs */}
      </section>
    </div>
  );
}
