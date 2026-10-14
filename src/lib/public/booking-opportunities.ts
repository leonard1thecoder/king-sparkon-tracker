import type { EventSet, TicketEvent } from "@/types/tickets";
import { buildSlug } from "@/lib/public/slug";
import { formatEventDate, formatEventTime } from "@/lib/public/format";

/*
 * Open-for-bookings helpers (pure, unit-tested).
 *
 * Explicit opt-in = an owner created an OPEN set on a DRAFT parent event
 * (backend: TicketEventSetService.createSet requires Owner + own business).
 * A draft never becomes an opportunity merely by existing: only groups with
 * at least one OPEN set are returned, and prices are computed from OPEN sets
 * only — never CANCELLED or BOOKED.
 */

export type BookingOpportunity = {
  eventId: string;
  eventName: string;
  location: string;
  href: string;
  dateLabel: string | null;
  timeLabel: string | null;
  imageUrl: string | null;
  openSets: number;
  minPrice: number | null;
  maxPrice: number | null;
  priceLabel: string | null;
  isDemo: boolean;
};

export function isEligibleSet(set: EventSet): boolean {
  return set.status === "OPEN";
}

function finitePrice(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

/** Group eligible (OPEN) sets by event. Groups with zero open sets are dropped. */
export function groupOpenSetsByEvent(sets: EventSet[]): Map<string, EventSet[]> {
  const grouped = new Map<string, EventSet[]>();
  for (const set of sets) {
    if (!isEligibleSet(set)) continue;
    if (!set.eventId) continue;
    const list = grouped.get(set.eventId) ?? [];
    list.push(set);
    grouped.set(set.eventId, list);
  }
  return grouped;
}

/** Min/max over finite prices of eligible sets. Null when no set carries a price. */
export function priceRangeForSets(sets: EventSet[]): { min: number | null; max: number | null } {
  const prices = sets.filter(isEligibleSet).map((set) => finitePrice(set.price)).filter((price): price is number => price !== null);
  if (prices.length === 0) return { min: null, max: null };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Compact whole-rand formatting for booking ranges: 500 -> "R500", 2000 -> "R2,000". */
export function formatBookingPrice(value: number): string {
  const rounded = Math.round(Number(value));
  return `R${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** Single price or an en-dash range, per the bookings brief. */
export function formatPriceRange(min: number | null, max: number | null): string | null {
  if (min === null || max === null) return null;
  if (min === max) return formatBookingPrice(min);
  return `${formatBookingPrice(min)} – ${formatBookingPrice(max)}`;
}

export function toBookingOpportunity(
  event: Pick<TicketEvent, "id" | "name" | "location" | "eventDate" | "eventTime" | "bannerUrl">,
  sets: EventSet[],
  isDemo = false,
): BookingOpportunity | null {
  const open = sets.filter(isEligibleSet);
  if (open.length === 0) return null;
  const { min, max } = priceRangeForSets(open);
  return {
    eventId: event.id,
    eventName: event.name,
    location: event.location,
    href: "/dashboard/artist/sets",
    dateLabel: event.eventDate ? formatEventDate(event.eventDate) : null,
    timeLabel: event.eventTime ? formatEventTime(event.eventTime) : null,
    imageUrl: event.bannerUrl ?? null,
    openSets: open.length,
    minPrice: min,
    maxPrice: max,
    priceLabel: formatPriceRange(min, max),
    isDemo,
  };
}

/** Fallback meta when the parent event cannot be read (e.g. draft not shared). */
export function opportunityFromSetsOnly(eventId: string, sets: EventSet[], isDemo = false): BookingOpportunity | null {
  const open = sets.filter(isEligibleSet);
  if (open.length === 0) return null;
  const first = open[0];
  const { min, max } = priceRangeForSets(open);
  return {
    eventId,
    eventName: first.eventName || "Open booking opportunity",
    location: "",
    href: "/dashboard/artist/sets",
    dateLabel: first.eventDate ? formatEventDate(first.eventDate) : null,
    timeLabel: first.eventTime ? formatEventTime(first.eventTime) : null,
    imageUrl: null,
    openSets: open.length,
    minPrice: min,
    maxPrice: max,
    priceLabel: formatPriceRange(min, max),
    isDemo,
  };
}

export function bookingOpportunityHref(eventName: string, eventId: string): string {
  return `/events/${buildSlug(eventName, eventId)}`;
}
