import Link from "next/link";
import type { TicketEvent } from "@/types/tickets";
import { buildSlug } from "@/lib/public/slug";
import { formatEventDate, formatEventTime, formatZar } from "@/lib/public/format";

/*
 * Display-ready event data. Every formatted string is produced on the server
 * and passed down, so client components never format dates or money themselves.
 * Formatting in both places can differ between Node and the browser and cause
 * hydration mismatches.
 */
export type EventCardData = {
  id: string;
  name: string;
  location: string;
  href: string;
  sortKey: string;
  searchText: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string | null;
};

export function toEventCardData(event: TicketEvent): EventCardData {
  const prices = event.ticketTypes.map((ticket) => Number(ticket.price)).filter((price) => Number.isFinite(price));
  const lowest = prices.length > 0 ? Math.min(...prices) : null;
  return {
    id: event.id,
    name: event.name,
    location: event.location,
    href: `/events/${buildSlug(event.name, event.id)}`,
    sortKey: `${event.eventDate}${event.eventTime}`,
    searchText: [event.name, event.location, event.description ?? ""].join(" ").toLowerCase(),
    dateLabel: formatEventDate(event.eventDate),
    timeLabel: formatEventTime(event.eventTime),
    priceLabel: lowest === null ? null : formatZar(lowest),
  };
}

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link href={event.href} className="ks-card group flex h-full flex-col">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">
        {event.dateLabel} · {event.timeLabel}
      </p>
      <h3 className="mt-3 text-xl font-extrabold leading-tight">{event.name}</h3>
      <p className="mt-2 text-sm text-[var(--ks-muted)]">{event.location}</p>
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-sm font-semibold">{event.priceLabel ? `From ${event.priceLabel}` : "Tickets"}</span>
        <span aria-hidden="true" className="rounded-full bg-[var(--ks-light-green)] px-3 py-1 text-xs font-bold transition-transform group-hover:translate-x-1">
          View
        </span>
      </div>
    </Link>
  );
}
