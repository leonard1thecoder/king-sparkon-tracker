"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CircleDollarSign, Filter, MapPin, Plus, Search, ShieldCheck, Ticket } from "lucide-react";
import { TicketEventCard } from "@/components/tickets/TicketEventCard";
import { TicketLayout } from "@/components/tickets/TicketLayout";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { getAllTicketEvents } from "@/services/ticketEventService";
import { getEventStatusLabel, getEventTotals } from "@/services/ticketService";
import type { EventStatus, TicketEvent } from "@/types/tickets";

const statusOptions: Array<"ALL" | EventStatus> = ["ALL", "DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

function formatEventDate(event: TicketEvent) {
  const eventDate = new Date(`${event.eventDate}T${event.eventTime || "00:00"}`);

  if (Number.isNaN(eventDate.getTime())) {
    return `${event.eventDate} ${event.eventTime}`.trim();
  }

  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(eventDate);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
}

function getEventRevenue(event: TicketEvent) {
  return event.ticketTypes.reduce((total, ticketType) => total + ticketType.price * ticketType.sold, 0);
}

export function AllTicketEventsClient() {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EventStatus>("ALL");

  useEffect(() => {
    let mounted = true;

    getAllTicketEvents()
      .then((nextEvents) => {
        if (!mounted) return;
        setEvents(nextEvents);
        setError(null);
      })
      .catch((issue: unknown) => {
        if (!mounted) return;
        setError(issue instanceof Error ? issue.message : "Ticket events could not be loaded.");
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    return events.reduce(
      (totals, event) => {
        const eventTotals = getEventTotals(event);
        return {
          totalEvents: totals.totalEvents + 1,
          publishedEvents: totals.publishedEvents + (event.status === "PUBLISHED" ? 1 : 0),
          draftEvents: totals.draftEvents + (event.status === "DRAFT" ? 1 : 0),
          completedEvents: totals.completedEvents + (event.status === "COMPLETED" ? 1 : 0),
          totalCapacity: totals.totalCapacity + eventTotals.totalCapacity,
          totalSold: totals.totalSold + eventTotals.totalSold,
          totalAvailable: totals.totalAvailable + eventTotals.totalAvailable,
          revenue: totals.revenue + getEventRevenue(event),
        };
      },
      { totalEvents: 0, publishedEvents: 0, draftEvents: 0, completedEvents: 0, totalCapacity: 0, totalSold: 0, totalAvailable: 0, revenue: 0 },
    );
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedLocation = locationFilter.trim().toLowerCase();

    return events.filter((event) => {
      const eventTotals = getEventTotals(event);
      const textMatch =
        !normalizedQuery ||
        event.name.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery) ||
        event.ownerId.toLowerCase().includes(normalizedQuery);
      const locationMatch = !normalizedLocation || event.location.toLowerCase().includes(normalizedLocation);
      const statusMatch = statusFilter === "ALL" || event.status === statusFilter;
      return textMatch && locationMatch && statusMatch && eventTotals.totalCapacity >= 0;
    });
  }, [events, locationFilter, query, statusFilter]);

  const stats = [
    { label: "Events", value: summary.totalEvents.toString(), icon: Ticket },
    { label: "Published", value: summary.publishedEvents.toString(), icon: ShieldCheck },
    { label: "Draft", value: summary.draftEvents.toString(), icon: Activity },
    { label: "Sold", value: summary.totalSold.toString(), icon: CalendarDays },
    { label: "Available", value: summary.totalAvailable.toString(), icon: Filter },
    { label: "Revenue", value: formatMoney(summary.revenue), icon: CircleDollarSign },
  ] as const;

  return (
    <TicketLayout>
      <main className="bg-white">
        <section className="relative overflow-hidden px-5 py-14 md:px-8 lg:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-12rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[var(--gold)]/18 blur-3xl" />
            <div className="absolute bottom-[-12rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[var(--signal)]/12 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Backend ticket events
                </div>
                <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.07em] md:text-7xl">All ticket events in one command view.</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--steel)]">
                  Operators can now see every ticket event: drafts, published events, completed events, cancelled events, capacity, sold counts, owner IDs, and QR ticket inventory without hunting through owner screens.
                </p>
              </div>

              <Link href="/tickets/owner/create" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                <Plus className="h-4 w-4" /> Create event
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map(({ label, value, icon: Icon }) => (
                <article key={label} className="rounded-[1.45rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
                    <Icon className="h-4 w-4 text-[var(--signal)]" />
                  </div>
                  <p className="money mt-3 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 lg:pb-24">
          <div className="rounded-[2.2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Event register</p>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">Search all ticket events</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--steel)]">
                <Filter className="h-4 w-4 text-[var(--signal)]" /> Name · Owner · Location · Status
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.7fr]">
              <label className="flex min-h-12 items-center gap-3 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
                <Search className="h-4 w-4 text-[var(--signal)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event name, description, or owner ID" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--muted)]" />
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
                <MapPin className="h-4 w-4 text-[var(--signal)]" />
                <input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Filter by location" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--muted)]" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | EventStatus)} className="min-h-12 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status === "ALL" ? "All statuses" : getEventStatusLabel(status)}</option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-8 rounded-[2rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-6 text-sm font-bold leading-7 text-[var(--danger)]">{error}</div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-96 animate-pulse rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]" />)}</div>
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[var(--surface)] text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                      <tr>
                        <th className="px-5 py-4">Event</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Location</th>
                        <th className="px-5 py-4 text-right">Sold</th>
                        <th className="px-5 py-4 text-right">Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {filteredEvents.map((event) => {
                        const totals = getEventTotals(event);
                        return (
                          <tr key={event.id} className="align-top hover:bg-[var(--surface)]/60">
                            <td className="px-5 py-4">
                              <Link href={`/tickets/events/${event.id}`} className="font-black text-[var(--ink)] hover:text-[var(--signal)]">{event.name}</Link>
                              <p className="mt-1 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{event.ownerId}</p>
                            </td>
                            <td className="px-5 py-4"><TicketStatusBadge status={event.status} /></td>
                            <td className="px-5 py-4 font-semibold text-[var(--steel)]">{formatEventDate(event)}</td>
                            <td className="px-5 py-4 font-semibold text-[var(--steel)]">{event.location}</td>
                            <td className="money px-5 py-4 text-right font-black text-[var(--ink)]">{totals.totalSold}</td>
                            <td className="money px-5 py-4 text-right font-black text-[var(--ink)]">{totals.totalAvailable}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => <TicketEventCard key={event.id} event={event} />)}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">No ticket events found</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Clear filters or create the first event from the owner ticket workspace.</p>
              <Link href="/tickets/owner/create" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                <Plus className="h-4 w-4" /> Create event
              </Link>
            </div>
          )}
        </section>
      </main>
    </TicketLayout>
  );
}
