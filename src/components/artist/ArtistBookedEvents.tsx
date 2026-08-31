"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatZAR, getBookedEventsForArtist } from "@/services/artistService";
import type { DraftedEvent, ArtistBooking } from "@/types/artist";

export function ArtistBookedEvents() {
  const [tab, setTab] = useState<"UPCOMING" | "PAST">("UPCOMING");
  const [booked, setBooked] = useState<Array<DraftedEvent & { booking: ArtistBooking }>>([]);

  useEffect(() => {
    const load = () => setBooked(getBookedEventsForArtist());
    load();
    window.addEventListener("king-sparkon:artist-bookings", load);
    return () => window.removeEventListener("king-sparkon:artist-bookings", load);
  }, []);

  const upcoming = booked.filter((e) => new Date(e.eventDate) >= new Date(new Date().toDateString()));
  const past = booked.filter((e) => new Date(e.eventDate) < new Date(new Date().toDateString()));
  const list = tab === "UPCOMING" ? upcoming : past;

  return (
    <div className="grid gap-6 p-5 md:p-8">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.04em]">Booked Events</h1>
        <p className="mt-1 text-sm text-[var(--steel)]">Your confirmed performances.</p>
      </div>

      <div className="flex gap-2 rounded-full border border-[var(--line)] bg-white p-1 w-fit">
        {(["UPCOMING", "PAST"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.08em] transition ${tab === t ? "bg-[var(--signal)] text-white" : "text-[var(--steel)] hover:bg-[var(--surface)]"}`}
          >
            {t === "UPCOMING" ? "Upcoming" : "Past"} {t === "UPCOMING" ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-[var(--radius-2xl)] border border-dashed border-[var(--line)] bg-white p-12 text-center">
          <span className="text-4xl">🎵</span>
          <h3 className="mt-3 text-xl font-black">No confirmed performances</h3>
          <p className="mt-2 text-sm text-[var(--steel)]">Your accepted performance requests will appear here.</p>
          <Link href="/dashboard/artist/drafted" className="mt-5 inline-flex min-h-11 rounded-full bg-[var(--signal)] px-6 py-2.5 text-sm font-black text-white">Browse Drafted Events</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((ev) => (
            <Card key={ev.id} className="overflow-hidden">
              <div className="relative h-40">
                <Image src={ev.imageUrl} alt={ev.title} fill className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">✓ Confirmed</span>
              </div>
              <div className="p-5">
                <h3 className="font-black leading-5">{ev.title}</h3>
                <div className="mt-3 grid gap-1.5 text-xs font-semibold text-[var(--steel)]">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[var(--signal)]" /> {ev.eventDate}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[var(--signal)]" /> {ev.startTime} – {ev.endTime}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--signal)]" /> {ev.location}</span>
                </div>
                <p className="mt-3 text-xs font-bold text-[var(--muted)]">{ev.businessName} • {formatZAR(ev.bookingFee)}</p>
                <Link href={`/dashboard/artist/events/${ev.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-white text-sm font-black hover:border-[var(--signal)] hover:text-[var(--signal)]">View Event</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
