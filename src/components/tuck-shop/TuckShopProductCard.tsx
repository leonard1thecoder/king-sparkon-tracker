"use client";

import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { money, productImage, productPrice } from "@/lib/tuck-shop/cart";

export function TuckShopProductCard({
  product,
  businessName,
  compact = false,
  fluid = false,
  onAdd,
}: {
  product: Product;
  businessName: string;
  compact?: boolean;
  fluid?: boolean;
  onAdd: (product: Product) => void;
}) {
  const salePrice = productPrice(product);
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[var(--shadow-ledger)] ${
        fluid ? "w-full" : compact ? "w-[min(82vw,18rem)] shrink-0 snap-start" : "w-[min(84vw,20rem)] shrink-0 snap-start sm:w-[20rem]"
      }`}
    >
      <div className="relative overflow-hidden bg-[var(--surface)]">
        <img src={productImage(product)} alt={product.name} className="h-48 w-full object-cover transition duration-300 hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusPill label={product.status ?? "AVAILABLE"} tone="confirm" />
          {hasDiscount ? <StatusPill label="SPECIAL" tone="signal" /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-[5rem]">
          <p className="truncate font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{businessName}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{product.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Price</p>
            <p className="money mt-1 text-xl font-black text-[var(--ink)]">{money(salePrice)}</p>
            {hasDiscount ? <p className="money text-xs font-bold text-[var(--muted)] line-through">{money(product.price)}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Stock</p>
            <p className="money mt-1 text-xl font-black text-[var(--ink)]">{product.stockQuantity}</p>
            <p className="text-xs font-semibold text-[var(--steel)]">units ready</p>
          </div>
        </div>

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button onClick={() => onAdd(product)} disabled={product.stockQuantity <= 0} className="w-full">
            <ShoppingCart className="h-4 w-4" /> Add
          </Button>
          <Link
            href={`/dashboard/user/shop/products/${product.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--surface)]"
          >
            <Eye className="h-4 w-4" /> Details
          </Link>
        </div>
      </div>
    </article>
  );
}
