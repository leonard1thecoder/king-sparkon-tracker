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
  imageUrl: string | null;
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
    imageUrl: event.bannerUrl ?? null,
  };
}

const CARD_ART = [
  "from-[var(--ks-gold)] via-[var(--ks-yellow)] to-[var(--ks-light-green)]",
  "from-[var(--ks-sky)] via-[var(--ks-light-green)] to-[var(--ks-gold)]",
  "from-[var(--ks-light-green)] via-[var(--ks-yellow)] to-[var(--ks-sky)]",
];

function artFor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return CARD_ART[hash % CARD_ART.length];
}

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link href={event.href} className="ks-card group flex h-full flex-col">
      <div className={`relative -mx-5 -mt-5 mb-5 aspect-[16/9] overflow-hidden rounded-t-[var(--ks-radius)] bg-gradient-to-br ${artFor(event.id)}`}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="rounded-[10px] border-2 border-[var(--ks-ink)] bg-white/85 px-4 py-2 text-xs font-black tracking-[0.18em]">
              TICKET
            </span>
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[0.7rem] font-bold text-white backdrop-blur-sm">
          {event.dateLabel}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">
        {event.timeLabel}
      </p>
        <h3 className="mt-2 text-xl font-extrabold leading-tight">{event.name}</h3>
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
