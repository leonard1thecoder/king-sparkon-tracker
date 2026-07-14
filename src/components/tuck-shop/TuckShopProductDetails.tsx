"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { addTuckShopProductToCart, money, productImage, productPrice } from "@/lib/tuck-shop/cart";

export function TuckShopProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const response = await listTuckShopProducts({ page: 0, size: 120 });
        const foundProduct = response.content.find((item) => String(item.id) === productId) ?? null;
        if (!active) return;
        setProduct(foundProduct);
        setQuantity(1);
      } catch (exception) {
        if (active) setError(normalizeApiError(exception).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  const maxQuantity = Math.max(product?.stockQuantity ?? 1, 1);
  const lineTotal = useMemo(() => (product ? productPrice(product) * quantity : 0), [product, quantity]);

  function addToCart() {
    if (!product) return;
    addTuckShopProductToCart(product, quantity);
    setNotice(`${quantity} × ${product.name} added to cart.`);
  }

  return (
    <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/user/shop" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
          Open cart <ShoppingCart className="h-4 w-4" />
        </Link>
      </div>

      {loading ? <div className="h-[32rem] animate-pulse rounded-[2.4rem] border border-[var(--line)] bg-white" /> : null}

      {!loading && error ? (
        <Card>
          <CardContent className="p-8 text-sm font-bold text-[var(--danger)]">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && !error && !product ? (
        <Card>
          <CardContent className="p-10 text-center">
            <h1 className="text-3xl font-black text-[var(--ink)]">Product not found</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">Go back to the marketplace and choose another product.</p>
          </CardContent>
        </Card>
      ) : null}

      {product ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="overflow-hidden">
            <img src={productImage(product)} alt={product.name} className="h-72 w-full object-cover md:h-[28rem]" />
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Product details</p>
                  <CardTitle className="mt-2 text-4xl">{product.name}</CardTitle>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Store className="h-4 w-4 text-[var(--gold)]" /> {product.businessName ?? `Business #${product.businessId ?? "-"}`}</p>
                </div>
                <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Price</p>
                  <p className="money mt-1 text-2xl font-black text-[var(--ink)]">{money(productPrice(product))}</p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Stock</p>
                  <p className="mt-1 text-2xl font-black text-[var(--ink)]">{product.stockQuantity}</p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Category</p>
                  <p className="mt-1 text-lg font-black text-[var(--ink)]">{product.category}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--steel)]">Choose the quantity like ticket checkout, then add this product to the shared user cart.</p>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Buy this product</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Quantity is capped by current stock availability.</p>
            </CardHeader>
            <CardContent className="grid gap-5">
              {notice ? <div className="flex items-center gap-2 rounded-[1.25rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--ink)]"><CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" /> {notice}</div> : null}
              <div className="grid gap-2">
                <span className="text-sm font-black text-[var(--ink)]">Quantity</span>
                <div className="flex min-h-14 items-center justify-between rounded-[1.35rem] border border-[var(--line)] bg-white px-3 shadow-[var(--shadow-soft)]">
                  <button type="button" onClick={() => setQuantity((current) => Math.max(current - 1, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--ink)]"><Minus className="h-4 w-4" /></button>
                  <strong className="money text-3xl">{quantity}</strong>
                  <button type="button" onClick={() => setQuantity((current) => Math.min(current + 1, maxQuantity))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--ink)]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="rounded-[1.35rem] bg-[var(--ink)] p-5 text-white">
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">Line total</p>
                <p className="money mt-2 text-4xl font-black">{money(lineTotal)}</p>
              </div>
              <Button onClick={addToCart} disabled={product.stockQuantity <= 0}><ShoppingCart className="h-4 w-4" /> Add to cart</Button>
              <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">Go to cart</Link>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
