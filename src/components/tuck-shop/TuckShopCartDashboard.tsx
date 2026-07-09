"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { createTuckShopPurchase } from "@/lib/api/tuck-shop";
import type { TuckShopPurchase } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  cartLineCount,
  cartTotal,
  clearTuckShopCart,
  money,
  productImage,
  productPrice,
  readTuckShopCart,
  removeTuckShopCartLine,
  type TuckShopCartLine,
  updateTuckShopCartQuantity,
} from "@/lib/tuck-shop/cart";

export function TuckShopCartDashboard() {
  const [cart, setCart] = useState<TuckShopCartLine[]>([]);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentContact, setPaymentContact] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCart(readTuckShopCart());

    function refreshCart() {
      setCart(readTuckShopCart());
    }

    window.addEventListener("storage", refreshCart);
    window.addEventListener("king-sparkon:tuck-shop-cart", refreshCart);

    return () => {
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("king-sparkon:tuck-shop-cart", refreshCart);
    };
  }, []);

  function updateQuantity(productId: number, quantity: number) {
    setCart(updateTuckShopCartQuantity(productId, quantity));
  }

  function removeFromCart(productId: number) {
    setCart(removeTuckShopCartLine(productId));
  }

  async function checkout() {
    if (cart.length === 0) {
      setError("Add at least one tuck shop product before checkout.");
      return;
    }

    setSaving(true);
    setError(null);
    setPurchase(null);

    try {
      const result = await createTuckShopPurchase({
        paymentEmail: paymentEmail || undefined,
        paymentContact: paymentContact || undefined,
        workerId: workerId ? Number(workerId) : undefined,
        tipAmount: tipAmount ? Number(tipAmount) : undefined,
        tipCallbackUrl: typeof window === "undefined" ? undefined : window.location.href,
        items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
      });
      setPurchase(result);
      clearTuckShopCart();
      setCart([]);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <SectionHeader
        eyebrow="Tuck Shop Cart"
        title="Review products before checkout."
        description="Product purchases now live in their own user dashboard cart. Worker tips remain optional and separate from product revenue."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cart</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{cartLineCount(cart)} item{cartLineCount(cart) === 1 ? "" : "s"} ready for checkout.</p>
          </div>
          <Link href="/dashboard/user/shop" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)]">
            Continue shopping <ShoppingBag className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-3">
            {cart.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
                <ShoppingCart className="mx-auto h-11 w-11 text-[var(--signal)]" />
                <p className="mt-4 text-xl font-black text-[var(--ink)]">Cart is empty.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Go to Buy Products and add products from any business catalogue.</p>
              </div>
            ) : (
              cart.map((line) => (
                <div key={line.product.id} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center">
                  <img src={productImage(line.product)} alt={line.product.name} className="h-20 w-20 rounded-[1.15rem] object-cover" />
                  <div>
                    <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{line.product.businessName ?? `Business #${line.product.businessId ?? "-"}`}</p>
                    <p className="mt-1 font-black text-[var(--ink)]">{line.product.name}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{money(productPrice(line.product))} each · max {line.product.stockQuantity}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={line.product.stockQuantity}
                    value={line.quantity}
                    onChange={(event) => updateQuantity(line.product.id, Number(event.target.value))}
                    className="min-h-11 w-24 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)]"
                  />
                  <button type="button" onClick={() => removeFromCart(line.product.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--danger)] hover:border-[var(--danger)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
            {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
            <input value={paymentEmail} onChange={(event) => setPaymentEmail(event.target.value)} placeholder="Payment email (optional)" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={paymentContact} onChange={(event) => setPaymentContact(event.target.value)} placeholder="WhatsApp / contact (optional)" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={workerId} onChange={(event) => setWorkerId(event.target.value)} placeholder="Worker ID for tip (optional)" inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="Tip amount e.g. 15.00" inputMode="decimal" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <div className="rounded-[var(--radius-lg)] bg-[var(--ink)] p-4 text-white">
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">Product total</p>
              <p className="money mt-1 text-3xl font-black">{money(cartTotal(cart))}</p>
              <p className="mt-2 text-xs leading-5 text-white/62">Tips stay as separate worker tip records.</p>
            </div>
            <Button onClick={checkout} disabled={saving || cart.length === 0}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Create payment link</Button>
          </div>
        </CardContent>
      </Card>

      {purchase ? (
        <Card className="border-[var(--confirm)]/40 bg-white">
          <CardHeader>
            <CardTitle>Payment link created</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Transaction #{purchase.transactionId} is {purchase.paymentStatus ?? "PENDING"}. Send the payment URL or scan the QR code.</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="money text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
              <p className="mt-2 break-all text-sm font-semibold text-[var(--steel)]">{purchase.paymentReference}</p>
              {purchase.tip?.paymentUrl ? <p className="mt-2 text-xs font-bold text-[var(--signal)]">Separate worker tip link was also created.</p> : null}
            </div>
            {purchase.paymentUrl ? (
              <a href={purchase.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]">
                Open Stripe link <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
