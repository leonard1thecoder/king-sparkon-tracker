"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CreditCard, Minus, Plus, ShoppingCart } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { calculateCheckoutQuote, getTicketTypeLabel } from "@/services/ticketService";
import { getLiveEventById } from "@/lib/api/tickets";
import type { TicketEvent, TicketType } from "@/types/tickets";
import { addTicketToCart } from "@/lib/tuck-shop/cart";

type DashboardTicketCheckoutProps = {
  eventId: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

function isTicketType(value: string | null): value is TicketType {
  return value === "REGULAR" || value === "VIP" || value === "VVIP";
}

export function DashboardTicketCheckout({ eventId }: DashboardTicketCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRequestedType = searchParams.get("type");
  const [event, setEvent] = useState<TicketEvent | null>(null);
  const [ticketType, setTicketType] = useState<TicketType>(isTicketType(initialRequestedType) ? initialRequestedType : "REGULAR");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getLiveEventById(eventId)
      .then((nextEvent) => {
        if (!mounted) return;
        setEvent(nextEvent);
        const requestedType = searchParams.get("type");
        if (isTicketType(requestedType) && nextEvent?.ticketTypes.some((candidate) => candidate.type === requestedType)) setTicketType(requestedType);
      })
      .catch((loadError) => {
        if (!mounted) return;
        setEvent(null);
        setError(loadError instanceof Error ? loadError.message : "Live ticket event could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [eventId, searchParams]);

  const selectedTicketType = event?.ticketTypes.find((candidate) => candidate.type === ticketType) ?? event?.ticketTypes[0];
  const quote = useMemo(() => calculateCheckoutQuote(selectedTicketType?.price ?? 0, quantity), [quantity, selectedTicketType?.price]);
  const soldOut = !selectedTicketType || selectedTicketType.available <= 0 || selectedTicketType.sold >= selectedTicketType.capacity;

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setError(null);
    if (!selectedTicketType || !event) return;
    if (soldOut) {
      setError(`${getTicketTypeLabel(selectedTicketType.type)} tickets are sold out.`);
      return;
    }

    try {
      setIsSubmitting(true);
      addTicketToCart({
        kind: "TICKET",
        event,
        ticketType: selectedTicketType.type,
        ticketTypeLabel: getTicketTypeLabel(selectedTicketType.type),
        unitPrice: selectedTicketType.price,
        quantity,
      });
      router.push("/dashboard/user/shop/cart");
    } catch (cartError) {
      setError(cartError instanceof Error ? cartError.message : "Unable to add ticket to cart.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Ticket checkout" description="Select a live ticket class and quantity, then add it to the shared Stripe-verified user cart." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        {isLoading ? <div className="h-[34rem] animate-pulse rounded-[2.4rem] border border-[var(--line)] bg-white" /> : null}
        {!isLoading && !event ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl font-black">Event not found</h1>
            {error ? <p className="mt-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
            <Link href="/dashboard/user/tickets/buy" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to buy tickets</Link>
          </div>
        ) : null}
        {event && selectedTicketType ? (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
            <section className="rounded-[2.35rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Live dashboard ticket checkout</p>
                  <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">Buy tickets for {event.name}</h1>
                  <p className="mt-3 text-sm leading-7 text-[var(--steel)]">Choose the ticket class and quantity. The backend checks price and capacity again before Stripe creates the PaymentIntent.</p>
                </div>
                <TicketStatusBadge status={event.status} />
              </div>

              <div className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-black">Ticket type</span>
                  <select value={ticketType} onChange={(changeEvent) => { setTicketType(changeEvent.target.value as TicketType); setQuantity(1); }} className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]">
                    {event.ticketTypes.map((candidate) => <option key={candidate.type} value={candidate.type}>{getTicketTypeLabel(candidate.type)} · {formatCurrency(candidate.price)} · {candidate.available} left</option>)}
                  </select>
                </label>
                <div className="grid gap-2">
                  <span className="text-sm font-black">Quantity</span>
                  <div className="flex min-h-13 items-center justify-between rounded-[1.35rem] border border-[var(--line)] bg-white px-3 shadow-[var(--shadow-soft)]">
                    <button type="button" onClick={() => setQuantity((current) => Math.max(current - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--ink)]"><Minus className="h-4 w-4" /></button>
                    <strong className="money text-2xl">{quantity}</strong>
                    <button type="button" onClick={() => setQuantity((current) => Math.min(current + 1, selectedTicketType.available))} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--ink)]"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-black text-[var(--ink)]">Registered user details</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">The final cart uses the signed-in user name and email. Tickets are issued only after Stripe confirms payment and the webhook fulfils the order.</p>
                </div>
              </div>
              {error ? <div className="mt-5 flex gap-3 rounded-[1.4rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div> : null}
            </section>

            <aside className="h-fit rounded-[2.35rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
              <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--ink)] text-[var(--gold)]"><CreditCard className="h-6 w-6" /></div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em]">Cart summary</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{getTicketTypeLabel(selectedTicketType.type)} · {quantity} ticket{quantity === 1 ? "" : "s"}</p>
              <dl className="mt-6 grid gap-3 text-sm font-bold">
                <div className="flex justify-between rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt>Ticket price</dt><dd className="money">{formatCurrency(selectedTicketType.price)}</dd></div>
                <div className="flex justify-between rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt>Subtotal</dt><dd className="money">{formatCurrency(quote.subtotal)}</dd></div>
                <div className="flex justify-between rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt>Platform fee preview</dt><dd className="money">{formatCurrency(quote.serviceFee)}</dd></div>
                <div className="flex justify-between rounded-[1.25rem] border border-[var(--signal)] bg-white p-4 text-lg"><dt>Total preview</dt><dd className="money font-black">{formatCurrency(quote.total)}</dd></div>
              </dl>
              <button type="submit" disabled={isSubmitting || soldOut} className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] disabled:opacity-50">{soldOut ? "Sold out" : isSubmitting ? "Adding to cart..." : "Add to cart"} <ShoppingCart className="h-4 w-4" /></button>
              <Link href="/dashboard/user/shop/cart" className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-6 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">
                Open cart <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </form>
        ) : null}
      </main>
    </>
  );
}
