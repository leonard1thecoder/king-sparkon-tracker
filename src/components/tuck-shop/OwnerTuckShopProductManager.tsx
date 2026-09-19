"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Barcode,
  Boxes,
  Crown,
  ImagePlus,
  Loader2,
  Megaphone,
  PackagePlus,
  RefreshCw,
  Search,
  Store,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import {
  configureProductBarcodeMode,
  createOwnerProduct,
  deleteOwnerProduct,
  listOwnerProducts,
  listProductBarcodeConfigurations,
  updateOwnerProductQuantity,
  uploadProductImage,
  type ProductBarcodeConfiguration,
  type ProductBarcodeMode,
} from "@/lib/api/tuck-shop";
import {
  createDiscountSale,
  listOwnerProductPromotions,
  promoteOwnerProduct,
  type ProductPromotion,
} from "@/lib/api/product-promotions";
import { normalizeApiError } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";

const emptyProductForm = {
  name: "",
  category: "NonAlcohol",
  price: "",
  stockQuantity: "",
  barcodeMode: "BRANDED" as ProductBarcodeMode,
  productBarcode: "",
  returnableEnabled: false,
  returnablePrice: "",
  nightShiftEnabled: false,
  nightShiftPrice: "",
};

const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/gif";

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "Not scheduled";
}

