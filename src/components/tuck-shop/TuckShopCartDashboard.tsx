"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Loader2,
  LockKeyhole,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Trash2,
  Wrench,
} from "lucide-react";
import { createPayFastCartPayment } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import { dashboardHref, type SharedDashboardRole } from "@/lib/dashboard-routes";
import { submitPayFastForm } from "@/lib/payfast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  cartLineCount,
  cartTicketTotal,
  cartTotal,
  isProductLine,
  isServiceLine,
  isTicketLine,
  money,
  productImage,
  productPrice,
  readTuckShopCart,
  removeTuckShopCartLine,
  serviceKindLabel,
  type TuckShopCartLine,
  updateTuckShopCartQuantity,
} from "@/lib/tuck-shop/cart";

type CheckoutUser = {
  name: string;
  emailAddress: string;
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

function checkoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function TuckShopCartDashboard({ role = "user" }: { role?: SharedDashboardRole }) {
  const [cart, setCart] = useState<TuckShopCartLine[]>([]);
  const [paymentStage, setPaymentStage] = useState<string | null>(null);
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

  function updateQuantity(line: TuckShopCartLine, quantity: number) {
    if (isProductLine(line)) {
      setCart(updateTuckShopCartQuantity("PRODUCT", line.product.id, quantity));
      return;
    }

    if (isServiceLine(line)) return;

    setCart(updateTuckShopCartQuantity("TICKET", line.event.id, quantity, line.ticketType));
  }

  function removeFromCart(line: TuckShopCartLine) {
    if (isProductLine(line)) {
      setCart(removeTuckShopCartLine("PRODUCT", line.product.id));
      return;
    }

    if (isServiceLine(line)) {
      setCart(removeTuckShopCartLine("SERVICE", line.referenceId));
      return;
    }

    setCart(removeTuckShopCartLine("TICKET", line.event.id, line.ticketType));
  }

  async function checkout() {
    if (cart.length === 0) {
      setError("Add at least one product, ticket or service before checkout.");
      return;
    }

    setSaving(true);
    setError(null);

    const productLines = cart.filter(isProductLine);
    const ticketLines = cart.filter(isTicketLine);
    const serviceLines = cart.filter(isServiceLine);

    try {
      setPaymentStage("Securing your cart total...");
      const user = await loadCheckoutUser();
      const payment = await createPayFastCartPayment({
        idempotencyKey: checkoutIdempotencyKey(),
        buyerName: user.name,
        buyerEmail: user.emailAddress,
        products: productLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        tickets: ticketLines.map((line) => ({ eventId: line.event.id, ticketType: line.ticketType, quantity: line.quantity })),
        services: serviceLines.map((line) => ({
          kind: line.serviceKind,
          referenceId: line.referenceId,
          label: line.label,
          amount: line.unitPrice,
        })),
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

  return (
    <section className="grid gap-5">
      <SectionHeader
        eyebrow="Verified PayFast Cart"
        title="Pay for products, tickets and services securely in one cart."
        description="PayFast processes the payment on its secure page. King Sparkon clears the cart only after the verified backend ITN confirms payment and completes fulfilment."
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cart</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{cartLineCount(cart)} item{cartLineCount(cart) === 1 ? "" : "s"} ready for verified checkout.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={dashboardHref(role, "/dashboard/user/shop")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:border-[var(--gold)]">
              Buy products <ShoppingBag className="h-4 w-4" />
            </Link>
            <Link href={dashboardHref(role, "/dashboard/user/tickets/buy")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black uppercase tracking-[0.08em] text-[var(--ink)] hover:bg-white">
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
                const key = isProductLine(line)
                  ? `product-${line.product.id}`
                  : isServiceLine(line)
                    ? `service-${line.serviceKind}-${line.referenceId}`
                    : `ticket-${line.event.id}-${line.ticketType}`;
                const maxQuantity = isProductLine(line)
                  ? line.product.stockQuantity
                  : isServiceLine(line)
                    ? 1
                    : line.event.ticketTypes.find((candidate) => candidate.type === line.ticketType)?.available ?? line.quantity;
                const title = isProductLine(line) ? line.product.name : isServiceLine(line) ? line.label : line.event.name;
                const subtitle = isProductLine(line)
                  ? line.product.businessName ?? `Business #${line.product.businessId ?? "-"}`
                  : isServiceLine(line)
                    ? `${serviceKindLabel(line.serviceKind)} · ref ${line.referenceId}`
                    : `${line.ticketTypeLabel} ticket · ${line.event.eventDate} ${line.event.eventTime}`;
                const unitPrice = isProductLine(line) ? productPrice(line.product) : isServiceLine(line) ? line.unitPrice : line.unitPrice;

                return (
                  <div key={key} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center">
                    {isProductLine(line) ? (
                      <img src={productImage(line.product)} alt={line.product.name} className="h-20 w-20 rounded-[1.15rem] object-cover" />
                    ) : isServiceLine(line) ? (
                      <div className="grid h-20 w-20 place-items-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--gold)]"><Wrench className="h-8 w-8" /></div>
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--gold)]"><Ticket className="h-8 w-8" /></div>
                    )}
                    <div>
                      <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{isProductLine(line) ? "Product" : isServiceLine(line) ? "Service" : "Ticket"}</p>
                      <p className="mt-1 font-black text-[var(--ink)]">{title}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{subtitle}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{money(unitPrice)} each · max {maxQuantity}</p>
                    </div>
                    {isServiceLine(line) ? (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--steel)]">× 1</span>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={line.quantity}
                        onChange={(event) => updateQuantity(line, Number(event.target.value))}
                        disabled={saving}
                        className="min-h-11 w-24 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black outline-none focus:border-[var(--signal)] disabled:opacity-50"
                      />
                    )}

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
                <h3 className="font-black text-[var(--ink)]">Secure PayFast payment</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--ink)]/65">PayFast checkout, ITN verification, then receipt.</p>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
              {paymentStage ? <p className="flex items-center gap-2 rounded-[1rem] border border-[var(--signal)]/25 bg-[var(--signal)]/10 p-3 text-sm font-bold text-[var(--ink)]"><Loader2 className="h-4 w-4 animate-spin text-[var(--signal)]" /> {paymentStage}</p> : null}

              <div className="flex items-start gap-2 rounded-[1rem] bg-[var(--surface)] p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" />
                You pay on PayFast&apos;s secure page (card, Instant EFT and more). Card details are never stored by King Sparkon.
              </div>

              <div className="grid gap-3 rounded-[1.35rem] bg-[var(--ink)] p-4 text-white">
                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-white/55">
                  <span>Order summary</span>
                  <span>{cartLineCount(cart)} items</span>
                </div>
                {cartTicketTotal(cart) > 0 ? <div className="flex justify-between gap-3 text-sm font-bold"><span>Tickets preview</span><span className="money">{money(cartTicketTotal(cart))}</span></div> : null}
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-xl font-black"><span>Cart preview</span><span className="money text-[var(--gold)]">{money(cartTotal(cart))}</span></div>
                <p className="text-xs leading-5 text-white/62">The backend recalculates the trusted amount before PayFast payment.</p>
              </div>

              <Button onClick={checkout} disabled={saving || cart.length === 0} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {saving ? "Processing secure payment..." : "Pay cart"}
              </Button>
            </div>
          </aside>
        </CardContent>
      </Card>
    </section>
  );
}
