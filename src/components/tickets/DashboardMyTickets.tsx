"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Info, ShoppingCart, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketQrCard } from "@/components/tickets/TicketQrCard";
import {
  getLiveEventById,
  getLiveMyTickets,
  shareTicketByUsername,
  uploadTicketVerificationPhoto,
} from "@/lib/api/tickets";
import { mockUserTickets } from "@/data/mockUserTickets";
import type { TicketEvent, UserTicket } from "@/types/tickets";

type TicketWithEvent = {
  ticket: UserTicket;
  event: TicketEvent | null;
  isMock: boolean;
};

const TICKETS_PER_PAGE = 6;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("The selected verification photo could not be read."));
    reader.readAsDataURL(file);
  });
}

export function DashboardMyTickets() {
  const [items, setItems] = useState<TicketWithEvent[]>([]);
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
            isMock: false,
          })),
        );

        if (!mounted) return;
        setItems([...liveTicketsWithEvents, ...mockUserTickets]);
        setPage(0);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setItems(mockUserTickets);
        setPage(0);
        setError(
          loadError instanceof Error
            ? `Live tickets could not be loaded: ${loadError.message}. Demo tickets remain available below.`
            : "Live tickets could not be loaded. Demo tickets remain available below.",
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
  const liveTicketCount = useMemo(() => items.filter((item) => !item.isMock).length, [items]);
  const mockTicketCount = useMemo(() => items.filter((item) => item.isMock).length, [items]);
  const photoReadyCount = useMemo(() => items.filter((item) => Boolean(item.ticket.verificationPhotoUrl)).length, [items]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  async function captureVerificationPhoto(item: TicketWithEvent, file: File) {
    if (item.ticket.status !== "ACTIVE") {
      throw new Error("A used, cancelled or expired ticket cannot change its verification photo.");
    }

    if (item.isMock) {
      const verificationPhotoUrl = await fileToDataUrl(file);
      const updatedTicket: UserTicket = {
        ...item.ticket,
        verificationPhotoUrl,
        verificationPhotoCapturedAt: new Date().toISOString(),
        verificationRequired: false,
        canChangeVerificationPhoto: true,
        canShare: true,
      };
      setItems((current) => current.map((candidate) => candidate.ticket.id === item.ticket.id ? { ...candidate, ticket: updatedTicket } : candidate));
      return;
    }

    const updatedTicket = await uploadTicketVerificationPhoto(item.ticket.id, file);
    setItems((current) => current.map((candidate) => candidate.ticket.id === item.ticket.id ? { ...candidate, ticket: updatedTicket } : candidate));
  }

  async function shareTicket(item: TicketWithEvent, username: string) {
    if (item.ticket.status !== "ACTIVE") {
      throw new Error("A used, cancelled or expired ticket cannot be shared.");
    }

    if (item.isMock) {
      setItems((current) => current.filter((candidate) => candidate.ticket.id !== item.ticket.id));
      return;
    }

    await shareTicketByUsername(item.ticket.id, username);
    setItems((current) => current.filter((candidate) => candidate.ticket.id !== item.ticket.id));
  }

  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="My purchased tickets"
        description="Capture the current owner photo, share ACTIVE tickets by username, and present the QR for a worker's manual identity check at entry."
      />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">My tickets</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Verified ticket wallet</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">
              Every ACTIVE ticket needs a clear owner photo before entry. Workers compare the person manually against the stored photo. No automated facial recognition is used.
            </p>
          </div>
          <Link
            href="/dashboard/user/tickets/buy"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"
          >
            <ShoppingCart className="h-4 w-4" /> Buy more tickets
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Wallet total</p><p className="mt-2 text-3xl font-black text-[var(--ink)]">{items.length}</p></div>
          <div className="rounded-[1.4rem] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-4 shadow-[var(--shadow-soft)]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--signal)]">Live tickets</p><p className="mt-2 text-3xl font-black text-[var(--ink)]">{liveTicketCount}</p></div>
          <div className="rounded-[1.4rem] border border-[var(--gold)] bg-[var(--gold)]/20 p-4 shadow-[var(--shadow-soft)]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--ink)]">Demo tickets</p><p className="mt-2 text-3xl font-black text-[var(--ink)]">{mockTicketCount}</p></div>
          <div className="rounded-[1.4rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 shadow-[var(--shadow-soft)]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--confirm)]">Photo ready</p><p className="mt-2 text-3xl font-black text-[var(--ink)]">{photoReadyCount}</p></div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[var(--gold)] bg-[var(--gold)]/15 p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink)]" />
          <p><strong className="text-[var(--ink)]">Transfer rule:</strong> sharing an ACTIVE ticket moves it to the recipient, rotates the QR and removes the sender&apos;s photo. The recipient must capture a new photo. USED tickets cannot be shared or edited.</p>
        </div>

        {error ? <p className="mt-6 rounded-[1.4rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {isLoading ? <div className="mt-8 grid gap-5">{[0, 1].map((item) => <div key={item} className="h-80 animate-pulse rounded-[2rem] border border-[var(--line)] bg-white" />)}</div> : null}

        {!isLoading && items.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">You have no tickets yet</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Browse available events and add a ticket to your shared cart.</p>
            <Link href="/dashboard/user/tickets/buy" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)]">Browse events</Link>
          </div>
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

            {visibleItems.map((item) => item.event ? (
              <TicketQrCard
                key={item.ticket.id}
                ticket={item.ticket}
                eventName={item.event.name}
                eventDate={item.event.eventDate}
                eventLocation={item.event.location}
                isMock={item.isMock}
                onCapturePhoto={(file) => captureVerificationPhoto(item, file)}
                onShare={(username) => shareTicket(item, username)}
              />
            ) : null)}
          </div>
        ) : null}
      </main>
    </>
  );
}
