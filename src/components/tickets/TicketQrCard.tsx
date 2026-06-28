"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Download, QrCode } from "lucide-react";
import type { UserTicket } from "@/types/tickets";
import { getTicketTypeLabel } from "@/services/ticketService";
import { TicketStatusBadge } from "./TicketStatusBadge";

type TicketQrCardProps = {
  ticket: UserTicket;
  eventName: string;
  eventDate: string;
  eventLocation: string;
};

function formatDate(eventDate: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(`${eventDate}T00:00`));
}

export function TicketQrCard({ ticket, eventName, eventDate, eventLocation }: TicketQrCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    await navigator.clipboard.writeText(ticket.ticketReference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article className="grid gap-5 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] lg:grid-cols-[220px_1fr]">
      <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="grid aspect-square place-items-center rounded-[1.3rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="relative grid h-full w-full grid-cols-5 grid-rows-5 gap-1 rounded-[1rem] bg-white p-2">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className={`rounded-[0.22rem] ${index % 2 === 0 || index % 7 === 0 || index === 18 ? "bg-[var(--ink)]" : "bg-[var(--gold)]/28"}`} />
            ))}
            <QrCode className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-1 text-[var(--signal)]" />
          </div>
        </div>
        <p className="mt-3 break-all text-center font-mono text-[0.62rem] font-bold leading-5 text-[var(--muted)]">QR placeholder · {ticket.id}</p>
        <p className="mt-2 text-center text-[0.68rem] font-semibold text-[var(--steel)]">TODO: replace with QR package when production dependency is approved.</p>
      </div>

      <div className="flex flex-col justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{getTicketTypeLabel(ticket.ticketType)} Ticket</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{eventName}</h2>
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm font-semibold text-[var(--steel)] sm:grid-cols-2">
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Reference</dt><dd className="code mt-1 font-black text-[var(--ink)]">{ticket.ticketReference}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Buyer</dt><dd className="mt-1 font-black text-[var(--ink)]">{ticket.buyerName}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Date</dt><dd className="mt-1 font-black text-[var(--ink)]">{formatDate(eventDate)}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Location</dt><dd className="mt-1 font-black text-[var(--ink)]">{eventLocation}</dd></div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={copyReference} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy reference"}
          </button>
          <button type="button" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">
            <Download className="h-4 w-4" /> View / Download
          </button>
        </div>
      </div>
    </article>
  );
}