function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.svg";
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
  const [barcodeConfigurations, setBarcodeConfigurations] = useState<ProductBarcodeConfiguration[]>([]);
  const [promotions, setPromotions] = useState<ProductPromotion[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductPreview, setNewProductPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<Record<number, File | undefined>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [quantityDrafts, setQuantityDrafts] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<number | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
  const [promotingProductId, setPromotingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [discountPercentDraft, setDiscountPercentDraft] = useState("");
  const [discountStartsAt, setDiscountStartsAt] = useState("");
  const [discountEndsAt, setDiscountEndsAt] = useState("");
  const [discountSaving, setDiscountSaving] = useState(false);
  const [transactionProduct, setTransactionProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const [response, configurations, promotionRows] = await Promise.all([
        listOwnerProducts({ page: 0, size: 100 }),
        listProductBarcodeConfigurations().catch(() => []),
        listOwnerProductPromotions().catch(() => []),
      ]);
      const nextProducts = response.content ?? [];
      setProducts(nextProducts);
      setBarcodeConfigurations(configurations);
      setPromotions(Array.isArray(promotionRows) ? promotionRows : []);
      setQuantityDrafts(Object.fromEntries(nextProducts.map((product) => [product.id, String(product.stockQuantity ?? 0)])));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const configByProduct = useMemo(
    () => new Map(barcodeConfigurations.map((configuration) => [configuration.productId, configuration])),
    [barcodeConfigurations],
  );
  const activePromotionByProduct = useMemo(() => {
    const map = new Map<number, ProductPromotion>();
    promotions.filter((promotion) => promotion.active).forEach((promotion) => {
      if (!map.has(promotion.productId)) map.set(promotion.productId, promotion);
    });
    return map;
  }, [promotions]);
  const activeProducts = useMemo(() => products.filter((product) => String(product.status) !== "ARCHIVED"), [products]);
  const inTuckShop = useMemo(() => activeProducts.filter((product) => product.status === "CREATED" && product.stockQuantity > 0), [activeProducts]);
  const missingImages = useMemo(() => activeProducts.filter((product) => !product.productImageUrl).length, [activeProducts]);
  const totalStock = useMemo(() => activeProducts.reduce((total, product) => total + Math.max(Number(product.stockQuantity ?? 0), 0), 0), [activeProducts]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeProducts;
    return activeProducts.filter((product) =>
      [product.name, product.businessName, product.category, product.status, product.productBarcode, configByProduct.get(product.id)?.barcodeMode, product.id]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [activeProducts, configByProduct, search]);

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
    if (file) imagePreview(file, (value) => setImagePreviews((current) => ({ ...current, [productId]: value })));
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
        productBarcode: null,
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
      await configureProductBarcodeMode(created.id, {
        barcodeMode: form.barcodeMode,
        manufacturerBarcode: null,
      });
      if (newProductImage) await uploadProductImage(created.id, newProductImage);
      setForm(emptyProductForm);
      selectNewProductImage(null);
      setSuccess(form.barcodeMode === "AUTO_GENERATED" ? `${created.name} was created successfully. Workers can now create its internal stock-unit codes.` : `${created.name} was created successfully and is ready for stock preparation.`);
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
      setSuccess("Product photo updated in the customer shop.");
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setUploadingProductId(null);
    }
  }

  async function updateQuantity(product: Product) {
    const quantity = Number(quantityDrafts[product.id]);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Stock quantity must be a whole number from zero upward.");
      return;
    }
    setUpdatingProductId(product.id);
    setError(null);
    setSuccess(null);
    try {
      await updateOwnerProductQuantity(product.id, quantity);
      setSuccess(`${product.name} stock updated to ${quantity}.`);
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setUpdatingProductId(null);
    }
  }

  function openDiscountModal(product: Product) {
    setDiscountProduct(product);
    setDiscountPercentDraft("");
    const today = new Date().toISOString().slice(0, 16);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setDiscountStartsAt(today);
    setDiscountEndsAt(nextWeek);
    setError(null);
    setSuccess(null);
  }

  async function handleCreateDiscountSale() {
    if (!discountProduct) return;
    const percent = Number(discountPercentDraft);
    if (!Number.isFinite(percent) || percent < 1 || percent > 90) {
      setError("Discount percent must be between 1 and 90.");
      return;
    }
    if (!discountStartsAt || !discountEndsAt) {
      setError("Select start and end dates for the sale.");
      return;
    }
    const startsAt = new Date(discountStartsAt).toISOString();
    const endsAt = new Date(discountEndsAt).toISOString();
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("End date must be after start date.");
      return;
    }
    setDiscountSaving(true);
    setPromotingProductId(discountProduct.id);
    setError(null);
    setSuccess(null);
    try {
      const promotion = await createDiscountSale(discountProduct.id, { discountPercent: percent, startsAt, endsAt });
      setSuccess(`${discountProduct.name} is on ${percent}% sale until ${date(promotion.endsAt)}. Price will revert to original after.`);
      setDiscountProduct(null);
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setDiscountSaving(false);
      setPromotingProductId(null);
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name} from the customer shop? Existing purchase history will be preserved.`)) return;
    setDeletingProductId(product.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteOwnerProduct(product.id);
      setSuccess(`${product.name} was removed from the customer shop. Its transaction history remains available.`);
      await loadProducts();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Owner products" value={loading ? "..." : String(activeProducts.length)} detail="Active customer catalogue" tone="confirm" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Tuck Shop ready" value={loading ? "..." : String(inTuckShop.length)} detail="Visible with available stock" tone="signal" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Discount sales" value={loading ? "..." : String(activePromotionByProduct.size)} detail="Active percent-off sales" icon={<BadgePercent className="h-5 w-5" />} />
        <MetricCard label="Units in stock" value={loading ? "..." : String(totalStock)} detail="Total active inventory" />
        <MetricCard label="Missing photos" value={loading ? "..." : String(missingImages)} detail="Products needing customer images" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create inventory product</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Choose whether customers and workers scan a manufacturer barcode or King Sparkon creates private stock-unit codes automatically.</p>
        </CardHeader>
        <CardContent>
          {error ? <p role="alert" className="mb-5 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">Product could not be created: {error}</p> : null}
          {success ? <p role="status" className="mb-5 rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}
          <form className="grid gap-5" onSubmit={createProduct}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FieldLabel label="Product name" hint="required"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required placeholder="e.g. Still Water 750ml" className={fieldClass()} /></FieldLabel>
              <FieldLabel label="Category" hint="required"><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={fieldClass()}><option value="NonAlcohol">Non-alcohol</option><option value="Alcohol">Alcohol</option></select></FieldLabel>
              <FieldLabel label="Price" hint="ZAR"><input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required inputMode="decimal" placeholder="0.00" className={fieldClass()} /></FieldLabel>
              <FieldLabel label="Opening stock" hint="units"><input value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value.replace(/\D/g, "") }))} required inputMode="numeric" placeholder="0" className={fieldClass()} /></FieldLabel>
            </div>
            <div className="grid gap-4 rounded-[1.35rem] border border-[var(--gold)]/60 bg-[var(--gold)]/10 p-4 lg:grid-cols-2">
              <button type="button" onClick={() => setForm((current) => ({ ...current, barcodeMode: "BRANDED" }))} className={`flex items-start gap-3 rounded-[1.1rem] border p-4 text-left ${form.barcodeMode === "BRANDED" ? "border-[var(--signal)] bg-white shadow-[var(--shadow-soft)]" : "border-[var(--line)] bg-white/50"}`}><Barcode className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" /><span><strong className="block text-sm font-black text-[var(--ink)]">Barcoded brand</strong><span className="mt-1 block text-xs font-semibold leading-5 text-[var(--steel)]">Workers add the manufacturer barcode at <span className="font-black text-[var(--signal)]">/dashboard/worker/products</span>.</span></span></button>
              <button type="button" onClick={() => setForm((current) => ({ ...current, barcodeMode: "AUTO_GENERATED", productBarcode: "" }))} className={`flex items-start gap-3 rounded-[1.1rem] border p-4 text-left ${form.barcodeMode === "AUTO_GENERATED" ? "border-[var(--confirm)] bg-white shadow-[var(--shadow-soft)]" : "border-[var(--line)] bg-white/50"}`}><WandSparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--confirm)]" /><span><strong className="block text-sm font-black text-[var(--ink)]">No manufacturer barcode</strong><span className="mt-1 block text-xs font-semibold leading-5 text-[var(--steel)]">King Sparkon creates internal unit codes.</span></span></button>
            </div>
            <div className="grid gap-4 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center"><div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[1.1rem] border border-dashed border-[var(--line)] bg-white">{newProductPreview ? <img src={newProductPreview} alt="Selected product preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-[var(--signal)]" />}</div><FieldLabel label="Product photo" hint="optional"><input type="file" accept={acceptedImageTypes} onChange={(event) => selectNewProductImage(event.target.files?.[0] ?? null)} className={fileInputClass()} /></FieldLabel></div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4 font-black"><input type="checkbox" checked={form.returnableEnabled} onChange={(event) => setForm((current) => ({ ...current, returnableEnabled: event.target.checked }))} className="h-5 w-5 accent-[var(--signal)]" /> Returnable item <input value={form.returnablePrice} onChange={(event) => setForm((current) => ({ ...current, returnablePrice: event.target.value }))} disabled={!form.returnableEnabled} inputMode="decimal" placeholder="Return value" className={`${fieldClass()} ml-auto max-w-40`} /></label>
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4 font-black"><input type="checkbox" checked={form.nightShiftEnabled} onChange={(event) => setForm((current) => ({ ...current, nightShiftEnabled: event.target.checked }))} className="h-5 w-5 accent-[var(--signal)]" /> Night price <input value={form.nightShiftPrice} onChange={(event) => setForm((current) => ({ ...current, nightShiftPrice: event.target.value }))} disabled={!form.nightShiftEnabled} inputMode="decimal" placeholder="Night price" className={`${fieldClass()} ml-auto max-w-40`} /></label>
            </div>
            <div className="flex justify-end border-t border-[var(--line)] pt-5"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />} Create product</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)_auto] lg:items-end">
          <div><CardTitle>Customer product view</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Products appear as customers see them, with owner controls for quantity, photo, promotion and deletion.</p></div>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Search products</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product, barcode mode or ID" className={`${fieldClass()} pl-10`} /></span></label>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void loadProducts()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-56 items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading products</div> : filteredProducts.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center text-sm font-bold text-[var(--steel)]">No products match the current search.</p> : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const configuration = configByProduct.get(product.id);
                const mode = configuration?.barcodeMode ?? (product.productBarcode ? "BRANDED" : "AUTO_GENERATED");
                const promotion = activePromotionByProduct.get(product.id);
                const uploading = uploadingProductId === product.id;
                const updating = updatingProductId === product.id;
                const promoting = promotingProductId === product.id;
                const deleting = deletingProductId === product.id;
                const barcodesRequired = configuration?.barcodesRequired ?? product.remainingBarcodeSlots ?? 0;
                const barcodesAssigned = configuration?.barcodeCount ?? product.barcodeCount ?? (product.barcodes?.length ?? 0);
                return (
                  <article key={product.id} className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]">
                      <img src={imagePreviews[product.id] || productImage(product)} alt={product.name} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2"><StatusPill label={mode === "BRANDED" ? "BARCODED BRAND" : "AUTO GENERATED"} tone={mode === "BRANDED" ? "signal" : "confirm"} />{promotion ? <StatusPill label={promotion.discountPercent ? `SALE -${Number(promotion.discountPercent).toFixed(0)}%` : "PROMOTED"} tone="signal" /> : null}{product.salePrice != null && product.salePrice < product.price ? <StatusPill label="SALE" tone="signal" /> : null}</div>
                    </div>
                    <div className="grid gap-4 p-5">
                      <div><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">Product #{product.id} · {product.category}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{product.name}</h2>{product.salePrice != null && product.salePrice < product.price ? <><p className="money mt-2 text-2xl font-black text-[var(--signal)]">{money(product.salePrice)}</p><p className="money text-sm font-bold text-[var(--muted)] line-through">{money(product.price)}</p></> : <p className="money mt-2 text-2xl font-black text-[var(--signal)]">{money(product.salePrice ?? product.price)}</p>}{promotion ? <p className="mt-1 text-xs font-black text-[var(--signal)]">{promotion.discountPercent ? `${Number(promotion.discountPercent).toFixed(0)}% off` : "Promoted"} {promotion.startsAt ? `from ${date(promotion.startsAt)}` : ""} until {date(promotion.endsAt)}</p> : null}</div>
                      <div className="grid grid-cols-2 gap-3"><div className="rounded-[1rem] bg-[var(--surface)] p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Stock</p><p className="mt-1 text-xl font-black text-[var(--ink)]">{product.stockQuantity}</p></div><div className="rounded-[1rem] bg-[var(--surface)] p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Barcodes required</p><p className="mt-1 text-xl font-black text-[var(--ink)]">{configuration?.barcodesRequired ?? product.remainingBarcodeSlots ?? 0}</p></div></div>
                      {mode === "BRANDED" ? (
                        <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                          Stock is fulfilled by barcodes. <span className="font-black text-[var(--signal)]">Required: {barcodesRequired}</span> • Assigned: {barcodesAssigned} • Workers add barcodes at <span className="font-black text-[var(--ink)]">/dashboard/worker/products</span> to make stock sellable.
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={quantityDrafts[product.id] ?? String(product.stockQuantity)} onChange={(event) => setQuantityDrafts((current) => ({ ...current, [product.id]: event.target.value.replace(/\D/g, "") }))} inputMode="numeric" aria-label={`New stock quantity for ${product.name}`} className={fieldClass()} /><Button type="button" disabled={updating} onClick={() => void updateQuantity(product)}>{updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Boxes className="h-4 w-4" />} Update quantity</Button></div>
                      )}
                      <div className="grid gap-2"><input type="file" accept={acceptedImageTypes} onChange={(event) => selectExistingProductImage(product.id, event.target.files?.[0] ?? null)} className={fileInputClass()} /><Button type="button" variant="quiet" disabled={uploading || !imageFiles[product.id]} onClick={() => void saveImage(product.id)}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Update photo</Button></div>
                      <Button type="button" disabled={promoting || product.stockQuantity <= 0} onClick={() => openDiscountModal(product)} className="border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--gold)]">{promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />} {promotion ? "Update discount sale" : "Discount sale"}</Button>
                      <Button type="button" variant="quiet" onClick={() => setTransactionProduct(product)} className="border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)]"><Boxes className="h-4 w-4" /> View transactions per product</Button>
                      <Button type="button" variant="quiet" disabled={deleting} onClick={() => void removeProduct(product)} className="border-[var(--danger)]/35 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete product</Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={!!discountProduct} title={discountProduct ? `Discount sale — ${discountProduct.name}` : "Discount sale"} onClose={() => setDiscountProduct(null)}>
        <div className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--steel)]">Set a percent discount from the original price <span className="font-black text-[var(--ink)]">{discountProduct ? money(discountProduct.price) : ""}</span>. The sale is active from start to end, then automatically reverts to the original price.</p>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Discount percent (1–90)</span>
            <input type="number" min={1} max={90} value={discountPercentDraft} onChange={(event) => setDiscountPercentDraft(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 25" className={fieldClass()} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Starts at</span>
            <input type="datetime-local" value={discountStartsAt} onChange={(event) => setDiscountStartsAt(event.target.value)} className={fieldClass()} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Ends at</span>
            <input type="datetime-local" value={discountEndsAt} onChange={(event) => setDiscountEndsAt(event.target.value)} className={fieldClass()} />
          </label>
          {discountProduct && discountPercentDraft ? (
            <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--ink)]">
              Sale price: {money(Number(discountProduct.price) * (1 - Number(discountPercentDraft || "0") / 100))} <span className="ml-2 text-[var(--muted)] line-through">{money(discountProduct.price)}</span> <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-600">-{discountPercentDraft}%</span>
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button variant="quiet" onClick={() => setDiscountProduct(null)}>Cancel</Button>
            <Button onClick={() => void handleCreateDiscountSale()} disabled={discountSaving}>{discountSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />} Create sale</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!transactionProduct} title={transactionProduct ? `Transactions — ${transactionProduct.name}` : "Transactions"} onClose={() => setTransactionProduct(null)}>
        {transactionProduct ? (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Product #{transactionProduct.id} • {transactionProduct.category}</p>
              <p className="text-sm font-black">{transactionProduct.name} — {money(transactionProduct.price)} • Stock {transactionProduct.stockQuantity}</p>
              {(() => {
                const cfg = configByProduct.get(transactionProduct.id);
                const req = cfg?.barcodesRequired ?? transactionProduct.remainingBarcodeSlots ?? 0;
                const assigned = cfg?.barcodeCount ?? transactionProduct.barcodeCount ?? 0;
                return <p className="text-xs font-semibold text-[var(--steel)]">Barcodes — Required: <span className="font-black text-[var(--signal)]">{req}</span> • Assigned: <span className="font-black text-[var(--confirm)]">{assigned}</span> • Remaining: <span className="font-black">{Math.max(req, 0)}</span></p>;
              })()}
            </div>
            <div className="grid gap-2">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">View product by purchase type</p>
              <a href={`/dashboard/owner/transactions?productId=${transactionProduct.id}`} onClick={() => setTransactionProduct(null)} className="inline-flex min-h-11 items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold hover:border-[var(--signal)]">Cart purchases (user dashboard) <span className="text-xs text-[var(--muted)]">/dashboard/user/shop/cart</span></a>
              <a href={`/dashboard/worker/transactions?productId=${transactionProduct.id}`} onClick={() => setTransactionProduct(null)} className="inline-flex min-h-11 items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold hover:border-[var(--signal)]">Worker transactions (counter) <span className="text-xs text-[var(--muted)]">/dashboard/worker/transactions</span></a>
              <a href={`/dashboard/worker/orders?productId=${transactionProduct.id}`} onClick={() => setTransactionProduct(null)} className="inline-flex min-h-11 items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold hover:border-[var(--signal)]">Online purchases (user online) <span className="text-xs text-[var(--muted)]">/dashboard/worker/orders</span></a>
            </div>
            <p className="text-xs leading-5 text-[var(--steel)]">When a worker adds a barcode at <span className="font-black">/dashboard/worker/products</span> it becomes stock. Cart purchases and online purchases are tracked per product.</p>
            <div className="flex justify-end"><Button variant="quiet" onClick={() => setTransactionProduct(null)}>Close</Button></div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
