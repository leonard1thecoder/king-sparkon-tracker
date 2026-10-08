import Link from "next/link";
import type { Product } from "@/lib/types/backend";
import { buildSlug } from "@/lib/public/slug";
import { formatZar } from "@/lib/public/format";

export function productHref(product: Product) {
  return `/mall/products/${buildSlug(product.name, product.id)}`;
}

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;
  const inStock = Number(product.stockQuantity) > 0;
  return (
    <Link href={productHref(product)} className="ks-card flex h-full flex-col">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[12px] bg-[var(--ks-light-green)]/40">
        {product.productImageUrl ? (
          // Product images come from the backend, so they are not restricted to configured hosts.
          <img src={product.productImageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="ks-float block h-12 w-12 rounded-[8px] border-2 border-[var(--ks-ink)] bg-[var(--ks-yellow)]" aria-hidden="true" />
        )}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ks-muted)]">
        {product.businessName ?? product.category}
      </p>
      <h3 className="mt-1 text-lg font-extrabold leading-tight">{product.name}</h3>
      <div className="mt-auto flex items-center justify-between pt-4 text-sm">
        <span className="font-bold">
          {onSale ? formatZar(product.salePrice) : formatZar(product.price)}
          {onSale ? <span className="ml-2 text-xs text-[var(--ks-muted)] line-through">{formatZar(product.price)}</span> : null}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${inStock ? "bg-[var(--ks-light-green)]" : "bg-[var(--ks-line)] text-[var(--ks-muted)]"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
    </Link>
  );
}
