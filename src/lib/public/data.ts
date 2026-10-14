import { backendBaseUrl } from "@/lib/backend-auth";
export { buildSlug, idFromSlug, slugify } from "@/lib/public/slug";
export { demoEvents, demoJobs, demoProducts, getDemoEventById, getDemoJobById, getDemoProductById, isDemoId, isDemoJobId, isDemoProductId } from "@/lib/public/demo";
import { demoEvents, demoJobs, demoProducts, getDemoEventById, isDemoId } from "@/lib/public/demo";
import type { EventSet, TicketEvent } from "@/types/tickets";
import type { PageResponse, Product } from "@/lib/types/backend";
import {
  groupOpenSetsByEvent,
  opportunityFromSetsOnly,
  toBookingOpportunity,
  type BookingOpportunity,
} from "@/lib/public/booking-opportunities";
import { formatEventDate, formatEventTime } from "@/lib/public/format";

/*
 * Server-side reads for public pages.
 *
 * The browser API client goes through /api/backend, which requires an auth
 * cookie. Public pages must not depend on that, so they call the backend
 * directly from the server.
 *
 * When the backend returns no published items, clearly-marked sample data
 * is shown instead so visitors can explore the layout. Pages render a
 * "Sample data" badge in that case (see isDemoId in demo.ts).
 */

const REVALIDATE_SECONDS = 300;

async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const url = new URL(`/api${path}`, backendBaseUrl());
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapList<T>(payload: PageResponse<T> | T[] | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.content) ? payload.content : [];
}

export async function getPublishedEvents(): Promise<TicketEvent[]> {
  const payload = await publicGet<PageResponse<TicketEvent> | TicketEvent[]>("/v1/tickets/events");
  const live = unwrapList(payload).filter((event) => event.status === "PUBLISHED");
  return live.length > 0 ? live : demoEvents();
}

export async function getPublishedEventById(id: string): Promise<TicketEvent | null> {
  const event = await publicGet<TicketEvent>(`/v1/tickets/events/${encodeURIComponent(id)}`);
  if (event && event.status === "PUBLISHED") return event;
  return getDemoEventById(id);
}

/*
 * Open-for-bookings opportunities (public).
 *
 * Backend: GET /v1/tickets/sets/open is permitAll and already filters to
 * OPEN sets on DRAFT, future-dated parents — i.e. only events whose owners
 * explicitly created bookable sets. A draft with no OPEN sets never appears
 * here, and prices use OPEN sets only (see booking-opportunities.ts).
 * Parent meta is read best-effort; when the parent cannot be shared publicly
 * the card falls back to set-level details so drafts are never leaked.
 */
export async function getOpenSetsPublic(): Promise<EventSet[]> {
  const payload = await publicGet<EventSet[] | PageResponse<EventSet>>("/v1/tickets/sets/open");
  const sets = unwrapList(payload);
  return sets.filter((set) => set.status === "OPEN");
}

export async function getBookingOpportunities(): Promise<{ opportunities: BookingOpportunity[]; isDemo: boolean }> {
  const sets = await getOpenSetsPublic();
  const grouped = groupOpenSetsByEvent(sets);
  if (grouped.size === 0) return { opportunities: demoBookingOpportunities(), isDemo: true };

  const opportunities: BookingOpportunity[] = [];
  for (const [eventId, eventSets] of grouped) {
    const parent = await publicGet<TicketEvent>(`/v1/tickets/events/${encodeURIComponent(eventId)}`);
    const opportunity =
      parent && (parent.status === "DRAFT" || parent.status === "PUBLISHED")
        ? toBookingOpportunity(parent, eventSets, false)
        : opportunityFromSetsOnly(eventId, eventSets, false);
    if (opportunity) opportunities.push(opportunity);
  }
  opportunities.sort((a, b) => b.openSets - a.openSets);
  if (opportunities.length === 0) return { opportunities: demoBookingOpportunities(), isDemo: true };
  return { opportunities, isDemo: false };
}

/*
 * Demo opportunities for development/preview only. Shown when the backend
 * reports no open sets; the section marks them with a SampleBadge. Never
 * used to calculate production counts or prices.
 */
function demoBookingOpportunities(): BookingOpportunity[] {
  const events = demoEvents().slice(0, 2);
  return [
    {
      eventId: events[0].id,
      eventName: events[0].name,
      location: events[0].location,
      href: "/dashboard/artist/sets",
      dateLabel: formatEventDate(events[0].eventDate),
      timeLabel: formatEventTime(events[0].eventTime),
      imageUrl: events[0].bannerUrl ?? null,
      openSets: 3,
      minPrice: 500,
      maxPrice: 2000,
      priceLabel: "R500 – R2,000",
      isDemo: true,
    },
    {
      eventId: events[1].id,
      eventName: events[1].name,
      location: events[1].location,
      href: "/dashboard/artist/sets",
      dateLabel: formatEventDate(events[1].eventDate),
      timeLabel: formatEventTime(events[1].eventTime),
      imageUrl: events[1].bannerUrl ?? null,
      openSets: 2,
      minPrice: 750,
      maxPrice: 1500,
      priceLabel: "R750 – R1,500",
      isDemo: true,
    },
  ];
}

/*
 * Event Marketplace: published events whose owners enabled the marketplace
 * hub (existing TicketEvent.marketplaceHubEnabled/Price). Vendor catalogue,
 * stock and approvals reuse the existing product endpoints; there is no
 * separate event-product reservation — a submission is never auto-approved.
 */
export async function getMarketplaceHubEvents(): Promise<TicketEvent[]> {
  const events = await getPublishedEvents();
  const hub = events.filter((event) => event.marketplaceHubEnabled);
  if (hub.length > 0) return hub;
  // Demo preview so the marketplace design is visible when no owner has
  // enabled the hub yet; marked with a SampleBadge by the section.
  const firstDemo = events.find((event) => isDemoId(event.id));
  if (!firstDemo) return [];
  return [{ ...firstDemo, marketplaceHubEnabled: true, marketplaceHubPrice: 150 }];
}

export async function getPublicProducts(size = 24): Promise<Product[]> {
  const payload = await publicGet<PageResponse<Product> | Product[]>(`/v1/tuck-shop/products?page=0&size=${size}`);
  const live = unwrapList(payload);
  return live.length > 0 ? live : demoProducts().slice(0, size);
}

export async function getPublicProductById(id: number): Promise<Product | null> {
  const products = await getPublicProducts(100);
  return products.find((product) => product.id === id) ?? null;
}

export type PublicJob = {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  status: string;
};

export async function getPublicJobs(size = 12): Promise<PublicJob[]> {
  const payload = await publicGet<PageResponse<PublicJob> | PublicJob[]>(`/opportunities/jobs?page=0&size=${size}`);
  const live = unwrapList(payload).filter((job) => job.status === "OPEN");
  return live.length > 0 ? live.slice(0, size) : demoJobs().slice(0, size);
}
