"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { normalizeApiError } from "@/lib/api/client";
import { capturePayPalOrder, getPayPalOrderStatus } from "@/lib/api/payments";
import { formatMoney } from "@/lib/localization";
import { clearTuckShopCart } from "@/lib/tuck-shop/cart";
import { clearTipTray } from "@/lib/tips/cart";

type ResultState =
  | { kind: "missing" }
  | { kind: "checking"; orderId: string }
  | { kind: "complete"; orderId: string; amountUsd: number }
  | { kind: "failed"; message: string };

export function PayPalReturnClient() {
  const searchParams = useSearchParams();
  const orderId = useMemo(() => searchParams.get("token"), [searchParams]);
  const [state, setState] = useState<ResultState>(() =>
    !orderId ? { kind: "missing" } : { kind: "checking", orderId },
  );

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    async function verify() {
      try {
        const captured = await capturePayPalOrder(orderId as string);
        if (!active) return;
        if (captured.fulfilled) {
          clearTuckShopCart();
          window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-cart"));
          clearTipTray();
          setState({ kind: "complete", orderId: captured.orderId, amountUsd: captured.amountUsd });
          return;
        }
        const status = await getPayPalOrderStatus(orderId as string);
        if (!active) return;
        if (status.fulfilled) {
          clearTuckShopCart();
          window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-cart"));
          clearTipTray();
          setState({ kind: "complete", orderId: status.orderId, amountUsd: status.amountUsd });
        } else {
          setState({ kind: "failed", message: `PayPal payment ${status.status.toLowerCase()} — no amount was captured. The cart is kept so you can try again.` });
        }
      } catch (error) {
        if (!active) return;
        setState({ kind: "failed", message: normalizeApiError(error).message });
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="PayPal payment result" description="Confirm a PayPal shared-cart payment in USD." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        {state.kind === "missing" ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <AlertTriangle className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">No PayPal order found</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">Return here through a PayPal checkout so the order can be captured.</p>
            <Link href="/dashboard/user/shop/cart" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to cart</Link>
          </div>
        ) : null}

        {state.kind === "checking" ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-[2rem] border border-[var(--line)] bg-white text-sm font-black text-[var(--steel)]">
            <Loader2 className="h-5 w-5 animate-spin" /> Capturing PayPal payment and fulfilling your cart...
          </div>
        ) : null}

        {state.kind === "complete" ? (
          <div className="rounded-[2rem] border border-[var(--confirm)]/30 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--confirm)]" />
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Payment complete</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">
              {formatMoney(state.amountUsd, "USD")} captured on PayPal. Your cart is fulfilled and cleared.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/user/carts" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">View my carts</Link>
              <Link href="/dashboard/user/shop" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)]">Continue shopping</Link>
            </div>
          </div>
        ) : null}

        {state.kind === "failed" ? (
          <div className="rounded-[2rem] border border-[var(--danger)]/30 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <XCircle className="mx-auto h-10 w-10 text-[var(--danger)]" />
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Payment not completed</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">{state.message}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to cart</Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center">
          <Link href="/dashboard/user/shop/cart">
            <Button variant="quiet">Back to cart</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
