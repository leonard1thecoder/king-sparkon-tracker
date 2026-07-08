"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Plus, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketTypeCard } from "@/components/tickets/TicketTypeCard";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { getEventById, getEventTotals } from "@/services/ticketService";
import type { TicketEvent } from "@/types/tickets";

type DashboardOwnerEventDetailsProps = { eventId: string };

function formatDate(eventDate: string, eventTime: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "full", timeStyle: "short" }).format(new Date(`${eventDate}T${eventTime}`));
}

export function DashboardOwnerEventDetails({ eventId }: DashboardOwnerEventDetailsProps) {
  const [event, setEvent] = useState<TicketEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getEventById(eventId).then((nextEvent) => {
      if (!mounted) return;
      setEvent(nextEvent);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <>
        <DashboardHeader role="OWNER WORKSPACE" title="Event details" description="Loading owner ticket event details." />
        <main className="bg-[var(--surface)] p-5 md:p-8"><div className="h-[32rem] animate-pulse rounded-[2.4rem] border border-[var(--line)] bg-white" /></main>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <DashboardHeader role="OWNER WORKSPACE" title="Event not found" description="The selected owner ticket event could not be found." />
        <main className="bg-[var(--surface)] p-5 md:p-8"><div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]"><Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" /><h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Event not found</h1><Link href="/dashboard/owner/tickets" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to owner tickets</Link></div></main>
      </>
    );
  }

  const totals = getEventTotals(event);

  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title={event.name} description="Inspect capacity, class availability, and sales context from inside the owner dashboard." />
      <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
        <section className="grid gap-6 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--ink)] shadow-[var(--shadow-depth)]"><div className="relative min-h-[24rem]">{event.bannerUrl ? <Image src={event.bannerUrl} alt={`${event.name} banner`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-86" /> : <div className="absolute inset-0 scan-grid" />}<div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/30 to-transparent" /><div className="absolute bottom-6 left-6 right-6"><div className="barcode-rule mb-6 text-white" /><TicketStatusBadge status={event.status} /></div></div></div>
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Owner event record</p>
            <h1 className="mt-4 text-5xl font-black leading-[0.96] tracking-[-0.07em] md:text-7xl">{event.name}</h1>
            <p className="mt-6 text-lg leading-8 text-[var(--steel)]">{event.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-[var(--steel)] md:grid-cols-2"><span className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]"><Calendar className="h-4 w-4 text-[var(--signal)]" />{formatDate(event.eventDate, event.eventTime)}</span><span className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]"><MapPin className="h-4 w-4 text-[var(--signal)]" />{event.location}</span></div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center"><div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="money text-2xl font-black">{totals.totalCapacity}</p><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Capacity</p></div><div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="money text-2xl font-black">{totals.totalSold}</p><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Sold</p></div><div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="money text-2xl font-black">{totals.totalAvailable}</p><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Available</p></div></div>
            <Link href="/dashboard/owner/tickets/create" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><Plus className="h-4 w-4" /> Create another event</Link>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7"><div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Ticket classes</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Owner class-level capacity</h2></div><div className="mt-8 grid gap-5 lg:grid-cols-3">{event.ticketTypes.map((ticketType) => <TicketTypeCard key={ticketType.id} ticketType={ticketType} eventId={event.id} showBuyAction={false} />)}</div></section>
      </main>
    </>
  );
}
