"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { money } from "@/lib/tuck-shop/cart";
import { decideArtistWithdrawal, listPendingArtistWithdrawals } from "@/services/eventSetService";
import type { ArtistWithdrawal } from "@/types/tickets";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function OwnerArtistPayouts() {
  const [withdrawals, setWithdrawals] = useState<ArtistWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setWithdrawals(await listPendingArtistWithdrawals());
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(withdrawal: ArtistWithdrawal, decision: "approve" | "reject" | "mark-paid") {
    setActingId(withdrawal.id);
    setError(null);
    setSuccess(null);
    try {
      await decideArtistWithdrawal(withdrawal.id, decision);
      setSuccess(
        decision === "approve"
          ? `Approved — pay ${money(withdrawal.grossAmount)} to ${withdrawal.paypalEmail ?? "the artist"}, then mark paid.`
          : decision === "mark-paid"
            ? `Withdrawal #${withdrawal.id} marked paid.`
            : `Withdrawal #${withdrawal.id} rejected.`,
      );
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Artist payout requests</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Approve withdrawal requests against your business balance, pay the artist, then mark each payout paid.</p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
          {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}
          {loading ? (
            <div className="flex min-h-32 items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading payout requests</div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-5 text-center">
              <Banknote className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-xl font-black text-[var(--ink)]">No pending artist payouts.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Artist withdrawal requests for your business will appear here.</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label={withdrawal.status} tone="signal" />
                    <p className="font-mono text-xs font-black text-[var(--steel)]">Payout #{withdrawal.id}</p>
                  </div>
                  <p className="money mt-2 text-2xl font-black text-[var(--ink)]">{money(withdrawal.grossAmount)}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--steel)]">
                    PayPal {withdrawal.paypalEmail ?? "not provided"} · requested {withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleString("en-ZA") : "recently"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={actingId === withdrawal.id} onClick={() => void decide(withdrawal, "approve")}>Approve</Button>
                  <Button type="button" variant="quiet" disabled={actingId === withdrawal.id} onClick={() => void decide(withdrawal, "reject")}>Reject</Button>
                  <Button type="button" variant="quiet" disabled={actingId === withdrawal.id} onClick={() => void decide(withdrawal, "mark-paid")}>Mark paid</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
