"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Store,
  Truck,
  ZoomIn,
} from "lucide-react";

import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { Product } from "@/lib/types/backend";
import { normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { APPLICATION_MOCK_PRODUCTS } from "@/lib/mock/application-products";
import {
  addTuckShopProductToCart,
  money,
  productImage,
  productPrice,
} from "@/lib/tuck-shop/cart";
import { ProductCard } from "./ProductCard";

type ProductListResponse = Product[] | {
  content?: Product[];
};

function isProductListResponse(value: unknown): value is Product[] {
  return Array.isArray(value);
}

function isPagedProductResponse(value: unknown): value is { content?: Product[] } {
  if (typeof value !== "object" || value === null) return false;
  const content = Reflect.get(value, "content");
  return content === undefined || Array.isArray(content);
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
      <div className="space-y-4">
        <div className="h-[26rem] animate-pulse rounded-[var(--radius-2xl)] bg-[var(--surface)] md:h-[36rem]" />
      </div>
      <div className="space-y-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--surface)]" />
        <div className="h-10 w-3/4 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-4 w-40 animate-pulse rounded-full bg-[var(--surface)]" />
        <div className="h-px w-full bg-[var(--line)]" />
        <div className="h-14 w-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-px w-full bg-[var(--line)]" />
        <div className="h-16 w-full animate-pulse rounded-[var(--radius-2xl)] bg-[var(--surface)]" />
        <div className="h-12 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-12 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]" />
      </div>
    </div>
  );
}

// ─── Sticky mobile CTA bar ───────────────────────────────────────────────────

function StickyMobileCta({
  product,
  lineTotal,
  onAddToCart,
  visible,
}: {
  product: Product;
  lineTotal: number;
  onAddToCart: () => void;
  visible: boolean;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex-1">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
          Total
        </p>
        <p className="money text-xl font-black text-[var(--ink)]">
          {money(lineTotal)}
        </p>
      </div>
      <Button
        onClick={onAddToCart}
        disabled={product.stockQuantity <= 0}
        className="shrink-0 px-6"
      >
        <ShoppingCart className="h-4 w-4" />
        {product.stockQuantity <= 0 ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}

// ─── Spec pill ───────────────────────────────────────────────────────────────

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-base font-black text-[var(--ink)]">{value}</p>
    </div>
  );
}

// ─── Trust signal ─────────────────────────────────────────────────────────────

