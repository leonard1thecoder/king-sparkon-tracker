"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BadgePercent, CalendarDays, CheckCircle2, Loader2, Megaphone, Plus, RefreshCw } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import {
  createOwnerArtistEvent,
  getOwnerEventRider,
  listOwnerArtistEvents,
  publishOwnerArtistEvent,
} from "@/lib/api/artist-events";
import type { BackendArtistEvent, EventRiderSummary } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatZAR } from "@/services/artistService";

const inputClass = "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)]";
const labelClass = "grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]";

const emptyForm = {
  title: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  venue: "",
  imageUrl: "",
  artistType: "DJ",
  bookingFee: "",
  performanceDuration: "60",
  aboutHost: "",
  riderAvailable: false,
  riderAmount: "",
};

export function OwnerArtistEvents() {
  const [events, setEvents] = useState<BackendArtistEvent[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [riderFor, setRiderFor] = useState<string | null>(null);
  const [riderSummary, setRiderSummary] = useState<EventRiderSummary | null>(null);
  const [riderLoading, setRiderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listOwnerArtistEvents();
      setEvents(Array.isArray(items) ? items : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const riderAmount = form.riderAmount.trim() === "" ? null : Number(form.riderAmount);
      if (form.riderAvailable && (riderAmount === null || !Number.isFinite(riderAmount) || riderAmount <= 0)) {
        throw new Error("Rider amount is required and must be greater than 0 when the rider is available.");
      }
      const created = await createOwnerArtistEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location.trim(),
        venue: form.venue.trim(),
        imageUrl: form.imageUrl.trim() || null,
        artistType: form.artistType,
        bookingFee: form.bookingFee.trim() === "" ? null : Number(form.bookingFee),
        performanceDuration: form.performanceDuration.trim() === "" ? null : Number(form.performanceDuration),
        aboutHost: form.aboutHost.trim() || null,
        riderAvailable: form.riderAvailable,
        riderAmount,
      });
      setForm(emptyForm);
      setNotice(
        form.riderAvailable
          ? `Drafted event created with a R${Number(riderAmount).toFixed(2)} rider. Publish it so booked artists can redeem company products.`
          : `Drafted event "${created.title}" created.`,
      );
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function publish(eventId: string) {
    setPublishingId(eventId);
    setError(null);
    setNotice(null);
    try {
      await publishOwnerArtistEvent(eventId);
      setNotice("Event published. Booked artists can now redeem the rider against your company products.");
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setPublishingId(null);
    }
  }

  async function openRider(eventId: string) {
    if (riderFor === eventId) {
      setRiderFor(null);
      setRiderSummary(null);
      return;
    }
    setRiderFor(eventId);
    setRiderLoading(true);
    setError(null);
    try {
      setRiderSummary(await getOwnerEventRider(eventId));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setRiderFor(null);
    } finally {
      setRiderLoading(false);
    }
  }

  return (
    <section className="grid gap-6">
      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {notice}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create drafted event</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Draft an event looking for artists. Toggle the rider on and set its amount when booked artists should get company-paid products — the company pays, stock drops immediately, and artists collect straight from My Purchases.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={createEvent} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelClass}>Title<input required value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} className={inputClass} maxLength={220} placeholder="Summer rooftop session" /></label>
              <label className={labelClass}>Artist type
                <select value={form.artistType} onChange={(e) => setForm((c) => ({ ...c, artistType: e.target.value }))} className={inputClass}>
                  <option value="DJ">DJ</option>
                  <option value="MUSICIAN">Musician</option>
                  <option value="MCEE">MCee</option>
                </select>
              </label>
              <label className={labelClass}>Event date<input required type="date" value={form.eventDate} onChange={(e) => setForm((c) => ({ ...c, eventDate: e.target.value }))} className={inputClass} /></label>
              <label className={labelClass}>Start time<input required type="time" value={form.startTime} onChange={(e) => setForm((c) => ({ ...c, startTime: e.target.value }))} className={inputClass} /></label>
              <label className={labelClass}>End time<input required type="time" value={form.endTime} onChange={(e) => setForm((c) => ({ ...c, endTime: e.target.value }))} className={inputClass} /></label>
              <label className={labelClass}>Location<input required value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} className={inputClass} maxLength={220} placeholder="Johannesburg" /></label>
              <label className={labelClass}>Venue<input required value={form.venue} onChange={(e) => setForm((c) => ({ ...c, venue: e.target.value }))} className={inputClass} maxLength={220} placeholder="The Venue" /></label>
              <label className={labelClass}>Booking fee (R)<input type="number" min={0} step="0.01" value={form.bookingFee} onChange={(e) => setForm((c) => ({ ...c, bookingFee: e.target.value }))} className={inputClass} placeholder="2500" /></label>
              <label className={labelClass}>Duration (minutes)<input type="number" min={1} step={1} value={form.performanceDuration} onChange={(e) => setForm((c) => ({ ...c, performanceDuration: e.target.value }))} className={inputClass} placeholder="60" /></label>
              <label className={labelClass}>Image URL · optional<input value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} className={inputClass} placeholder="https://..." /></label>
            </div>
            <label className={labelClass}>Description<textarea required value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} className={`${inputClass} min-h-24 py-3`} maxLength={4000} placeholder="What kind of performance are you looking for?" /></label>
            <label className={labelClass}>About host · optional<textarea value={form.aboutHost} onChange={(e) => setForm((c) => ({ ...c, aboutHost: e.target.value }))} className={`${inputClass} min-h-20 py-3`} maxLength={4000} placeholder="Tell artists about the venue and crowd." /></label>

            <div className="grid gap-4 rounded-[1.2rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={form.riderAvailable} onChange={(e) => setForm((c) => ({ ...c, riderAvailable: e.target.checked }))} className="mt-1 h-5 w-5 accent-[var(--signal)]" />
                <span><span className="block font-black text-[var(--ink)]">Rider available for booked artists</span><span className="mt-1 block text-sm font-semibold leading-6 text-[var(--steel)]">When published, booked artists pick company products up to the rider amount. No cart, no PayFast — the company pays and stock drops at once.</span></span>
              </label>
              {form.riderAvailable ? (
                <label className={labelClass}>Rider amount (R)<input required type="number" min={0.01} step="0.01" value={form.riderAmount} onChange={(e) => setForm((c) => ({ ...c, riderAmount: e.target.value }))} className={inputClass} placeholder="e.g. 500" /><span className="text-[0.65rem] font-bold normal-case tracking-normal text-[var(--muted)]">Required when the rider is on. Cannot be lowered below what artists already redeemed.</span></label>
              ) : null}
            </div>

            <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {saving ? "Creating…" : "Create drafted event"}</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Drafted events</CardTitle><p className="mt-2 text-sm text-[var(--steel)]">Publish an event so booked artists can redeem the rider, and inspect what each artist took.</p></div>
          <Button type="button" variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading events</div>
          : events.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No drafted events yet.</p>
          : (
            <div className="grid gap-3">
              {events.map((item) => (
                <article key={item.id} className="grid gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-[var(--ink)]">{item.title}</h3>
                    <StatusPill label={item.status} tone={item.status === "PUBLISHED" ? "confirm" : "neutral"} />
                    {item.riderAvailable ? <StatusPill label={`RIDER R${Number(item.riderAmount ?? 0).toFixed(2)}`} tone="signal" /> : <StatusPill label="NO RIDER" tone="neutral" />}
                  </div>
                  <p className="text-sm font-semibold text-[var(--steel)]">{item.eventDate} · {item.startTime}–{item.endTime} · {item.venue}, {item.location} · {formatZAR(Number(item.bookingFee ?? 0))}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== "PUBLISHED" ? (
                      <Button type="button" disabled={publishingId === item.id} onClick={() => void publish(item.id)}>
                        {publishingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />} Publish
                      </Button>
                    ) : null}
                    {item.riderAvailable ? (
                      <Button type="button" variant="quiet" onClick={() => void openRider(item.id)}>
                        <BadgePercent className="h-4 w-4" /> {riderFor === item.id ? "Hide rider" : "View rider"}
                      </Button>
                    ) : null}
                  </div>
                  {riderFor === item.id ? (
                    <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                      {riderLoading ? <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading rider…</p>
                      : riderSummary ? (
                        <div className="grid gap-2 text-sm">
                          <p className="font-black">Rider {formatZAR(Number(riderSummary.riderAmount ?? 0))} · spent {formatZAR(Number(riderSummary.totalSpent ?? 0))}</p>
                          {riderSummary.perArtist.length === 0 ? <p className="font-semibold text-[var(--steel)]">No redemptions yet.</p> :
                            riderSummary.perArtist.map((row) => (
                              <p key={row.artistId} className="flex items-center gap-2 font-semibold text-[var(--steel)]"><CalendarDays className="h-4 w-4 text-[var(--signal)]" /> {row.artistName}: {formatZAR(Number(row.spentAmount ?? 0))} across {row.itemCount} item{row.itemCount === 1 ? "" : "s"}</p>
                            ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
