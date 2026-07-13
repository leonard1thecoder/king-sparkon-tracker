import { apiClient, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { createApplicationMockPurchase, getApplicationMockProducts } from "@/lib/mock/application-products";
import type {
  CreateEmbeddedCartPaymentPayload,
  CreateProductPayload,
  CreateTuckShopPurchasePayload,
  EmbeddedCartPaymentIntent,
  EmbeddedCartPaymentStatus,
  PageResponse,
  Product,
  ProductImageUpdatePayload,
  TuckShopPurchase,
} from "@/lib/types/backend";

export type AddProductBarcodePayload = {
  unitCode?: string | null;
  barcode?: string | null;
  referenceEmail?: string | null;
};

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

function withMockFallback(
  response: PageResponse<Product>,
  params: {
    page?: number;
    size?: number;
    businessId?: number | null;
    category?: string | null;
    search?: string | null;
  },
) {
  return response.content?.length ? response : getApplicationMockProducts(params);
}

export async function listTuckShopProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  try {
    const response = await apiGet<PageResponse<Product>>(`/v1/tuck-shop/products${queryString(params)}`);
    return withMockFallback(response, params);
  } catch {
    return getApplicationMockProducts(params);
  }
}

export async function createTuckShopPurchase(payload: CreateTuckShopPurchasePayload) {
  try {
    return await apiPost<TuckShopPurchase, CreateTuckShopPurchasePayload>("/v1/tuck-shop/purchases", payload);
  } catch {
    return createApplicationMockPurchase(payload);
  }
}

export function createEmbeddedCartPaymentIntent(payload: CreateEmbeddedCartPaymentPayload) {
  return apiPost<EmbeddedCartPaymentIntent, CreateEmbeddedCartPaymentPayload>(
    "/v1/tuck-shop/cart-payments/payment-intents",
    payload,
  );
}

export function getEmbeddedCartPaymentStatus(paymentIntentId: string) {
  return apiGet<EmbeddedCartPaymentStatus>(
    `/v1/tuck-shop/cart-payments/payment-intents/${encodeURIComponent(paymentIntentId)}`,
  );
}

export async function createWorkerTuckShopBarcodePurchase(payload: CreateTuckShopPurchasePayload) {
  try {
    return await apiPost<TuckShopPurchase, CreateTuckShopPurchasePayload>("/v1/tuck-shop/workers/barcode-purchases", payload);
  } catch {
    return createApplicationMockPurchase(payload);
  }
}

export async function listOwnerProducts(params: { page?: number; size?: number }) {
  try {
    const response = await apiGet<PageResponse<Product>>(`/products${queryString(params)}`);
    return withMockFallback(response, params);
  } catch {
    return getApplicationMockProducts(params);
  }
}

export function createOwnerProduct(payload: CreateProductPayload) {
  return apiPost<Product, CreateProductPayload>("/products", payload);
}

export function addProductBarcode(productId: number, payload: AddProductBarcodePayload) {
  return apiPost<Product, AddProductBarcodePayload>(`/products/${productId}/barcodes`, payload);
}

export function updateOwnerProductImage(productId: number, payload: ProductImageUpdatePayload) {
  return apiPatch<Product, ProductImageUpdatePayload>(`/products/${productId}/image`, payload);
}

export async function uploadProductImage(productId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.patch<Product>(`/products/${productId}/image-file`, formData);
  return response.data;
}
