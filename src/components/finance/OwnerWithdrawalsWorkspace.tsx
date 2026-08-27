"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  HelpCircle,
  Info,
  Landmark,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  WalletCards,
  Zap,
} from "lucide-react";
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
  payoutDestination: "",
  notes: "",
};

function money(value?: number | null, currency = "ZAR") {
  const num = Number(value ?? 0);
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  }
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(num);
}

function date(value?: string | null) {
  return value ? new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "Not processed";
}

function sourceTone(source: string) {
  if (source === "PRODUCT") return "signal" as const;
  if (source === "TIP") return "confirm" as const;
  if (source === "TICKET") return "neutral" as const;
  return "confirm" as const;
}

function payoutTone(status?: string | null) {
  const normalized = String(status ?? "PENDING").toUpperCase();
  if (normalized === "PAID" || normalized === "SUCCESS" || normalized === "SUCCESSFUL") return "confirm" as const;
  if (normalized === "FAILED" || normalized === "DENIED" || normalized.includes("CANCEL") || normalized.includes("REFUND")) return "warning" as const;
  return "signal" as const;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
  const withdrawalFeePercent = Number(wallet?.withdrawalFeePercent ?? 7.35);
  const withdrawalFee = Number.isFinite(amount) ? amount * (withdrawalFeePercent / 100) : 0;
  const netPayoutZar = Math.max(amount - withdrawalFee, 0);
  const zarPerPayoutUnit = Number(wallet?.zarPerPayoutUnit ?? 0);
  const estimatedPayoutUsd = zarPerPayoutUnit > 0 ? netPayoutZar / zarPerPayoutUnit : 0;
  const payoutConfigured = Boolean(wallet?.payoutConfigured ?? true);
  const validAmount = Number.isFinite(amount) && amount >= minimum && amount <= available;
  const validForm = validAmount && validEmail(form.payoutDestination) && payoutConfigured;

  const totalRequested = useMemo(
    () => withdrawals.reduce((sum, item) => sum + Number(item.grossAmount ?? 0), 0),
    [withdrawals],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    if (!payoutConfigured) {
      setError("PayPal Instant Payouts are not configured on the backend yet.");
      setSaving(false);
      return;
    }
    if (!validAmount) {
      setError(`Enter an amount from ${money(minimum)} up to your available balance of ${money(available)}.`);
      setSaving(false);
      return;
    }
    if (!validEmail(form.payoutDestination)) {
      setError("Please enter a valid PayPal account email address.");
      setSaving(false);
      return;
    }

    try {
      const withdrawal = await requestOwnerWithdrawal({
        amount,
        payoutMethod: "PAYPAL",
        payoutDestination: form.payoutDestination.trim(),
        notes: form.notes.trim() || null,
      });
      setForm(emptyForm);
      setNotice(
        withdrawal.providerBatchId
          ? `Instant PayPal payout initiated! Batch ID #${withdrawal.providerBatchId}. ${money(withdrawal.feeAmount)} was deducted as the ${withdrawalFeePercent.toFixed(2)}% fee.`
          : "Your PayPal instant payout request has been successfully submitted and is processing.",
      );
      window.dispatchEvent(new Event("king-sparkon:owner-wallet"));
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  function handleQuickAmount(pct: number) {
    if (!available) return;
    const calc = Math.floor((available * pct) / 10) * 10;
    if (calc >= minimum) {
      setForm((prev) => ({ ...prev, amount: calc.toString() }));
    } else {
      setForm((prev) => ({ ...prev, amount: minimum.toString() }));
    }
  }

  return (
    <section className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Available Balance"
          value={loading ? "..." : money(wallet?.availableBalance)}
          detail={`Min withdrawal: ${money(minimum)}`}
          tone="confirm"
          icon={<Landmark className="h-5 w-5" />}
        />
        <MetricCard
          label="Platform Fee"
          value={loading ? "..." : `${withdrawalFeePercent.toFixed(2)}%`}
          detail="Single fee on cashout"
          tone="signal"
          icon={<Banknote className="h-5 w-5" />}
        />
        <MetricCard
          label="Product Revenue"
          value={loading ? "..." : money(wallet?.onlineProductRevenue)}
          detail="Online sales"
          tone="signal"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <MetricCard
          label="Ticket Revenue"
          value={loading ? "..." : money(wallet?.ticketRevenue)}
          detail="Event tickets"
          icon={<Ticket className="h-5 w-5" />}
        />
        <MetricCard
          label="Tip Revenue"
          value={loading ? "..." : money(wallet?.tipRevenue)}
          detail="Direct tips"
          icon={<WalletCards className="h-5 w-5" />}
        />
        <MetricCard
          label="Total Withdrawn"
          value={loading ? "..." : money(wallet?.withdrawn)}
          detail={`${wallet?.pendingWithdrawalCount ?? 0} payout batches active`}
          icon={<Zap className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      {notice ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Instant PayPal Payout Form */}
        <Card className="relative overflow-hidden border-[var(--line-strong)] bg-white shadow-[var(--shadow-soft)]">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Zap className="h-48 w-48 text-[var(--signal)]" />
          </div>

          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
                  <Zap className="h-6 w-6 fill-sky-500 text-sky-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">PayPal Instant Payout</CardTitle>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-sky-700">
                      <Zap className="h-3 w-3 fill-sky-600 text-sky-600" /> Instant API
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[var(--steel)]">
                    Fast automated transfer directly into your PayPal account.
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="grid gap-5">
              {!loading && !payoutConfigured ? (
                <div className="rounded-[var(--radius-lg)] border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-xs font-bold leading-6 text-[var(--ink)]">
                  PayPal Payout API configuration is currently offline or incomplete.
                </div>
              ) : null}

              {/* Amount input */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                    Withdrawal Amount (ZAR)
                  </label>
                  <span className="text-xs font-bold text-[var(--muted)]">
                    Min: {money(minimum)} · Max: {money(available)}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-lg font-black text-[var(--muted)]">R</span>
                  <input
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    required
                    inputMode="decimal"
                    placeholder="0.00"
                    className="min-h-14 w-full rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] pl-10 pr-4 text-2xl font-black text-[var(--ink)] outline-none transition focus:border-[var(--signal)] focus:bg-white"
                  />
                </div>

                {/* Quick percentages */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(0.25)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-extrabold text-[var(--ink)] hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(0.5)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-extrabold text-[var(--ink)] hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(0.75)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-extrabold text-[var(--ink)] hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(1.0)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-extrabold text-[var(--ink)] hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]"
                  >
                    Max (100%)
                  </button>
                </div>
              </div>

              {/* PayPal Email */}
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                  PayPal Account Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={form.payoutDestination}
                    onChange={(event) => setForm((current) => ({ ...current, payoutDestination: event.target.value }))}
                    required
                    autoComplete="email"
                    placeholder="your-paypal-email@example.com"
                    className="min-h-12 w-full rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink)] outline-none transition focus:border-[var(--signal)] focus:bg-white"
                  />
                </div>
                <p className="text-[0.7rem] font-semibold text-[var(--muted)]">
                  Ensure this email is registered with PayPal to receive instant funds.
                </p>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                  Withdrawal Note (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={2}
                  placeholder="Reference or note for accounting"
                  className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--ink)] outline-none transition focus:border-[var(--signal)] focus:bg-white"
                />
              </div>

              {/* Calculation Preview */}
              <div className="grid gap-3 rounded-[var(--radius-2xl)] border border-[var(--line)] bg-sky-50/40 p-4 text-xs font-bold text-[var(--steel)]">
                <div className="flex justify-between border-b border-sky-100 pb-2">
                  <span>Gross Balance Debit</span>
                  <span className="money font-black text-[var(--ink)]">{money(amount)}</span>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-2">
                  <span>Platform Fee ({withdrawalFeePercent.toFixed(2)}%)</span>
                  <span className="money font-black text-[var(--danger)]">− {money(withdrawalFee)}</span>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-2">
                  <span>Net Payout (ZAR)</span>
                  <span className="money font-black text-[var(--confirm)]">{money(netPayoutZar)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="flex items-center gap-1">
                    Est. PayPal Payout (USD)
                    <Info className="h-3.5 w-3.5 text-[var(--muted)]" />
                  </span>
                  <span className="money text-base font-black text-[var(--ink)]">
                    {zarPerPayoutUnit > 0 ? money(estimatedPayoutUsd, "USD") : "Rate unavailable"}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving || loading || !validForm}
                className="h-13 w-full text-base shadow-[var(--shadow-soft)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Executing Instant Payout...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-white text-white" />
                    Request Instant PayPal Payout
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[0.7rem] font-semibold text-[var(--muted)]">
                <ShieldCheck className="h-4 w-4 text-[var(--confirm)]" />
                <span>Protected by PayPal Developer Instant Payout API & SSL</span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PayPal API Info & How it works */}
        <div className="grid gap-6">
          <Card className="border-[var(--line)] bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-6 grid gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-400">
                  <Zap className="h-5 w-5 fill-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Instant Payout Integration</h3>
                  <p className="text-xs text-slate-300">Powered by PayPal REST Payouts API</p>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-300">
                King Sparkon uses PayPal&apos;s automated Payout API to process withdrawal requests instantly. Funds are dispatched directly from the platform wallet straight to your linked PayPal email address.
              </p>

              <div className="grid gap-3 pt-2">
                <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                  <Clock className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white">Instant Processing</p>
                    <p className="text-[0.7rem] text-slate-300">
                      Approved requests process in seconds without manual intervention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                  <DollarSign className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white">Auto FX Conversion</p>
                    <p className="text-[0.7rem] text-slate-300">
                      ZAR balance converts transparently to payout currency USD based on live backend rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white">Idempotent Security</p>
                    <p className="text-[0.7rem] text-slate-300">
                      Idempotency keys prevent double chargebacks and duplicate payout submissions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats / summary */}
          <Card className="border-[var(--line)] bg-white">
            <CardHeader>
              <CardTitle className="text-base">Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-xs">
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="font-semibold text-[var(--steel)]">Total Cashouts</span>
                <span className="font-black text-[var(--ink)]">{withdrawals.length} payouts</span>
              </div>
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="font-semibold text-[var(--steel)]">Total Gross Requested</span>
                <span className="money font-black text-[var(--ink)]">{money(totalRequested)}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="font-semibold text-[var(--steel)]">Configured Payout Method</span>
                <span className="font-black text-[var(--signal)]">PayPal Instant Payouts</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[var(--steel)]">Base Exchange Rate</span>
                <span className="money font-black text-[var(--ink)]">
                  {zarPerPayoutUnit > 0 ? `${money(zarPerPayoutUnit)} / USD` : "Not set"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payout History Table & Statuses */}
      <Card className="border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>PayPal Payout History</CardTitle>
            <p className="mt-1 text-xs font-semibold text-[var(--steel)]">
              Complete log of all instant PayPal payouts and unified balance withdrawals.
            </p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Payouts
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading payout records...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">
              No PayPal payouts have been requested yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {withdrawals.map((withdrawal) => (
                <article
                  key={withdrawal.id}
                  className="grid gap-4 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-4 shadow-sm transition hover:border-[var(--line-strong)] md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="grid gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={withdrawal.source} tone={sourceTone(withdrawal.source)} />
                      <StatusPill
                        label={withdrawal.providerStatus ?? withdrawal.status}
                        tone={payoutTone(withdrawal.providerStatus ?? withdrawal.status)}
                      />
                    </div>
                    <p className="font-mono text-xs font-black text-[var(--ink)]">
                      Batch ID: {withdrawal.providerBatchId ?? withdrawal.id}
                    </p>
                    <p className="text-xs font-semibold text-[var(--steel)]">
                      Requested {date(withdrawal.requestedAt)} · {withdrawal.provider ?? withdrawal.payoutMethod ?? "PayPal"}
                    </p>
                    {withdrawal.payoutDestination && (
                      <p className="text-xs font-bold text-[var(--signal)]">
                        Sent to: {withdrawal.payoutDestination}
                      </p>
                    )}
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-black text-[var(--ink)]">
                      {withdrawal.payoutAmount != null && withdrawal.payoutCurrency
                        ? money(withdrawal.payoutAmount, withdrawal.payoutCurrency)
                        : money(withdrawal.netAmount, withdrawal.currency || "ZAR")}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-[var(--steel)]">
                      Gross: {money(withdrawal.grossAmount)} · Fee: {money(withdrawal.feeAmount)} · Net: {money(withdrawal.netAmount)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Balance Activity */}
      <Card className="border-[var(--line)] bg-white">
        <CardHeader>
          <CardTitle>Unified Balance Ledger</CardTitle>
          <p className="mt-1 text-xs font-semibold text-[var(--steel)]">
            Detailed ledger entries including sales credits, PayPal withdrawal debits, and fee reversals.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--line)]">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {(wallet?.recentEntries ?? []).map((entry) => (
                  <tr key={entry.id} className="border-t border-[var(--line)] hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-black text-[var(--ink)]">{entry.entryType.replaceAll("_", " ")}</p>
                      <p className="mt-0.5 max-w-lg text-[0.7rem] font-semibold text-[var(--steel)]">
                        {entry.description || entry.providerReference || "Wallet ledger activity"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--steel)]">{date(entry.createdDate)}</td>
                    <td
                      className={`px-4 py-3 text-right font-black ${
                        Number(entry.amount) >= 0 ? "text-[var(--confirm)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {money(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[var(--ink)]">
                      {money(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
