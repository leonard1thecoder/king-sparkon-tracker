import { backendBaseUrl } from "@/lib/backend-auth";
export { buildSlug, idFromSlug, slugify } from "@/lib/public/slug";
export { demoEvents, demoJobs, demoProducts, getDemoEventById, getDemoJobById, getDemoProductById, isDemoId, isDemoJobId, isDemoProductId } from "@/lib/public/demo";
import { demoEvents, demoJobs, demoProducts, getDemoEventById } from "@/lib/public/demo";
import type { TicketEvent } from "@/types/tickets";
import type { PageResponse, Product } from "@/lib/types/backend";

/*
 * Server-side reads for public pages.
 *
 * The browser API client goes through /api/backend, which requires an auth
 * cookie. Public pages must not depend on that, so they call the backend
 * directly from the server.
 *
 * When the backend returns no published items, clearly-marked sample data
 * is shown instead so visitors can explore the layout. Pages render a
 * "Sample data" badge in that case (see isDemoId in demo.ts).
 */

const REVALIDATE_SECONDS = 300;

async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const url = new URL(`/api${path}`, backendBaseUrl());
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapList<T>(payload: PageResponse<T> | T[] | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.content) ? payload.content : [];
}

export async function getPublishedEvents(): Promise<TicketEvent[]> {
  const payload = await publicGet<PageResponse<TicketEvent> | TicketEvent[]>("/v1/tickets/events");
  const live = unwrapList(payload).filter((event) => event.status === "PUBLISHED");
  return live.length > 0 ? live : demoEvents();
}

export async function getPublishedEventById(id: string): Promise<TicketEvent | null> {
  const event = await publicGet<TicketEvent>(`/v1/tickets/events/${encodeURIComponent(id)}`);
  if (event && event.status === "PUBLISHED") return event;
  return getDemoEventById(id);
}

export async function getPublicProducts(size = 24): Promise<Product[]> {
  const payload = await publicGet<PageResponse<Product> | Product[]>(`/v1/tuck-shop/products?page=0&size=${size}`);
  const live = unwrapList(payload);
  return live.length > 0 ? live : demoProducts().slice(0, size);
}

export async function getPublicProductById(id: number): Promise<Product | null> {
  const products = await getPublicProducts(100);
  return products.find((product) => product.id === id) ?? null;
}

export type PublicJob = {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  status: string;
};

export async function getPublicJobs(size = 12): Promise<PublicJob[]> {
  const payload = await publicGet<PageResponse<PublicJob> | PublicJob[]>(`/opportunities/jobs?page=0&size=${size}`);
  const live = unwrapList(payload).filter((job) => job.status === "OPEN");
  return live.length > 0 ? live.slice(0, size) : demoJobs().slice(0, size);
}
