import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  CreateProductPayload,
  CreateTuckShopPurchasePayload,
  PageResponse,
  Product,
  ProductImageUpdatePayload,
  TuckShopPurchase,
} from "@/lib/types/backend";

function queryString(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function listTuckShopProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  return apiGet<PageResponse<Product>>(`/v1/tuck-shop/products${queryString(params)}`);
}

export function createTuckShopPurchase(payload: CreateTuckShopPurchasePayload) {
  return apiPost<TuckShopPurchase, CreateTuckShopPurchasePayload>("/v1/tuck-shop/purchases", payload);
}

export function createWorkerTuckShopBarcodePurchase(payload: CreateTuckShopPurchasePayload) {
  return apiPost<TuckShopPurchase, CreateTuckShopPurchasePayload>("/v1/tuck-shop/workers/barcode-purchases", payload);
}

export function listOwnerProducts(params: { page?: number; size?: number }) {
  return apiGet<PageResponse<Product>>(`/products${queryString(params)}`);
}

export function createOwnerProduct(payload: CreateProductPayload) {
  return apiPost<Product, CreateProductPayload>("/products", payload);
}

export function updateOwnerProductImage(productId: number, payload: ProductImageUpdatePayload) {
  return apiPatch<Product, ProductImageUpdatePayload>(`/products/${productId}/image`, payload);
}
