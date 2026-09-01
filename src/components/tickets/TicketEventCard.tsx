import Link from "next/link";
import { ArrowRight, Calendar, Clock, MapPin, ShieldCheck, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import type { TicketEvent } from "@/types/tickets";
import { getEventTotals } from "@/services/ticketService";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { getTicketBannerImage } from "./ticketBannerImage";

function EarlyBirdCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (diff <= 0) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[0.65rem] font-black tracking-[0.06em] text-orange-700">
      <Clock className="h-3 w-3" />
      {pad(hours)}H:{pad(minutes)}M:{pad(seconds)}S
    </span>
  );
}

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
  const earlyBirdActive = Boolean(event.earlyBirdEnabled && event.earlyBirdEndsAt && new Date(event.earlyBirdEndsAt).getTime() > Date.now());

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden border-b border-[var(--line)] bg-slate-950">
        {hasImage ? (
          <img src={bannerSrc} alt={`${event.name} banner`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
        ) : (
          <div className="h-full w-full scan-grid" />
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={event.status} />
            {earlyBirdActive ? <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-500 px-2.5 py-1 text-xs font-black text-white"><Tag className="h-3 w-3" /> Early Bird -{event.earlyBirdPercent}%</span> : null}
          </div>
          <span className="truncate rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur">{event.name}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="grid gap-2 text-sm font-semibold text-[var(--steel)]">
          <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-[var(--signal)]" />{formatDate(event.eventDate, event.eventTime)}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--signal)]" />{event.location}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-[3.5rem] text-sm leading-6 text-[var(--steel)]">{event.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalCapacity}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Capacity</p></div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalSold}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Sold</p></div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalAvailable}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Available</p></div>
        </div>
        {earlyBirdActive && event.earlyBirdEndsAt ? <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700"><Clock className="h-3.5 w-3.5" /> Early bird ends in <EarlyBirdCountdown endsAt={event.earlyBirdEndsAt} /></div> : null}

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
          <Link href={eventDetailsHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--ember)]">
            View Event <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={eventCheckoutHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:border-[var(--signal)]">
            <ShieldCheck className="h-4 w-4" /> Buy Ticket
          </Link>
        </div>
      </div>
    </article>
  );
}
