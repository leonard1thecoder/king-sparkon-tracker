"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, PackagePlus, Store } from "lucide-react";
import { createOwnerProduct, listOwnerProducts, updateOwnerProductImage } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

const emptyProductForm = {
  name: "",
  category: "NonAlcohol",
  price: "",
  stockQuantity: "",
  productImageUrl: "",
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

export function OwnerTuckShopProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [imageDrafts, setImageDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);

    try {
      const response = await listOwnerProducts({ page: 0, size: 50 });
      const nextProducts = response.content ?? [];
      setProducts(nextProducts);
      setImageDrafts(Object.fromEntries(nextProducts.map((product) => [product.id, product.productImageUrl ?? ""])));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const inTuckShop = useMemo(() => products.filter((product) => product.status === "CREATED" && product.stockQuantity > 0), [products]);
  const missingImages = useMemo(() => products.filter((product) => !product.productImageUrl).length, [products]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createOwnerProduct({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        productImageUrl: form.productImageUrl.trim() || null,
        returnableEnabled: false,
        returnablePrice: null,
        nightShiftEnabled: false,
        nightShiftPrice: null,
        nightShiftStartTime: null,
        nightShiftEndTime: null,
      });
      setForm(emptyProductForm);
      setSuccess("Product created and ready for barcode assignment / tuck shop display.");
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveImage(productId: number) {
    const productImageUrl = imageDrafts[productId]?.trim();
    if (!productImageUrl) {
      setError("Product image URL is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOwnerProductImage(productId, { productImageUrl });
      setSuccess("Product image updated for King Sparkon Tuck Shop.");
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Owner products" value={loading ? "..." : String(products.length)} detail="Live products from /api/products" tone="confirm" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Tuck shop ready" value={String(inTuckShop.length)} detail="CREATED status and stock available" tone="signal" />
        <MetricCard label="Missing photos" value={String(missingImages)} detail="Add images before users browse" />
      </div>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-white p-4 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create product for Tuck Shop</CardTitle>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">This uses the existing product API. The image is stored on the same Product entity, not a duplicate tuck shop model.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_10rem_9rem_9rem_1.4fr_auto]" onSubmit={createProduct}>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required placeholder="Product name" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]">
              <option value="NonAlcohol">NonAlcohol</option>
              <option value="Alcohol">Alcohol</option>
            </select>
            <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required inputMode="decimal" placeholder="Price" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} required inputMode="numeric" placeholder="Stock" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={form.productImageUrl} onChange={(event) => setForm((current) => ({ ...current, productImageUrl: event.target.value }))} placeholder="Product image URL" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />} Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product photos and Tuck Shop visibility</CardTitle>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Users see products when backend status is CREATED and stock is greater than zero. Add clear photos for better buying confidence.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading products</div>
          ) : products.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">No owner products yet.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {products.map((product) => (
                <article key={product.id} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[8rem_1fr]">
                  <img src={productImage(product)} alt={product.name} className="h-32 w-full rounded-[1.1rem] object-cover sm:w-32" />
                  <div className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black tracking-[-0.02em] text-[var(--ink)]">{product.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{money(product.salePrice ?? product.price)} · stock {product.stockQuantity}</p>
                      </div>
                      <StatusPill label={product.stockQuantity > 0 && product.status === "CREATED" ? "SHOP READY" : product.status ?? "PRODUCT"} tone={product.stockQuantity > 0 && product.status === "CREATED" ? "confirm" : "neutral"} />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={imageDrafts[product.id] ?? ""}
                        onChange={(event) => setImageDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                        placeholder="https://... product image"
                        className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]"
                      />
                      <Button variant="quiet" disabled={saving} onClick={() => saveImage(product.id)}><ImagePlus className="h-4 w-4" /> Save image</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
