"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Trash2,
} from "lucide-react";
import { createEmbeddedCartPaymentIntent, getEmbeddedCartPaymentStatus } from "@/lib/api/tuck-shop";
import type { EmbeddedCartPaymentStatus } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  cartLineCount,
  cartTicketTotal,
  cartTotal,
  clearTuckShopCart,
  isProductLine,
  isTicketLine,
  money,
  productImage,
  productPrice,
  readTuckShopCart,
  removeTuckShopCartLine,
  saveTuckShopPurchaseHistory,
  type TuckShopCartLine,
  updateTuckShopCartQuantity,
} from "@/lib/tuck-shop/cart";

const STRIPE_JS_URL = "https://js.stripe.com/v3/";
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const FULFILMENT_ATTEMPTS = 45;
const FULFILMENT_INTERVAL_MS = 1000;

type CheckoutUser = {
  name: string;
  emailAddress: string;
};

type StripeElementType = "cardNumber" | "cardExpiry" | "cardCvc";

type StripeCardElement = {
  mount: (selectorOrElement: string | HTMLElement) => void;
  unmount: () => void;
  destroy?: () => void;
  clear?: () => void;
  on: (event: "change", handler: (event: { complete: boolean; error?: { message?: string } }) => void) => void;
};

type StripeElements = {
  create: (type: StripeElementType, options?: Record<string, unknown>) => StripeCardElement;
};

type StripePaymentResult = {
  error?: { message?: string; type?: string };
  paymentIntent?: { id: string; status: string };
};

type StripeInstance = {
  elements: () => StripeElements;
  confirmCardPayment: (
    clientSecret: string,
    data: {
      payment_method: {
        card: StripeCardElement;
        billing_details: { name: string; email: string };
      };
    },
  ) => Promise<StripePaymentResult>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

const initialStripeFields: Record<StripeElementType, boolean> = {
  cardNumber: false,
  cardExpiry: false,
  cardCvc: false,
};

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

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Stripe.js could not load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = STRIPE_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe.js could not load."));
    document.head.appendChild(script);
  });
}

function stripeFieldShell(label: string, children: ReactNode) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[var(--steel)]">
      {label}
      <span className="block min-h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-soft)] transition focus-within:border-[var(--signal)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--signal)]/10">
        {children}
      </span>
    </label>
  );
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function checkoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function waitForVerifiedFulfilment(paymentIntentId: string) {
  for (let attempt = 0; attempt < FULFILMENT_ATTEMPTS; attempt += 1) {
    const status = await getEmbeddedCartPaymentStatus(paymentIntentId);
    if (status.fulfilled) return status;

    const paymentStatus = status.paymentStatus.toLowerCase();
    if (["requires_payment_method", "canceled", "cancelled"].includes(paymentStatus)) {
      throw new Error("Stripe did not complete the card payment. Your cart has not been cleared.");
    }

    await delay(FULFILMENT_INTERVAL_MS);
  }

  throw new Error("Stripe confirmed the payment, but the receipt is still being prepared. Keep this cart open and refresh shortly; it has not been cleared.");
}

