import type { EventStatus, TicketStatus } from "@/types/tickets";

const ticketTone: Record<TicketStatus, string> = {
  ACTIVE: "border-[var(--confirm)]/25 bg-[var(--confirm)]/10 text-[var(--confirm)]",
  USED: "border-[var(--gold)]/35 bg-[var(--gold)]/12 text-[var(--warning)]",
  CANCELLED: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
  EXPIRED: "border-[var(--muted)]/35 bg-[var(--muted)]/12 text-[var(--steel)]",
};

const eventTone: Record<EventStatus, string> = {
  DRAFT: "border-[var(--gold)]/35 bg-[var(--gold)]/12 text-[var(--warning)]",
  PUBLISHED: "border-[var(--confirm)]/25 bg-[var(--confirm)]/10 text-[var(--confirm)]",
  CANCELLED: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
  COMPLETED: "border-[var(--muted)]/35 bg-[var(--muted)]/12 text-[var(--steel)]",
};

type TicketStatusBadgeProps = {
  status: TicketStatus | EventStatus;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const tone = status in ticketTone ? ticketTone[status as TicketStatus] : eventTone[status as EventStatus];
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] ${tone}`}>
      {status}
    </span>
  );
}
