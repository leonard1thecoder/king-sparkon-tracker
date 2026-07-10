"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Filter, QrCode, Search, ShieldCheck, Ticket } from "lucide-react";
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
        <section className="grid gap-6 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7 xl:grid-cols-[1fr_0.72fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]">
              <span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Live user ticket marketplace
            </div>
            <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">Find, buy, and keep verified QR tickets inside your dashboard.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--steel)] md:text-base">Only backend-published events are shown. Tickets are issued after Stripe confirms payment and the signed webhook completes fulfilment.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#events" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">Browse events <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/dashboard/user/tickets" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">My purchased tickets</Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[var(--ink)] p-6 text-white enterprise-grid">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Verified QR commerce</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">Stripe success first. Ticket issue second.</h2>
              </div>
              <QrCode className="h-8 w-8 text-[var(--gold)]" />
            </div>
            <div className="barcode-rule mt-8 h-20 text-white" />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Regular", "VIP", "VVIP"].map((label) => <div key={label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4"><p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-white/42">Class</p><p className="mt-1 font-black text-white">{label}</p></div>)}
            </div>
          </div>
        </section>

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
