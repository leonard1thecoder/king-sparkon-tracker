import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ShieldCheck } from "lucide-react";
import type { TicketEvent } from "@/types/tickets";
import { getEventTotals } from "@/services/ticketService";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { getTicketBannerImage } from "./ticketBannerImage";

type TicketEventCardProps = {
  event: TicketEvent;
  detailsHref?: string;
  checkoutHref?: string;
};

function formatDate(eventDate: string, eventTime: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(`${eventDate}T${eventTime}`));
}

export function TicketEventCard({ event, detailsHref, checkoutHref }: TicketEventCardProps) {
  const totals = getEventTotals(event);
  const bannerSrc = getTicketBannerImage(event);
  const hasImage = Boolean(bannerSrc);
  const eventDetailsHref = detailsHref ?? `/dashboard/user/tickets/events/${event.id}`;
  const eventCheckoutHref = checkoutHref ?? `/dashboard/user/tickets/checkout/${event.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative flex min-h-60 flex-col items-center justify-center border-b border-[var(--line)] bg-slate-950 p-3 sm:min-h-64">
        {hasImage ? (
          <img src={bannerSrc} alt={`${event.name} banner`} className="h-auto max-h-56 w-full rounded-xl object-contain transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
        ) : (
          <div className="h-48 w-full rounded-xl scan-grid" />
        )}
        <div className="mt-3 flex w-full items-center justify-between gap-2 px-1">
          <TicketStatusBadge status={event.status} />
          <h2 className="truncate text-base font-black text-white">{event.name}</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-3 text-sm font-semibold text-[var(--steel)]">
          <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-[var(--signal)]" />{formatDate(event.eventDate, event.eventTime)}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--signal)]" />{event.location}</span>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--steel)]">{event.description}</p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalCapacity}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Capacity</p></div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalSold}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Sold</p></div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalAvailable}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Available</p></div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={eventDetailsHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
            View Event <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={eventCheckoutHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">
            <ShieldCheck className="h-4 w-4" /> Buy Ticket
          </Link>
        </div>
      </div>
    </article>
  );
}
