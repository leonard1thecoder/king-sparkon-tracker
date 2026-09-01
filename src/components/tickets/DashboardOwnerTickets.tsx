"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ban, BarChart3, Calendar, Crown, Eye, MapPin, Pencil, Plus, Ticket, UsersRound, WalletCards } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketStatsCard } from "@/components/tickets/TicketStatsCard";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { getTicketBannerImage } from "@/components/tickets/ticketBannerImage";
import { getEventTotals, getOwnerEvents, getOwnerTicketDashboard, updateEvent } from "@/services/ticketService";
import type { EventStatus, OwnerTicketDashboard, TicketEvent } from "@/types/tickets";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

export function DashboardOwnerTickets() {
  const [dashboard, setDashboard] = useState<OwnerTicketDashboard | null>(null);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    const [nextDashboard, nextEvents] = await Promise.all([getOwnerTicketDashboard(), getOwnerEvents()]);
    setDashboard(nextDashboard);
    setEvents(nextEvents);
    setIsLoading(false);
  }

  useEffect(() => {
    let isActive = true;

    Promise.all([getOwnerTicketDashboard(), getOwnerEvents()])
      .then(([nextDashboard, nextEvents]) => {
        if (!isActive) return;
        setDashboard(nextDashboard);
        setEvents(nextEvents);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleStatusChange(eventId: string, status: EventStatus) {
    await updateEvent(eventId, { status });
    await loadDashboard();
  }

  const stats = dashboard ? [
    { title: "Total events", value: dashboard.totalEvents, caption: "All draft, published, cancelled, and completed events.", icon: Calendar },
    { title: "Tickets sold", value: dashboard.ticketsSold, caption: "Sold capacity across all ticket classes.", icon: Ticket },
    { title: "Revenue", value: formatCurrency(dashboard.revenue), caption: "Mock gross revenue from sold ticket classes.", icon: WalletCards },
    { title: "Upcoming events", value: dashboard.upcomingEvents, caption: "Published future events ready for buyers.", icon: BarChart3 },
    { title: "Regular sold", value: dashboard.regularSold, caption: "Regular class ticket sales.", icon: UsersRound },
    { title: "VIP sold", value: dashboard.vipSold, caption: "VIP class ticket sales.", icon: Crown },
    { title: "VVIP sold", value: dashboard.vvipSold, caption: "Premium VVIP ticket sales.", icon: Crown },
    { title: "Available", value: dashboard.totalAvailable, caption: `${dashboard.totalCapacity} total capacity minus ${dashboard.totalSold} sold.`, icon: Ticket },
  ] : [];

  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Owner ticket management" description="Manage events, ticket classes, capacity, sales, and status inside the owner dashboard." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Ticket owner dashboard</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Manage events, capacity and sales</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--steel)]">Owners see class-level sales, capacity, availability, revenue, and event controls without leaving the dashboard shell.</p>
          </div>
          <Link href="/dashboard/owner/tickets/create" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><Plus className="h-4 w-4" /> Create event</Link>
        </div>

        {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-[1.75rem] border border-[var(--line)] bg-white" />)}</div> : null}

        {!isLoading && dashboard ? <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <TicketStatsCard key={stat.title} {...stat} />)}</div> : null}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Event cards</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Manage ticket types and status</h2></div><p className="text-sm font-semibold text-[var(--steel)]">Cards match the customer view — publish or cancel directly.</p></div>
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-[28rem] animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div>
          ) : events.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white p-10 text-center">No events yet. Create the first ticketed event.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const totals = getEventTotals(event);
                const bannerSrc = getTicketBannerImage(event);
                const hasImage = Boolean(bannerSrc);
                return (
                  <article key={event.id} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-ledger)]">
                    <div className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden border-b border-[var(--line)] bg-slate-950">
                      {hasImage ? <img src={bannerSrc} alt={`${event.name} banner`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" /> : <div className="h-full w-full scan-grid" />}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <TicketStatusBadge status={event.status} />
                        <span className="truncate rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur">{event.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="grid gap-2 text-sm font-semibold text-[var(--steel)]">
                        <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-[var(--signal)]" />{new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(`${event.eventDate}T${event.eventTime}`))}</span>
                        <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--signal)]" />{event.location}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-[3.5rem] text-sm leading-6 text-[var(--steel)]">{event.description}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalCapacity}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Capacity</p></div>
                        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalSold}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Sold</p></div>
                        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><p className="money text-lg font-black">{totals.totalAvailable}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Available</p></div>
                      </div>
                      <div className="mt-5 grid gap-2">
                        <Link href={`/dashboard/owner/tickets/events/${event.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><Eye className="h-4 w-4" /> View</Link>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => void handleStatusChange(event.id, "PUBLISHED")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--confirm)] hover:text-[var(--confirm)]"><Pencil className="h-3.5 w-3.5" /> Publish</button>
                          <button type="button" onClick={() => void handleStatusChange(event.id, "CANCELLED")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--danger)] hover:text-[var(--danger)]"><Ban className="h-3.5 w-3.5" /> Cancel</button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
