"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { DraftedEvent } from "@/types/artist";
import { formatZAR } from "@/services/artistService";
import { ArtistTypeBadge } from "./ArtistStatusBadge";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

export function EventCard({ event, href }: { event: DraftedEvent; href: string }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-ledger)] hover:border-[var(--line-strong)]">
      <Link href={href} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 sm:h-56">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href} className="group/title">
          <h3 className="line-clamp-2 text-[17px] font-black leading-6 tracking-[-0.02em] text-[var(--ink)] group-hover/title:text-[var(--signal-strong)] transition-colors">
            {event.title}
          </h3>
        </Link>

        <div className="mt-3 grid gap-2 text-sm font-semibold text-[var(--steel)]">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            {formatDateLong(event.eventDate)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            {event.startTime} – {event.endTime}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            {event.location}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[var(--line)] pt-4">
          {event.businessLogoUrl ? (
            <Image src={event.businessLogoUrl} alt={event.businessName} width={28} height={28} className="h-7 w-7 rounded-full border border-[var(--line)] object-cover" />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[0.6rem] font-black">B</span>
          )}
          <span className="truncate text-xs font-bold text-[var(--muted)]">Hosted by {event.businessName}</span>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">Looking for</p>
            <div className="mt-1">
              <ArtistTypeBadge type={event.artistType} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">Booking fee</p>
              <p className="mt-1 text-[1.05rem] font-black tracking-[-0.02em] text-[var(--ink)]">{formatZAR(event.bookingFee)}</p>
            </div>
          </div>
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 hover:border-[var(--signal-strong)] hover:bg-[var(--signal-strong)]"
        >
          View Event
        </Link>
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white">
      <div className="h-56 bg-slate-100" />
      <div className="p-5">
        <div className="h-5 w-3/4 rounded bg-slate-100" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-50" />
          <div className="h-3 w-2/3 rounded bg-slate-50" />
        </div>
        <div className="mt-5 h-11 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
