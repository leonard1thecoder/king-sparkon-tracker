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
      <DashboardHeader role="USER WORKSPACE" title="Buy event tickets" description="Browse live backend ticket events, inspect capacity, and add QR tickets to the verified PayFast cart." />
      <section className="grid gap-4 bg-[var(--surface)]">
        <div className="overflow-hidden border-b border-[var(--line)] bg-white">
          <Image
            src="https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/lego_party.png"
            alt="King Sparkon Lego party"
            width={1200}
            height={675}
            className="h-auto max-h-[207px] w-full object-contain sm:max-h-[253px] md:max-h-[322px] lg:max-h-[368px]"
            priority
            sizes="100vw"
          />
        </div>

        <section id="events" className="scroll-mt-28">
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
              <div><p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--signal)]">Upcoming events</p><h2 className="mt-1 text-[1.25rem] font-bold tracking-[-0.02em]">Search event tickets</h2></div>
              <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--steel)]"><Filter className="h-3.5 w-3.5 text-[var(--signal)]" /> Name · Date · Location · Status</div>
            </div>
            <div className="mt-4 grid gap-2.5 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr]">
              <label className="flex h-9 items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]"><Search className="h-3.5 w-3.5 text-[var(--signal)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by event name" className="w-full bg-transparent text-[0.8125rem] font-semibold outline-none placeholder:text-[var(--muted)]" /></label>
              <input type="text" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Location" className="h-9 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3 text-[0.8125rem] font-semibold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-9 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3 text-[0.8125rem] font-semibold outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | EventStatus)} className="h-9 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3 text-[0.8125rem] font-bold outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
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
            <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--line-strong)] bg-white p-5 text-center shadow-[var(--shadow-soft)]"><Ticket className="mx-auto h-7 w-7 text-[var(--signal)]" /><h2 className="mt-2.5 text-[0.9375rem] font-bold tracking-[-0.01em]">No live events match your filters</h2><p className="mt-1 text-[0.8125rem] font-medium leading-5 text-[var(--steel)]">Clear the filters or ask the event owner to publish an event.</p><Link href="/dashboard/user/tickets" className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><ShieldCheck className="h-4 w-4" /> View my tickets</Link></div>
          )}
        </section>
      </section>
    </>
  );
}
