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
    <article className="group overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative min-h-52 overflow-hidden bg-[var(--ink)]">
        {hasImage ? (
          <img src={bannerSrc} alt={`${event.name} banner`} className="absolute inset-0 h-full w-full object-cover opacity-86 transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="absolute inset-0 scan-grid bg-[var(--ink)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/30 to-transparent" />
        <div className="absolute left-4 top-4"><TicketStatusBadge status={event.status} /></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="barcode-rule mb-4 text-white" />
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">{event.name}</h2>
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
