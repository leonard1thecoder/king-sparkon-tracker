"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Heart, Loader2, Mic2, RefreshCw, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import { addServiceToCart, money } from "@/lib/tuck-shop/cart";
import {
  bookSetArtist,
  bookSetWinner,
  cancelEventSet,
  cancelSetBooking,
  completeDraft,
  createEventSet,
  listBookings,
  listEventSets,
  listSetApplications,
  rejectSetApplication,
  type CreateEventSetPayload,
} from "@/services/eventSetService";
import type { CompleteDraftResult, EventSet, EventSetBooking, SetApplication } from "@/types/tickets";

function setTypeTone(setType: string) {
  return setType === "VOW" ? ("confirm" as const) : ("signal" as const);
}

export function EventSetsSection({ eventId, eventStatus }: { eventId: string; eventStatus: string }) {
  const router = useRouter();
  const [sets, setSets] = useState<EventSet[]>([]);
  const [applications, setApplications] = useState<Record<string, SetApplication[]>>({});
  const [bookings, setBookings] = useState<Record<string, EventSetBooking[]>>({});
  const [offers, setOffers] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CreateEventSetPayload>({ name: "", setType: "VOW", startTime: "", endTime: "", price: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<CompleteDraftResult | null>(null);

  const editable = eventStatus === "DRAFT";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventSets(eventId);
      setSets(rows);
      const apps: Record<string, SetApplication[]> = {};
      const books: Record<string, EventSetBooking[]> = {};
      for (const set of rows) {
        try {
          apps[set.id] = await listSetApplications(set.id);
        } catch {
          apps[set.id] = [];
        }
        try {
          books[set.id] = await listBookings(set.id);
        } catch {
          books[set.id] = [];
        }
      }
      setApplications(apps);
      setBookings(books);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!form.name.trim()) {
      setError("Set name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createEventSet(eventId, { ...form, name: form.name.trim(), price: form.price ?? null });
      setForm({ name: "", setType: "VOW", startTime: "", endTime: "", price: null });
      setSuccess("Performance set created.");
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function runAction(key: string, action: () => Promise<unknown>, doneMessage?: string) {
    setActing(key);
    setError(null);
    setSuccess(null);
    try {
      await action();
      if (doneMessage) setSuccess(doneMessage);
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActing(null);
    }
  }

  async function handleCompleteDraft() {
    setActing("complete-draft");
    setError(null);
    setSuccess(null);
    setDraftResult(null);
    try {
      const result = await completeDraft(eventId);
      setDraftResult(result);
      if (result.published) {
        setSuccess("Event published — no artist bookings needed payment.");
      }
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActing(null);
    }
  }

  function addBookingsToCart() {
    if (!draftResult) return;
    for (const line of draftResult.cartLines) {
      addServiceToCart({ serviceKind: "ARTIST_BOOKING", referenceId: line.referenceId, label: line.label, unitPrice: line.amount });
    }
    router.push("/dashboard/owner/cart");
  }

  const cartTotal = (draftResult?.cartLines ?? []).reduce((sum, line) => sum + Number(line.amount ?? 0), 0);

  return (
    <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Performance sets</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Artist sets & vows</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">
            Split the event into timed sets. Vow sets are filled by user vows (top-vowed artist wins the set price); manual sets are filled by booking artists with per-artist offers. Finishing the draft sends unpaid bookings to the shared cart — events without sets publish directly.
          </p>
        </div>
        <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error ? <p className="mt-4 rounded-[1.25rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="mt-4 inline-flex items-center gap-2 rounded-[1.25rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      {editable ? (
        <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Set name
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Headline set" className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-bold normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Set type
            <select value={form.setType} onChange={(event) => setForm((current) => ({ ...current, setType: event.target.value as "VOW" | "MANUAL" }))} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]">
              <option value="VOW">Vow set — users vow, top artist wins</option>
              <option value="MANUAL">Manual set — owner books artists</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Set price (R) {form.setType === "VOW" ? "· required" : "· optional default offer"}
            <input type="number" min="0" step="0.01" value={form.price ?? ""} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value === "" ? null : Number(event.target.value) }))} placeholder="Example: 2500" className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Start time
            <input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            End time
            <input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <div className="flex items-end">
            <Button type="button" disabled={saving} onClick={() => void handleCreate()} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic2 className="h-4 w-4" />} {saving ? "Creating..." : "Create set"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading sets</div>
        ) : sets.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <Mic2 className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <p className="mt-3 text-xl font-black text-[var(--ink)]">No performance sets yet.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Create vow or manual sets above — or finish drafting with no sets to publish the event directly.</p>
          </div>
        ) : (
          sets.map((set) => {
            const apps = applications[set.id] ?? [];
            const books = bookings[set.id] ?? [];
            return (
              <div key={set.id} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={set.setType === "VOW" ? "VOW SET" : "MANUAL SET"} tone={setTypeTone(set.setType)} />
                  <StatusPill label={set.status} tone={set.status === "OPEN" ? "signal" : set.status === "BOOKED" ? "confirm" : "neutral"} />
                  <p className="font-black text-[var(--ink)]">{set.name}</p>
                  <p className="text-xs font-bold text-[var(--steel)]">{set.startTime}–{set.endTime}{set.price != null ? ` · ${money(set.price)}` : ""} · {apps.length} applications · {set.totalVows} vows</p>
                  {set.topArtistName ? <p className="text-xs font-black text-[var(--confirm)]">Top vowed: {set.topArtistName} ({set.topVowCount})</p> : null}
                  {editable && set.status === "OPEN" ? (
                    <button type="button" disabled={acting === `cancel-${set.id}`} onClick={() => void runAction(`cancel-${set.id}`, () => cancelEventSet(set.id), "Set cancelled.")} className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-full border border-[var(--line)] px-3 text-xs font-black text-[var(--steel)] hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-50">
                      <X className="h-3.5 w-3.5" /> Cancel set
                    </button>
                  ) : null}
                </div>

                {apps.length > 0 ? (
                  <div className="grid gap-2">
                    {apps.map((application) => {
                      const offerKey = `${set.id}:${application.id}`;
                      return (
                        <div key={application.id} className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black text-[var(--ink)]">{application.artistName}</p>
                            <p className="text-xs font-bold text-[var(--steel)]">{application.status} · <Heart className="inline h-3 w-3" /> {application.vowCount} vows</p>
                          </div>
                          {editable && application.status === "PENDING" ? (
                            <div className="flex flex-wrap items-center gap-2">
                              {set.setType === "MANUAL" ? (
                                <>
                                  <input type="number" min="0" step="0.01" value={offers[offerKey] ?? ""} onChange={(event) => setOffers((current) => ({ ...current, [offerKey]: event.target.value }))} placeholder="Offer R" className="min-h-9 w-32 rounded-full border border-[var(--line)] bg-white px-3 text-sm font-black outline-none focus:border-[var(--signal)]" />
                                  <button type="button" disabled={acting === `book-${application.id}`} onClick={() => void runAction(`book-${application.id}`, () => bookSetArtist(set.id, application.artistId, Number(offers[offerKey])), `${application.artistName} booked.`)} className="inline-flex min-h-9 items-center rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-4 text-xs font-black text-white disabled:opacity-50">
                                    Book artist
                                  </button>
                                </>
                              ) : null}
                              <button type="button" disabled={acting === `reject-${application.id}`} onClick={() => void runAction(`reject-${application.id}`, () => rejectSetApplication(set.id, application.id), "Application rejected.")} className="inline-flex min-h-9 items-center rounded-full border border-[var(--line)] px-4 text-xs font-black text-[var(--steel)] hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-50">
                                Reject
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-[var(--steel)]">No artist applications yet — artists apply from their sets page.</p>
                )}

                {books.length > 0 ? (
                  <div className="grid gap-2">
                    {books.map((booking) => (
                      <div key={booking.id} className="flex flex-col gap-1 rounded-[1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-black text-[var(--ink)]">{booking.artistName} · {money(booking.offerAmount)} · {booking.status}</p>
                        {editable && booking.status === "PENDING" ? (
                          <button type="button" disabled={acting === `cancel-booking-${booking.id}`} onClick={() => void runAction(`cancel-booking-${booking.id}`, () => cancelSetBooking(booking.id), "Offer cancelled.")} className="text-xs font-black text-[var(--steel)] hover:text-[var(--danger)] disabled:opacity-50">
                            Cancel offer
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {editable && set.setType === "VOW" && set.status === "OPEN" ? (
                  <div>
                    <Button type="button" variant="quiet" disabled={acting === `winner-${set.id}`} onClick={() => void runAction(`winner-${set.id}`, () => bookSetWinner(set.id), "Top-vowed artist booked.")}>
                      <Heart className="h-4 w-4" /> Book top-vowed artist{set.price != null ? ` · ${money(set.price)}` : ""}
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {editable ? (
        <div className="mt-6 rounded-[1.5rem] border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4">
          <h3 className="text-lg font-black text-[var(--ink)]">Finish drafting</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--steel)]">Events without sets publish immediately. With sets, unpaid artist bookings are sent to the shared cart — pay them there and the event publishes automatically once every booking is paid.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" disabled={acting === "complete-draft"} onClick={() => void handleCompleteDraft()}>
              {acting === "complete-draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Finish drafting
            </Button>
            {draftResult && !draftResult.published ? (
              <Button type="button" onClick={addBookingsToCart}>
                <ShoppingCart className="h-4 w-4" /> Add {draftResult.cartLines.length} booking{draftResult.cartLines.length === 1 ? "" : "s"} to cart · {money(cartTotal)}
              </Button>
            ) : null}
            {draftResult?.published ? (
              <Link href="/dashboard/owner/tickets" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white">
                Published · view tickets
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
