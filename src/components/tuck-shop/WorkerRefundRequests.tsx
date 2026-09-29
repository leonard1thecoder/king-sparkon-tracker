"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, RefreshCw, Ticket } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import {
  approveRefund,
  listPendingRefunds,
  rejectRefund,
} from "@/lib/api/refunds";
import { money } from "@/lib/tuck-shop/cart";
import type { RefundRequest } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function WorkerRefundRequests() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listPendingRefunds();
      setRefunds(Array.isArray(rows) ? rows : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(refund: RefundRequest) {
    setActingId(refund.id);
    setError(null);
    setSuccess(null);
    try {
      await approveRefund(refund.id);
      setSuccess(`Approved: pay ${money(refund.netAmount)} cash to ${refund.requestedByUsername ?? "the customer"}.`);
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActingId(null);
    }
  }

  async function reject(refund: RefundRequest) {
    if (!rejectReason.trim()) {
      setError("Give a rejection reason the customer can understand.");
      return;
    }
    setActingId(refund.id);
    setError(null);
    setSuccess(null);
    try {
      await rejectRefund(refund.id, rejectReason.trim());
      setRejectId(null);
      setRejectReason("");
      setSuccess(`Refund #${refund.id} rejected.`);
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
            <CardTitle>Refund requests</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Product lines (paid, uncollected) and tickets (outside the 48-hour cutoff). Confirm at the counter, then approve to record the cash payout minus the 7% service fee — or reject with a reason.</p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
          {success ? <p className="inline-flex items-center gap-2 rounded-[1.1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="h-4 w-4" /> {success}</p> : null}
          {loading ? (
            <div className="flex min-h-44 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading refund requests</div>
          ) : refunds.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <Banknote className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-xl font-black text-[var(--ink)]">No pending refunds.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Customer product and ticket refund requests for your business will appear here.</p>
            </div>
          ) : (
            refunds.map((refund) => (
              <div key={refund.id} className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label={refund.kind === "TICKET" ? "TICKET" : "PRODUCT"} tone={refund.kind === "TICKET" ? "signal" : "confirm"} />
                    <p className="font-mono text-xs font-black text-[var(--steel)]">Refund #{refund.id}</p>
                    {refund.kind === "TICKET" ? <Ticket className="h-4 w-4 text-[var(--signal)]" /> : null}
                  </div>
                  <p className="mt-2 text-lg font-black text-[var(--ink)]">{refund.productName ?? (refund.kind === "TICKET" ? "Ticket" : "Product")}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--steel)]">
                    {refund.requestedByUsername ?? "Customer"} · paid {money(refund.grossAmount)} · fee {money(refund.feeAmount)} ·
                    requested {refund.requestedAt ? new Date(refund.requestedAt).toLocaleString("en-ZA") : "recently"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="money text-2xl font-black text-[var(--ink)]">{money(refund.netAmount)} <span className="text-xs font-bold text-[var(--muted)]">cash to pay</span></p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={actingId === refund.id} onClick={() => void approve(refund)}>
                      {actingId === refund.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />} Approve cash
                    </Button>
                    <Button type="button" variant="quiet" disabled={actingId === refund.id} onClick={() => { setRejectId(rejectId === refund.id ? null : refund.id); setRejectReason(""); }}>
                      <span className="text-xs font-black">Reject</span>
                    </Button>
                  </div>
                  {rejectId === refund.id ? (
                    <div className="grid gap-2">
                      <input
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Reason shown to the customer"
                        className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
                      />
                      <Button type="button" variant="quiet" disabled={actingId === refund.id} onClick={() => void reject(refund)}>Confirm rejection</Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
