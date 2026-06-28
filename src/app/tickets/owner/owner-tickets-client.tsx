"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Calendar, Crown, Plus, Ticket, UsersRound, WalletCards } from "lucide-react";
import { TicketLayout } from "@/components/tickets/TicketLayout";
import { TicketRoleGate } from "@/components/tickets/TicketRoleGate";
import { TicketStatsCard } from "@/components/tickets/TicketStatsCard";
import { OwnerEventTable } from "@/components/tickets/OwnerEventTable";
import { getOwnerEvents, getOwnerTicketDashboard, updateEvent } from "@/services/ticketService";
import type { EventStatus, OwnerTicketDashboard, TicketEvent } from "@/types/tickets";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

export function OwnerTicketsClient() {
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
    void loadDashboard();
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
    <TicketLayout>
      <TicketRoleGate allowedRoles={["OWNER", "ADMIN"]} title="Owner/admin access only" description="Users cannot access event management. Workers can scan tickets but cannot create or cancel events.">
        <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Ticket owner dashboard</p>
              <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Manage events, capacity and sales</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--steel)]">Owners see class-level sales, capacity, availability, revenue, and event controls without touching worker scanner permissions.</p>
            </div>
            <Link href="/tickets/owner/create" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><Plus className="h-4 w-4" /> Create event</Link>
          </div>

          {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]" />)}</div> : null}

          {!isLoading && dashboard ? <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <TicketStatsCard key={stat.title} {...stat} />)}</div> : null}

          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Event table</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Manage ticket types and status</h2></div><p className="text-sm font-semibold text-[var(--steel)]">Edit hooks are ready for backend forms; publish/cancel works in the typed mock service.</p></div>
            <OwnerEventTable events={events} onStatusChange={handleStatusChange} />
          </section>
        </main>
      </TicketRoleGate>
    </TicketLayout>
  );
}
