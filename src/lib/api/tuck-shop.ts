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

export type WorkerCheckoutPaymentType = "CASH" | "CARD" | "KING_SPARKON";

export type WorkerTuckShopCheckoutPayload = CreateTuckShopPurchasePayload & {
  paymentType: "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT";
  customerUsername?: string | null;
};

export type TuckShopFulfilmentStatus =
  | "NOT_REQUIRED"
  | "AWAITING_BARCODE_ASSIGNMENT"
  | "READY_FOR_COLLECTION"
  | "COLLECTED";

export type OnlineTuckShopPurchase = TuckShopPurchase & {
  customerId?: number | null;
  customerUsername?: string | null;
  fulfilmentStatus?: TuckShopFulfilmentStatus | string | null;
  barcodesRequired?: number;
  collectionQrCodeValue?: string | null;
  collectionQrCodeUrl?: string | null;
  collectionReadyAt?: string | null;
  collectedAt?: string | null;
  preparedByWorkerId?: number | null;
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

export function createWorkerTuckShopBarcodePurchase(payload: WorkerTuckShopCheckoutPayload) {
  return apiPost<TuckShopPurchase, WorkerTuckShopCheckoutPayload>("/v1/tuck-shop/workers/barcode-purchases", payload);
}

export function getWorkerProductByBarcode(barcode: string) {
  return apiGet<Product>(`/products/barcode/${encodeURIComponent(barcode.trim())}`);
}

export function listWorkerOnlinePurchases() {
  return apiGet<OnlineTuckShopPurchase[]>("/v1/tuck-shop/workers/online-purchases");
}

export function assignOnlinePurchaseBarcode(transactionId: number, productId: number, barcode: string) {
  return apiPost<OnlineTuckShopPurchase, { barcode: string }>(
    `/v1/tuck-shop/workers/online-purchases/${transactionId}/products/${productId}/barcodes`,
    { barcode: barcode.trim() },
  );
}

export function listMyTuckShopPurchases() {
  return apiGet<OnlineTuckShopPurchase[]>("/v1/tuck-shop/my-purchases");
}

export function verifyTuckShopCollection(qrValue: string) {
  return apiPost<OnlineTuckShopPurchase, { qrValue: string }>(
    "/v1/tuck-shop/my-purchases/collect",
    { qrValue: qrValue.trim() },
  );
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
