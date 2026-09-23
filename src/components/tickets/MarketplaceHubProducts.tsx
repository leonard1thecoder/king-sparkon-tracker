"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ShoppingCart, Store } from "lucide-react";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import { addTuckShopProductToCart } from "@/lib/tuck-shop/cart";
import type { Product } from "@/lib/types/backend";

type MarketplaceHubProductsProps = {
  businessId?: number | null;
  hubPrice?: number | null;
  cartHref: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

export function MarketplaceHubProducts({ businessId, hubPrice, cartHref }: MarketplaceHubProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (businessId === null || businessId === undefined) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const page = await listTuckShopProducts({ page: 0, size: 20, businessId });
      setProducts(page.content ?? []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleAdd(product: Product) {
    addTuckShopProductToCart(product, 1);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId((current) => (current === product.id ? null : current)), 2000);
  }

  return (
    <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">
            <Store className="h-4 w-4" /> Marketplace Hub
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Shop the hub business</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)]">
            Products from the business behind this event.
            {hubPrice !== null && hubPrice !== undefined ? ` Hub access ${money(hubPrice)}.` : ""}
          </p>
        </div>
        <Link
          href={cartHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]"
        >
          <ShoppingCart className="h-4 w-4" /> View cart
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-[1.5rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-8 text-center text-sm font-bold text-[var(--steel)]">
            No hub products listed yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                <div className="flex h-36 items-center justify-center overflow-hidden border-b border-[var(--line)] bg-[var(--surface)]">
                  {product.productImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.productImageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Store className="h-10 w-10 text-[var(--muted)]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="truncate font-black text-[var(--ink)]">{product.name}</p>
                  <p className="text-xs font-semibold text-[var(--steel)]">
                    {product.businessName ?? "Hub business"} · {product.stockQuantity} in stock
                  </p>
                  <p className="money text-lg font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p>
                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    className={`mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black transition ${
                      addedId === product.id
                        ? "border-[var(--confirm)] bg-[var(--confirm)] text-white"
                        : "border-[var(--signal)] bg-[var(--signal)] text-white hover:bg-[var(--ember)]"
                    }`}
                  >
                    {addedId === product.id ? (
                      <><CheckCircle2 className="h-4 w-4" /> Added</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4" /> Add to cart</>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
