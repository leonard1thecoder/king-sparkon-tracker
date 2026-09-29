"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, RefreshCw, WalletCards } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { money } from "@/lib/tuck-shop/cart";
import {
  getArtistBalance,
  listArtistWithdrawals,
  requestArtistWithdrawal,
} from "@/services/eventSetService";
import type { ArtistBalance, ArtistWithdrawal } from "@/types/tickets";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function ArtistPayouts() {
  const [balance, setBalance] = useState<ArtistBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<ArtistWithdrawal[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBalance, nextWithdrawals] = await Promise.all([getArtistBalance(), listArtistWithdrawals()]);
      setBalance(nextBalance);
      setWithdrawals(nextWithdrawals);
      if (!businessId && nextBalance.businesses.length === 1) {
        setBusinessId(String(nextBalance.businesses[0].businessId));
      }
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    const value = Number(amount);
    if (!businessId) {
      setError("Choose the business balance to withdraw from.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await requestArtistWithdrawal({ businessId: Number(businessId), amount: value, paypalEmail: paypalEmail.trim() || undefined });
      setAmount("");
      setPaypalEmail("");
      setSuccess("Withdrawal requested — the business owner approves and pays out.");
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Available balance</CardTitle></CardHeader>
          <CardContent>
            <p className="money text-3xl font-black text-[var(--ink)]">{loading ? "..." : money(balance?.totalAvailable ?? 0)}</p>
            <p className="mt-1 text-xs font-bold text-[var(--steel)]">Paid bookings minus requested withdrawals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Awaiting approval</CardTitle></CardHeader>
          <CardContent>
            <p className="money text-3xl font-black text-[var(--ink)]">{loading ? "..." : money(balance?.totalPending ?? 0)}</p>
            <p className="mt-1 text-xs font-bold text-[var(--steel)]">Requested, not yet paid out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Minimum withdrawal</CardTitle></CardHeader>
          <CardContent>
            <p className="money text-3xl font-black text-[var(--ink)]">{loading ? "..." : money(balance?.minimumWithdrawal ?? 0)}</p>
            <p className="mt-1 text-xs font-bold text-[var(--steel)]">Per request, per business balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Request withdrawal</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Withdraw a business balance to PayPal. The business owner approves and pays.</p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Business balance
            <select value={businessId} onChange={(event) => setBusinessId(event.target.value)} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]">
              <option value="">Choose business</option>
              {(balance?.businesses ?? []).map((row) => (
                <option key={row.businessId} value={row.businessId}>{row.businessName ?? `Business #${row.businessId}`} · {money(row.available)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]">
            Amount (R)
            <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Example: 500" className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)] md:col-span-2">
            PayPal email
            <input type="email" value={paypalEmail} onChange={(event) => setPaypalEmail(event.target.value)} placeholder="you@example.com" className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
          </label>
          <div className="md:col-span-2">
            <Button type="button" disabled={saving} onClick={() => void submit()} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />} {saving ? "Requesting..." : "Request withdrawal"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {withdrawals.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <Banknote className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-xl font-black text-[var(--ink)]">No withdrawals yet.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Paid event bookings build the balance above.</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex flex-col gap-1 rounded-[1rem] border border-[var(--line)] bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-[var(--ink)]">#{withdrawal.id} · {money(withdrawal.grossAmount)}</p>
                  <p className="text-xs font-bold text-[var(--steel)]">
                    Requested {withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleString("en-ZA") : "recently"}
                    {withdrawal.decidedByUsername ? ` · by ${withdrawal.decidedByUsername}` : ""}
                  </p>
                </div>
                <StatusPill label={withdrawal.status} tone={withdrawal.status === "PAID" || withdrawal.status === "APPROVED" ? "confirm" : withdrawal.status === "REJECTED" ? "danger" : "signal"} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
