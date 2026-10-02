"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Info, ShoppingCart, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketQrCard } from "@/components/tickets/TicketQrCard";
import {
  addTicketCoolerbox,
  getLiveEventById,
  getLiveMyTickets,
  shareTicketByUsername,
  uploadTicketVerificationPhoto,
} from "@/lib/api/tickets";
import { listMyRefunds, requestTicketRefund } from "@/lib/api/refunds";
import type { RefundRequest } from "@/types/tickets";
import { addServiceToCart } from "@/lib/tuck-shop/cart";
import type { TicketEvent, UserTicket } from "@/types/tickets";

type TicketWithEvent = {
  ticket: UserTicket;
  event: TicketEvent | null;
};

const TICKETS_PER_PAGE = 6;

export function DashboardMyTickets() {
  const [items, setItems] = useState<TicketWithEvent[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      try {
        const nextTickets = await getLiveMyTickets();
        const liveTicketsWithEvents = await Promise.all(
          nextTickets.map(async (ticket) => ({
            ticket,
            event: await getLiveEventById(ticket.eventId),
          })),
        );

        if (!mounted) return;
        setItems(liveTicketsWithEvents);
        setPage(0);
        setError(null);
        try {
          const rows = await listMyRefunds();
          if (mounted) setRefunds(Array.isArray(rows) ? rows.filter((refund) => refund.kind === "TICKET") : []);
        } catch {
          if (mounted) setRefunds([]);
        }
      } catch (loadError) {
        if (!mounted) return;
        setItems([]);
        setPage(0);
        setError(
          loadError instanceof Error
            ? `Live tickets could not be loaded: ${loadError.message}.`
            : "Live tickets could not be loaded.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadTickets();
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(Math.ceil(items.length / TICKETS_PER_PAGE), 1);
  const visibleItems = useMemo(
    () => items.slice(page * TICKETS_PER_PAGE, page * TICKETS_PER_PAGE + TICKETS_PER_PAGE),
    [items, page],
  );
  const photoReadyCount = useMemo(() => items.filter((item) => Boolean(item.ticket.verificationPhotoUrl)).length, [items]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  async function captureVerificationPhoto(item: TicketWithEvent, file: File) {
    if (item.ticket.status !== "ACTIVE") {
      throw new Error("A used, cancelled or expired ticket cannot change its verification photo.");
    }

    const updatedTicket = await uploadTicketVerificationPhoto(item.ticket.id, file);
    setItems((current) => current.map((candidate) => candidate.ticket.id === item.ticket.id ? { ...candidate, ticket: updatedTicket } : candidate));
  }

  async function shareTicket(item: TicketWithEvent, username: string) {
    if (item.ticket.status !== "ACTIVE") {
      throw new Error("A used, cancelled or expired ticket cannot be shared.");
    }

    await shareTicketByUsername(item.ticket.id, username);
    setItems((current) => current.filter((candidate) => candidate.ticket.id !== item.ticket.id));
  }

  async function addFreeCoolerbox(item: TicketWithEvent) {
    const updated = await addTicketCoolerbox(item.ticket.id);
    setItems((current) =>
      current.map((candidate) => (candidate.ticket.id === item.ticket.id ? { ...candidate, ticket: updated } : candidate)),
    );
  }

  function addPricedCoolerboxToCart(item: TicketWithEvent) {
    const price = Number(item.event?.coolerboxPrice ?? NaN);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("This event has no priced coolerbox to add.");
    }

    addServiceToCart({
      serviceKind: "COOLER_BOX",
      referenceId: item.ticket.id,
      label: `Coolerbox — ${item.event?.name ?? "event"}`,
      unitPrice: price,
    });
  }

  function refundForTicket(ticketId: string) {
    return refunds.find(
      (refund) => refund.userTicketId === ticketId && (refund.status === "REQUESTED" || refund.status === "APPROVED"),
    ) ?? refunds.find((refund) => refund.userTicketId === ticketId);
  }

  async function handleTicketRefund(ticketId: string) {
    await requestTicketRefund({ userTicketId: ticketId });
    try {
      const rows = await listMyRefunds();
      setRefunds(Array.isArray(rows) ? rows.filter((refund) => refund.kind === "TICKET") : []);
    } catch {
      // keep existing list; card shows backend errors inline
    }
  }

  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="My purchased tickets"
        description="Capture the current owner photo, share ACTIVE tickets by username, and present the QR for a worker's manual identity check at entry."
      />
      <section className="bg-[var(--surface)]">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--signal)]">My tickets</p>
            <h1 className="mt-1 text-[1.25rem] font-bold tracking-[-0.02em]">Verified ticket wallet</h1>
            <p className="mt-1 max-w-3xl text-[0.8125rem] leading-5 text-[var(--steel)]">
              Every ACTIVE ticket needs a clear owner photo before entry. Workers compare the person manually against the stored photo. No automated facial recognition is used.
            </p>
          </div>
          <Link
            href="/dashboard/user/tickets/buy"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"
          >
            <ShoppingCart className="h-4 w-4" /> Buy more tickets
          </Link>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-soft)]"><p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Wallet total</p><p className="mt-1 text-[1.375rem] font-bold text-[var(--ink)]">{items.length}</p></div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-3.5 shadow-[var(--shadow-soft)]"><p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--signal)]">Live tickets</p><p className="mt-1 text-[1.375rem] font-bold text-[var(--ink)]">{items.length}</p></div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-3.5 shadow-[var(--shadow-soft)]"><p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--confirm)]">Photo ready</p><p className="mt-1 text-[1.375rem] font-bold text-[var(--ink)]">{photoReadyCount}</p></div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[var(--gold)] bg-[var(--gold)]/15 p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink)]" />
          <p><strong className="text-[var(--ink)]">Transfer rule:</strong> sharing an ACTIVE ticket moves it to the recipient, rotates the QR and removes the sender&apos;s photo. The recipient must capture a new photo. USED tickets cannot be shared or edited.</p>
        </div>

        {error ? <p className="mt-6 rounded-[1.4rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {isLoading ? <div className="mt-5 grid gap-4">{[0, 1].map((item) => <div key={item} className="h-80 animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div> : null}

        {!isLoading && items.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--line-strong)] bg-white p-5 text-center shadow-[var(--shadow-soft)]">
            <Ticket className="mx-auto h-7 w-7 text-[var(--signal)]" />
            <h2 className="mt-2.5 text-[0.9375rem] font-bold tracking-[-0.01em]">You have no tickets yet</h2>
            <p className="mt-1 text-[0.8125rem] font-medium leading-5 text-[var(--steel)]">Browse available events and add a ticket to your shared cart.</p>
            <Link href="/dashboard/user/tickets/buy" className="mt-3 inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white shadow-[var(--shadow-soft)]">Browse events</Link>
          </div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-black text-[var(--steel)]">Showing ticket page {page + 1} of {totalPages} · {visibleItems.length} of {items.length} tickets</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Prev</button>
                <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))} disabled={page >= totalPages - 1} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)] disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>

            {visibleItems.map((item) => item.event ? (
              <TicketQrCard
                key={item.ticket.id}
                ticket={item.ticket}
                eventName={item.event.name}
                eventDate={item.event.eventDate}
                eventTime={item.event.eventTime}
                eventLocation={item.event.location}
                onCapturePhoto={(file) => captureVerificationPhoto(item, file)}
                onShare={(username) => shareTicket(item, username)}
                coolerboxFree={item.event.coolerboxFree}
                coolerboxPrice={item.event.coolerboxPrice}
                coolerboxAdded={item.ticket.coolerboxAdded}
                onAddFreeCoolerbox={() => addFreeCoolerbox(item)}
                onAddPricedCoolerbox={() => addPricedCoolerboxToCart(item)}
                ticketRefund={refundForTicket(item.ticket.id)}
                onRequestTicketRefund={handleTicketRefund}
              />
            ) : null)}
          </div>
        ) : null}
      </section>
    </>
  );
}
