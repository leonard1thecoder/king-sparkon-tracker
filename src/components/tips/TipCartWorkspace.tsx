"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CreditCard, Loader2, RefreshCw, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { listTips } from "@/lib/api/tips";
import { getPayFastFormFields } from "@/lib/api/tuck-shop";
import { submitPayFastForm } from "@/lib/payfast";
import { normalizeApiError } from "@/lib/api/client";
import {
  clearTipTray,
  readTipTray,
  reconcileTipTray,
  removeTipFromTray,
  TIP_TRAY_EVENT,
  type TipTrayLine,
} from "@/lib/tips/cart";
import type { Tip } from "@/lib/types/backend";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

export function TipCartWorkspace() {
  const [lines, setLines] = useState<TipTrayLine[]>([]);
  const [paidCount, setPaidCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tray = readTipTray();
      // Reconcile against the user-scoped sent-tips listing: paid tips leave the cart.
      const sent = await listTips({}).catch(() => [] as Tip[]);
      const paidIds = new Set(
        (Array.isArray(sent) ? sent : []).filter((tip) => String(tip.status ?? "").toUpperCase() === "PAID").map((tip) => tip.id),
      );
      const before = tray.length;
      const next = reconcileTipTray(paidIds);
      setPaidCount((count) => count + Math.max(0, before - next.length));
      setLines(next);
    } catch (exception) {
      setLines(readTipTray());
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onTray = () => setLines(readTipTray());
    window.addEventListener(TIP_TRAY_EVENT, onTray);
    window.addEventListener("storage", onTray);
    return () => {
      window.removeEventListener(TIP_TRAY_EVENT, onTray);
      window.removeEventListener("storage", onTray);
    };
  }, [refresh]);

  async function payLine(line: TipTrayLine) {
    setPayingId(line.tipId);
    setError(null);
    try {
      if (!line.paymentReference) throw new Error("Tip payment reference is missing.");
      const form = await getPayFastFormFields(line.paymentReference);
      submitPayFastForm(form.processUrl, form.fields);
      return;
    } catch (formError) {
      if (line.paymentUrl && typeof window !== "undefined") {
        window.location.assign(line.paymentUrl);
        return;
      }
      setError(formError instanceof Error ? formError.message : "PayFast payment could not start.");
    } finally {
      setPayingId(null);
    }
  }

  const total = lines.reduce((sum, line) => sum + Number(line.tipAmount ?? 0), 0);

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tip cart</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
              {lines.length === 0 ? "No unpaid tips in the cart." : `${lines.length} unpaid tip${lines.length === 1 ? "" : "s"} · ${money(total)} total.`}
              {paidCount > 0 ? ` ${paidCount} paid tip${paidCount === 1 ? "" : "s"} cleared.` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label={`${lines.length} PENDING`} tone={lines.length ? "signal" : "confirm"} />
            <Button type="button" variant="quiet" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

          {loading ? (
            <p className="flex items-center gap-3 p-6 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading tip cart</p>
          ) : lines.length === 0 ? (
            <div className="p-10 text-center">
              <WalletCards className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-lg font-black text-[var(--ink)]">Tip cart is empty</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Scan a worker QR, set an amount, and add the tip to the cart to pay here.</p>
              <Link href="/dashboard/user/tips" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--signal)] px-6 text-sm font-black text-white hover:bg-[var(--ink)]">
                Scan worker QR <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {lines.map((line) => (
                <div key={line.tipId} className="grid gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black text-[var(--ink)]">{line.workerLabel}</p>
                    <p className="money mt-1 text-xl font-black">{money(line.tipAmount)}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Tip #{line.tipId}{line.paymentReference ? ` · ${line.paymentReference}` : ""}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button type="button" disabled={payingId === line.tipId} onClick={() => void payLine(line)}>
                      {payingId === line.tipId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      Pay
                    </Button>
                    <Button type="button" variant="quiet" onClick={() => setLines(removeTipFromTray(line.tipId))}>
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="flex items-center gap-2 text-sm font-black text-[var(--ink)]"><ShoppingCart className="h-4 w-4 text-[var(--signal)]" /> Total {money(total)}</p>
                <Button type="button" variant="quiet" onClick={() => setLines(clearTipTray())}>Clear cart</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
