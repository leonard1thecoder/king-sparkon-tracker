"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingCart, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { getUifResetCartStatus } from "@/lib/api/uif";

type StoredCart = {
  orderId: number;
  paymentIntentId: string;
  clientSecret?: string;
  amount: number | string;
  currency: string;
  status: string;
  targetIdNumber?: string;
};

export function UifCartWorkspace() {
  const [cart, setCart] = useState<StoredCart | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("uif-reset-cart");
      if (raw) setCart(JSON.parse(raw) as StoredCart);
    } catch {}
    // also check query params
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paymentIntentId");
    const oid = params.get("uifOrderId");
    if (pid && !cart) {
      // try to load from storage or set minimal
      const stored = window.localStorage.getItem("uif-reset-cart");
      if (!stored) {
        setCart({ orderId: Number(oid) || 0, paymentIntentId: pid, amount: "14.28", currency: "ZAR", status: "PENDING_PAYMENT" });
      }
    }
  }, []);

  async function refreshStatus() {
    if (!cart?.paymentIntentId) return;
    setLoading(true);
    try {
      const fresh = await getUifResetCartStatus(cart.paymentIntentId);
      setStatus(`Status: ${fresh.status} — ${fresh.message || ""}`);
      // update stored
      const updated = { ...cart, status: fresh.status, amount: fresh.amount, currency: fresh.currency };
      setCart(updated);
      window.localStorage.setItem("uif-reset-cart", JSON.stringify(updated));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }

  if (!cart) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
        <ShoppingCart className="mx-auto h-8 w-8 text-[var(--muted)]" />
        <p className="mt-3 text-sm font-black">No UIF cart found</p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Submit a password update from UIF → Update Password to create a R14.28 cart order.</p>
        <Link href="/dashboard/user/uif/password" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:bg-[var(--signal-strong)]">Go to Update Password</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">UIF Password Reset Order</p>
        <p className="mt-2 text-sm"><span className="font-bold">Order ID:</span> <span className="font-mono">{cart.orderId}</span></p>
        <p className="text-sm"><span className="font-bold">Target ID:</span> <span className="font-mono">{cart.targetIdNumber || "-"}</span></p>
        <p className="text-sm"><span className="font-bold">PaymentIntent:</span> <span className="font-mono text-xs break-all">{cart.paymentIntentId}</span></p>
        <p className="mt-2 text-lg font-black">R{Number(cart.amount).toFixed(2)} {cart.currency}</p>
        <p className="text-xs font-bold text-[var(--steel)]">Status: {cart.status}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={refreshStatus} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-black hover:border-[var(--signal)] disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Refresh Status
        </button>
        <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--signal-strong)]">
          <ShoppingCart className="h-4 w-4" /> View Shop Cart
        </Link>
      </div>

      {status ? <div className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm font-semibold leading-6 text-[var(--ink)]">{status}</div> : null}

      <div className="rounded-xl border border-[var(--signal)]/30 bg-[var(--signal-soft)] p-4">
        <p className="flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-4 w-4 text-[var(--signal)]" /> Pay R14.28 to trigger UIF update</p>
        <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Pay via Stripe (test mode). Webhook will POST to https://uifonline.labour.gov.za/uifOnline/resetNewPassword with your new password. Check status after payment.</p>
        {cart.clientSecret ? <p className="mt-2 font-mono text-xs break-all text-[var(--muted)]">clientSecret: {cart.clientSecret.slice(0, 24)}... (use Stripe Elements to confirm)</p> : null}
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <AlertTriangle className="h-3.5 w-3.5" /> Data source: UIF cart via POST /api/uif/reset-password (14.28 ZAR)
      </div>
    </div>
  );
}
