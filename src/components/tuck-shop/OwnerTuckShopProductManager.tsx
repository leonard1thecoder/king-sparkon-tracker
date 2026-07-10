"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Boxes, ImagePlus, Loader2, PackagePlus, RefreshCw, Search, Store } from "lucide-react";
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
  returnableEnabled: false,
  returnablePrice: "",
  nightShiftEnabled: false,
  nightShiftPrice: "",
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

function fieldClass() {
  return "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";
}

function FieldLabel({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
        {label}
        {hint ? <span className="text-[0.65rem] normal-case tracking-normal text-[var(--muted)]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function OwnerTuckShopProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [imageDrafts, setImageDrafts] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);

    try {
      const response = await listOwnerProducts({ page: 0, size: 100 });
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

  const inTuckShop = useMemo(
    () => products.filter((product) => product.status === "CREATED" && product.stockQuantity > 0),
    [products],
  );
  const missingImages = useMemo(() => products.filter((product) => !product.productImageUrl).length, [products]);
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + Math.max(Number(product.stockQuantity ?? 0), 0), 0),
    [products],
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.businessName, product.category, product.status, product.id]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid product price greater than zero.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError("Stock quantity must be a whole number from zero upward.");
      setSaving(false);
      return;
    }

    try {
      await createOwnerProduct({
        name: form.name.trim(),
        category: form.category,
        price,
        stockQuantity,
        productImageUrl: form.productImageUrl.trim() || null,
        returnableEnabled: form.returnableEnabled,
        returnablePrice: form.returnableEnabled && form.returnablePrice ? Number(form.returnablePrice) : null,
        nightShiftEnabled: form.nightShiftEnabled,
        nightShiftPrice: form.nightShiftEnabled && form.nightShiftPrice ? Number(form.nightShiftPrice) : null,
        nightShiftStartTime: null,
        nightShiftEndTime: null,
      });
      setForm(emptyProductForm);
      setSuccess("Product created. It is ready for barcode assignment and Tuck Shop visibility checks.");
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
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Owner products" value={loading ? "..." : String(products.length)} detail="Live API or product preview data" tone="confirm" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Tuck Shop ready" value={loading ? "..." : String(inTuckShop.length)} detail="Created status with available stock" tone="signal" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Units in stock" value={loading ? "..." : String(totalStock)} detail="Total visible inventory" />
        <MetricCard label="Missing photos" value={loading ? "..." : String(missingImages)} detail="Add images before customer browsing" />
      </div>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create inventory product</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
            Add the core product once. Barcode capacity, Tuck Shop visibility, pricing rules, and product photos all stay attached to the same inventory record.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={createProduct}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FieldLabel label="Product name" hint="required">
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  placeholder="e.g. Still Water 750ml"
                  className={fieldClass()}
                />
              </FieldLabel>

              <FieldLabel label="Category" hint="required">
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className={fieldClass()}
                >
                  <option value="NonAlcohol">Non-alcohol</option>
                  <option value="Alcohol">Alcohol</option>
                </select>
              </FieldLabel>

              <FieldLabel label="Price" hint="ZAR">
                <input
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  required
                  inputMode="decimal"
                  placeholder="0.00"
                  className={fieldClass()}
                />
              </FieldLabel>

              <FieldLabel label="Opening stock" hint="units">
                <input
                  value={form.stockQuantity}
                  onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value.replace(/\D/g, "") }))}
                  required
                  inputMode="numeric"
                  placeholder="0"
                  className={fieldClass()}
                />
              </FieldLabel>
            </div>

            <FieldLabel label="Product image URL" hint="recommended">
              <input
                value={form.productImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, productImageUrl: event.target.value }))}
                placeholder="https://... clear product image"
                className={fieldClass()}
              />
            </FieldLabel>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_1fr_11rem] sm:items-end">
                <label className="flex min-h-11 items-center gap-3 font-black text-[var(--ink)] sm:pb-0.5">
                  <input
                    type="checkbox"
                    checked={form.returnableEnabled}
                    onChange={(event) => setForm((current) => ({ ...current, returnableEnabled: event.target.checked }))}
                    className="h-5 w-5 accent-[var(--signal)]"
                  />
                  Returnable item
                </label>
                <p className="text-sm leading-6 text-[var(--steel)]">Use for bottles or containers that include a return value.</p>
                <FieldLabel label="Return value" hint="ZAR">
                  <input
                    value={form.returnablePrice}
                    onChange={(event) => setForm((current) => ({ ...current, returnablePrice: event.target.value }))}
                    disabled={!form.returnableEnabled}
                    inputMode="decimal"
                    placeholder="0.00"
                    className={fieldClass()}
                  />
                </FieldLabel>
              </div>

              <div className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_1fr_11rem] sm:items-end">
                <label className="flex min-h-11 items-center gap-3 font-black text-[var(--ink)] sm:pb-0.5">
                  <input
                    type="checkbox"
                    checked={form.nightShiftEnabled}
                    onChange={(event) => setForm((current) => ({ ...current, nightShiftEnabled: event.target.checked }))}
                    className="h-5 w-5 accent-[var(--signal)]"
                  />
                  Night price
                </label>
                <p className="text-sm leading-6 text-[var(--steel)]">Enable a separate after-hours price without changing the normal price.</p>
                <FieldLabel label="Night price" hint="ZAR">
                  <input
                    value={form.nightShiftPrice}
                    onChange={(event) => setForm((current) => ({ ...current, nightShiftPrice: event.target.value }))}
                    disabled={!form.nightShiftEnabled}
                    inputMode="decimal"
                    placeholder="0.00"
                    className={fieldClass()}
                  />
                </FieldLabel>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--steel)]">Required fields are validated before the product is sent to the backend.</p>
              <Button type="submit" disabled={saving} className="sm:min-w-44">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                Create product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)_auto] lg:items-end">
          <div>
            <CardTitle>Inventory products</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Review every product, its stock, readiness, pricing, barcode capacity, and customer image in one aligned table.</p>
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search inventory</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Product, category, status or ID"
                className={`${fieldClass()} pl-10`}
              />
            </span>
          </label>

          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadProducts()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading products
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">
              No products match the current search.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
              <div className="overflow-x-auto">
                <table className="table-ledger min-w-[76rem]">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Barcode capacity</th>
                      <th>Status</th>
                      <th className="min-w-[25rem]">Customer image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const ready = product.stockQuantity > 0 && product.status === "CREATED";

                      return (
                        <tr key={product.id} className="transition hover:bg-[var(--surface)]/70">
                          <td>
                            <div className="flex min-w-[18rem] items-center gap-3">
                              <img src={productImage(product)} alt={product.name} className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] object-cover" />
                              <div className="min-w-0">
                                <p className="font-black text-[var(--ink)]">{product.name}</p>
                                <p className="mt-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Product #{product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="font-bold text-[var(--steel)]">{product.category}</span></td>
                          <td>
                            <p className="money font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p>
                            {product.salePrice !== undefined && product.salePrice < product.price ? <p className="money mt-1 text-xs font-bold text-[var(--muted)] line-through">{money(product.price)}</p> : null}
                          </td>
                          <td><span className="money text-base font-black text-[var(--ink)]">{product.stockQuantity}</span></td>
                          <td>
                            <p className="font-black text-[var(--ink)]">{product.barcodeCount ?? 0} assigned</p>
                            <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{product.remainingBarcodeSlots ?? 0} slots remaining</p>
                          </td>
                          <td><StatusPill label={ready ? "SHOP READY" : product.status ?? "PRODUCT"} tone={ready ? "confirm" : "neutral"} /></td>
                          <td>
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                              <input
                                value={imageDrafts[product.id] ?? ""}
                                onChange={(event) => setImageDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                                placeholder="https://... product image"
                                className={fieldClass()}
                              />
                              <Button variant="quiet" disabled={saving} onClick={() => void saveImage(product.id)}>
                                <ImagePlus className="h-4 w-4" /> Save
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
