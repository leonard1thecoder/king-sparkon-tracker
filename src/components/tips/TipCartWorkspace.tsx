"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CreditCard, Loader2, RefreshCw, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { createPayFastCartPayment } from "@/lib/api/tuck-shop";
import { submitPayFastForm } from "@/lib/payfast";
import { normalizeApiError } from "@/lib/api/client";
import {
  clearTipTray,
  readTipTray,
  removeTipFromTray,
  TIP_TRAY_EVENT,
  type TipTrayLine,
} from "@/lib/tips/cart";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

type CheckoutUser = { name: string; emailAddress: string };

async function loadCheckoutUser(): Promise<CheckoutUser> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) {
    return { name: "Registered user", emailAddress: "registered-user@king-sparkon.local" };
  }
  const data = (await response.json()) as Partial<CheckoutUser> & { email?: string; username?: string };
  return {
    name: data.name || data.username || "Registered user",
    emailAddress: data.emailAddress || data.email || "registered-user@king-sparkon.local",
  };
}

function checkoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function TipCartWorkspace() {
  const [lines, setLines] = useState<TipTrayLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [paymentStage, setPaymentStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLines(readTipTray());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(TIP_TRAY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TIP_TRAY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  async function checkout() {
    if (lines.length === 0) {
      setError("Scan a worker QR and add at least one tip before checkout.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      setPaymentStage("Securing your tip total...");
      const user = await loadCheckoutUser();
      const payment = await createPayFastCartPayment({
        idempotencyKey: checkoutIdempotencyKey(),
        buyerName: user.name,
        buyerEmail: user.emailAddress,
        products: [],
        tickets: [],
        tips: lines.map((line) => ({ workerId: line.workerId, tipAmount: Number(line.tipAmount) })),
      });

      setPaymentStage("Redirecting to PayFast for secure payment...");
      submitPayFastForm(payment.processUrl, payment.fields);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setPaymentStage(null);
    } finally {
      setSaving(false);
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
              {lines.length === 0
                ? "No tips in the cart."
                : `${lines.length} tip${lines.length === 1 ? "" : "s"} · ${money(total)} total — one shared PayFast payout, like products, tickets and UIF carts.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label={`${lines.length} PENDING`} tone={lines.length ? "signal" : "confirm"} />
            <Button type="button" variant="quiet" onClick={refresh}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
          {paymentStage ? <p className="rounded-[1rem] border border-[var(--line-strong)] bg-[var(--signal-soft)] p-3 text-sm font-bold text-[var(--signal-strong)]">{paymentStage}</p> : null}

          {lines.length === 0 ? (
            <div className="p-10 text-center">
              <WalletCards className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-lg font-black text-[var(--ink)]">Tip cart is empty</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Scan a worker QR, set an amount, and submit it here to pay.</p>
              <Link href="/dashboard/user/tips" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--signal)] px-6 text-sm font-black text-white hover:bg-[var(--ink)]">
                Scan worker QR <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {lines.map((line, index) => (
                <div key={`${line.workerId}-${line.tipAmount}-${index}`} className="grid gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black text-[var(--ink)]">{line.workerLabel}</p>
                    <p className="money mt-1 text-xl font-black">{money(line.tipAmount)}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Worker #{line.workerId}</p>
                  </div>
                  <Button type="button" variant="quiet" onClick={() => setLines(removeTipFromTray(line.workerId, Number(line.tipAmount)))}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="flex items-center gap-2 text-sm font-black text-[var(--ink)]"><ShoppingCart className="h-4 w-4 text-[var(--signal)]" /> Total {money(total)}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="quiet" onClick={() => setLines(clearTipTray())}>Clear cart</Button>
                  <Button type="button" disabled={saving} onClick={() => void checkout()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    {saving ? "Securing payout..." : `Pay ${money(total)} via PayFast`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
