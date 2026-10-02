import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import type { EventTicketType } from "@/types/tickets";
import { getTicketTypeLabel } from "@/services/ticketService";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";

type TicketTypeCardProps = {
  ticketType: EventTicketType;
  eventId: string;
  showBuyAction?: boolean;
  checkoutHref?: string;
};

export function TicketTypeCard({ ticketType, eventId, showBuyAction = true, checkoutHref }: TicketTypeCardProps) {
  const soldOut = ticketType.sold >= ticketType.capacity || ticketType.available <= 0;
  const buyHref = checkoutHref ?? `/dashboard/user/tickets/checkout/${eventId}?type=${ticketType.type}`;
  const localization = useLocalization();
  const price = localization.currency === "USD" ? convertZarToUsd(ticketType.price, localization.usdToZarRate) : ticketType.price;

  return (
    <article className={`rounded-[1.9rem] border bg-white p-5 shadow-[var(--shadow-soft)] ${soldOut ? "border-[var(--danger)]/20 opacity-75" : "border-[var(--line)]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{getTicketTypeLabel(ticketType.type)}</p>
          <p className="money mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--ink)]">{formatMoney(price, localization.currency)}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--surface)] text-[var(--signal)]">
          <Ticket className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="money text-lg font-black">{ticketType.capacity}</p>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Capacity</p>
        </div>
        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="money text-lg font-black">{ticketType.sold}</p>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Sold</p>
        </div>
        <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="money text-lg font-black">{ticketType.available}</p>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Left</p>
        </div>
      </div>

      {showBuyAction ? (
        soldOut ? (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-2 text-center text-[0.8125rem] font-bold text-[var(--danger)]">Sold out</div>
        ) : (
          <Link href={buyHref} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
            Buy {getTicketTypeLabel(ticketType.type)} <ArrowRight className="h-4 w-4" />
          </Link>
        )
      ) : null}
    </article>
  );
}
