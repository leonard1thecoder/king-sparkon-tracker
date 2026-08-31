"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { ArtistStatusBadge } from "./ArtistStatusBadge";
import type { ArtistBookingStatus, DraftedEvent } from "@/types/artist";
import { formatZAR, getDraftedEventById, getRequestStatus, requestToPerform } from "@/services/artistService";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

export function ArtistEventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<DraftedEvent | null>(null);
  const [status, setStatus] = useState<ArtistBookingStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEvent(getDraftedEventById(eventId) ?? null);
    setStatus(getRequestStatus(eventId));
    const handler = () => setStatus(getRequestStatus(eventId));
    window.addEventListener("king-sparkon:artist-bookings", handler);
    return () => window.removeEventListener("king-sparkon:artist-bookings", handler);
  }, [eventId]);

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="font-black">Event not found</p>
        <Link href="/dashboard/artist/drafted" className="mt-4 inline-flex text-sm font-black text-[var(--signal)]">
          Back to drafted events
        </Link>
      </div>
    );
  }

  const handleSendRequest = () => {
    setSubmitting(true);
    setTimeout(() => {
      requestToPerform(event.id);
      setStatus("PENDING");
      setDialogOpen(false);
      setSubmitting(false);
      setToast("Performance request sent successfully 🎤");
      setTimeout(() => setToast(""), 3500);
    }, 700);
  };

  const ctaLabel =
    status === "PENDING" ? "Request Pending" : status === "ACCEPTED" || status === "CONFIRMED" ? "Booking Confirmed" : status === "REJECTED" ? "Request Rejected" : "Request to Perform";
  const ctaVariant = status === "PENDING" ? "secondary" : status === "ACCEPTED" || status === "CONFIRMED" ? "primary" : status === "REJECTED" ? "danger" : "primary";
  const ctaDisabled = status === "PENDING" || status === "ACCEPTED" || status === "CONFIRMED" || status === "REJECTED";

  return (
    <div className="pb-10">
      {/* Hero */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900 sm:h-80 md:h-[360px]">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur">Drafted Event</span>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-none tracking-[-0.04em] text-white md:text-5xl">{event.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-white/90">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDateLong(event.eventDate)}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {event.startTime} – {event.endTime}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="grid gap-6">
            {/* Host */}
            <Card className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Hosted by</p>
              <div className="mt-3 flex items-center gap-3">
                {event.businessLogoUrl ? <Image src={event.businessLogoUrl} alt={event.businessName} width={40} height={40} className="h-10 w-10 rounded-full border object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--signal-soft)] text-sm font-black">B</span>}
                <div>
                  <p className="font-black">{event.businessName}</p>
                  <p className="text-xs font-semibold text-[var(--steel)]">{event.venue}</p>
                </div>
              </div>
            </Card>

            <section className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-black">About the Event</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--steel)]">{event.description}</p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Card className="p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Artist Type</p>
                <p className="mt-2 inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--signal-soft)] px-3 py-1 text-sm font-black">{event.artistType}</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Duration</p>
                <p className="mt-2 text-lg font-black">{event.performanceDuration} minutes</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Booking Fee</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-lg font-black text-[var(--signal-strong)]"><Wallet className="h-4 w-4" /> {formatZAR(event.bookingFee)}</p>
              </Card>
            </section>

            <section className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-black">Venue</h2>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--steel)]"><MapPin className="h-4 w-4 text-[var(--signal)]" /> {event.venue} • {event.location}</p>
              <div className="mt-4 h-40 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-[var(--line)] grid place-items-center text-sm font-bold text-[var(--muted)]">Map preview — {event.location}</div>
            </section>

            <section className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-lg font-black">About the Host</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--steel)]">{event.aboutHost ?? `${event.businessName} is a verified King Sparkon business.`}</p>
            </section>
          </div>

          {/* Sticky CTA */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Performance Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between text-sm"><span className="font-bold text-[var(--muted)]">Artist Type</span><span className="font-black">{event.artistType}</span></div>
                <div className="flex justify-between text-sm"><span className="font-bold text-[var(--muted)]">Duration</span><span className="font-black">{event.performanceDuration} min</span></div>
                <div className="flex justify-between text-sm"><span className="font-bold text-[var(--muted)]">Booking Fee</span><span className="font-black text-[var(--signal-strong)]">{formatZAR(event.bookingFee)}</span></div>

                {status ? <div className="flex justify-center"><ArtistStatusBadge status={status} /></div> : null}

                <Button
                  variant={ctaVariant as "primary" | "secondary" | "danger"}
                  disabled={ctaDisabled}
                  onClick={() => setDialogOpen(true)}
                  className={`w-full ${ctaDisabled ? "opacity-70" : ""} ${status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" : ""}`}
                >
                  {ctaLabel}
                </Button>
                <p className="text-center text-xs font-semibold text-[var(--muted)]">{status ? "You will be notified when host responds." : "Secure your slot — hosts review quickly."}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Modal open={dialogOpen} title="Request to Perform" onClose={() => setDialogOpen(false)}>
        <div className="grid gap-4">
          <p className="text-sm text-[var(--steel)]">You&apos;re requesting to perform at:</p>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] p-4">
            <p className="font-black">{event.title}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--steel)]">{formatDateLong(event.eventDate)} • {event.startTime} – {event.endTime}</p>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-4 text-sm"><span className="font-bold text-[var(--muted)]">Minimum booking fee</span><span className="font-black">{formatZAR(event.bookingFee)}</span></div>
          <p className="text-sm font-semibold">Would you like to send your performance request?</p>
          <div className="flex justify-end gap-3">
            <Button variant="quiet" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendRequest} disabled={submitting}>{submitting ? "Sending..." : "Send Request"}</Button>
          </div>
        </div>
      </Modal>

      {toast ? <Toast message={toast} tone="confirm" /> : null}
    </div>
  );
}
