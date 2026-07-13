"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, ShieldCheck, Trash2, UserRound, WalletCards } from "lucide-react";
import { apiDelete, apiGet, apiPost, normalizeApiError } from "@/lib/api/client";
import type { PageResponse } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

type WorkerUser = {
  id: number;
  username: string;
  emailAddress: string;
  privilege?: string;
  cellphoneNumber?: string | null;
  jobTitle?: string | null;
  profilePictureUrl?: string | null;
  tipQrCodeEnabled?: boolean;
  tipQrCodeUrl?: string | null;
  onboardingCompleted?: boolean;
};

type CreateWorkerPayload = {
  username: string;
  emailAddress: string;
  password: string;
  cellphoneNumber: string;
  jobTitle: string;
  tipQrCodeEnabled: boolean;
  profilePictureUrl?: string | null;
};

const emptyForm: CreateWorkerPayload = {
  username: "",
  emailAddress: "",
  password: "",
  cellphoneNumber: "",
  jobTitle: "",
  tipQrCodeEnabled: false,
  profilePictureUrl: "",
};

const inputClass = "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)]";

export function OwnerWorkerManager() {
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [form, setForm] = useState<CreateWorkerPayload>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadWorkers() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<PageResponse<WorkerUser>>("/users?page=0&size=100");
      setWorkers((response.content ?? []).filter((user) => String(user.privilege ?? "").toLowerCase() === "worker"));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkers();
  }, []);

  const tipsEnabled = useMemo(() => workers.filter((worker) => worker.tipQrCodeEnabled).length, [workers]);

  async function createWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiPost<WorkerUser, CreateWorkerPayload>("/users/workers", {
        ...form,
        username: form.username.trim(),
        emailAddress: form.emailAddress.trim(),
        cellphoneNumber: form.cellphoneNumber.trim(),
        jobTitle: form.jobTitle.trim(),
        profilePictureUrl: form.profilePictureUrl?.trim() || null,
      });
      setForm(emptyForm);
      setNotice("Worker created. The tips privilege was saved with the worker account.");
      await loadWorkers();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteWorker(worker: WorkerUser) {
    setDeletingId(worker.id);
    setError(null);
    setNotice(null);
    try {
      await apiDelete<void>(`/users/workers/${worker.id}`);
      setNotice(`${worker.username} was removed from the business.`);
      await loadWorkers();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Workers" value={loading ? "..." : String(workers.length)} detail="Business worker accounts" tone="confirm" icon={<UserRound className="h-5 w-5" />} />
        <MetricCard label="Tips enabled" value={loading ? "..." : String(tipsEnabled)} detail="Workers privileged to receive tips" tone="signal" icon={<WalletCards className="h-5 w-5" />} />
        <MetricCard label="Tips disabled" value={loading ? "..." : String(Math.max(workers.length - tipsEnabled, 0))} detail="Workers without tip access" icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">{notice}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create worker</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Choose the tips privilege while creating the worker. When disabled, the worker can still use product, ticket and profile tools but cannot open a tip QR or receive tips.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={createWorker} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Username<input required value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} className={inputClass} placeholder="worker.username" /></label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Email address<input required type="email" value={form.emailAddress} onChange={(event) => setForm((current) => ({ ...current, emailAddress: event.target.value }))} className={inputClass} placeholder="worker@example.com" /></label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Temporary password<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className={inputClass} /></label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Cellphone number<input required value={form.cellphoneNumber} onChange={(event) => setForm((current) => ({ ...current, cellphoneNumber: event.target.value }))} className={inputClass} placeholder="+27..." /></label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Job title<input required value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} className={inputClass} placeholder="Cashier" /></label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Profile picture URL · optional<input value={form.profilePictureUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, profilePictureUrl: event.target.value }))} className={inputClass} placeholder="https://..." /></label>
            </div>

            <label className="flex items-start gap-3 rounded-[1.2rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4">
              <input type="checkbox" checked={form.tipQrCodeEnabled} onChange={(event) => setForm((current) => ({ ...current, tipQrCodeEnabled: event.target.checked }))} className="mt-1 h-5 w-5 accent-[var(--signal)]" />
              <span><span className="block font-black text-[var(--ink)]">Enable tips for this worker</span><span className="mt-1 block text-sm font-semibold leading-6 text-[var(--steel)]">Creates the worker tip QR and grants access to Tips & QR. Leave unchecked to show a “not privileged” message instead.</span></span>
            </label>

            <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {saving ? "Creating worker..." : "Create worker"}</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Business workers</CardTitle><p className="mt-2 text-sm text-[var(--steel)]">Review each worker and the tips permission saved at creation.</p></div><Button type="button" variant="quiet" onClick={() => void loadWorkers()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button></CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading workers</div> : workers.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No workers have been created yet.</p> : (
            <div className="grid gap-3">
              {workers.map((worker) => <article key={worker.id} className="grid gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-[1rem] border border-[var(--line)] bg-[var(--surface)]">{worker.profilePictureUrl ? <img src={worker.profilePictureUrl} alt={worker.username} className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5 text-[var(--signal)]" />}</div>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-[var(--ink)]">{worker.username}</h3><StatusPill label={worker.tipQrCodeEnabled ? "TIPS ENABLED" : "NO TIP PRIVILEGE"} tone={worker.tipQrCodeEnabled ? "confirm" : "neutral"} /></div><p className="mt-1 text-sm font-semibold text-[var(--steel)]">{worker.jobTitle || "Worker"} · {worker.emailAddress}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{worker.cellphoneNumber || "No cellphone"}</p></div>
                <Button type="button" variant="quiet" disabled={deletingId === worker.id} onClick={() => void deleteWorker(worker)}>{deletingId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove</Button>
              </article>)}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
