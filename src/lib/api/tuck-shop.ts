import {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostIdempotent,
  apiPut,
  normalizeApiError,
} from "@/lib/api/client";
import { apiContract, createIdempotencyKey } from "@/lib/api/contracts";
import { getLiveEventById } from "@/lib/api/tickets";
import { removeTuckShopCartLine } from "@/lib/tuck-shop/cart";
import type {
  CreateEmbeddedCartPaymentPayload,
  CreateProductPayload,
  CreateTuckShopPurchasePayload,
  EmbeddedCartTicketItem,
  PageResponse,
  PayFastCartPayment,
  PayFastCartPaymentStatus,
  PayFastFormResponse,
  Product,
  ProductImageUpdatePayload,
  TuckShopPurchase,
} from "@/lib/types/backend";
import type { TicketType } from "@/types/tickets";

export type AddProductBarcodePayload = {
  unitCode?: string | null;
  barcode?: string | null;
  referenceEmail?: string | null;
};

export type ProductBarcodeMode = "BRANDED" | "AUTO_GENERATED";

export type ProductBarcodeConfiguration = {
  productId: number;
  productName: string;
  barcodeMode: ProductBarcodeMode;
  manufacturerBarcode?: string | null;
  stockQuantity: number;
  barcodeCount: number;
  barcodesRequired: number;
};

export type WorkerCheckoutPaymentType = "CASH" | "CARD";

export type WorkerTuckShopCheckoutPayload = CreateTuckShopPurchasePayload & {
  paymentType: "CASH" | "SWIPE_MACHINE";
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

const supportedTicketTypes = new Set<TicketType>(["REGULAR", "VIP", "VVIP"]);

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

function removeUnavailableTicketFromStoredCart(item: EmbeddedCartTicketItem) {
  if (!supportedTicketTypes.has(item.ticketType as TicketType)) return;
  removeTuckShopCartLine("TICKET", item.eventId, item.ticketType as TicketType);
}

async function validateLiveTicketItems(items: EmbeddedCartTicketItem[]) {
  const normalizedItems = items.map((item) => ({
    ...item,
    eventId: item.eventId.trim(),
  }));
  const unavailableItems: EmbeddedCartTicketItem[] = [];

  for (let index = 0; index < normalizedItems.length; index += 1) {
    const item = normalizedItems[index];
    const originalItem = items[index];

    try {
      const event = await getLiveEventById(item.eventId);
      const ticketType = event?.ticketTypes.find((candidate) => candidate.type === item.ticketType);

      if (!event || !ticketType) {
        unavailableItems.push(originalItem);
        continue;
      }
      if (event.status !== "PUBLISHED") {
        throw new Error(`${event.name} is no longer published for ticket sales.`);
      }
      if (item.quantity > ticketType.available) {
        throw new Error(
          `${event.name} only has ${ticketType.available} ${item.ticketType} ticket${ticketType.available === 1 ? "" : "s"} available. Update the cart quantity and try again.`,
        );
      }
    } catch (exception) {
      const error = normalizeApiError(exception);
      const missingEvent = error.status === 404 || error.message.toLowerCase().includes("not found");
      if (missingEvent) {
        unavailableItems.push(originalItem);
        continue;
      }
      throw error;
    }
  }

  if (unavailableItems.length > 0) {
    unavailableItems.forEach(removeUnavailableTicketFromStoredCart);
    throw new Error(
      unavailableItems.length === 1
        ? "A ticket event saved in your cart no longer exists and was removed. Add the ticket again from Buy Tickets before checkout."
        : `${unavailableItems.length} ticket events saved in your cart no longer exist and were removed. Add the tickets again from Buy Tickets before checkout.`,
    );
  }

  return normalizedItems;
}

export async function listTuckShopProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  return apiGet<PageResponse<Product>>(`${apiContract.tuckShop.products}${queryString(params)}`);
}

export async function createTuckShopPurchase(
  payload: CreateTuckShopPurchasePayload,
  idempotencyKey = createIdempotencyKey("tuck-shop-purchase"),
) {
  return apiPostIdempotent<TuckShopPurchase, CreateTuckShopPurchasePayload>(
    apiContract.tuckShop.purchases,
    payload,
    idempotencyKey,
  );
}

export async function createPayFastCartPayment(payload: CreateEmbeddedCartPaymentPayload) {
  const tickets = await validateLiveTicketItems(payload.tickets ?? []);
  return apiPostIdempotent<PayFastCartPayment, CreateEmbeddedCartPaymentPayload>(
    apiContract.tuckShop.payfastPayments,
    { ...payload, tickets },
    payload.idempotencyKey,
  );
}

export function getPayFastCartPaymentStatus(merchantPaymentId: string) {
  return apiGet<PayFastCartPaymentStatus>(apiContract.tuckShop.payfastPaymentStatus(merchantPaymentId));
}

export function getPayFastFormFields(merchantPaymentId: string) {
  return apiGet<PayFastFormResponse>(apiContract.tuckShop.payfastPaymentForm(merchantPaymentId));
}

export function createWorkerTuckShopBarcodePurchase(
  payload: WorkerTuckShopCheckoutPayload,
  idempotencyKey = createIdempotencyKey("worker-checkout"),
) {
  return apiPostIdempotent<TuckShopPurchase, WorkerTuckShopCheckoutPayload>(
    "/v1/tuck-shop/workers/automatic-purchases",
    payload,
    idempotencyKey,
  );
}

export function getWorkerProductByBarcode(barcode: string) {
  return apiGet<Product>(`/products/barcode/${encodeURIComponent(barcode.trim())}`);
}

export function getWorkerProductById(productId: number) {
  return apiGet<Product>(`/products/${productId}`);
}

export function listProductBarcodeConfigurations() {
  return apiGet<ProductBarcodeConfiguration[]>("/products/barcode-automation");
}

export function configureProductBarcodeMode(
  productId: number,
  payload: { barcodeMode: ProductBarcodeMode; manufacturerBarcode?: string | null },
) {
  return apiPut<ProductBarcodeConfiguration, typeof payload>(`/products/barcode-automation/${productId}`, payload);
}

export function fillAutomaticProductBarcodes(productId: number) {
  return apiPost<ProductBarcodeConfiguration, Record<string, never>>(
    `/products/barcode-automation/${productId}/fill-stock`,
    {},
  );
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

export function prepareAutomaticOnlinePurchaseBarcodes(transactionId: number, productId: number) {
  return apiPost<OnlineTuckShopPurchase, Record<string, never>>(
    `/v1/tuck-shop/workers/online-purchases/${transactionId}/products/${productId}/auto-barcodes`,
    {},
  );
}

export function listCompletedWorkerPurchases() {
  return apiGet<OnlineTuckShopPurchase[]>("/v1/tuck-shop/workers/completed-purchases");
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
  return apiGet<PageResponse<Product>>(`/products${queryString(params)}`);
}

export function createOwnerProduct(payload: CreateProductPayload & { productBarcode?: string | null }) {
  return apiPost<Product, CreateProductPayload & { productBarcode?: string | null }>("/products", payload);
}

export function addProductBarcode(productId: number, payload: AddProductBarcodePayload) {
  return apiPost<Product, AddProductBarcodePayload>(`/products/${productId}/barcodes`, payload);
}

export function updateOwnerProductQuantity(productId: number, stockQuantity: number) {
  return apiPatch<Product, { stockQuantity: number }>(`/products/${productId}/quantity`, { stockQuantity });
}

export function deleteOwnerProduct(productId: number) {
  return apiDelete<void>(`/products/${productId}`);
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
