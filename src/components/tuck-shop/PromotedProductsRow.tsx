"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, Eye, Loader2, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import { listActiveProductPromotions, type ProductPromotion } from "@/lib/api/product-promotions";
import { addTuckShopProductToCart, money, productImage, productPrice } from "@/lib/tuck-shop/cart";

function promotionEnd(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", { dateStyle: "medium" });
}

export function PromotedProductsRow() {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [promotions, setPromotions] = useState<ProductPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await listActiveProductPromotions(16);
        if (active) setPromotions(Array.isArray(response) ? response.filter((item) => item.active && item.product?.stockQuantity > 0) : []);
      } catch (exception) {
        if (active) setError(normalizeApiError(exception).message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  function scroll(direction: "left" | "right") {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction === "left" ? -Math.max(row.clientWidth * 0.82, 320) : Math.max(row.clientWidth * 0.82, 320), behavior: "smooth" });
  }

  function add(promotion: ProductPromotion) {
    addTuckShopProductToCart(promotion.product);
    setNotice(`${promotion.product.name} added to cart.`);
  }

  if (!loading && promotions.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white p-4 text-[var(--ink)] shadow-[var(--shadow-soft)] md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--gold)] bg-white text-[var(--ink)]"><Crown className="h-6 w-6" /></div>
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Featured business brands</p>
            <h2 className="mt-1 text-3xl font-black tracking-[-0.05em]">Promoted</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-white/65">Products businesses have promoted for extra visibility. Browse the row exactly like the normal customer catalogue.</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 self-start rounded-full border border-[var(--line)] bg-white p-1">
          <button type="button" onClick={() => scroll("left")} aria-label="Scroll promoted products left" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--accent-hover)] hover:text-[var(--ink)]"><ChevronLeft className="h-5 w-5" /></button>
          <span className="px-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white/65">{promotions.length} promoted</span>
          <button type="button" onClick={() => scroll("right")} aria-label="Scroll promoted products right" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--accent-hover)] hover:text-[var(--ink)]"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-red-300/30 bg-red-500/15 p-3 text-sm font-bold text-red-100">{error}</p> : null}
      {notice ? <p className="mb-4 rounded-xl border border-[var(--line-strong)] bg-[var(--signal-soft)] p-3 text-sm font-bold text-[var(--signal-strong)]">{notice}</p> : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-black text-white/70"><Loader2 className="h-5 w-5 animate-spin" /> Loading promoted brands</div>
      ) : (
        <div ref={rowRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-color:var(--gold)_transparent] [scrollbar-width:thin]">
          {promotions.map((promotion) => {
            const product = promotion.product;
            const price = productPrice(product);
            const discounted = product.salePrice !== undefined && product.salePrice < product.price;
            return (
              <article key={promotion.id} className="flex w-[min(84vw,20rem)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] shadow-[0_18px_44px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-[var(--accent-hover)]">
                <div className="relative h-48 overflow-hidden bg-[var(--surface)]">
                  <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2"><StatusPill label="PROMOTED" tone="signal" />{discounted ? <StatusPill label="SPECIAL" tone="confirm" /> : null}</div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div>
                    <p className="truncate font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{promotion.businessName}</p>
                    <h3 className="mt-1 line-clamp-2 text-xl font-black tracking-[-0.035em]">{product.name}</h3>
                    <p className="mt-1 text-xs font-bold text-[var(--muted)]">Featured until {promotionEnd(promotion.endsAt)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Price</p><p className="money mt-1 text-xl font-black">{money(price)}</p>{discounted ? <p className="money text-xs font-bold text-[var(--muted)] line-through">{money(product.price)}</p> : null}</div>
                    <div className="text-right"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Stock</p><p className="mt-1 text-xl font-black">{product.stockQuantity}</p><p className="text-xs font-semibold text-[var(--steel)]">units ready</p></div>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button type="button" onClick={() => add(promotion)} disabled={product.stockQuantity <= 0}><ShoppingCart className="h-4 w-4" /> Add</Button>
                    <Link href={`/dashboard/user/shop/products/${product.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black hover:border-[var(--accent-hover)] hover:bg-[var(--surface)]"><Eye className="h-4 w-4" /> Details</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-white/55"><Sparkles className="h-4 w-4 text-[var(--gold)]" /> Paid promotion placement does not change product price or stock rules.</div>
    </section>
  );
}
