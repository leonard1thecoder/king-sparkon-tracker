"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShoppingCart, XCircle } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PaymentReceiptCard } from "@/components/tuck-shop/PaymentReceiptCard";
import { Button } from "@/components/ui/Button";
import { normalizeApiError } from "@/lib/api/client";
import { getPayFastCartPaymentStatus } from "@/lib/api/tuck-shop";
import { clearTuckShopCart, saveTuckShopPurchaseHistory } from "@/lib/tuck-shop/cart";
import { clearTipTray } from "@/lib/tips/cart";
import type { PayFastCartPaymentStatus } from "@/lib/types/backend";
import {
  PayFastPendingTimeoutError,
  parsePayFastReturn,
  pollPayFastStatus,
} from "@/lib/payfast";

type ResultState =
  | { kind: "missing" }
  | { kind: "cancelled"; merchantPaymentId: string | null }
  | { kind: "checking"; merchantPaymentId: string }
  | { kind: "complete"; receipt: PayFastCartPaymentStatus }
  | { kind: "failed"; message: string }
  | { kind: "pending"; merchantPaymentId: string; message: string };

export function PaymentResultClient() {
  const searchParams = useSearchParams();
  const { merchantPaymentId, cancelled } = useMemo(
    () => parsePayFastReturn(searchParams.toString()),
    [searchParams],
  );
  const [state, setState] = useState<ResultState>(() =>
    !merchantPaymentId ? { kind: "missing" } : cancelled ? { kind: "cancelled", merchantPaymentId } : { kind: "checking", merchantPaymentId },
  );

  useEffect(() => {
    if (!merchantPaymentId || cancelled) return;
    let active = true;

    async function verify() {
      try {
        const receipt = await pollPayFastStatus(
          async (id) => {
            const status = await getPayFastCartPaymentStatus(id);
            return {
              merchantPaymentId: status.merchantPaymentId,
              paymentStatus: status.paymentStatus,
              fulfilled: status.fulfilled,
            };
          },
          merchantPaymentId as string,
        );
        if (!active) return;
        const full = await getPayFastCartPaymentStatus(merchantPaymentId as string);
        full.productPurchases.forEach(saveTuckShopPurchaseHistory);
        clearTuckShopCart();
        window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-cart"));
        // Tips ride the same shared cart payout — a fulfilled cart means
        // fulfilled tips, so the tip cart clears here too.
        clearTipTray();
        setState({ kind: "complete", receipt: full });
      } catch (error) {
        if (!active) return;
        if (error instanceof PayFastPendingTimeoutError) {
          setState({ kind: "pending", merchantPaymentId: merchantPaymentId as string, message: error.message });
        } else {
          setState({ kind: "failed", message: normalizeApiError(error).message });
        }
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [merchantPaymentId, cancelled]);

  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="Payment result"
        description="The backend confirms every PayFast payment before anything is cleared or fulfilled."
      />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="mx-auto grid max-w-3xl gap-5">
          {state.kind === "missing" ? (
            <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <AlertTriangle className="mx-auto h-10 w-10 text-[var(--warning)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">No payment reference found</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Return here from PayFast after checkout to verify the payment.</p>
              <Link href="/dashboard/user/shop/cart" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white"><ShoppingCart className="h-4 w-4" /> Back to cart</Link>
            </div>
          ) : null}

          {state.kind === "cancelled" ? (
            <div className="rounded-[2rem] border border-[var(--gold)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <XCircle className="mx-auto h-10 w-10 text-[var(--gold)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">Payment cancelled</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">The PayFast payment was cancelled. Nothing was charged and the cart was kept.</p>
              <Link href="/dashboard/user/shop/cart" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white"><ShoppingCart className="h-4 w-4" /> Back to cart</Link>
            </div>
          ) : null}

          {state.kind === "checking" ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--signal)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">Confirming payment...</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">Asking the backend for the verified PayFast result. Do not close this page.</p>
            </div>
          ) : null}

          {state.kind === "complete" ? <PaymentReceiptCard receipt={state.receipt} /> : null}

          {state.kind === "failed" ? (
            <div className="rounded-[2rem] border border-[var(--danger)]/30 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <XCircle className="mx-auto h-10 w-10 text-[var(--danger)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">Payment did not complete</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{state.message} The cart was kept.</p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Button type="button" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" /> Check again</Button>
                <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)]">Back to cart</Link>
              </div>
            </div>
          ) : null}

          {state.kind === "pending" ? (
            <div className="rounded-[2rem] border border-[var(--gold)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--gold)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">Payment is still being confirmed</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{state.message}</p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Button type="button" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" /> Check again</Button>
                <Link href="/dashboard/user/carts" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)]">View my carts</Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
