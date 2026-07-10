"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, ExternalLink, Loader2, LockKeyhole, ShoppingBag, ShoppingCart, Ticket, Trash2 } from "lucide-react";
import { createTuckShopPurchase } from "@/lib/api/tuck-shop";
import type { TuckShopPurchase } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { purchaseTickets } from "@/services/ticketService";
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

type StripeInstance = {
  elements: () => StripeElements;
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

  const data = (await response.json()) as Partial<CheckoutUser>;
  return {
    name: data.name || "Registered user",
    emailAddress: data.emailAddress || "registered-user@king-sparkon.local",
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
      <span className="block min-h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-soft)] transition focus-within:border-[var(--signal)] focus-within:bg-white">
        {children}
      </span>
    </label>
  );
}

export function TuckShopCartDashboard() {
  const stripeNumberRef = useRef<HTMLDivElement | null>(null);
  const stripeExpiryRef = useRef<HTMLDivElement | null>(null);
  const stripeCvcRef = useRef<HTMLDivElement | null>(null);
  const stripeElementRefs = useRef<Partial<Record<StripeElementType, StripeCardElement>>>({});
  const [cart, setCart] = useState<TuckShopCartLine[]>([]);
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [ticketPurchaseCount, setTicketPurchaseCount] = useState(0);
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
      setStripeMessage("Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to activate the secure Stripe card inputs.");
      return;
    }

    const stripePublishableKey = STRIPE_PUBLISHABLE_KEY;

    async function mountStripeFields() {
      try {
        await loadStripeScript();
        if (!active || !window.Stripe || stripeElementRefs.current.cardNumber) return;

        const stripe = window.Stripe(stripePublishableKey);
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

    if (STRIPE_PUBLISHABLE_KEY && !stripeCardComplete) {
      setError("Complete the card number, expiry date, and CVC before checkout.");
      return;
    }

    setSaving(true);
    setError(null);
    setPurchase(null);
    setTicketPurchaseCount(0);

    const productLines = cart.filter(isProductLine);
    const ticketLines = cart.filter(isTicketLine);

    try {
      let productPurchase: TuckShopPurchase | null = null;

      if (productLines.length > 0) {
        productPurchase = await createTuckShopPurchase({
          items: productLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        });
        saveTuckShopPurchaseHistory(productPurchase);
      }

      if (ticketLines.length > 0) {
        const user = await loadCheckoutUser();
        for (const line of ticketLines) {
          await purchaseTickets({
            eventId: line.event.id,
            ticketType: line.ticketType,
            quantity: line.quantity,
            buyerName: user.name,
            buyerEmail: user.emailAddress,
          });
        }
      }

      setPurchase(productPurchase);
      setTicketPurchaseCount(ticketLines.reduce((total, line) => total + line.quantity, 0));
      clearTuckShopCart();
      setCart([]);
      Object.values(stripeElementRefs.current).forEach((field) => field?.clear?.());
      setStripeFieldsComplete({ ...initialStripeFields });
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <SectionHeader
        eyebrow="User Cart"
        title="Review products and tickets before checkout."
        description="The cart now uses the same polished secure card layout as the worker tip flow while Stripe keeps raw card details outside King Sparkon Tracker."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cart</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{cartLineCount(cart)} item{cartLineCount(cart) === 1 ? "" : "s"} ready for checkout.</p>
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
                      className="min-h-11 w-24 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)]"
                    />
                    <button type="button" onClick={() => removeFromCart(line)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--danger)] hover:border-[var(--danger)]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <aside className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] lg:sticky lg:top-5">
            <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--surface)]/55 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] bg-[var(--ink)] text-[var(--gold)]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-[var(--ink)]">Card payment details</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Secure Stripe fields for your complete cart payment.</p>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

              {stripeFieldShell("Card number", <div ref={stripeNumberRef} />)}

              <div className="grid gap-4 sm:grid-cols-2">
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
                {cartTicketTotal(cart) > 0 ? <div className="flex justify-between gap-3 text-sm font-bold"><span>Tickets</span><span className="money">{money(cartTicketTotal(cart))}</span></div> : null}
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-xl font-black"><span>Cart total</span><span className="money text-[var(--gold)]">{money(cartTotal(cart))}</span></div>
                <p className="text-xs leading-5 text-white/62">Ticket holder details come from the registered user account.</p>
              </div>

              <Button onClick={checkout} disabled={saving || cart.length === 0} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {saving ? "Processing cart..." : "Pay cart"}
              </Button>
            </div>
          </aside>
        </CardContent>
      </Card>

      {purchase || ticketPurchaseCount > 0 ? (
        <Card className="border-[var(--confirm)]/40 bg-white">
          <CardHeader>
            <CardTitle>Checkout completed</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
              {purchase ? `Product transaction #${purchase.transactionId} is ${purchase.paymentStatus ?? "PENDING"}. ` : ""}
              {ticketPurchaseCount > 0 ? `${ticketPurchaseCount} ticket QR ${ticketPurchaseCount === 1 ? "was" : "were"} issued to the registered user account.` : ""}
            </p>
          </CardHeader>
          {purchase?.paymentUrl ? (
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="money text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
                <p className="mt-2 break-all text-sm font-semibold text-[var(--steel)]">{purchase.paymentReference}</p>
                {purchase.tip?.paymentUrl ? <p className="mt-2 text-xs font-bold text-[var(--signal)]">Separate worker tip link was also created.</p> : null}
              </div>
              <a href={purchase.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]">
                Open Stripe link <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </section>
  );
}
