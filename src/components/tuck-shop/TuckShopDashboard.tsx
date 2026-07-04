"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, PackageCheck, Search, ShoppingCart, Store, Trash2, WalletCards } from "lucide-react";
import { createTuckShopPurchase, listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { Product, TuckShopPurchase } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";

type CartLine = {
  product: Product;
  quantity: number;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function productPrice(product: Product) {
  return Number(product.salePrice ?? product.price ?? 0);
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

export function TuckShopDashboard({ compact = false }: { compact?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentContact, setPaymentContact] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts(nextSearch = search, nextBusinessId = businessId) {
    setLoading(true);
    setError(null);

    try {
      const response = await listTuckShopProducts({
        page: 0,
        size: compact ? 6 : 24,
        search: nextSearch,
        businessId: nextBusinessId ? Number(nextBusinessId) : undefined,
      });
      setProducts(response.content ?? []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((total, line) => total + productPrice(line.product) * line.quantity, 0),
    [cart],
  );

  function addToCart(product: Product) {
    setPurchase(null);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, product.stockQuantity) }
            : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: number) {
    setCart((current) => current.filter((line) => line.product.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((current) =>
      current.map((line) =>
        line.product.id === productId
          ? { ...line, quantity: Math.min(Math.max(quantity, 1), line.product.stockQuantity) }
          : line,
      ),
    );
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
        eyebrow="King Sparkon Tuck Shop"
        title="Buy products directly from businesses."
        description="Products come from the existing inventory module, with product photos, stock, barcode-backed checkout, Stripe links, and optional worker tips."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Available products" value={loading ? "..." : String(products.length)} detail="Live tuck shop catalogue" tone="confirm" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Cart total" value={money(cartTotal)} detail={`${cart.length} product line${cart.length === 1 ? "" : "s"}`} tone="signal" icon={<ShoppingCart className="h-5 w-5" />} />
        <MetricCard label="Tips" value="Separate" detail="Worker tips do not mix with product revenue" icon={<WalletCards className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <CardTitle>Marketplace products</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Search all business products that are active and in stock.</p>
          </div>
          <form
            className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadProducts(search, businessId);
            }}
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product or business"
                className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
              />
            </label>
            <input
              value={businessId}
              onChange={(event) => setBusinessId(event.target.value)}
              placeholder="Business ID"
              inputMode="numeric"
              className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
            />
            <Button type="submit" variant="quiet">Filter</Button>
          </form>
        </CardHeader>
        <CardContent>
          {error ? <p className="mb-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading tuck shop products
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <PackageCheck className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 font-black text-[var(--ink)]">No available products yet</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Owners need to add stock and product photos first.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)]">
                  <img src={productImage(product)} alt={product.name} className="h-44 w-full object-cover" />
                  <div className="grid gap-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{product.businessName ?? `Business #${product.businessId ?? "-"}`}</p>
                        <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{product.name}</h3>
                      </div>
                      <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Price</p>
                        <p className="money text-2xl font-black text-[var(--ink)]">{money(productPrice(product))}</p>
                      </div>
                      <p className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Stock {product.stockQuantity}</p>
                    </div>
                    <Button onClick={() => addToCart(product)} disabled={product.stockQuantity <= 0}>Add to cart</Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Checkout creates a backend barcode transaction and returns a Stripe payment link. Add worker ID only when tipping or crediting a worker.</p>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-3">
            {cart.length === 0 ? (
              <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-5 text-sm font-bold text-[var(--steel)]">Cart is empty.</p>
            ) : (
              cart.map((line) => (
                <div key={line.product.id} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="font-black text-[var(--ink)]">{line.product.name}</p>
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

          <div className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <input value={paymentEmail} onChange={(event) => setPaymentEmail(event.target.value)} placeholder="Payment email (optional)" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={paymentContact} onChange={(event) => setPaymentContact(event.target.value)} placeholder="WhatsApp / contact (optional)" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={workerId} onChange={(event) => setWorkerId(event.target.value)} placeholder="Worker ID for tip (optional)" inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="Tip amount e.g. 15.00" inputMode="decimal" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <div className="rounded-[var(--radius-lg)] bg-[var(--ink)] p-4 text-white">
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">Product total</p>
              <p className="money mt-1 text-3xl font-black">{money(cartTotal)}</p>
              <p className="mt-2 text-xs leading-5 text-white/62">Tips are created as separate worker tip records.</p>
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
