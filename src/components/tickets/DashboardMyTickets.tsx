"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketQrCard } from "@/components/tickets/TicketQrCard";
import { getEventById, getMyTickets } from "@/services/ticketService";
import type { TicketEvent, UserTicket } from "@/types/tickets";

type TicketWithEvent = {
  ticket: UserTicket;
  event: TicketEvent | null;
};

const TICKETS_PER_PAGE = 6;

export function DashboardMyTickets() {
  const [items, setItems] = useState<TicketWithEvent[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadTickets() {
      const nextTickets = await getMyTickets();
      const ticketsWithEvents = await Promise.all(nextTickets.map(async (ticket) => ({ ticket, event: await getEventById(ticket.eventId) })));
      if (!mounted) return;
      setItems(ticketsWithEvents);
      setPage(0);
      setIsLoading(false);
    }
    void loadTickets();
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(Math.ceil(items.length / TICKETS_PER_PAGE), 1);
  const visibleItems = useMemo(() => items.slice(page * TICKETS_PER_PAGE, page * TICKETS_PER_PAGE + TICKETS_PER_PAGE), [items, page]);

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="My purchased tickets" description="View issued QR tickets, references, status, and event details inside the user dashboard." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">My tickets</p><h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Purchased ticket QR dashboard</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--steel)]">Every purchased ticket shows status, reference number, event details, and a QR placeholder ready for the production QR package.</p></div>
          <Link href="/dashboard/user/tickets/buy" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"><ShoppingCart className="h-4 w-4" /> Buy more tickets</Link>
        </div>

        {isLoading ? <div className="mt-8 grid gap-5">{[0, 1].map((item) => <div key={item} className="h-80 animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div> : null}

        {!isLoading && items.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]"><Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" /><h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">You have no tickets yet</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Browse upcoming events and your QR ticket will appear here after checkout.</p><Link href="/dashboard/user/tickets/buy" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)]">Browse events</Link></div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-8 grid gap-5">
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-black text-[var(--steel)]">Showing ticket page {page + 1} of {totalPages} · {visibleItems.length} of {items.length} tickets</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Prev</button>
                <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))} disabled={page >= totalPages - 1} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)] disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
            {visibleItems.map(({ ticket, event }) => event ? <TicketQrCard key={ticket.id} ticket={ticket} eventName={event.name} eventDate={event.eventDate} eventLocation={event.location} /> : null)}
          </div>
        ) : null}
      </main>
    </>
  );
}
