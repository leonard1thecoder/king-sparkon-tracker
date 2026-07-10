"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Boxes, ImagePlus, Loader2, PackagePlus, RefreshCw, Search, Store, Upload } from "lucide-react";
import { createOwnerProduct, listOwnerProducts, uploadProductImage } from "@/lib/api/tuck-shop";
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
  returnableEnabled: false,
  returnablePrice: "",
  nightShiftEnabled: false,
  nightShiftPrice: "",
};

const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/gif";

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

function fieldClass() {
  return "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";
}

function fileInputClass() {
  return "block min-h-11 w-full cursor-pointer rounded-[1rem] border border-[var(--line)] bg-white text-sm font-semibold text-[var(--steel)] file:mr-3 file:min-h-11 file:border-0 file:border-r file:border-[var(--line)] file:bg-[var(--gold)] file:px-4 file:text-xs file:font-black file:uppercase file:tracking-[0.08em] file:text-[var(--ink)] hover:border-[var(--signal)]";
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

function imagePreview(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onLoad(typeof reader.result === "string" ? reader.result : "");
  reader.readAsDataURL(file);
}

export function OwnerTuckShopProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductPreview, setNewProductPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<Record<number, File | undefined>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);

    try {
      const response = await listOwnerProducts({ page: 0, size: 100 });
      setProducts(response.content ?? []);
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

  function selectNewProductImage(file: File | null) {
    setNewProductImage(file);
    setNewProductPreview(null);
    if (file) imagePreview(file, setNewProductPreview);
  }

  function selectExistingProductImage(productId: number, file: File | null) {
    setImageFiles((current) => ({ ...current, [productId]: file ?? undefined }));
    setImagePreviews((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
    if (file) {
      imagePreview(file, (value) => setImagePreviews((current) => ({ ...current, [productId]: value })));
    }
  }

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
      const created = await createOwnerProduct({
        name: form.name.trim(),
        category: form.category,
        price,
        stockQuantity,
        productImageUrl: null,
        returnableEnabled: form.returnableEnabled,
        returnablePrice: form.returnableEnabled && form.returnablePrice ? Number(form.returnablePrice) : null,
        nightShiftEnabled: form.nightShiftEnabled,
        nightShiftPrice: form.nightShiftEnabled && form.nightShiftPrice ? Number(form.nightShiftPrice) : null,
        nightShiftStartTime: null,
        nightShiftEndTime: null,
      });

      if (newProductImage) {
        await uploadProductImage(created.id, newProductImage);
      }

      setForm(emptyProductForm);
      selectNewProductImage(null);
      setSuccess(newProductImage
        ? "Product created and the selected photo was uploaded successfully."
        : "Product created. You can add its photo from the inventory list at any time.");
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveImage(productId: number) {
    const file = imageFiles[productId];
    if (!file) {
      setError("Choose an image file before uploading the product photo.");
      return;
    }

    setUploadingProductId(productId);
    setError(null);
    setSuccess(null);

    try {
      await uploadProductImage(productId, file);
      selectExistingProductImage(productId, null);
      setSuccess("Product photo uploaded and updated in King Sparkon Tuck Shop.");
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setUploadingProductId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Owner products" value={loading ? "..." : String(products.length)} detail="Live business inventory" tone="confirm" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Tuck Shop ready" value={loading ? "..." : String(inTuckShop.length)} detail="Created status with available stock" tone="signal" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Units in stock" value={loading ? "..." : String(totalStock)} detail="Total visible inventory" />
        <MetricCard label="Missing photos" value={loading ? "..." : String(missingImages)} detail="Choose local images for customer browsing" />
      </div>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create inventory product</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
            Add the product once and choose a local photo from your device. The file is uploaded securely after the inventory record is created.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={createProduct}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FieldLabel label="Product name" hint="required">
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required placeholder="e.g. Still Water 750ml" className={fieldClass()} />
              </FieldLabel>
              <FieldLabel label="Category" hint="required">
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={fieldClass()}>
                  <option value="NonAlcohol">Non-alcohol</option>
                  <option value="Alcohol">Alcohol</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Price" hint="ZAR">
                <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required inputMode="decimal" placeholder="0.00" className={fieldClass()} />
              </FieldLabel>
              <FieldLabel label="Opening stock" hint="units">
                <input value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value.replace(/\D/g, "") }))} required inputMode="numeric" placeholder="0" className={fieldClass()} />
              </FieldLabel>
            </div>

            <div className="grid gap-4 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[1.1rem] border border-dashed border-[var(--line)] bg-white">
                {newProductPreview ? <img src={newProductPreview} alt="Selected product preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-[var(--signal)]" />}
              </div>
              <FieldLabel label="Product photo" hint="optional · JPG, PNG, WebP or GIF">
                <input type="file" accept={acceptedImageTypes} onChange={(event) => selectNewProductImage(event.target.files?.[0] ?? null)} className={fileInputClass()} />
              </FieldLabel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_1fr_11rem] sm:items-end">
                <label className="flex min-h-11 items-center gap-3 font-black text-[var(--ink)] sm:pb-0.5">
                  <input type="checkbox" checked={form.returnableEnabled} onChange={(event) => setForm((current) => ({ ...current, returnableEnabled: event.target.checked }))} className="h-5 w-5 accent-[var(--signal)]" />
                  Returnable item
                </label>
                <p className="text-sm leading-6 text-[var(--steel)]">Use for bottles or containers that include a return value.</p>
                <FieldLabel label="Return value" hint="ZAR">
                  <input value={form.returnablePrice} onChange={(event) => setForm((current) => ({ ...current, returnablePrice: event.target.value }))} disabled={!form.returnableEnabled} inputMode="decimal" placeholder="0.00" className={fieldClass()} />
                </FieldLabel>
              </div>

              <div className="grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_1fr_11rem] sm:items-end">
                <label className="flex min-h-11 items-center gap-3 font-black text-[var(--ink)] sm:pb-0.5">
                  <input type="checkbox" checked={form.nightShiftEnabled} onChange={(event) => setForm((current) => ({ ...current, nightShiftEnabled: event.target.checked }))} className="h-5 w-5 accent-[var(--signal)]" />
                  Night price
                </label>
                <p className="text-sm leading-6 text-[var(--steel)]">Enable a separate after-hours price without changing the normal price.</p>
                <FieldLabel label="Night price" hint="ZAR">
                  <input value={form.nightShiftPrice} onChange={(event) => setForm((current) => ({ ...current, nightShiftPrice: event.target.value }))} disabled={!form.nightShiftEnabled} inputMode="decimal" placeholder="0.00" className={fieldClass()} />
                </FieldLabel>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--steel)]">The selected photo is uploaded only after the product passes backend validation.</p>
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
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Review every product and replace its customer photo by choosing a file from your device.</p>
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search inventory</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product, category, status or ID" className={`${fieldClass()} pl-10`} />
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
            <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">No products match the current search.</p>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
              <div className="overflow-x-auto">
                <table className="table-ledger min-w-[82rem]">
                  <thead>
                    <tr>
                      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Barcode capacity</th><th>Status</th><th className="min-w-[29rem]">Customer photo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const ready = product.stockQuantity > 0 && product.status === "CREATED";
                      const uploading = uploadingProductId === product.id;
                      return (
                        <tr key={product.id} className="transition hover:bg-[var(--surface)]/70">
                          <td>
                            <div className="flex min-w-[18rem] items-center gap-3">
                              <img src={imagePreviews[product.id] || productImage(product)} alt={product.name} className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] object-cover" />
                              <div className="min-w-0"><p className="font-black text-[var(--ink)]">{product.name}</p><p className="mt-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Product #{product.id}</p></div>
                            </div>
                          </td>
                          <td><span className="font-bold text-[var(--steel)]">{product.category}</span></td>
                          <td><p className="money font-black text-[var(--ink)]">{money(product.salePrice ?? product.price)}</p>{product.salePrice !== undefined && product.salePrice < product.price ? <p className="money mt-1 text-xs font-bold text-[var(--muted)] line-through">{money(product.price)}</p> : null}</td>
                          <td><span className="money text-base font-black text-[var(--ink)]">{product.stockQuantity}</span></td>
                          <td><p className="font-black text-[var(--ink)]">{product.barcodeCount ?? 0} assigned</p><p className="mt-1 text-xs font-semibold text-[var(--steel)]">{product.remainingBarcodeSlots ?? 0} slots remaining</p></td>
                          <td><StatusPill label={ready ? "SHOP READY" : product.status ?? "PRODUCT"} tone={ready ? "confirm" : "neutral"} /></td>
                          <td>
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                              <input type="file" accept={acceptedImageTypes} onChange={(event) => selectExistingProductImage(product.id, event.target.files?.[0] ?? null)} className={fileInputClass()} />
                              <Button type="button" variant="quiet" disabled={uploading || !imageFiles[product.id]} onClick={() => void saveImage(product.id)}>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload photo
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
