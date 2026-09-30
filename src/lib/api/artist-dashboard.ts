import { apiGet, apiPostIdempotent } from "@/lib/api/client";
import { createIdempotencyKey } from "@/lib/api/contracts";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import { getLiveMyTickets, getLiveUpcomingEvents } from "@/lib/api/tickets";
import type {
  ArtistDashboardStats,
  CreateTuckShopPurchasePayload,
  PageResponse,
  Product,
  TuckShopPurchase,
} from "@/lib/types/backend";
import type { TicketEvent, UserTicket } from "@/types/tickets";

export function getArtistDashboard() {
  return apiGet<ArtistDashboardStats>("/artist/dashboard");
}

export function listArtistMallProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  return apiGet<PageResponse<Product>>(
    `/artist/mall/products${toQuery(params)}`,
  );
}

export function getArtistMallProduct(productId: number) {
  return apiGet<Product>(`/artist/mall/products/${productId}`);
}

export function createArtistMallPurchase(
  payload: CreateTuckShopPurchasePayload,
  idempotencyKey = createIdempotencyKey("artist-mall-purchase"),
) {
  return apiPostIdempotent<TuckShopPurchase, CreateTuckShopPurchasePayload>(
    "/artist/mall/purchases",
    payload,
    idempotencyKey,
  );
}

export function listArtistMallPurchases() {
  return apiGet<TuckShopPurchase[]>("/artist/mall/my-purchases");
}

export function listArtistTicketEvents() {
  return apiGet<TicketEvent[]>("/artist/tickets/events");
}

export function getArtistTicketEvent(eventId: string) {
  return apiGet<TicketEvent>(`/artist/tickets/events/${encodeURIComponent(eventId)}`);
}

export function listArtistMyTickets() {
  return apiGet<UserTicket[]>("/artist/tickets/my-tickets");
}

// Fallbacks to the generic mall/ticket endpoints so the artist dashboard
// keeps working even if the dedicated artist routes are unavailable.
export async function listArtistMallProductsFallback(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
}) {
  try {
    return await listArtistMallProducts(params);
  } catch {
    return listTuckShopProducts(params);
  }
}

export async function listArtistTicketEventsFallback(): Promise<TicketEvent[]> {
  try {
    return await listArtistTicketEvents();
  } catch {
    return getLiveUpcomingEvents();
  }
}

export async function listArtistMyTicketsFallback(): Promise<UserTicket[]> {
  try {
    return await listArtistMyTickets();
  } catch {
    return getLiveMyTickets();
  }
}

function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
