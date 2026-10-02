"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, Mic2 } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { money } from "@/lib/tuck-shop/cart";
import {
  listEventSets,
  listSetApplications,
  vowForArtist,
} from "@/services/eventSetService";
import type { EventSet, SetApplication } from "@/types/tickets";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";

export function EventSetVows({ eventId, eventStatus }: { eventId: string; eventStatus: string }) {
  const [sets, setSets] = useState<EventSet[]>([]);
  const [applications, setApplications] = useState<Record<string, SetApplication[]>>({});
  const [loading, setLoading] = useState(true);
  const [vowing, setVowing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventSets(eventId);
      const vowSets = rows.filter((set) => set.setType === "VOW" && set.status === "OPEN");
      setSets(vowSets);
      const apps: Record<string, SetApplication[]> = {};
      for (const set of vowSets) {
        try {
          apps[set.id] = await listSetApplications(set.id);
        } catch {
          apps[set.id] = [];
        }
      }
      setApplications(apps);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventStatus === "DRAFT") void load();
    else setLoading(false);
  }, [eventStatus, load]);

  if (eventStatus !== "DRAFT") return null;

  async function vow(setId: string, applicationId: string, artistName: string) {
    setVowing(applicationId);
    setError(null);
    setSuccess(null);
    try {
      const result = await vowForArtist(setId, applicationId);
      setSuccess(
        result.isTop
          ? `Vowed for ${artistName} — leading with ${result.vowCount} vows.`
          : `Vowed for ${artistName} (${result.vowCount} vows, top is ${result.topVowCount}).`,
      );
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setVowing(null);
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Artist vows</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Vow your artists on stage</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">This event is still drafting its lineup. Vow any artists you want to see — the top-vowed artist wins each set.</p>
        </div>
        <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error ? <p className="mt-4 rounded-[1.25rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="mt-4 rounded-[1.25rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading vow sets</div>
        ) : sets.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <Mic2 className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <p className="mt-3 text-xl font-black text-[var(--ink)]">No vow sets open yet.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">The owner has not opened artist vowing for this event.</p>
          </div>
        ) : (
          sets.map((set) => {
            const apps = applications[set.id] ?? [];
            return (
              <div key={set.id} className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label="VOW SET" tone="confirm" />
                  <p className="font-black text-[var(--ink)]">{set.name}</p>
                  <p className="text-xs font-bold text-[var(--steel)]">{set.startTime}–{set.endTime}{set.price != null ? ` · winner books ${money(set.price)}` : ""}</p>
                  {set.topArtistName ? <p className="text-xs font-black text-[var(--confirm)]">Leading: {set.topArtistName} ({set.topVowCount})</p> : null}
                </div>
                {apps.length === 0 ? (
                  <p className="text-sm font-semibold text-[var(--steel)]">No artists applied to this set yet.</p>
                ) : (
                  apps.map((application) => (
                    <div key={application.id} className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[var(--ink)]">{application.artistName}</p>
                        <p className="text-xs font-bold text-[var(--steel)]"><Heart className="inline h-3 w-3" /> {application.vowCount} vows</p>
                      </div>
                      <Button type="button" variant="quiet" disabled={vowing === application.id} onClick={() => void vow(set.id, application.id, application.artistName)}>
                        {vowing === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />} Vow
                      </Button>
                    </div>
                  ))
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
