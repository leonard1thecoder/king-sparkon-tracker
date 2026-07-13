"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Banknote, Loader2, RefreshCw, UsersRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import { getOwnerWallet, type OwnerWalletSummary } from "@/lib/api/owner-finance";
import { listOwnerTips } from "@/lib/api/tips";
import type { Tip } from "@/lib/types/backend";

type OwnerTip = Tip & {
  systemFee?: number;
  created?: string | null;
  updated?: string | null;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(value ?? 0));
}

function tipStatus(tip: OwnerTip) {
  return String(tip.status ?? "PENDING").toUpperCase();
}

function isPaid(tip: OwnerTip) {
  const status = tipStatus(tip);
  return status === "PAID" || status === "SUCCESS";
}

function statusTone(status: string) {
  if (status === "PAID" || status === "SUCCESS") return "confirm" as const;
  if (status === "FAILED" || status === "CANCELLED" || status === "CANCELED") return "danger" as const;
  return "signal" as const;
}

export function OwnerTipsWorkspace() {
  const [tips, setTips] = useState<OwnerTip[]>([]);
  const [wallet, setWallet] = useState<OwnerWalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextTips, nextWallet] = await Promise.all([listOwnerTips(), getOwnerWallet()]);
      setTips(Array.isArray(nextTips) ? nextTips : []);
      setWallet(nextWallet);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const paidTips = useMemo(() => tips.filter(isPaid), [tips]);
  const paidValue = useMemo(
    () => paidTips.reduce((sum, tip) => sum + Number(tip.netAmount ?? tip.tipAmount ?? 0), 0),
    [paidTips],
  );
  const pendingCount = tips.length - paidTips.length;
  const workerCount = useMemo(() => new Set(tips.map((tip) => tip.workerId)).size, [tips]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Business tips"
          value={loading ? "..." : String(tips.length)}
          detail={`${workerCount} workers represented`}
          icon={<WalletCards className="h-5 w-5" />}
        />
        <MetricCard
          label="Paid tip value"
          value={loading ? "..." : money(paidValue)}
          detail={`${paidTips.length} successful tips`}
          tone="confirm"
          icon={<Banknote className="h-5 w-5" />}
        />
        <MetricCard
          label="Pending tips"
          value={loading ? "..." : String(pendingCount)}
          detail="Awaiting payment confirmation"
          tone="signal"
          icon={<UsersRound className="h-5 w-5" />}
        />
        <MetricCard
          label="Withdrawable balance"
          value={loading ? "..." : money(wallet?.availableBalance)}
          detail={wallet?.payoutConfigured ? "PayPal payout ready" : "PayPal setup required"}
          tone={wallet?.payoutConfigured ? "confirm" : "signal"}
          icon={<Banknote className="h-5 w-5" />}
        />
      </div>

      {error ? (
        <div className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/dashboard/owner/withdrawals"
          className="group rounded-[var(--radius-xl)] border border-[var(--gold)]/50 bg-[var(--gold)]/10 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              <Banknote className="h-6 w-6" />
            </div>
            <ArrowRight className="mt-2 h-5 w-5 text-[var(--signal)] transition group-hover:translate-x-1" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">Withdraw through PayPal</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Send the unified product, ticket and paid-tip balance to the owner&apos;s PayPal email.
          </p>
        </Link>

        <Link
          href="/dashboard/owner/tips/paypal/onboarding"
          className="group rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              <WalletCards className="h-6 w-6" />
            </div>
            <ArrowRight className="mt-2 h-5 w-5 text-[var(--signal)] transition group-hover:translate-x-1" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">PayPal payout setup</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Review the PayPal destination and payout readiness before moving business funds.
          </p>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Worker tip activity</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
              This table is loaded from the authenticated owner&apos;s business only. It no longer calls the global status-filtered tips route.
            </p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading owner tips
            </div>
          ) : tips.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">
              No worker tips have been recorded for this business yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[1.4rem] border border-[var(--line)]">
              <table className="min-w-[820px] border-collapse text-left text-sm lg:min-w-full">
                <thead className="bg-[var(--surface)] text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Tip</th>
                    <th className="px-4 py-3">Worker</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment reference</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tips.map((tip) => {
                    const status = tipStatus(tip);
                    return (
                      <tr key={tip.id} className="border-t border-[var(--line)] hover:bg-[var(--surface)]">
                        <td className="px-4 py-4 font-mono text-xs font-black text-[var(--ink)]">#{tip.id}</td>
                        <td className="px-4 py-4 font-black text-[var(--ink)]">Worker #{tip.workerId}</td>
                        <td className="px-4 py-4"><StatusPill label={status} tone={statusTone(status)} /></td>
                        <td className="max-w-56 break-all px-4 py-4 font-mono text-xs font-bold text-[var(--steel)]">
                          {tip.paymentReference ?? "Awaiting provider reference"}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-[var(--steel)]">
                          {tip.created ? new Date(tip.created).toLocaleString("en-ZA") : "Pending timestamp"}
                        </td>
                        <td className="px-4 py-4 text-right text-lg font-black text-[var(--ink)]">
                          {money(tip.netAmount ?? tip.tipAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
