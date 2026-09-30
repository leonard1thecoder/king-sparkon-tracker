import { apiGet, apiPostIdempotent } from "@/lib/api/client";
import { createIdempotencyKey } from "@/lib/api/contracts";
import type {
  CreateTuckShopPurchasePayload,
  PageResponse,
  Product,
  TuckShopPurchase,
  WorkerDashboardStats,
} from "@/lib/types/backend";
import type { TicketEvent, UserTicket } from "@/types/tickets";

export function getWorkerDashboard() {
  return apiGet<WorkerDashboardStats>("/worker/dashboard");
}

export function listWorkerMallProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return apiGet<PageResponse<Product>>(`/worker/mall/products${query ? `?${query}` : ""}`);
}

export function getWorkerMallProduct(productId: number) {
  return apiGet<Product>(`/worker/mall/products/${productId}`);
}

export function createWorkerStaffPurchase(
  payload: CreateTuckShopPurchasePayload,
  idempotencyKey = createIdempotencyKey("worker-mall-staff-purchase"),
) {
  return apiPostIdempotent<TuckShopPurchase, CreateTuckShopPurchasePayload>(
    "/worker/mall/staff-purchases",
    payload,
    idempotencyKey,
  );
}

export function listWorkerMallPurchases() {
  return apiGet<TuckShopPurchase[]>("/worker/mall/my-purchases");
}

export function listWorkerTicketEvents() {
  return apiGet<TicketEvent[]>("/worker/tickets/events");
}

export function getWorkerTicketEvent(eventId: string) {
  return apiGet<TicketEvent>(`/worker/tickets/events/${encodeURIComponent(eventId)}`);
}

export function listWorkerMyTickets() {
  return apiGet<UserTicket[]>("/worker/tickets/my-tickets");
}
