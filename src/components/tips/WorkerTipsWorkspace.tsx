"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Banknote, LockKeyhole, Loader2, QrCode, RefreshCw, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiGet, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser } from "@/lib/types/backend";

type TipRow = Record<string, unknown>;
type TipResponse = TipRow[] | { content?: TipRow[]; data?: TipRow[]; items?: TipRow[] };
type WorkerProfile = TrackerUser & { tipQrCodeEnabled?: boolean; tipQrCodeUrl?: string | null; jobTitle?: string | null };

function rows(payload: TipResponse): TipRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function numeric(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function money(value: unknown) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(numeric(value));
}

function tipAmount(tip: TipRow) {
  return numeric(tip.netAmount ?? tip.tipAmount ?? tip.grossAmount ?? tip.amount);
}

function tipStatus(tip: TipRow) {
  return String(tip.status ?? tip.paymentStatus ?? "PENDING").toUpperCase();
}

export function WorkerTipsWorkspace() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [tips, setTips] = useState<TipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTips() {
    setLoading(true);
    setError(null);
    try {
      const user = await apiGet<WorkerProfile>("/users/me");
      setProfile(user);
      if (!user.tipQrCodeEnabled) {
        setTips([]);
        return;
      }
      const tipPayload = await apiGet<TipResponse>("/tips/me");
      setTips(rows(tipPayload));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTips();
  }, []);

  const total = useMemo(() => tips.reduce((sum, tip) => sum + tipAmount(tip), 0), [tips]);
  const paid = useMemo(() => tips.filter((tip) => tipStatus(tip).includes("PAID") || tipStatus(tip).includes("SUCCESS")).length, [tips]);
  const tipsEnabled = profile?.tipQrCodeEnabled === true;

  if (!loading && profile && !tipsEnabled) {
    return (
      <section className="grid gap-6">
        <Card className="overflow-hidden border-[var(--danger)]/25 bg-white">
          <div className="grid gap-5 bg-[var(--ink)] p-7 text-white md:grid-cols-[auto_1fr] md:items-center">
            <div className="grid h-20 w-20 place-items-center rounded-[1.4rem] border border-white/15 bg-white/10 text-[var(--gold)]"><LockKeyhole className="h-9 w-9" /></div>
            <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">Tips privilege disabled</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">You are not privileged to receive tips</h2><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">Your business owner did not enable tips when creating this worker account. No tip QR is available, and copied or old tip links are rejected by the backend.</p></div>
          </div>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div><p className="font-black text-[var(--ink)]">Worker account: {profile.username}</p><p className="mt-1 text-sm font-semibold text-[var(--steel)]">Ask the business owner to create or update the worker account with the tips option enabled.</p></div>
            <Link href="/dashboard/worker/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:bg-[var(--gold)] hover:text-[var(--ink)]"><UserRound className="h-4 w-4" /> Open profile</Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Tips received" value={loading ? "..." : String(tips.length)} detail="All worker tip records" icon={<WalletCards className="h-5 w-5" />} />
        <MetricCard label="Paid tips" value={loading ? "..." : String(paid)} detail="Successful tip payments" tone="confirm" icon={<Banknote className="h-5 w-5" />} />
        <MetricCard label="Tip value" value={loading ? "..." : money(total)} detail="Recorded worker tip amount" tone="signal" icon={<QrCode className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}

      <Card className="border-[var(--gold)]/50 bg-[var(--gold)]/8">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><CardTitle>Your worker tip QR</CardTitle><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">Customers scan this QR first. Your tip history and payment status appear directly below it.</p></div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadTips()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading tip QR</div> : (
            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
              {profile?.tipQrCodeUrl ? <img src={profile.tipQrCodeUrl} alt="Worker tip QR code" className="h-60 w-60 rounded-[1.5rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-soft)]" /> : <div className="grid h-60 w-60 place-items-center rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white"><QrCode className="h-20 w-20 text-[var(--signal)]" /></div>}
              <div><p className="font-mono text-xs font-black uppercase tracking-[0.15em] text-[var(--signal)]">Worker account</p><h2 className="mt-2 text-3xl font-black text-[var(--ink)]">{profile?.username ?? "Worker tip profile"}</h2><p className="mt-3 text-sm font-semibold leading-6 text-[var(--steel)]">Tips were enabled by your business owner. Keep this QR visible when serving customers.</p>{profile?.tipQrCodeUrl ? <a href={profile.tipQrCodeUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-white px-5 text-sm font-black text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white">Open full QR</a> : null}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tip history</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Tip records appear below the QR, newest backend records first.</p></CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading tips</div> : tips.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No tips have been recorded yet.</p> : (
            <div className="overflow-x-auto rounded-[1.4rem] border border-[var(--line)]"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody>{tips.map((tip, index) => { const id = String(tip.id ?? tip.tipId ?? index + 1); const status = tipStatus(tip); const created = String(tip.createdAt ?? tip.created ?? tip.updatedAt ?? ""); return <tr key={id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-mono text-xs font-black text-[var(--ink)]">#{id}</td><td className="px-4 py-3"><StatusPill label={status} tone={status.includes("PAID") || status.includes("SUCCESS") ? "confirm" : "signal"} /></td><td className="px-4 py-3 text-xs font-bold text-[var(--steel)]">{created ? new Date(created).toLocaleString("en-ZA") : "Pending timestamp"}</td><td className="px-4 py-3 text-right money text-lg font-black text-[var(--ink)]">{money(tipAmount(tip))}</td></tr>; })}</tbody></table></div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
