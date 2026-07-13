"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Landmark, Loader2, RefreshCw, Send, Ticket, WalletCards } from "lucide-react";
import {
  getOwnerWallet,
  listOwnerWithdrawals,
  requestOwnerWithdrawal,
  type OwnerWalletSummary,
  type OwnerWithdrawal,
} from "@/lib/api/owner-finance";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

const emptyForm = {
  amount: "",
  payoutMethod: "BANK_TRANSFER",
  payoutDestination: "",
  notes: "",
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function date(value?: string | null) {
  return value ? new Date(value).toLocaleString("en-ZA") : "Not processed";
}

function sourceTone(source: string) {
  if (source === "PRODUCT") return "signal" as const;
  if (source === "TIP") return "confirm" as const;
  if (source === "TICKET") return "neutral" as const;
  return "confirm" as const;
}

export function OwnerWithdrawalsWorkspace() {
  const [wallet, setWallet] = useState<OwnerWalletSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<OwnerWithdrawal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextWallet, nextWithdrawals] = await Promise.all([
        getOwnerWallet(),
        listOwnerWithdrawals(),
      ]);
      setWallet(nextWallet);
      setWithdrawals(Array.isArray(nextWithdrawals) ? nextWithdrawals : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const amount = Number(form.amount || 0);
  const minimum = Number(wallet?.minimumWithdrawalAmount ?? 100);
  const available = Number(wallet?.availableBalance ?? 0);
  const validAmount = Number.isFinite(amount) && amount >= minimum && amount <= available;
  const totalRequested = useMemo(
    () => withdrawals.reduce((sum, item) => sum + Number(item.grossAmount ?? 0), 0),
    [withdrawals],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    if (!validAmount) {
      setError(`Enter an amount from ${money(minimum)} up to the available balance of ${money(available)}.`);
      setSaving(false);
      return;
    }

    try {
      await requestOwnerWithdrawal({
        amount,
        payoutMethod: form.payoutMethod,
        payoutDestination: form.payoutDestination.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm(emptyForm);
      setNotice("Withdrawal requested and the unified King Sparkon balance was updated.");
      window.dispatchEvent(new Event("king-sparkon:owner-wallet"));
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Available balance" value={loading ? "..." : money(wallet?.availableBalance)} detail={`Withdraw from ${money(minimum)}`} tone="confirm" icon={<Landmark className="h-5 w-5" />} />
        <MetricCard label="Online products" value={loading ? "..." : money(wallet?.onlineProductRevenue)} detail="Paid through King Sparkon" tone="signal" icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard label="Ticket sales" value={loading ? "..." : money(wallet?.ticketRevenue)} detail="Successful ticket subtotal" icon={<Ticket className="h-5 w-5" />} />
        <MetricCard label="Paid tips" value={loading ? "..." : money(wallet?.tipRevenue)} detail="Business worker tips" icon={<WalletCards className="h-5 w-5" />} />
        <MetricCard label="Withdrawn" value={loading ? "..." : money(wallet?.withdrawn)} detail={`${withdrawals.length} withdrawal records`} icon={<Banknote className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">{notice}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-[var(--gold)]/45 bg-white">
          <CardHeader>
            <CardTitle>Withdraw business balance</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Online products, ticket sales and paid tips increase this single balance. Cash and card-machine transactions are recorded in Product Transactions but are not withdrawable through King Sparkon.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                Amount · minimum {money(minimum)}
                <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required inputMode="decimal" placeholder="100.00" className="min-h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-lg font-black outline-none focus:border-[var(--signal)]" />
              </label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                Payout method
                <select value={form.payoutMethod} onChange={(event) => setForm((current) => ({ ...current, payoutMethod: event.target.value }))} className="min-h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)]">
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                Payout destination
                <input value={form.payoutDestination} onChange={(event) => setForm((current) => ({ ...current, payoutDestination: event.target.value }))} placeholder="Bank account or PayPal email" className="min-h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
              </label>
              <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                Notes · optional
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
              </label>
              <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--steel)]">
                Available now: <span className="money text-lg font-black text-[var(--ink)]">{money(available)}</span>
              </div>
              <Button type="submit" disabled={saving || loading || !validAmount}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "Requesting withdrawal..." : "Request withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Withdrawal history</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Unified requests plus historical product, tip and ticket withdrawals. Gross requested: {money(totalRequested)}.</p></div>
            <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading withdrawals</div> : withdrawals.length === 0 ? <p className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">No withdrawals have been requested yet.</p> : (
              <div className="grid gap-3">
                {withdrawals.map((withdrawal) => (
                  <article key={withdrawal.id} className="grid gap-4 rounded-[1.35rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><StatusPill label={withdrawal.source} tone={sourceTone(withdrawal.source)} /><StatusPill label={withdrawal.status} tone={withdrawal.status === "PAID" ? "confirm" : "signal"} /></div>
                      <p className="mt-3 font-mono text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{withdrawal.id}</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--steel)]">Requested {date(withdrawal.requestedAt)} · {withdrawal.payoutMethod ?? "Legacy payout"}</p>
                      {withdrawal.payoutDestination ? <p className="mt-1 break-all text-xs font-bold text-[var(--muted)]">{withdrawal.payoutDestination}</p> : null}
                    </div>
                    <div className="text-left md:text-right"><p className="money text-2xl font-black text-[var(--ink)]">{money(withdrawal.netAmount)}</p><p className="mt-1 text-xs font-bold text-[var(--steel)]">Gross {money(withdrawal.grossAmount)} · Fee {money(withdrawal.feeAmount)}</p></div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Unified balance activity</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Recent credits and debits that produce the balance shown in the owner header.</p></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-[1.3rem] border border-[var(--line)]">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]"><tr><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Balance</th></tr></thead>
              <tbody>{(wallet?.recentEntries ?? []).map((entry) => <tr key={entry.id} className="border-t border-[var(--line)]"><td className="px-4 py-3"><p className="font-black text-[var(--ink)]">{entry.entryType.replaceAll("_", " ")}</p><p className="mt-1 max-w-lg text-xs font-semibold text-[var(--steel)]">{entry.description || entry.providerReference || "Wallet activity"}</p></td><td className="px-4 py-3 text-xs font-bold text-[var(--steel)]">{date(entry.createdDate)}</td><td className={`px-4 py-3 text-right money font-black ${Number(entry.amount) >= 0 ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>{money(entry.amount)}</td><td className="px-4 py-3 text-right money font-black text-[var(--ink)]">{money(entry.balanceAfter)}</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
