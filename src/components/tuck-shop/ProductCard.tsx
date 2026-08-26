"use client";

import Link from "next/link";
import { Eye, ShoppingCart, Package } from "lucide-react";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { money, productImage, productPrice } from "@/lib/tuck-shop/cart";

export type ProductCardSize = "sm" | "md";

export interface ProductCardProps {
  product: Product;
  /** Show the business name label above the product title */
  showBusiness?: boolean;
  /** "sm" for compact grids (2-3 cols), "md" for horizontal scroll rows */
  size?: ProductCardSize;
  /** Called when the user clicks "Add to cart". Omit to hide the button. */
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  showBusiness = true,
  size = "md",
  onAddToCart,
}: ProductCardProps) {
  const salePrice = productPrice(product);
  const hasDiscount =
    product.salePrice !== undefined && product.salePrice < product.price;
  const inStock = product.stockQuantity > 0;

  const imageHeight = size === "sm" ? "h-44" : "h-52";
  const cardWidth =
    size === "sm"
      ? ""
      : "w-[min(84vw,20rem)] sm:w-[20rem] shrink-0 snap-start";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-ledger)] ${cardWidth}`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-[var(--surface)] ${imageHeight}`}
      >
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />

        {/* Status badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {inStock ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--confirm)]/30 bg-white/90 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--confirm)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--confirm)]" />
              In stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--danger)]/30 bg-white/90 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--danger)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
              Out of stock
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full border border-orange-200/60 bg-orange-50/90 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-orange-600 backdrop-blur-sm">
              Sale
            </span>
          )}
        </div>

        {/* Quick-view overlay on hover */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[var(--ink)]/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Link
            href={`/dashboard/user/shop/products/${product.id}`}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-black text-[var(--ink)] shadow-md backdrop-blur-sm transition hover:bg-white"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick view
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {showBusiness && product.businessName && (
          <p className="truncate font-mono text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">
            {product.businessName}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-black leading-snug tracking-[-0.02em] text-[var(--ink)]">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="money text-xl font-black text-[var(--ink)]">
              {money(salePrice)}
            </p>
            {hasDiscount && (
              <p className="money text-xs font-semibold text-[var(--muted)] line-through">
                {money(product.price)}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
              Stock
            </p>
            <p className="money text-sm font-black text-[var(--ink)]">
              {product.stockQuantity}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          {onAddToCart ? (
            <Button
              onClick={() => onAddToCart(product)}
              disabled={!inStock}
              className="w-full text-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          ) : (
            <Link
              href={`/dashboard/user/shop/products/${product.id}`}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-3 text-xs font-black text-white transition hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"
            >
              <Package className="h-3.5 w-3.5" />
              Details
            </Link>
          )}
          <Link
            href={`/dashboard/user/shop/products/${product.id}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--ink)] transition hover:border-[var(--line-strong)] hover:bg-[var(--surface)]"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