function TrustSignal({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-white text-[var(--signal)]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-xs font-semibold text-[var(--steel)]">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TuckShopProductDetails({ productId }: { productId: string }) {
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const mockMatch = useMemo(() => {
    const cleanId = String(productId ?? "").trim();
    return (
      APPLICATION_MOCK_PRODUCTS.find(
        (item) =>
          String(item.id) === cleanId ||
          item.name.toLowerCase().includes(cleanId.toLowerCase()),
      ) ?? APPLICATION_MOCK_PRODUCTS[0]
    );
  }, [productId]);

  const [product, setProduct] = useState<Product | null>(mockMatch);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Sticky CTA visibility
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const response = await listTuckShopProducts({ page: 0, size: 120 });

        let items: Product[] = [];
        if (isProductListResponse(response)) {
          items = response;
        } else if (isPagedProductResponse(response)) {
          items = response.content ?? [];
        }

        if (!active) return;

        setAllProducts(items);

        const foundProduct =
          items.find((item) => String(item.id) === String(productId)) ?? null;

        if (foundProduct) {
          setProduct(foundProduct);
        } else if (!mockMatch) {
          setProduct(null);
          setError("Product not found.");
        }
      } catch (requestError) {
        if (!active) return;
        setError(normalizeApiError(requestError).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProduct();
    return () => { active = false; };
  }, [mockMatch, productId]);

  const maxQuantity = Math.max(product?.stockQuantity ?? 1, 1);

  const lineTotal = useMemo(
    () => (product ? productPrice(product) * quantity : 0),
    [product, quantity],
  );

  // Related: same business, different product, max 8
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.businessId !== null &&
          p.businessId === product.businessId,
      )
      .slice(0, 8);
  }, [allProducts, product]);

  function addToCart() {
    if (!product || product.stockQuantity <= 0) return;
    addTuckShopProductToCart(product, quantity);
    setNotice(`${quantity} × ${product.name} added to cart.`);
    setTimeout(() => setNotice(null), 4000);
  }

  const salePrice = product ? productPrice(product) : 0;
  const hasDiscount =
    product?.salePrice !== undefined &&
    product.salePrice < product.price;
  const inStock = (product?.stockQuantity ?? 0) > 0;

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 md:px-6 lg:pb-8">
        {/* ─ Breadcrumb nav ─ */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/user/shop"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-xs)] transition hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>

          <Link
            href="/dashboard/user/shop/cart"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-xs)] transition hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-soft)]"
          >
            <ShoppingCart className="h-4 w-4" />
            Open cart
          </Link>
        </div>

        {/* ─ Loading skeleton ─ */}
        {loading ? <ProductDetailSkeleton /> : null}

        {/* ─ Error ─ */}
        {!loading && error ? (
          <div className="rounded-[var(--radius-2xl)] border border-[var(--danger)]/20 bg-white p-8">
            <p className="text-sm font-bold text-[var(--danger)]">{error}</p>
          </div>
        ) : null}

        {/* ─ Not found ─ */}
        {!loading && !error && !product ? (
          <div className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-[var(--muted)]" />
            <h1 className="mt-4 text-2xl font-black text-[var(--ink)]">
              Product not found
            </h1>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">
              Go back to the marketplace and choose another product.
            </p>
            <Link
              href="/dashboard/user/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 py-2.5 text-sm font-black text-white"
            >
              Browse products
            </Link>
          </div>
        ) : null}

        {/* ─ Main product view ─ */}
        {!loading && !error && product ? (
          <div className="grid gap-12">
            {/* Two-column hero */}
            <section className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
              {/* LEFT — Image */}
              <div className="flex flex-col gap-4">
                <div
                  className={`group relative flex items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-all duration-300 ${
                    imageZoomed
                      ? "cursor-zoom-out"
                      : "cursor-zoom-in hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-ledger)]"
                  }`}
                  style={{ minHeight: "28rem" }}
                  onClick={() => setImageZoomed((z) => !z)}
                >
                  <img
                    src={productImage(product)}
                    alt={product.name}
                    className={`h-full max-h-[36rem] w-full object-contain transition-transform duration-500 ${
                      imageZoomed
                        ? "scale-[1.35]"
                        : "group-hover:scale-[1.04]"
                    }`}
                  />

                  {/* Zoom hint */}
                  {!imageZoomed && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--steel)] opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                      <ZoomIn className="h-3 w-3" />
                      Click to zoom
                    </div>
                  )}
                </div>

                {/* Category + ID meta */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]">
                    {product.category}
                  </span>
                  {product.businessId && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                      <Store className="h-3 w-3" />
                      Business #{product.businessId}
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT — Details + purchase */}
              <div className="flex flex-col gap-6">
                {/* Brand label */}
                <div>
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--signal)]">
                    {product.businessName ?? "Product details"}
                  </p>

                  <h1 className="mt-2 text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[var(--ink)] md:text-5xl">
                    {product.name}
                  </h1>
                </div>

                <hr className="border-[var(--line)]" />

                {/* Price block */}
                <div ref={ctaRef} className="flex items-end gap-4">
                  <div>
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                      Price
                    </p>
                    <p className="money mt-1 text-5xl font-black leading-none text-[var(--ink)]">
                      {money(salePrice)}
                    </p>
                    {hasDiscount && (
                      <p className="money mt-1 text-sm font-semibold text-[var(--muted)] line-through">
                        {money(product.price)}
                      </p>
                    )}
                  </div>

                  {/* Stock status pill */}
                  <span
                    className={`mb-1 inline-flex items-center gap-1.5 self-end rounded-full border px-3 py-1.5 text-xs font-black ${
                      inStock
                        ? "border-[var(--confirm)]/25 bg-[var(--confirm)]/8 text-[var(--confirm)]"
                        : "border-[var(--danger)]/25 bg-[var(--danger)]/8 text-[var(--danger)]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-[var(--confirm)]" : "bg-[var(--danger)]"}`}
                    />
                    {inStock
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>

                <hr className="border-[var(--line)]" />

                {/* Success notice */}
                {notice ? (
                  <div className="flex items-center gap-2.5 rounded-[var(--radius-xl)] border border-[var(--confirm)]/25 bg-[var(--confirm)]/8 px-4 py-3 text-sm font-black text-[var(--ink)]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--confirm)]" />
                    {notice}
                  </div>
                ) : null}

                {/* Quantity stepper */}
                <div className="grid gap-2">
                  <p className="text-sm font-black text-[var(--ink)]">
                    Quantity
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity((q) => Math.max(q - 1, 1))
                      }
                      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-[var(--shadow-xs)] transition active:scale-95 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-soft)]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <strong className="money min-w-[2.5rem] text-center text-3xl font-black text-[var(--ink)]">
                      {quantity}
                    </strong>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={quantity >= maxQuantity}
                      onClick={() =>
                        setQuantity((q) => Math.min(q + 1, maxQuantity))
                      }
                      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-[var(--shadow-xs)] transition active:scale-95 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* Line total */}
                    <div className="ml-2 flex-1 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                        Total
                      </p>
                      <p className="money text-2xl font-black text-[var(--ink)]">
                        {money(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid gap-3">
                  <Button
                    onClick={addToCart}
                    disabled={!inStock}
                    className="h-14 text-base"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {inStock ? "Add to cart" : "Out of stock"}
                  </Button>

                  <Link
                    href="/dashboard/user/shop/cart"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-xs)] transition hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-soft)]"
                  >
                    View cart
                  </Link>
                </div>

                <hr className="border-[var(--line)]" />

                {/* Trust signals */}
                <div className="grid gap-3">
                  <TrustSignal
                    icon={Truck}
                    label="Ships in 1–3 business days"
                  />
                  <TrustSignal
                    icon={RefreshCw}
                    label="30-day hassle-free returns"
                  />
                  <TrustSignal
                    icon={Store}
                    label={`Sold by ${product.businessName ?? `Business #${product.businessId ?? "–"}`}`}
                  />
                </div>
              </div>
            </section>

            {/* ─ Key specs ─ */}
            <section className="grid gap-4">
              <h2 className="text-lg font-black tracking-[-0.03em] text-[var(--ink)]">
                Product specs
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Spec label="Price" value={<span className="money">{money(salePrice)}</span>} />
                <Spec label="Stock" value={product.stockQuantity} />
                <Spec label="Category" value={product.category} />
                {product.productBarcode && (
                  <Spec label="Barcode" value={<span className="font-mono text-sm">{product.productBarcode}</span>} />
                )}
                {product.returnableEnabled && product.returnablePrice !== undefined && (
                  <Spec label="Returnable deposit" value={<span className="money">{money(product.returnablePrice)}</span>} />
                )}
                {product.nightShiftEnabled && product.nightShiftPrice !== undefined && (
                  <Spec label="Night shift price" value={<span className="money">{money(product.nightShiftPrice)}</span>} />
                )}
                {product.businessId && (
                  <Spec label="Business" value={product.businessName ?? `#${product.businessId}`} />
                )}
              </div>
            </section>

            {/* ─ Related products ─ */}
            {relatedProducts.length > 0 && (
              <section className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[var(--ink)]">
                    More from {product.businessName ?? "this business"}
                  </h2>
                  <Link
                    href="/dashboard/user/shop"
                    className="text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]"
                  >
                    View all
                  </Link>
                </div>

                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-color:var(--line-strong)_transparent] [scrollbar-width:thin]">
                  {relatedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      showBusiness={false}
                      size="md"
                      onAddToCart={(product) => {
                        addTuckShopProductToCart(product);
                        setNotice(`${product.name} added to cart.`);
                        setTimeout(() => setNotice(null), 4000);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </main>

      {/* ─ Sticky mobile CTA ─ */}
      {!loading && !error && product ? (
        <StickyMobileCta
          product={product}
          lineTotal={lineTotal}
          onAddToCart={addToCart}
          visible={stickyVisible}
        />
      ) : null}
    </>
  );
}
