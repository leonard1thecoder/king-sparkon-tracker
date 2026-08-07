"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, MapPin, MessageCircle, ShieldCheck, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketTypeCard } from "@/components/tickets/TicketTypeCard";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { getTicketBannerImage } from "@/components/tickets/ticketBannerImage";
import { addEventComment, getEventComments } from "@/services/ticketEngagementService";
import { getEventTotals } from "@/services/ticketService";
import { getLiveEventById } from "@/lib/api/tickets";
import type { TicketEvent, TicketEventComment } from "@/types/tickets";

type DashboardTicketEventDetailsProps = { eventId: string };

function formatDate(eventDate: string, eventTime: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "full", timeStyle: "short" }).format(new Date(`${eventDate}T${eventTime}`));
}

export function DashboardTicketEventDetails({ eventId }: DashboardTicketEventDetailsProps) {
  const [event, setEvent] = useState<TicketEvent | null>(null);
  const [comments, setComments] = useState<TicketEventComment[]>([]);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("Sizolwakhe");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getLiveEventById(eventId), getEventComments(eventId)]).then(([nextEvent, nextComments]) => {
      if (!mounted) return;
      setEvent(nextEvent);
      setComments(nextComments);
      setIsLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setEvent(null);
      setComments([]);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [eventId]);

  async function submitComment() {
    const created = await addEventComment(eventId, displayName, comment);
    setComments((current) => [created, ...current]);
    setComment("");
  }

  if (isLoading) {
    return (
      <>
        <DashboardHeader role="USER WORKSPACE" title="Event details" description="Loading live dashboard event details and ticket capacity." />
        <main className="bg-[var(--surface)] p-5 md:p-8"><div className="h-[32rem] animate-pulse rounded-[2.4rem] border border-[var(--line)] bg-white" /></main>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <DashboardHeader role="USER WORKSPACE" title="Event not found" description="The selected live ticket event could not be found." />
        <main className="bg-[var(--surface)] p-5 md:p-8">
          <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]"><Ticket className="mx-auto h-10 w-10 text-[var(--signal)]" /><h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Event not found</h1><p className="mt-2 text-sm font-semibold text-[var(--steel)]">This event may have been removed, unpublished, or the ID is incorrect.</p><Link href="/dashboard/user/tickets/buy" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to buy tickets</Link></div>
        </main>
      </>
    );
  }

  const totals = getEventTotals(event);
  const soldOut = totals.totalAvailable <= 0;
  const bannerSrc = getTicketBannerImage(event);

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title={event.name} description="Review live event details, ticket classes, comments, and verified checkout from inside the user dashboard." />
      <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
          {/* Large Hero Poster Image Banner */}
          <div className="w-full overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-slate-950 p-4 sm:p-6 shadow-[var(--shadow-depth)]">
            <div className="relative flex min-h-[26rem] sm:min-h-[34rem] lg:min-h-[40rem] flex-col items-center justify-center">
              {bannerSrc ? (
                <img
                  src={bannerSrc}
                  alt={`${event.name} banner`}
                  className="h-auto w-full max-h-[40rem] rounded-2xl object-contain shadow-2xl transition duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="h-80 w-full rounded-2xl scan-grid" />
              )}
              <div className="mt-4 flex w-full items-center justify-between px-2">
                <TicketStatusBadge status={event.status} />
                <span className="text-xs font-black uppercase tracking-[0.16em] text-white/80">Verified Event Poster</span>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="mt-8">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Live dashboard event details</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.96] tracking-[-0.06em] md:text-6xl">{event.name}</h1>
            <p className="mt-5 text-lg leading-8 text-[var(--steel)]">{event.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--steel)] shadow-[var(--shadow-soft)]">
                <Calendar className="h-4.5 w-4.5 text-[var(--signal)]" />{formatDate(event.eventDate, event.eventTime)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--steel)] shadow-[var(--shadow-soft)]">
                <MapPin className="h-4.5 w-4.5 text-[var(--signal)]" />{event.location}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center sm:max-w-xl">
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="money text-2xl font-black">{totals.totalCapacity}</p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Capacity</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="money text-2xl font-black">{totals.totalSold}</p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Sold</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="money text-2xl font-black">{totals.totalAvailable}</p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Available</p>
              </div>
            </div>

            {soldOut ? (
              <div className="mt-6 rounded-[1.4rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">
                All ticket classes are sold out.
              </div>
            ) : (
              <Link
                href={`/dashboard/user/tickets/checkout/${event.id}`}
                className="mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-8 font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"
              >
                Buy tickets <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7"><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Ticket classes</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Regular, VIP and VVIP availability</h2></div><div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--steel)]"><ShieldCheck className="h-4 w-4 text-[var(--confirm)]" /> Backend capacity checked again at payment</div></div><div className="mt-8 grid gap-5 lg:grid-cols-3">{event.ticketTypes.map((ticketType) => <TicketTypeCard key={ticketType.id} ticketType={ticketType} eventId={event.id} checkoutHref={`/dashboard/user/tickets/checkout/${event.id}?type=${ticketType.type}`} />)}</div></section>

        <section className="rounded-[2.25rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-[var(--signal)]" /><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Event comments</p><h2 className="text-2xl font-black tracking-[-0.04em]">Ask questions before buying</h2></div></div><div className="mt-6 grid gap-3 md:grid-cols-[0.35fr_1fr_auto]"><input value={displayName} onChange={(changeEvent) => setDisplayName(changeEvent.target.value)} placeholder="Display name" className="min-h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" /><input value={comment} onChange={(changeEvent) => setComment(changeEvent.target.value)} placeholder="Write a comment about this event" className="min-h-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" /><button type="button" onClick={submitComment} className="min-h-12 rounded-2xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)]">Comment</button></div><div className="mt-6 grid gap-3">{comments.length === 0 ? <p className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--steel)]">No comments yet.</p> : comments.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="font-black text-[var(--ink)]">{item.displayName}</p><p className="mt-2 text-sm leading-6 text-[var(--steel)]">{item.comment}</p></article>)}</div></section>
      </main>
    </>
  );
}
