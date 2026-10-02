"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mic2, RefreshCw, ThumbsUp } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { money } from "@/lib/tuck-shop/cart";
import {
  applyToSet,
  listMySetApplications,
  listMySetBookings,
  listOpenSets,
  respondToSetBooking,
} from "@/services/eventSetService";
import type { EventSet, EventSetBooking, SetApplication } from "@/types/tickets";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function ArtistSets() {
  const [sets, setSets] = useState<EventSet[]>([]);
  const [applications, setApplications] = useState<SetApplication[]>([]);
  const [bookings, setBookings] = useState<EventSetBooking[]>([]);
  const [appliedSetIds, setAppliedSetIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [openSets, myApplications, myBookings] = await Promise.all([
        listOpenSets(),
        listMySetApplications().catch(() => [] as SetApplication[]),
        listMySetBookings().catch(() => [] as EventSetBooking[]),
      ]);
      setSets(openSets);
      setApplications(myApplications);
      setBookings(myBookings);
      setAppliedSetIds(new Set(myApplications.map((application) => application.setId)));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function apply(setId: string, setName: string) {
    setActing(`apply-${setId}`);
    setError(null);
    setSuccess(null);
    try {
      await applyToSet(setId);
      setSuccess(`Applied for ${setName} — users can now vow for you.`);
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActing(null);
    }
  }

  async function respond(bookingId: string, accept: boolean, artistName: string) {
    setActing(`booking-${bookingId}`);
    setError(null);
    setSuccess(null);
    try {
      await respondToSetBooking(bookingId, accept);
      setSuccess(accept ? `Offer accepted — ${artistName} is booked, payment follows through the event cart.` : "Offer rejected.");
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActing(null);
    }
  }

  const pendingOffers = bookings.filter((booking) => booking.status === "PENDING");

  return (
    <section className="grid gap-5">
      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      {pendingOffers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Booking offers awaiting you</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Owners offered you these sets — accept to lock the booking and get paid through the event cart.</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pendingOffers.map((booking) => (
              <div key={booking.id} className="grid gap-2 rounded-[1.25rem] border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-[var(--ink)]">{booking.setName} · {booking.eventName}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--steel)]">Offer {money(booking.offerAmount)} · requested {booking.requestedAt ? new Date(booking.requestedAt).toLocaleString("en-ZA") : "recently"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={acting === `booking-${booking.id}`} onClick={() => void respond(booking.id, true, booking.artistName)}>Accept offer</Button>
                  <Button type="button" variant="quiet" disabled={acting === `booking-${booking.id}`} onClick={() => void respond(booking.id, false, booking.artistName)}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Open performance sets</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Drafted events looking for artists. Apply and collect user vows — top-vowed artists win vow sets at the set price.</p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading ? (
            <div className="flex min-h-32 items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-[var(--surface)] text-[0.8125rem] font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading open sets</div>
          ) : sets.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-5 text-center">
              <Mic2 className="mx-auto h-7 w-7 text-[var(--signal)]" />
              <p className="mt-2 text-[0.9375rem] font-bold text-[var(--ink)]">No open sets right now.</p>
              <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--steel)]">New performance sets from drafted events will appear here.</p>
            </div>
          ) : (
            sets.map((set) => {
              const applied = appliedSetIds.has(set.id);
              return (
                <div key={set.id} className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label={set.setType === "VOW" ? "VOW SET" : "MANUAL SET"} tone={set.setType === "VOW" ? "confirm" : "signal"} />
                    <p className="font-black text-[var(--ink)]">{set.name}</p>
                    <p className="text-xs font-bold text-[var(--steel)]">{set.eventName} · {set.eventDate} · {set.startTime}–{set.endTime}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--steel)]">
                    {set.applicationCount} applications · {set.totalVows} vows
                    {set.topArtistName ? ` · leading ${set.topArtistName} (${set.topVowCount})` : ""}
                    {set.setType === "VOW" && set.price != null ? ` · winner books ${money(set.price)}` : ""}
                  </p>
                  {applied ? (
                    <p className="inline-flex items-center gap-2 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> Applied — share your name for vows</p>
                  ) : (
                    <div>
                      <Button type="button" disabled={acting === `apply-${set.id}`} onClick={() => void apply(set.id, set.name)}>
                        {acting === `apply-${set.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />} Apply for this set
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {applications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>My applications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {applications.map((application) => (
              <div key={application.id} className="flex flex-col gap-1 rounded-[1rem] border border-[var(--line)] bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-[var(--ink)]">Set application · {application.vowCount} vows</p>
                <StatusPill label={application.status} tone={application.status === "PENDING" ? "signal" : application.status === "ACCEPTED" ? "confirm" : "neutral"} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
