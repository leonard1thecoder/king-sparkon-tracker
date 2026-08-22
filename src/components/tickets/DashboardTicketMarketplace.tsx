"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, ShieldCheck, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketEventCard } from "@/components/tickets/TicketEventCard";
import { getLiveUpcomingEvents } from "@/lib/api/tickets";
import type { EventStatus, TicketEvent } from "@/types/tickets";

const statusOptions: Array<"ALL" | EventStatus> = ["ALL", "DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

export function DashboardTicketMarketplace() {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EventStatus>("ALL");

  useEffect(() => {
    let mounted = true;
    getLiveUpcomingEvents()
      .then((nextEvents) => {
        if (!mounted) return;
        setEvents(nextEvents);
        setLoadError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setEvents([]);
        setLoadError(error instanceof Error ? error.message : "Live ticket events could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const textMatch = event.name.toLowerCase().includes(query.toLowerCase());
      const locationMatch = !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());
      const dateMatch = !dateFilter || event.eventDate === dateFilter;
      const statusMatch = statusFilter === "ALL" || event.status === statusFilter;
      return textMatch && locationMatch && dateMatch && statusMatch;
    });
  }, [dateFilter, events, locationFilter, query, statusFilter]);

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Buy event tickets" description="Browse live backend ticket events, inspect capacity, and add QR tickets to the verified Stripe cart." />
      <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
        <div className="flex justify-center overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-soft)] md:p-3">
          <Image
            src="https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/lego_party.png"
            alt="King Sparkon Lego party"
            width={1200}
            height={675}
            className="h-auto max-h-[220px] w-auto max-w-full object-contain sm:max-h-[280px] md:max-h-[360px] lg:max-h-[400px]"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1100px"
          />
        </div>

        <section id="events" className="scroll-mt-28">
          <div className="rounded-[2.2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Upcoming events</p><h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">Search event tickets</h2></div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--steel)]"><Filter className="h-4 w-4 text-[var(--signal)]" /> Name · Date · Location · Status</div>
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr]">
              <label className="flex min-h-12 items-center gap-3 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]"><Search className="h-4 w-4 text-[var(--signal)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by event name" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--muted)]" /></label>
              <input type="text" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Location" className="min-h-12 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-12 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | EventStatus)} className="min-h-12 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            </div>
          </div>

          {loadError ? <p className="mt-6 rounded-[1.4rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{loadError}</p> : null}
          {isLoading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div>
          ) : filteredEvents.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <TicketEventCard key={event.id} event={event} detailsHref={`/dashboard/user/tickets/events/${event.id}`} checkoutHref={`/dashboard/user/tickets/checkout/${event.id}`} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]"><Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" /><h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">No live events match your filters</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Clear the filters or ask the event owner to publish an event.</p><Link href="/dashboard/user/tickets" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><ShieldCheck className="h-4 w-4" /> View my tickets</Link></div>
          )}
        </section>
      </main>
    </>
  );
}
