"use client";

import Link from "next/link";
import { Ban, Eye, Pencil, ShieldCheck } from "lucide-react";
import type { EventStatus, TicketEvent } from "@/types/tickets";
import { getEventTotals } from "@/services/ticketService";
import { TicketStatusBadge } from "./TicketStatusBadge";

type OwnerEventTableProps = {
  events: TicketEvent[];
  onStatusChange: (eventId: string, status: EventStatus) => void;
};

function formatDate(eventDate: string, eventTime: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(`${eventDate}T${eventTime}`));
}

export function OwnerEventTable({ events, onStatusChange }: OwnerEventTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <ShieldCheck className="mx-auto h-10 w-10 text-[var(--signal)]" />
        <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">No events created yet</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Create the first ticketed event and the capacity table will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
      <div className="overflow-x-auto">
        <table className="table-ledger min-w-[980px]">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Status</th>
              <th>Capacity</th>
              <th>Sold</th>
              <th>Available</th>
              <th>Regular / VIP / VVIP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const totals = getEventTotals(event);
              const regular = event.ticketTypes.find((ticketType) => ticketType.type === "REGULAR")?.sold ?? 0;
              const vip = event.ticketTypes.find((ticketType) => ticketType.type === "VIP")?.sold ?? 0;
              const vvip = event.ticketTypes.find((ticketType) => ticketType.type === "VVIP")?.sold ?? 0;
              return (
                <tr key={event.id}>
                  <td>
                    <div>
                      <p className="font-black text-[var(--ink)]">{event.name}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{event.location}</p>
                    </div>
                  </td>
                  <td className="text-sm font-semibold text-[var(--steel)]">{formatDate(event.eventDate, event.eventTime)}</td>
                  <td><TicketStatusBadge status={event.status} /></td>
                  <td className="money font-black">{totals.totalCapacity}</td>
                  <td className="money font-black">{totals.totalSold}</td>
                  <td className="money font-black">{totals.totalAvailable}</td>
                  <td className="money text-sm font-black">{regular} / {vip} / {vvip}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/user/tickets/events/${event.id}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--signal)] hover:text-[var(--ink)]">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <button type="button" onClick={() => onStatusChange(event.id, "PUBLISHED")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--confirm)] hover:text-[var(--confirm)]">
                        <Pencil className="h-3.5 w-3.5" /> Publish
                      </button>
                      <button type="button" onClick={() => onStatusChange(event.id, "CANCELLED")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--danger)] hover:text-[var(--danger)]">
                        <Ban className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