export function TuckShopCartDashboard() {
  const stripeNumberRef = useRef<HTMLDivElement | null>(null);
  const stripeExpiryRef = useRef<HTMLDivElement | null>(null);
  const stripeCvcRef = useRef<HTMLDivElement | null>(null);
  const stripeInstanceRef = useRef<StripeInstance | null>(null);
  const stripeElementRefs = useRef<Partial<Record<StripeElementType, StripeCardElement>>>({});
  const [cart, setCart] = useState<TuckShopCartLine[]>([]);
  const [receipt, setReceipt] = useState<EmbeddedCartPaymentStatus | null>(null);
  const [paymentStage, setPaymentStage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeFieldsComplete, setStripeFieldsComplete] = useState<Record<StripeElementType, boolean>>({ ...initialStripeFields });
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);

  const stripeCardComplete = useMemo(() => Object.values(stripeFieldsComplete).every(Boolean), [stripeFieldsComplete]);

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

  useEffect(() => {
    let active = true;

    if (!STRIPE_PUBLISHABLE_KEY) {
      setStripeMessage("Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to activate secure Stripe card payments.");
      return;
    }

    const stripePublishableKey = STRIPE_PUBLISHABLE_KEY;

    async function mountStripeFields() {
      try {
        await loadStripeScript();
        if (!active || !window.Stripe || stripeElementRefs.current.cardNumber) return;

        const stripe = window.Stripe(stripePublishableKey);
        stripeInstanceRef.current = stripe;
        const elements = stripe.elements();
        const style = {
          base: {
            fontSize: "16px",
            color: "#111827",
            fontWeight: "700",
            "::placeholder": { color: "#7c8794" },
          },
          invalid: { color: "#dc2626" },
        };

        function mountField(type: StripeElementType, target: HTMLDivElement | null) {
          if (!target) return;
          const field = elements.create(type, { style });
          field.on("change", (event) => {
            setStripeFieldsComplete((current) => ({ ...current, [type]: event.complete }));
            setStripeMessage(event.error?.message ?? null);
          });
          field.mount(target);
          stripeElementRefs.current[type] = field;
        }

        mountField("cardNumber", stripeNumberRef.current);
        mountField("cardExpiry", stripeExpiryRef.current);
        mountField("cardCvc", stripeCvcRef.current);
        setStripeReady(true);
      } catch (stripeError) {
        setStripeMessage(stripeError instanceof Error ? stripeError.message : "Stripe card inputs could not load.");
      }
    }

    void mountStripeFields();

    return () => {
      active = false;
      Object.values(stripeElementRefs.current).forEach((field) => {
        field?.unmount();
        field?.destroy?.();
      });
      stripeElementRefs.current = {};
      stripeInstanceRef.current = null;
    };
  }, []);

  function updateQuantity(line: TuckShopCartLine, quantity: number) {
    if (isProductLine(line)) {
      setCart(updateTuckShopCartQuantity("PRODUCT", line.product.id, quantity));
      return;
    }

    setCart(updateTuckShopCartQuantity("TICKET", line.event.id, quantity, line.ticketType));
  }

  function removeFromCart(line: TuckShopCartLine) {
    if (isProductLine(line)) {
      setCart(removeTuckShopCartLine("PRODUCT", line.product.id));
      return;
    }

    setCart(removeTuckShopCartLine("TICKET", line.event.id, line.ticketType));
  }

  async function checkout() {
    if (cart.length === 0) {
      setError("Add at least one product or ticket before checkout.");
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY || !stripeReady || !stripeInstanceRef.current) {
      setError("Secure Stripe card payment is not ready. Check the publishable key and reload the page.");
      return;
    }

    if (!stripeCardComplete) {
      setError("Complete the card number, expiry date, and CVC before checkout.");
      return;
    }

    const cardNumber = stripeElementRefs.current.cardNumber;
    if (!cardNumber) {
      setError("The Stripe card-number field is unavailable. Reload the page and try again.");
      return;
    }

    setSaving(true);
    setError(null);
    setReceipt(null);

    const productLines = cart.filter(isProductLine);
    const ticketLines = cart.filter(isTicketLine);

    try {
      setPaymentStage("Securing your cart total...");
      const user = await loadCheckoutUser();
      const payment = await createEmbeddedCartPaymentIntent({
        idempotencyKey: checkoutIdempotencyKey(),
        buyerName: user.name,
        buyerEmail: user.emailAddress,
        products: productLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        tickets: ticketLines.map((line) => ({ eventId: line.event.id, ticketType: line.ticketType, quantity: line.quantity })),
      });

      setPaymentStage("Authorising your card with Stripe...");
      const confirmation = await stripeInstanceRef.current.confirmCardPayment(payment.clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name: user.name, email: user.emailAddress },
        },
      });

      if (confirmation.error) {
        throw new Error(confirmation.error.message || "Stripe could not complete the card payment.");
      }

      const confirmedIntentId = confirmation.paymentIntent?.id || payment.paymentIntentId;
      const confirmedStatus = confirmation.paymentIntent?.status;
      if (confirmedStatus && !["succeeded", "processing"].includes(confirmedStatus)) {
        throw new Error(`Stripe returned payment status ${confirmedStatus}. Your cart has not been cleared.`);
      }

      setPaymentStage("Payment confirmed. Waiting for the verified receipt...");
      const verifiedReceipt = await waitForVerifiedFulfilment(confirmedIntentId);

      verifiedReceipt.productPurchases.forEach(saveTuckShopPurchaseHistory);
      setReceipt(verifiedReceipt);
      clearTuckShopCart();
      setCart([]);
      Object.values(stripeElementRefs.current).forEach((field) => field?.clear?.());
      setStripeFieldsComplete({ ...initialStripeFields });
      setPaymentStage(null);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setPaymentStage(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <SectionHeader
        eyebrow="Verified Stripe Cart"
        title="Pay for products and tickets securely in one cart."
        description="Stripe processes the card and any required 3D Secure challenge. King Sparkon clears the cart only after the signed backend webhook confirms payment and completes fulfilment."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cart</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{cartLineCount(cart)} item{cartLineCount(cart) === 1 ? "" : "s"} ready for verified checkout.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/user/shop" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)]">
              Buy products <ShoppingBag className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/user/tickets/buy" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:bg-white">
              Buy tickets <Ticket className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="grid gap-3">
            {cart.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
                <ShoppingCart className="mx-auto h-11 w-11 text-[var(--signal)]" />
                <p className="mt-4 text-xl font-black text-[var(--ink)]">Cart is empty.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Go to Buy Products or Buy Tickets and add items to this cart.</p>
              </div>
            ) : (
              cart.map((line) => {
                const key = isProductLine(line) ? `product-${line.product.id}` : `ticket-${line.event.id}-${line.ticketType}`;
                const maxQuantity = isProductLine(line)
                  ? line.product.stockQuantity
                  : line.event.ticketTypes.find((candidate) => candidate.type === line.ticketType)?.available ?? line.quantity;
                const title = isProductLine(line) ? line.product.name : line.event.name;
                const subtitle = isProductLine(line)
                  ? line.product.businessName ?? `Business #${line.product.businessId ?? "-"}`
                  : `${line.ticketTypeLabel} ticket · ${line.event.eventDate} ${line.event.eventTime}`;
                const unitPrice = isProductLine(line) ? productPrice(line.product) : line.unitPrice;

                return (
                  <div key={key} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center">
                    {isProductLine(line) ? (
                      <img src={productImage(line.product)} alt={line.product.name} className="h-20 w-20 rounded-[1.15rem] object-cover" />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--gold)]"><Ticket className="h-8 w-8" /></div>
                    )}
                    <div>
                      <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{isProductLine(line) ? "Product" : "Ticket"}</p>
                      <p className="mt-1 font-black text-[var(--ink)]">{title}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{subtitle}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{money(unitPrice)} each · max {maxQuantity}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={maxQuantity}
                      value={line.quantity}
                      onChange={(event) => updateQuantity(line, Number(event.target.value))}
                      disabled={saving}
                      className="min-h-11 w-24 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)] disabled:opacity-50"
                    />
                    <button type="button" onClick={() => removeFromCart(line)} disabled={saving} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--danger)] hover:border-[var(--danger)] disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <aside className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] lg:sticky lg:top-5">
            <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--gold)] p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] bg-[var(--ink)] text-[var(--gold)]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-[var(--ink)]">Secure card payment</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--ink)]/65">Stripe confirmation, 3D Secure, webhook verification, then receipt.</p>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
              {paymentStage ? <p className="flex items-center gap-2 rounded-[1rem] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-3 text-sm font-bold text-[var(--ink)]"><Loader2 className="h-4 w-4 animate-spin text-[var(--signal)]" /> {paymentStage}</p> : null}

              {stripeFieldShell("Card number", <div ref={stripeNumberRef} />)}

              <div className="grid grid-cols-2 gap-4">
                {stripeFieldShell("Expiry date", <div ref={stripeExpiryRef} />)}
                {stripeFieldShell("CVC", <div ref={stripeCvcRef} />)}
              </div>

              {!stripeReady && !stripeMessage ? <p className="text-sm font-bold text-[var(--steel)]"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading secure card fields...</p> : null}
              {stripeMessage ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-xs font-bold text-[var(--danger)]">{stripeMessage}</p> : null}

              <div className="flex items-start gap-2 rounded-[1rem] bg-[var(--surface)] p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" />
                Card number, expiry, and CVC are hosted by Stripe and are never stored by King Sparkon Tracker.
              </div>

              <div className="grid gap-3 rounded-[1.35rem] bg-[var(--ink)] p-4 text-white">
                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-white/55">
                  <span>Order summary</span>
                  <span>{cartLineCount(cart)} items</span>
                </div>
                {cartTicketTotal(cart) > 0 ? <div className="flex justify-between gap-3 text-sm font-bold"><span>Tickets preview</span><span className="money">{money(cartTicketTotal(cart))}</span></div> : null}
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-xl font-black"><span>Cart preview</span><span className="money text-[var(--gold)]">{money(cartTotal(cart))}</span></div>
                <p className="text-xs leading-5 text-white/62">The backend recalculates the trusted amount before Stripe payment.</p>
              </div>

              <Button onClick={checkout} disabled={saving || cart.length === 0 || !stripeReady} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {saving ? "Processing secure payment..." : "Pay cart"}
              </Button>
            </div>
          </aside>
        </CardContent>
      </Card>

      {receipt ? (
        <Card className="overflow-hidden border-[var(--confirm)]/40 bg-white">
          <div className="flex flex-col gap-4 border-b border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] bg-[var(--confirm)] text-white"><CheckCircle2 className="h-6 w-6" /></div>
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--confirm)]">Verified payment receipt</p>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">Payment confirmed and order fulfilled</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Stripe confirmed the card payment and the signed backend webhook completed the product and ticket records before this cart was cleared.</p>
              </div>
            </div>
            <ShieldCheck className="h-9 w-9 shrink-0 text-[var(--confirm)]" />
          </div>
          <CardContent className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.5rem] bg-[var(--ink)] p-5 text-white">
              <ReceiptText className="h-7 w-7 text-[var(--gold)]" />
              <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.14em] text-white/55">Amount paid</p>
              <p className="money mt-2 text-4xl font-black text-[var(--gold)]">{money(receipt.amount)}</p>
              <p className="mt-4 break-all text-xs font-bold leading-5 text-white/65">PaymentIntent: {receipt.paymentIntentId}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--confirm)]">{receipt.paymentStatus} · webhook fulfilled</p>
            </div>

            <div className="grid gap-3">
              {receipt.productPurchases.map((purchase) => (
                <div key={purchase.transactionId} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product transaction</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-black text-[var(--ink)]">#{purchase.transactionId} · {purchase.businessName ?? `Business #${purchase.businessId ?? "-"}`}</p><p className="mt-1 text-xs font-bold text-[var(--steel)]">{purchase.items.length} product line{purchase.items.length === 1 ? "" : "s"} · {purchase.paymentStatus ?? "PAID"}</p></div>
                    <p className="money text-xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
                  </div>
                </div>
              ))}

              {receipt.ticketPaymentIds.length > 0 ? (
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Issued ticket payments</p>
                  <div className="mt-3 flex flex-wrap gap-2">{receipt.ticketPaymentIds.map((id) => <span key={id} className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-black text-[var(--ink)]">{id}</span>)}</div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/user/carts" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">View my carts</Link>
                {receipt.ticketPaymentIds.length > 0 ? <Link href="/dashboard/user/tickets" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">Open issued tickets</Link> : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
