import { apiGet, apiPatch, apiPost, apiPostIdempotent } from "./api-client";
import type {
  PageResponse,
  Product,
  TicketEvent,
  Tip,
  TipPayload,
  TrackerUser,
  TransactionPayload,
  TuckShopPurchase,
  UserTicket,
} from "./types";

// Auth — direct backend endpoints (web proxies these via /api/auth/*).
export function loginRequest(values: { usernameOrEmail: string; password: string }) {
  return apiPost<{ accessToken?: string; refreshToken?: string; user?: TrackerUser }>(
    "/auth/login",
    values,
  );
}

export function registerOwnerRequest(values: Record<string, string>) {
  return apiPost("/auth/register", values);
}

export function registerAffiliateRequest(values: Record<string, string>) {
  return apiPost("/auth/register-affiliate", values);
}

export function getMe() {
  return apiGet<TrackerUser>("/users/me");
}

// User dashboard — tuck shop.
export function listTuckShopProducts(params: { page?: number; size?: number; search?: string } = {}) {
  return apiGet<PageResponse<Product> | Product[]>("/v1/tuck-shop/products", {
    page: params.page,
    size: params.size,
    search: params.search ?? undefined,
  });
}

export function createTuckShopPurchase(payload: {
  paymentEmail?: string;
  paymentContact?: string;
  items: { productId: number; quantity: number }[];
}) {
  return apiPostIdempotent<TuckShopPurchase, typeof payload>("/v1/tuck-shop/purchases", payload);
}

export function listMyPurchases() {
  return apiGet<TuckShopPurchase[]>("/v1/tuck-shop/my-purchases");
}

// User dashboard — tickets.
export function listTicketEvents() {
  return apiGet<TicketEvent[]>("/v1/tickets/events");
}

export function listMyTickets() {
  return apiGet<UserTicket[]>("/v1/tickets/my-tickets/current");
}

// User dashboard — tips.
export function createTip(payload: TipPayload) {
  return apiPostIdempotent<Tip, TipPayload>("/tips", payload);
}

// Worker dashboard — counter checkout + orders + barcodes.
export function workerCheckout(payload: TransactionPayload) {
  return apiPost("/transactions", payload);
}

export function workerBarcodeCheckout(payload: {
  paymentType: "CASH" | "SWIPE_MACHINE";
  items: { productId: number; quantity: number }[];
}) {
  return apiPostIdempotent("/v1/tuck-shop/workers/automatic-purchases", payload);
}

export function listWorkerOnlinePurchases() {
  return apiGet<TuckShopPurchase[]>("/v1/tuck-shop/workers/online-purchases");
}

export function lookupProductByBarcode(barcode: string) {
  return apiGet<Product>(`/products/barcode/${encodeURIComponent(barcode.trim())}`);
}

export function lookupReference(reference: string) {
  return apiGet(`/barcodes/reference/${encodeURIComponent(reference.trim())}`);
}

export function claimBarcode(barcodeId: number) {
  return apiPost(`/barcodes/${barcodeId}/claim`, {});
}

export function assignOnlinePurchaseBarcode(transactionId: number, productId: number, barcode: string) {
  return apiPost(`/v1/tuck-shop/workers/online-purchases/${transactionId}/products/${productId}/barcodes`, {
    barcode: barcode.trim(),
  });
}

export function listTransactions() {
  return apiGet("/transactions");
}

export function markTipPaid(tipId: number) {
  return apiPatch(`/tips/${tipId}/status`, { status: "PAID" });
}
