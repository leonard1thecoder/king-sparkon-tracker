"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, QrCode, ScanLine, ShieldCheck, Ticket as TicketIcon } from "lucide-react";
import { TicketScannerPanel } from "@/components/tickets/TicketScannerPanel";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { getTicketBannerImage } from "@/components/tickets/ticketBannerImage";
import { getEventTotals } from "@/services/ticketService";
import { getUpcomingEvents } from "@/services/ticketService";
import type { TicketEvent } from "@/types/tickets";
import { Button } from "@/components/ui/Button";

function isEventStarted(event: TicketEvent) {
  const startsAt = new Date(`${event.eventDate}T${event.eventTime || "00:00"}`);
  return startsAt.getTime() <= Date.now();
}

function formatDate(eventDate: string, eventTime: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(`${eventDate}T${eventTime}`));
}

export function WorkerTicketGateListing() {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<TicketEvent | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUpcomingEvents()
      .then((next) => {
        if (!mounted) return;
        // Show like user dashboard: upcoming published events, but also include all for visibility
        setEvents(next.filter((e) => e.status === "PUBLISHED"));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Could not load events");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sorted = useMemo(() => events.slice().sort((a, b) => `${a.eventDate}T${a.eventTime}`.localeCompare(`${b.eventDate}T${b.eventTime}`)), [events]);

  function openScan(event: TicketEvent) {
    if (!isEventStarted(event)) {
      setError(`Scan disabled: ${event.name} has not started yet (${formatDate(event.eventDate, event.eventTime)}).`);
      return;
    }
    setActiveEvent(event);
    setScanOpen(true);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
        <p className="font-black text-[var(--ink)]">Tickets shown as on user dashboard — each event has a Scan ticket button.</p>
        <p className="mt-1">Worker cannot scan when event is not started. Gate verification camera appears as a popup after clicking Scan ticket. After confirming, use Scan another ticket.</p>
      </div>

      {error ? <p className="rounded-[1.2rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white p-10 text-center">
          <TicketIcon className="mx-auto h-10 w-10 text-[var(--signal)]" />
          <h2 className="mt-4 text-2xl font-black">No published events</h2>
          <p className="mt-2 text-sm font-semibold text-[var(--steel)]">No events available for scanning.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((event) => {
            const started = isEventStarted(event);
            const totals = getEventTotals(event);
            const banner = getTicketBannerImage(event);
            return (
              <article key={event.id} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                <div className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden border-b border-[var(--line)] bg-slate-950">
                  {banner ? <img src={banner} alt={`${event.name} banner`} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full scan-grid" />}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <TicketStatusBadge status={event.status} />
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
                  <div className="mt-5">
                    <Button type="button" onClick={() => openScan(event)} disabled={!started} className="w-full">
                      <QrCode className="h-4 w-4" /> {started ? "Scan ticket" : `Scan disabled — starts ${formatDate(event.eventDate, event.eventTime)}`}
                    </Button>
                    {!started ? <p className="mt-2 text-center text-xs font-bold text-[var(--danger)]">Event not started — scanning locked.</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {scanOpen && activeEvent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--signal)]">Gate verification for {activeEvent.name}</p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">Scan first, verify the person second</h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--steel)]"><Clock className="h-4 w-4" />{formatDate(activeEvent.eventDate, activeEvent.eventTime)} · {activeEvent.location}</p>
              </div>
              <button type="button" onClick={() => setScanOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--steel)] hover:bg-[var(--surface)]">✕</button>
            </div>
            <TicketScannerPanel />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="quiet" onClick={() => setScanOpen(false)}>Close</Button>
              <Button type="button" onClick={() => { setScanOpen(false); setTimeout(() => setScanOpen(true), 80); }}><ScanLine className="h-4 w-4" /> Scan another ticket</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
